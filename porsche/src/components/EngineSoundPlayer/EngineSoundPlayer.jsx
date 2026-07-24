import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';

const CAR_ENGINE_SAMPLES = {
  'GT3 RS': {
    audioUrl: 'https://res.cloudinary.com/dq8xgcqhk/video/upload/v1784097842/992_GT3_RS_EXHAUST_SOUND_Full_Dundon_System_No_Music_Raw_Audio_TAG_MOTORSPORTS_cowyyu.mp3',
    maxRpm: 9000,
    idleRpm: 900,
    redline: 8500,
    color: '#dc2626',
    rgb: '220, 38, 38',
    label: 'Naturally Aspirated Flat-6 — 9,000 RPM',
  },
  'GT3': {
    audioUrl: 'https://res.cloudinary.com/dq8xgcqhk/video/upload/v1784097844/A_drive_like_no_other_the_Porsche_911_GT3_vtxiaa.mp3',
    color: '#3b82f6',
    rgb: '59, 130, 246',
    maxRpm: 9000,
    idleRpm: 850,
    redline: 8400,
    label: 'Naturally Aspirated Flat-6 — 9,000 RPM',
  },
  '911 TURBO S': {
    audioUrl: 'https://res.cloudinary.com/dq8xgcqhk/video/upload/v1784097842/2025_Porsche_911_Turbo_S_sound_rev_duuqnd.mp3',
    color: '#d4af37',
    rgb: '212, 175, 55',
    maxRpm: 6750,
    idleRpm: 700,
    redline: 6500,
    label: 'Twin-Turbo Flat-6 — 6,750 RPM',
  },
};

const STATIC_WAVEFORM_BARS = [...Array(60)].map(() => ({
  heights: [
    `${15 + Math.random() * 20}%`, 
    `${55 + Math.random() * 45}%`, 
    `${15 + Math.random() * 20}%`
  ],
  duration: 0.12 + (Math.random() * 0.28)
}));

const THUMB_CLASSES = `
  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[16px] [&::-webkit-slider-thumb]:h-[16px] 
  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--thumb-color,white)] 
  [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#030303] 
  [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_var(--thumb-color,white),0_2px_8px_rgba(0,0,0,0.4)] 
  [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 
  hover:[&::-webkit-slider-thumb]:scale-125
  [&::-moz-range-thumb]:w-[16px] [&::-moz-range-thumb]:h-[16px] [&::-moz-range-thumb]:rounded-full 
  [&::-moz-range-thumb]:bg-[var(--thumb-color,white)] [&::-moz-range-thumb]:border-2 
  [&::-moz-range-thumb]:border-[#030303] [&::-moz-range-thumb]:cursor-pointer
`;

