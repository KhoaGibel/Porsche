// src/pages/Auth/AuthPage.jsx
// Dùng chung cho cả Login lẫn Register — chuyển qua lại bằng prop `mode`
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import './AuthPage.css';

// Ảnh nền Porsche (dùng lại từ Cloudinary hoặc ảnh local)
const BG_IMAGE = 'https://res.cloudinary.com/dq8xgcqhk/image/upload/v1782715196/gt3rs-bg_vcobvv.jpg';

export default function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate();
  const { user, login, register, loginWithGoogle, loginWithFacebook, error, clearError } = useAuth();

  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isLogin = mode === 'login';

  const {
    register: formRegister,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Reset form khi chuyển mode
  useEffect(() => {
    reset();
    clearError();
    setSuccessMsg('');
  }, [mode]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    clearError();
    setSuccessMsg('');

    if (isLogin) {
      const result = await login(data);
      if (result.success) navigate('/');
    } else {
      const result = await register(data);
      if (result.success) {
        setSuccessMsg(result.message);
        reset();
      }
    }
    setSubmitting(false);
  };

  const handleGoogle = async () => {
    clearError();
    const result = await loginWithGoogle();
    if (result.success) navigate('/');
  };

  const handleFacebook = async () => {
    clearError();
    const result = await loginWithFacebook();
    if (result.success) navigate('/');
  };

  return (
    <div className="auth-page">
      {/* Ảnh nền */}
      <img src={BG_IMAGE} alt="Porsche showroom" className="auth-bg" />
      <div className="auth-overlay" />

      {/* Logo + về trang chủ */}
      <Link to="/" className="auth-logo">PORSCHE</Link>

      {/* Card glassmorphism */}
      <div className="auth-card">

        {/* Header */}
        <div className="auth-card-header">
          <h1 className="auth-title">
            {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? 'Chào mừng trở lại. Vui lòng đăng nhập để tiếp tục.'
              : 'Tạo tài khoản để lưu cấu hình xe và đặt lịch lái thử.'}
          </p>
        </div>

        

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>

          {/* Chỉ hiện ở Register */}
          {!isLogin && (
            <div className="auth-field">
              <label>Họ và tên</label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                {...formRegister('fullName', {
                  required: 'Vui lòng nhập họ tên',
                  minLength: { value: 2, message: 'Tên phải có ít nhất 2 ký tự' },
                })}
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && <span className="auth-error-text">{errors.fullName.message}</span>}
            </div>
          )}

          {/* Email */}
          <div className="auth-field">
            <label>Gmail</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              {...formRegister('email', {
                required: 'Vui lòng nhập email',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email không hợp lệ',
                },
              })}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="auth-error-text">{errors.email.message}</span>}
          </div>

          {/* Mật khẩu */}
          <div className="auth-field">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="Tối thiểu 8 ký tự"
              {...formRegister('password', {
                required: 'Vui lòng nhập mật khẩu',
                minLength: { value: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
              })}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="auth-error-text">{errors.password.message}</span>}
          </div>

          {/* Nhập lại mật khẩu — chỉ Register */}
          {!isLogin && (
            <div className="auth-field">
              <label>Nhập lại mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                {...formRegister('confirmPassword', {
                  required: 'Vui lòng nhập lại mật khẩu',
                  validate: (val) =>
                    val === watch('password') || 'Mật khẩu không khớp',
                })}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && (
                <span className="auth-error-text">{errors.confirmPassword.message}</span>
              )}
            </div>
          )}

          {/* reCAPTCHA hint — chỉ Login */}
          {isLogin && (
            <p className="auth-recaptcha-note">
              Trang này được bảo vệ bởi reCAPTCHA của Google. Bằng cách đăng nhập, bạn đồng ý với{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Chính sách quyền riêng tư
              </a>{' '}
              và{' '}
              <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
                Điều khoản dịch vụ
              </a>{' '}
              của Google.
            </p>
          )}

          {/* Error từ Firebase */}
          {error && <div className="auth-error-banner">{error}</div>}

          {/* Success message */}
          {successMsg && <div className="auth-success-banner">{successMsg}</div>}

          {/* Divider */}
        <div className="auth-divider">
          <span>hoặc</span>
        </div>
          {/* OAuth buttons */}
        <div className="auth-oauth">
          <button type="button" onClick={handleGoogle} className="auth-oauth-btn">
            <svg viewBox="0 0 24 24" className="auth-oauth-icon">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              
            </svg>
            <span>Google</span>
          </button>

          <button type="button" onClick={handleFacebook} className="auth-oauth-btn">
            <svg viewBox="0 0 24 24" className="auth-oauth-icon">
              <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </button>
        </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={submitting}
          >
            {submitting
              ? 'Đang xử lý...'
              : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'
            }
          </button>
        </form>

        {/* Switch mode */}
        <p className="auth-switch">
          {isLogin ? (
            <>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></>
          ) : (
            <>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></>
          )}
        </p>

      </div>
    </div>
  );
}