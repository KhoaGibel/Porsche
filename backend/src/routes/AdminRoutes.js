import express from 'express';
import { 
  getAllTestDrives, 
  updateTestDriveStatus,
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  updateUserRole
} from '../controllers/AdminController.js';
import { protect, adminOnly } from '../middleware/auth.js'; 
import {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan
} from '../controllers/PlanController.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id', updateUserRole);
router.get('/orders', getAllOrders);
router.get('/test-drives', getAllTestDrives);
router.patch('/test-drives/:id/status', updateTestDriveStatus);

// ── QUẢN LÝ GÓI LÁI THỬ (PLANS) ──
router.get('/plans', getAllPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

export default router;