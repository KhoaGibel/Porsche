import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useMotionValue } from 'framer-motion';

// Path Nürburgring Nordschleife stylized
const TRACK_PATH = `
  M 400 80 C 480 60, 560 80, 600 120 C 640 160, 650 220, 630 270 C 610 320, 560 350, 520 380 C 480 410, 460 460, 470 510 C 480 560, 520 590, 560 600 C 600 610, 650 590, 680 560 C 710 530, 720 480, 700 440 C 680 400, 640 380, 620 350 C 600 320, 610 280, 640 260 C 670 240, 710 250, 730 280 C 750 310, 740 360, 720 390 C 700 420, 680 450, 680 490 C 680 530, 700 560, 730 570 C 760 580, 800 560, 820 530 C 840 500, 840 450, 820 420 C 800 390, 760 380, 740 350 C 720 320, 720 270, 740 240 C 760 210, 800 210, 830 230 C 860 250, 870 290, 850 320 C 830 350, 790 360, 770 390 C 750 420, 760 470, 790 490 C 820 510, 860 500, 880 470 C 900 440, 890 390, 860 370 C 830 350, 790 350, 770 320 C 750 290, 760 240, 790 220 C 820 200, 860 210, 880 240 C 900 270, 890 320, 860 340 C 540 520, 420 500, 380 460 C 340 420, 340 360, 360 310 C 380 260, 420 240, 440 200 C 460 160, 440 110, 400 80 Z
`;

const TRACK_DATA = {
  'GT3 RS': {
    color: '#dc2626',
    rgb: '220,38,38',
    recordTime: '6:49.328',
    subText: '911 GT3 RS — Nürburgring 2022',
    milestones: [
      { pct: 0.0,  label: 'Start / Finish',  time: '0:00.000',  desc: 'Vạch xuất phát — Einfahrt Nordschleife' },
      { pct: 0.18, label: 'Hatzenbach',       time: '0:52.310',  desc: 'Chuỗi cua liên tiếp đầu tiên, tốc độ cao' },
      { pct: 0.33, label: 'Flugplatz',        time: '1:44.720',  desc: '"Sân bay" — xe bật lên khỏi mặt đường' },
      { pct: 0.48, label: 'Karussell',        time: '2:38.100',  desc: 'Cua huyền thoại nghiêng 30°, rung kinh hoàng' },
      { pct: 0.63, label: 'Brünnchen',        time: '3:28.540',  desc: 'Đoạn kỹ thuật khó nhất toàn cung đường' },
      { pct: 0.78, label: 'Schwalbenschwanz', time: '4:58.210',  desc: '"Đuôi én" — loạt cua nhanh cuối track' },
      { pct: 0.92, label: 'Galgenkopf',       time: '6:02.800',  desc: 'Cua cuối — vào thẳng đường về đích' },
      { pct: 1.0,  label: 'Finish 🏆',        time: '6:49.328',  desc: 'Kỷ lục Nürburgring — GT3 RS 2022' },
    ],
  },
  'GT3': {
    color: '#3b82f6',
    rgb: '59,130,246',
    recordTime: '6:59.927',
    subText: '911 GT3 — Nürburgring 2021',
    milestones: [
      { pct: 0.0,  label: 'Start / Finish',  time: '0:00.000',  desc: 'Vạch xuất phát — Einfahrt Nordschleife' },
      { pct: 0.18, label: 'Hatzenbach',       time: '0:54.100',  desc: 'Chuỗi cua liên tiếp đầu tiên' },
      { pct: 0.33, label: 'Flugplatz',        time: '1:48.200',  desc: '"Sân bay" — độ nâng tuyệt vời' },
      { pct: 0.48, label: 'Karussell',        time: '2:42.500',  desc: 'Cua nghiêng 30° — grip đặc trưng GT3' },
      { pct: 0.63, label: 'Brünnchen',        time: '3:32.900',  desc: 'Đoạn kỹ thuật khó nhất' },
      { pct: 0.78, label: 'Schwalbenschwanz', time: '5:04.400',  desc: 'Loạt cua nhanh cuối track' },
      { pct: 0.92, label: 'Galgenkopf',       time: '6:08.600',  desc: 'Cua cuối vào đường thẳng' },
      { pct: 1.0,  label: 'Finish 🏆',        time: '6:59.927',  desc: 'Kỷ lục Nürburgring — GT3 2021' },
    ],
  },
  '911 TURBO S': {
    color: '#d4af37',
    rgb: '212,175,55',
    recordTime: '7:17.000',
    subText: '911 Turbo S — Nürburgring 2020',
    milestones: [
      { pct: 0.0,  label: 'Start / Finish',  time: '0:00.000',  desc: 'Vạch xuất phát' },
      { pct: 0.18, label: 'Hatzenbach',       time: '0:56.800',  desc: 'AWD traction tuyệt vời ra khỏi cua' },
      { pct: 0.33, label: 'Flugplatz',        time: '1:53.400',  desc: 'Sức mạnh Biturbo tối ưu trên đoạn thẳng' },
      { pct: 0.48, label: 'Karussell',        time: '2:50.100',  desc: 'AWD ổn định hoàn hảo qua cua nghiêng' },
      { pct: 0.63, label: 'Brünnchen',        time: '3:41.200',  desc: 'Kỹ thuật và sức mạnh cân bằng' },
      { pct: 0.78, label: 'Schwalbenschwanz', time: '5:14.700',  desc: 'Tốc độ dịch chuyển đỉnh cao' },
      { pct: 0.92, label: 'Galgenkopf',       time: '6:20.100',  desc: 'Sprint cuối về đích' },
      { pct: 1.0,  label: 'Finish 🏆',        time: '7:17.000',  desc: 'Kỷ lục Nürburgring — Turbo S 2020' },
    ],
  },
};

