// src/controllers/authController.js
import jwt from 'jsonwebtoken';
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

    if (!user) {
      user = await User.create({
        firebaseUid,
        email,
        fullName: fullName ?? email.split('@')[0],
        avatar:   avatar ?? '',
        authProvider: provider ?? 'google',
        isVerified: true, // Google/Facebook đã verify email
      });
    } else if (!user.firebaseUid) {
      // Merge tài khoản local với Firebase
      user.firebaseUid  = firebaseUid;
      user.authProvider = provider ?? 'google';
      user.isVerified   = true;
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save({ validateBeforeSave: false });
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
// GET /api/auth/me  (protected)
// ─────────────────────────────────────────────
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ user });
};