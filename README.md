#Simple SQS Queue

[![NPM](https://nodei.co/npm/simple-sqs-queue.png)](https://www.npmjs.org/package/simple-sqs-queue)

`simple-sqs-queue` is a lightweight wrapper around Amazon's SQS functionality. This library adds a simple interface to interact with SQS's queues. Simple put and get requests with options to configure the SQS behavior.

##Getting `simple-sqs-queue`

**Via npm for Node.js**

```
  $ npm install simple-sqs-queue
```

##Configuring

You have multiple options to configure a Queue. This library uses nconf to allow transparent use of environment variables and a config file. The following variables are used:

- `URL_QUEUE_SEND`
- `URL_QUEUE_RECEIVE`

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

###Environment variables

Set the variables above to your environment:
e.g. `export AWS_SECRET_ACCESS_KEY=123467890abcdefgh`

###config.json

Create a config.json. By default `./config.json` is used, but you can override the path by setting the `QUEUE_CONFIG` env variable.

The config.json can also be passed in on instantiation in the options parameter. More on the options parameter below

```
var Queue     = require('simple-sqs-queue');
var bobQueue  = new Queue({
  configPath: './path/to/config.json'
});
```

###options parameter
When creating a Queue, you can pass in an options parameter which will override environment variables and config file settings. The options keys have the same names as their config variables, but they are camelCased.

e.g.
```
var aliceQueue = new Queue({
  urlQueueSend:     URL_QUEUE_SEND,
  urlQueueReceive:  URL_QUEUE_RECEIVE,
  awsRegion:        AWS_REGION
});
```


##Running tests

1. Clone the repository

2. `cd` into the repository and install dependencies with `npm install`

3. configure `test.js` with your Amazon SQS queue url's and region (TODO: pick configuration up from env variable or config)

4. `npm test`