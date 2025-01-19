import { serialize } from "cookie";
import prisma from "@/db/db.config";
import { generateAccessToken, verifyAccessToken, verifyRefreshToken } from "./token";

// Function to validate user
const isUserValid = async (req, res) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers?.authorization;
        const refreshToken = req.cookies.refreshToken;

        console.log("Auth header =", authHeader);
        console.log("Refresh Token =", refreshToken);

        // Check if the Authorization header is present and properly formatted
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return { valid: false, message: "Token not found or improperly formatted" }; // Return error message
        }

        // Extract the token (removing the "Bearer " prefix)
        const token = authHeader.split(" ")[1];
        console.log("Extracted token =", token);

        // If token is missing
        if (!token) {
            return { valid: false, message: "Token not found" };
        }

        // Verify the access token
        const decoded = verifyAccessToken(token);
        console.log("Decoded AccessToken =", decoded);

        // If access token is valid, return user data
        if (decoded && decoded.status) {
            console.log("Access token is valid");
            return { valid: true, user: decoded.data };  // Return valid user data
        }

        // If access token is expired or invalid, check for a refresh token
        if (!refreshToken) {
            return { valid: false, message: "Refresh token not provided" }; // Refresh token is missing
        }

        // Check if the refreshToken exists in the database
        const storedToken = await getRefreshTokenFromDB(refreshToken);
        console.log("Stored refresh token =", storedToken);

        if (!storedToken) {
            return { valid: false, message: "Invalid refresh token" }; // Refresh token not found or invalid
        }

        // Verify the refresh token
        const refreshTokenValid = verifyRefreshToken(refreshToken);
        console.log("Refresh token verification status =", refreshTokenValid);

        if (!refreshTokenValid.status) {
            return { valid: false, message: "Invalid or expired refresh token" };
        }

        // Generate a new access token using the stored token information
        const newAccessToken = generateAccessToken(storedToken);
        console.log("New access token =", newAccessToken);

        // Set the new access token in the response cookie
        res.setHeader('Set-Cookie', [
            serialize('accessToken', newAccessToken, {
                httpOnly: true,   // Can't be accessed by JavaScript
                secure: process.env.NODE_ENV === 'production', // Only over HTTPS
                sameSite: 'Lax',  // Protect against CSRF
                maxAge: 10 * 60,     // Token expires in 10 minutes
                path: '/',        // Available across all routes
            })
        ]);

        return { valid: true, user: storedToken, newAccessToken };  // Return new access token and user object
    } catch (error) {
        console.error("Error in isUserValid:", error);
        return { valid: false, message: "An error occurred while validating token" };
    }
};

// Function to get refresh token from the database
const getRefreshTokenFromDB = async (refreshToken) => {
    try {
        console.log("Checking refresh token in the database:", refreshToken);
        // Query the database using Prisma
        const result = await prisma.user.findFirst({
            where: {
                token: refreshToken
            },
            select: {
                id: true,
                email: true,
                token: true // Return the token field from the database
            }
        });

        return result;
    } catch (error) {
        console.error("Error querying the database for refresh token:", error);
        throw new Error("Database error");
    }
};

export default isUserValid;
