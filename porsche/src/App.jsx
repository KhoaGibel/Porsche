import Lenis from 'lenis';
import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Loader, Environment } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion'; 
import { useIsMobile } from './hooks/useIsMobile';
import './App.css'; 

import AutoCenteredCar from './components/3D/AutoCenteredCar';
import Sidebar from './components/Sidebar/Sidebar';
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection.jsx';
import useCarStore from './store/useCarStore';
import HistorySection from './components/HistorySection/HistorySection';
import PorscheChatbot from './components/ChatbotAI/PorscheChatbot.jsx';
import HeroVideo from './components/HeroVideo/HeroVideo';
import StatsSection from './components/StatsSection/StatsSection.jsx';
import TrackMap from './components/TrackMap/TrackMap.jsx';
import DnaCar from './components/DnaCar/DnaCar.jsx';
import EngineSoundPlayer from './components/EngineSoundPlayer/EngineSoundPlayer.jsx';
import Footer from './components/Footer/Footer.jsx';

const CAR_LIST = [
  { id: 'GT3 RS',      label: 'GT3 RS'      },
  { id: 'GT3',         label: 'GT3'         },
  { id: '911 TURBO S', label: '911 Turbo S' },
];

const gt3rsImageUrl    = 'https://res.cloudinary.com/dq8xgcqhk/image/upload/v1782715196/gt3rs-bg_vcobvv.jpg';
const gt3ImageUrl = 'https://res.cloudinary.com/dq8xgcqhk/image/upload/v1784492003/gt3_zomfy3.png';
const turboSImageUrl ='https://res.cloudinary.com/dq8xgcqhk/image/upload/v1784492004/image_6_wvqqxb.png';
const historyBgUrl     = 'https://res.cloudinary.com/dq8xgcqhk/image/upload/v1782716134/wp15616912-porsche-911-9922-turbo-s-wallpapers_ladgqq.jpg';

