const Bull = require('bull');

export { default as EventFramework } from './src/classes/EventFramework';
export { default as Subscription } from './src/interfaces/ISubscription';
export { default as Operation } from './src/interfaces/IOperation';
export { Bull as Queue };
export { default as Job } from './src/interfaces/IJob';