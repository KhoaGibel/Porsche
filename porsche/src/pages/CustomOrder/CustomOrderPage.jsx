import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCarStore from '../../store/useCarStore';
import { CAR_DATA } from '../../data/carData';
import './CustomOrderPage.css';

const STEPS = ['Chọn xe', 'Màu sắc', 'Nội thất', 'Xác nhận'];

const BASE_PRICES = {
  'GT3 RS':      '15,800,000,000',
  'GT3':         '12,500,000,000',
  '911 TURBO S': '22,300,000,000',
};

const COLOR_EXTRA = {
  standard:   0,
  optional:   50_000_000,
  pts:        120_000_000,
  custom_hex: 150_000_000,
};

const COLOR_LABELS = {
  standard:   'Màu tiêu chuẩn',
  optional:   'Màu tùy chọn +50tr',
  pts:        'Paint to Sample +120tr',
  custom_hex: 'Màu tự chọn +150tr',
};

const INTERIOR_OPTIONS = [
  { id: 'leather',   label: 'Da bò tự nhiên',  price: 0,          preview: '#2c1810' },
  { id: 'alcantara', label: 'Da Alcantara',     price: 80_000_000, preview: '#1a1a2e' },
  { id: 'carbon',    label: 'Carbon + Da',      price: 120_000_000,preview: '#0a0a0a' },
];

const fmt = (n) => n.toLocaleString('vi-VN') + '₫';

