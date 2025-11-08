import {config} from "dotenv";
config();
console.log("Environment Variables Loaded:", {
    MONGO_URI: process.env.MONGO_URI ? "Loaded" : "Not Loaded",
    PORT: process.env.PORT ? "Loaded" : "Not Loaded",
    JWT_SECRET: process.env.JWT_SECRET ? "Loaded" : "Not Loaded",
    NODE_ENV: process.env.NODE_ENV || "development"
});