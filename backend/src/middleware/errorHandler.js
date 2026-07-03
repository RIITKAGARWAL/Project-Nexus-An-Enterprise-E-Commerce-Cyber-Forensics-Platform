/**
 * Global Enterprise Exception Handling Middleware
 * Catch-all error handler ensuring uniform error responses and preventing stack trace leakage.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Global Exception Catcher] ${err.message}`, err.stack);

  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    status: 'ERROR',
    message: err.message || 'Internal Server Error',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    // Include stack trace only if running in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;