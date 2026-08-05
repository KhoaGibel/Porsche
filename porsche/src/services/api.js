const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

// Helper lấy JWT token từ localStorage
const getToken = () => localStorage.getItem('porsche_token');

// Helper request có auth header
const authFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Lỗi server');
  return data;
};

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export const authAPI = {
  // Đăng ký bằng email/password
  register: (body) =>
    authFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  // Đăng nhập bằng email/password
  login: (body) =>
    authFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  // Đồng bộ Google/Facebook từ Firebase vào MongoDB
  firebaseSync: (body) =>
    authFetch('/auth/firebase-sync', { method: 'POST', body: JSON.stringify(body) }),

  // Lấy thông tin user hiện tại
  getMe: () => authFetch('/auth/me'),
};

// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────
export const userAPI = {
  // Lấy profile
  getProfile: () => authFetch('/users/profile'),

  // Cập nhật profile
  updateProfile: (body) =>
    authFetch('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Lưu cấu hình xe
  saveConfig: (body) =>
    authFetch('/users/configs', { method: 'POST', body: JSON.stringify(body) }),

  // Xoá cấu hình xe
  deleteConfig: (configId) =>
    authFetch(`/users/configs/${configId}`, { method: 'DELETE' }),

  // Đặt lịch lái thử
  bookTestDrive: (body) =>
    authFetch('/users/test-drives', { method: 'POST', body: JSON.stringify(body) }),

  // Lấy danh sách lịch lái thử
  getTestDrives: () => authFetch('/users/test-drives'),
};

// ─────────────────────────────────────────────
// ADMIN (Kết nối MongoDB & MySQL)
// ─────────────────────────────────────────────
export const adminAPI = {
  // 🚀 Lấy số liệu tổng quan hệ thống
  getDashboardStats: () => authFetch('/admin/stats'),

  // 🚀 Lấy danh sách Người dùng (từ MongoDB)
  getAllUsers: () => authFetch('/admin/users'),

  // 🚀 Cập nhật quyền Người dùng
  updateUser: (id, body) => authFetch(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // 🚀 Lấy danh sách Đơn hàng / Thanh toán (từ MySQL)
  getAllOrders: () => authFetch('/admin/orders'),

  // Lấy toàn bộ danh sách lịch lái thử của tất cả khách hàng
  getAllTestDrives: () => authFetch('/admin/test-drives'),

  // Cập nhật trạng thái đơn lái thử (Duyệt/Hủy)
  updateTestDriveStatus: (id, status) =>
    authFetch(`/admin/test-drives/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // QUẢN LÝ GÓI (PLANS)
  getAllPlans: () => authFetch('/admin/plans'),
  createPlan: (body) => authFetch('/admin/plans', { method: 'POST', body: JSON.stringify(body) }),
  updatePlan: (id, body) => authFetch(`/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePlan: (id) => authFetch(`/admin/plans/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────
// PLANS (Public)
// ─────────────────────────────────────────────
export const planAPI = {
  getPublicPlans: () => authFetch('/plans'),
};

// ─────────────────────────────────────────────
// SUBSCRIPTION / PAYMENT (Đã xóa dữ liệu ảo)
// ─────────────────────────────────────────────
export const subAPI = {
  // 🚀 Gọi xuống Backend lấy thông tin gói Subscription thật
  getMySub: () => authFetch('/subscriptions/me'),

  // 🚀 Gửi request Hủy gói Subscription
  cancel: () => authFetch('/subscriptions/cancel', { method: 'POST' })
};

// ─────────────────────────────────────────────
// PAYMENT
// ─────────────────────────────────────────────
export const paymentAPI = {
  createPayment: (body) => authFetch('/payments/create', { method: 'POST', body: JSON.stringify(body) }),
  getMyOrders: () => authFetch('/payments/my')
};

// Helpers quản lý Token
export const saveToken  = (token) => localStorage.setItem('porsche_token', token);
export const clearToken = ()      => localStorage.removeItem('porsche_token');
export const hasToken   = ()      => !!getToken();