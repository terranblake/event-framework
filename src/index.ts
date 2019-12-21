// async function setupReplicaSet() {
// 	const bind_ip = 'localhost';
// 	// Starts a 3-node replica set on ports 31000, 31001, 31002, replica set
// 	// name is "rs0".
// 	const replSet = new ReplSet('mongod', [
// 		{ options: { port: 31000, dbpath: `${__dirname}/data/db/31000`, bind_ip } },
// 		{ options: { port: 31001, dbpath: `${__dirname}/data/db/31001`, bind_ip } },
// 		{ options: { port: 31002, dbpath: `${__dirname}/data/db/31002`, bind_ip } }
// 	], { replSet: 'rs0' });

// 	// Initialize the replica set
// 	await replSet.purge();
// 	await replSet.start();
// 	console.log(new Date(), 'Replica set started...');
// }

export { EventFramework } from './classes/EventFramework';