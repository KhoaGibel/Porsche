import { useState } from 'react';
import useCarStore from '../../store/useCarStore';
import { CAR_DATA } from '../../data/carData';
import './Sidebar.css';
import { useIsMobile } from '../../hooks/useIsMobile';
import TestDriveModal from '../TestDriveModal/TestDriveModal';

export default function Sidebar() {
  const theme         = useCarStore((state) => state.theme);
  const isSidebarOpen = useCarStore((state) => state.isSidebarOpen);
  const toggleSidebar = useCarStore((state) => state.toggleSidebar);
  const setCarColor   = useCarStore((state) => state.setCarColor); // Rút hàm setCarColor từ store ra
  const isMobile = useIsMobile();
  // Nếu store chưa có activeCar, fallback về 'GT3 RS'
  const activeCar = useCarStore((state) => state.activeCar) ?? 'GT3 RS';
  const [showTestDrive, setShowTestDrive] = useState(false);

  const [activeTab, setActiveTab]       = useState('specs');   // 'specs' | 'colors'
  const [selectedColor, setSelectedColor] = useState(null);

  const car     = CAR_DATA[activeCar] ?? CAR_DATA['GT3 RS'];
  const isDark  = theme === 'dark';

  /* ── Helper: class shortcuts theo đúng pattern gốc ── */
  const containerBg = isDark
    ? 'bg-[#111]/95 backdrop-blur-md border-l border-white/10'
    : 'bg-[#f4f4f6]/95 backdrop-blur-md border-l border-gray-300';

  const textMain = isDark ? 'text-white'     : 'text-black';
  const textSub  = isDark ? 'text-gray-400'  : 'text-gray-500';
  const divider  = isDark ? 'border-white/10': 'border-gray-300';
  
  const cardClass = isDark
    ? 'bg-white/5 border-white/10 hover:bg-white/10'
    : 'bg-white border-gray-300 hover:bg-gray-100 shadow-sm';

  const tabActiveClass = isDark
    ? 'bg-white text-black'
    : 'bg-black text-white';

  const tabInactiveClass = isDark
    ? 'text-gray-400 hover:text-white hover:bg-white/5'
    : 'text-gray-500 hover:text-black hover:bg-black/5';

  const closeBtn = isDark
    ? 'hover:bg-white/10 text-white'
    : 'hover:bg-gray-200 text-black';

  return (
    <div
  className={`
    z-50 flex flex-col shadow-2xl
    transform transition-transform duration-500 ease-in-out
    ${isMobile
      // MOBILE: bottom sheet từ dưới lên
      ? `absolute bottom-0 left-0 right-0 rounded-t-2xl max-h-[65vh]
         ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full'}`
      // DESKTOP: sidebar từ phải vào
      : `absolute top-0 right-0 h-full w-80 md:w-96
         ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
    }
    ${containerBg}
  `}
>
  {/* Handle kéo — chỉ hiện trên mobile */}
  {isMobile && (
    <div className="flex justify-center pt-3 pb-1">
      <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-black/15'}`} />
    </div>
  )}

      {/* ══════════════════════════════════
          HEADER — giống hệt code gốc
      ══════════════════════════════════ */}
      <div className={`px-8 pt-28 pb-6 border-b ${divider}`}>

        {/* Nút đóng (X) — giữ nguyên vị trí gốc */}
        <button
          onClick={toggleSidebar}
          className={`absolute top-28 right-8 p-2 rounded-full transition-colors ${closeBtn}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tiêu đề — text-3xl font-black uppercase tracking-widest như gốc */}
        <h1 className={`text-3xl font-black uppercase tracking-widest mb-1 transition-colors duration-700 ${textMain}`}>
          Porsche
        </h1>
        <h2 className={`text-xl font-medium mb-1 transition-colors duration-700 ${textSub}`}>
          {activeCar}
        </h2>
        <p className={`text-sm ${textSub}`}>{car.tagline}</p>

        {/* Badge giá */}
        <span className={`price-badge ${isDark ? 'dark' : 'light'}`}>
          {car.price}
        </span>
      </div>

      {/* ══════════════════════════════════
          TABS
      ══════════════════════════════════ */}
      <div className={`flex gap-1 mx-8 mt-5 p-1 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
        {[
          { id: 'specs',  label: 'Thông số' },
          { id: 'colors', label: 'Màu sắc'  },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200
              ${activeTab === tab.id ? tabActiveClass : tabInactiveClass}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════
          NỘI DUNG — cuộn được
      ══════════════════════════════════ */}
      <div className={`flex-1 overflow-y-auto px-8 py-5 sidebar-scroll ${isDark ? '' : 'light'}`}>

        {/* ── TAB: THÔNG SỐ KỸ THUẬT ── */}
        {activeTab === 'specs' && (
          <div className="flex flex-col gap-3 sidebar-tab-content">
            <p className={`text-xs uppercase tracking-widest font-semibold mb-1 ${textSub}`}>
              Thông số kỹ thuật
            </p>

            {Object.entries(car.specs).map(([label, value]) => (
              <div
                key={label}
                className={`spec-row p-4 rounded-xl border transition-all cursor-pointer ${cardClass}`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className={`text-xs uppercase tracking-widest font-semibold flex-shrink-0 ${textSub}`}>
                    {label}
                  </span>
                  <span className={`text-sm font-bold text-right ${textMain}`}>
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: CHỌN MÀU XE ── */}
        {activeTab === 'colors' && (
          <div className="sidebar-tab-content">
            <p className={`text-xs uppercase tracking-widest font-semibold mb-4 ${textSub}`}>
              Chọn màu sơn
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              {car.colors.map((color) => {
                const isSelected = selectedColor?.name === color.name;
                return (
                  <button
                    key={color.name}
                    // BÍ QUYẾT Ở ĐÂY: GỌI 2 HÀM CÙNG LÚC KHI CLICK NÚT MÀU
                    onClick={() => {
                      setSelectedColor(color); // Cập nhật màu hiển thị trên Sidebar
                      setCarColor(color.hex);  // Cập nhật lên Store để bắn sang Model 3D
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all
                      ${isSelected
                        ? isDark
                          ? 'border-white/60 bg-white/10'
                          : 'border-black/40 bg-black/5'
                        : isDark
                        ? 'border-white/10 hover:border-white/30'
                        : 'border-gray-300 hover:border-gray-400 bg-white shadow-sm'
                      }`}
                  >
                    {/* Ô màu tròn */}
                    <div
                      className={`color-swatch w-10 h-10 rounded-full ${isSelected ? 'selected' : ''}`}
                      style={{
                        backgroundColor: color.hex,
                        boxShadow: isSelected
                          ? `0 0 0 3px ${isDark ? '#111' : '#f4f4f6'}, 0 0 0 5px ${color.hex}`
                          : '0 2px 6px rgba(0,0,0,0.25)',
                      }}
                    />
                    <span className={`text-[10px] font-semibold text-center leading-tight ${textSub}`}>
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Màu đang chọn (Hiển thị chi tiết bên dưới) */}
            {selectedColor && (
              <div className={`mt-4 p-4 rounded-xl border transition-all ${cardClass}`}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 shadow"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <div>
                    <p className={`text-sm font-bold ${textMain}`}>{selectedColor.name}</p>
                    <p className={`text-xs ${textSub}`}>{selectedColor.hex}</p>
                  </div>
                </div>
              </div>
            )}

            <p className={`mt-4 text-xs leading-relaxed ${textSub}`}>
              * Màu sắc hiển thị mang tính tham khảo. Màu thực tế có thể khác nhau tùy điều kiện ánh sáng.
            </p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════
          FOOTER — nút lái thử giữ nguyên gốc
      ══════════════════════════════════ */}
<div className={`px-8 py-6 border-t ${divider}`}>
  <button
    className="btn-test-drive w-full py-4 bg-red-600 hover:bg-red-700
      text-white font-bold uppercase tracking-widest rounded-xl
      transition-colors duration-200 shadow-lg"
    onClick={() => setShowTestDrive(true)}
  >
    Đăng ký lái thử
  </button>
  <p className={`text-center text-xs mt-3 ${textSub}`}>
    Hoặc gọi <span className={`font-bold ${textMain}`}>1800 599 946</span>
  </p>
</div>
 
{showTestDrive && (
  <TestDriveModal onClose={() => setShowTestDrive(false)} />
)}
*/

    </div>
  );
}