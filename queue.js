var AWS   = require('aws-sdk');
var LRU   = require('lru-cache');
var nconf = require('nconf');

var Queue = function(sendQueueUrl, receiveQueueUrl) {

  nconf
    .env()
    .file({ file: process.env.QUEUE_CONFIG || './config.json' });

  // passed in parameters override nconf variables
  this.sendQueueUrl     = sendQueueUrl    || nconf.get('URL_QUEUE_SEND');
  this.receiveQueueUrl  = receiveQueueUrl || nconf.get('URL_QUEUE_RECEIVE');

  // config AWS
  AWS.config.update({
    accessKeyId:      nconf.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey:  nconf.get('AWS_SECRET_ACCESS_KEY'),
    region:           nconf.get('AWS_REGION')
  });

  // create sqs instance which will use configuration above
  this.sqs = new AWS.SQS();

  // set up LRU cache, for messageId's that we've processed
  this.cache = LRU({
    max: 1000,
    length: function (n) { return 1 },
    dispose: function (key, n) { console.log(key) },
    maxAge: 1000 * 60 * 60 * 24 // 1 day, just like the queue retention policy
  });

};

Queue.prototype.put = function(message, callback) {

  var _this = this;

  var params = {
    MessageBody: message,
    QueueUrl: _this.sendQueueUrl
  };

  _this.sqs.sendMessage(params, function(err, data) {
    if (err) {
      callback(err, undefined);
    } else {
      callback(undefined, data);
    }

  });

};


Queue.prototype.get = function(callback) {

  var _this = this;

  var params = {
    QueueUrl: _this.receiveQueueUrl,
    AttributeNames: [
      'All',
    ],
    MaxNumberOfMessages: 10
  };

  _this.sqs.receiveMessage(params, function(err, data) {
    if (err) {
      callback(err, undefined);
    } else {
      var messages = [];

      // walk through messages, skip ones we've seen already
      if (data.Messages) {
        for (var key in data.Messages) {

          var message = data.Messages[key];
          if (!_this.cache.peek(message.MessageId)) {
            messages.push(message);
          } else {
            console.error('saw this message already', message.MessageId);
          }

        }
      }

      callback(undefined, messages);

    }
  });

};


Queue.prototype.remove = function(message, callback) {
   var _this = this;

   var params = {
    QueueUrl: _this.receiveQueueUrl,
    ReceiptHandle: message.ReceiptHandle
  };

  _this.sqs.deleteMessage(params, function(err, data) {
    if (err) {
      callback(err, undefined);
    } else {
      // message seen and removed, add to cache
      _this.cache.set(message.MessageId, message.ReceiptHandle);
      callback(undefined, data);
    }
  });
};


module.exports = Queue;