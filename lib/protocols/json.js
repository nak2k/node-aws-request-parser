const {
  firstLower,
  makeParams,
} = require('../util');
const bodyParser = require('body-parser');

const jsonProtocol = options => app => next => {
  const {
    service,
    handlers = {},
  } = options;

  const {
    id,
    operations,
    metadata: {
      targetPrefix,
    },
  } = service;

  const bodyParserMiddleware = bodyParser.json({
    type: [
      'application/json',
      'application/x-amz-json-1.1',
    ],
  });

  app.use(`/api/${id}`, bodyParserMiddleware, (req, res, next) => {
    const targetHeader = req.headers['x-amz-target'];

    if (!targetHeader) {
      res.statusMessage = `No X-Amz-Target header.`;
      res.status(403).end(res.statusMessage);
      return;
    }

    const [prefix, name] = targetHeader.split('.');

    if (prefix !== targetPrefix) {
      res.statusMessage = `Target prefix ${prefix} is invalid.`;
      res.status(403).end(res.statusMessage);
      return;
    }

    const handler = handlers[firstLower(name)];

    /*
     * Respond with 501 if no handler.
     */
    if (!handler) {
      res.statusMessage = `Operation "${name}" not implemented`;
      res.status(501).end(res.statusMessage);
      return;
    }

    /*
     * Call the handler.
     */
    handler(req.body, (err, data) => {
      if (err) {
        return next(err);
      }

      const json = JSON.stringify(data);

      res.status(200);
      res.setHeader('Content-Type', 'application/x-amz-json-1.1');
      res.end(json);
    });
  });

  next();
};

/*
 * Exports.
 */
exports['json'] = jsonProtocol;
