const ResponseHelper = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(e => e.message);
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = 400;
    message = 'Database constraint violation';
  } else if (err.message) {
    message = err.message;
  }

  return ResponseHelper.error(res, message, statusCode, errors);
};

const notFound = (req, res) => {
  return ResponseHelper.notFound(res, `Route ${req.originalUrl} not found`);
};

module.exports = {
  errorHandler,
  notFound,
};
