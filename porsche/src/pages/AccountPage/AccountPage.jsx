import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth'; // Link tới hook auth của bạn
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  updatePassword, 
  updateProfile, 
  EmailAuthProvider, 
  reauthenticateWithCredential 
} from 'firebase/auth';
import { auth } from '../../firebase';
import useCarStore from '../../store/useCarStore';
import { paymentAPI } from '../../services/api';
import './AccountPage.css';

export default function AccountPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 🎯 Tự động mở đúng Tab dựa trên URL (nếu ở Navbar ấn vào Đổi mật khẩu thì mở tab password)
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes('password') ? 'password' : 'profile'
  );

  // Hook form cho Thông tin
  const { 
    register: regProfile, 
    handleSubmit: handleProfileSubmit,
    formState: { isSubmitting: isProfileSubmitting }
  } = useForm({
    defaultValues: {
      fullName: user?.displayName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || ''
    }
  });

  // Hook form cho Mật khẩu
  const { 
    register: regPassword, 
    handleSubmit: handlePasswordSubmit,
    watch,
    formState: { errors: pwdErrors, isSubmitting: isPwdSubmitting },
    reset: resetPwdForm
  } = useForm();

  // Redirect về trang chủ nếu chưa đăng nhập
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const data = await paymentAPI.getMyOrders();
          setOrders(data.orders || []);
        } catch (error) {
          console.error("Lỗi lấy đơn hàng:", error);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab]);

  const onUpdateProfile = async (data) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { displayName: data.fullName });
        const storeUser = useCarStore.getState().user;
        if (storeUser) {
          useCarStore.getState().setUser({
            ...storeUser,
            fullName: data.fullName,
          });
        }
        alert('Đã cập nhật thông tin thành công!');
      } else {
        alert('Đã cập nhật thông tin thành công!');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi cập nhật thông tin. Vui lòng thử lại sau.');
    }
  };

  const onChangePassword = async (data) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('Tài khoản này không hỗ trợ đổi mật khẩu trực tiếp qua Firebase.');
        return;
      }
      
      // Xác thực lại với mật khẩu cũ
      const credential = EmailAuthProvider.credential(currentUser.email, data.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Đổi mật khẩu mới
      await updatePassword(currentUser, data.newPassword);
      alert('Đã đổi mật khẩu thành công!');
      resetPwdForm();
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        alert('Mật khẩu hiện tại không chính xác!');
      } else {
        alert(error.message || 'Lỗi khi cập nhật mật khẩu.');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="account-page">
      <div className="account-overlay" />

      <div className="account-card">
        {/* Header & Tabs */}
        <div className="account-header">
          <h1 className="account-title">Cài đặt tài khoản</h1>
          <div className="account-tabs">
            <button 
              className={`account-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Thông tin cá nhân
            </button>
            <button 
              className={`account-tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Bảo mật & Mật khẩu
            </button>
            <button 
              className={`account-tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Lịch sử đơn hàng
            </button>
            {user?.role === 'admin' && (
              <button 
                className="account-tab"
                style={{ color: '#ef4444', fontWeight: 'bold' }}
                onClick={() => navigate('/admin')}
              >
                Trang Quản Trị (Admin)
              </button>
            )}
          </div>
        </div>

        {/* Nội dung thay đổi theo Tab */}
        <div className="account-content">
          
          {/* ── TAB: THÔNG TIN ── */}
          {activeTab === 'profile' && (
            <form className="account-form" onSubmit={handleProfileSubmit(onUpdateProfile)}>
              <div className="account-field">
                <label>Họ và tên</label>
                <input 
                  type="text" 
                  placeholder="Nhập họ và tên" 
                  {...regProfile('fullName')} 
                />
              </div>

              <div className="account-field">
                <label>Email (Không thể thay đổi)</label>
                <input 
                  type="email" 
                  {...regProfile('email')} 
                  disabled 
                />
              </div>

              <div className="account-field">
                <label>Số điện thoại</label>
                <input 
                  type="tel" 
                  placeholder="09xx xxx xxx" 
                  {...regProfile('phone')} 
                />
              </div>

              <button type="submit" className="account-submit" disabled={isProfileSubmitting}>
                {isProfileSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          )}

          {/* ── TAB: ĐỔI MẬT KHẨU ── */}
          {activeTab === 'password' && (
            <form className="account-form" onSubmit={handlePasswordSubmit(onChangePassword)}>
              <div className="account-field">
                <label>Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  {...regPassword('currentPassword', { required: 'Vui lòng nhập mật khẩu cũ' })} 
                />
                {pwdErrors.currentPassword && <span className="text-red-500 text-xs">{pwdErrors.currentPassword.message}</span>}
              </div>

              <div className="account-field">
                <label>Mật khẩu mới</label>
                <input 
                  type="password" 
                  placeholder="Ít nhất 8 ký tự" 
                  {...regPassword('newPassword', { 
                    required: 'Vui lòng nhập mật khẩu mới',
                    minLength: { value: 8, message: 'Mật khẩu phải từ 8 ký tự' }
                  })} 
                />
                {pwdErrors.newPassword && <span className="text-red-500 text-xs">{pwdErrors.newPassword.message}</span>}
              </div>

              <div className="account-field">
                <label>Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  {...regPassword('confirmPassword', { 
                    validate: (val) => val === watch('newPassword') || 'Mật khẩu không khớp'
                  })} 
                />
                {pwdErrors.confirmPassword && <span className="text-red-500 text-xs">{pwdErrors.confirmPassword.message}</span>}
              </div>

              <button type="submit" className="account-submit" disabled={isPwdSubmitting}>
                {isPwdSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </form>
          )}

          {/* ── TAB: LỊCH SỬ ĐƠN HÀNG ── */}
          {activeTab === 'orders' && (
            <div className="account-orders">
              <h2 className="text-xl font-bold mb-4 text-white">Lịch sử Đơn hàng</h2>
              {loadingOrders ? (
                <p className="text-gray-400">Đang tải...</p>
              ) : orders.length === 0 ? (
                <p className="text-gray-400">Bạn chưa có đơn hàng nào.</p>
              ) : (
                <div className="orders-list flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
                  {orders.map(order => (
                    <div key={order.id} className="order-item bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                        <span className="font-bold text-white text-lg">Mã Đơn: #{order.order_number}</span>
                        <span className={`text-sm px-3 py-1 rounded-full font-semibold capitalize ${order.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {order.status === 'paid' ? 'Đã thanh toán' : (order.status === 'pending_payment' || order.status === 'awaiting_cash') ? 'Chờ thanh toán' : order.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-300">
                        <div><span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Mẫu xe</span> <span className="font-medium">{order.plan_name || 'Xe tiêu chuẩn'}</span></div>
                        <div><span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Ngày đặt</span> <span className="font-medium">{new Date(order.created_at).toLocaleDateString('vi-VN')}</span></div>
                        <div><span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Tổng tiền</span> <strong className="text-red-500 font-bold text-base">{Number(order.total_amount).toLocaleString()} VNĐ</strong></div>
                        <div><span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Showroom</span> <span className="font-medium">{order.showroom || 'Không rõ'}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}