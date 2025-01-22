// import { console } from "inspector/promises";
import prisma from "../db/db.config.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ConvertNumber } from "../utils/FileUpload.js";
import { ebookSchema } from "../validate/index.js";

// POST Category
const postBook = asyncHandler(async (req, res) => {
    try {
        console.log("req.body", req.body);
        // Handle image upload
        if (!req.file) {
            return res.status(400).json(new ApiResponse(400, null, "No PDF uploaded."));
        }

        const pdfFile = req.file;
        if (pdfFile.mimetype !== 'application/pdf') {
            return res.status(400).json(new ApiResponse(400, null, "Only PDF files are allowed."));
        }
        if (pdfFile.size > 40 * 1024 * 1024) {
            return res.status(400).json(new ApiResponse(400, null, "File size should not exceed 40MB."));
        }

        const { error, value } = ebookSchema.validate({
            ...req.body,
            pdf: pdfFile.filename,
        });
        if (error) {
            return res.status(422).json(new ApiResponse(422, null, error.details[0].message));
        }

        const { title, author, description } = value;

        const ebook = await prisma.eBook.create({
            data: {
                title, author, description, fileUrl: pdfFile.filename,
            },
        });
        return res.status(201).json(new ApiResponse(201, ebook, "Books created successfully."));

    } catch (error) {
        console.error("Error in postNews:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});
// GET Category
const getBook = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const id = ConvertNumber(req?.query?.id);

        if (id) {
            const books = await prisma.eBook.findFirst({
                where: { id: id },
            });
            if (!books) {
                return res.status(404).json(new ApiResponse(404, null, "Books are not found."));
            }
            return res.status(200).json(new ApiResponse(200, news, "Books retrieved successfully."));
        }

        const news = await prisma.eBook.findMany({
            take: limit,
            skip,
        });
        return res.status(200).json(new ApiResponse(200, news, "Books retrieved successfully."));
    } catch (error) {
        console.error("Error in Get Books:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

// PUT Category (Update)
const putBooks = asyncHandler(async (req, res) => {
    try {
        const id = ConvertNumber(req?.query?.id);

        if (!id) {
            return res.status(400).json(new ApiResponse(400, null, "Books Id  is missing."));
        }
        if (!req.body) {
            return res.status(400).json(new ApiResponse(400, null, "Request body is missing."));
        }



        // Validate the request body
        const { error, value } = newsSchema.validate(req.body);
        if (error) {
            return res.status(422).json(new ApiResponse(422, null, error.details[0].message));
        }

        // Extract validated values
        const { title, author, description } = value;

        // Get the uploaded file name or set it to null
        const pdfFIle = req.file?.filename || null;

        // Create the news record in the database
        const book = await prisma.eBook.update({
            where: {
                id: id,
            },
            data: {
                title, author, description, fileUrl: pdfFIle
            },
        });

        // Return success response
        return res.status(201).json(new ApiResponse(201, book, "Books Update successfully."));

    } catch (error) {
        console.error("Error in postCategory:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

// DELETE Category
const deleteBook = asyncHandler(async (req, res) => {
    try {
        const id = ConvertNumber(req?.query?.id);

        console.log("Book id-=", id);
        if (!id) {
            return res.status(400).json(new ApiResponse(400, null, "Books  ID is required."));
        }
        const exitId = await prisma.eBook.findFirst({
            where: {
                id: id
            }
        })
        if (!exitId) {
            return res.status(404).json(new ApiResponse(404, null, "Books not found."));
        }
        const delteContent = await prisma.eBook.delete({
            where: { id },

        });

        return res.status(200).json(new ApiResponse(200, delteContent, "Book deleted successfully."));
    } catch (error) {
        console.error("Error in DeleteBooks:", error);
        if (error.code === "P2025") {
            return res.status(404).json(new ApiResponse(404, null, "Content not found."));
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

export { postBook, getBook, putBooks, deleteBook };
