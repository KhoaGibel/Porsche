import React from 'react';
import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

export default function CinematicPreloader({ isSuspenseFallback = false }) {
  // Nếu dùng làm Suspense fallback, ta giả lập tiến trình chạy mượt mà
  // Nếu dùng trong App.jsx cho 3D, ta lấy progress thực tế từ useProgress()
  const { progress, active } = useProgress();
  
  // Khi là Suspense, active có thể false nhưng ta vẫn muốn show
  const isVisible = isSuspenseFallback ? true : active;
  const currentProgress = isSuspenseFallback ? null : progress;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut", delay: 0.2 } }}
          className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col items-center justify-center pointer-events-none"
        >
          {/* Logo Porsche hoặc Text */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
          >
            <h1 className="text-white tracking-[0.4em] text-sm md:text-base font-medium uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              Porsche
            </h1>
            
            <div className="w-[200px] h-[2px] bg-white/10 rounded-full overflow-hidden">
              {isSuspenseFallback ? (
                <div className="h-full bg-red-600 w-full animate-[loading_1.5s_ease-in-out_infinite] origin-left" 
                     style={{ animationName: 'indeterminate' }} />
              ) : (
                <motion.div 
                  className="h-full bg-red-600 shadow-[0_0_10px_#dc2626]"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentProgress}%` }}
                  transition={{ ease: "linear", duration: 0.1 }}
                />
              )}
            </div>
            
            {!isSuspenseFallback && (
              <div className="text-[10px] text-white/40 tracking-widest font-bold tabular-nums">
                {Math.round(currentProgress)}%
              </div>
            )}
          </motion.div>

          <style>{`
            @keyframes indeterminate {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(0%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
