'use strict';

var assert  = require('assert');
var crypto  = require('crypto');
var Queue   = require('./queue');


function randString(bytes) {
  return crypto.randomBytes(bytes || 24).toString('hex');
}

function randInt(bytes) {
  return parseInt(crypto.randomBytes(bytes || 4).toString('hex'), 16).toString();
}

//
// define the location of the SQS queues and the region they should run in
// these parameters are used when creating the Alice and Bob Queues.
// the use-case this test was designed for assumed two queues, one for sending and one for resuming
// Alice and Bob use both queues but use both inversely for sending and receiving in respect to each other
// e.g. Bob will READ from the queue that Alice SENDS to
//
var URL_QUEUE_SEND    = 'https://sqs.{{ REGION }}.amazonaws.com/{{ ACCOUNT }}/{{ SQS_QUEUE_NAME_1 }}';
var URL_QUEUE_RECEIVE = 'https://sqs.{{ REGION }}.amazonaws.com/{{ ACCOUNT }}/{{ SQS_QUEUE_NAME_2 }}';
var AWS_REGION        = '{{ REGION }}';

var aliceQueue;
var bobQueue;


// set up send and receive queue
before(function () {
  aliceQueue = new Queue( {urlQueueSend: URL_QUEUE_SEND, urlQueueReceive: URL_QUEUE_RECEIVE, awsRegion: AWS_REGION });
  bobQueue = new Queue( {urlQueueSend: URL_QUEUE_RECEIVE, urlQueueReceive: URL_QUEUE_SEND, awsRegion: AWS_REGION });
});


//
// spec for the functionality of the queues
// - Alice puts a message in the queue that Bob can read from
// - Bob reads the message from the queue and deletes it
// - Bob puts a message in the queue that Alice can read from
// - Alice reads the message from the queue and deletes it
//
// the contents of the message is not being tested since the test-case can not properly cover that
// SQS message delivery isn't super reliable for the short time-frame this test will run in
//

describe('Queue', function() {

  it('Alice Queue should put a JSON message', function(done) {

    var payload = {
      name: randString(),
      id: randInt()
    };

    aliceQueue.put(JSON.stringify(payload), function(err, result) {
      assert.strictEqual(err, undefined);
      assert(result.hasOwnProperty('MessageId'));
      assert(result.hasOwnProperty('ResponseMetadata'));

      done();
    });
  });


  // store the message Bob queue will read
  var receivedMessage;

  it('Bob Queue should get messages', function(done) {

    bobQueue.get(function(err, result) {

      assert.strictEqual(err, undefined);
      assert(result.hasOwnProperty('length'));
      assert(result.length > 0);

      receivedMessage = result[0];

      assert(receivedMessage.hasOwnProperty('Body'));
      assert(receivedMessage.hasOwnProperty('ReceiptHandle'));
      assert(receivedMessage.hasOwnProperty('Attributes'));

      done();
    });
  });

  it('Bob Queue should remove the message received', function(done) {

    bobQueue.remove(receivedMessage, function(err, result) {

      assert.strictEqual(err, undefined);
      assert(result.hasOwnProperty('ResponseMetadata'));
      assert(result.ResponseMetadata.hasOwnProperty('RequestId'));

      done();
    });

  });

  it('Bob Queue should put a JSON message', function(done) {

    var payload = {
      name: randString(),
      id: randInt()
    };

    bobQueue.put(JSON.stringify(payload), function(err, result) {
      assert.strictEqual(err, undefined);
      assert(result.hasOwnProperty('MessageId'));
      assert(result.hasOwnProperty('ResponseMetadata'));

      done();
    });
  });

  // store the message Alice queue will read
  var aMessage;

  it('Alice Queue should get messages', function(done) {

    aliceQueue.get(function(err, result) {

      assert.strictEqual(err, undefined);
      assert(result.hasOwnProperty('length'));
      assert(result.length > 0);

      aMessage = result[0];

      assert(aMessage.hasOwnProperty('Body'));
      assert(aMessage.hasOwnProperty('ReceiptHandle'));
      assert(aMessage.hasOwnProperty('Attributes'));

      done();
    });
  });

  it('Alice Queue should remove the message received', function(done) {

    aliceQueue.remove(aMessage, function(err, result) {

      assert.strictEqual(err, undefined);
      assert(result.hasOwnProperty('ResponseMetadata'));
      assert(result.ResponseMetadata.hasOwnProperty('RequestId'));

      done();
    });

  });

});