import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { userAPI } from '../../services/api';
import { PLANS, INSURANCE, SHOWROOMS, TIME_SLOTS, fmt } from '../../data/testDrivePlans';
import useCarStore from '../../store/useCarStore';
import { useAuth } from '../../hooks/useAuth';
import InteractiveCalendar from '../../components/TestDrive/InteractiveCalendar';
import ShowroomMap from '../../components/TestDrive/ShowroomMap';

const STEPS = ['Chọn gói', 'Bảo hiểm', 'Đặt lịch', 'Xác nhận'];

const FAQ_LIST = [
  { q: 'Tôi có thể hủy bất kỳ lúc nào không?', a: 'Có. Bạn có thể hủy hoặc đổi lịch lái thử trước 24 giờ mà không mất phí. Liên hệ hotline để được hỗ trợ.' },
  { q: 'Phương thức thanh toán nào được chấp nhận?', a: 'Chúng tôi chấp nhận thẻ Visa, Mastercard, chuyển khoản ngân hàng và ví điện tử thanh toán trực tiếp tại Showroom.' },
  { q: 'Có yêu cầu bằng lái không?', a: 'Bắt buộc phải có Giấy phép lái xe hợp lệ (hạng B1 trở lên) và CCCD mang theo vào ngày lái thử.' },
  { q: 'Bảo hiểm xe tính như thế nào?', a: 'Các xe lái thử đều đã có bảo hiểm cơ bản. Bạn có thể chọn mua thêm các gói cao cấp để an tâm 100%.' },
];

