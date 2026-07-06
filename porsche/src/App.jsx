import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Loader, Environment } from '@react-three/drei';
import { useIsMobile } from './hooks/useIsMobile';
import './App.css';

import AutoCenteredCar from './components/3D/AutoCenteredCar';
import Sidebar from './components/Sidebar/Sidebar';
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection.jsx';
import SpotlightRig from './components/3D/SpotlightRig';
import useCarStore from './store/useCarStore';
import HistorySection from './components/HistorySection/HistorySection'

// Danh sách xe — thêm model mới vào đây
const CAR_LIST = [
  { id: 'GT3 RS',      label: 'GT3 RS'      },
  { id: 'GT3',         label: 'GT3'          },
  { id: '911 TURBO S', label: '911 Turbo S'  },
];

const gt3rsImageUrl  = 'https://res.cloudinary.com/dq8xgcqhk/image/upload/v1782715196/gt3rs-bg_vcobvv.jpg';
const historyBgUrl     = 'https://res.cloudinary.com/dq8xgcqhk/image/upload/v1782716134/wp15616912-porsche-911-9922-turbo-s-wallpapers_ladgqq.jpg';

export default function App() {
  const theme         = useCarStore((state) => state.theme);
  const isSidebarOpen = useCarStore((state) => state.isSidebarOpen);
  const toggleSidebar = useCarStore((state) => state.toggleSidebar);
  const activeCar     = useCarStore((state) => state.activeCar);
  const setActiveCar  = useCarStore((state) => state.setActiveCar);
  const isMobile      = useIsMobile();

  // ── Chuyển xe với animation ──
  const [carIndex, setCarIndex]         = useState(0);
  const [slideDir, setSlideDir]         = useState(null); // 'left' | 'right'
  const [isAnimating, setIsAnimating]   = useState(false);

  const switchCar = (dir) => {
    if (isAnimating) return;
    setSlideDir(dir);
    setIsAnimating(true);
    setTimeout(() => {
      const next = dir === 'right'
        ? (carIndex + 1) % CAR_LIST.length
        : (carIndex - 1 + CAR_LIST.length) % CAR_LIST.length;
      setCarIndex(next);
      setActiveCar(CAR_LIST[next].id);
      setSlideDir(null);
      setIsAnimating(false);
    }, 350);
  };  
  const customVideoCover = "https://images.unsplash.com/photo-1611821064430-0d40291d0f0f?q=80&w=2000&auto=format&fit=crop";

  return (
    <div className="app-container">
      <Navbar />

      <HeroSection id="hero-gt3rs"  title="GT3 RS"      bgImage={gt3rsImageUrl}  nextSectionId="3d-showroom" />
      <HistorySection 
    id="history-section" 
    bgImage={historyBgUrl} 
    videoThumbnail={customVideoCover}
  />

      {/* ══════════════════════════════════════════
          SHOWROOM 3D — NỀN ĐEN + SPOTLIGHT
      ══════════════════════════════════════════ */}
      <section
        id="3d-showroom"
        className="section-snap relative overflow-hidden"
        style={{ background: '#080808' }}
      >
        {/* ── Canvas wrapper ── */}
        <div className={`canvas-wrapper transition-all duration-500
          ${!isMobile && isSidebarOpen ? 'w-full md:w-[calc(100%-24rem)]' : 'w-full'}`}
        >
          <Canvas
            frameloop="demand"
            camera={{ position: [5, 2.5, 7], fov: 42 }}
            dpr={isMobile ? [1, 1] : [1, 1.5]}
            performance={{ min: isMobile ? 0.3 : 0.5 }}
            shadows="soft"
          >
            {/* ── Spotlight rig — ánh sáng rọi từ trên cao như bóng đèn showroom ── */}
            <SpotlightRig />

            {/* ── Ambient rất thấp — nền tối, xe nổi bật ── */}
            <ambientLight intensity={0.08} />

            <Suspense fallback={null}>
              {/* Xe — với slide animation */}
              <group
                position={[
                  slideDir === 'right' ? -3 : slideDir === 'left' ? 3 : 0,
                  0, 0
                ]}
              >
                <AutoCenteredCar scale={1} />
              </group>

              {/* Bóng đổ trên sàn */}
              <ContactShadows
                resolution={isMobile ? 256 : 1024}
                frames={1}
                scale={14}
                blur={3}
                opacity={0.85}
                far={10}
                color="#000000"
              />
            </Suspense>

            <OrbitControls
              target={[0, 1, 0]}
              enableDamping
              dampingFactor={0.08}
              makeDefault
              minPolarAngle={0.2}
              maxPolarAngle={Math.PI / 2.2}
              minDistance={3}
              maxDistance={12}
              enablePan={false}
            />
          </Canvas>

          {/* Loading bar */}
          <Loader
            containerStyles={{ background: 'transparent', position: 'absolute', bottom: '4rem', left: '50%', transform: 'translateX(-50%)', width: '160px' }}
            barStyles={{ background: '#dc2626', height: '1px' }}
            dataStyles={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}
            dataInterpolation={(p) => `Loading... ${Math.round(p)}%`}
          />

          {/* ── Tên xe hiện tại ── */}
          <div className="showroom-car-label">
            <p className="showroom-car-brand">PORSCHE</p>
            <h2 className="showroom-car-name">{CAR_LIST[carIndex].label}</h2>
          </div>

          {/* ── Nút chuyển xe TRÁI ── */}
          <button
            className="car-nav-btn car-nav-left"
            onClick={() => switchCar('left')}
            disabled={isAnimating}
            aria-label="Xe trước"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* ── Nút chuyển xe PHẢI ── */}
          <button
            className="car-nav-btn car-nav-right"
            onClick={() => switchCar('right')}
            disabled={isAnimating}
            aria-label="Xe tiếp theo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* ── Dots indicator ── */}
          <div className="car-dots">
            {CAR_LIST.map((car, i) => (
              <button
                key={car.id}
                className={`car-dot ${i === carIndex ? 'active' : ''}`}
                onClick={() => {
                  if (i === carIndex || isAnimating) return;
                  switchCar(i > carIndex ? 'right' : 'left');
                }}
                aria-label={car.label}
              />
            ))}
          </div>
        </div>

        {/* ── Trigger CONFIG desktop ── */}
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

        {/* ── Trigger mobile peek bar ── */}
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
              Cấu hình xe
            </span>
            <div className="w-8 h-1 rounded-full bg-white/30" />
          </button>
        )}

        <Sidebar />
      </section>
    </div>
  );
}