# Event-Framework

event-framework is a nodejs wrapper around MongoDB change streams to support per-Collection events based on a set of listeners with filters

## Installation

Use the package manager [npm](https://docs.npmjs.com/) to install event-framework.

```bash
npm install @postilion/event-framework
```

## Usage

1. Import the EventFramework constructor
```javascript
import { EventFramework } from '@postilion/event-framework';
```

2. Define subscriptions to receive events for
```javascript
const subscriptions: Array<Subscription> = [
	{
	name: 'IdentifierCreation',
	// model that the change happened on
	model: 'identifiers',
	operation: 'change',
	// function that will receive the event
	handler: console.log,
	filters: [
		// pipeline to pass as a filter for events
	],
	options: {
		// defines options to be passed to the resulting
		// change stream. mongodb documentation provides
		// details: http://mongodb.github.io/node-mongodb-native/3.3/api/Collection.html#watch
		// fullDocument: 'default',
	}
];
```

3. Pass your connection string and subscriptions to the event framework constructor
```javascript
const eventFramework = new EventFramework('mongodb://user:pass@localhost/db', subscriptions);
```

4. 💃🍺

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)