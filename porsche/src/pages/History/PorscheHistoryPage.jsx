import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const GENERATIONS = [
  {
    id: 'classic',
    name: '911 Classic',
    years: '1963 - 1973',
    desc: 'Huyền thoại bắt đầu. Sự ra đời của thiết kế fastback và động cơ flat-six làm mát bằng không khí.',
    image: 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1784492003/gt3_zomfy3.png',
    bg: 'https://images.unsplash.com/photo-1584345604476-8f5e305e94be?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '930',
    name: '930 Turbo',
    years: '1975 - 1989',
    desc: 'Kỷ nguyên Turbo. Chiếc siêu xe thực thụ đầu tiên của Porsche với cánh gió "Whale Tail" khét tiếng.',
    image: 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1784492004/image_6_wvqqxb.png',
    bg: 'https://images.unsplash.com/photo-1503371477314-220078028731?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '964',
    name: 'Type 964',
    years: '1989 - 1993',
    desc: 'Cú nhảy vọt về công nghệ với hệ dẫn động 4 bánh toàn thời gian (Carrera 4) và phanh ABS.',
    image: 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1784492003/gt3_zomfy3.png',
    bg: 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '993',
    name: 'Type 993',
    years: '1993 - 1998',
    desc: 'Đỉnh cao và cũng là dấu chấm hết cho kỷ nguyên động cơ làm mát bằng không khí. Tuyệt tác thiết kế.',
    image: 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1784492004/image_6_wvqqxb.png',
    bg: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '996',
    name: 'Type 996',
    years: '1997 - 2005',
    desc: 'Cuộc cách mạng gây tranh cãi: Động cơ làm mát bằng nước và đèn pha "trứng chiên" (Fried egg).',
    image: 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1784492003/gt3_zomfy3.png',
    bg: 'https://images.unsplash.com/photo-1503371477314-220078028731?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '997',
    name: 'Type 997',
    years: '2004 - 2012',
    desc: 'Sự trở lại của đèn pha tròn cổ điển, kết hợp với hộp số ly hợp kép PDK huyền thoại.',
    image: 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1784492004/image_6_wvqqxb.png',
    bg: 'https://images.unsplash.com/photo-1584345604476-8f5e305e94be?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '991',
    name: 'Type 991',
    years: '2011 - 2019',
    desc: 'Khung gầm hoàn toàn mới, thân xe bằng nhôm siêu nhẹ, mở ra kỷ nguyên kỹ thuật số.',
    image: 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1784492003/gt3_zomfy3.png',
    bg: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '992',
    name: 'Type 992',
    years: '2018 - Nay',
    desc: 'Biểu tượng hiện đại. Nhanh hơn, rộng hơn, thông minh hơn với thiết kế đèn dải LED vắt ngang.',
    image: 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1784492004/image_6_wvqqxb.png',
    bg: 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?q=80&w=1000&auto=format&fit=crop',
  },
];

// Component Card 3D
function HistoryCard3D({ item, index }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Thêm độ nảy (spring) để hiệu ứng mượt hơn
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  // Map vị trí chuột sang góc nghiêng (rotate)
  const rotateX = useTransform(springY, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-15deg', '15deg']);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      // Tailwind CSS perspective wrapper
      className="relative w-full aspect-[3/4] md:aspect-[4/5] perspective-[1500px] cursor-pointer group"
    >
      {/* 3D Container */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl bg-[#111] transition-shadow duration-300 group-hover:shadow-[0_20px_50px_rgba(220,38,38,0.2)]"
      >
        {/* Nền Parallax */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-500 group-hover:opacity-20"
          style={{ backgroundImage: `url(${item.bg})`, transform: "translateZ(-50px) scale(1.1)" }}
        />

        {/* Nội dung text */}
        <div 
          className="absolute inset-0 p-6 flex flex-col justify-end"
          style={{ transform: "translateZ(30px)" }}
        >
          <p className="text-red-500 font-bold tracking-widest text-sm mb-1 uppercase drop-shadow-lg">
            {item.years}
          </p>
          <h2 className="text-3xl font-black text-white mb-2 drop-shadow-xl font-['PorscheFont']">
            {item.name}
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-[90%] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            {item.desc}
          </p>
        </div>

        {/* Xe Pop-out 3D */}
        <motion.img 
          src={item.image} 
          alt={item.name}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[110%] max-w-none object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-110"
          style={{ transform: "translateZ(100px) translateX(-50%)" }}
        />
        
        {/* Lớp phản chiếu ánh sáng giả */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ transform: "translateZ(50px)" }} />
      </motion.div>
    </motion.div>
  );
}

export default function PorscheHistoryPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-red-500 selection:text-white">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 p-6 flex justify-between items-center backdrop-blur-md bg-black/30 border-b border-white/10">
        <Link to="/" className="text-white hover:text-red-500 transition-colors flex items-center gap-2 font-bold tracking-widest text-sm">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          TRANG CHỦ
        </Link>
        <div className="font-['PorscheFont'] tracking-[0.3em] uppercase text-xl">
          Di Sản 911
        </div>
        <div className="w-20" /> {/* Spacer */}
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-24 px-4 max-w-[1400px] mx-auto overflow-x-hidden">
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight"
          >
            Tiến hóa của một <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Huyền thoại</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-gray-400 text-lg"
          >
            Hơn 6 thập kỷ, một triết lý duy nhất. Khám phá sự phát triển vĩ đại của Porsche 911 qua công nghệ không gian 3D tương tác.
          </motion.p>
        </div>

        {/* 3D Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {GENERATIONS.map((gen, idx) => (
            <HistoryCard3D key={gen.id} item={gen} index={idx} />
          ))}
        </div>
      </main>

    </div>
  );
}
