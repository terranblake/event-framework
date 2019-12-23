export interface Subscription {
	name: string,
	model: string,
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