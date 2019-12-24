enum Operation {
	create = 1,
	update,
	delete,
	// queue that isn't based
	// on a Document being modified
	named
}

export default Operation;