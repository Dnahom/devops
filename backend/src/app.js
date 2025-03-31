require("express-async-errors");
require("dotenv").config({ path: "./.env" });  // .env file is in the same directory as app.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const client = require("prom-client");
const connectDB = require("./config/database");  // database.js is in ./src/config

const app = express();
const productsRoute = require("./routes/products.routes");
const cartRoute = require("./routes/cart.routes");
const userRoute = require("./routes/user.routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

// Connect to the database before starting the server
connectDB();

const corsOption = {
    origin: [
        "http://localhost:5174",
        "http://localhost:5173",
        "http://localhost:4173",
        process.env.FRONTEND_URL,
    ],
    credentials: true,
};

app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Prometheus metrics setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom HTTP request counter for Prometheus
const httpRequestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
});

// Middleware to track HTTP requests for Prometheus metrics
app.use((req, res, next) => {
    res.on("finish", () => {
        httpRequestCounter.labels(req.method, req.path, res.statusCode).inc();
    });
    next();
});

// Expose /metrics endpoint (must be before other routes)
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});

// Routes
app.use("/api/products", productsRoute);
app.use("/api/cart", cartRoute);
app.use("/api/user", userRoute);

app.get("/", (req, res) => {
    res.send("Shoppify API Ok.");
});

// Handle 404 errors (if no route matches)
app.use("*", notFound);

// Error handling middleware (for operational errors)
app.use(errorHandler);

module.exports = app;
