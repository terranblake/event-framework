# Events

events is a nodejs wrapper around MongoDB change streams to support per-Collection events based on a set of listeners with filters

## Installation

Use the package manager [npm](https://docs.npmjs.com/) to install events.

```bash
npm install @postilion/events
```

## Usage

1. Import the EventFramework constructor
```javascript
import { EventFramework } from '@postilion/events';
```

2. Define subscriptions with a model, operation, handler, filters and queue options
```javascript
const subscriptions: Array<Subscription> = [
    {
		// a named subscription is one used by a scheduled job that
		// runs at periodic intervals or is manually pushed to from
		// another queue
        name: 'SyncFilingsByTicker',
        model: models.Company,
        operation: Operation.named,
        handler: filingManager.syncSecFilingFeedByTicker,
        filters: [],
        options: {}
    },
    {
		// a collection-based subscription listens for a change to
		// the model with an operationType that matches this operation
		// and meets the filters/pipeline query
        name: 'GetFilingDocumentsForFiling',
        model: models.Filing,
        operation: Operation.create,
        handler: filingManager.getDocumentsForFiling,
        filters: [
            {
                $match: {
                    status: 'unseeded'
                }
            }
        ],
        options: {}
    }
];
```

3. Pass your connection string and subscriptions to the event framework constructor
```javascript
const eventFramework = new EventFramework('mongodb://user:pass@localhost/db', subscriptions);
```

4. Change a document in a collection you've created a subscription for
```javascript
db.collection.insert({ ... })
```

5. The handler attached to each matching subscription should receive an event
```javascript
{
  id: "cde20f20-28d9-11ea-9735-99b5e82d5a99",
  name: "GetFilingDocumentsForFiling",
  operation: "insert",
  data: {
    _id: "5e06528b29734aab3823235d",
    status: "unseeded",
    company: "5e065276aeee4f3833517b6b",
    publishedAt: "2019-02-01T01:22:40.000Z",
    fiscalYearEnd: "1231-01-01T00:00:00.000Z",
    source: "sec",
    type: "10-K",
    refId: "0001018724-19-000004",
    period: "2018-12-31T00:00:00.000Z",
    url: "https://www.sec.gov/Archives/edgar/data/1018724/000101872419000004/0001018724-19-000004-index.htm",
    name: "Form 10-K",
    filedAt: "2019-02-01T00:00:00.000Z",
    acceptedAt: "2019-02-01T04:22:40.000Z",
    __v: 0
  }
}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)