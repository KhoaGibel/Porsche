// 1. ĐÃ THÊM: StrictMode, lazy, Suspense từ thư viện react
import React, { StrictMode, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';

// 2. ĐÃ XÓA: Dòng import AuthPage thường ở đây vì đã dùng lazy load bên dưới
import AccountPage from './pages/AccountPage/AccountPage.jsx';
import './index.css';
import { useGLTF } from '@react-three/drei';

useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
 
// Các trang khác lazy load — chỉ tải khi user navigate đến
const ShopPage        = lazy(() => import('./pages/Shop/ShopPage.jsx'));
const CustomOrderPage = lazy(() => import('./pages/CustomOrder/CustomOrderPage.jsx'));
const AuthPage        = lazy(() => import('./pages/Auth/AuthPage.jsx'));
const AdminDashboard  = lazy(() => import('./pages/Admin/AdminDashboard.jsx'));
 
function PageLoader() {
  return (
    <div style={{ minHeight:'100vh', background:'#080808', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <p style={{ fontFamily:'sans-serif', fontSize:14, letterSpacing:'0.2em', color:'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>PORSCHE</p>
      <div style={{ width:160, height:1, background:'rgba(255,255,255,0.08)', overflow:'hidden', borderRadius:1 }}>
        <div style={{ height:'100%', background:'#dc2626', animation:'ld 1.2s ease-in-out infinite' }} />
      </div>
      <style>{`@keyframes ld{0%{width:0%;margin-left:0%}50%{width:60%;margin-left:20%}100%{width:0%;margin-left:100%}}`}</style>
    </div>
  );
}
 
ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"         element={<App />} />
          <Route path="/shop"     element={<ShopPage />} />
          <Route path="/order"    element={<CustomOrderPage />} />
          <Route path="/login"    element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/admin"    element={<AdminDashboard />} />

          {/* 3. ĐÃ THÊM: 2 Route quản lý tài khoản để Navbar không bị lỗi 404 */}
          <Route path="/profile"         element={<AccountPage />} />
          <Route path="/change-password" element={<AccountPage />} />
 
          <Route path="*"         element={<App />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>
);