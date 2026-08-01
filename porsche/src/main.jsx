import React, { StrictMode, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import App from './App.jsx';
import './index.css';
import { useGLTF } from '@react-three/drei';
import { AbilityProvider } from './hooks/useAbility';
import Lenis from 'lenis';

import CinematicPreloader from './components/CinematicPreloader/CinematicPreloader.jsx';
import PageTransition from './components/PageTransition/PageTransition.jsx';
import NotFound from './pages/NotFound/NotFound.jsx';

useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');


const AuthPage        = lazy(() => import('./pages/Auth/AuthPage.jsx'));
const AdminDashboard  = lazy(() => import('./pages/Admin/AdminDashboard.jsx'));
const AccountPage     = lazy(() => import('./pages/AccountPage/AccountPage.jsx'));
const PorscheHistoryPage = lazy(() => import('./pages/History/PorscheHistoryPage.jsx'));

const TestDriveShop   = lazy(() => import('./pages/Shop/TestDriveShop.jsx')); 
const PaymentPage     = lazy(() => import('./pages/Payment/PaymentPage.jsx'));

// PageLoader cũ đã bị thay thế bởi CinematicPreloader

function GlobalScroll() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  React.useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });
    window.lenis = lenis;
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
      delete window.lenis;
    }
  }, []);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes key={location.pathname} location={location}>
        <Route path="/"                 element={<PageTransition><App /></PageTransition>} />
        <Route path="/login"            element={<PageTransition><AuthPage mode="login" /></PageTransition>} />
        <Route path="/register"         element={<PageTransition><AuthPage mode="register" /></PageTransition>} />
        <Route path="/admin"            element={<PageTransition><AdminDashboard /></PageTransition>} />

        <Route path="/profile"          element={<PageTransition><AccountPage /></PageTransition>} />
        <Route path="/change-password"  element={<PageTransition><AccountPage /></PageTransition>} />

        <Route path="/shop"             element={<PageTransition><TestDriveShop /></PageTransition>} />
        <Route path="/payment"          element={<PageTransition><PaymentPage /></PageTransition>} />
        <Route path="/history"          element={<PageTransition><PorscheHistoryPage /></PageTransition>} />

        <Route path="*"                 element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GlobalScroll />
      <AbilityProvider>
        <Suspense fallback={<CinematicPreloader isSuspenseFallback={true} />}>
          <AnimatedRoutes />
        </Suspense>
      </AbilityProvider>
    </BrowserRouter>
  </StrictMode>
);