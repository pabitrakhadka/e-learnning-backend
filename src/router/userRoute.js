// routes/userRoutes.js
import express from 'express';
import {
    hendleGetUser, handleUserRegister, handleLoginUser, deleteUser
} from "../controllers/userController.js";
const router = express.Router();
router.get("/", hendleGetUser);
router.delete("/", deleteUser);
router.post("/", handleUserRegister);
router.post("/login", handleLoginUser);



export default router;
// export { getAllUsers, createUser, getUserById, updateUser, deleteUser }
