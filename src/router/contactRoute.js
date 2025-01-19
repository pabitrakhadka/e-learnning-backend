import express from 'express';
import { getContact, postContact, deleteContact } from '../controllers/contactConotroller.js';

const router = express.Router();

// Route for retrieving contacts
router.get("/", getContact);

// Route for posting a new contact
router.post("/", postContact);
router.delete("/", deleteContact);

export default router;
