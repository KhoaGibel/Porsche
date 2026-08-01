import express from 'express';
import { 
  getAllTestDrives, 
  updateTestDriveStatus,
  getDashboardStats,
  getAllUsers,
  getAllOrders
} from '../controllers/AdminController.js';
import { protect, adminOnly } from '../middleware/auth.js'; 

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/orders', getAllOrders);
router.get('/test-drives', getAllTestDrives);
router.patch('/test-drives/:id/status', updateTestDriveStatus);

export default router;