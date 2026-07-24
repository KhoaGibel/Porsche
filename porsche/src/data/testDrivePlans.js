
export const fmt = (n) => n.toLocaleString('vi-VN') + '₫';

// ── 3 gói đăng ký lái thử ──
export const PLANS = [
  {
    id:       'essential',
    name:     'Essential',
    price:    50_000_000,
    color:    '#6b7280',
    highlight: false,
    duration: '60 phút',
    sessions: 1,
    location: 'Showroom nội thành',
    tagline:  'Trải nghiệm Porsche lần đầu',
    cars:     ['Porsche 911 GT3'],
    defaultInsurance: 'basic',
    features: [
      { text: '1 buổi lái thử 60 phút',            ok: true  },
      { text: 'Xe Porsche 911 GT3',                 ok: true  },
      { text: 'Huấn luyện viên đi kèm',            ok: true  },
      { text: 'Bảo hiểm TNDS cơ bản',              ok: true  },
      { text: 'Chứng chỉ lái thử Porsche',          ok: true  },
      { text: 'Lái thử trên track đua',             ok: false },
      { text: 'GT3 RS hoặc 911 Turbo S',            ok: false },
      { text: 'Video & ảnh kỷ niệm',               ok: false },
    ],
  },
  {
    id:       'performance',
    name:     'Performance',
    price:    75_000_000,
    color:    '#dc2626',
    highlight: true,
    badge:    'Phổ biến nhất',
    duration: '90 phút',
    sessions: 2,
    location: 'Cao tốc + Showroom',
    tagline:  'Hiệu suất thật sự',
    cars:     ['GT3 RS', 'GT3', '911 Turbo S'],
    defaultInsurance: 'standard',
    features: [
      { text: '2 buổi lái thử 90 phút/buổi',       ok: true  },
      { text: 'Toàn bộ dòng xe (GT3, GT3 RS, Turbo S)', ok: true },
      { text: 'Huấn luyện viên chuyên nghiệp',     ok: true  },
      { text: 'Bảo hiểm tiêu chuẩn (70% hư hại)', ok: true  },
      { text: 'Video HD + ảnh kỷ niệm',            ok: true  },
      { text: 'Lái thử trên track đua',             ok: true  },
      { text: 'Buổi đào tạo kỹ thuật lái',         ok: false },
      { text: 'VIP lounge & quà tặng Porsche',     ok: false },
    ],
  },
  {
    id:       'elite',
    name:     'Elite',
    price:    100_000_000,
    color:    '#d4af37',
    highlight: false,
    badge:    'VIP',
    duration: 'Trọn ngày',
    sessions: -1,
    location: 'Đường đua Bình Dương Motor Sport',
    tagline:  'Trải nghiệm VIP không giới hạn',
    cars:     ['GT3 RS', 'GT3', '911 Turbo S'],
    defaultInsurance: 'premium',
    features: [
      { text: 'Lái thử trọn ngày (8 giờ)',                    ok: true },
      { text: 'Toàn bộ dòng xe không giới hạn',              ok: true },
      { text: 'HLV cá nhân Porsche Sport Driving School',    ok: true },
      { text: 'Bảo hiểm cao cấp (100% toàn phần)',          ok: true },
      { text: 'Video onboard + drone footage',               ok: true },
      { text: 'Trọn ngày trên track đua chuyên nghiệp',     ok: true },
      { text: 'Đào tạo kỹ thuật lái với HLV quốc tế',      ok: true },
      { text: 'VIP lounge, ẩm thực & quà tặng Porsche',    ok: true },
    ],
  },
];

// ── Gói bảo hiểm ──
export const INSURANCE = {
  basic: {
    id:    'basic',
    name:  'Bảo hiểm Cơ bản',
    price: 0,
    desc:  'TNDS bắt buộc + tai nạn thân thể',
    items: [
      { text: 'Bảo hiểm TNDS bắt buộc',      ok: true  },
      { text: 'Tai nạn thân thể lái xe',       ok: true  },
      { text: 'Bồi thường hư hại xe',          ok: false },
      { text: 'Xe thay thế & hỗ trợ 24/7',    ok: false },
    ],
  },
  standard: {
    id:    'standard',
    name:  'Bảo hiểm Tiêu chuẩn',
    price: 5_000_000,
    desc:  'Bồi thường 70% hư hại xe',
    items: [
      { text: 'Bảo hiểm TNDS bắt buộc',      ok: true },
      { text: 'Tai nạn thân thể lái xe',       ok: true },
      { text: 'Bồi thường hư hại xe (70%)',   ok: true },
      { text: 'Xe thay thế & hỗ trợ 24/7',   ok: true },
    ],
  },
  premium: {
    id:    'premium',
    name:  'Bảo hiểm Cao cấp',
    price: 12_000_000,
    desc:  'Bảo vệ toàn diện 100%',
    items: [
      { text: 'Bảo hiểm TNDS bắt buộc',           ok: true },
      { text: 'Tai nạn thân thể lái xe',            ok: true },
      { text: 'Bồi thường hư hại xe (100%)',        ok: true },
      { text: 'Xe thay thế + hỗ trợ 24/7',         ok: true },
    ],
  },
};

export const SHOWROOMS = [
  'Hà Nội — 33 Láng Hạ',
  'HCM — 10 Nguyễn Văn Linh',
  'Đà Nẵng — 195 Nguyễn Văn Linh',
  'Đường đua Bình Dương Motor Sport',
];

export const TIME_SLOTS = [
  '08:00','08:30','09:00','09:30',
  '10:00','10:30','14:00','14:30',
  '15:00','15:30','16:00',
];