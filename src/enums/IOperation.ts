enum Operation {
	create = "insert",
	update = "update",
	delete = "delete",
	// queue that isn't based
	// on a Document being modified
	named = "named"
}

export default Operation;