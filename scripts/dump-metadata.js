const AWS = require('aws-sdk');
const { getServices } = require('../lib/getServices');

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
