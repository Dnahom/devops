require("dotenv").config({ path: "./config/.env" });
const app = require("./src/app");
const connectDB = require("./src/config/database");
const port = process.env.PORT || 3500;

// Start the application
const start = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

start();
