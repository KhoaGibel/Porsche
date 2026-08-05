import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const SHOWCASE_DATA = [
  {
    id: 'gt3rs',
    name: '911 GT3 RS',
    tagline: 'Thuần chủng đường đua.',
    desc: 'Thiết kế khí động học chủ động, cánh gió thiên nga cỡ lớn và động cơ hút khí tự nhiên 525 PS.',
    stats: [
      { label: 'Công suất', value: '525 PS' },
      { label: 'Tốc độ', value: '296 km/h' },
      { label: 'Tăng tốc', value: '3.2 s' },
    ],
    img: 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1782715196/gt3rs-bg_vcobvv.jpg',
    color: '#ef4444'
  },
  {
    id: 'gt3',
    name: '911 GT3',
    tagline: 'Cảm xúc thăng hoa.',
    desc: 'Linh hoạt, cân bằng hoàn hảo. Chiếc xe thể thao mang lại cảm giác kết nối trực tiếp với người lái.',
    stats: [
      { label: 'Công suất', value: '510 PS' },
      { label: 'Tốc độ', value: '318 km/h' },
      { label: 'Tăng tốc', value: '3.4 s' },
    ],
    img: 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1784492003/gt3_zomfy3.png',
    color: '#3b82f6'
  },
  {
    id: 'turbos',
    name: '911 Turbo S',
    tagline: 'Quyền năng vô tận.',
    desc: 'Chiếc 911 mạnh mẽ nhất với động cơ tăng áp kép 650 PS, bứt tốc 0-100 km/h chỉ trong 2.7 giây.',
    stats: [
      { label: 'Công suất', value: '650 PS' },
      { label: 'Tốc độ', value: '330 km/h' },
      { label: 'Tăng tốc', value: '2.7 s' },
    ],
    img: 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1784492004/image_6_wvqqxb.png',
    color: '#eab308'
  }
];

function ShowcasePanel({ car, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className="relative min-h-screen w-full flex items-center py-20 overflow-hidden">
      
      {/* Background Image Parallax */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <motion.div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${car.img})`, y, scale }}
        />
        {/* Lớp phủ Gradient Tối */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]"></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 w-full">
        <motion.div 
          style={{ opacity }}
          className={`w-full md:w-1/2 flex flex-col justify-center ${isEven ? 'md:pr-10' : 'md:ml-auto md:pl-10'}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-px" style={{ backgroundColor: car.color }}></span>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: car.color }}>
              {car.tagline}
            </span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6 drop-shadow-lg">
            {car.name}
          </h2>
          
          <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 max-w-md backdrop-blur-sm bg-black/20 p-4 rounded-xl border border-white/5">
            {car.desc}
          </p>

          <div className="grid grid-cols-3 gap-4">
            {car.stats.map((stat, i) => (
              <div key={i} className="flex flex-col border-l-2 pl-3 py-1" style={{ borderColor: car.color }}>
                <span className="text-xl md:text-2xl font-bold text-white tracking-wide">{stat.value}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  );
}

export default function TestDriveShowcase() {
  return (
    <section className="bg-[#080808] relative w-full pt-20">
      
      {/* Intro Header */}
      <div className="relative z-20 text-center max-w-3xl mx-auto px-4 pb-20">
        <motion.p 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-red-500 font-bold tracking-[0.3em] uppercase text-xs mb-3"
        >
          Trải Nghiệm Đẳng Cấp
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest mb-4"
        >
          Tuyệt Tác Đường Đua
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          className="text-gray-400 text-sm md:text-base leading-relaxed"
        >
          Trước khi bạn cầm lái, hãy chiêm ngưỡng những cỗ máy đã làm nên lịch sử của Porsche tại Nürburgring. Mỗi chiếc xe mang một linh hồn riêng, một cá tính riêng.
        </motion.p>
      </div>

      {/* Panels */}
      {SHOWCASE_DATA.map((car, idx) => (
        <ShowcasePanel key={car.id} car={car} index={idx} />
      ))}
      
      {/* Spacer transition to booking */}
      <div className="w-full h-32 bg-gradient-to-b from-[#080808] to-[#111111]"></div>
    </section>
  );
}
