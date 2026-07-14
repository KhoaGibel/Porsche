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

  // Lấy danh sách lịch lái thử (Hàng thật kết nối MongoDB của Khoa)
  getTestDrives: () => authFetch('/users/test-drives'),
};

// ─────────────────────────────────────────────
// SUBSCRIPTION (Gói đăng ký dịch vụ bổ sung)
// ─────────────────────────────────────────────
export const subAPI = {
  getMySub: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          subscription: {
            plan: 'premium',
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            renewsAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
          }
        });
      }, 500);
    });
  },
  cancel: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 500);
    });
  }
};

// ─────────────────────────────────────────────
// Token helpers — gọi sau khi login thành công
// ─────────────────────────────────────────────
export const saveToken  = (token) => localStorage.setItem('porsche_token', token);
export const clearToken = ()      => localStorage.removeItem('porsche_token');
export const hasToken   = ()      => !!getToken();