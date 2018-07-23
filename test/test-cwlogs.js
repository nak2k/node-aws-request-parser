const test = require('tape');
const {
  dumpReq,
  dumpRes,
  server,
} = require('./helper');

test('test CloudWatchLogs.putLogEvents', t => {
  t.plan(4);

  const params = {
    logEvents: [
    ],
    logGroupName: 'testGroup',
    logStreamName: 'testStream',
  };

  const data = {
    nextSequenceToken: 'sequenceToken',
  };

  const options = {
    services: {
      CloudWatchLogs: {
        putLogEvents(receivedParams, callback) {
          t.deepEqual(receivedParams, params);

          callback(null, data);
        },
      },
    },
  };

  server(options, (err, AWS) => {
    t.error(err);

    const cwlogs = new AWS.CloudWatchLogs();

    cwlogs.putLogEvents(params)
      .on('build', dumpReq)
      .on('error', (err, res) => {
        dumpRes(res);
      })
      .send((err, receivedData) => {
        t.error(err);

        t.deepEqual(receivedData, data);
      });
  });
});
