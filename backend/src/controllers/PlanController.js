import Plan from '../models/Plan.js';

// ── GET /api/plans (Public - chỉ lấy gói đang mở bán)
export const getPublicPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ status: 'Đang mở bán' }).sort({ createdAt: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.', error: err.message });
  }
};

// ── GET /api/admin/plans (Admin - lấy toàn bộ gói)
export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.', error: err.message });
  }
};

// ── POST /api/admin/plans (Admin - tạo gói mới)
export const createPlan = async (req, res) => {
  try {
    const newPlan = await Plan.create(req.body);
    res.status(201).json({ message: 'Tạo gói thành công', plan: newPlan });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Mã gói (planId) đã tồn tại.' });
    res.status(500).json({ message: 'Lỗi server.', error: err.message });
  }
};

// ── PUT /api/admin/plans/:id (Admin - cập nhật gói)
export const updatePlan = async (req, res) => {
  try {
    const updatedPlan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPlan) return res.status(404).json({ message: 'Không tìm thấy gói.' });
    res.json({ message: 'Cập nhật thành công', plan: updatedPlan });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.', error: err.message });
  }
};

// ── DELETE /api/admin/plans/:id (Admin - xoá gói)
export const deletePlan = async (req, res) => {
  try {
    const deletedPlan = await Plan.findByIdAndDelete(req.params.id);
    if (!deletedPlan) return res.status(404).json({ message: 'Không tìm thấy gói.' });
    res.json({ message: 'Đã xóa gói.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.', error: err.message });
  }
};
