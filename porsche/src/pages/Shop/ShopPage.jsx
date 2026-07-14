import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Can } from '../../hooks/useAbility';
import { SHOP_PLANS } from '../../data/shopPlans';
import useCarStore from '../../store/useCarStore';
import './ShopPage.css';

export default function ShopPage() {
  const theme = useCarStore((s) => s.theme);
  const isDark = theme === 'dark';
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showLoginGate, setShowLoginGate] = useState(false);

  const user = useCarStore((s) => s.user ?? null);
  const isLoggedIn = !!user;

  const handlePurchase = (plan) => {
    if (!isLoggedIn) {
      setSelectedPlan(plan);
      setShowLoginGate(true);
      return;
    }
    // TODO: tích hợp payment gateway
    alert(`Đăng ký gói ${plan.name} — tích hợp payment sau`);
  };

  return (
    <div className={`shop-page ${isDark ? 'dark' : 'light'}`}>

      {/* ── Header ── */}
      <div className="shop-header">
        <p className="shop-eyebrow">Porsche Experience</p>
        <h1 className="shop-title">Chọn gói trải nghiệm</h1>
        <p className="shop-subtitle">
          Đăng ký để mở khóa toàn bộ tính năng showroom 3D và dịch vụ tư vấn cá nhân hóa.
        </p>

        {/* Guest notice */}
        {!isLoggedIn && (
          <div className="shop-guest-notice">
            <span>👀 Bạn đang xem với tư cách khách.</span>
            <Link to="/login" className="shop-login-link">Đăng nhập để mua gói</Link>
          </div>
        )}
      </div>

      {/* ── Plans grid ── */}
      <div className="shop-plans">
        {SHOP_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`shop-plan-card ${plan.highlight ? 'highlighted' : ''} ${isDark ? 'dark' : 'light'}`}
            style={{ '--plan-color': plan.color }}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="shop-plan-badge" style={{ background: plan.color }}>
                {plan.badge}
              </div>
            )}

            {/* Plan header */}
            <div className="shop-plan-header">
              <h2 className="shop-plan-name">{plan.name}</h2>
              <p className="shop-plan-desc">{plan.description}</p>
              <div className="shop-plan-price">
                <span className="shop-plan-amount">{plan.priceLabel}</span>
                <span className="shop-plan-period">/{plan.period}</span>
              </div>
            </div>

            {/* Features */}
            <ul className="shop-plan-features">
              {plan.features.map((f, i) => (
                <li key={i} className={`shop-plan-feature ${f.included ? 'included' : 'excluded'}`}>
                  <span className="shop-feature-icon">
                    {f.included ? '✓' : '✕'}
                  </span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Can do="purchase" on="Shop" passThrough>
              {(allowed) => (
                <button
                  className={`shop-plan-btn ${plan.highlight ? 'primary' : 'secondary'} ${!allowed ? 'locked' : ''}`}
                  onClick={() => handlePurchase(plan)}
                  style={plan.highlight ? { background: plan.color } : {}}
                >
                  {!isLoggedIn
                    ? '🔒 Đăng nhập để đăng ký'
                    : `Đăng ký ${plan.name}`
                  }
                </button>
              )}
            </Can>
          </div>
        ))}
      </div>

      {/* ── FAQ ── */}
      <div className="shop-faq">
        <h2 className="shop-faq-title">Câu hỏi thường gặp</h2>
        <div className="shop-faq-grid">
          {[
            { q: 'Tôi có thể hủy bất kỳ lúc nào không?', a: 'Có. Bạn có thể hủy gói đăng ký bất kỳ lúc nào. Gói sẽ hoạt động đến cuối chu kỳ thanh toán.' },
            { q: 'Phương thức thanh toán nào được chấp nhận?', a: 'Chúng tôi chấp nhận thẻ Visa, Mastercard, chuyển khoản ngân hàng và ví điện tử (Momo, ZaloPay).' },
            { q: 'Tôi có thể nâng cấp gói giữa chừng không?', a: 'Có. Bạn có thể nâng cấp bất kỳ lúc nào. Phần còn lại của chu kỳ hiện tại sẽ được tính theo tỷ lệ.' },
            { q: 'Lịch lái thử có thể hủy hoặc đổi lịch không?', a: 'Có thể hủy hoặc đổi lịch trước 24 giờ. Liên hệ hotline 1800 599 946 để được hỗ trợ.' },
          ].map((item, i) => (
            <div key={i} className={`shop-faq-item ${isDark ? 'dark' : 'light'}`}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Login Gate Modal ── */}
      {showLoginGate && (
        <div className="shop-gate-overlay" onClick={() => setShowLoginGate(false)}>
          <div className="shop-gate-modal" onClick={(e) => e.stopPropagation()}>
            <button className="shop-gate-close" onClick={() => setShowLoginGate(false)}>✕</button>
            <div className="shop-gate-icon">🔒</div>
            <h2>Đăng nhập để tiếp tục</h2>
            <p>
              Bạn cần đăng nhập hoặc tạo tài khoản để đăng ký gói{' '}
              <strong style={{ color: selectedPlan?.color }}>{selectedPlan?.name}</strong>.
            </p>
            <div className="shop-gate-actions">
              <Link to="/login" className="shop-gate-btn primary">Đăng nhập</Link>
              <Link to="/register" className="shop-gate-btn secondary">Tạo tài khoản</Link>
            </div>
            <p className="shop-gate-note">
              Chỉ mất 30 giây để tạo tài khoản miễn phí.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}