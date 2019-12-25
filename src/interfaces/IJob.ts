import { Model } from "mongoose";
import Operation from "./IOperation";

export default interface Job {
	id: String,
	name: string,
	model: Model<any, {}>,
	// define set of operations that can be used
	operation: Operation,
	data: any
}