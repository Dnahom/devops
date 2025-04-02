const promClient = require('prom-client');

// Create a registry to hold metrics
const register = new promClient.Registry();

// Create a gauge for tracking HTTP request duration
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Histogram of HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5], // Customize based on your needs
});

// Create a counter for tracking errors
const errorCounter = new promClient.Counter({
  name: 'http_errors_total',
  help: 'Counter for HTTP errors',
  labelNames: ['method', 'route'],
});

// Register the metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(errorCounter);

// Middleware to track HTTP request duration
function trackMetrics(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // in seconds
    httpRequestDurationMicroseconds.labels(req.method, req.originalUrl, res.statusCode).observe(duration);
    if (res.statusCode >= 400) {
      errorCounter.labels(req.method, req.originalUrl).inc();
    }
  });
  next();
}

// Expose the metrics endpoint
const express = require('express');
const app = express();
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

module.exports = trackMetrics;
