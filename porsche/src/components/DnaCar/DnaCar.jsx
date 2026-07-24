import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis,
  Radar, ResponsiveContainer, Tooltip,
} from 'recharts';

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
    desc: 'Được tối ưu hoàn toàn cho circuit. Cánh gió active 860kg downforce, chỉ 1,450kg.',
    best: 'Xử lý & Âm thanh',
  },
  'GT3': {
    tagline: 'Cân bằng hoàn hảo',
    desc: 'Sự cân bằng hoàn hảo giữa đường đua và đường phố. Tùy chọn số sàn 6 cấp.',
    best: 'Xử lý & Giá trị',
  },
  '911 Turbo S': {
    tagline: 'Vũ khí tối thượng',
    desc: '650PS + 800Nm + AWD = 0-100 trong 2.7 giây. Siêu xe dùng hàng ngày.',
    best: 'Tốc độ & Công nghệ',
  },
};

const CustomAxisTick = ({ x, y, payload }) => (
  <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
    fill="rgba(255,255,255,0.6)" fontSize={9} fontWeight={700}
    style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}
  >
    {payload.value}
  </text>
);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#080808]/95 border border-white/20 rounded-xl p-3 flex flex-col gap-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor]" style={{ background: p.color, color: p.color }} />
          <span className="text-white/60 flex-1">{p.name}</span>
          <span className="text-white tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DnaCar() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });
  
  const [selectedCars, setSelectedCars] = useState(['GT3 RS', 'GT3']);

  const handleCarClick = (car) => {
    if (selectedCars.includes(car)) {
      if (selectedCars.length > 1) {
        setSelectedCars(selectedCars.filter(c => c !== car));
      }
    } else {
      setSelectedCars([...selectedCars, car]);
    }
  };

  return (
    // 🎯 Tăng pt-[120px] md:pt-[140px] để ép toàn bộ nội dung xuống dưới Navbar
    <section ref={ref} className="relative bg-[#030303] min-h-[100dvh] pt-[120px] md:pt-[140px] pb-12 px-[5%] flex flex-col items-center overflow-hidden z-10">
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")` }}
      />

      {/* Header - Thu nhỏ font chữ để gọn gàng hơn */}
      <motion.div 
        className="text-center max-w-[500px] mx-auto mb-8 md:mb-10 relative z-10"
        initial={{ opacity:0, y:20 }}
        animate={isInView ? { opacity:1, y:0 } : {}}
        transition={{ duration:0.7 }}
      >
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#dc2626] mb-2.5">
          So sánh DNA dòng xe
        </p>
        <h2 className="text-[clamp(24px,3.5vw,36px)] font-light text-white leading-tight tracking-tight mb-2.5">
          Chọn đúng Porsche<br />cho bạn
        </h2>
        <p className="text-[12px] text-white/40 leading-relaxed">
          Tích chọn hoặc bỏ chọn các thẻ xe bên phải để chồng lớp thông số so sánh.
        </p>
      </motion.div>

      {/* 🎯 Bóp max-width từ 1000px xuống 900px, khoảng cách gap nhỏ lại */}
      <div className="w-full max-w-[900px] grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 md:gap-12 items-center relative z-10">
        
        {/* Radar chart */}
        <motion.div 
          className="relative w-full custom-radar-chart flex justify-center"
          initial={{ opacity:0, scale:0.95 }}
          animate={isInView ? { opacity:1, scale:1 } : {}}
          transition={{ duration:0.8, delay:0.2 }}
        >
          {/* Hào quang gradient chìm phía sau Radar */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full blur-3xl opacity-25 bg-white/10 pointer-events-none" />
          
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={DNA_DATA} margin={{ top:25, right:35, bottom:25, left:35 }}>
              {/* 🎯 Làm lưới nhện sáng hơn một chút để dễ nhìn */}
              <PolarGrid stroke="rgba(255,255,255,0.15)" gridType="polygon" />
              <PolarAngleAxis dataKey="axis" tick={<CustomAxisTick />} />
              <Tooltip content={<CustomTooltip />} cursor={false} />

              {Object.entries(CAR_COLORS).map(([car, color]) => {
                const isVisible = selectedCars.includes(car);
                return (
                  <Radar
                    key={car}
                    name={car}
                    dataKey={car}
                    stroke={color}
                    fill={color}
                    // 🎯 Tăng độ đậm nhạt và độ dày viền
                    fillOpacity={isVisible ? 0.25 : 0}
                    strokeWidth={isVisible ? 3 : 0}
                    strokeOpacity={isVisible ? 1 : 0}
                    // 🎯 THÊM DOTS (Chấm tròn ở các đỉnh) ĐỂ TẠO ĐIỂM NHẤN SCI-FI
                    dot={isVisible ? { r: 4, fill: '#030303', stroke: color, strokeWidth: 2 } : false}
                    activeDot={isVisible ? { r: 6, fill: color, stroke: '#fff', strokeWidth: 2 } : false}
                    isAnimationActive={true}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    // 🎯 Tăng mạnh hiệu ứng Glowing
                    style={{ 
                      filter: isVisible ? `drop-shadow(0px 0px 12px ${color})` : 'none',
                      transition: 'all 0.5s ease'
                    }}
                  />
                );
              })}
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Car selector cards */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 snap-x w-full max-w-[400px] mx-auto lg:max-w-none">
          {Object.entries(CAR_PROFILES).map(([car, info], i) => {
            const isSelected = selectedCars.includes(car);
            return (
              <motion.div
                key={car}
                onClick={() => handleCarClick(car)}
                className={`
                  relative p-4 rounded-xl border cursor-pointer transition-all duration-500 overflow-hidden shrink-0 sm:w-[260px] lg:w-full snap-start backdrop-blur-md
                  ${isSelected 
                    ? 'border-white/20 bg-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.6)] scale-100' 
                    : 'border-white/5 bg-white/5 scale-[0.97] hover:scale-100 hover:bg-white/10 hover:-translate-y-[2px] opacity-60 hover:opacity-100'
                  }
                `}
                initial={{ opacity:0, x:20 }}
                animate={isInView ? { opacity:1, x:0 } : {}}
                transition={{ duration:0.5, delay:0.3 + i * 0.1 }}
              >
                {/* Thanh LED phát sáng */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-500"
                  style={{ 
                    backgroundColor: CAR_COLORS[car],
                    boxShadow: isSelected ? `0 0 12px ${CAR_COLORS[car]}, 0 0 24px ${CAR_COLORS[car]}` : 'none',
                    opacity: isSelected ? 1 : 0
                  }}
                />

                <div className="flex items-center gap-2 mb-2 pl-3">
                  <motion.div 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: CAR_COLORS[car] }} 
                    animate={isSelected ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : { scale: 1, opacity: 0.3 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <h3 className="text-[13px] md:text-[14px] font-bold text-white tracking-wide">{car}</h3>
                </div>
                
                <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1.5 pl-5" style={{ color: CAR_COLORS[car] }}>
                  {info.tagline}
                </p>
                <p className="text-[10px] text-white/50 leading-relaxed mb-2 pl-5">
                  {info.desc}
                </p>
                
                <div className="flex items-center gap-1.5 pl-5">
                  <span className="text-[8px] text-white/30 tracking-[0.1em] uppercase">Mạnh nhất</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: CAR_COLORS[car] }}>
                    {info.best}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Cấu hình CSS cho Recharts */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-radar-chart .recharts-polar-grid-concentric-polygon {
          stroke: rgba(255,255,255,0.1) !important;
        }
        .custom-radar-chart .recharts-polygon {
          transition: fill-opacity 0.4s ease, stroke-width 0.4s ease;
        }
      `}} />
    </section>
  );
}