const AWS = require('aws-sdk');
const { createServer } = require('http');
const express = require('express');
const { awsRequestParser } = require('..');

exports.server = (options, callback) => {
  const app = express();

  awsRequestParser(options)(app)(err => {
    const server = createServer(app);

    server.listen(0, 'localhost', function () {
      const { address, port } = this.address();

      AWS.config.update({
        region: 'us-west-2',
        logger: console,
        maxRetries: 0,
      });

      Object.values(AWS).forEach(({ serviceIdentifier: id }) => {
        if (id === undefined) {
          return;
        }

        const config = {
          endpoint: `http://${address}:${port}/api/${id}`,
        };

        if (id === 's3') {
          config.s3ForcePathStyle = true;
        }

        AWS.config[id] = config;
      });

      callback(null, AWS);

      setTimeout(() => { server.close(); }, 1000);
    });
  });
};

exports.dumpReq = ({ httpRequest }) => {
  console.dir(httpRequest);
};

exports.dumpRes = ({
  httpResponse: {
    statusCode,
    statusMessage,
    headers,
    body,
  },
}) => {
  console.dir({
    statusCode,
    statusMessage,
    headers,
    body: body && body.toString(),
  });
};
