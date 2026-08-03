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

        </div>
      </div>
    </div>
  );
}