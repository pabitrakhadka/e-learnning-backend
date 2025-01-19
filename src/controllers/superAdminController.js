// controllers/userController.js
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { hashPassword, verifyPassword } from "../utils/hashPassword.js";
import { registerSchema, loginSchema } from "../validate/index.js";
import prisma from '../db/db.config.js';
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import setAuthCookies from "../utils/SetCookies.js";

const handleSuperAdminRegister = asyncHandler(async (req, res) => {
    try {
        const code = req?.query?.code;

        if (!code === process.env.REGISTER_CODE) {
            return res.status(401).json({ status: false, message: "Unauthorized Access." });
        }
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
            return res.status(409).json({ status: false, message: "SuperAdmin already exists!" }); // 409 for conflict (duplicate user)
        }

        const hashedPassword = await hashPassword(password);
        const newAdmin = await prisma.admin.create({
            data: { name, email, address, role: 'superadmin', password: hashedPassword },
        });
        console.log("success logfin code work");

        return res.status(201).json({
            status: true,
            message: "SuperAdmin registered successfully",
            admin: {
                id: newAdmin.id,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role,
            }
        }); // 201 for successful resource creation
    } catch (error) {
        console.error("Error in Register Post Request:", error);
        return res.status(500).json({ status: false, message: "Internal server error" }); // 500 for server errors
    }
});

const hendleGetSuperAdmin = asyncHandler(async (req, res) => {
    try {
        const limit = parseInt(req?.query?.limit) || 5;
        const page = parseInt(req?.query?.page) || 1;

        if (limit <= 0 || page <= 0) {
            return res.status(400).json(new ApiResponse(400, null, "Invalid limit or page value!"));
        }

        const skip = (page - 1) * limit;

        const admins = await prisma.admin.findMany({
            take: limit,
            skip: skip,
            where: {
                role: 'superadmin',
                isActive: true
            },

        });

        if (!newAdmin || newAdmin.length === 0) {
            return res.status(404).json(new ApiResponse(404, null, "No SuperAdmin found!"));
        }

        return res.status(200).json(new ApiResponse(200, admins, "Admins retrieved successfully."));
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal server error."));
    }
});

const handleLSuperAdminLogin = asyncHandler(async (req, res) => {
    const code = req?.query?.code;

    if (!code === process.env.REGISTER_CODE) {
        return res.status(401).json({ status: false, message: "Unauthorized Access." });
    }

    if (!req.body) {
        return res.status(400).json(new ApiResponse(400, "Request body is missing."));
    }

    // Validate input using a predefined schema
    const { error, value } = loginSchema.validate(req.body);
    if (error) {

        return res.status(400).json(new ApiResponse(400, error.details[0].message));
    }

    const { email, password } = value;

    const MAX_ATTEMPTS = 5;
    const BLOCK_DURATION_HOURS = 24;

    // Fetch login attempt record
    let loginRecord = await prisma.login_Attempt.findUnique({ where: { email } });
    console.log("login attempts", loginRecord);
    if (loginRecord) {
        console.log('id login record', loginRecord)
        // Check if the user is blocked
        if (loginRecord.blocked_until && new Date(loginRecord.blocked_until) > new Date()) {
            return res.status(403).json(
                new ApiResponse(403, null, `Too many login attempts. Try again after ${new Date(loginRecord.blocked_until).toLocaleString()}.`)
            );
        }

        // Reset attempts if the last attempt was on a different day
        if (new Date(loginRecord.last_attempt).toDateString() !== new Date().toDateString()) {
            await prisma.login_Attempt.update({
                where: { email },
                data: { attempt: 0, last_attempt: new Date() },
            });
            loginRecord.attempt = 0;
        }
    }

    // Verify user existence
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
        return res.status(404).json(new ApiResponse(404, null, "SuperAdmin not found!"));
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, admin.password);
    if (!isPasswordValid) {
        // Handle invalid password attempts
        if (loginRecord) {
            const newAttempts = loginRecord.attempt + 1;

            if (newAttempts >= MAX_ATTEMPTS) {
                const blockUntil = new Date();
                blockUntil.setHours(blockUntil.getHours() + BLOCK_DURATION_HOURS);

                await prisma.login_Attempt.update({
                    where: { email },
                    data: { attempt: newAttempts, blocked_until: blockUntil, last_attempt: new Date() },
                });

                return res.status(403).json(new ApiResponse(403, null, `Too many login attempts. You are blocked until ${blockUntil.toLocaleString()}.`));
            }

            await prisma.login_Attempt.update({
                where: { email },
                data: { attempt: newAttempts, last_attempt: new Date() },
            });

            return res.status(401).json(new ApiResponse(401, null, `Invalid credentials. Attempt ${newAttempts} of ${MAX_ATTEMPTS}.`));
        } else {
            // Create a new login attempt record
            await prisma.login_Attempt.create({
                data: {
                    email,
                    attempt: 1,
                    last_attempt: new Date(),
                },
            });

            return res.status(401).json(new ApiResponse(401, null, "Invalid credentials. Attempt 1 of 5."));
        }
    }

    // Successful login
    if (loginRecord) {
        await prisma.login_Attempt.delete({ where: { email } });
    }

    const accessToken = generateAccessToken({ id: admin.id, email: admin.email });
    const refreshToken = generateRefreshToken({ id: admin.id, email: admin.email });

    // Update user's refresh token
    await prisma.admin.update({
        where: { id: admin.id },
        data: { token: refreshToken },
    });

    // Set cookies or send tokens
    await setAuthCookies(res, accessToken, refreshToken);
    console.log("success full dkjfkldslfjldjf dklj ")
    const data = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        accessToken: accessToken,
        refreshToken: refreshToken,
    };
    return res.status(200).json(new ApiResponse(200, data, "Login Successful"));

});




export { handleLSuperAdminLogin, handleSuperAdminRegister, hendleGetSuperAdmin }
