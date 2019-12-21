const mongoose = require('mongoose');

// If you're not familiar with async/await, check out this article:
// http://bit.ly/node-async-await
// run().catch(error => console.error(error));

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

async function run() {
	// Make sure you're using mongoose >= 5.0.0
	console.log(new Date(), `mongoose version: ${mongoose.version}`);

	//   comment out because already started
	//   await setupReplicaSet();

	// Connect to the replica set
	const uri = 'mongodb://localhost:27017/' + 'fundamentals?replicaSet=rs';
	await mongoose.connect(uri);

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