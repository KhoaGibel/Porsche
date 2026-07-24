import express from 'express';
import { getAllTestDrives, updateTestDriveStatus } from '../controllers/AdminController.js';
import { protect, adminOnly } from '../middleware/auth.js'; 

const router = express.Router();


router.use(protect, adminOnly);

router.get('/test-drives', getAllTestDrives);

router.patch('/test-drives/:id/status', updateTestDriveStatus);

export default router;