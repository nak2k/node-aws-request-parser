const test = require('tape');
const {
  dumpReq,
  dumpRes,
  server,
} = require('./helper');

test('test s3.getObject', t => {
  t.plan(4);

  const params = {
    Bucket: 'test-bucket',
    Key: 'test-key',
  };

  const Body = Buffer.from('test');

  const data = {
    Body,
    ContentType: 'binary/octet-stream',
    ContentLength: Body.length,
    Metadata: {},
  };

  const options = {
    services: {
      S3: {
        getObject(receivedParams, callback) {
          t.deepEqual(receivedParams, params);

          callback(null, data);
        },
      },
    },
  };

  server(options, (err, AWS) => {
    t.error(err);

    const s3 = new AWS.S3();

    s3.getObject(params)
      .on('build', dumpReq)
      .on('error', (err, res) => {
        dumpRes(res);
      })
      .send((err, receivedData) => {
        t.error(err);

        const { Body } = receivedData;

        // receivedData.Body = undefined;

        t.deepEqual(receivedData, data);
      });
  });
});
