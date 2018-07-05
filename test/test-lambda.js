const test = require('tape');
const {
  dumpReq,
  dumpRes,
  server,
} = require('./helper');

test('test lambda.invoke', t => {
  t.plan(4);

  const clientContext = {
    foo: true,
  };

  const params = {
    FunctionName: 'test',
    ClientContext: Buffer.from(JSON.stringify(clientContext)).toString('base64'),
    Payload: JSON.stringify({
      data: 'Hello',
    }),
    Qualifier: '$LATEST',
  };

  const data = {
    StatusCode: 200,
    FunctionError: 'Handled',
    Payload: JSON.stringify({
      data: 'Hello',
    }),
    ExecutedVersion: '$LATEST',
  };

  const options = {
    services: {
      Lambda: {
        invoke(receivedParams, callback) {
          t.deepEqual(receivedParams, params);

          callback(null, data);
        },
      },
    },
  };

  server(options, (err, AWS) => {
    t.error(err);

    const lambda = new AWS.Lambda();

    lambda.invoke(params)
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
