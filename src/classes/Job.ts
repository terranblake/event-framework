import { Model } from "mongoose";
import * as uuid from 'uuid';

import { default as IJob } from '../interfaces/IJob';

export default class Job implements IJob {
	public readonly id: string;
	public name: string;
	public model: Model<any, {}>;
	// define set of operations that can be used
	public operation: string;
	public data: Model<any, {}>;

	constructor(name: string, model: Model<any, {}>, operation: string, data: Model<any, {}>) {
		this.id = Job.generate();
		this.name = name;
		this.model = model;
		this.operation = operation;
		this.data = data;
	}

	static generate(): string {
		return uuid.v1();
	}
}