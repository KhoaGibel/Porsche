/**
 * Dữ liệu xe Porsche — màu sơn chính xác theo Porsche factory
 * 
 * Mỗi màu có thêm:
 *   - hex: mã màu hex chuẩn Porsche (lấy từ factory color database)
 *   - metallic: true/false — ảnh hưởng đến roughness/metalness trong 3D
 *   - roughness: độ nhám sơn (0 = gương, 1 = mờ hoàn toàn)
 *   - metalness: độ kim loại (0 = sơn thường, 1 = full metallic)
 */

export const CAR_DATA = {

  // ══════════════════════════════════════════════════════
  // 911 GT3 RS — dòng đua thuần túy, bodykit carbon rộng
  // Màu đặc trưng: trắng/xám + mâm đỏ Pyro Red
  // ══════════════════════════════════════════════════════
  'GT3 RS': {
    tagline: 'Đường đua. Không giới hạn.',
    specs: {
      'Động cơ':        '4.0L Boxer 6 xi-lanh',
      'Công suất':      '525 mã lực',
      'Mô-men xoắn':   '465 Nm',
      '0–100 km/h':    '3.2 giây',
      'Tốc độ tối đa': '296 km/h',
      'Hộp số':         'PDK 7 cấp',
      'Dẫn động':       'Cầu sau (RWD)',
      'Trọng lượng':    '1.450 kg',
    },
    price: 'Từ 15,8 tỷ VNĐ',
    colors: [
      // 4 màu tiêu chuẩn (Standard)
      {
        name: 'Ice Grey',
        hex: '#C8C8C4',
        metallic: false,
        roughness: 0.25,
        metalness: 0.6,
        tag: 'Standard',
      },
      {
        name: 'Chalk',
        hex: '#D4CFC6',
        metallic: false,
        roughness: 0.28,
        metalness: 0.5,
        tag: 'Standard',
      },
      {
        name: 'Jet Black',
        hex: '#0D0D0D',
        metallic: false,
        roughness: 0.18,
        metalness: 0.7,
        tag: 'Standard',
      },
      {
        name: 'Carrera White',
        hex: '#E8E5DC',
        metallic: false,
        roughness: 0.22,
        metalness: 0.5,
        tag: 'Standard',
      },
      // 5 màu tùy chọn (Optional)
      {
        name: 'Guards Red',
        hex: '#E8001A',
        metallic: false,
        roughness: 0.2,
        metalness: 0.55,
        tag: 'Optional',
      },
      {
        name: 'Racing Yellow',
        hex: '#F5C800',
        metallic: false,
        roughness: 0.22,
        metalness: 0.5,
        tag: 'Optional',
      },
      {
        name: 'Shark Blue',
        hex: '#1A3F6F',
        metallic: false,
        roughness: 0.2,
        metalness: 0.6,
        tag: 'Optional',
      },
      {
        name: 'Python Green',
        hex: '#3A5535',
        metallic: false,
        roughness: 0.22,
        metalness: 0.55,
        tag: 'Optional',
      },
      // PTS nổi bật (Paint to Sample)
      {
        name: 'GT Silver Met.',
        hex: '#8A8E8F',
        metallic: true,
        roughness: 0.35,
        metalness: 0.85,
        tag: 'PTS',
      },
      {
        name: 'Lava Orange',
        hex: '#D94B00',
        metallic: false,
        roughness: 0.2,
        metalness: 0.55,
        tag: 'PTS',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // 911 GT3 — đường đua + đường phố, cân bằng hơn GT3 RS
  // Màu đặc trưng: xanh Miami Blue, đỏ Guards Red
  // ══════════════════════════════════════════════════════
  'GT3': {
    tagline: 'Thuần khiết. Chính xác. Bất khuất.',
    specs: {
      'Động cơ':        '4.0L Boxer 6 xi-lanh',
      'Công suất':      '503 mã lực',
      'Mô-men xoắn':   '470 Nm',
      '0–100 km/h':    '3.4 giây',
      'Tốc độ tối đa': '320 km/h',
      'Hộp số':         'PDK 7 cấp / Số sàn 6 cấp',
      'Dẫn động':       'Cầu sau (RWD)',
      'Trọng lượng':    '1.435 kg',
    },
    price: 'Từ 12,5 tỷ VNĐ',
    colors: [
      {
        name: 'Carrera White',
        hex: '#E8E5DC',
        metallic: false,
        roughness: 0.22,
        metalness: 0.5,
        tag: 'Standard',
      },
      {
        name: 'Jet Black',
        hex: '#0D0D0D',
        metallic: false,
        roughness: 0.18,
        metalness: 0.7,
        tag: 'Standard',
      },
      {
        name: 'Guards Red',
        hex: '#E8001A',
        metallic: false,
        roughness: 0.2,
        metalness: 0.55,
        tag: 'Standard',
      },
      {
        name: 'Chalk',
        hex: '#D4CFC6',
        metallic: false,
        roughness: 0.28,
        metalness: 0.5,
        tag: 'Standard',
      },
      {
        name: 'Miami Blue',
        hex: '#0060A9',
        metallic: false,
        roughness: 0.2,
        metalness: 0.6,
        tag: 'Optional',
      },
      {
        name: 'Python Green',
        hex: '#3A5535',
        metallic: false,
        roughness: 0.22,
        metalness: 0.55,
        tag: 'Optional',
      },
      {
        name: 'GT Silver Met.',
        hex: '#8A8E8F',
        metallic: true,
        roughness: 0.35,
        metalness: 0.85,
        tag: 'Optional',
      },
      {
        name: 'Gentian Blue',
        hex: '#213A6B',
        metallic: true,
        roughness: 0.35,
        metalness: 0.8,
        tag: 'PTS',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // 911 Turbo S — đỉnh cao hiệu suất, AWD, sang trọng hơn
  // Màu đặc trưng: đen, bạc, xanh Gentian Blue
  // ══════════════════════════════════════════════════════
  '911 TURBO S': {
    tagline: 'Sức mạnh không thỏa hiệp.',
    specs: {
      'Động cơ':        '3.8L Boxer Biturbo 6 xi-lanh',
      'Công suất':      '650 mã lực',
      'Mô-men xoắn':   '800 Nm',
      '0–100 km/h':    '2.7 giây',
      'Tốc độ tối đa': '330 km/h',
      'Hộp số':         'PDK 8 cấp',
      'Dẫn động':       'AWD – 4 bánh toàn thời gian',
      'Trọng lượng':    '1.640 kg',
    },
    price: 'Từ 22,3 tỷ VNĐ',
    colors: [
      {
        name: 'Jet Black',
        hex: '#0D0D0D',
        metallic: false,
        roughness: 0.18,
        metalness: 0.7,
        tag: 'Standard',
      },
      {
        name: 'Carrera White',
        hex: '#E8E5DC',
        metallic: false,
        roughness: 0.22,
        metalness: 0.5,
        tag: 'Standard',
      },
      {
        name: 'Chalk',
        hex: '#D4CFC6',
        metallic: false,
        roughness: 0.28,
        metalness: 0.5,
        tag: 'Standard',
      },
      {
        name: 'GT Silver Met.',
        hex: '#8A8E8F',
        metallic: true,
        roughness: 0.35,
        metalness: 0.85,
        tag: 'Standard',
      },
      {
        name: 'Guards Red',
        hex: '#E8001A',
        metallic: false,
        roughness: 0.2,
        metalness: 0.55,
        tag: 'Optional',
      },
      {
        name: 'Gentian Blue Met.',
        hex: '#1B2E60',
        metallic: true,
        roughness: 0.38,
        metalness: 0.82,
        tag: 'Optional',
      },
      {
        name: 'Python Green',
        hex: '#3A5535',
        metallic: false,
        roughness: 0.22,
        metalness: 0.55,
        tag: 'Optional',
      },
      {
        name: 'Arena Red Met.',
        hex: '#8B1A1A',
        metallic: true,
        roughness: 0.38,
        metalness: 0.8,
        tag: 'PTS',
      },
    ],
  },
};