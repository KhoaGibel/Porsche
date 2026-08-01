import User from '../models/User.js';
import { OrderModel } from '../models/orderModel.js';

// ── 1. Thống kê Dashboard ──
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const orderStats = await OrderModel.getStats();

    const stats = [
      {
        label: 'Tổng Doanh Thu',
        value: Number(orderStats.totalRevenue).toLocaleString('vi-VN') + ' ₫',
        delta: '+12%',
        icon: '💰',
        color: '#059669',
        bg: '#d1fae5',
      },
      {
        label: 'Đơn Hàng / Đặt Lịch',
        value: orderStats.totalOrders,
        delta: '+5%',
        icon: '🛒',
        color: '#2563eb',
        bg: '#dbeafe',
      },
      {
        label: 'Khách Hàng (Users)',
        value: totalUsers,
        delta: '+18%',
        icon: '👥',
        color: '#7c3aed',
        bg: '#ede9fe',
      },
      {
        label: 'Đơn Chờ Tiền Mặt',
        value: orderStats.pendingCashOrders,
        delta: '-2%',
        icon: '⏳',
        color: '#dc2626',
        bg: '#fee2e2',
      },
    ];

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thống kê', error: error.message });
  }
};

// ── 2. Quản lý Người Dùng (MongoDB) ──
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error: error.message });
  }
};

// ── 3. Quản lý Đơn Hàng (MySQL) ──
export const getAllOrders = async (req, res) => {
  try {
    const { orders } = await OrderModel.findAll({ limit: 100 });
    
    // Map data to match frontend AdminDashboard requirements
    const mappedOrders = orders.map(o => ({
      id: o.id,
      orderId: o.order_number,
      customerName: o.full_name,
      productName: o.plan_name,
      amount: o.total_amount,
      status: o.status,
      paymentDate: o.created_at,
    }));

    res.status(200).json(mappedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng', error: error.message });
  }
};

// ── 4. Quản lý Lịch Lái Thử (MySQL) ──
export const getAllTestDrives = async (req, res) => {
  try {
    const { orders } = await OrderModel.findAll({ limit: 100 });

    // Map data to match frontend AdminDashboard TestDrive table requirements
    const mappedTestDrives = orders.map(o => ({
      _id: o.id,
      orderNumber: o.order_number,
      userName: o.full_name,
      phone: o.phone,
      car: 'Porsche', // default if not specified
      planName: o.plan_name,
      scheduledAt: o.drive_date ? `${o.drive_date.toISOString().split('T')[0]}T${o.drive_time || '00:00'}:00` : o.created_at,
      showroom: o.showroom,
      status: o.status,
    }));

    res.status(200).json(mappedTestDrives);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách lịch lái thử', error: error.message });
  }
};

// ── 5. Cập nhật trạng thái (MySQL) ──
export const updateTestDriveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'paid', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const changedBy = req.user?.fullName || req.user?.email || 'admin';
    await OrderModel.updateStatus(id, status, changedBy, 'Cập nhật từ Admin Dashboard');

    res.status(200).json({ message: 'Cập nhật thành công', id, status });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái', error: error.message });
  }
};