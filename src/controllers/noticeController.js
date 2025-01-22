// import { console } from "inspector/promises";
import prisma from "../db/db.config.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ConvertNumber } from "../utils/FileUpload.js";
import { noticeSchema } from "../validate/index.js";

// POST Category
const postNotice = asyncHandler(async (req, res) => {
    try {
        const pdfFile = req.file ? req.file : null;


        // Check if a file exists and is a valid PDF
        if (pdfFile) {
            if (pdfFile.mimetype !== 'application/pdf') {
                return res.status(400).json(new ApiResponse(400, null, "Only PDF files are allowed."));
            }
            if (pdfFile.size > 40 * 1024 * 1024) {
                return res.status(400).json(new ApiResponse(400, null, "File size should not exceed 40MB."));
            }
        }

        const { error, value } = noticeSchema.validate(req.body);

        if (error) {
            return res.status(422).json(new ApiResponse(422, null, error.details[0].message));
        }

        const { title, content } = value;

        // console.log("file name=", pdfFile.filename)
        // Set the fileUrl to null if no file is uploaded
        const fileUrl = pdfFile ? pdfFile.filename : null;
        console.log('fileUrl', fileUrl)

        const notice = await prisma.notice.create({
            data: {
                title,
                content,
                fileUrl,
            },
        });

        return res.status(201).json(new ApiResponse(201, notice, "Notice created successfully."));
    } catch (error) {
        console.error("Error in PostNotice:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});
// GET Category
const getNotice = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const id = ConvertNumber(req?.query?.id);

        if (id) {
            const notice = await prisma.notice.findFirst({
                where: { id: id },
            });
            if (!notice) {
                return res.status(404).json(new ApiResponse(404, null, "Notice not found."));
            }
            return res.status(200).json(new ApiResponse(200, notice, "Notice retrieved successfully."));
        }
        const notices = await prisma.notice.findMany({
            take: limit,
            skip,
        });
        return res.status(200).json(new ApiResponse(200, notices, "Notice retrieved successfully."));
    } catch (error) {
        console.error("Error in getNotice:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

// PUT Category (Update)
const putNotices = asyncHandler(async (req, res) => {
    try {
        const id = ConvertNumber(req?.query?.id);

        if (!id) {
            return res.status(400).json(new ApiResponse(400, null, "Notices Id  is missing."));
        }
        if (!req.body) {
            return res.status(400).json(new ApiResponse(400, null, "Request body is missing."));
        }
        const pdfFile = req.file ? req.file : null;

        // Check if a file exists and is a valid PDF
        if (pdfFile) {
            if (pdfFile.mimetype !== 'application/pdf') {
                return res.status(400).json(new ApiResponse(400, null, "Only PDF files are allowed."));
            }
            if (pdfFile.size > 40 * 1024 * 1024) {
                return res.status(400).json(new ApiResponse(400, null, "File size should not exceed 40MB."));
            }
        }

        // Validate the request body
        const { error, value } = noticeSchema.validate(req.body);
        if (error) {
            return res.status(422).json(new ApiResponse(422, null, error.details[0].message));
        }

        // Extract validated values
        const { title, content, } = value;

        // Get the uploaded file name or set it to null

        const fileUrl = pdfFile ? pdfFile.fileName : null;

        // Create the news record in the database
        const notice = await prisma.notice.update({
            where: {
                id: id,
            },
            data: {
                title, content, fileUrl
            },
        });

        // Return success response
        return res.status(201).json(new ApiResponse(201, notice, "Notice are Update successfully."));

    } catch (error) {
        console.error("Error in Post Notices:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

// DELETE Category
const deleteNotices = asyncHandler(async (req, res) => {
    try {

        const id = ConvertNumber(req?.query?.id);
        if (!id) {
            return res.status(400).json(new ApiResponse(400, null, "Notices ID is required."));
        }
        const exitId = await prisma.notice.findFirst({
            where: {
                id: id
            }
        })
        if (!exitId) {
            return res.status(404).json(new ApiResponse(404, null, "Notice are not found."));
        }
        const delteContent = await prisma.notice.delete({
            where: { id },

        });

        return res.status(200).json(new ApiResponse(200, delteContent, "Notices deleted successfully."));
    } catch (error) {
        console.error("Error in deleteContenet:", error);
        if (error.code === "P2025") {
            return res.status(404).json(new ApiResponse(404, null, "Notices are not found."));
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});

export { postNotice, putNotices, getNotice, deleteNotices };
