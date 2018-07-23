const {
  firstLower,
  toXml,
} = require('../util');
const bodyParser = require('body-parser');

const queryProtocol = options => app => next => {
  const {
    service,
    handlers = {},
  } = options;

  const { id, operations } = service;

  const bodyParserMiddleware = bodyParser.urlencoded({
    extended: true,
  });

  app.use(`/api/${id}`, bodyParserMiddleware, (req, res, next) => {
    const { body } = req;

    if (body === undefined) {
      res.statusMessage = `MissingAction`;
      res.status(400).end(res.statusMessage);
      return;
    }

    const { Action } = body;

    if (body === undefined) {
      res.statusMessage = `MissingAction`;
      res.status(400).end(res.statusMessage);
      return;
    }

    const operation = operations[Action];

    if (operation === undefined) {
      res.statusMessage = `InvalidAction`;
      res.status(400).end(res.statusMessage);
      return;
    }

    const handler = handlers[firstLower(Action)];

    if (handler === undefined) {
      res.statusMessage = `Operation "${Action}" not implemented`;
      res.status(501).end(res.statusMessage);
      return;
    }

    const {
      input,
      output,
    } = operation;

    const params = makeParams(req, input);

    handler(params, (err, data) => {
      if (err) {
        return next(err);
      }

      respondWithData(res, data, Action, service.metadata.xmlNamespace, output);
    });
  });

  next();
};

/*
 * Make "params" based on "operation.input".
 */
function makeParams(req, input) {
  const params = {};
  const { body } = req;

  Object.entries(input.members).forEach(([memberName, info]) => {
    const {
      type,
    } = info;

    let value;

    if (type === undefined) {
      value = body[memberName];
    } else if (type === 'map') {
      value = parseMap(body, memberName, info);
    } else {
      throw new Error('Not implemented yet');
    }

    if (value !== undefined) {
      params[memberName] = value;
    }
  });

  return params;
}

function parseMap(body, memberName, info) {
  const re = new RegExp(`^${memberName}\\.entry\\.(\\d+)\\.(.+)`);

  let entries = Object.entries(body).reduce((entries, [entryName, entryValue]) => {
    const match = entryName.match(re);

    if (!match) {
      return entries;
    }

    const [, N, rest] = match;

    let obj = entries[N];

    if (obj === undefined) {
      obj = entries[N] = {};
    }

    obj[rest] = entryValue;

    return entries;
  }, {});

  entries = Object.values(entries);

  if (entries.length === 0) {
    return undefined;
  }

  const {
    key: { locationName: keyName },
    value: { locationName: valueName },
  } = info;

  const map = {};

  const reValue = new RegExp(`^${valueName}\\.(.+)`);

  entries.forEach(entry => {
    const key = entry[keyName];

    map[key] = Object.entries(entry).reduce((value, [entryName, entryValue]) => {
      const match = entryName.match(reValue);

      if (!match) {
        return value;
      }

      const [, rest] = match;

      value[rest] = entryValue;

      return value;
    }, {});
  });

  return map;
}

/*
 * Respond based on "operation.output".
 */
function respondWithData(res, data, action, xmlNamespace, output) {
  const { resultWrapper, members } = output;

  const resultWrapperElement = {
    name: resultWrapper,
    children: [],
  };

  const rootElement = {
    name: action + 'Response',
    children: [
      resultWrapperElement,
    ],
  };

  Object.entries(output.members).forEach(([memberName, info]) => {
    const value = data[memberName];

    if (value === undefined) {
      return;
    }

    const memberElement = {
      name: memberName,
      children: [{
        text: value,
      }],
    };

    resultWrapperElement.children.push(memberElement);
  });

  res.end(toXml(rootElement, xmlNamespace));
}

/*
 * Exports.
 */
exports['query'] = queryProtocol;
