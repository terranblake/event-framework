import { Model } from "mongoose";

export default interface Subscription {
	name: string,
	model: Model<any, {}>,
	// define set of operations that can be used
	operation: string,
	// todo: define a model for jobs
	handler: (job: any) => void,
	filters: Array<SubscriptionFilter>,
	options: Object
}

export interface SubscriptionFilter {
	// todo: define subscription filter interface
}