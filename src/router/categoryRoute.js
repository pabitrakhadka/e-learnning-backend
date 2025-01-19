import { postCategory, getCategory, putCategory, deleteCategory } from '../controllers/categoryController.js';
import express from 'express';
const router = express();

router.get('/', getCategory);
router.post("/", postCategory);
router.put("/", putCategory);
router.delete("/", deleteCategory);


export default router;