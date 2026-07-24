import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function HeroSection({ id, title, bgImage, nextSectionId }) {
  const ref = useRef(null);
  const navigate = useNavigate();

  const [images, setImages] = useState({ current: bgImage, prev: null });

  if (bgImage !== images.current) {
    setImages({ current: bgImage, prev: images.current });
  }

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Animation tự động nội suy theo % cuộn của thẻ section 200vh bên ngoài
  const scaleBg    = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const opacityBg  = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yText      = useTransform(scrollYProgress, [0, 1], ['0px', '-150px']);
  const opacityText= useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    // 🎯 1. THẺ CHA: Kéo dài ra h-[150vh] hoặc h-[200vh] để tạo "quãng đường" cho người dùng cuộn chuột
    <section 
      id={id} 
      ref={ref} 
      className="relative w-full h-[150vh] md:h-[200vh] bg-black"
    >
      {/* 🎯 2. THẺ STICKY: Ghim chặt khung nhìn bằng đúng 1 màn hình (100dvh) ở trên cùng. 
          Nó sẽ không nhúc nhích đi đâu cho đến khi bạn cuộn hết 200vh của thẻ cha. */}
      <div className="sticky top-0 left-0 w-full h-[100dvh] overflow-hidden shrink-0">
        
        <AnimatePresence>
          {images.prev && (
            <motion.img
              key={images.prev}
              src={images.prev}
              alt="previous car"
              className="absolute inset-0 w-full h-full object-cover z-0 origin-center will-change-transform"
              style={{ scale: scaleBg }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              onAnimationComplete={() => setImages(prev => ({...prev, prev: null}))}
            />
          )}
        </AnimatePresence>

        <motion.img
          key={images.current}
          src={images.current}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover z-0 origin-center will-change-transform"
          style={{ scale: scaleBg, opacity: opacityBg }}
          initial={{ opacity: images.prev ? 0 : 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />

        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/15 via-black/35 to-black/75" />

        <div className="relative z-20 flex flex-col items-center justify-between w-full h-full pt-[10rem] pb-[5rem] px-[5%] pointer-events-none">
          
          <motion.div
            style={{ y: yText, opacity: opacityText }}
            className="text-center pointer-events-auto mt-10"
          >
            <AnimatePresence mode="wait">
              <motion.h1
                key={title}
                className="font-['PorscheFont',sans-serif] text-white text-5xl md:text-7xl font-bold tracking-[0.15em] drop-shadow-2xl mb-4 uppercase"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {title}
              </motion.h1>
            </AnimatePresence>

            <a
              href={`#${nextSectionId}`}
              className="text-white text-sm underline hover:text-gray-300 drop-shadow-md transition-colors duration-300"
            >
              Schedule a demo drive
            </a>
          </motion.div>

          <motion.div
            style={{ opacity: opacityText }}
            className="flex flex-col md:flex-row gap-4 md:gap-6 mt-auto pointer-events-auto"
          >
            <button
              onClick={() => navigate('/order')}
              className="w-[250px] py-[14px] px-[32px] bg-white text-black text-[13px] font-bold tracking-[0.1em] uppercase rounded-[2px] transition-all duration-300 hover:bg-[#e5e5e5] hover:-translate-y-[2px] shadow-lg"
            >
              Custom Order
            </button>
            <button
              onClick={() => navigate('/inventory')}
              className="w-[250px] py-[14px] px-[32px] bg-black/30 backdrop-blur-[4px] border-[1.5px] border-white text-white text-[13px] font-bold tracking-[0.1em] uppercase rounded-[2px] transition-all duration-300 hover:bg-white hover:text-black hover:-translate-y-[2px] shadow-lg"
            >
              View Inventory
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}