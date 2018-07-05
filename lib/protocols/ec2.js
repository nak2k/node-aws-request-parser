
const ec2Protocol = options => app => next => {
  const {
    service,
  } = options;

  const { id } = service;

  app.use(`/api/${id}`, (req, res, next) => {
    res.statusMessage = 'Not implemented';
    res.status(501).end(res.statusMessage);
  });
  
  next();
};

/*
 * Exports.
 */
exports['ec2'] = ec2Protocol;
