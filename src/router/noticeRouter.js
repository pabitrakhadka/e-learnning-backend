import { postNotice, putNotices, getNotice, deleteNotices } from '../controllers/noticeController.js';
import express from 'express';
import { uploadPdf } from '../utils/FileUpload.js';

const router = express();

router.get('/', getNotice);
router.post("/", uploadPdf, postNotice);
router.put("/", uploadPdf, putNotices);
router.delete("/", deleteNotices);


export default router;