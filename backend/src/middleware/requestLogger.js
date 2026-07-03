/**
 * Enterprise Structured Request Logging Middleware
 * Tracks incoming HTTP requests, response status codes, and execution latency.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP Audit] ${req.method} ${req.originalUrl} -> Status: ${res.statusCode} [${duration}ms]`);
  });

  next();
};

module.exports = requestLogger;