export default function CustomOrderPage() {
  const navigate    = useNavigate();
  const theme       = useCarStore((s) => s.theme);
  const storeCarColor = useCarStore((s) => s.carColor);
  const activeCar   = useCarStore((s) => s.activeCar) ?? 'GT3 RS';

  const [step,       setStep]       = useState(0);
  const [carModel,   setCarModel]   = useState(activeCar);
  const [colorType,  setColorType]  = useState('standard');
  const [selectedColor, setSelectedColor] = useState(null);
  const [customHex,  setCustomHex]  = useState(storeCarColor ?? '#C0392B');
  const [interior,   setInterior]   = useState('leather');
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(null);

  const isDark = theme === 'dark';
  const carData = CAR_DATA[carModel];

  // Tính giá
  const basePrice     = parseInt(BASE_PRICES[carModel]?.replace(/,/g, '') ?? 0);
  const intOpt        = INTERIOR_OPTIONS.find(o => o.id === interior);
  const colorExtra    = COLOR_EXTRA[colorType] ?? 0;
  const interiorExtra = intOpt?.price ?? 0;
  const totalPrice    = basePrice + colorExtra + interiorExtra;
  const deposit       = 500_000_000;

  // Màu đang dùng
  const activeHex = colorType === 'custom_hex'
    ? customHex
    : selectedColor?.hex ?? carData?.colors[0]?.hex ?? '#C0392B';

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // TODO: gọi API thật
      await new Promise(r => setTimeout(r, 1200));
      setSuccess({
        orderNumber: `POR-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`,
        totalPrice,
        deposit,
        carModel,
        colorHex: activeHex,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div className={`co-page ${isDark ? 'dark' : 'light'}`}>
      <div className="co-success">
        <div className="co-success-car" style={{ background: success.colorHex }} />
        <div className="co-success-icon">✓</div>
        <h1>Đặt hàng thành công!</h1>
        <p className="co-success-num">Mã đơn: <strong>{success.orderNumber}</strong></p>
        <p>{success.carModel} — màu <span style={{ color: success.colorHex }}>●</span> {success.colorHex}</p>
        <div className="co-success-price">
          <div><span>Tổng giá trị</span><strong>{fmt(success.totalPrice)}</strong></div>
          <div><span>Đặt cọc ngay</span><strong>{fmt(success.deposit)}</strong></div>
        </div>
        <p className="co-success-note">
          Thời gian giao xe dự kiến <strong>6–8 tháng</strong> từ khi nhận đặt cọc.
          Đội ngũ tư vấn sẽ liên hệ trong 24h.
        </p>
        <div className="co-success-actions">
          <Link to="/" className="co-btn primary">Quay lại showroom</Link>
          <Link to="/account" className="co-btn ghost">Xem đơn hàng</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`co-page ${isDark ? 'dark' : 'light'}`}>

      {/* Header */}
      <div className="co-header">
        <Link to="/" className="co-back">← Showroom</Link>
        <p className="co-eyebrow">Porsche Exclusive</p>
        <h1 className="co-title">Custom Order</h1>
        <p className="co-subtitle">Đặt xe cá nhân hóa trực tiếp từ nhà máy Stuttgart</p>
      </div>

      {/* Steps */}
      <div className="co-steps">
        {STEPS.map((s, i) => (
          <div key={i} className={`co-step ${i === step ? 'active' : i < step ? 'done' : ''}`}
            onClick={() => i < step && setStep(i)}>
            <div className="co-step-dot">{i < step ? '✓' : i + 1}</div>
            <span className="co-step-label">{s}</span>
          </div>
        ))}
      </div>

      <div className="co-body">
        {/* ── Bước 0: Chọn xe ── */}
        {step === 0 && (
          <div className="co-section">
            <h2>Chọn mẫu xe</h2>
            <div className="co-car-grid">
              {Object.keys(CAR_DATA).map((model) => (
                <div key={model}
                  className={`co-car-card ${carModel === model ? 'selected' : ''}`}
                  onClick={() => setCarModel(model)}
                >
                  <div className="co-car-name">{model}</div>
                  <div className="co-car-price">
                    {fmt(parseInt(BASE_PRICES[model].replace(/,/g,'')))}
                  </div>
                  <div className="co-car-desc">{CAR_DATA[model].tagline}</div>
                  {carModel === model && <div className="co-car-check">✓</div>}
                </div>
              ))}
            </div>
            <button className="co-btn primary co-next" onClick={() => setStep(1)}>
              Tiếp theo — Chọn màu →
            </button>
          </div>
        )}

        {/* ── Bước 1: Màu sắc ── */}
        {step === 1 && (
          <div className="co-section">
            <h2>Chọn màu sơn</h2>

            {/* Color type tabs */}
            <div className="co-color-tabs">
              {Object.entries(COLOR_LABELS).map(([type, label]) => (
                <button key={type}
                  className={`co-color-tab ${colorType === type ? 'active' : ''}`}
                  onClick={() => { setColorType(type); setSelectedColor(null); }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Preview màu lớn */}
            <div className="co-color-preview">
              <div className="co-color-ball" style={{ background: activeHex }} />
              <div className="co-color-info">
                <p className="co-color-hex">{activeHex}</p>
                <p className="co-color-extra">
                  {colorExtra > 0 ? `+${fmt(colorExtra)}` : 'Miễn phí'}
                </p>
              </div>
            </div>

            {/* Standard / Optional — swatches */}
            {(colorType === 'standard' || colorType === 'optional') && (
              <div className="co-swatches">
                {carData?.colors.map((color) => (
                  <button key={color.name}
                    className={`co-swatch ${selectedColor?.hex === color.hex ? 'selected' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                  >
                    <div className="co-swatch-dot" style={{ background: color.hex }} />
                    <span>{color.name}</span>
                    {color.tag === 'PTS' && <span className="co-swatch-tag">PTS</span>}
                  </button>
                ))}
              </div>
            )}

            {/* PTS — nhập mã Pantone/RAL */}
            {colorType === 'pts' && (
              <div className="co-pts">
                <label>Mã màu Pantone hoặc RAL</label>
                <input type="text" placeholder="VD: Pantone 485 C  hoặc  RAL 3020"
                  className="co-input" />
                <p className="co-pts-note">
                  Porsche sẽ phối màu theo mã chuẩn quốc tế bạn cung cấp. Thời gian thêm 4–6 tuần.
                </p>
              </div>
            )}

            {/* Custom HEX — color picker */}
            {colorType === 'custom_hex' && (
              <div className="co-hex-picker">
                <label>Chọn màu tự do</label>
                <div className="co-hex-row">
                  <input type="color" value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    className="co-color-input" />
                  <input type="text" value={customHex}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setCustomHex(v);
                    }}
                    className="co-input co-hex-text"
                    placeholder="#FF5500"
                    maxLength={7}
                  />
                </div>
                <p className="co-pts-note">
                  Nhập mã màu HEX bất kỳ. Porsche sẽ xác nhận khả năng thực hiện và liên hệ trong 48h.
                </p>
              </div>
            )}

            <div className="co-nav-btns">
              <button className="co-btn ghost" onClick={() => setStep(0)}>← Quay lại</button>
              <button className="co-btn primary" onClick={() => setStep(2)}>Tiếp theo →</button>
            </div>
          </div>
        )}

        {/* ── Bước 2: Nội thất ── */}
        {step === 2 && (
          <div className="co-section">
            <h2>Chọn nội thất</h2>
            <div className="co-interior-grid">
              {INTERIOR_OPTIONS.map((opt) => (
                <div key={opt.id}
                  className={`co-interior-card ${interior === opt.id ? 'selected' : ''}`}
                  onClick={() => setInterior(opt.id)}
                >
                  <div className="co-interior-preview" style={{ background: opt.preview }} />
                  <div className="co-interior-info">
                    <p className="co-interior-name">{opt.label}</p>
                    <p className="co-interior-price">
                      {opt.price > 0 ? `+${fmt(opt.price)}` : 'Tiêu chuẩn'}
                    </p>
                  </div>
                  {interior === opt.id && <div className="co-car-check">✓</div>}
                </div>
              ))}
            </div>
            <div className="co-nav-btns">
              <button className="co-btn ghost" onClick={() => setStep(1)}>← Quay lại</button>
              <button className="co-btn primary" onClick={() => setStep(3)}>Xem xác nhận →</button>
            </div>
          </div>
        )}

        {/* ── Bước 3: Xác nhận ── */}
        {step === 3 && (
          <div className="co-section">
            <h2>Xác nhận đơn hàng</h2>
            <div className="co-confirm-card">
              {/* Màu preview */}
              <div className="co-confirm-color" style={{ background: activeHex }}>
                <span className="co-confirm-model">{carModel}</span>
              </div>
              <div className="co-confirm-details">
                <div className="co-confirm-row"><span>Mẫu xe</span><strong>{carModel}</strong></div>
                <div className="co-confirm-row">
                  <span>Màu sơn</span>
                  <strong>
                    <span style={{ display:'inline-block', width:12, height:12, borderRadius:'50%', background:activeHex, marginRight:6, verticalAlign:'middle' }}/>
                    {selectedColor?.name ?? customHex} ({COLOR_LABELS[colorType]})
                  </strong>
                </div>
                <div className="co-confirm-row">
                  <span>Nội thất</span>
                  <strong>{INTERIOR_OPTIONS.find(o => o.id === interior)?.label}</strong>
                </div>
                <div className="co-confirm-row"><span>Giao xe dự kiến</span><strong>6–8 tháng</strong></div>
                <hr className="co-divider" />
                <div className="co-confirm-row"><span>Giá xe cơ bản</span><strong>{fmt(basePrice)}</strong></div>
                {colorExtra > 0 && <div className="co-confirm-row"><span>Phí màu sơn</span><strong>+{fmt(colorExtra)}</strong></div>}
                {interiorExtra > 0 && <div className="co-confirm-row"><span>Phí nội thất</span><strong>+{fmt(interiorExtra)}</strong></div>}
                <div className="co-confirm-row total"><span>Tổng cộng</span><strong>{fmt(totalPrice)}</strong></div>
                <div className="co-confirm-row deposit"><span>Đặt cọc ngay</span><strong>{fmt(deposit)}</strong></div>
              </div>
            </div>
            <p className="co-confirm-note">
              Sau khi xác nhận, đội ngũ tư vấn sẽ liên hệ trong 24h để hướng dẫn thanh toán đặt cọc và ký hợp đồng.
            </p>
            <div className="co-nav-btns">
              <button className="co-btn ghost" onClick={() => setStep(2)}>← Quay lại</button>
              <button className="co-btn primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Đang xử lý...' : '🏎️ Xác nhận đặt xe'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar giá — luôn hiện */}
      <div className={`co-price-sidebar ${isDark ? 'dark' : 'light'}`}>
        <div className="co-price-preview" style={{ background: activeHex }} />
        <p className="co-price-model">{carModel}</p>
        <div className="co-price-breakdown">
          <div><span>Xe cơ bản</span><span>{fmt(basePrice)}</span></div>
          {colorExtra   > 0 && <div><span>Màu sơn</span><span>+{fmt(colorExtra)}</span></div>}
          {interiorExtra> 0 && <div><span>Nội thất</span><span>+{fmt(interiorExtra)}</span></div>}
        </div>
        <div className="co-price-total">
          <span>Tổng</span>
          <strong>{fmt(totalPrice)}</strong>
        </div>
        <div className="co-price-deposit">
          Đặt cọc: <strong>{fmt(deposit)}</strong>
        </div>
      </div>
    </div>
  );
}