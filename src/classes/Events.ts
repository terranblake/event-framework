import * as mongoose from 'mongoose';

const Bull = require('bull');
const pluralize = require('pluralize');

import { logger } from '@postilion/utils';
import { default as Subscription } from '../interfaces/ISubscription';
import { default as Operation } from '../enums/IOperation';
import { default as EventsOptions } from '../interfaces/IEventsOptions';

import Job from './Job';

export default class Events {
	url: string = String();
	subscriptions: Array<Subscription> = [];
	options: EventsOptions = {
		redis: String(process.env.MONGODB || 'mongodb://localhost:27017/db'),
		mongodb: String(process.env.REDIS) || 'redis://localhost:6379'
	};

	readonly RECONNECT_DELAY: number = 1000;
	readonly DEFAULT_QUEUE_OPTIONS: object = {
		filters: [],
		options: {}
	}
	readonly MANDATORY_STREAM_OPTIONS: object = {
		fullDocument: 'updateLookup'
	};

	private reconnectMultiplier: number = 1;
	private latestMongoError: Error;

	constructor(subscriptions: Array<Subscription>, options: EventsOptions) {
		this.subscriptions = subscriptions;

		// if the caller only defines 1 of the fields, then
		// we want to use the default for the remaining fields
		this.options = { ...options, ...this.options};

		mongoose.connection.on('disconnected', () => {
			logger.info(new Date(), 'disconnected from mongodb');
			this.reconnect();
		});

		mongoose.connection.on('connected', () => {
			logger.info(new Date(), 'connected to mongodb');
			this.createSubscriptions();
		});

		this.start();
	}

	async start() {
		if (mongoose.connection.readyState === 1) {
			logger.info(new Date(), 'already connected to mongodb');
			return;
		}

		await this.connect();
	}

	// deprecating manual mongodb connections because this
	// should be managed by the stores module. all modules
	// which use any of the stores should gracefully handle
	// a disconnected state without crashing anything
	private async connect() {
		logger.info(new Date(), 'connecting to mongodb');
		await mongoose.connect(this.options.mongodb).catch(console.error);
	}

	reconnect() {
		setTimeout(() => {
			if (mongoose.connection.readyState === 1) {
				logger.info(new Date(), 'already connected to mongodb. skipping connection attempt');
				return;
			}

			logger.info(new Date(), 'reconnecting to mongodb');
			this.start().catch((err: Error) => {
				this.latestMongoError = err;
				this.reconnectMultiplier = 1;
				console.error(new Date(), err);

				// delay connect time so we aren't hammering the db with connections
				if (this.latestMongoError.name === 'MongoError' && this.latestMongoError.message.includes('no primary found')) {
					this.reconnectMultiplier = 4;
				}
			});
		}, this.RECONNECT_DELAY * this.reconnectMultiplier);
	}

	static convertFiltersToPipeline(filters: Array<any>): Array<any> {
		if (!filters.length) {
			return [];
		}

		for (let i in filters) {
			const stage = filters[i];
			const expressions = Object.keys(stage);

			// only get the first expression
			// because i haven't used a filters
			// with more than 1 expression
			const expression = stage[expressions[0]];

			// todo: add support for more complex
			// filters that have nested expressions
			for (let field of Object.keys(expression)) {
				// todo: remove this because it could cause bugs in the future
				// if models have a field called operation. this would break
				// all event listeners who try to filter using this
				if (['fullDocument'].includes(field)) {
					continue;
				}

				const value = filters[i][expressions[0]][field];
				delete filters[i][expressions[0]][field];

				filters[i][expressions[0]][`fullDocument.${field}`] = value;
			}
		}

		return filters
	}

	private async createSubscriptions() {
		for (let subscription of this.subscriptions) {
			await this.subscribe(subscription);
		}
	}

	private async subscribe(subscription: Subscription) {
		// handle what to do when we haven't connected to mongodb yet
		if (mongoose.connection.readyState !== 1) {
			return this.reconnect();
		}

		// named queues are backed by Bull queues
		if (subscription.operation === Operation.named) {
			await this.createNamedQueue(subscription);
		// and every other queue is a thin layer over mongodb change streams
		// todo: pass all change events to a collection 
		} else {
			await this.createChangeStream(subscription);
		}
	}

	private async createNamedQueue(subscription: Subscription) {
		const { name, operation, model, handler, options } = subscription;

		const namedQueue = new Bull(name, options.redis || this.options.redis);
		logger.info(`created new named queue ${name} for operation ${operation} on model ${model.modelName}`);

		namedQueue.process('*',
			async function (job: any) {
				const jobData = JSON.parse(JSON.stringify(job.data));
				const formattedJob = new Job(name, model, operation, jobData);

				logger.info(`received job for ${name} from named queue`);
				handler(formattedJob);
			}
		);

		// todo: add completed and failed handling listeners
	}

	private async createChangeStream(subscription: Subscription) {
		let { name, filters, handler, operation, options, model } = subscription;

		const pluralName = String(pluralize(model.modelName)).toLowerCase();
		const Collection = await mongoose.connection.db.collection(pluralName);

		// make sure that we are always including the
		// fullDocument option for consistency
		// and have default filters and options
		const streamOptions: object = {
			...this.DEFAULT_QUEUE_OPTIONS,
			...options,
			...this.MANDATORY_STREAM_OPTIONS,
		};

		// reformat raw filters to use the format `fullDocument.FIELD`
		// since mongodb isn't smart enough to figure out how to do that?
		filters = Events.convertFiltersToPipeline(filters);

		// add the operation type filtering to the beginning of the pipeline
		// since it has the lowest computational complexity
		filters.unshift({
			$match: {
				operationType: operation
			}
		});

		// create change stream
		logger.info(`created new change stream ${name} with filters ${JSON.stringify(filters)}`);
		Collection.watch(filters, streamOptions).on('change',
			async function (job: any) {
				if (!job.fullDocument) {
					throw new Error(`change stream job was missing reference to fullDocument. failing immediately`);
				}

				const jobData = JSON.parse(JSON.stringify(job.fullDocument));
				const formattedJob = new Job(name, model, operation, jobData);

				logger.info(`received job for ${name} from change stream`);
				handler(formattedJob);
			}
		);
	}
}