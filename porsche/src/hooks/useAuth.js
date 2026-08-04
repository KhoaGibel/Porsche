import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../firebase';
import { authAPI, saveToken, clearToken } from '../services/api';
import useCarStore from '../store/useCarStore';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export function useAuth() {
  const [user, setUser]       = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Luồng bình thường cho khách hàng qua Firebase
        try {
          const providerId = firebaseUser.providerData[0]?.providerId ?? 'password';
          const provider =
            providerId.includes('google')   ? 'google'
            : providerId.includes('facebook') ? 'facebook'
            : 'local';

          const res = await authAPI.firebaseSync({
            firebaseUid: firebaseUser.uid,
            email:       firebaseUser.email,
            fullName:    firebaseUser.displayName,
            avatar:      firebaseUser.photoURL,
            provider,
          });

          if (res?.token) saveToken(res.token);
          const userData = res?.user || {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            avatar: firebaseUser.photoURL,
            role: 'user'
          };
          setUser(userData);
          useCarStore.getState().setUser(userData);
        } catch (err) {
          console.error('Đồng bộ tài khoản với server thất bại, sử dụng fallback cục bộ:', err);
          const fallback = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            avatar: firebaseUser.photoURL,
            role: 'user'
          };
          setUser(fallback);
          useCarStore.getState().setUser(fallback);
        }
      } else {
        // Không có Firebase user — kiểm tra xem có token backend không (admin login)
        const token = localStorage.getItem('porsche_token');
        const savedUser = localStorage.getItem('porsche_admin_user');
        if (token && savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            useCarStore.getState().setUser(userData);
          } catch {
            clearToken();
            localStorage.removeItem('porsche_admin_user');
            setUser(null);
            useCarStore.getState().setUser(null);
          }
        } else {
          clearToken();
          setUser(null);
          useCarStore.getState().setUser(null);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const clearError = () => setError(null);

  const register = async ({ fullName, email, password }) => {
    try {
      setError(null);
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(newUser, { displayName: fullName });
      await sendEmailVerification(newUser);
      return { success: true, message: 'Đã gửi email xác thực. Vui lòng kiểm tra hộp thư!' };
    } catch (err) {
      const msg = FIREBASE_ERRORS[err.code] ?? 'Đã xảy ra lỗi. Vui lòng thử lại.';
      setError(msg);
      return { success: false };
    }
  };

  const login = async ({ email, password }) => {
    try {
      setError(null);

      // Luồng đặc biệt cho Admin: đăng nhập thẳng qua backend MongoDB (không qua Firebase)
      if (email.endsWith('@porsche.local') || email === 'admin@porsche.vn') {
        const res = await fetch(`${BASE_URL}/auth/admin-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'Đăng nhập thất bại.');
          return { success: false };
        }

        if (data.token) saveToken(data.token);

        const adminUserData = {
          ...data.user,
          displayName: data.user.fullName,
        };
        setUser(adminUserData);
        useCarStore.getState().setUser(adminUserData);
        // Lưu thông tin admin để khôi phục session khi reload
        localStorage.setItem('porsche_admin_user', JSON.stringify(adminUserData));
        return { success: true };
      }

      // Luồng bình thường cho khách hàng: Firebase
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      const msg = FIREBASE_ERRORS[err.code] ?? 'Đã xảy ra lỗi. Vui lòng kiểm tra lại email và mật khẩu.';
      setError(msg);
      return { success: false };
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(FIREBASE_ERRORS[err.code] ?? 'Lỗi đăng nhập Google.');
      }
      return { success: false };
    }
  };

  const loginWithFacebook = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, facebookProvider);
      return { success: true };
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(FIREBASE_ERRORS[err.code] ?? 'Lỗi đăng nhập Facebook.');
      }
      return { success: false };
    }
  };

  const logout = async () => {
    clearToken();
    localStorage.removeItem('porsche_admin_user');
    // Xóa isFakeAdmin cũ nếu còn
    localStorage.removeItem('isFakeAdmin');
    setUser(null);
    useCarStore.getState().setUser(null);
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Lỗi khi đăng xuất Firebase:', err);
    }
  };

  return {
    user, loading, error, clearError,
    register, login, loginWithGoogle, loginWithFacebook, logout,
  };
}

const FIREBASE_ERRORS = {
  'auth/email-already-in-use':   'Email này đã được đăng ký.',
  'auth/invalid-email':          'Địa chỉ email không hợp lệ.',
  'auth/weak-password':          'Mật khẩu phải có ít nhất 6 ký tự.',
  'auth/user-not-found':         'Không tìm thấy tài khoản với email này.',
  'auth/wrong-password':         'Mật khẩu không chính xác.',
  'auth/invalid-credential':     'Email hoặc mật khẩu không chính xác.',
  'auth/too-many-requests':      'Quá nhiều lần thử. Vui lòng thử lại sau.',
  'auth/network-request-failed': 'Lỗi kết nối mạng. Kiểm tra internet của bạn.',
  'auth/user-disabled':          'Tài khoản này đã bị vô hiệu hoá.',
  'auth/account-exists-with-different-credential':
    'Email này đã đăng ký bằng phương thức khác (Google/Facebook).',
};