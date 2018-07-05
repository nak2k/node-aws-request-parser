# aws-request-parser

Parse requests of AWS API.

## Installation

```
npm i aws-request-parser
```

## Usage

``` javascript
const { awsRequestParser } = require('aws-request-parser');

const app = express();

cosnt options = {
  services: {
    Lambda: {
      invoke(params, callback) {
        // Do something with using params.

        callback(null, {
          StatusCode: 200,
        });
      },
    },
  },
};

awsRequestParser(options)(app)(err => {
  // Do something after the app is configured.
});
```

## Not supported yet

- [ ] rest-xml protocol
- [ ] json protocol
- [ ] query protocol
- [ ] ec2 protocol

## License

MIT
