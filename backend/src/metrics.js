const client = require("prom-client");

const register = new client.Registry();

// Register default metrics only once
client.collectDefaultMetrics({ register });

// Define Prometheus metrics
const loginAttemptsCounter = new client.Counter({
    name: "login_attempts_total",
    help: "Total number of login attempts",
    labelNames: ["status", "email"], // success or failure
});

const registerCounter = new client.Counter({
    name: "register_attempts_total",
    help: "Total number of user registration attempts",
    labelNames: ["status", "email"], // success or failure
});

const failedLoginCounter = new client.Counter({
    name: "failed_login_attempts_total",
    help: "Total number of failed login attempts",
    labelNames: ["email"],
});

const failedRegisterCounter = new client.Counter({
    name: "failed_register_attempts_total",
    help: "Total number of failed registration attempts",
    labelNames: ["email"],
});

const totalSuccessfulLogins = new client.Counter({
    name: "total_successful_logins",
    help: "Total number of successful login attempts",
});

const totalFailedLogins = new client.Counter({
    name: "total_failed_logins",
    help: "Total number of failed login attempts",
});

const totalSuccessfulRegistrations = new client.Counter({
    name: "total_successful_registrations",
    help: "Total number of successful registration attempts",
});

const totalFailedRegistrations = new client.Counter({
    name: "total_failed_registrations",
    help: "Total number of failed registration attempts",
});

// ✅ Add the missing HTTP request counter
const httpRequestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
});

// Register metrics only once
if (!register.getSingleMetric("login_attempts_total")) {
    register.registerMetric(loginAttemptsCounter);
}

if (!register.getSingleMetric("register_attempts_total")) {
    register.registerMetric(registerCounter);
}

if (!register.getSingleMetric("failed_login_attempts_total")) {
    register.registerMetric(failedLoginCounter);
}

if (!register.getSingleMetric("failed_register_attempts_total")) {
    register.registerMetric(failedRegisterCounter);
}

// ✅ Register the total successful/failed login and registration counters
if (!register.getSingleMetric("total_successful_logins")) {
    register.registerMetric(totalSuccessfulLogins);
}

if (!register.getSingleMetric("total_failed_logins")) {
    register.registerMetric(totalFailedLogins);
}

if (!register.getSingleMetric("total_successful_registrations")) {
    register.registerMetric(totalSuccessfulRegistrations);
}

if (!register.getSingleMetric("total_failed_registrations")) {
    register.registerMetric(totalFailedRegistrations);
}


// ✅ Register the HTTP request counter
if (!register.getSingleMetric("http_requests_total")) {
    register.registerMetric(httpRequestCounter);
}

module.exports = { 
    register, 
    loginAttemptsCounter, 
    registerCounter, 
    failedLoginCounter, 
    failedRegisterCounter,
    totalSuccessfulLogins,
    totalFailedLogins,
    totalSuccessfulRegistrations,
    totalFailedRegistrations,
    httpRequestCounter  // ✅ Export it so app.js can use it
};
