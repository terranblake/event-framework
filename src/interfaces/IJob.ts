import { Model } from "mongoose";
import Operation from "../enums/IOperation";

export default interface Job {
	id: string,
	name: string,
	model: Model<any, {}>,
	// define set of operations that can be used
	operation: string,
	data: any,

}