export default function TestDriveShop() {
  const { user: authUser } = useAuth();
  const storeUser = useCarStore((state) => state.user ?? null); 
  const isLoggedIn = !!authUser || !!storeUser;
  const navigate = useNavigate();

  // -- STATES --
  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedIns, setSelectedIns] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showroom, setShowroom] = useState(SHOWROOMS[0]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showLoginGate, setShowLoginGate] = useState(false);

  // -- CALCULATIONS --
  const plan = PLANS.find((p) => p.id === selectedPlan);
  const ins = INSURANCE[selectedIns] ?? Object.values(INSURANCE)[0];
  const totalPrice = (plan?.price ?? 0) + (ins?.price ?? 0);

  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  })();

  // -- HANDLERS --
  const handleSelectPlan = (planId) => {
    if (!isLoggedIn) {
      setShowLoginGate(true);
      return;
    }
    const p = PLANS.find((x) => x.id === planId);
    setSelectedPlan(planId);
    setSelectedIns(p.defaultInsurance);
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!plan || !date || !time) return;
    setSubmitting(true);
    try {
      const res = await userAPI.bookTestDrive({
        planId: plan.id,
        planName: plan.name,
        insuranceId: ins.id,
        insuranceName: ins.name,
        basePrice: plan.price,
        insurancePrice: ins.price,
        totalPrice,
        scheduledAt: new Date(`${date}T${time}:00`).toISOString(),
        showroom,
        note,
        cars: plan.cars,
      });

      const fallbackOrderNumber = 'TDR-' + new Date().getTime(); 
      setSuccess({
        ...res,
        orderNumber: res?.orderNumber || fallbackOrderNumber
      });
      
    } catch (err) {
      alert(err.message ?? 'Lỗi hệ thống. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── RENDER SUCCESS TICKET ──
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex justify-center pt-28 pb-20 px-4">
        <Link 
          to="/" 
          className="absolute top-8 left-4 md:left-8 z-[60] text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors flex items-center gap-2 bg-white hover:bg-gray-100 shadow-sm py-2 px-4 rounded-full border border-gray-200"
        >
          ← <span className="hidden md:inline">Quay lại Showroom</span>
        </Link>

        <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-xl h-fit mt-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
            className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-5 border border-green-200"
          >
            ✓
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">Đặt lịch thành công!</h1>
          <p className="text-sm text-gray-500 mb-6 tracking-wider">Mã đơn: <strong className="text-gray-900">{success.orderNumber}</strong></p>
          
          <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6 border border-gray-100 text-sm">
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500">Gói lái thử</span>
              <strong style={{ color: plan?.color || '#111' }}>{plan?.name}</strong>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500">Bảo hiểm</span>
              <strong className="text-right text-gray-900">{ins?.name}</strong>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500">Thời gian</span>
              <strong className="text-right text-gray-900">{date} lúc {time}</strong>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500">Showroom</span>
              <strong className="text-right w-1/2 text-gray-900">{showroom}</strong>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-500 uppercase tracking-widest text-xs">Tổng thanh toán</span>
              <strong className="text-lg text-red-600">{fmt(totalPrice)}</strong>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Đội ngũ Porsche sẽ liên hệ với bạn trong vòng 24h qua số điện thoại để xác nhận lịch.
          </p>
          
          <div className="flex flex-col md:flex-row gap-3">
            <Link to="/" className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold tracking-widest uppercase text-[12px] transition-colors">
              Về Showroom
            </Link>
            <Link to="/account" className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 rounded-lg font-bold tracking-widest uppercase text-[12px] transition-colors">
              Xem đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-32 selection:bg-red-600 selection:text-white relative">
      
      {/* ── NÚT BACK CỐ ĐỊNH ── */}
      <Link 
        to="/" 
        className="absolute top-8 left-4 md:left-8 z-[60] text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors flex items-center gap-2 bg-white/80 hover:bg-white backdrop-blur-md py-2 px-4 rounded-full border border-gray-200 shadow-sm"
      >
        ← <span className="hidden md:inline">Quay lại Showroom</span>
      </Link>

      {/* ── HERO BANNER & HEADER ── */}
      <div 
        className="relative w-full pt-32 pb-16 px-4 md:px-8 bg-cover bg-center bg-no-repeat mb-10 border-b border-gray-200 bg-white"
        style={{ backgroundImage: "url('ĐƯỜNG_DẪN_ẢNH_CỦA_BẠN_Ở_ĐÂY')" }}
      >
        <div className="relative z-10 max-w-3xl mx-auto text-center mb-12">
          <p className="text-[10px] font-bold tracking-[0.35em] text-red-600 uppercase mb-3">Porsche Experience</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Đăng ký lái thử</h1>
          <p className="text-gray-600 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Đăng ký để mở khóa toàn bộ tính năng showroom, tùy chọn gói trải nghiệm và tư vấn cá nhân hóa.
          </p>

          {!isLoggedIn && (
            <div className="inline-flex items-center gap-2 mt-5 px-5 py-2 bg-red-50 border border-red-100 rounded-full text-red-900">
              <span className="text-xs">👀 Bạn đang xem với tư cách khách.</span>
              <button onClick={() => setShowLoginGate(true)} className="text-xs font-bold text-red-600 hover:text-red-700 underline underline-offset-4 transition-colors">
                Đăng nhập để đặt lịch
              </button>
            </div>
          )}
        </div>

        {/* ── STEPS INDICATOR ── */}
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>
            {STEPS.map((s, i) => {
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group bg-transparent px-2" onClick={() => isDone && setStep(i)}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300
                    ${isActive ? 'bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 
                      isDone ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-300 text-gray-400'}`}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest font-bold transition-colors
                    ${isActive ? 'text-red-600' : isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── WIZARD BODY ── */}
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        {/* BƯỚC 0: CHỌN GÓI */}
        {step === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {PLANS.map((p, i) => (
              <motion.div 
                key={p.id}
                onClick={() => handleSelectPlan(p.id)}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`relative bg-white border rounded-2xl p-6 flex flex-col transition-all duration-300 h-full cursor-pointer group
                  ${p.highlight 
                    ? 'border-red-600 shadow-[0_0_0_1px_#dc2626,0_15px_30px_rgba(220,38,38,0.08)] md:-translate-y-2' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-1'}`}
              >
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-md whitespace-nowrap" style={{ backgroundColor: p.color || '#dc2626' }}>
                    {p.badge}
                  </div>
                )}

                <div className="mb-5">
                  <h2 className="text-xl font-bold tracking-wide mb-1.5 text-gray-900">{p.name}</h2>
                  <p className="text-xs text-gray-500 leading-relaxed min-h-[36px]">{p.tagline}</p>
                </div>

                <div className="flex items-baseline gap-2 mb-5 border-b border-gray-100 pb-5">
                  <span className="text-2xl font-bold" style={{ color: p.color || '#111' }}>{fmt(p.price)}</span>
                  <span className="text-xs text-gray-400">/ {p.duration}</span>
                </div>

                <ul className="flex-1 flex flex-col gap-3 mb-6">
                  {p.features?.map((f, j) => (
                    <li key={j} className={`flex items-start gap-2.5 text-xs leading-relaxed ${f.ok ? 'text-gray-700' : 'text-gray-400'}`}>
                      <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] mt-0.5 ${f.ok ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {f.ok ? '✓' : '✕'}
                      </span>
                      {f.text}
                    </li>
                  ))}
                  
                  <li className="flex items-start gap-2.5 text-xs leading-relaxed text-gray-700 mt-1 pt-3 border-t border-gray-100">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[9px] mt-0.5">🏎️</span>
                    <span><strong>Xe:</strong> {p.cars.join(', ')}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs leading-relaxed text-gray-700">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[9px] mt-0.5">📍</span>
                    <span><strong>Địa điểm:</strong> {p.location}</span>
                  </li>
                </ul>

                <button 
                  className={`w-full py-3 mt-auto rounded-lg font-bold tracking-[0.15em] uppercase text-[11px] transition-all duration-300 border-2
                    ${p.highlight 
                      ? 'bg-red-600 border-red-600 text-white group-hover:bg-red-700 group-hover:border-red-700' 
                      : 'bg-transparent border-gray-900 text-gray-900 group-hover:bg-gray-900 group-hover:text-white'}`}
                >
                  {isLoggedIn ? `Chọn ${p.name}` : '🔒 Đăng nhập đặt lịch'}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* BƯỚC 1: BẢO HIỂM */}
        {step === 1 && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold mb-2 text-gray-900">Gói Bảo Hiểm</h2>
            <p className="text-sm text-gray-500 mb-6">Bảo vệ rủi ro tài chính trong quá trình trực tiếp cầm lái.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {Object.values(INSURANCE).map((i) => (
                <div 
                  key={i.id} 
                  onClick={() => setSelectedIns(i.id)}
                  className={`relative p-5 md:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 h-full flex flex-col group
                    ${selectedIns === i.id ? 'bg-red-50/50 border-red-500 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="pr-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{i.name}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{i.desc}</p>
                    </div>
                    <div className="text-right whitespace-nowrap absolute right-5 top-5">
                      <div className={`text-sm font-bold transition-colors ${selectedIns === i.id ? 'text-red-600' : 'text-gray-900 group-hover:text-red-600'}`}>
                        {i.price === 0 ? 'Miễn phí' : `+${fmt(i.price)}`}
                      </div>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mt-auto">
                    {i.items.map((c, idx) => (
                      <li key={idx} className={`flex items-start gap-2.5 text-xs ${c.ok ? 'text-gray-700' : 'text-gray-400'}`}>
                        <span className={`mt-0.5 ${c.ok ? 'text-green-500' : ''}`}>{c.ok ? '✓' : '✕'}</span>
                        {c.text}
                      </li>
                    ))}
                  </ul>

                  <div className={`absolute bottom-5 right-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                    ${selectedIns === i.id ? 'border-red-500 bg-red-500 text-white' : 'border-gray-300 text-transparent group-hover:border-gray-400'}`}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
              <button onClick={() => setStep(0)} className="px-6 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold tracking-widest text-xs uppercase transition-colors">Quay lại</button>
              <button onClick={() => setStep(2)} disabled={!selectedIns} className="px-8 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold tracking-widest text-xs uppercase transition-colors">Tiếp tục →</button>
            </div>
          </div>
        )}

        {/* BƯỚC 2: ĐẶT LỊCH (NÂNG CẤP) */}
        {step === 2 && (
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold mb-2 text-gray-900 text-center md:text-left">Chi tiết Lịch hẹn</h2>
            <p className="text-sm text-gray-500 mb-8 text-center md:text-left">Vui lòng chọn ngày, giờ và Trung tâm Porsche để trải nghiệm.</p>
            
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              
              {/* CỘT TRÁI: LỊCH & GIỜ */}
              <div className="w-full lg:w-5/12 flex flex-col gap-6">
                <InteractiveCalendar 
                  selectedDate={date} 
                  onSelectDate={setDate} 
                />
                
                {/* Chọn giờ */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center justify-between">
                    Giờ hẹn <span className="text-gray-400 font-normal lowercase">(Bắt buộc)</span>
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {TIME_SLOTS.map(t => (
                      <button 
                        key={t} onClick={() => setTime(t)}
                        className={`py-2 rounded-lg border text-xs font-bold transition-all duration-200
                          ${time === t ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: BẢN ĐỒ & GHI CHÚ */}
              <div className="w-full lg:w-7/12 flex flex-col gap-6">
                <div className="flex-1">
                  <ShowroomMap 
                    selectedShowroom={showroom} 
                    onSelectShowroom={setShowroom} 
                  />
                </div>
                
                {/* Ghi chú */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 flex items-center justify-between">
                    Ghi chú <span className="text-gray-400 font-normal lowercase">(Tùy chọn)</span>
                  </h3>
                  <textarea 
                    rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Yêu cầu đặc biệt hoặc mẫu xe ưu tiên..."
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-3 text-sm outline-none focus:border-red-500 focus:bg-white transition-colors resize-none placeholder:text-gray-400" 
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold tracking-widest text-xs uppercase transition-colors">Quay lại</button>
              <button 
                onClick={() => {
                  navigate('/payment', {
                    state: {
                      planId: selectedPlan,
                      insuranceId: selectedIns,
                      date,
                      time,
                      showroom,
                      note
                    }
                  });
                }} 
                disabled={!date || !time} 
                className="px-8 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold tracking-widest text-xs uppercase transition-colors"
              >
                Tới Thanh toán →
              </button>
            </div>
          </div>
        )}

        {/* BƯỚC 3: XÁC NHẬN */}
        {step === 3 && (
          <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Xác nhận thông tin</h2>
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-4">Chi tiết Gói</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Tên gói</span><strong style={{ color: plan?.color || '#111' }}>{plan?.name}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Thời lượng</span><strong className="text-gray-900">{plan?.duration}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Danh sách xe</span><strong className="text-gray-900 text-right max-w-[60%]">{plan?.cars.join(', ')}</strong></div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-4">Bảo hiểm & Lịch hẹn</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Bảo hiểm</span><strong className="text-gray-900">{ins?.name}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Thời gian hẹn</span><strong className="text-gray-900">{date} lúc {time}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Địa điểm</span><strong className="text-gray-900 text-right max-w-[60%]">{showroom}</strong></div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-gray-600">Phí Gói</span>
                  <span className="font-bold text-gray-900">{fmt(plan?.price)}</span>
                </div>
                {ins?.price > 0 && (
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="text-gray-600">Phí Bảo hiểm</span>
                    <span className="font-bold text-gray-900">+{fmt(ins.price)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-700">Tổng cộng</span>
                  <span className="text-xl font-bold text-red-600">{fmt(totalPrice)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mb-6">
              Bằng việc bấm Xác nhận, bạn đồng ý với Điều khoản Dịch vụ của Porsche Việt Nam.
            </p>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold tracking-widest text-xs uppercase transition-colors">Quay lại</button>
              <button onClick={handleSubmit} disabled={submitting} className="w-full md:w-auto px-8 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white font-bold tracking-widest text-xs uppercase transition-all shadow-[0_5px_15px_rgba(220,38,38,0.2)]">
                {submitting ? 'Đang gửi...' : '🏎️ Đặt lịch'}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── FAQ SECTION ── */}
      {step === 0 && (
        <div className="max-w-4xl mx-auto px-4 md:px-8 mt-24">
          <h2 className="text-xl font-bold text-center mb-8 text-gray-900">Câu hỏi thường gặp</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FAQ_LIST.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition-colors h-full shadow-sm">
                <h3 className="text-sm font-bold mb-2 text-gray-900">{item.q}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL YÊU CẦU ĐĂNG NHẬP ── */}
      <AnimatePresence>
        {showLoginGate && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowLoginGate(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-sm w-full bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-2xl h-fit"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowLoginGate(false)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors">✕</button>
              
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl mx-auto mb-4">🔒</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Đăng nhập để tiếp tục</h2>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                Bạn cần có tài khoản để đặt lịch gói <strong style={{ color: PLANS.find(p => p.id === selectedPlan)?.color || '#111' }}>{PLANS.find(p => p.id === selectedPlan)?.name}</strong>.
              </p>
              
              <div className="flex flex-col gap-2.5">
                <Link to="/login" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold tracking-widest text-[11px] uppercase transition-colors">Đăng nhập ngay</Link>
                <Link to="/register" className="w-full py-3 bg-transparent border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg font-bold tracking-widest text-[11px] uppercase transition-colors">Tạo tài khoản mới</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        
    </div>
  );
}