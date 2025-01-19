// routes/userRoutes.js
import express from 'express';
import {
    hendleGetAdmin, handleAdminRegister, handleLoginAdmin, handleUpdateAdmin, handleDeleteAdmin
} from "../controllers/adminController.js";
const router = express.Router();
router.get("/", hendleGetAdmin);
router.post("/", handleAdminRegister);
router.put("/", handleUpdateAdmin);
router.delete("/", handleDeleteAdmin);
router.post("/login", handleLoginAdmin);



export default router;
// export { getAllUsers, createUser, getUserById, updateUser, deleteUser }
