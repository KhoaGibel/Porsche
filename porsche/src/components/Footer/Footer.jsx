import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="w-full font-sans">
      
      {/* ── PHẦN TRÊN: NỀN ĐEN TUYỆT ĐỐI ĐỒNG BỘ ── */}
      <div className="bg-black pt-[80px] pb-[60px] px-[5%]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start flex-wrap gap-10">
          
          {/* Cột trái: Thông tin liên lạc */}
          <div className="flex-1 min-w-[300px]">
            <p className="text-[14px] text-white/55 mb-5">Thông tin liên lạc:</p>
            
            <h4 className="text-[15px] font-bold text-white mb-3">Porsche Việt Nam</h4>
            <p className="text-[14px] text-white/55 mb-2.5">Liên hệ chung: info@porsche-vietnam.com</p>
            <p className="text-[14px] text-white/55 mb-8">Dịch vụ Khách hàng: crm@porsche-vietnam.com</p>
            
            <h4 className="text-[15px] font-bold text-white mb-3">Các Trung Tâm Porsche</h4>
            <p className="text-[14px] text-white/55 mb-2.5">Trung Tâm Porsche Sài Gòn</p>
            <p className="text-[14px] text-white/55 mb-2.5">Trung Tâm Porsche Hà Nội</p>
            <p className="text-[14px] text-white/55 mb-2.5">Porsche Studio Hà Nội</p>
          </div>

          {/* Cột phải: Mạng xã hội & Nút chia sẻ */}
          <div className="w-full md:w-[320px] flex flex-col gap-8">
            <button className="flex items-center gap-3 w-full bg-white/5 text-white border border-white/10 px-5 py-4 text-[14px] font-bold cursor-pointer transition-colors duration-300 hover:bg-white hover:text-black group">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] transition-transform group-hover:scale-110">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
              Chia sẻ trang
            </button>

            <div className="flex flex-col gap-[14px]">
              <p className="text-[14px] text-white/55 m-0">Kết nối với Porsche</p>
              <div className="flex gap-2.5">
                <a href="https://www.facebook.com/Official.Porsche.Importer.Vietnam" aria-label="Facebook Porsche Vietnam" className="flex justify-center items-center w-[46px] h-[46px] bg-white/5 text-white border border-white/10 transition-colors duration-300 hover:bg-white hover:text-black group">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transition-transform group-hover:scale-110">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.53 11.16 6.5 13 6.5c.88 0 1.82.16 1.82.16v2h-1.03c-1.01 0-1.32.63-1.32 1.27V12h2.39l-.38 3h-2.01v6.8C18.56 20.87 22 16.84 22 12z"/>
                  </svg>
                </a>
                <a href="https://www.youtube.com/@Porsche" aria-label="YouTube Porsche" className="flex justify-center items-center w-[46px] h-[46px] bg-white/5 text-white border border-white/10 transition-colors duration-300 hover:bg-white hover:text-black group">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transition-transform group-hover:scale-110">
                    <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/porsche_vietnam/" aria-label="Instagram Porsche Vietnam" className="flex justify-center items-center w-[46px] h-[46px] bg-white/5 text-white border border-white/10 transition-colors duration-300 hover:bg-white hover:text-black group">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transition-transform group-hover:scale-110">
                    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.77.13 4.9.31 4.14.61c-.8.3-1.47.73-2.14 1.4-.67.67-1.1 1.34-1.4 2.14-.3.76-.48 1.63-.54 2.91C0 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.24 2.15.54 2.91.3.8.73 1.47 1.4 2.14.67.67 1.34 1.1 2.14 1.4.76.3 1.63.48 2.91.54 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.28-.06 2.15-.24 2.91-.54.8-.3 1.47-.73 2.14-1.4.67-.67 1.1-1.34 1.4-2.14.3-.76.48-1.63.54-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.24-2.15-.54-2.91-.3-.8-.73-1.47-1.4-2.14-.67-.67-1.34-1.1-2.14-1.4-.76-.3-1.63-.48-2.91-.54C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm7.85-11.45a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* ── PHẦN DƯỚI: MÀU ĐEN TUYỆT ĐỐI ── */}
      <div className="bg-black py-[30px] px-[5%] border-t border-white/5">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-3">
          <p className="m-0 text-[13px] text-white/70">© Porsche Việt Nam 2026</p>
          <a href="https://porsche-vietnam.vn/chinh-sach-quyen-rieng-tu/" className="text-white/70 text-[13px] underline underline-offset-4 w-fit transition-colors duration-300 hover:text-white">
            Chính sách quyền riêng tư
          </a>
        </div>
      </div>
    </footer>
  );
}