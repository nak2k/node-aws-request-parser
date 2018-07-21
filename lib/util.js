const firstLower = str =>
  str[0].toLowerCase() + str.substr(1);

const toXml = ({ name, children }, xmlNamespace) =>
  `<${name} xmlns="${xmlNamespace}">${children.map(toXmlNode)}</${name}>`;

const toXmlNode = ({ name, children, text }) => (
  text !== undefined
    ? String(text)
    : `<${name}>${children.map(toXmlNode)}</${name}>`
);

/*
 * Make "params" based on "operation.input".
 */
function makeParams(req, input) {
  const params = {};

  Object.entries(input.members).forEach(([memberName, info]) => {
    const {
      location,
      locationName,
    } = info;

    if (location === undefined) {
      params[input.payload] = req.body;
      return;
    }

    switch (location) {
      case 'header': {
        const value = req.headers[locationName.toLowerCase()];
        if (value !== undefined) {
          params[memberName] = value;
        }
        break;
      }

      case 'querystring': {
        const value = req.query[locationName];
        if (value !== undefined) {
          params[memberName] = value;
        }
        break;
      }

      case 'uri': {
        const value = req.params[locationName];
        if (value !== undefined) {
          params[memberName] = value;
        }
        break;
      }
    }
  });

  return params;
}

/*
 * Exports.
 */
exports.firstLower = firstLower;
exports.makeParams = makeParams;
exports.toXml = toXml;
