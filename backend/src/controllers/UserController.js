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
    // Cập nhật lại các trường nhận từ req.body cho khớp với TestDrive Schema
    const { phone, showroom, scheduledAt, cars, planId, planName, note } = req.body;

    if (!cars || !scheduledAt || !showroom) {
      return res.status(400).json({ message: 'Vui lòng chọn xe, showroom và ngày lái thử.' });
    }

    const date = new Date(scheduledAt);
    if (date < new Date()) {
      return res.status(400).json({ message: 'Ngày lái thử phải là ngày trong tương lai.' });
    }

    // Auto-generate orderNumber cho lịch lái thử
    const orderNumber = 'TD-' + Math.random().toString(16).slice(2, 8).toUpperCase();

    // Tạo document mới trong collection TestDrive
    const newTestDrive = await TestDrive.create({
      orderNumber,
      user: req.user._id,
      userName: req.user.fullName, // Lấy tên từ token đã verify
      phone,
      cars,
      showroom,
      scheduledAt: date,
      planId,
      planName,
      note,
      status: 'pending' // Mặc định trạng thái chờ duyệt
    });

    res.status(201).json({
      message: 'Đặt lịch lái thử thành công! Chúng tôi sẽ liên hệ xác nhận.',
      testDrive: newTestDrive,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/users/test-drives
// ─────────────────────────────────────────────
export const getTestDrives = async (req, res) => {
  try {
    // Query trực tiếp từ collection TestDrive thay vì chui vào User
    const myTestDrives = await TestDrive.find({ user: req.user._id })
                                        .sort({ createdAt: -1 });
    
    res.json({ testDrives: myTestDrives });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};