const AWS = require('aws-sdk');
const { getServices } = require('./util');

const services = getServices(AWS);

console.table(services.map(({
  id,
  metadata: {
    endpointPrefix,
    protocol,
    serviceFullName,
  }
}) => {
  return {
    id,
    endpointPrefix,
    protocol,
    serviceFullName,
  };
}));
