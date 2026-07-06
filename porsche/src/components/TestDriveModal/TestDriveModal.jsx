import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { userAPI, saveToken } from '../../services/api';
import useCarStore from '../../store/useCarStore';
import './TestDriveModal.css';

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
    <div className="td-overlay" onClick={onClose}>
      <div className="td-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Nút đóng ── */}
        <button className="td-close" onClick={onClose} aria-label="Đóng">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {step === 'form' ? (
          <>
            {/* ── Header ── */}
            <div className="td-header">
              <p className="td-eyebrow">Porsche Experience</p>
              <h2 className="td-title">Đăng ký lái thử</h2>
              {/* Pre-fill xe + màu đang xem */}
              <div className="td-car-preview">
                <div className="td-car-dot" style={{ background: carColor ?? '#fff' }} />
                <span>{activeCar}</span>
                {carColor && (
                  <span className="td-color-name">— {carColor}</span>
                )}
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit(onSubmit)} className="td-form" noValidate>

              {/* Họ tên */}
              <div className="td-field">
                <label>Họ và tên</label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  {...register('fullName', {
                    required: 'Vui lòng nhập họ tên',
                    minLength: { value: 2, message: 'Tên phải có ít nhất 2 ký tự' },
                  })}
                  className={errors.fullName ? 'error' : ''}
                />
                {errors.fullName && <span className="td-error">{errors.fullName.message}</span>}
              </div>

              {/* Số điện thoại */}
              <div className="td-field">
                <label>Số điện thoại</label>
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
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="td-error">{errors.phone.message}</span>}
              </div>

              {/* Chọn ngày + giờ — cùng 1 hàng */}
              <div className="td-row">
                <div className="td-field">
                  <label>Ngày lái thử</label>
                  <input
                    type="date"
                    min={minDate}
                    max={maxDate}
                    {...register('date', { required: 'Vui lòng chọn ngày' })}
                    className={errors.date ? 'error' : ''}
                  />
                  {errors.date && <span className="td-error">{errors.date.message}</span>}
                </div>

                <div className="td-field">
                  <label>Giờ</label>
                  <select
                    {...register('time', { required: 'Vui lòng chọn giờ' })}
                    className={errors.time ? 'error' : ''}
                  >
                    <option value="">-- Chọn giờ --</option>
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.time && <span className="td-error">{errors.time.message}</span>}
                </div>
              </div>

              {/* Showroom */}
              <div className="td-field">
                <label>Showroom</label>
                <select {...register('showroom')}>
                  {SHOWROOMS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Ghi chú */}
              <div className="td-field">
                <label>Ghi chú <span className="td-optional">(tùy chọn)</span></label>
                <textarea
                  placeholder="Yêu cầu đặc biệt, câu hỏi..."
                  rows={2}
                  {...register('note')}
                />
              </div>

              {/* Lưu ý đăng nhập */}
              <p className="td-login-note">
                Đăng nhập để lưu lịch sử và nhận nhắc nhở qua email.{' '}
                <a href="/login" target="_blank" rel="noopener noreferrer">
                  Đăng nhập / Đăng ký
                </a>
              </p>

              {/* Error từ API */}
              {apiError && <div className="td-api-error">{apiError}</div>}

              {/* Submit */}
              <button type="submit" className="td-submit" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Xác nhận đặt lịch'}
              </button>

            </form>
          </>
        ) : (
          /* ── Success state ── */
          <div className="td-success">
            <div className="td-success-icon">✓</div>
            <h2>Đặt lịch thành công!</h2>
            <p>Chúng tôi sẽ liên hệ xác nhận trong vòng 24 giờ.</p>
            <p className="td-success-car">
              {activeCar} — {watch('showroom')}
            </p>
            <p className="td-success-time">
              {watch('date')} lúc {watch('time')}
            </p>
            <button className="td-submit" onClick={onClose}>
              Quay lại showroom
            </button>
          </div>
        )}

      </div>
    </div>
  );
}