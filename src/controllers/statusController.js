import prisma from '../db/db.config.js';
import asyncHandler from "../utils/asyncHandler.js";
import { generateAccessToken, verifyAccessToken, verifyRefreshToken } from "../utils/token.js";
import { serialize } from "cookie";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import cookie from 'cookie';

// Function to handle token verification and user fetching
const handleTokenAndUser = async (req, res, roleModel) => {

    const cookies = cookie.parse(req.headers.cookie || '');
    // console.log("req.body", req);
    // console.log("cookes", cookies)

    // console.log(cookies);
    const { accessToken, refreshToken } = cookies;

    console.log("accessToken=", accessToken);
    console.log("RefreshToken=", refreshToken);

    // No accessToken provided
    if (!accessToken) {
        // No refreshToken provided either
        if (!refreshToken) {
            return res.status(401).json(new ApiResponse(401, null, "No tokens provided. Please log in again."));
        }

        try {
            // Verify the refresh token
            const decoded = verifyRefreshToken(refreshToken);
            if (decoded?.status) {
                const newAccessToken = generateAccessToken(decoded.data);
                res.setHeader("Set-Cookie", serialize("accessToken", newAccessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: 2 * 24 * 60 * 60,
                    path: "/",
                }));

                // Fetch user details based on role model
                const user = await prisma[roleModel].findFirst({
                    where: { id: decoded.data.id },
                    select: { name: true, role: true },
                });

                const responseUser = { ...decoded.data, ...user };
                return res.status(200).json(new ApiResponse(200, responseUser, "Access token refreshed successfully."));
            } else {
                return res.status(401).json(new ApiResponse(401, null, "Invalid refresh token. Please log in again."));
            }
        } catch (error) {
            console.error("Refresh token verification failed:", error);
            return res.status(401).json(new ApiResponse(401, null, "Error verifying refresh token. Please log in again."));
        }
    }

    // Validate access token if available
    try {
        const decoded = verifyAccessToken(accessToken);
        if (decoded?.status) {
            const user = await prisma[roleModel].findFirst({
                where: { id: decoded.data.id },
                select: { name: true, role: true },
            });

            const responseUser = { ...decoded.data, ...user };
            return res.status(200).json(new ApiResponse(200, responseUser, "Access token validated successfully."));
        } else {
            return res.status(401).json(new ApiResponse(401, null, "Invalid access token. Please log in again."));
        }
    } catch (error) {
        console.error("Access token verification failed:", error);
        return res.status(401).json(new ApiResponse(401, null, "Error verifying access token. Please log in again."));
    }
};

const checkAuth = asyncHandler(async (req, res) => {

    const role = req?.query?.role;
    let roleModel = '';

    // Determine role model based on role query
    if (role === "user") {
        roleModel = 'user';
    } else if (role === "admin" || role === "superAdmin") {
        roleModel = 'admin';
    } else {
        return res.status(400).json(new ApiError(400, "Invalid role provided"));
    }

    // Handle token and user validation for each role
    return handleTokenAndUser(req, res, roleModel);

});

export default checkAuth;