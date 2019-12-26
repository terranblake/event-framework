import { Model } from "mongoose";
import * as uuid from 'uuid';

const uuidTime = require('uuid-time');

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

	// generate a time-based identifier
	static generate(): string {
		return uuid.v1();
	}

	// get the date from the provided id
	public createdAt(id: string): Date {
		return new Date(uuidTime.v1(id));
	}
}