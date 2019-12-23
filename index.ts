const Queue = require('bull');
import * as framework from './src/classes/EventFramework';

import { Subscription } from './src/interfaces/ISubscription';
const { EventFramework } = framework;

export {
	EventFramework,
	Queue,
	Subscription
};