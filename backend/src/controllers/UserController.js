// src/controllers/userController.js
import User from '../models/User.js';

// ─────────────────────────────────────────────
// GET /api/users/profile
// ─────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// ─────────────────────────────────────────────
// PUT /api/users/profile
// ─────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, favoriteModel } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phone, favoriteModel },
      { new: true, runValidators: true }
    );
    res.json({ message: 'Cập nhật thành công!', user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// ─────────────────────────────────────────────
// POST /api/users/configs  — Lưu cấu hình xe
// ─────────────────────────────────────────────
export const saveConfig = async (req, res) => {
  try {
    const { carModel, colorName, colorHex, note } = req.body;

    if (!carModel || !colorName || !colorHex) {
      return res.status(400).json({ message: 'Thiếu thông tin cấu hình xe.' });
    }

    const user = await User.findById(req.user._id);

    // Giới hạn 10 cấu hình / user
    if (user.savedConfigs.length >= 10) {
      user.savedConfigs.shift(); // xoá cấu hình cũ nhất
    }

    user.savedConfigs.push({ carModel, colorName, colorHex, note });
    await user.save();

    res.status(201).json({
      message: 'Đã lưu cấu hình xe!',
      configs: user.savedConfigs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/users/configs/:configId
// ─────────────────────────────────────────────
export const deleteConfig = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedConfigs = user.savedConfigs.filter(
      (c) => c._id.toString() !== req.params.configId
    );
    await user.save();
    res.json({ message: 'Đã xoá cấu hình.', configs: user.savedConfigs });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// ─────────────────────────────────────────────
// POST /api/users/test-drives  — Đặt lịch lái thử
// ─────────────────────────────────────────────
export const bookTestDrive = async (req, res) => {
  try {
    const { carModel, colorHex, scheduledAt, location } = req.body;

    if (!carModel || !scheduledAt) {
      return res.status(400).json({ message: 'Vui lòng chọn xe và ngày lái thử.' });
    }

    const date = new Date(scheduledAt);
    if (date < new Date()) {
      return res.status(400).json({ message: 'Ngày lái thử phải là ngày trong tương lai.' });
    }

    const user = await User.findById(req.user._id);
    user.testDrives.push({ carModel, colorHex, scheduledAt: date, location });
    await user.save();

    res.status(201).json({
      message: 'Đặt lịch lái thử thành công! Chúng tôi sẽ liên hệ xác nhận.',
      testDrives: user.testDrives,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// ─────────────────────────────────────────────
// GET /api/users/test-drives
// ─────────────────────────────────────────────
export const getTestDrives = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('testDrives');
    res.json({ testDrives: user.testDrives });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};