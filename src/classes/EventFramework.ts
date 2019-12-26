import * as mongoose from 'mongoose';
import { Queue } from 'bull';

const Bull = require('bull');
const pluralize = require('pluralize');

import { logger } from '@postilion/utils';
import { default as Subscription } from '../interfaces/ISubscription';

export default class EventFramework {
	url: string;
	subscriptions: Array<Subscription>;
	queues: Array<Queue> = [];

	readonly RECONNECT_DELAY: number = 1000;
	private reconnectMultiplier: number = 1;
	private latestMongoError: Error;

	constructor(url: string, subscriptions: Array<Subscription>) {
		this.url = url;
		this.subscriptions = subscriptions;

		mongoose.connection.on('disconnected', () => {
			logger.info(new Date(), 'disconnected from mongodb');
			this.reconnect();
		});

		mongoose.connection.on('connected', () => {
			logger.info(new Date(), 'connected to mongodb');
			this.createSubscriptions(subscriptions);
		});

		this.start();
	}

	private async initialize() {
		logger.info(new Date(), 'connected to mongodb');
		await this.createSubscriptions(this.subscriptions);
	}

	async start() {
		// Make sure you're using mongoose >= 5.0.0
		logger.info(new Date(), `mongoose version: ${mongoose.version}`);

		// todo: set this up to be used for testing
		// and have a variant for production
		// await setupReplicaSet();

		// if imported as a module we need to handle using the
		// singleton connection object exposed by mongoose
		if (mongoose.connection.readyState === 1) {
			return this.initialize();
		}

		await this.connect();
	}

	private async connect() {
		logger.info(new Date(), 'connecting to mongodb');
		await mongoose.connect(this.url).catch(console.error);
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

	private async createSubscriptions(subscriptions: Array<Subscription> = []) {
		// todo: handle named operation type
		let namedSubscriptions: Array<Subscription> = subscriptions.filter(s => s.operation === 'named');
		let collectionSubscriptions: Array<Subscription> = subscriptions.filter(s => s.operation !== 'named');

		// create a mongodb change stream for each subscription
		await this.createChangeStreams(collectionSubscriptions)
		await this.createNamedQueues(namedSubscriptions);
	}

	private async createNamedQueues(subscriptions: Array<Subscription>) {
		// todo: create bull queues with the name and handler provided in the subscription
		// todo: provide more context to named queues with primary model of focus
		for (let subscription of subscriptions) {
			const namedQueue = new Bull(subscription.name);
			logger.info(`created new named queue ${subscription.name} for operation ${subscription.operation} on model ${subscription.model.modelName}`);
			
			namedQueue.process(
				async function (job: any) {
					logger.info(`received job from ${subscription.name} with id ${job.id}`);
					subscription.handler(job);
				}
			);

			namedQueue.on('completed', (job, result) => logger.info)

			this.queues.push(namedQueue);
		}
	}

	private async createChangeStreams(subscriptions: Array<Subscription>) {
		let collections = await mongoose.connection.db.listCollections().toArray();
		collections = collections.map(c => c.name);
	
		for (let name of collections) {
			// get service-defined subscriptions
			const collectionSubscriptions = subscriptions.filter(s => String(pluralize(s.model.modelName)).toLowerCase() === name);
			if (!collectionSubscriptions.length) {
				logger.info(`no subscriptions for collection ${name}`);
				continue;
			}
	
			// get instance of collection for creating change streams
			const Collection = await mongoose.connection.db.collection(name);
	
			// todo: enable further filtering by operationType
			// create a job object
			// insert in jobs collection
			// listen on jobs collection changes
			// filter from there into the service
	
			// todo: group subscriptions by filter type
			// pipelines have their own unique change streams
			// regular mongo queries are either converted to pipelines
			// 		or use the same change stream for receiving events
	
			// todo: remove duplicated change streams by comparing filters
			// and simply add another handler for an existing change stream
	
			// todo: push all changes from every model into an event stream data model
	
			// create a change stream for each subscription
			for (let { name, filters, handler, operation, options, model } of collectionSubscriptions) {
				// create change stream
				logger.info(`created new change stream ${name} for operation ${operation} on model ${model.modelName}`);
				Collection.watch(filters, options).on(operation, handler);
			}
		}
	}
}