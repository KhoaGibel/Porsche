import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

const CAR_STATS = {
  'GT3 RS': [
    { value: 525,    suffix: '',    label: 'Mã lực',        sub: '4.0L Boxer 6 xi-lanh' },
    { value: 3.2,    suffix: 's',   label: '0 – 100 km/h',  sub: 'PDK 7 cấp' },
    { value: 296,    suffix: '',    label: 'Tốc độ tối đa', sub: 'km/h' },
    { value: 860,    suffix: 'kg',  label: 'Downforce',       sub: 'ở 285 km/h' },
    { value: 1450,   suffix: 'kg',  label: 'Trọng lượng',   sub: 'Nhẹ hơn GT3 50kg' },
    { value: 15.8,   suffix: 'tỷ',  label: 'Giá từ',        sub: 'VNĐ' },
  ],
  'GT3': [
    { value: 503,    suffix: '',    label: 'Mã lực',        sub: '4.0L Boxer 6 xi-lanh' },
    { value: 3.4,    suffix: 's',   label: '0 – 100 km/h',  sub: 'PDK 7 / Số sàn 6' },
    { value: 320,    suffix: '',    label: 'Tốc độ tối đa', sub: 'km/h' },
    { value: 470,    suffix: 'Nm',  label: 'Mô-men xoắn',   sub: 'tại 6,100 rpm' },
    { value: 1435,   suffix: 'kg',  label: 'Trọng lượng',   sub: 'Cầu sau (RWD)' },
    { value: 12.5,   suffix: 'tỷ',  label: 'Giá từ',        sub: 'VNĐ' },
  ],
  '911 TURBO S': [
    { value: 650,    suffix: '',    label: 'Mã lực',        sub: '3.8L Biturbo 6' },
    { value: 2.7,    suffix: 's',   label: '0 – 100 km/h',  sub: 'PDK 8 cấp AWD' },
    { value: 330,    suffix: '',    label: 'Tốc độ tối đa', sub: 'km/h' },
    { value: 800,    suffix: 'Nm',  label: 'Mô-men xoắn',   sub: 'tại 2,500 rpm' },
    { value: 1640,   suffix: 'kg',  label: 'Trọng lượng',   sub: 'AWD toàn thời gian' },
    { value: 22.3,   suffix: 'tỷ',  label: 'Giá từ',        sub: 'VNĐ' },
  ],
};

// Hook đếm số từ 0 → target khi vào viewport
function useCountUp(target, duration = 1800, decimals = 0) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  const start = () => {
    if (started) return;
    setStarted(true);
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = parseFloat((eased * target).toFixed(decimals));
      setCount(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  return { count, start };
}

function StatCard({ stat, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const decimals = stat.value % 1 !== 0 ? 1 : 0;
  const { count, start } = useCountUp(stat.value, 1600, decimals);

  useEffect(() => {
    if (isInView) start();
  }, [isInView, start]);

  // 🎯 LOGIC TÍNH TOÁN HIỆU ỨNG 3D (TILT)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Thêm Spring để card xoay mượt mà hơn, không bị giật cứng
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  // Map vị trí chuột sang độ xoay X, Y (Giới hạn xoay 12 độ)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Tọa độ chuột trong phạm vi thẻ card
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Đưa về dải giá trị từ -0.5 đến 0.5
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    // Trả thẻ về trạng thái phẳng khi chuột rời đi
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ perspective: 1000 }} // 🎯 Kích hoạt phối cảnh 3D cho Container
      className="relative w-full h-full"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d", // 🎯 Giữ nguyên không gian 3D cho thẻ con
        }}
        className="group relative flex flex-col items-center justify-center gap-2 p-8 md:p-12 w-full h-full bg-[#0a0a0a] border border-white/5 rounded-2xl cursor-pointer transition-colors hover:bg-[#111] hover:border-red-600/30 overflow-hidden"
      >
        {/* Lớp viền sáng gradient phát sáng mờ khi Hover */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(220,38,38,0.15),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* 🎯 NỘI DUNG NỔI LÊN (TRANSLATE Z) */}
        <div 
          className="flex flex-col items-center justify-center w-full relative z-10 pointer-events-none"
          style={{ transform: "translateZ(60px)" }} // Đẩy chữ lồi lên 60px trên trục Z
        >
          <div className="flex items-baseline gap-1">
            <span className="text-[clamp(42px,6vw,72px)] font-light text-white leading-none tracking-tighter tabular-nums drop-shadow-2xl">
              {count}
            </span>
            <span className="text-[clamp(16px,2.5vw,24px)] font-light text-white/50">
              {stat.suffix}
            </span>
          </div>
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-white/60 mt-3 drop-shadow-md">
            {stat.label}
          </p>
          <p className="text-[11px] text-white/30 tracking-wider mt-1 text-center">
            {stat.sub}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function StatsSection({ carModel = 'GT3 RS' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const opacity    = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const yBg        = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);

  const stats = CAR_STATS[carModel] ?? CAR_STATS['GT3 RS'];

  return (
    <section ref={ref} className="relative min-h-screen bg-[#050505] flex items-center justify-center overflow-hidden py-24 px-[5%]">
      {/* Parallax background line */}
      <motion.div 
        className="absolute top-1/2 left-[-10%] right-[-10%] h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent"
        style={{ y: yBg }} 
      />

      <motion.div className="w-full max-w-[1100px] mx-auto text-center relative z-10" style={{ opacity }}>
        
        {/* Eyebrow */}
        <motion.div 
          className="flex items-center justify-center gap-4 text-[11px] font-semibold tracking-[0.3em] uppercase text-white/35 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="block w-10 h-px bg-white/20" />
          <span>Porsche {carModel} — Thông số</span>
          <span className="block w-10 h-px bg-white/20" />
        </motion.div>

        {/* 🎯 Grid layout chia khoảng trống để các thẻ 3D không dính vào nhau */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-16">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} />
          ))}
        </div>

        {/* Bottom quote */}
        <motion.p 
          className="text-[15px] italic text-white/20 tracking-[0.08em]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          "Không có gì thỏa hiệp. Chỉ có hiệu suất."
        </motion.p>
      </motion.div>
    </section>
  );
}