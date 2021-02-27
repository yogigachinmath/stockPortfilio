const createError = require('http-errors');

function errorHandler(err, req, res, next) {
  if (err.Error === 'Validation') {
    return res.status(400).send(err.msg);
  }
  if (err.Error === 'dbError') {
    return res.status(500).send(`${err.msg}`);
  }
  if (err.Error === 'Unauthorized') {
    return next(createError(401, 'unauthorized'));
  }
  if (err.Error === 'Forbidden') {
    return next(createError(403, 'Forbidden'));
  }
  if (err.Error === '404') {
    return res.status(404).send('Not Found');
  }
  if (err.Error === 'QuoteError') {
    return res.status(err.status).send(err.msg);
  }
  return next();
}

module.exports = errorHandler;
