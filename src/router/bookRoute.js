import { postBook, getBook, putBooks, deleteBook } from '../controllers/ebookController.js';
import express from 'express';
import { uploadPdf } from '../utils/FileUpload.js';
// import { uploadSingleImageMiddleware } from '../utils/FileUpload.js';
const router = express();

router.get('/', getBook);
router.post("/", uploadPdf, postBook);
router.put("/", uploadPdf, putBooks);
router.delete("/", deleteBook);


export default router;