import React, { StrictMode, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { useGLTF } from '@react-three/drei';
import { AbilityProvider } from './hooks/useAbility';

useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');


const AuthPage        = lazy(() => import('./pages/Auth/AuthPage.jsx'));
const AdminDashboard  = lazy(() => import('./pages/Admin/AdminDashboard.jsx'));
const AccountPage     = lazy(() => import('./pages/AccountPage/AccountPage.jsx'));

const TestDriveShop   = lazy(() => import('./pages/Shop/TestDriveShop.jsx')); 

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
    <AbilityProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"                 element={<App />} />
          <Route path="/login"            element={<AuthPage mode="login" />} />
          <Route path="/register"         element={<AuthPage mode="register" />} />
          <Route path="/admin"            element={<AdminDashboard />} />

          <Route path="/profile"          element={<AccountPage />} />
          <Route path="/change-password"  element={<AccountPage />} />

          <Route path="/shop"       element={<TestDriveShop />} />

          <Route path="*"                 element={<App />} />
        </Routes>
      </Suspense>
      </AbilityProvider>
    </BrowserRouter>
  </StrictMode>
);