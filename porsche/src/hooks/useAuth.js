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
 
export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);
 
  const clearError = () => setError(null);
 
  // ── Đăng ký Email/Password ──
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
 
  // ── Đăng nhập Email/Password ──
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
 
  // ── Đăng nhập Google ──
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
 
  // ── Đăng nhập Facebook ──
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
 
  // ── Đăng xuất ──
  const logout = () => signOut(auth);
 
  return {
    user, loading, error, clearError,
    register, login, loginWithGoogle, loginWithFacebook, logout,
  };
}
 
// Map Firebase error codes → tiếng Việt
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