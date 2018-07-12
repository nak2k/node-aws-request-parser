const {
  firstLower,
  makeParams,
} = require('../util');

const restXmlProtocol = options => app => next => {
  const {
    service,
    handlers = {},
  } = options;

  const { id, operations } = service;

  const modifiedOperations = Object.entries(operations)
    .map(([name, operation]) => ({ ...operation, name }));

  const pathEntries = makePathEntries(modifiedOperations);

  app.use(`/api/${id}`, (req, res, next) => {
    const [methodMap, params] = findByPath(req.path, pathEntries);

    if (!methodMap) {
      return res.status(404).end();
    }

    const operationEntries = methodMap[req.method];

    if (!operationEntries) {
      return res.status(403).end();
    }

    const operation = findByQuery(req.query, operationEntries);

    if (!operation) {
      return res.status(500).end();
    }

    const {
      name,
      output,
    } = operation;

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
    handler(params, (err, data) => {
      if (err) {
        return next(err);
      }

      respondWithData(res, data, output);
    });
  });

  next();
};

function makePathEntries(operations) {
  const pathMap = {};

  operations.forEach(operation => {
    const {
      http: { method = 'POST', requestUri = '/' },
      input,
    } = operation;

    const [path, qualified] = requestUri.split('?');

    const pathMapEntry = pathMap[path] || (pathMap[path] = {});
    const operationEntries = pathMapEntry[method] || (pathMapEntry[method] = []);

    const qualifiedNames = qualified ? [ qualified ] : [];

    if (input && input.required) {
      input.required.forEach(name => {
        const {
          location,
          locationName,
        } = input.members[name];

        if (location === 'querystring') {
          qualifiedNames.push(locationName);
        }
      });
    }

    operationEntries.push({
      qualifiedNames,
      operation,
    });
  });

  const pathEntries = Object.entries(pathMap)
    .map(([path, methodMap]) => {
      const paramNames = [];

      const source = path.replace(/{([^}]+)}/g, (match, p1) => {
        if (p1.endsWith('+')) {
          paramNames.push(p1.substr(0, p1.length - 1));
          return '([^\\?]+)';
        } else {
          paramNames.push(p1);
          return '([^/]+)';
        }
      });

      return {
        path,
        regexp: new RegExp(source),
        paramNames,
        methodMap,
      };
    })
    .sort((lhs, rhs) => {
      return rhs.paramNames.length - lhs.paramNames.length;
    })

  return pathEntries;
}

function findByPath(path, pathEntries) {
  for (let i = 0; i < pathEntries.length; i++) {
    const pathEntry = pathEntries[i];

    const match = path.match(pathEntry.regexp);

    if (!match) {
      continue;
    }

    const params = {};

    pathEntry.paramNames.forEach((name, index) => {
      params[name] = match[index + 1];
    });

    return [pathEntry.methodMap, params];
  }

  return [];
}

function findByQuery(query, operationEntries) {
  let defaultOperation;

  const entry = operationEntries
    .find(({ qualifiedNames, operation }) => {
      if (qualifiedNames.length === 0) {
        defaultOperation = operation;
        return false;
      }

      return qualifiedNames.every(name => query.hasOwnProperty(name));
    });

  return entry ? entry.operation : defaultOperation;
}

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
exports['rest-xml'] = restXmlProtocol;
