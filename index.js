const mongoose = require('mongoose');

const RECONNECT_DELAY = 1000;
let reconnectMultiplier = 1;
let latestMongoError = {};

// todo: create class for subscriptions which can be referenced from
// redis and is linked to the hostname of the subscription creator
// for viewing subscriptions and their hosts

// example subscription
// const subscriptions = [
// 	{
// 		name: 'IdentifierCreation',
// 		model: 'identifiers',
// 		// define set of operations that can be used
// 		operation: 'change',
// 		handler: identifierCreation,
// 		filters: [
// 			// todo: add support for more filter types
// 			// supports pipeline out of the box
// 			// need basic mongo query syntax filtering
// 		],
// 		options: {
// 			// defines options to be passed to the resulting
// 			// change stream. mongodb documentation provides
// 			// details: http://mongodb.github.io/node-mongodb-native/3.3/api/Collection.html#watch
// 			// fullDocument: 'default',
// 		}
// 	}
// ];

// class for event framework
// constructor
// 		subscriptions array
// 		service name

// If you're not familiar with async/await, check out this article:
// http://bit.ly/node-async-await
// run().catch(error => console.error(error));

mongoose.connection.on('disconnected', () => {
	console.log(new Date(), 'disconnected from mongodb');
	reconnect();
});

mongoose.connection.on('connected', () => {
	console.log(new Date(), 'connected to mongodb');
	createSubscriptions(/* subscriptions array goes here */);
});

async function start() {
	// Make sure you're using mongoose >= 5.0.0
	console.log(new Date(), `mongoose version: ${mongoose.version}`);

	// todo: set this up to be used for testing
	// and have a variant for production
	// await setupReplicaSet();

	// if imported as a module we need to handle using the
	// singleton connection object exposed by mongoose
	if (mongoose.connection.readyState === 1) {
		return initialize();
	}

	await connect();
}

function reconnect() {
	setTimeout(() => {
		if(mongoose.connection.readyState === 1) {
			console.log(new Date(), 'already connected to mongodb. skipping connection attempt');
			return;
		}

		console.log(new Date(), 'reconnecting to mongodb');
		start().catch(err => {
			latestMongoError = err;
			reconnectMultiplier = 1;
			console.error(new Date(), err);

			// delay connect time so we aren't hammering the db with connections
			if (latestMongoError.name === 'MongoError' && latestMongoError.message.includes('no primary found')) {
				reconnectMultiplier = 4;
			}
		});
	}, RECONNECT_DELAY * reconnectMultiplier);
}

async function connect() {
	console.log(new Date(), 'connecting to mongodb');
	const uri = 'mongodb://localhost:27017/' + 'fundamentals?replicaSet=rs';
	await mongoose.connect(uri);
}

function initialize() {
	console.log(new Date(), 'connected to mongodb');
	createSubscriptions(/* subscriptions array goes here */);
}

async function createSubscriptions(subscriptions = []) {
	let collections = await mongoose.connection.db.listCollections().toArray();
	collections = collections.map(c => c.name);

	console.log(new Date(), 'found collections', collections.join(', '));

	for (let name of collections) {
		// get service-defined subscriptions
		const collectionSubscriptions = subscriptions.filter(s => s.model === name);
		if (!collectionSubscriptions.length) {
			console.log(new Date(), 'no subscriptions for collection', name);
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

		// create a change stream for each subscription
		for (let { filters, handler, operation, options } of collectionSubscriptions) {
			// create change stream
			Collection.watch(filters, options).on(operation, handler);
		}
	}
}

async function setupReplicaSet() {
	const bind_ip = 'localhost';
	// Starts a 3-node replica set on ports 31000, 31001, 31002, replica set
	// name is "rs0".
	const replSet = new ReplSet('mongod', [
		{ options: { port: 31000, dbpath: `${__dirname}/data/db/31000`, bind_ip } },
		{ options: { port: 31001, dbpath: `${__dirname}/data/db/31001`, bind_ip } },
		{ options: { port: 31002, dbpath: `${__dirname}/data/db/31002`, bind_ip } }
	], { replSet: 'rs0' });

	// Initialize the replica set
	await replSet.purge();
	await replSet.start();
	console.log(new Date(), 'Replica set started...');
}

// create all changestreams only after mongoose has connected to something
start().catch(err => console.error(err));