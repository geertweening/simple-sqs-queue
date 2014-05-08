#Simple SQS Queue

[![NPM](https://nodei.co/npm/simple-sqs-queue.png)](https://www.npmjs.org/package/simple-sqs-queue)

`simple-sqs-queue` is a lightweight wrapper around Amazon's SQS functionality. This library provides a simple interface to interact with SQS's. A basic put, get and remove API with options to configure the SQS behavior.

##Installation

```
  $ npm install simple-sqs-queue
```

##Getting started

The easiest way to get started is to configure an SQS queue in AWS and use that url to configure a Queue. Specify the send and receive url, they can be the same queue. The region specifies the region the queue(s) are located in. The AWS access key and secret are needed to make requests to the SQS queues on your behalf. Create your keys through the IAM panel in the AWS console.


So far I have only been able to create queues in the same region. If there's a need for cross-region queue support, file an issue and I will take a look.

```
var aliceQueue = new Queue({
    urlQueueSend:       'http://url.to.your.send.queue',
    urlQueueReceive:    'http://url.to.your.receive.queue',
    awsRegion:          'queue-region'
    awsAccessKeyId:     '123456ABCDEF'
    awsSecretAccessKey: '098765HGFEDC'
  });
```

Sending a message to the queue is as easy as calling the `put` method on the queue. The payload has to be a string, but you can use any object you want and stringify it.

```
var payload = {
  id: 1234,
  type: SOME_TYPE
};

aliceQueue.put(JSON.stringify(payload), function(err, result) {
  // handle error if present
  // result contains a message id and response metadata
});
```

Get messages from the queue by calling `get`.

```
aliceQueue.get(function(err, result) {

  if (err || !result || result.length === 0) {
    // if error or no messages, there's nothing to do
    return;
  }

  // read the messages
  for (var key in result) {
    var message = result[key];
    var body = JSON.parse(message.Body);  // this is the actual payload that was send with the `put` method
    var id = body.id;

    // do some thingg
  }

});
```

SQS sometimes gives you messages twice. The library takes care of receiving messages twice and will only give you the ones that you haven't seen already, but this only works correctly if you call remove for the message after you've processed it. The library doesn't make the assumption that you've seen the message, only if you explicitly call remove for that message.

By calling remove the message is deleted from the queue, otherwise it will stay in the queue and keep showing up in subsequent `get` calls.

```
// pass in the message object that was in the array of results received by `get`
aliceQueue.remove(message, function(err, result) {
  // handle error or look at result
  // result contains a request id and response metadata
});
```


##Configuring

You have multiple options to configure a Queue. This library uses nconf to allow transparent use of environment variables and a config file. The following variables are used:

- `URL_QUEUE_SEND` : url to the location of the SQS queue used for sending messages
- `URL_QUEUE_RECEIVE` : url to the location of the SQS queue used for receiving messages

- `AWS_ACCESS_KEY_ID` : AWS access key
- `AWS_SECRET_ACCESS_KEY` : AWS secret key
- `AWS_REGION` : region the queue's reside in

- `QUEUE_CONFIG` : path to config.json that the Queue can optionaly use to configure itself

###Environment variables

Set the variables above to your environment:
e.g. `export AWS_SECRET_ACCESS_KEY=123467890abcdefgh`

###config.json

Create a config.json. By default `./simple-sqs-queue-config.json` is used, but you can override the path by setting the `QUEUE_CONFIG` env variable.

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