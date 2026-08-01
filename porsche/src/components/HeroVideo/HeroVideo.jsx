import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const HERO_DATA = {
  'GT3 RS': {
    title: 'PORSCHE 911 GT3 RS',
    tagline: 'Sinh ra từ đường đua. Thừa hưởng DNA chiến thắng.',
    videoSrc: 'https://res.cloudinary.com/dq8xgcqhk/video/upload/f_auto,q_auto/v1784016324/6872078-hd_1280_720_25fps_unmfun.mp4',
    accentColor: '#dc2626', // Đỏ
    hud: {
      sysStatus: 'AERODYNAMICS: AUTO_MODE',
      alert: 'DRS // ACTIVE',
      spec: 'DOWNFORCE: 860KG @ 285KM/H',
      cam: 'CAM_01 // REAR_WING_TRACKER'
    }
  },
  'GT3': {
    title: 'PORSCHE 911 GT3',
    tagline: 'Cân bằng hoàn hảo. Thuần khiết trên từng góc lái.',
    videoSrc: 'https://res.cloudinary.com/dq8xgcqhk/video/upload/f_auto,q_auto/v1784016324/6872078-hd_1280_720_25fps_unmfun.mp4', 
    accentColor: '#3b82f6', // Xanh dương
    hud: {
      sysStatus: 'AERODYNAMICS: TOURING_MODE',
      alert: 'TRANSMISSION // MANUAL 6-SPEED',
      spec: 'DOWNFORCE: 385KG @ 200KM/H',
      cam: 'CAM_02 // CHASSIS_DYNAMICS'
    }
  },
  '911 TURBO S': {
    title: 'PORSCHE 911 TURBO S',
    tagline: 'Vũ khí tối thượng. Đỉnh cao hiệu suất hàng ngày.',
    videoSrc: 'https://res.cloudinary.com/dq8xgcqhk/video/upload/f_auto,q_auto/v1784016324/6872078-hd_1280_720_25fps_unmfun.mp4',
    accentColor: '#d4af37', // Vàng Porsche
    hud: {
      sysStatus: 'AERODYNAMICS: PAA_ACTIVE',
      alert: 'PTM // AWD ACTIVE',
      spec: '0-100KM/H: 2.7 SECONDS',
      cam: 'CAM_03 // LAUNCH_CONTROL_RDY'
    }
  }
};

export default function HeroVideo({ carModel = 'GT3 RS' }) {
  const [hudActive, setHudActive] = useState(true);
  
  // Lấy dữ liệu xe hiện tại, nếu truyền sai tên thì mặc định lấy GT3 RS
  const data = HERO_DATA[carModel] || HERO_DATA['GT3 RS'];

  const coordinates = "48°46'34.3\"N 9°09'16.2\"E"; 
  const titleLetters = data.title.split("");

  return (
    // 🎯 Dùng h-[100dvh] shrink-0 để section luôn đầy màn hình và không bị bóp xẹp
    <section id="hero-gt3rs" className="relative w-full h-[100dvh] shrink-0 overflow-hidden bg-black">
      
      {/* 1. LỚP PHỦ GRADIENT SÂU */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10 pointer-events-none"></div>
      
      {/* 2. VIDEO NỀN TRÀN MÀN HÌNH */}
      <video 
        key={data.videoSrc}
        autoPlay 
        loop 
        muted 
        playsInline 
        poster="https://res.cloudinary.com/dq8xgcqhk/video/upload/f_auto,q_auto,so_0/v1784016324/6872078-hd_1280_720_25fps_unmfun.jpg"
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-85"
      >
        <source src={data.videoSrc} />
      </video>

      {/* 3. LỚP PHỦ HUD CHI TIẾT KỸ THUẬT */}
      {hudActive && (
        <div className="absolute inset-0 z-[15] pointer-events-none px-[5%] py-[6%] flex flex-col justify-between text-[10px] tracking-[0.2em] font-mono text-white/30">
          
          <div className="absolute top-[4%] left-[4%] w-5 h-5 border-l border-t border-white/15 pointer-events-none" />
          <div className="absolute bottom-[4%] right-[4%] w-5 h-5 border-r border-b border-white/15 pointer-events-none" />

          <div className="flex justify-between items-start">
            <motion.div 
              key={`top-left-${carModel}`}
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.5 }}
            >
              <p>SYS_STATUS: ACTIVE</p>
              <p>{data.hud.sysStatus}</p>
            </motion.div>
            <motion.div 
              key={`top-right-${carModel}`}
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.7 }} 
              className="text-right"
            >
              <p>GPS_COORD: {coordinates}</p>
              <p>WEISSACH_GERMANY</p>
            </motion.div>
          </div>

          {/* Góc dưới */}
          <div className="flex justify-between items-end">
            <motion.div 
              key={`bot-left-${carModel}`}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.9 }}
            >
              <p className="font-bold mb-1" style={{ color: data.accentColor }}>
                {data.hud.alert}
              </p>
              <p>{data.hud.spec}</p>
            </motion.div>
            <motion.div 
              key={`bot-right-${carModel}`}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 1.1 }} 
              className="text-right"
            >
              <p>{data.hud.cam}</p>
              <p className="animate-pulse">RECORDING... 25FPS</p>
            </motion.div>
          </div>
        </div>
      )}

      {/* 4. NỘI DUNG CHÍNH (Tiêu đề & Khẩu hiệu) */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-4 text-center select-none">
        
        {/* Nhãn nhỏ phía trên */}
        <motion.p
          key={`label-${carModel}`}
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 0.6, letterSpacing: "0.4em" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-xs uppercase font-semibold mb-5 tracking-[0.4em]"
          style={{ color: data.accentColor }}
        >
           Motorsport 
        </motion.p>

        {/* Chữ PORSCHE chạy từng ký tự (🎯 Add font Porsche trực tiếp) */}
        <h1 className="font-['PorscheFont',sans-serif] flex flex-wrap justify-center text-4xl md:text-7xl font-light mb-6 tracking-[0.1em]">
          <AnimatePresence mode="popLayout">
            {titleLetters.map((char, index) => (
              <motion.span
                key={`${carModel}-${index}`}
                initial={{ opacity: 0, y: 15, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(5px)", transition: { duration: 0.2 } }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + index * 0.05,
                  ease: [0.215, 0.61, 0.355, 1]
                }}
                className={char === " " ? "w-4 md:w-8" : ""}
              >
                {char}
              </motion.span>
            ))}
          </AnimatePresence>
        </h1>

        {/* Khẩu hiệu dưới */}
        <motion.p 
          key={`tagline-${carModel}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="text-sm md:text-base font-light tracking-[0.3em] uppercase text-white/40 max-w-[600px] leading-relaxed"
        >
          {data.tagline}
        </motion.p>
      </div>

      {/* Mũi tên chỉ xuống */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer hover:opacity-100 transition-opacity"
        onClick={() => {
          const nextSection = document.getElementById("hero-gt3rs")?.nextElementSibling;
          nextSection?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <span className="text-[9px] tracking-[0.3em] uppercase text-white/30">CUỘN XUỐNG</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-white/60 to-transparent relative overflow-hidden">
          <motion.div 
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-[30%] bg-white"
          />
        </div>
      </motion.div>
    </section>
  );
}