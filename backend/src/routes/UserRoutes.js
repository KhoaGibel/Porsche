// src/routes/userRoutes.js
import { Router } from 'express';
import {
  getProfile, updateProfile,
  saveConfig, deleteConfig,
  bookTestDrive, getTestDrives,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Tất cả routes đều yêu cầu đăng nhập
router.use(protect);

router.get('/profile',  getProfile);
router.put('/profile',  updateProfile);

router.post('/configs',            saveConfig);
router.delete('/configs/:configId', deleteConfig);

router.post('/test-drives', bookTestDrive);
router.get('/test-drives',  getTestDrives);

export default router;