import express from "express";
import { postImage, getImage, putImage, deleteImage } from "../controllers/imageController.js";
import { uploadSingleImageMiddleware } from "../utils/FileUpload.js";

const router = express.Router();

router.get("/", getImage);
router.post("/", uploadSingleImageMiddleware, postImage);
router.put("/", uploadSingleImageMiddleware, putImage);
router.delete("/", deleteImage);

export default router;
