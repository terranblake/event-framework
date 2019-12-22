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
```javascript
{ _id:
   { _data:
      Binary {
        _bsontype: 'Binary',
        sub_type: 0,
        position: 49,
        buffer:
         <Buffer 82 5d fe b6 fd 00 00 00 01 46 64 5f 69 64 00 64 5d fe b6 fd 8e 3f 81 a7 a8 78 9c fe 00 5a 10 04 e2 36 af 04 13 23 42 ca 8f 95 61 89 48 09 49 68 04> } },
  operationType: 'insert',
  fullDocument:
   { _id: 5dfeb6fd8e3f81a7a8789cfe,
     prefix: 'us-test',
     name: 'Test',
     version: '0001' },
  ns: { db: 'fundamentals', coll: 'identifiers' },
  documentKey: { _id: 5dfeb6fd8e3f81a7a8789cfe } }
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)