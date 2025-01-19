import asyncHandler from "../utils/asyncHandler.js";
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { contactSchema } from "../validate/index.js";
import prisma from "../db/db.config.js";
import handleValidationError from "../utils/ValidationError.js";

import handleMissingBodyError from "../utils/misingBody.js";
import { ConvertNumber } from "../utils/FileUpload.js";
// Helper function to handle validation errors


// Helper function to handle missing body error


// POST Contact - Create new contact record
const postContact = asyncHandler(async (req, res) => {
    if (!req.body) {
        // If request body is missing
        throw handleMissingBodyError();
    }

    // Validate the request body against the contactSchema
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
        // Return validation error if any
        throw handleValidationError(error);
    }

    const { name, email, subject, message } = value;

    try {
        // Create a new contact record in the database
        const newContact = await prisma.contact.create({
            data: {
                name,
                email,
                subject,
                message
            }
        });

        // Return success response
        return res.status(201).json(new ApiResponse(201, newContact, "Thanks for your feedback"));
    } catch (err) {
        // If an unexpected error occurs
        throw new ApiError(500, "Internal Server Error", err.message);
    }
});

// GET Contact - Retrieve all contact records
const getContact = asyncHandler(async (req, res) => {
    try {
        const page = req?.query?.page || 1;
        const limit = req?.query?.limit || 10;
        const skip = (page - 1) * limit;
        const data = await prisma.contact.findMany({
            skip: skip,
            take: limit
        });
        return res.status(200).json(new ApiResponse(200, data, "User contact data fetched successfully"));
    } catch (err) {
        // Handle any error that may occur while fetching contacts
        throw new ApiError(500, "Internal Server Error", err.message);
    }
});

const deleteContact = asyncHandler(async (req, res) => {
    try {

        const id = ConvertNumber(req?.query?.id);
        if (!id) {
            return res.status(400).json(new ApiResponse(400, null, "Contact ID is required."));
        }
        const exitId = await prisma.contact.findFirst({
            where: {
                id: id
            }
        })
        if (!exitId) {
            return res.status(404).json(new ApiResponse(404, null, "Contact not found."));
        }
        const delteContact = await prisma.contact.delete({
            where: { id }
        });

        return res.status(200).json(new ApiResponse(200, delteContact, "Contact deleted successfully."));
    } catch (error) {
        console.error("Error in deleteContenet:", error);
        if (error.code === "P2025") {
            return res.status(404).json(new ApiResponse(404, null, "Contact not found."));
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error."));
    }
});


export { postContact, getContact, deleteContact };
