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
  apiKey:            "883615877817",
  authDomain:        "Showroom.firebaseapp.com",
  projectId:         "showroom-4809b",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const auth            = getAuth(app);
export const googleProvider  = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Cấu hình thêm scope nếu cần
googleProvider.setCustomParameters({ prompt: 'select_account' });
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');