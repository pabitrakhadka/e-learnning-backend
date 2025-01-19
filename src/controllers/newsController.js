// import { console } from "inspector/promises";
import prisma from "../db/db.config.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ConvertNumber } from "../utils/FileUpload.js";
import { newsSchema } from "../validate/index.js";

// POST Category
const postNews = asyncHandler(async (req, res) => {
    try {
        console.log("req.body", req.body);
        // Handle image upload
        if (!req.file) {
            return res.status(400).json(new ApiResponse(400, null, "No image uploaded."));
        }
        // Check if file was uploaded
        const imageFile = req.file ? req.file.filename : null;
        // console.log("Uploaded image file:", imageFile);

        // Continue processing the request
        const { error, value } = newsSchema.validate(req.body);
        if (error) {
            return res.status(422).json(new ApiResponse(422, null, error.details[0].message));
        }

        const { title, description, category_id, created_by } = value;

        const news = await prisma.content.create({
            data: {
                title,
                description,
                category_id,
                created_by,
                file_url: imageFile, // Save the uploaded file's name
            },
        });


        const logEntry = {
            adminId: 1,
            action: 'Add News',
            entity_type: 'News',
            entity_id: news.id,              // ID of the affected entity
            ip_address: req.ip
        }
        return res.status(201).json(new ApiResponse(201, news, "News created successfully."));




    } catch (error) {
        console.error("Error in postNews:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});
// GET Category
const getNews = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const id = req?.query?.id;

        if (id) {
            const news = await prisma.content.findFirst({
                where: { id: parseInt(id), isActive: true },
            });
            if (!news) {
                return res.status(404).json(new ApiResponse(404, null, "Content not found."));
            }
            return res.status(200).json(new ApiResponse(200, news, "Content retrieved successfully."));
        }

        const news = await prisma.content.findMany({
            where: { isActive: true },
            take: limit,
            skip,
        });
        return res.status(200).json(new ApiResponse(200, news, "Categories retrieved successfully."));
    } catch (error) {
        console.error("Error in getCategory:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

// PUT Category (Update)
const putNews = asyncHandler(async (req, res) => {
    try {
        const id = ConvertNumber(req?.query?.id);
        console.log("UPdate Id data", id);
        console.log("reqbody=", req.body);
        if (!id) {
            return res.status(400).json(new ApiResponse(400, null, "Contentet Id  is missing."));
        }
        if (!req.body) {
            return res.status(400).json(new ApiResponse(400, null, "Request body is missing."));
        }

        // Handle image upload
        imageUpload(req, res, async (err) => {
            if (err) {
                console.error("File upload error:", err);
                return res.status(500).json(new ApiResponse(500, null, "Error uploading image."));
            }

            // Validate the request body
            const { error, value } = newsSchema.validate(req.body);
            if (error) {
                return res.status(422).json(new ApiResponse(422, null, error.details[0].message));
            }

            // Extract validated values
            const { title, description, category_id, created_by, update_by } = value;

            // Get the uploaded file name or set it to null
            const imageName = req.file?.filename || null;

            // Create the news record in the database
            const news = await prisma.content.update({
                where: {
                    id: id,
                },
                data: {
                    title,
                    description,
                    category_id,
                    created_by,
                    updated_by: update_by,
                    file_url: imageName,
                },
            });

            // Return success response
            return res.status(201).json(new ApiResponse(201, news, "Category created successfully."));
        });
    } catch (error) {
        console.error("Error in postCategory:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

// DELETE Category
const deleteNews = asyncHandler(async (req, res) => {
    try {

        const id = ConvertNumber(req?.query?.id);
        if (!id) {
            return res.status(400).json(new ApiResponse(400, null, "Content ID is required."));
        }
        const exitId = await prisma.content.findFirst({
            where: {
                id: id
            }
        })
        if (!exitId) {
            return res.status(404).json(new ApiResponse(404, null, "Content not found."));
        }
        const delteContent = await prisma.content.update({
            where: { id },
            data: { isActive: false },
        });

        return res.status(200).json(new ApiResponse(200, delteContent, "Content deleted successfully."));
    } catch (error) {
        console.error("Error in deleteContenet:", error);
        if (error.code === "P2025") {
            return res.status(404).json(new ApiResponse(404, null, "Content not found."));
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

export { postNews, getNews, putNews, deleteNews };
