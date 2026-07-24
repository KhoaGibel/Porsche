import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { userAPI, saveToken } from '../../services/api';
import useCarStore from '../../store/useCarStore';

const SHOWROOMS = [
  'Showroom Hà Nội — 33 Láng Hạ',
  'Showroom HCM — 10 Nguyễn Văn Linh',
  'Showroom Đà Nẵng — 195 Nguyễn Văn Linh',
];

// Tạo danh sách giờ từ 9:00 đến 17:30 (mỗi 30 phút)
const TIME_SLOTS = [];
for (let h = 9; h <= 17; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 17) TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

export default function TestDriveModal({ onClose }) {
  const activeCar = useCarStore((state) => state.activeCar) ?? 'GT3 RS';
  const carColor  = useCarStore((state) => state.carColor);

  const [step, setStep]         = useState('form'); // 'form' | 'success'
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register, handleSubmit, watch,
    formState: { errors },
  } = useForm({
    defaultValues: { showroom: SHOWROOMS[0] },
  });

  // Ngày tối thiểu = ngày mai
  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  // Ngày tối đa = 3 tháng tới
  const maxDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  })();

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const scheduledAt = new Date(`${data.date}T${data.time}:00`);
      await userAPI.bookTestDrive({
        carModel:    activeCar,
        colorHex:    carColor ?? '#ffffff',
        scheduledAt: scheduledAt.toISOString(),
        location:    data.showroom,
        note:        data.note,
        guestName:   data.fullName,
        guestPhone:  data.phone,
      });
      setStep('success');
    } catch (err) {
      setApiError(err.message ?? 'Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-[4px] flex items-center justify-center p-4 animate-td-fade-in" 
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto bg-white text-[#111111] rounded-[16px] sm:rounded-[20px] px-[18px] py-[24px] sm:px-[32px] sm:py-[36px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] animate-td-slide-up custom-scrollbar" 
          onClick={(e) => e.stopPropagation()}
        >

          {/* ── Nút đóng ── */}
          <button 
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 border-none text-[#111] flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-gray-200" 
            onClick={onClose} 
            aria-label="Đóng"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {step === 'form' ? (
            <>
              {/* ── Header ── */}
              <div className="mb-6">
                <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-1.5">
                  Porsche Experience
                </p>
                <h2 className="text-[24px] font-extrabold text-[#111] tracking-[0.02em] mb-2.5 uppercase">
                  Đăng ký lái thử
                </h2>
                {/* Pre-fill xe + màu đang xem */}
                <div className="flex items-center gap-2 py-2 px-3 bg-gray-100 border border-gray-200 rounded-lg text-[13px] font-semibold text-[#111] w-fit">
                  <div className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_0_1px_#d1d5db]" style={{ background: carColor ?? '#fff' }} />
                  <span>{activeCar}</span>
                  {carColor && (
                    <span className="text-gray-600 text-xs font-medium">— {carColor}</span>
                  )}
                </div>
              </div>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5" noValidate>

                {/* Họ tên */}
                <div className="flex flex-col gap-[5px]">
                  <label className="text-[11px] font-bold text-gray-700 tracking-[0.1em] uppercase">Họ và tên</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    {...register('fullName', {
                      required: 'Vui lòng nhập họ tên',
                      minLength: { value: 2, message: 'Tên phải có ít nhất 2 ký tự' },
                    })}
                    className={`p-2.5 bg-white border rounded-lg text-[#111] text-[13px] outline-none transition-all duration-200 w-full placeholder:text-gray-400 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] ${errors.fullName ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.fullName && <span className="text-[11px] text-red-600 font-medium">{errors.fullName.message}</span>}
                </div>

                {/* Số điện thoại */}
                <div className="flex flex-col gap-[5px]">
                  <label className="text-[11px] font-bold text-gray-700 tracking-[0.1em] uppercase">Số điện thoại</label>
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    {...register('phone', {
                      required: 'Vui lòng nhập số điện thoại',
                      pattern: {
                        value: /^[0-9]{9,11}$/,
                        message: 'Số điện thoại không hợp lệ',
                      },
                    })}
                    className={`p-2.5 bg-white border rounded-lg text-[#111] text-[13px] outline-none transition-all duration-200 w-full placeholder:text-gray-400 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] ${errors.phone ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.phone && <span className="text-[11px] text-red-600 font-medium">{errors.phone.message}</span>}
                </div>

                {/* Chọn ngày + giờ — cùng 1 hàng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-[5px]">
                    <label className="text-[11px] font-bold text-gray-700 tracking-[0.1em] uppercase">Ngày lái thử</label>
                    <input
                      type="date"
                      min={minDate}
                      max={maxDate}
                      {...register('date', { required: 'Vui lòng chọn ngày' })}
                      className={`custom-calendar-icon p-2.5 bg-white border rounded-lg text-[#111] text-[13px] outline-none transition-all duration-200 w-full focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] ${errors.date ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                    />
                    {errors.date && <span className="text-[11px] text-red-600 font-medium">{errors.date.message}</span>}
                  </div>

                  <div className="flex flex-col gap-[5px]">
                    <label className="text-[11px] font-bold text-gray-700 tracking-[0.1em] uppercase">Giờ</label>
                    <select
                      {...register('time', { required: 'Vui lòng chọn giờ' })}
                      className={`p-2.5 bg-white border rounded-lg text-[#111] text-[13px] outline-none transition-all duration-200 w-full focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] ${errors.time ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
                    >
                      <option value="">-- Chọn giờ --</option>
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.time && <span className="text-[11px] text-red-600 font-medium">{errors.time.message}</span>}
                  </div>
                </div>

                {/* Showroom */}
                <div className="flex flex-col gap-[5px]">
                  <label className="text-[11px] font-bold text-gray-700 tracking-[0.1em] uppercase">Showroom</label>
                  <select 
                    {...register('showroom')}
                    className="p-2.5 bg-white border border-gray-300 rounded-lg text-[#111] text-[13px] outline-none transition-all duration-200 w-full focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]"
                  >
                    {SHOWROOMS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Ghi chú */}
                <div className="flex flex-col gap-[5px]">
                  <label className="text-[11px] font-bold text-gray-700 tracking-[0.1em] uppercase">
                    Ghi chú <span className="font-normal text-gray-400 normal-case tracking-normal">(tùy chọn)</span>
                  </label>
                  <textarea
                    placeholder="Yêu cầu đặc biệt, câu hỏi..."
                    rows={2}
                    {...register('note')}
                    className="p-2.5 bg-white border border-gray-300 rounded-lg text-[#111] text-[13px] outline-none transition-all duration-200 w-full placeholder:text-gray-400 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]"
                  />
                </div>

                {/* Lưu ý đăng nhập */}
                <p className="text-[12px] color-gray-500 leading-relaxed text-gray-500">
                  Đăng nhập để lưu lịch sử và nhận nhắc nhở qua email.{' '}
                  <a href="/login" target="_blank" rel="noopener noreferrer" className="text-red-600 font-bold hover:underline">
                    Đăng nhập / Đăng ký
                  </a>
                </p>

                {/* Error từ API */}
                {apiError && <div className="py-2.5 px-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center font-medium">{apiError}</div>}

                {/* Submit */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="mt-1 w-full p-[14px] bg-red-600 text-white text-[13px] font-bold tracking-[0.1em] uppercase border-none rounded-[10px] cursor-pointer transition-all duration-200 hover:not-disabled:bg-red-700 hover:not-disabled:-translate-y-[1px] hover:not-disabled:shadow-[0_4px_12px_rgba(220,38,38,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang gửi...' : 'Xác nhận đặt lịch'}
                </button>

              </form>
            </>
          ) : (
            /* ── Success state ── */
            <div className="text-center py-5">
              <div className="w-[56px] h-[56px] rounded-full bg-green-100 border border-green-200 text-green-600 text-[24px] flex items-center justify-center mx-auto mb-4">
                ✓
              </div>
              <h2 className="text-[20px] font-extrabold text-[#111] mb-2">Đặt lịch thành công!</h2>
              <p className="text-[13px] text-gray-600 mb-1">Chúng tôi sẽ liên hệ xác nhận trong vòng 24 giờ.</p>
              <p className="text-[#111] font-bold mt-3 mb-1">
                {activeCar} — {watch('showroom')}
              </p>
              <p className="text-red-600 font-semibold mb-6">
                {watch('date')} lúc {watch('time')}
              </p>
              <button 
                onClick={onClose}
                className="w-full p-[14px] bg-red-600 text-white text-[13px] font-bold tracking-[0.1em] uppercase border-none rounded-[10px] cursor-pointer transition-all duration-200 hover:bg-red-700 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(220,38,38,0.3)]"
              >
                Quay lại showroom
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Inject custom animations & scrollbar to keep component standalone */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes tdFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes tdSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-td-fade-in {
          animation: tdFadeIn 0.2s ease;
        }
        .animate-td-slide-up {
          animation: tdSlideUp 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
        .custom-calendar-icon::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.5;
        }
        .custom-calendar-icon::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}} />
    </>
  );
}