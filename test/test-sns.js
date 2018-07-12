const test = require('tape');
const {
  dumpReq,
  dumpRes,
  server,
} = require('./helper');

test('test sns.publish', t => {
  t.plan(4);

  const params = {
    Message: JSON.stringify({
      default: 'test',
    }),
    MessageStructure: 'json',
    MessageAttributes: {
      test: {
        DataType: 'String',
        StringValue: 'test',
      },
    },
    TopicArn: 'arn:aws:sns:us-west-2:123456789012:my-topic',
  };

  const data = {
    MessageId: '00000000-0000-0000-0000-000000000000',
  };

  const options = {
    services: {
      SNS: {
        publish(receivedParams, callback) {
          t.deepEqual(receivedParams, params);

          callback(null, {
            ...data,
          });
        },
      },
    },
  };

  server(options, (err, AWS) => {
    t.error(err);

    const sns = new AWS.SNS();

    sns.publish(params)
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
