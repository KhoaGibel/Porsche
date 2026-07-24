import TestDrive from '../models/TestDrive.js';


export const getAllTestDrives = async (req, res) => {
  try {
    const testDrives = await TestDrive.find().sort({ createdAt: -1 }); // Mới nhất xếp trước
    res.status(200).json(testDrives);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách lịch lái thử', error });
  }
};

// Cập nhật trạng thái
export const updateTestDriveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const updatedOrder = await TestDrive.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true } // Trả về document đã được update
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Không tìm thấy đơn lái thử' });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái', error });
  }
};