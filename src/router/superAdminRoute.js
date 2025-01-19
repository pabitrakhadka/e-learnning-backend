// routes/userRoutes.js
import express from 'express';
import {
    handleLSuperAdminLogin, handleSuperAdminRegister, hendleGetSuperAdmin
} from "../controllers/superAdminController.js";
const router = express.Router();
router.get("/", hendleGetSuperAdmin);
router.post("/", handleSuperAdminRegister);
router.post("/login", handleLSuperAdminLogin);



export default router;
// export { getAllUsers, createUser, getUserById, updateUser, deleteUser }
