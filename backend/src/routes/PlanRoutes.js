import express from 'express';
import { getPublicPlans } from '../controllers/PlanController.js';

const router = express.Router();

// Lấy danh sách gói (chỉ những gói Đang mở bán)
router.get('/', getPublicPlans);

export default router;
