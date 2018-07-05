const protocols = require('./protocols');
const { getServices } = require('./getServices');
const callInitializer = require('call-initializer');

const awsRequestParser = (options = {}) => {
  const {
    AWS = require('aws-sdk'),
    services: serviceHandlers = {},
  } = options;

  const serviceClassMap = Object.entries(AWS)
    .reduce((map, [className, { serviceIdentifier }]) => {
      serviceIdentifier && (map[serviceIdentifier] = className);
      return map;
    }, {});

  return app => next => {
    let err;

    const services = getServices(AWS);

    const serviceMiddlewares = services.map(service => {
      const { protocol } = service.metadata;
      const protocolFn = protocols[protocol];

      if (!protocolFn) {
        err = new Error(`'${protocol}' is an unknown protocol`);
        return null;
      }

      return protocolFn({
        service,
        handlers: serviceHandlers[serviceClassMap[service.id]],
      });
    });

    if (err) {
      return next(err);
    }

    callInitializer(app, ...serviceMiddlewares)(next);
  };
};

/*
 * Exports.
 */
exports.awsRequestParser = awsRequestParser;
