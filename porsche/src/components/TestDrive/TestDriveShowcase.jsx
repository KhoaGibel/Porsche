import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const SHOWCASE_DATA = [
  {
    id: 'gt3rs',
    name: '911 GT3 RS',
    tagline: 'Thuần Đường Đua',
    desc: 'Sinh ra tại cơ sở đua xe thể thao Flacht, 911 GT3 RS là chiếc xe tiến gần nhất đến giải đua mô tô thể thao thuần túy. Trang bị động cơ nạp khí tự nhiên 4.0 lít vòng tua cao và thiết kế khí động học được mài dũa qua hàng nghìn giờ trong hầm gió. Nó không chỉ nhanh, nó bẻ cong các định luật vật lý.',
    stats: [
      { label: 'Downforce', value: '860 kg' },
      { label: 'Tăng tốc', value: '3.2 s' },
      { label: 'Công suất', value: '525 PS' },
    ],
    img: 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?q=80&w=1200&auto=format&fit=crop',
    color: '#dc2626' // red
  },
  {
    id: 'gt3',
    name: '911 GT3',
    tagline: 'Cân Bằng Hoàn Hảo',
    desc: 'Giữ vững truyền thống thuần khiết. 911 GT3 mang linh hồn đường đua vào đường phố. Được trang bị hệ thống treo tay đòn kép phía trước từ 911 RSR và động cơ hút khí tự nhiên gầm rú đến 9.000 vòng/phút, chiếc xe này dành cho những người lái chân chính.',
    stats: [
      { label: 'Vòng tua', value: '9,000 RPM' },
      { label: 'Tăng tốc', value: '3.4 s' },
      { label: 'Công suất', value: '503 PS' },
    ],
    img: 'https://images.unsplash.com/photo-1503371477314-220078028731?q=80&w=1200&auto=format&fit=crop',
    color: '#3b82f6' // blue
  },
  {
    id: 'turbos',
    name: '911 Turbo S',
    tagline: 'Vũ Khí Tối Thượng',
    desc: 'Hơn 40 năm tiến hóa, Turbo S luôn định nghĩa lại giới hạn của siêu xe dùng hàng ngày. Động cơ Twin-turbo mạnh 650 mã lực, hệ dẫn động 4 bánh toàn thời gian thông minh giúp chiếc xe bứt tốc lên 100km/h chỉ trong 2.7 giây trong khi vẫn giữ được sự êm ái đáng kinh ngạc.',
    stats: [
      { label: 'Mô-men xoắn', value: '800 Nm' },
      { label: 'Tăng tốc', value: '2.7 s' },
      { label: 'Công suất', value: '650 PS' },
    ],
    img: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1200&auto=format&fit=crop',
    color: '#d4af37' // gold
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
