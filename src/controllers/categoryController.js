import prisma from "../db/db.config.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ConvertNumber } from "../utils/FileUpload.js";
import { categorySchema } from "../validate/index.js";

// POST Category
const postCategory = asyncHandler(async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json(new ApiResponse(400, null, "Request body is missing."));
        }
        console.log("reqbody", req.body);
        const { error, value } = categorySchema.validate(req.body);
        if (error) {
            return res.status(422).json(new ApiResponse(422, null, error.details[0].message));
        }
        const { name, description } = value;
        const newCategory = await prisma.categories.create({
            data: { name, description },
        });
        return res.status(201).json(new ApiResponse(201, newCategory, "Category created successfully."));
    } catch (error) {
        console.error("Error in postCategory:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

// GET Category
const getCategory = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const id = req.query.id;

        if (id) {
            const category = await prisma.categories.findFirst({
                where: { id: parseInt(id), isActive: true },
            });
            if (!category) {
                return res.status(404).json(new ApiResponse(404, null, "Category not found."));
            }
            return res.status(200).json(new ApiResponse(200, category, "Category retrieved successfully."));
        }

        const categories = await prisma.categories.findMany({
            where: { isActive: true },
            take: limit,
            skip,
        });
        return res.status(200).json(new ApiResponse(200, categories, "Categories retrieved successfully."));
    } catch (error) {
        console.error("Error in getCategory:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

// PUT Category (Update)
const putCategory = asyncHandler(async (req, res) => {
    try {
        const id = ConvertNumber(req.query.id);
        if (!id) {
            return res.status(400).json(new ApiResponse(400, null, "Category ID is required."));
        }

        const { error, value } = categorySchema.validate(req.body);
        if (error) {
            return res.status(422).json(new ApiResponse(422, null, error.details[0].message));
        }

        const { name, description } = value;
        const updatedCategory = await prisma.categories.update({
            where: { id: parseInt(id) },
            data: { name, description },
        });

        return res.status(200).json(new ApiResponse(200, updatedCategory, "Category updated successfully."));
    } catch (error) {
        console.error("Error in putCategory:", error);
        if (error.code === "P2025") {
            return res.status(404).json(new ApiResponse(404, null, "Category not found."));
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

// DELETE Category
const deleteCategory = asyncHandler(async (req, res) => {
    try {
        const id = ConvertNumber(req.query.id);
        if (!id) {
            return res.status(400).json(new ApiResponse(400, null, "Category ID is required."));
        }

        const deletedCategory = await prisma.categories.update({
            where: { id: parseInt(id) },
            data: { isActive: false },
        });

        return res.status(200).json(new ApiResponse(200, deletedCategory, "Category deleted successfully."));
    } catch (error) {
        console.error("Error in deleteCategory:", error);
        if (error.code === "P2025") {
            return res.status(404).json(new ApiResponse(404, null, "Category not found."));
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

export { postCategory, getCategory, putCategory, deleteCategory };
