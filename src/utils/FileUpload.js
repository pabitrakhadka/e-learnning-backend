import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDirectory = path.join(__dirname, '..', '..', 'public');
const imageUploadDirectory = path.join(publicDirectory, 'upload', 'images');
const pdfUploadDirectory = path.join(__dirname, '..', 'upload', 'pdf');



// Ensure both directories exist
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

ensureDirectoryExists(imageUploadDirectory);
ensureDirectoryExists(pdfUploadDirectory);

// Multer storage configuration for images
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageUploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

// Multer storage configuration for PDFs
const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pdfUploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

// Filter to validate image types (only for image files)
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer for single image upload
const uploadSingleImage = multer({
    storage: imageStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
    fileFilter: imageFileFilter, // Only allow image files
}).single('image'); // Accept a single image file, field name 'image'

// Middleware for single image upload
const uploadSingleImageMiddleware = (req, res, next) => {
    uploadSingleImage(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Handle Multer-specific errors..
            console.log("Error", err);
            return res.status(400).json({ error: err.message });
        } else if (err) {
            console.log("Error22", err);

            // Handle other errors
            return res.status(400).json({ error: err.message });
        }
        console.log("image directories=", imageUploadDirectory);
        next();
    });
};

// Utility function to convert a value to a number
function ConvertNumber(value) {
    if (typeof value === "number") {
        return value; // Return the number as is
    }

    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
}

// Exporting middleware
export { uploadSingleImageMiddleware, ConvertNumber };
