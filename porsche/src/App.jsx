import { Suspense, useState, useEffect, lazy } from 'react';
import { Loader } from '@react-three/drei';
import { motion, useScroll, useTransform, useMotionValueEvent, useInView } from 'framer-motion'; 
import { useRef } from 'react';
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
import Footer from './components/Footer/Footer.jsx';
import CinematicPreloader from './components/CinematicPreloader/CinematicPreloader.jsx';

// Tối ưu hóa: Lazy load các components không xuất hiện ở màn hình đầu tiên (Above the fold)
const StatsSection = lazy(() => import('./components/StatsSection/StatsSection.jsx'));
const TrackMap = lazy(() => import('./components/TrackMap/TrackMap.jsx'));
const DnaCar = lazy(() => import('./components/DnaCar/DnaCar.jsx'));
const EngineSoundPlayer = lazy(() => import('./components/EngineSoundPlayer/EngineSoundPlayer.jsx'));
const PorscheHeritage = lazy(() => import('./components/PorscheHeritage/PorscheHeritage.jsx'));
const ShowroomCanvas = lazy(() => import('./components/3D/ShowroomCanvas.jsx'));

const CAR_LIST = [
  { id: 'GT3 RS',      label: 'GT3 RS'      },
  { id: 'GT3',         label: 'GT3'         },
  { id: '911 TURBO S', label: '911 Turbo S' },
];

// Thêm cờ f_auto,q_auto để nhờ Cloudinary tự động nén dung lượng và đổi đuôi ảnh thành webp/avif siêu nhẹ
const gt3rsImageUrl    = 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1782715196/gt3rs-bg_vcobvv.jpg';
const gt3ImageUrl = 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1784492003/gt3_zomfy3.png';
const turboSImageUrl ='https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1784492004/image_6_wvqqxb.png';
const historyBgUrl     = 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1782716134/wp15616912-porsche-911-9922-turbo-s-wallpapers_ladgqq.jpg';

function InViewWrapper({ children, margin = "600px" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin });
  return <div ref={ref} className="w-full h-full">{isInView ? children : null}</div>;
}

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

  // Tạo hiệu ứng nội suy màu: Đen tuyền -> Xám than -> Đỏ đô siêu tối -> Đen tuyền
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ['#000000', '#0a0a0a', '#1a0505', '#050505', '#000000']
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
        <InViewWrapper margin="400px">
          <HistorySection 
            id="history-section" 
            bgImage={historyBgUrl} 
            videoThumbnail={customVideoCover}
          />
        </InViewWrapper>
      </div>

      <Suspense fallback={<div className="w-full min-h-[100dvh] bg-transparent" />}>
        <PorscheHeritage id="porsche-heritage" />
      </Suspense>

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
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-black text-white/50">Đang tải Showroom 3D...</div>}>
            <InViewWrapper margin="800px">
              <ShowroomCanvas slideDir={slideDir} />
            </InViewWrapper>
          </Suspense>

          <CinematicPreloader isSuspenseFallback={false} />

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
      
      <Suspense fallback={<div className="w-full min-h-[100dvh] bg-transparent" />}>
        <div className="w-full min-h-[100dvh] relative flex flex-col justify-center bg-transparent">
          <InViewWrapper margin="400px">
            <StatsSection carModel={selectedCar} />
          </InViewWrapper>
        </div>

        <div className="w-full min-h-[100dvh] relative flex flex-col justify-center bg-transparent">
          <InViewWrapper margin="400px">
            <TrackMap carModel={selectedCar} />
          </InViewWrapper>
        </div>

        <div className="w-full min-h-[100dvh] relative flex flex-col justify-center bg-transparent">
          <InViewWrapper margin="400px">
            <EngineSoundPlayer carModel={selectedCar} />
          </InViewWrapper>
        </div>

        <div className="w-full min-h-[100dvh] relative flex flex-col justify-center bg-transparent">
          <InViewWrapper margin="400px">
            <DnaCar carModel={selectedCar} onView3D={jumpToCar} />
          </InViewWrapper>
        </div>
      </Suspense>

      <Footer/>
    </div>
  );
}