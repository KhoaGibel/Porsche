import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Nền sương mù / khói */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Họa tiết lưới mờ (Tech Grid) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center px-4"
      >
        <h1 className="text-[clamp(100px,15vw,200px)] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white/80 to-white/10 tracking-tighter leading-none select-none">
          404
        </h1>
        
        <div className="mt-4 mb-8">
          <p className="text-xl md:text-2xl font-light tracking-wide text-white/90 uppercase">Lệch khỏi đường đua</p>
          <p className="text-sm md:text-base text-white/40 mt-3 max-w-md mx-auto leading-relaxed">
            Trang bạn đang tìm kiếm đã di chuyển với tốc độ tối đa và không còn tồn tại trên bản đồ.
          </p>
        </div>

        <Link 
          to="/" 
          className="inline-flex items-center gap-3 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold tracking-widest text-[11px] uppercase transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:-translate-y-1"
        >
          <span>Quay lại Showroom</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-6-6l6 6-6 6"/></svg>
        </Link>
      </motion.div>
    </div>
  );
}
