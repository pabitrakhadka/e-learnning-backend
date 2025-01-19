import express from 'express';
import checkAuth from "../controllers/statusController.js";
import handleLogout from '../controllers/logoutController.js';
const router = express.Router()

router.get("/", checkAuth);
router.delete("/logout", handleLogout);
export default router;