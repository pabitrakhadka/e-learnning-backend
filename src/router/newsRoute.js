import { postNews, getNews, putNews, deleteNews } from '../controllers/newsController.js';
import express from 'express';
import { uploadSingleImageMiddleware } from '../utils/FileUpload.js';
const router = express();

router.get('/', getNews);
router.post("/", uploadSingleImageMiddleware, postNews);
router.put("/", uploadSingleImageMiddleware, putNews);
router.delete("/", deleteNews);


export default router;