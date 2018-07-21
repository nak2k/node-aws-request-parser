const {
  firstLower,
  makeParams,
} = require('../util');

const restJsonProtocol = options => app => next => {
  const {
    service,
    handlers = {},
  } = options;

  const { id, operations } = service;

  Object.entries(operations).forEach(([name, operation]) => {
    const {
      http: { method = 'POST', requestUri = '/', responseCode = 200 },
      input,
      output,
    } = operation;

    const path = requestUri.replace(/{([^}]+)}/g, ':$1');
    const mountPath = `/api/${id}${path}`;

    const handler = handlers[firstLower(name)];

    /*
     * Respond with 501 if no handler.
     */
    if (handler === undefined) {
      app[method.toLowerCase()](mountPath, (req, res, next) => {
        res.statusMessage = `Operation "${name}" not implemented`;
        res.status(501).end(res.statusMessage);
      });

      return;
    }

    /*
     * Mount the handler.
     */
    app[method.toLowerCase()](mountPath, (req, res, next) => {
      const params = makeParams(req, input);

      handler(params, (err, data) => {
        if (err) {
          return next(err);
        }

        respondWithData(res, data, output);
      });
    });
  });

  next();
};

/*
 * Respond based on "operation.output".
 */
function respondWithData(res, data, output) {
  let body;

  Object.entries(output.members).forEach(([memberName, info]) => {
    const {
      location,
      locationName,
    } = info;

    const value = data[memberName];

    if (value === undefined) {
      return;
    }

    if (location === undefined) {
      body = value;
      return;
    }

    switch (location) {
      case 'header':
        res.setHeader(locationName, value);
        break;

      case 'statusCode':
        res.status(value);
        break;
    }
  });

  res.end(body);
}

/*
 * Exports.
 */
exports['rest-json'] = restJsonProtocol;
