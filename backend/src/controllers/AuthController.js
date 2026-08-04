// src/controllers/AuthController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// ── Helper tạo JWT ──
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  });

// ── Helper response user ──
const userResponse = (user, token) => ({
  token,
  user: {
    id:            user._id,
    fullName:      user.fullName,
    email:         user.email,
    avatar:        user.avatar,
    role:          user.role,
    isVerified:    user.isVerified,
    favoriteModel: user.favoriteModel,
    savedConfigs:  user.savedConfigs,
    testDrives:    user.testDrives,
  },
});

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email này đã được đăng ký.' });
    }

    const user = await User.create({ fullName, email, password, authProvider: 'local' });
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Đăng ký thành công!',
      ...userResponse(user, token),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email đã tồn tại.' });
    }
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    if (user.authProvider !== 'local') {
      return res.status(400).json({
        message: `Tài khoản này đăng nhập bằng ${user.authProvider}. Vui lòng dùng phương thức đó.`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json(userResponse(user, token));
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/firebase-sync
// Đồng bộ user từ Firebase (Google/Facebook) vào MongoDB
// ─────────────────────────────────────────────
export const firebaseSync = async (req, res) => {
  try {
    const { firebaseUid, email, fullName, avatar, provider } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ message: 'Thiếu thông tin Firebase.' });
    }

    // Tìm hoặc tạo user
    let user = await User.findOne({ $or: [{ firebaseUid }, { email }] });

    if (user) {
      // Cập nhật thông tin mới nhất từ Firebase nếu thay đổi
      let changed = false;
      if (fullName && user.fullName !== fullName) { user.fullName = fullName; changed = true; }
      if (avatar  && user.avatar  !== avatar)    { user.avatar  = avatar;    changed = true; }
      if (!user.firebaseUid) { user.firebaseUid = firebaseUid; changed = true; }
      if (changed) await user.save({ validateBeforeSave: false });
    } else {
      user = await User.create({
        firebaseUid,
        email,
        fullName: fullName || email.split('@')[0],
        avatar:   avatar || '',
        authProvider: provider || 'google',
        isVerified: true,
      });
    }

    const token = generateToken(user._id);
    res.json(userResponse(user, token));
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/auth/me  (protected)
// ─────────────────────────────────────────────
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ user });
};

// ─────────────────────────────────────────────
// POST /api/auth/admin-login
// Tạo / lấy tài khoản Admin thật trong MongoDB và trả JWT thật
// Dùng để đăng nhập Admin qua backend thuần, không cần Firebase
// ─────────────────────────────────────────────
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Chỉ cho phép email có đuôi @porsche.local hoặc được đánh dấu admin
    // Tìm user trong MongoDB
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Tài khoản này không có quyền Admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json(userResponse(user, token));
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/admin-setup
// Chỉ chạy 1 lần để tạo tài khoản Admin đầu tiên trong MongoDB
// Bảo vệ bằng ADMIN_SETUP_SECRET trong .env
// ─────────────────────────────────────────────
export const adminSetup = async (req, res) => {
  try {
    const { setupSecret, email, password, fullName } = req.body;
    const SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || 'porsche_setup_2024_secret';

    if (setupSecret !== SETUP_SECRET) {
      return res.status(401).json({ message: 'Setup secret không hợp lệ.' });
    }

    // Kiểm tra admin đã tồn tại chưa
    const existing = await User.findOne({ role: 'admin', email });
    if (existing) {
      // Reset password nếu admin muốn đổi
      existing.password = password;
      await existing.save();
      const token = generateToken(existing._id);
      return res.json({ 
        message: 'Admin đã tồn tại — đã cập nhật mật khẩu thành công.',
        ...userResponse(existing, token)
      });
    }

    const adminUser = await User.create({
      fullName: fullName || 'Super Admin',
      email: email || 'admin@porsche.vn',
      password,
      role: 'admin',
      authProvider: 'local',
      isVerified: true,
    });

    const token = generateToken(adminUser._id);
    res.status(201).json({
      message: '✅ Tài khoản Admin đã được tạo thành công!',
      ...userResponse(adminUser, token),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email đã được sử dụng.' });
    }
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};