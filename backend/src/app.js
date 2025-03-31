require("express-async-errors");
require("dotenv").config({ path: "./src/config/.env" });
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const productsRoute = require("./routes/products.routes");
const cartRoute = require("./routes/cart.routes");
const userRoute = require("./routes/user.routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

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

// routes

app.use("/api/products", productsRoute);
app.use("/api/cart", cartRoute);
app.use("/api/user", userRoute);

app.use("/", (req, res) => {
    res.send("Shoppify API Ok.");
});
//
app.use("*", notFound);
app.use(errorHandler);

module.exports = app;
