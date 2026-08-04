// src/routes/authRoutes.js
import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, firebaseSync, getMe, adminLogin, adminSetup } from '../controllers/AuthController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.post('/register',
  [
    body('fullName').trim().isLength({ min: 2 }).withMessage('Họ tên phải có ít nhất 2 ký tự'),
    body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự'),
  ],
  validateRequest,
  register
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
    body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu'),
  ],
  validateRequest,
  login
);

// Đăng nhập Admin thật qua backend (email + password trong MongoDB)
router.post('/admin-login', adminLogin);

// Khởi tạo tài khoản Admin lần đầu (bảo vệ bằng setupSecret)
router.post('/admin-setup', adminSetup);

// Đồng bộ user Firebase (Google/Facebook) vào MongoDB
router.post('/firebase-sync', firebaseSync);

// Lấy thông tin user hiện tại
router.get('/me', protect, getMe);

export default router;