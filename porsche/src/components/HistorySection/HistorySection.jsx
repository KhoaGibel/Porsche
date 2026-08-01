import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HistorySection({ id, bgImage }) {
  const navigate = useNavigate();
  const videoUrl = "https://www.youtube.com/embed/Qr3WT7VXYtI?si=yISuP6u3OSp9l_Q1";

  return (
    <section 
      id={id} 
      // 🎯 ĐÃ SỬA: Dùng grid, xoá bỏ các margin âm
      className="relative w-full min-h-[100dvh] pt-[80px] pb-24 flex flex-col justify-center items-center overflow-hidden shrink-0"
    >
      
      {/* ── Nền Parallax ── */}
      {bgImage && (
        <div className="absolute inset-0 w-full h-full z-0">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-fixed"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
      )}

      {/* ── Container Nội dung ── */}
      <div className="relative z-10 w-full max-w-[80rem] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* CỘT TRÁI: VIDEO YOUTUBE */}
        <div className="relative w-full z-10 rounded-2xl overflow-hidden shadow-2xl aspect-video bg-black ring-1 ring-white/20">
          <iframe 
            className="absolute inset-0 w-full h-full"
            src={videoUrl} 
            title="Porsche History"
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>

        {/* CỘT PHẢI: NỘI DUNG */}
        <div className="relative w-full z-20 flex flex-col gap-6">

          {/* Khối tiêu đề tối */}
          <div className="relative z-30 bg-[#1a1b26] text-white p-6 md:p-8 shadow-2xl border-t border-l border-white/10 rounded-xl overflow-hidden">
            <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
              Nơi khởi nguồn cho những huyền thoại tốc độ
            </h2>
            <div 
              className="absolute top-0 right-0 w-32 h-full opacity-10 pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(90deg, transparent 95%, white 95%), linear-gradient(transparent 95%, white 95%)', backgroundSize: '20px 20px' }}
            ></div>
          </div>

          {/* Khối chữ */}
          <div className="relative z-20 px-2 lg:px-4">
            <p className="text-white/90 mb-8 leading-relaxed text-justify text-sm md:text-base font-medium drop-shadow-md">
              Bắt nguồn từ tầm nhìn của Ferry Porsche vào năm 1948, Porsche đã định hình lại toàn bộ thế giới xe thể thao. Dựa trên triết lý kết hợp giữa trọng lượng nhẹ, tính khí động học tinh tế và khối động cơ Boxer đặt sau huyền thoại, mỗi chiếc Porsche đều là một cỗ máy cơ khí hoàn hảo — sinh ra trên đường đua và dành cho cuộc sống thực.
            </p>

            {/* Nút Tìm hiểu thêm */}
            <div className="flex justify-start items-center">
              <button 
                onClick={() => navigate('/history')}
                className="group flex items-center gap-3 font-bold text-white hover:text-red-500 transition-colors cursor-pointer drop-shadow-md"
              >
                Khám phá các thế hệ 3D
                <span className="bg-[#d5001c] text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-transform group-hover:translate-x-2">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}