export default function App() {
  const isSidebarOpen = useCarStore((state) => state.isSidebarOpen);
  const toggleSidebar = useCarStore((state) => state.toggleSidebar);
  const setActiveCar  = useCarStore((state) => state.setActiveCar);
  const isMobile      = useIsMobile();

  const [carIndex, setCarIndex]         = useState(0);
  const [slideDir, setSlideDir]         = useState(null); 
  const [isAnimating, setIsAnimating]   = useState(false);
  const setCarColor = useCarStore((state) => state.setCarColor);

  const selectedCar = CAR_LIST[carIndex].id;
  const HERO_IMAGES = {
    'GT3 RS': gt3rsImageUrl,
    'GT3': gt3ImageUrl,
    '911 TURBO S': turboSImageUrl,
  };
  const currentHeroImage = HERO_IMAGES[selectedCar] || gt3rsImageUrl;

  const { scrollYProgress } = useScroll();

  // Tạo hiệu ứng nội suy màu: Tối -> Trắng -> Tối
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.25, 0.35, 0.65, 0.75, 1],
    ['#080808', '#080808', '#ffffff', '#ffffff', '#080808', '#080808']
  );

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
      setCarColor(null);
      setIsAnimating(false);
    }, 350);
  };  

  const jumpToCar = (carId) => {
    const targetIndex = CAR_LIST.findIndex(c => c.id === carId);
    if (targetIndex === -1 || targetIndex === carIndex || isAnimating) {
      document.getElementById('3d-showroom')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const dir = targetIndex > carIndex ? 'right' : 'left';
    setSlideDir(dir);
    setIsAnimating(true);
    
    document.getElementById('3d-showroom')?.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      setCarIndex(targetIndex);
      setActiveCar(CAR_LIST[targetIndex].id);
      setSlideDir(null);
      setCarColor(null);
      setIsAnimating(false);
    }, 350);
  };
  
  const handleNavbarCarSelect = (carId) => {
    const targetIndex = CAR_LIST.findIndex(c => c.id === carId);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (targetIndex === -1 || targetIndex === carIndex || isAnimating) return;

    const dir = targetIndex > carIndex ? 'right' : 'left';
    setSlideDir(dir);
    setIsAnimating(true);
    
    setTimeout(() => {
      setCarIndex(targetIndex);
      setActiveCar(CAR_LIST[targetIndex].id);
      setSlideDir(null);
      setCarColor(null);
      setIsAnimating(false);
    }, 350);
  };

  const customVideoCover = "https://images.unsplash.com/photo-1611821064430-0d40291d0f0f?q=80&w=2000&auto=format&fit=crop";

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy(); 
  }, []);

  return (
    // Bỏ màu nền ở thẻ bao ngoài cùng
    <div className="relative w-full min-h-screen overflow-x-clip">
      
      {/* ── LỚP NỀN FIXED CHẠY ANIMATION CHUYỂN MÀU ── */}
      <motion.div 
        className="fixed inset-0 z-[-1]"
        style={{ backgroundColor }}
      />
      {/* ──────────────────────────────────────────────── */}

      <Navbar selectedCar={selectedCar} setSelectedCar={handleNavbarCarSelect} />
      
      <div className="w-full h-[100dvh] relative overflow-hidden flex flex-col bg-transparent">
        <HeroVideo carModel={selectedCar} />
      </div>

      <div className="w-full h-[100dvh] relative overflow-hidden flex flex-col bg-transparent">
        <HeroSection id="hero-gt3rs" title={selectedCar} bgImage={currentHeroImage} nextSectionId="3d-showroom" />
      </div>

      <div className="w-full h-[100dvh] relative overflow-hidden flex flex-col bg-transparent">
        <HistorySection 
          id="history-section" 
          bgImage={historyBgUrl} 
          videoThumbnail={customVideoCover}
        />
      </div>

      {/* SHOWROOM 3D */}
      <section
        id="3d-showroom"
        className="relative w-full h-[100dvh] shrink-0 overflow-hidden flex flex-col bg-transparent"
      >
        <div 
          className={`h-full w-full relative transition-all duration-500
            ${!isMobile && isSidebarOpen ? 'md:w-[calc(100%-24rem)]' : ''}`}
          style={{ touchAction: 'pan-y' }}
        >
          <Canvas
            frameloop="demand"
            camera={{ position: [5, 2.5, 7], fov: 42 }}
            dpr={isMobile ? [1, 1] : [1, 1.5]}
            performance={{ min: isMobile ? 0.3 : 0.5 }}
            style={{ width: '100%', height: '100%' }}
          >
            <Suspense fallback={null}>
              <group position={[ slideDir === 'right' ? -3 : slideDir === 'left' ? 3 : 0, 0, 0 ]}>
                <AutoCenteredCar scale={1} />
              </group>
              <Environment files="https://res.cloudinary.com/dq8xgcqhk/raw/upload/v1783567347/grasslands_sunset_1k_lcveuv.hdr" background />
              <ContactShadows resolution={isMobile ? 256 : 512} frames={1} scale={14} blur={3} opacity={0.85} far={10} color="#000000" />
            </Suspense>
            <OrbitControls target={[0, 1, 0]} enableDamping dampingFactor={0.08} makeDefault minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.2} minDistance={3} maxDistance={12} enablePan={false} enableZoom={false} />
          </Canvas>

          <Loader
            containerStyles={{ background: 'transparent', position: 'absolute', bottom: '4rem', left: '50%', transform: 'translateX(-50%)', width: '160px' }}
            barStyles={{ background: '#dc2626', height: '1px' }}
            dataStyles={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}
            dataInterpolation={(p) => `Loading... ${Math.round(p)}%`}
          />

          <div className="absolute bottom-[5.5rem] left-1/2 -translate-x-1/2 text-center pointer-events-none z-20 font-['PorscheFont',sans-serif]">
            <p className="text-[11px] font-semibold tracking-[0.5em] text-white/40 uppercase mb-1 drop-shadow-md">PORSCHE</p>
            <h2 className="text-2xl md:text-[26px] font-normal tracking-[0.3em] text-white-800 drop-shadow-sm mix-blend-difference uppercase">{CAR_LIST[carIndex].label}</h2>
          </div>

          <button
            className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 text-white/50 flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-md hover:bg-white/10 hover:border-white/30 hover:text-white hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed mix-blend-difference text-white border-white/20 hover:border-white/50 hover:bg-white/10"
            onClick={() => switchCar('left')} disabled={isAnimating} aria-label="Xe trước"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>

          <button
            className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 text-white/50 flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-md hover:bg-white/10 hover:border-white/30 hover:text-white hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed mix-blend-difference text-white border-white/20 hover:border-white/50 hover:bg-white/10"
            onClick={() => switchCar('right')} disabled={isAnimating} aria-label="Xe tiếp theo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2.5 z-20 mix-blend-difference">
            {CAR_LIST.map((car, i) => (
              <button
                key={car.id}
                className={`w-1.5 h-1.5 rounded-full p-0 cursor-pointer transition-all duration-300 ease-in-out ${i === carIndex ? 'bg-white scale-[1.3]' : 'bg-white/30 hover:bg-white/70'}`}
                onClick={() => {
                  if (i === carIndex || isAnimating) return;
                  const dir = i > carIndex ? 'right' : 'left';
                  setSlideDir(dir);
                  setIsAnimating(true);
                  setTimeout(() => {
                    setCarIndex(i);
                    setActiveCar(CAR_LIST[i].id);
                    setSlideDir(null);
                    setCarColor(null);
                    setIsAnimating(false);
                  }, 350);
                }}
                aria-label={car.label}
              />
            ))}
          </div>
        </div>

        {!isMobile && (
          <button
            onClick={toggleSidebar} aria-label="Mở cấu hình xe"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1 px-2 py-5 rounded-l-xl bg-red-600 hover:bg-red-700 text-white shadow-xl transition-all duration-300 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ writingMode: 'vertical-rl' }}>Config</span>
          </button>
        )}
        <Sidebar />
        <PorscheChatbot />
      </section>
      
      <div className="w-full min-h-[100dvh] relative flex flex-col justify-center bg-transparent">
        <StatsSection carModel={selectedCar} />
      </div>

      <div className="w-full min-h-[100dvh] relative flex flex-col justify-center bg-transparent">
        <TrackMap carModel={selectedCar} />
      </div>

      <div className="w-full min-h-[100dvh] relative flex flex-col justify-center bg-transparent">
        <EngineSoundPlayer carModel={selectedCar} />
      </div>

      <div className="w-full min-h-[100dvh] relative flex flex-col justify-center bg-transparent">
        <DnaCar onView3D={jumpToCar} />
      </div>

      <Footer/>
    </div>
  );
}