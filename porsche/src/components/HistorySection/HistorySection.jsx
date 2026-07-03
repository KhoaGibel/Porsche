import React from 'react';
import './HistorySection.css'; // Import file CSS thần thánh

export default function HistorySection({ id, bgImage }) {
  const videoUrl = "https://www.youtube.com/embed/Qr3WT7VXYtI?si=yISuP6u3OSp9l_Q1";

  return (
    <section id={id} className="history-section">
      
      {/* ── Nền Parallax ── */}
      {bgImage && (
        <>
          <div 
            className="history-bg-image"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          <div className="history-bg-overlay"></div>
        </>
      )}

      {/* ── Container Nội dung ── */}
      <div className="history-container">

        {/* CỘT TRÁI: VIDEO YOUTUBE */}
        <div className="history-video-col">
          <iframe 
            className="history-iframe"
            src={videoUrl} 
            title="Porsche History"
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>

        {/* CỘT PHẢI: NỘI DUNG XẾP CHỒNG */}
        <div className="history-text-col">

          {/* Khối tiêu đề tối */}
          <div className="history-dark-box">
            <h2 className="history-dark-title">
              Nơi khởi nguồn cho những huyền thoại tốc độ
            </h2>
            <div className="history-grid-pattern"></div>
          </div>

          {/* Khối chữ trắng */}
          <div>
            <p className="history-desc">
              Bắt nguồn từ tầm nhìn của Ferry Porsche vào năm 1948, Porsche đã định hình lại toàn bộ thế giới xe thể thao. Dựa trên triết lý kết hợp giữa trọng lượng nhẹ, tính khí động học tinh tế và khối động cơ Boxer đặt sau huyền thoại, mỗi chiếc Porsche đều là một cỗ máy cơ khí hoàn hảo — sinh ra trên đường đua và dành cho cuộc sống thực.
            </p>

            {/* Nút Tìm hiểu thêm */}
            <div className="history-cta-wrapper">
              <button className="history-cta-btn">
                Tìm hiểu thêm về di sản
                <span className="history-cta-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
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