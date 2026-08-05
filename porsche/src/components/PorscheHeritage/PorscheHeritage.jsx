import React from 'react';
import { motion } from 'framer-motion';

const GENERATIONS = [
  { year: '1963', model: '911 (901)', desc: 'Sự ra đời của một biểu tượng. Khởi đầu với thiết kế đuôi dốc và động cơ Boxer 6 xy-lanh.', img: 'https://images.unsplash.com/photo-1611651338412-8403fa6e3599?q=80&w=800&auto=format&fit=crop' },
  { year: '1973', model: 'G-Series', desc: 'Thế hệ kéo dài nhất (15 năm), đặc trưng bởi cản va chống sốc theo chuẩn Mỹ.', img: 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1784492003/gt3_zomfy3.png' },
  { year: '1988', model: 'Type 964', desc: 'Thay đổi 85% bộ phận mới, hệ dẫn động 4 bánh toàn thời gian lần đầu xuất hiện.', img: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=800&auto=format&fit=crop' },
  { year: '1993', model: 'Type 993', desc: 'Thế hệ cuối cùng sử dụng động cơ tản nhiệt bằng không khí (Air-cooled) danh tiếng.', img: 'https://res.cloudinary.com/dq8xgcqhk/image/upload/f_auto,q_auto/v1784492004/image_6_wvqqxb.png' },
  { year: '1997', model: 'Type 996', desc: 'Cuộc cách mạng với động cơ làm mát bằng nước và cụm đèn pha gây tranh cãi.', img: 'https://images.unsplash.com/photo-1544604213-92f72bc8bdf7?q=80&w=800&auto=format&fit=crop' },
  { year: '2004', model: 'Type 997', desc: 'Trở lại với đèn pha tròn truyền thống, thiết kế tinh tế và mạnh mẽ hơn.', img: 'https://images.unsplash.com/photo-1533230635445-0959fc93b6e8?q=80&w=800&auto=format&fit=crop' },
  { year: '2011', model: 'Type 991', desc: 'Bước nhảy vọt về khung gầm và vật liệu siêu nhẹ (nhôm và thép cường lực).', img: 'https://images.unsplash.com/photo-1503376713210-9b4335cfa319?q=80&w=800&auto=format&fit=crop' },
  { year: '2018', model: 'Type 992', desc: 'Kỷ nguyên số hóa. Thiết kế hiện đại nhưng vẫn giữ nguyên linh hồn 911 cổ điển.', img: 'https://images.unsplash.com/photo-1614026480209-cd9934144671?q=80&w=800&auto=format&fit=crop' },
];

export default function PorscheHeritage({ id }) {
  return (
    <section id={id} className="relative w-full min-h-[100dvh] pt-[140px] md:pt-[180px] bg-transparent flex flex-col justify-center overflow-hidden">
      
      {/* Background Decor - Optimized (No CSS Blur) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(220,38,38,0.15)_0%,transparent_70%)] rounded-full"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(153,27,27,0.15)_0%,transparent_70%)] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-[90rem] mx-auto px-4 md:px-8 pb-10">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <p className="text-red-600 font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-2">911 Generations</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white uppercase tracking-wider">
            Di sản qua nhiều thế hệ
          </h2>
        </div>

        {/* Carousel / Timeline */}
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar">
          {GENERATIONS.map((gen, idx) => (
            <motion.div 
              key={gen.year}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative min-w-[280px] md:min-w-[320px] h-[400px] md:h-[480px] rounded-2xl overflow-hidden snap-center shrink-0 group cursor-pointer"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${gen.img})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end h-full">
                <span className="text-red-500 font-black text-4xl mb-1 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                  {gen.year}
                </span>
                <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide group-hover:translate-y-[-4px] transition-transform duration-300">
                  {gen.model}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed max-h-0 opacity-0 group-hover:max-h-[100px] group-hover:opacity-100 group-hover:mt-2 overflow-hidden transition-all duration-500">
                  {gen.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
}
