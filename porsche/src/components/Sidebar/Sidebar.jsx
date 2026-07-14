import { useState } from 'react';
import useCarStore from '../../store/useCarStore';
import { CAR_DATA } from '../../data/carData';
import './Sidebar.css';
import { useIsMobile } from '../../hooks/useIsMobile';
import TestDriveModal from '../TestDriveModal/TestDriveModal';

export default function Sidebar() {
  const isSidebarOpen = useCarStore((state) => state.isSidebarOpen);
  const toggleSidebar = useCarStore((state) => state.toggleSidebar);
  const setCarColor   = useCarStore((state) => state.setCarColor); 
  const activeCar     = useCarStore((state) => state.activeCar) ?? 'GT3 RS';
  
  const isMobile = useIsMobile();
  const [showTestDrive, setShowTestDrive] = useState(false);
  const [activeTab, setActiveTab]         = useState('specs');   
  const [selectedColor, setSelectedColor] = useState(null);

  const car = CAR_DATA[activeCar] ?? CAR_DATA['GT3 RS'];

  return (
    <div
      className={`
        z-50 flex flex-col shadow-2xl bg-white/95 backdrop-blur-md border-l border-gray-200
        transform transition-transform duration-500 ease-in-out text-gray-900
        ${isMobile
          ? `fixed bottom-0 left-0 right-0 rounded-t-3xl h-[80dvh] overflow-hidden overscroll-none touch-none
             ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full'}`
          : `absolute top-0 right-0 h-full w-80 md:w-96
             ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
        }
      `}
    >
      {/* Handle kéo — chỉ hiện trên mobile */}
      {isMobile && (
        <div className="flex justify-center pt-4 pb-2 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-gray-300" />
        </div>
      )}

      {/* ══════════════════════════════════
          HEADER
      ══════════════════════════════════ */}
      <div className={`px-8 ${isMobile ? 'pt-4' : 'pt-28'} pb-6 border-b shrink-0 border-gray-200`}>
        {/* Nút đóng (X) */}
        <button
          onClick={toggleSidebar}
          className={`absolute ${isMobile ? 'top-4 right-6' : 'top-28 right-8'} p-2 rounded-full transition-colors hover:bg-gray-100 text-gray-500 hover:text-gray-900`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tiêu đề */}
        <h1 className="text-3xl font-black uppercase tracking-widest mb-1 text-gray-900">
          Porsche
        </h1>
        <h2 className="text-xl font-medium mb-1 text-gray-500">
          {activeCar}
        </h2>
        <p className="text-sm text-gray-500">{car.tagline}</p>

        {/* Badge giá */}
        <span className="price-badge mt-2 inline-block">
          {car.price}
        </span>
      </div>

      {/* ══════════════════════════════════
          TABS
      ══════════════════════════════════ */}
      <div className="flex gap-1 mx-8 mt-5 mb-2 p-1 rounded-xl shrink-0 bg-gray-100">
        {[
          { id: 'specs',  label: 'Thông số' },
          { id: 'colors', label: 'Màu sắc'  },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════
          NỘI DUNG — Cuộn mượt mà
      ══════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y px-8 py-2 sidebar-scroll">
        
        {/* ── TAB: THÔNG SỐ KỸ THUẬT ── */}
        {activeTab === 'specs' && (
          <div className="flex flex-col gap-3 sidebar-tab-content pb-6">
            <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-gray-500">
              Thông số kỹ thuật
            </p>

            {Object.entries(car.specs).map(([label, value]) => (
              <div
                key={label}
                className="spec-row p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs uppercase tracking-widest font-semibold flex-shrink-0 text-gray-500">
                    {label}
                  </span>
                  <span className="text-sm font-bold text-right text-gray-900">
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: CHỌN MÀU XE ── */}
        {activeTab === 'colors' && (
          <div className="sidebar-tab-content pb-6">
            <p className="text-xs uppercase tracking-widest font-semibold mb-4 text-gray-500">
              Chọn màu sơn
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              {car.colors.map((color) => {
                const isSelected = selectedColor?.name === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color); 
                      setCarColor(color.hex);  
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all
                      ${isSelected
                        ? 'border-gray-400 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white shadow-sm'
                      }`}
                  >
                    <div
                      className={`color-swatch w-10 h-10 rounded-full ${isSelected ? 'selected' : ''}`}
                      style={{
                        backgroundColor: color.hex,
                        /* Đổi vòng viền focus thành màu trắng để tệp với nền mới */
                        boxShadow: isSelected
                          ? `0 0 0 3px #ffffff, 0 0 0 5px ${color.hex}`
                          : '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                    />
                    <span className="text-[10px] font-semibold text-center leading-tight text-gray-500">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedColor && (
              <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-white transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 shadow"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{selectedColor.name}</p>
                    <p className="text-xs text-gray-500">{selectedColor.hex}</p>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-4 text-xs leading-relaxed text-gray-500">
              * Màu sắc hiển thị mang tính tham khảo. Màu thực tế có thể khác nhau tùy điều kiện ánh sáng.
            </p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════
          FOOTER
      ══════════════════════════════════ */}
      <div className="px-8 py-5 border-t border-gray-200 shrink-0 pb-safe bg-inherit">
        <button
          className="btn-test-drive w-full py-4 bg-red-600 hover:bg-red-700
            text-white font-bold uppercase tracking-widest rounded-xl
            transition-colors duration-200 shadow-lg"
          onClick={() => setShowTestDrive(true)}
        >
          Đăng ký lái thử
        </button>
        <p className="text-center text-xs mt-3 text-gray-500">
          Hoặc gọi <span className="font-bold text-gray-900">1800 599 946</span>
        </p>
      </div>

      {showTestDrive && (
        <TestDriveModal onClose={() => setShowTestDrive(false)} />
      )}
    </div>
  );
}