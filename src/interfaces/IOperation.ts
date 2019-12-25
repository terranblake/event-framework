enum Operation {
	create = "change",
	update = "change",
	delete = "change",
	// queue that isn't based
	// on a Document being modified
	named = "named"
}

export default Operation;