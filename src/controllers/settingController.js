// controllers/userController.js
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { hashPassword, verifyPassword } from "../utils/hashPassword.js";
import { registerSchema, loginSchema } from "../validate/index.js";
import prisma from '../db/db.config.js';
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import setAuthCookies from "../utils/SetCookies.js";

const postSetting = asyncHandler(async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ status: false, message: "Request body is missing." }); // 400 for bad requests
        }

        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(422).json({ status: false, message: error.details[0].message }); // 422 for validation errors
        }

        const { name, email, address, password } = value;

        const existingAdmin = await prisma.admin.findUnique({ where: { email } });
        if (existingAdmin) {
            return res.status(409).json({ status: false, message: "Admin already exists!" }); // 409 for conflict (duplicate user)
        }

        const hashedPassword = await hashPassword(password);
        const adminrole = "admin";
        const newAdmin = await prisma.admin.create({
            data: { name, email, address, role: adminrole, password: hashedPassword },
        });

    } catch (error) {

    }
})