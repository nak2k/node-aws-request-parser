const AWS = require('aws-sdk');
const { getServices } = require('./util');

const { argv } = process;

if (argv.length < 4) {
  console.error(`Usage: node dump-operation.js <service> <operation>`);
  process.exit(1);
}

const [, , serviceName, operationName] = argv;

const services = getServices(AWS);

const service = services.find(s => s.id === serviceName);

if (!service) {
  console.error(`"${serviceName}" is not a service`);
  console.error();
  console.error('Services: %s', services.map(s => s.id).join(', '));

  process.exit(1);
}

const operation = service.operations[operationName];

if (!operation) {
  console.error(`"${operationName}" is not found in the service ${serviceName}`);
  console.error();
  console.error('Operations: %s', Object.keys(service.operations).join(', '));

  process.exit(1);
}

console.dir(operation, { depth: null });
