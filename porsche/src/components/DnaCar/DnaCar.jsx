import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis,
  Radar, ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import './DnaCar.css';

const DNA_DATA = [
  { axis: 'Tốc độ',      'GT3 RS': 95, 'GT3': 88, '911 Turbo S': 98 },
  { axis: 'Xử lý',       'GT3 RS': 99, 'GT3': 96, '911 Turbo S': 85 },
  { axis: 'Comfort',     'GT3 RS': 40, 'GT3': 55, '911 Turbo S': 82 },
  { axis: 'Công nghệ',   'GT3 RS': 85, 'GT3': 82, '911 Turbo S': 95 },
  { axis: 'Âm thanh',    'GT3 RS': 99, 'GT3': 95, '911 Turbo S': 78 },
  { axis: 'Giá trị',     'GT3 RS': 70, 'GT3': 80, '911 Turbo S': 65 },
];

const CAR_COLORS = {
  'GT3 RS':      '#dc2626',
  'GT3':         '#3b82f6',
  '911 Turbo S': '#d4af37',
};

const CAR_PROFILES = {
  'GT3 RS': {
    tagline: 'Thuần đường đua',
    desc: 'Được tối ưu hoàn toàn cho circuit. Cánh gió active 860kg downforce, chỉ 1,450kg — đây là GT3 RS chứ không phải xe đường phố.',
    best: 'Xử lý & Âm thanh',
  },
  'GT3': {
    tagline: 'Cân bằng hoàn hảo',
    desc: 'Sự cân bằng hoàn hảo giữa đường đua và đường phố. Có thể chọn số sàn 6 cấp — điều hiếm gặp trong thời đại PDK.',
    best: 'Xử lý & Giá trị',
  },
  '911 Turbo S': {
    tagline: 'Vũ khí tối thượng',
    desc: '650PS + 800Nm + AWD = 0-100 trong 2.7 giây. Đây là siêu xe dùng hàng ngày mà không cần đánh đổi comfort.',
    best: 'Tốc độ & Công nghệ',
  },
};

// Custom Radar Chart label
const CustomAxisTick = ({ x, y, payload }) => (
  <text 
    x={x} 
    y={y} 
    textAnchor="middle" 
    dominantBaseline="central"
    fill="rgba(255,255,255,0.4)" 
    fontSize={11} 
    fontWeight={500}
    // Chuyển các thuộc tính CSS vào đúng chỗ của nó:
    style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
  >
    {payload.value}
  </text>
);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="dna-tooltip">
      {payload.map((p, i) => (
        <div key={i} className="dna-tooltip-row">
          <span className="dna-tooltip-dot" style={{ background: p.color }} />
          <span className="dna-tooltip-name">{p.name}</span>
          <span className="dna-tooltip-val">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DnaCar() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-15%' });
  const [activeCar, setActiveCar] = useState(null); // hover highlight

  const profile = activeCar ? CAR_PROFILES[activeCar] : null;

  return (
    <section ref={ref} className="dna-section">
      {/* Header */}
      <motion.div className="dna-header"
        initial={{ opacity:0, y:30 }}
        animate={isInView ? { opacity:1, y:0 } : {}}
        transition={{ duration:0.8 }}
      >
        <p className="dna-eyebrow">So sánh DNA dòng xe</p>
        <h2 className="dna-title">Chọn đúng Porsche<br />cho bạn</h2>
        <p className="dna-subtitle">
          Mỗi mẫu xe có triết lý riêng — hover để khám phá điểm mạnh của từng dòng.
        </p>
      </motion.div>

      <div className="dna-body">
        {/* Radar chart */}
        <motion.div className="dna-chart-wrap"
          initial={{ opacity:0, scale:0.95 }}
          animate={isInView ? { opacity:1, scale:1 } : {}}
          transition={{ duration:1, delay:0.3 }}
        >
          <ResponsiveContainer width="100%" height={440}>
            <RadarChart data={DNA_DATA} margin={{ top:20, right:30, bottom:20, left:30 }}>
              <PolarGrid
                stroke="rgba(255,255,255,0.07)"
                gridType="polygon"
              />
              <PolarAngleAxis dataKey="axis" tick={<CustomAxisTick />} />
              <Tooltip content={<CustomTooltip />} />

              {Object.entries(CAR_COLORS).map(([car, color]) => (
                <Radar
                  key={car}
                  name={car}
                  dataKey={car}
                  stroke={color}
                  fill={color}
                  fillOpacity={activeCar === car ? 0.25 : activeCar ? 0.04 : 0.12}
                  strokeWidth={activeCar === car ? 2.5 : activeCar ? 0.5 : 1.5}
                  strokeOpacity={activeCar && activeCar !== car ? 0.3 : 1}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Car selector cards */}
        <div className="dna-cars">
          {Object.entries(CAR_PROFILES).map(([car, info], i) => (
            <motion.div
              key={car}
              className={`dna-car-card ${activeCar === car ? 'active' : ''} ${activeCar && activeCar !== car ? 'dimmed' : ''}`}
              style={{ '--car-color': CAR_COLORS[car] }}
              onMouseEnter={() => setActiveCar(car)}
              onMouseLeave={() => setActiveCar(null)}
              initial={{ opacity:0, x:20 }}
              animate={isInView ? { opacity:1, x:0 } : {}}
              transition={{ duration:0.6, delay:0.2 + i * 0.1 }}
            >
              <div className="dna-car-top">
                <div className="dna-car-dot" style={{ background: CAR_COLORS[car] }} />
                <h3 className="dna-car-name">{car}</h3>
              </div>
              <p className="dna-car-tagline">{info.tagline}</p>
              <p className="dna-car-desc">{info.desc}</p>
              <div className="dna-car-best">
                <span className="dna-car-best-label">Điểm mạnh nhất</span>
                <span className="dna-car-best-val" style={{ color: CAR_COLORS[car] }}>
                  {info.best}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div className="dna-cta"
        initial={{ opacity:0 }}
        animate={isInView ? { opacity:1 } : {}}
        transition={{ duration:0.8, delay:0.8 }}
      >
        <p>Vẫn chưa chắc? Đặt lịch lái thử cả 3 dòng xe tại showroom.</p>
        <a href="/#3d-showroom" className="dna-cta-btn">Trải nghiệm ngay</a>
      </motion.div>
    </section>
  );
}