export default function TrackMap({ carModel = 'GT3 RS' }) {
  const sectionRef   = useRef(null);
  const pathRef      = useRef(null);
  const dotRef       = useRef(null);

  // 🎯 CỜ CHỐT CHẶN: Đánh dấu xe đã chạy xong 1 vòng
  const isFinishedRef = useRef(false);

  const [pathLength, setPathLength]           = useState(0);
  const [scrollPct, setScrollPct]             = useState(0);
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [milestoneCoords, setMilestoneCoords] = useState([]);

  const stats = TRACK_DATA[carModel] ?? TRACK_DATA['GT3 RS'];

  // Reset cờ và trạng thái khi đổi xe (để biểu đồ vẽ lại từ đầu)
  useEffect(() => {
    isFinishedRef.current = false;
    setScrollPct(0);
  }, [carModel]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  // 🎯 DÙNG MOTION_VALUE ĐỘC LẬP: Thay vì gắn chết vào scrollYProgress
  // Nó cho phép mình ghi đè và "đóng băng" đồ họa ở mức 100%
  const progressMV = useMotionValue(0);
  const pathDashoffset = useTransform(progressMV, [0, 1], [pathLength || 2000, 0]);
  const progressWidth  = useTransform(progressMV, v => `${v * 100}%`);

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
      
      const coords = stats.milestones.map(m => {
        const point = pathRef.current.getPointAtLength(length * m.pct);
        return { ...m, x: point.x, y: point.y };
      });
      setMilestoneCoords(coords);
    }
  }, [stats.milestones]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Kích hoạt cờ khi xe cán đích (cuộn đến ~100%)
    if (latest >= 0.999) {
      isFinishedRef.current = true;
    }

    // NẾU cờ đã bật (đã xong) -> Khóa cứng tiến độ ở mức 1 (100%)
    // NẾU CHƯA -> Chạy theo tỷ lệ cuộn hiện tại
    const currentProgress = isFinishedRef.current ? 1 : latest;

    // Cập nhật MotionValue và Text Progress
    progressMV.set(currentProgress);
    setScrollPct(currentProgress);

    // Cập nhật vị trí điểm phát sáng
    if (pathRef.current && dotRef.current && pathLength > 0) {
      const pt = pathRef.current.getPointAtLength(currentProgress * pathLength);
      dotRef.current.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
    }

    // Cập nhật thẻ Milestone
    if (stats.milestones && stats.milestones.length > 0) {
      const nearest = stats.milestones.reduce((prev, curr) =>
        Math.abs(curr.pct - currentProgress) < Math.abs(prev.pct - currentProgress) ? curr : prev
      );
      
      setActiveMilestone(prev => {
        if (Math.abs(nearest.pct - currentProgress) < 0.05) {
          return prev?.label === nearest.label ? prev : nearest;
        }
        return null;
      });
    }
  });

  const raceProgress = Math.round(scrollPct * 100);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[400vh] bg-[#030303] overflow-visible"
      style={{ '--theme-color': stats.color, '--theme-rgb': stats.rgb }}
    >
      <div className="sticky top-0 w-full h-[100dvh] flex items-center overflow-hidden">
        <div className="w-full max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-[350px_1fr] gap-10 md:gap-[60px] items-center px-[5%] relative">
          
          <div className="absolute hidden md:block left-[calc(350px+5%)] top-[15%] bottom-[15%] w-px bg-gradient-to-b from-transparent via-[rgba(var(--theme-rgb),0.3)] to-transparent" />

          {/* ── CỘT TRÁI: THÔNG TIN ── */}
          <div className="flex flex-col justify-center gap-4 relative z-10">
            <div>
              <motion.p className="text-[11px] font-bold tracking-[0.35em] uppercase text-[var(--theme-color)] mb-2" initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.7 }}>
                Nürburgring Nordschleife
              </motion.p>
              <motion.h2 className="font-['Inter'] text-[clamp(32px,3.5vw,48px)] font-black text-white leading-[1.15] tracking-tight uppercase m-0 mb-1" initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.7, delay:0.1 }}>
                20.8 km<br />Legendary<br />Racetrack
              </motion.h2>
            </div>

            <motion.div className="inline-flex flex-col gap-1 px-5 py-4 bg-[rgba(var(--theme-rgb),0.08)] border border-[rgba(var(--theme-rgb),0.25)] rounded-xl w-fit mb-2 backdrop-blur-md" initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ duration:0.8, delay:0.3 }}>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/40">Kỷ lục {carModel}</p>
              <p className="text-[38px] font-extrabold text-[var(--theme-color)] tabular-nums leading-none">{stats.recordTime}</p>
              <p className="text-xs text-white/50 mt-1">{stats.subText}</p>
            </motion.div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.1em] text-white/60 mb-2.5">
                <span>Tiến độ vòng đua</span>
                <span className="text-[var(--theme-color)]">{raceProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ width: progressWidth, background: 'var(--theme-color)', boxShadow: '0 0 10px var(--theme-color)' }}
                />
              </div>
            </div>

            <div className="h-[90px] relative"> 
              <AnimatePresence mode="wait">
                {activeMilestone && (
                  <motion.div
                    key={activeMilestone.label}
                    initial={{ opacity:0, y:15 }}
                    animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0, y:-15 }}
                    transition={{ duration:0.3 }}
                    className="flex flex-col justify-center px-5 py-4 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-[var(--theme-color)]" />
                    <p className="text-base font-bold text-white mb-1">{activeMilestone.label}</p>
                    <p className="text-sm font-bold text-[var(--theme-color)] tabular-nums mb-1.5">{activeMilestone.time}</p>
                    <p className="text-[13px] text-white/60 leading-relaxed">{activeMilestone.desc}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 🎯 Tắt dòng chữ "Cuộn để chạy Track" khi xe đã về đích để UI tự nhiên hơn */}
            <div className="h-[20px]">
              <AnimatePresence>
                {scrollPct < 1 && (
                  <motion.p 
                    className="text-[11px] text-white/30 tracking-[0.15em] uppercase flex items-center gap-2" 
                    animate={{ opacity:[0.3, 1, 0.3] }} 
                    transition={{ duration:2, repeat:Infinity }}
                    exit={{ opacity:0 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                    Cuộn để chạy Track
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
  
          {/* ── CỘT PHẢI: BẢN ĐỒ SVG ── */}
          <div className="relative flex items-center justify-center w-full h-[50vh] md:h-[85vh]" style={{ backgroundImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(var(--theme-rgb), 0.08) 0%, transparent 70%)' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <svg viewBox="300 30 650 600" className="w-full max-w-[750px] h-auto relative z-10 p-5 drop-shadow-[0_0_25px_rgba(0,0,0,0.6)]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="glow-track">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="glow-dot">
                  <feGaussianBlur stdDeviation="5" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
  
              <path d={TRACK_PATH} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round"/>
  
              <motion.path 
                ref={pathRef} 
                d={TRACK_PATH} 
                fill="none"
                stroke="var(--theme-color)" 
                strokeWidth="4" 
                strokeLinecap="round"
                strokeDasharray={pathLength || 2000}
                style={{ strokeDashoffset: pathDashoffset }}
                filter="url(#glow-track)"
              />
  
              {milestoneCoords.map((m, i) => {
                if (!m.x || !m.y) return null;
                const passed = m.pct <= scrollPct + 0.04;
                return (
                  <g key={i}>
                    <circle cx={m.x} cy={m.y} r="5"
                      fill={passed ? 'var(--theme-color)' : '#222'}
                      stroke={passed ? 'var(--theme-color)' : 'rgba(255,255,255,0.2)'}
                      strokeWidth="2"
                      style={{ transition: 'all 0.4s' }}
                    />
                    {passed && (
                      <circle cx={m.x} cy={m.y} r="12" fill="none" stroke="var(--theme-color)" strokeWidth="1" opacity="0.4" />
                    )}
                  </g>
                );
              })}
  
              <g ref={dotRef}>
                <circle cx={0} cy={0} r="10" fill="var(--theme-color)" filter="url(#glow-dot)"/>
                <circle cx={0} cy={0} r="5" fill="#ffffff"/>
              </g>
            </svg>
          </div>

        </div>
      </div>
    </section>
  );
}