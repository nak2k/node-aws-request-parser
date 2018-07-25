const AWS = require('aws-sdk');
const { getServices } = require('./util');

const { argv } = process;

if (argv.length < 3) {
  console.error(`Usage: node dump-service.js <service>`);
  process.exit(1);
}

const [, , serviceName] = argv;

const services = getServices(AWS);

const service = services.find(s => s.id === serviceName);

if (!service) {
  console.error(`"${serviceName}" is not a service`);
  console.error();
  console.error('Services: %s', services.map(s => s.id).join(', '));

  process.exit(1);
}

console.dir(service, { depth: null });