export default function EngineSoundPlayer({ carModel = 'GT3 RS' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: '-20%' });
  
  const audioRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [rpm, setRpm]             = useState(900);
  const [volume, setVolume]       = useState(0.8);

  const engine = CAR_ENGINE_SAMPLES[carModel] || CAR_ENGINE_SAMPLES['GT3 RS'];

  const stopEngine = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  const startEngine = useCallback(() => {
    if (isPlaying || !audioRef.current) return;

    audioRef.current.volume = volume;
    audioRef.current.playbackRate = 0.5; // Idle speed
    
    // Gọi lệnh play trực tiếp từ thẻ audio HTML
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(err => {
      console.error("Lỗi trình duyệt chặn âm thanh:", err);
    });
  }, [isPlaying, volume]);

  useEffect(() => {
    // Reset lại tiếng khi đổi xe
    const timer = setTimeout(() => {
      setRpm(engine.idleRpm);
      if (isPlaying) stopEngine();
    }, 0);
    return () => clearTimeout(timer);
  }, [carModel, engine.idleRpm, stopEngine]);

  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;
    const rpmPct = (rpm - engine.idleRpm) / (engine.maxRpm - engine.idleRpm);
    
    // Tính toán tốc độ phát dựa trên RPM
    audioRef.current.playbackRate = Math.max(0.5, 0.5 + (rpmPct * 2.0)); 
  }, [rpm, isPlaying, engine]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!isInView && isPlaying) {
      const timer = setTimeout(() => stopEngine(), 0);
      return () => clearTimeout(timer);
    }
  }, [isInView, stopEngine]);

  const rpmPct    = (rpm - engine.idleRpm) / (engine.maxRpm - engine.idleRpm);
  const isRedline = rpm >= engine.redline;

  return (
    // 🎯 FIX GIAO DIỆN: Thay đổi 'py-24' thành 'pt-[120px] md:pt-[140px] pb-12' để né hoàn toàn thanh Navbar ở trên
    <section 
      ref={ref} 
      className="relative w-full min-h-[100dvh] pt-[120px] md:pt-[140px] pb-12 flex flex-col items-center justify-center bg-transparent overflow-hidden" 
      style={{ 
        '--car-color': engine.color,
        '--car-rgb': engine.rgb
      }}
    >
      <audio 
        ref={audioRef} 
        src={engine.audioUrl} 
        loop 
        preload="auto" 
        className="hidden" 
      />

      {/* Hào quang gradient chìm phía sau */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none transition-colors duration-500"
        style={{ background: 'radial-gradient(ellipse, rgba(var(--car-rgb), 0.05) 0%, transparent 70%)' }}
      />

      {/* Container chính */}
      <div className="w-full max-w-[580px] mx-auto flex flex-col items-center gap-6 px-5 relative z-10">
        
        {/* Header */}
        <motion.div className="text-center"
          initial={{ opacity:0, y:20 }}
          animate={isInView ? { opacity:1, y:0 } : {}}
          transition={{ duration:0.7 }}
        >
          <p className="text-[9px] font-bold tracking-[0.4em] uppercase mb-2 block" style={{ color: engine.color }}>
            REAL AUDIO EXPERIENCE
          </p>
          <h2 className="text-[clamp(26px,4vw,38px)] font-light text-white leading-tight tracking-tight mb-1.5 font-['Inter',sans-serif]">
            Âm thanh thực tế<br />Porsche {carModel}
          </h2>
          <p className="text-[12px] text-white/40">{engine.label}</p>
        </motion.div>

        {/* Main player */}
        <motion.div className="w-full bg-white/5 border-[0.5px] border-white/10 rounded-2xl p-5 md:p-7 flex flex-col gap-5 backdrop-blur-md shadow-2xl"
          initial={{ opacity:0, scale:0.98 }}
          animate={isInView ? { opacity:1, scale:1 } : {}}
          transition={{ duration:0.8, delay:0.1 }}
        >
          {/* Waveform */}
          <div className="h-[70px] md:h-[80px] rounded-xl bg-black/30 border-[0.5px] border-white/5 overflow-hidden relative flex items-center justify-center">
            {isPlaying ? (
              <div className="flex gap-1 h-[70%] items-center">
                {STATIC_WAVEFORM_BARS.map((bar, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: bar.heights }}
                    transition={{ duration: bar.duration, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[3px] rounded-sm"
                    style={{ 
                      background: `linear-gradient(to top, ${engine.color}33, ${engine.color})`,
                      opacity: rpmPct + 0.3 
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-[10px] font-semibold tracking-[0.2em] text-white/20 uppercase text-center px-4">
                BẤM START ENGINE ĐỂ NGHE TIẾNG PÔ
              </div>
            )}
          </div>

          {/* RPM gauge */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-[34px] md:text-[42px] font-light tabular-nums tracking-[-0.03em] leading-none transition-colors duration-200 ${isRedline ? 'text-red-600' : 'text-white'}`}>
                {rpm.toLocaleString('vi-VN')}
              </span>
              <span className="text-[13px] text-white/40 font-normal tracking-[0.1em]">RPM</span>
            </div>

            {/* RPM arc indicator */}
            <div className="w-[90px] md:w-[110px] shrink-0">
              <svg viewBox="0 0 200 110" className="w-full h-auto">
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeLinecap="round" />
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(220,38,38,0.2)" strokeWidth="12" strokeLinecap="round" strokeDasharray="251" strokeDashoffset={251 * 0.15} />
                <path d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none" stroke={isRedline ? '#dc2626' : engine.color}
                  strokeWidth="12" strokeLinecap="round" strokeDasharray="251"
                  strokeDashoffset={251 * (1 - rpmPct)}
                  style={{ transition: 'stroke-dashoffset 0.1s ease, stroke 0.2s' }}
                />
                <text x="100" y="95" textAnchor="middle" fill="rgba(220,38,38,0.6)" fontSize="9">
                  {(engine.redline / 1000).toFixed(1)}k
                </text>
              </svg>
            </div>
          </div>

          {/* RPM Slider */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-semibold tracking-[0.2em] uppercase text-white/30">KÉO ĐỂ RÍT GA (RPM)</label>
            <input
              type="range"
              min={engine.idleRpm} max={engine.maxRpm} step={50}
              value={rpm}
              onChange={(e) => setRpm(Number(e.target.value))}
              disabled={!isPlaying}
              className={`appearance-none w-full h-[3px] rounded-sm outline-none cursor-pointer transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${THUMB_CLASSES}`}
              style={{ 
                background: `linear-gradient(to right, ${isRedline ? '#dc2626' : engine.color} 0%, ${isRedline ? '#dc2626' : engine.color} ${rpmPct * 100}%, rgba(255,255,255,0.1) ${rpmPct * 100}%)`,
                '--thumb-color': isRedline ? '#dc2626' : engine.color
              }}
            />
            <div className="flex justify-between text-[9px] text-white/30 tracking-[0.05em] mt-1">
              <span>{(engine.idleRpm / 1000).toFixed(1)}k</span>
              <span className="text-red-600/60">REDLINE {(engine.redline / 1000).toFixed(1)}k</span>
              <span>{(engine.maxRpm / 1000).toFixed(1)}k</span>
            </div>
          </div>

          {/* Volume Slider */}
          <div className="flex flex-col gap-1.5 mb-1">
            <label className="text-[9px] font-semibold tracking-[0.2em] uppercase text-white/30">ÂM LƯỢNG (VOLUME)</label>
            <input
              type="range" min={0} max={1} step={0.05} value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className={`appearance-none w-full h-[3px] rounded-sm bg-white/10 outline-none cursor-pointer transition-all duration-200 ${THUMB_CLASSES}`}
              style={{ '--thumb-color': engine.color }}
            />
          </div>

          {/* Start/Stop Button */}
          <button
            className={`group relative overflow-hidden flex items-center justify-center gap-2.5 p-3 rounded-lg text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300
              ${isPlaying 
                ? 'bg-[rgba(var(--car-rgb),0.12)] border border-[rgba(var(--car-rgb),0.3)] text-[var(--car-color)]' 
                : 'bg-white text-[#111] hover:bg-[#f0f0f0] hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(255,255,255,0.1)] border border-transparent'
              }`}
            style={{ '--car-color': engine.color }}
            onClick={isPlaying ? stopEngine : startEngine}
          >
            <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            
            <motion.span 
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPlaying ? 'bg-[var(--car-color)]' : 'bg-[#111]'}`} 
              animate={isPlaying ? { scale: [1, 0.7, 1], opacity: [1, 0.4, 1] } : { scale: 1, opacity: 1 }}
              transition={isPlaying ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : {}}
            />
            
            {isPlaying ? 'TẮT ĐỘNG CƠ' : 'START ENGINE'}
          </button>

        </motion.div>
      </div>
    </section>
  );
}