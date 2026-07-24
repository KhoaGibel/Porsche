import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { PLANS, INSURANCE, fmt, TIME_SLOTS, SHOWROOMS } from '../../data/testDrivePlans';
import './PaymentPage.css';
 
const PAYMENT_METHODS = [
  {
    id: 'momo',
    name: 'MoMo',
    logo: '💜',
    desc: 'Ví điện tử MoMo',
    color: '#ae2070',
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    logo: '🔴',
    desc: 'Cổng thanh toán VNPay',
    color: '#e31837',
  },
  {
    id: 'atm',
    name: 'Thẻ ATM / Internet Banking',
    logo: '🏦',
    desc: 'Tất cả ngân hàng nội địa',
    color: '#1a56db',
  },
  {
    id: 'visa',
    name: 'Visa / Mastercard',
    logo: '💳',
    desc: 'Thẻ quốc tế Visa & Mastercard',
    color: '#1a1a2e',
  },
];
 
const minDate = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
})();
 
export default function PaymentPage() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
 
  // Nhận data từ trang trước (ShopPage truyền qua state)
  const booking = location.state ?? {};
  const plan     = PLANS.find(p => p.id === booking.planId) ?? PLANS[1];
  const ins      = INSURANCE[booking.insuranceId ?? plan.defaultInsurance];
  const total    = plan.price + (ins?.price ?? 0);
 
  const [payMethod,  setPayMethod]  = useState('momo');
  const [submitting, setSubmitting] = useState(false);
  const [step,       setStep]       = useState('form'); // 'form' | 'processing' | 'success' | 'error'
  const [orderNum,   setOrderNum]   = useState('');
 
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName:   user?.displayName ?? '',
      email:      user?.email ?? '',
      phone:      '',
      idCard:     '',
      dob:        '',
      address:    '',
      driveDate:  booking.date ?? '',
      driveTime:  booking.time ?? '',
      showroom:   booking.showroom ?? SHOWROOMS[0],
      note:       '',
      // Card fields
      cardNumber: '',
      cardName:   '',
      cardExpiry: '',
      cardCvv:    '',
    },
  });
 
  const selectedDate = watch('driveDate');
  const selectedTime = watch('driveTime');
 
  // Auto-fill từ user đã đăng nhập
  useEffect(() => {
    if (user?.displayName) setValue('fullName', user.displayName);
    if (user?.email)       setValue('email',    user.email);
  }, [user]);
 
  const onSubmit = async (data) => {
    setSubmitting(true);
    setStep('processing');
 
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('porsche_token')}`,
        },
        body: JSON.stringify({
          // Thông tin khách hàng
          fullName:  data.fullName,
          email:     data.email,
          phone:     data.phone,
          idCard:    data.idCard,
          dob:       data.dob,
          address:   data.address,
          // Lịch lái thử
          driveDate: data.driveDate,
          driveTime: data.driveTime,
          showroom:  data.showroom,
          note:      data.note,
          // Gói & bảo hiểm
          planId:       plan.id,
          planName:     plan.name,
          insuranceId:  ins.id,
          insuranceName:ins.name,
          // Thanh toán
          paymentMethod: payMethod,
          basePrice:     plan.price,
          insurancePrice: ins.price,
          totalAmount:   total,
        }),
      });
 
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
 
      setOrderNum(json.orderNumber);
 
      // Redirect đến cổng thanh toán
      if (json.paymentUrl) {
        window.location.href = json.paymentUrl;
      } else {
        setStep('success');
      }
    } catch (err) {
      console.error(err);
      setStep('error');
    } finally {
      setSubmitting(false);
    }
  };
 
  // ── Processing screen ──
  if (step === 'processing') return (
    <div className="pay-page">
      <div className="pay-processing">
        <motion.div className="pay-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <h2>Đang xử lý thanh toán...</h2>
        <p>Vui lòng không đóng trình duyệt</p>
      </div>
    </div>
  );
 
  // ── Success screen ──
  if (step === 'success') return (
    <div className="pay-page">
      <div className="pay-success">
        <motion.div className="pay-success-icon"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >✓</motion.div>
        <h1>Thanh toán thành công!</h1>
        <p className="pay-order-num">Mã đơn: <strong>{orderNum}</strong></p>
        <div className="pay-success-box">
          <div><span>Gói lái thử</span><strong style={{ color: plan.color }}>{plan.name}</strong></div>
          <div><span>Bảo hiểm</span><strong>{ins.name}</strong></div>
          <div><span>Tổng thanh toán</span><strong>{fmt(total)}</strong></div>
        </div>
        <p className="pay-success-note">
          Email xác nhận đã được gửi tới <strong>{watch('email')}</strong>.<br />
          Đội ngũ Porsche sẽ liên hệ xác nhận lịch trong vòng 24h.
        </p>
        <div className="pay-success-btns">
          <Link to="/"        className="pay-btn primary">Về showroom</Link>
          <Link to="/account" className="pay-btn ghost">Xem đơn hàng</Link>
        </div>
      </div>
    </div>
  );
 
  // ── Error screen ──
  if (step === 'error') return (
    <div className="pay-page">
      <div className="pay-success">
        <div className="pay-error-icon">✕</div>
        <h1>Thanh toán thất bại</h1>
        <p>Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại.</p>
        <button className="pay-btn primary" onClick={() => setStep('form')}>
          Thử lại
        </button>
      </div>
    </div>
  );
 
  // ── Main form ──
  return (
    <div className="pay-page">
      <div className="pay-bg" />
 
      {/* Header */}
      <div className="pay-header">
        <Link to="/shop" className="pay-back">← Quay lại</Link>
        <p className="pay-eyebrow">Porsche Driving Experience</p>
        <h1 className="pay-title">Thanh toán đặt lịch</h1>
      </div>
 
      <form className="pay-layout" onSubmit={handleSubmit(onSubmit)} noValidate>
 
        {/* ══════════════════════════════
            CỘT TRÁI — Form thông tin
        ══════════════════════════════ */}
        <div className="pay-form-col">
 
          {/* 1. Thông tin cá nhân */}
          <div className="pay-card">
            <h2 className="pay-card-title">
              <span className="pay-step-num">1</span>
              Thông tin cá nhân
            </h2>
 
            <div className="pay-grid-2">
              <div className="pay-field">
                <label>Họ và tên <span className="req">*</span></label>
                <input type="text" placeholder="Nguyễn Văn A"
                  {...register('fullName', { required: 'Vui lòng nhập họ tên' })}
                  className={errors.fullName ? 'error' : ''} />
                {errors.fullName && <span className="pay-err">{errors.fullName.message}</span>}
              </div>
 
              <div className="pay-field">
                <label>Số điện thoại <span className="req">*</span></label>
                <input type="tel" placeholder="09xx xxx xxx"
                  {...register('phone', {
                    required: 'Vui lòng nhập số điện thoại',
                    pattern: { value: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ' },
                  })}
                  className={errors.phone ? 'error' : ''} />
                {errors.phone && <span className="pay-err">{errors.phone.message}</span>}
              </div>
 
              <div className="pay-field">
                <label>Email <span className="req">*</span></label>
                <input type="email" placeholder="example@gmail.com"
                  {...register('email', {
                    required: 'Vui lòng nhập email',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email không hợp lệ' },
                  })}
                  className={errors.email ? 'error' : ''} />
                {errors.email && <span className="pay-err">{errors.email.message}</span>}
              </div>
 
              <div className="pay-field">
                <label>Ngày sinh <span className="req">*</span></label>
                <input type="date"
                  {...register('dob', { required: 'Vui lòng nhập ngày sinh' })}
                  className={errors.dob ? 'error' : ''} />
                {errors.dob && <span className="pay-err">{errors.dob.message}</span>}
              </div>
 
              <div className="pay-field">
                <label>CMND / CCCD <span className="req">*</span></label>
                <input type="text" placeholder="012345678901"
                  {...register('idCard', {
                    required: 'Vui lòng nhập CCCD',
                    pattern: { value: /^[0-9]{9,12}$/, message: 'CCCD không hợp lệ' },
                  })}
                  className={errors.idCard ? 'error' : ''} />
                {errors.idCard && <span className="pay-err">{errors.idCard.message}</span>}
              </div>
 
              <div className="pay-field">
                <label>Địa chỉ</label>
                <input type="text" placeholder="Số nhà, đường, quận, thành phố"
                  {...register('address')} />
              </div>
            </div>
          </div>
 
          {/* 2. Lịch lái thử */}
          <div className="pay-card">
            <h2 className="pay-card-title">
              <span className="pay-step-num">2</span>
              Thời gian & địa điểm lái thử
            </h2>
 
            <div className="pay-grid-2">
              <div className="pay-field">
                <label>Ngày lái thử <span className="req">*</span></label>
                <input type="date" min={minDate}
                  {...register('driveDate', { required: 'Vui lòng chọn ngày' })}
                  className={errors.driveDate ? 'error' : ''} />
                {errors.driveDate && <span className="pay-err">{errors.driveDate.message}</span>}
              </div>
 
              <div className="pay-field">
                <label>Showroom <span className="req">*</span></label>
                <select {...register('showroom')}>
                  {SHOWROOMS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
 
            {/* Time slots */}
            <div className="pay-field">
              <label>Giờ bắt đầu <span className="req">*</span></label>
              <div className="pay-time-grid">
                {TIME_SLOTS.map(t => (
                  <button key={t} type="button"
                    className={`pay-time-slot ${selectedTime === t ? 'active' : ''}`}
                    onClick={() => setValue('driveTime', t)}
                  >{t}</button>
                ))}
              </div>
              {!selectedTime && submitting && (
                <span className="pay-err">Vui lòng chọn giờ</span>
              )}
            </div>
 
            <div className="pay-field">
              <label>Ghi chú</label>
              <textarea rows={2} placeholder="Yêu cầu đặc biệt, câu hỏi..."
                {...register('note')} />
            </div>
          </div>
 
          {/* 3. Phương thức thanh toán */}
          <div className="pay-card">
            <h2 className="pay-card-title">
              <span className="pay-step-num">3</span>
              Phương thức thanh toán
            </h2>
 
            <div className="pay-methods">
              {PAYMENT_METHODS.map(m => (
                <button key={m.id} type="button"
                  className={`pay-method ${payMethod === m.id ? 'active' : ''}`}
                  style={{ '--mc': m.color }}
                  onClick={() => setPayMethod(m.id)}
                >
                  <span className="pay-method-logo">{m.logo}</span>
                  <div>
                    <p className="pay-method-name">{m.name}</p>
                    <p className="pay-method-desc">{m.desc}</p>
                  </div>
                  {payMethod === m.id && <span className="pay-method-check">✓</span>}
                </button>
              ))}
            </div>
 
            {/* Card fields — chỉ hiện khi chọn Visa/Mastercard */}
            <AnimatePresence>
              {payMethod === 'visa' && (
                <motion.div className="pay-card-fields"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="pay-field">
                    <label>Số thẻ <span className="req">*</span></label>
                    <input type="text" placeholder="1234 5678 9012 3456" maxLength={19}
                      {...register('cardNumber', {
                        validate: v => payMethod !== 'visa' || v.replace(/\s/g,'').length === 16 || 'Số thẻ phải có 16 chữ số',
                      })}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g,'').slice(0,16);
                        const fmt = v.replace(/(.{4})/g, '$1 ').trim();
                        setValue('cardNumber', fmt);
                      }}
                    />
                    {errors.cardNumber && <span className="pay-err">{errors.cardNumber.message}</span>}
                  </div>
                  <div className="pay-field">
                    <label>Tên chủ thẻ <span className="req">*</span></label>
                    <input type="text" placeholder="NGUYEN VAN A"
                      {...register('cardName', {
                        validate: v => payMethod !== 'visa' || !!v || 'Vui lòng nhập tên chủ thẻ',
                      })}
                      style={{ textTransform: 'uppercase' }} />
                    {errors.cardName && <span className="pay-err">{errors.cardName.message}</span>}
                  </div>
                  <div className="pay-grid-2">
                    <div className="pay-field">
                      <label>Ngày hết hạn <span className="req">*</span></label>
                      <input type="text" placeholder="MM/YY" maxLength={5}
                        {...register('cardExpiry')}
                        onChange={e => {
                          let v = e.target.value.replace(/\D/g,'');
                          if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2,4);
                          setValue('cardExpiry', v);
                        }} />
                    </div>
                    <div className="pay-field">
                      <label>CVV <span className="req">*</span></label>
                      <input type="password" placeholder="•••" maxLength={3}
                        {...register('cardCvv')} />
                    </div>
                  </div>
                  <p className="pay-secure-note">
                    🔒 Thông tin thẻ được mã hóa SSL 256-bit. Chúng tôi không lưu trữ thông tin thẻ.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
 
            {/* ATM info */}
            {payMethod === 'atm' && (
              <div className="pay-atm-note">
                <p>🏦 Sau khi xác nhận, bạn sẽ được chuyển đến cổng thanh toán ngân hàng để hoàn tất giao dịch.</p>
              </div>
            )}
 
            {/* Momo / VNPay info */}
            {(payMethod === 'momo' || payMethod === 'vnpay') && (
              <div className="pay-atm-note">
                <p>📱 Sau khi xác nhận, bạn sẽ được chuyển đến ứng dụng <strong>
                  {payMethod === 'momo' ? 'MoMo' : 'VNPay'}
                </strong> để hoàn tất thanh toán.</p>
              </div>
            )}
          </div>
 
        </div>
 
        {/* ══════════════════════════════
            CỘT PHẢI — Order summary
        ══════════════════════════════ */}
        <div className="pay-summary-col">
          <div className="pay-summary-card" style={{ '--c': plan.color }}>
            <h3 className="pay-summary-title">Tóm tắt đơn hàng</h3>
 
            {/* Plan */}
            <div className="pay-summary-plan">
              <div className="pay-summary-plan-dot" />
              <div>
                <p className="pay-summary-plan-name">{plan.name}</p>
                <p className="pay-summary-plan-sub">{plan.tagline}</p>
                <p className="pay-summary-plan-detail">
                  {plan.duration} · {plan.sessions === -1 ? 'Không giới hạn' : plan.sessions + ' buổi'}
                </p>
              </div>
              <strong>{fmt(plan.price)}</strong>
            </div>
 
            {/* Insurance */}
            <div className="pay-summary-row">
              <span>Bảo hiểm — {ins.name}</span>
              <span>{ins.price === 0 ? 'Miễn phí' : fmt(ins.price)}</span>
            </div>
 
            {/* Datetime preview */}
            {selectedDate && selectedTime && (
              <div className="pay-summary-datetime">
                <span>📅</span>
                <span>{selectedDate} lúc {selectedTime}</span>
              </div>
            )}
 
            {/* Cars */}
            <div className="pay-summary-cars">
              {plan.cars.map(c => (
                <span key={c} className="pay-summary-car-tag">{c}</span>
              ))}
            </div>
 
            <hr className="pay-summary-hr" />
 
            {/* Total */}
            <div className="pay-summary-total">
              <span>Tổng thanh toán</span>
              <strong>{fmt(total)}</strong>
            </div>
 
            <p className="pay-summary-note">
              Bao gồm thuế và phí. Chính sách hoàn tiền 100% nếu hủy trước 48h.
            </p>
 
            {/* Submit */}
            <button type="submit" className="pay-submit"
              style={{ background: plan.color }}
              disabled={submitting}
            >
              {submitting ? 'Đang xử lý...' : `Thanh toán ${fmt(total)}`}
            </button>
 
            <p className="pay-terms">
              Bằng cách thanh toán, bạn đồng ý với{' '}
              <a href="/terms" target="_blank">Điều khoản dịch vụ</a>{' '}
              của Porsche Showroom.
            </p>
          </div>
        </div>
 
      </form>
    </div>
  );
}