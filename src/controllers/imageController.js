import prisma from "../db/db.config.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ConvertNumber } from "../utils/FileUpload.js";

// POST Image
const postImage = asyncHandler(async (req, res) => {
    try {
        // Log the request object (for debugging)
        // console.log("req", req);

        // Validate uploaded file (using req.file for single file upload)
        if (!req.file) {
            return res.status(400).json(new ApiResponse(400, null, "No image uploaded."));
        }

        // Extract data from request body
        const { title, isSlider } = req.body;

        // Save image data to the database
        const imageFile = req.file.filename; // Access the filename of the uploaded image

        const images = await prisma.images.create({
            data: {
                title,
                isSlider: isSlider === "true",  // Convert the string "true"/"false" to boolean
                fileUrl: imageFile, // Save the filename in the DB
            },
        });

        // Return success response
        return res.status(201).json(new ApiResponse(201, images, "Image(s) created successfully."));
    } catch (error) {
        console.error("Error in postImage:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});


// GET Image
const getImage = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const id = req.query.id ? ConvertNumber(req.query.id) : null;

        if (id) {
            const image = await prisma.images.findFirst({ where: { id } });
            if (!image) {
                return res.status(404).json(new ApiResponse(404, null, "Image not found."));
            }
            return res.status(200).json(new ApiResponse(200, image, "Image retrieved successfully."));
        }

        const images = await prisma.images.findMany({

            take: limit,
            skip,
        });
        return res.status(200).json(new ApiResponse(200, images, "Images retrieved successfully."));
    } catch (error) {
        console.error("Error in getImage:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

// PUT Image (Update)
const putImage = asyncHandler(async (req, res) => {
    try {
        const id = ConvertNumber(req.query.id);
        if (!id) {
            return res.status(400).json(new ApiResponse(400, null, "Image ID is missing."));
        }

        const existingImage = await prisma.images.findFirst({ where: { id } });
        if (!existingImage) {
            return res.status(404).json(new ApiResponse(404, null, "Image not found."));
        }

        const uploadedFile = req.file ? req.file.filename : existingImage.file_url;
        const { title, isSlider } = req.body;

        const updatedImage = await prisma.images.update({
            where: { id },
            data: {
                title,
                isSlider: isSlider === "true",
                file_url: uploadedFile,
            },
        });

        return res.status(200).json(new ApiResponse(200, updatedImage, "Image updated successfully."));
    } catch (error) {
        console.error("Error in putImage:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

// DELETE Image
const deleteImage = asyncHandler(async (req, res) => {
    try {
        const id = ConvertNumber(req.query.id);
        if (!id) {
            return res.status(400).json(new ApiResponse(400, null, "Image ID is required."));
        }

        const existingImage = await prisma.images.findFirst({ where: { id } });
        if (!existingImage) {
            return res.status(404).json(new ApiResponse(404, null, "Image not found."));
        }

        await prisma.images.delete({ where: { id } });

        return res.status(200).json(new ApiResponse(200, null, "Image deleted successfully."));
    } catch (error) {
        console.error("Error in deleteImage:", error);
        if (error.code === "P2025") {
            return res.status(404).json(new ApiResponse(404, null, "Image not found."));
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

export { postImage, getImage, putImage, deleteImage };
