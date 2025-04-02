const User = require("../model/user.model");
const jsonwebtoken = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const { verifyPassword, hashPassword, generateToken } = require("../utils/authUtils");
const ApiResponse = require("../utils/ApiResponse");
const { loginAttemptsCounter, registerCounter,failedLoginCounter,failedRegisterCounter,totalSuccessfulLogins,totalFailedLogins, totalSuccessfulRegistrations,totalFailedRegistrations } = require("../metrics"); // Import from metrics.js
const winston = require("winston");

// Configure Winston Logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "logs/app.log" }),
    ],
});

/**
 * Login User
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    logger.info(`Login attempt for email: ${email}`);

    try {
        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            loginAttemptsCounter.labels("failure",email).inc();
            failedLoginCounter.labels(email).inc();
            totalFailedLogins.inc();
            logger.warn(`Failed login attempt - Email: ${email} not found.`);
            throw new ApiError(400, "Invalid Credentials.");
        }

        const validPassword = await verifyPassword(password, foundUser.password);
        if (!validPassword) {
            loginAttemptsCounter.labels("failure",email).inc();
            failedLoginCounter.labels(email).inc();
            totalFailedLogins.inc();
            logger.warn(`Failed login attempt - Invalid password for ${email}`);
            throw new ApiError(403, "Invalid Credentials.");
        }

        foundUser.password = undefined;
        foundUser.__v = undefined;

        const payload = {
            _id: foundUser._id,
            email: foundUser.email,
            username: foundUser.username,
        };
        const token = generateToken(payload);

        loginAttemptsCounter.labels("success",email).inc();
        totalSuccessfulLogins.inc();
        logger.info(`Successful login for email: ${email}`);

        return res.status(200).json(
            new ApiResponse(200, { user: foundUser.toObject(), token }, "Successfully logged in")
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Register User
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
exports.registerUser = async (req, res, next) => {
    const { username, email, password } = req.body;
    logger.info(`New user registration attempt: ${email}`);

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            registerCounter.labels("failure",email).inc();
            failedRegisterCounter.labels(email).inc();
            totalFailedRegistrations.inc();
            logger.warn(`Registration failed - User already exists: ${email}`);
            throw new ApiError(400, "User already exists");
        }

        const hashedPassword = hashPassword(password);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        registerCounter.labels("success",email).inc();
        totalSuccessfulRegistrations.inc(); 
        logger.info(`User registered successfully: ${email}`);

        return res.status(200).send(new ApiResponse(200, {}, "Successfully registered"));
    } catch (error) {
        next(error);
    }
};

/**
 * Get Logged In User
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
exports.loggedInUser = async (req, res, next) => {
    logger.info(`Fetching logged-in user data for: ${req.user.email}`);
    try {
        return res.status(200).json(new ApiResponse(200, { user: req.user.toObject() }));
    } catch (error) {
        next(error);
    }
};
