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

export function useAuth() {
  const [user, setUser]       = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        
        // 1. ĐẶC QUYỀN CHO SUPER ADMIN: BỎ QUA BACKEND!
        if (firebaseUser.email === 'admin@porsche.local') {
          useCarStore.getState().setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: firebaseUser.displayName || 'Super Admin',
            avatar: firebaseUser.photoURL,
            role: 'admin' 
          });
          setLoading(false);
          return;
        }


        //2. LUỒNG BÌNH THƯỜNG CHO KHÁCH HÀNG / QUẢN LÝ
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

          // Lưu token và lấy Role do Backend quyết định (user, manager, dealer...)
          saveToken(res.token);
          useCarStore.getState().setUser(res.user);
        } catch (err) {
          console.error('Đồng bộ tài khoản với server thất bại:', err);
        }
      } else {
        clearToken();
        useCarStore.getState().setUser(null);
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
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      const msg = FIREBASE_ERRORS[err.code] ?? 'Đã xảy ra lỗi. Vui lòng thử lại.';
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

  const logout = () => signOut(auth);

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
  'auth/too-many-requests':      'Quá nhiều lần thử. Vui lòng thử lại sau.',
  'auth/network-request-failed': 'Lỗi kết nối mạng. Kiểm tra internet của bạn.',
  'auth/user-disabled':          'Tài khoản này đã bị vô hiệu hoá.',
  'auth/account-exists-with-different-credential':
    'Email này đã đăng ký bằng phương thức khác (Google/Facebook).',
};