import React, { useState, useMemo } from 'react';

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function InteractiveCalendar({ selectedDate, onSelectDate }) {
  const today = new Date();
  
  // Mặc định luôn show tháng hiện tại, nếu selectedDate thuộc tháng khác thì show tháng đó
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Tính toán số ngày trong tháng và ngày bắt đầu của tháng
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(); // 0 (Sun) to 6 (Sat)

  const days = useMemo(() => {
    const arr = [];
    // Padding cho những ngày trống đầu tháng
    for (let i = 0; i < firstDayOfMonth; i++) {
      arr.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }
    return arr;
  }, [currentMonth, daysInMonth, firstDayOfMonth]);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2); // Chỉ cho đặt từ ngày thứ 3 trở đi
  minDate.setHours(0,0,0,0);

  const formatHeader = (date) => {
    return date.toLocaleString('vi-VN', { month: 'long', year: 'numeric' }).replace('tháng', 'Tháng');
  };

  const formatDateString = (date) => {
    if (!date) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="w-full bg-[#1a1a1a] rounded-2xl border border-white/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] selection:bg-red-600 selection:text-white">
      {/* HEADER LỊCH */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-white tracking-wide capitalize">{formatHeader(currentMonth)}</h3>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            disabled={currentMonth.getMonth() <= today.getMonth() && currentMonth.getFullYear() <= today.getFullYear()}
            className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <button 
            onClick={nextMonth}
            className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>

      {/* THỨ TRONG TUẦN */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{day}</div>
        ))}
      </div>

      {/* LƯỚI NGÀY */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dateObj, idx) => {
          if (!dateObj) return <div key={`empty-${idx}`} className="w-full aspect-square"></div>;
          
          const dateStr = formatDateString(dateObj);
          const isSelected = selectedDate === dateStr;
          const isPast = dateObj < minDate;
          
          return (
            <button
              key={dateStr}
              disabled={isPast}
              onClick={() => onSelectDate(dateStr)}
              className={`relative w-full aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all duration-200
                ${isPast ? 'text-gray-600 cursor-not-allowed bg-transparent' : 
                  isSelected ? 'bg-red-600 text-white shadow-md font-bold scale-105' : 
                  'bg-transparent text-gray-300 hover:bg-red-900/20 hover:text-red-400'}
              `}
            >
              {dateObj.getDate()}
              {/* Highlight dot for selected date */}
              {isSelected && <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full"></span>}
            </button>
          );
        })}
      </div>
      
      <div className="mt-5 flex items-center gap-4 text-[10px] font-medium text-gray-500 border-t border-white/10 pt-4">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-600"></div> Ngày chọn</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div> Không khả dụng</div>
      </div>
    </div>
  );
}
