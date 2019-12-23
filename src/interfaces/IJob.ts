export interface Job {
	id: String,
	name: string,
	model: string,
	// define set of operations that can be used
	operation: string,
	data: Object
}