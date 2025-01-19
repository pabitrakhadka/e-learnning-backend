import asyncHandler from "../utils/asyncHandler.js";
import prisma from '../db/db.config.js';
import { deleteAuthCookies } from "../utils/SetCookies.js";
import ApiResponse from "../utils/ApiResponse.js";
const handleLogout = asyncHandler(async (req, res) => {
    try {
        const role = req?.query?.role;
        if (role === "user") {

            const id = parseInt(req.query.id);
            if (!id) {
                return res.status(400).json(new ApiResponse(400, null, "User ID is missing"));
            }

            const user = await prisma.user.findUnique({
                where: { id: id }
            });

            if (!user) {
                return res.status(404).json(new ApiResponse(404, null, "User not found"));
            }

            await prisma.user.update({
                where: { id: id },
                data: { token: null }
            });

            await deleteAuthCookies(res);

            return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
        }
        else if (role === "admin" || role === "superadmin" || role === "superAdmin") {
            const id = parseInt(req.query.id);
            if (!id) {
                return res.status(400).json(new ApiResponse(400, null, "User ID is missing"));
            }

            const admin = await prisma.admin.findUnique({
                where: { id: id }
            });

            if (!admin) {
                return res.status(404).json(new ApiResponse(404, null, "Admin not found"));
            }

            await prisma.admin.update({
                where: { id: id },
                data: { token: null }
            });

            await deleteAuthCookies(res);

            return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
        }

    } catch (error) {
        console.error("Error in handleDeleteRequest:", error);
        return res.status(500).json(new ApiError(500, "Internal Server Error"));
    }
});

export default handleLogout;