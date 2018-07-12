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
 * Exports.
 */
exports.firstLower = firstLower;
exports.toXml = toXml;
