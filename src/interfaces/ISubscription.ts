import { Model } from "mongoose";
import Job from "../classes/Job";
import { default as EventsOptions } from './IEventsOptions';

export default interface Subscription {
	name: string,
	model: Model<any, {}>,
	// define set of operations that can be used
	operation: string,
	// todo: define a model for jobs
	handler: (job: Job) => void,
	filters: Array<any>,
	options: EventsOptions
}