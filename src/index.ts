// import { EventFramework } from './classes/EventFramework';
// import { Subscription } from './interfaces/ISubscription';

// const subscriptions: Array<Subscription> = [
// 	{
// 		name: 'UnprocessedEarnings',
// 		model: 'earnings',					// create enum which is exported from core/models which limits the types that can be used for subscriptions
// 		// define set of operations that can be used
// 		operation: 'named',					// replace this with an enum of supported operation types. enforced by core/models
// 		handler: (job) => console.log(new Date(), job),
// 		filters: [
// 			// todo: add support for more filter types
// 			// supports pipeline out of the box
// 			// need basic mongo query syntax filtering

// 			// add support for filters when using named queues ???
// 		],
// 		options: {
// 			// defines options to be passed to the resulting
// 			// change stream. mongodb documentation provides
// 			// details: http://mongodb.github.io/node-mongodb-native/3.3/api/Collection.html#watch
// 			// fullDocument: 'default',

// 			// todo: use these options for connection details if the queue is from a different instance
// 		},
// 	},
// ];

// const events = new EventFramework('mongodb://localhost/postilion', subscriptions);

import * as framework from './classes/EventFramework';
const { EventFramework } = framework;

export { EventFramework };
export { Subscription } from './interfaces/ISubscription';