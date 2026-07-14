import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import './StatsSection.css';
 
const CAR_STATS = {
  'GT3 RS': [
    { value: 525,    suffix: '',     label: 'Mã lực',         sub: '4.0L Boxer 6 xi-lanh' },
    { value: 3.2,    suffix: 's',    label: '0 – 100 km/h',   sub: 'PDK 7 cấp' },
    { value: 296,    suffix: '',     label: 'Tốc độ tối đa',  sub: 'km/h' },
    { value: 860,    suffix: 'kg',   label: 'Downforce',       sub: 'ở 285 km/h' },
    { value: 1450,   suffix: 'kg',   label: 'Trọng lượng',    sub: 'Nhẹ hơn GT3 50kg' },
    { value: 15.8,   suffix: 'tỷ',   label: 'Giá từ',         sub: 'VNĐ' },
  ],
  'GT3': [
    { value: 503,    suffix: '',     label: 'Mã lực',         sub: '4.0L Boxer 6 xi-lanh' },
    { value: 3.4,    suffix: 's',    label: '0 – 100 km/h',   sub: 'PDK 7 / Số sàn 6' },
    { value: 320,    suffix: '',     label: 'Tốc độ tối đa',  sub: 'km/h' },
    { value: 470,    suffix: 'Nm',   label: 'Mô-men xoắn',    sub: 'tại 6,100 rpm' },
    { value: 1435,   suffix: 'kg',   label: 'Trọng lượng',    sub: 'Cầu sau (RWD)' },
    { value: 12.5,   suffix: 'tỷ',   label: 'Giá từ',         sub: 'VNĐ' },
  ],
  '911 TURBO S': [
    { value: 650,    suffix: '',     label: 'Mã lực',         sub: '3.8L Biturbo 6' },
    { value: 2.7,    suffix: 's',    label: '0 – 100 km/h',   sub: 'PDK 8 cấp AWD' },
    { value: 330,    suffix: '',     label: 'Tốc độ tối đa',  sub: 'km/h' },
    { value: 800,    suffix: 'Nm',   label: 'Mô-men xoắn',    sub: 'tại 2,500 rpm' },
    { value: 1640,   suffix: 'kg',   label: 'Trọng lượng',    sub: 'AWD toàn thời gian' },
    { value: 22.3,   suffix: 'tỷ',   label: 'Giá từ',         sub: 'VNĐ' },
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
  }, [isInView]);
 
  return (
    <motion.div
      ref={ref}
      className="stat-card"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="stat-value">
        <span className="stat-number">{count}</span>
        <span className="stat-suffix">{stat.suffix}</span>
      </div>
      <p className="stat-label">{stat.label}</p>
      <p className="stat-sub">{stat.sub}</p>
    </motion.div>
  );
}
 
export default function StatsSection({ carModel = 'GT3 RS' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const opacity    = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const yBg        = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
 
  const stats = CAR_STATS[carModel] ?? CAR_STATS['GT3 RS'];
 
  return (
    <section ref={ref} className="stats-section">
      {/* Parallax background line */}
      <motion.div className="stats-bg-line" style={{ y: yBg }} />
 
      <motion.div className="stats-inner" style={{ opacity }}>
        {/* Eyebrow */}
        <motion.div className="stats-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="stats-eyebrow-line" />
          <span>Porsche {carModel} — Thông số</span>
          <span className="stats-eyebrow-line" />
        </motion.div>
 
        {/* Grid stats */}
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} />
          ))}
        </div>
 
        {/* Bottom quote */}
        <motion.p className="stats-quote"
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