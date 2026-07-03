import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Loader } from '@react-three/drei';
import { useIsMobile } from './hooks/useIsMobile';
import './App.css';

import AutoCenteredCar from "./components/3d/AutoCenteredCar";
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import HeroSection from "./components/HeroSection/HeroSection.jsx";
import HistorySection from "./components/HistorySection/HistorySection.jsx"; // Bắt buộc phải có dòng này
import useCarStore from './store/useCarStore';

export default function App() {
  const theme         = useCarStore((state) => state.theme);
  const isSidebarOpen = useCarStore((state) => state.isSidebarOpen);
  const toggleSidebar = useCarStore((state) => state.toggleSidebar);
  const isMobile      = useIsMobile();

  // 1. GOM TẤT CẢ LINK ẢNH LÊN TRÊN CÙNG
  const gt3rsImageUrl  = "https://res.cloudinary.com/dq8xgcqhk/image/upload/v1782715196/gt3rs-bg_vcobvv.jpg";
  const historyBgUrl   = "https://res.cloudinary.com/dq8xgcqhk/image/upload/v1782716134/wp15616912-porsche-911-9922-turbo-s-wallpapers_ladgqq.jpg";

  const showroomBg = theme === 'light'
    ? { background: '#e5e5e7' }
    : {
        background: `
          radial-gradient(ellipse 90% 40% at 50% 100%, #1e1e2e 0%, transparent 70%),
          #090909
        `
      };

  // Lệnh return bắt đầu render giao diện HTML
  return (
    <div className="app-container">
      <Navbar />

      {/* ── Màn hình 1: Hero Chốt Sale ── */}
      <HeroSection 
        id="hero-gt3rs"   
        title="GT3 RS"      
        bgImage={gt3rsImageUrl}  
        nextSectionId="history-section" 
      />

      {/* ── Màn hình 2: Lịch sử đè Video (Đặt độc lập ở giữa) ── */}
      <HistorySection 
        id="history-section" 
        bgImage={historyBgUrl} 
      />

      {/* ── Màn hình 3: Showroom 3D ── */}
      <section id="3d-showroom" className="section-snap relative" style={showroomBg}>
        
        {/* ── Canvas ── */}
        <div className={`canvas-wrapper transition-all duration-500
          ${!isMobile && isSidebarOpen ? 'w-full md:w-[calc(100%-24rem)]' : 'w-full'}`}
        >
          <Canvas
            frameloop="demand"
            camera={{ position: [5, 2, 6], fov: 45 }}
            dpr={isMobile ? [1, 1] : [1, 1.5]}
            performance={{ min: isMobile ? 0.3 : 0.5 }}
            shadows
          >
            <Environment preset="warehouse" background={false} />  
            <ambientLight intensity={theme === 'light' ? 1.5 : 0.8} />  
            
            <directionalLight
              position={[5, 8, 3]}
              intensity={theme === 'light' ? 2.0 : 2.5}  
              castShadow
            />
            
            <directionalLight
              position={[-5, 3, -3]}
              intensity={0.8}
            />

            <Suspense fallback={null}>
              <AutoCenteredCar scale={1} />
              <ContactShadows resolution={isMobile ? 256 : 1024}
                frames={1} scale={12} blur={2.5}
                opacity={theme === 'dark' ? 0.9 : 0.6}
                far={10}
                color={theme === 'dark' ? '#000020' : '#000000'}
              />
            </Suspense>

            <OrbitControls
              target={[0, 1, 0]}
              enableDamping dampingFactor={0.08}
              makeDefault
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2 + 0.1}
              minDistance={3} maxDistance={15}
              enablePan={isMobile}
            />
          </Canvas>

          <Loader
            containerStyles={{ background: 'transparent', position: 'absolute', bottom: '5rem', left: '50%', transform: 'translateX(-50%)', width: '160px' }}
            barStyles={{ background: '#dc2626', height: '2px' }}
            dataStyles={{ color: '#888', fontSize: '11px' }}
            dataInterpolation={(p) => `Loading... ${Math.round(p)}%`}
          />
        </div>

        {/* ── Trigger DESKTOP: tab dọc cạnh phải ── */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            aria-label="Mở cấu hình xe"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-50
              flex flex-col items-center gap-1 px-2 py-5
              rounded-l-xl bg-red-600 hover:bg-red-700 text-white
              shadow-xl transition-all duration-300
              ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-[10px] font-black tracking-[0.2em] uppercase"
              style={{ writingMode: 'vertical-rl' }}>Config</span>
          </button>
        )}

        {/* ── Trigger MOBILE: peek bar ở đáy canvas ── */}
        {isMobile && !isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute bottom-0 left-0 right-0 z-40
              flex items-center justify-center gap-3
              py-3 bg-[#111]/90 backdrop-blur-sm
              border-t border-white/10"
          >
            <div className="w-8 h-1 rounded-full bg-white/30" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/60">
              Kéo lên để cấu hình
            </span>
            <div className="w-8 h-1 rounded-full bg-white/30" />
          </button>
        )}
        
        <Sidebar />
      </section>
      
    </div>
  );
}