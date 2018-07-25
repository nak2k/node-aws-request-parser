const { expandShapes } = require('./shape');

function getServices(AWS) {
  return Object.entries(AWS.apiLoader.services)
    .map(([key, value]) => {
      value = getNewestVersion(value);
      value.id = key;
      return value;
    })
    .map(expandShapes)
    .sort((lhs, rhs) => {
      const a = lhs.id;
      const b = rhs.id;

      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    });
}

function getNewestVersion(versions) {
  return versions[Object.keys(versions).sort().reverse()[0]]
}

/*
 * Exports.
 */
exports.getServices = getServices;
