var Queue = require('./queue');

var queue1 = new Queue(URL_QUEUE_SEND,     URL_QUEUE_RECEIVE);
var queue2 = new Queue(URL_QUEUE_RECEIVE,  URL_QUEUE_SEND);

var run = function() {

  console.log("\nrun\n");

  queue1.put(JSON.stringify({name: 'henk', id: 1234}), function(err, result) {
    console.log("queue1 put", result);
  });

  queue2.get(function(err, result) {

    console.log("queue2 messages", result ? result.length : 0);
    for (var key in result) {
      var message = result[key];

      console.log(message);

      queue2.put(message.Body, function(err, result) {
        queue2.remove(message, function(err, result) {
          console.log("queue2 remove", result);
        });
      });
    }

  });


  setTimeout(run, 2000);

};

setTimeout(run, 500);