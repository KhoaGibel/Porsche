// src/firebase.js
// ─────────────────────────────────────────────────────
// Thay thế các giá trị bên dưới bằng config từ Firebase Console
// https://console.firebase.google.com → Project Settings → Your apps
// ─────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAfu4EKF3MQcrCj1DX0S3PGj9AfiwYwI7s",
  authDomain: "showroom-4809b.firebaseapp.com",
  projectId: "showroom-4809b",
  storageBucket: "showroom-4809b.firebasestorage.app",
  messagingSenderId: "883615877817",
  appId: "1:883615877817:web:2b78a00e9c6765d4d9e968",
  measurementId: "G-FNKWHSBFF7"
};

const app = initializeApp(firebaseConfig);

export const auth            = getAuth(app);
export const googleProvider  = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Cấu hình thêm scope nếu cần
googleProvider.setCustomParameters({ prompt: 'select_account' });
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');