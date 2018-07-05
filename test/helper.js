const AWS = require('aws-sdk');
const { createServer } = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { awsRequestParser } = require('..');

exports.server = (options, callback) => {
  const app = express();

  app.use(bodyParser.text({
    type: '*/*',
  }));

  awsRequestParser(options)(app)(err => {
    const server = createServer(app);

    server.listen(0, 'localhost', function () {
      const { address, port } = this.address();

      AWS.config.update({
        region: 'us-west-2',
        logger: console,
      });

      const serviceMap = {
        lambda: 'lambda',
      };

      Object.entries(serviceMap).forEach(([service, id]) => {
        AWS.config[service] = {
          endpoint: `http://${address}:${port}/api/${id}`,
        };
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
    body: body.toString(), 
  });
};
