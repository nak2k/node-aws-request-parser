
const queryProtocol = options => app => next => {
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
exports['query'] = queryProtocol;
