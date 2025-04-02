require("express-async-errors");
require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/database");
const { register, loginAttemptsCounter, registerCounter, httpRequestCounter ,failedLoginCounter, failedRegisterCounter, totalSuccessfulLogins,totalFailedLogins, totalSuccessfulRegistrations,totalFailedRegistrations} = require("./metrics");
const client = require("prom-client"); // Import prom-client

const app = express();
const productsRoute = require("./routes/products.routes");
const cartRoute = require("./routes/cart.routes");
const userRoute = require("./routes/user.routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

// Connect to the database before starting the server
connectDB();

// CORS options to allow frontend communication
const corsOption = {
    origin: [
        "http://localhost:5174",
        "http://localhost:5173",
        "http://localhost:4173",
        process.env.FRONTEND_URL,
    ],
    credentials: true,
};

app.use(cors(corsOption)); // Enable CORS
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: false })); // Parse incoming URL-encoded data
app.use(morgan("dev")); // Log HTTP requests

// Middleware to track HTTP requests for Prometheus metrics
// Middleware to track HTTP requests for Prometheus metrics
app.use((req, res, next) => {
    res.on("finish", () => {
        // Fallback to "unknown" if the route is not directly mapped
        httpRequestCounter.labels(req.method, req.route ? req.route.path : "unknown", res.statusCode).inc();
    });
    next();
});

// Expose /metrics endpoint to expose both default and custom Prometheus metrics
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.send(await register.metrics()); // Default and custom metrics will be sent here
});

// Expose /metrics/custom endpoint to expose only custom Prometheus metrics
app.get("/metrics/custom", async (req, res) => {
    const customMetrics = [
        loginAttemptsCounter,
        registerCounter,
        failedLoginCounter,  // Add failed login counter
        failedRegisterCounter,
        totalSuccessfulLogins,
        totalFailedLogins, 
        totalSuccessfulRegistrations,
        totalFailedRegistrations 
    ];
    const customRegistry = new client.Registry(); // Use the imported client
    customMetrics.forEach((metric) => customRegistry.registerMetric(metric)); // Register only custom metrics

    res.set("Content-Type", customRegistry.contentType);
    res.send(await customRegistry.metrics()); // Only custom metrics
});

// API Routes
app.use("/api/products", productsRoute);
app.use("/api/cart", cartRoute);
app.use("/api/user", userRoute);

// Default route to check API status
app.get("/", (req, res) => {
    res.send("Shoppify API Ok.");
});

// Handle 404 errors (if no route matches)
// Handle 404 errors (if no route matches)
app.use("*", notFound);

// Error handling middleware (for operational errors)

// Error handling middleware (for operational errors)
app.use(errorHandler);

module.exports = app;
