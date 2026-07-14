import { motion } from 'framer-motion';

export default function HeroVideo() {
  return (
    <section id="hero-gt3rs" className="relative w-full h-screen overflow-hidden">
      
      {/* 1. LỚP PHỦ ĐEN MỜ (GIÚP CHỮ TRẮNG NỔI BẬT) */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      
      {/* 2. VIDEO NỀN TRÀN MÀN HÌNH */}
      {/* Bạn nhớ chuẩn bị 1 file mp4 siêu nét đặt trong thư mục public/videos/ nhé */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/PorscheHero.mp4" type="video/mp4" />
      </video>

      {/* 3. NỘI DUNG CHỮ HIỆN RA MƯỢT MÀ VỚI FRAMER MOTION */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-4 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="text-5xl md:text-7xl font-black uppercase tracking-[0.15em] mb-4"
        >
          Porsche 911 GT3 RS
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="text-lg md:text-xl font-light tracking-widest text-gray-200 uppercase"
        >
          Sinh ra từ đường đua.
        </motion.p>
      </div>

      {/* Mũi tên chỉ xuống nhấp nháy */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </motion.div>
    </section>
  );
}   