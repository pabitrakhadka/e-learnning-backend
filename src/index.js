import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv'; // For environment variables
import cors from 'cors'; // For Cross-Origin Resource Sharing
import helmet from 'helmet'; // For security headers
import morgan from 'morgan'; // For logging
import rateLimit from 'express-rate-limit'; // For rate limiting
import path from 'path';
import { fileURLToPath } from 'url';


// Import routes
import userRoutes from './router/userRoute.js';
import contactRoutes from './router/contactRoute.js';
import authRoute from './router/authRoute.js';
import superAdminRoute from "./router/superAdminRoute.js";
import adminRoute from './router/adminRoute.js';
import ApiError from './utils/ApiError.js';
import newsRoute from './router/newsRoute.js';
import categoryRoute from './router/categoryRoute.js';
import imageRoute from './router/imageRoute.js';
import ebook from './router/bookRoute.js';
import notice from './router/noticeRouter.js';

// Load environment variables
dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 3001;
// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['*']; // Allow multiple origins
const corsOptions = {
    origin: (origin, callback) => {

        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
            console.log("Allows Origin=", allowedOrigins);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies and authorization headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};
app.use(cors(corsOptions));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
const staticPath = path.join(__dirname, "../public");
console.log("Serving static files from:", staticPath);
app.use('/public', express.static(staticPath));

// app.use(express.static(path.join(__dirname, '..', '..', 'public')));


// app.use('/public', cors(), express.static(path.join(__dirname, "../public")));

console.log("PUblic image directories=", path.join(__dirname, "../public/upload"));


// CORS configuration for static files
app.use('/public', cors(corsOptions), express.static(path.join(__dirname, "../public/upload")));

// Middleware
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(helmet()); // Security headers
app.use(morgan('combined')); // Log requests

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again later."
});
app.use(limiter); // Apply rate limiting to all routes



// Routes
app.use("/api/v1/user", userRoutes); // User routes
app.use("/api/v1/contact", contactRoutes); // Contact routes
app.use('/api/v1/auth', authRoute); // Authentication routes
app.use("/api/v1/admin", adminRoute); // Admin routes
app.use("/api/v1/superadmin", superAdminRoute); // Super admin routes
app.use("/api/v1/category", categoryRoute)
app.use("/api/v1/news", newsRoute)
app.use("/api/v1/image", imageRoute)
app.use("/api/v1/notice", notice);
app.use("/api/v1/ebook", ebook);


// Default route
app.get("/", (req, res) => {
    res.send("Welcome to the User API");
});


// Centralized error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message,
            errors: err.errors || null,
        });
    }

    console.error("Unhandled Error: ", err.stack || err.message);
    return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
