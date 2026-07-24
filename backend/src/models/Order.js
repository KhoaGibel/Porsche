
import mongoose from 'mongoose';

// ── Cấu hình màu cá nhân hóa (Custom Order) ──
const colorConfigSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['standard', 'optional', 'pts', 'custom_hex'], // custom_hex = màu khách tự chọn
    required: true,
  },
  name:       { type: String, required: true }, // 'Guards Red' hoặc 'Custom #FF5500'
  hex:        { type: String, required: true }, // '#E8001A'
  extraCost:  { type: Number, default: 0 },     // phí thêm nếu là PTS/custom
  // PTS (Paint to Sample) — khách gửi mã màu RAL/Pantone
  ptsSampleCode: { type: String },              // VD: 'RAL 3020' hoặc 'Pantone 485 C'
});

// ── Options thêm cho Custom Order ──
const orderOptionSchema = new mongoose.Schema({
  name:     { type: String, required: true }, // 'Gói nội thất da Alcantara'
  price:    { type: Number, required: true },
  category: { type: String, enum: ['interior', 'exterior', 'performance', 'tech', 'other'] },
});

const orderSchema = new mongoose.Schema({
  // ── Thông tin đơn ──
  orderNumber: { type: String, unique: true }, // POR-2024-0001
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // ── Xe ──
  carModel: {
    type: String,
    required: true,
    enum: ['GT3 RS', 'GT3', '911 TURBO S'],
  },
  year: { type: Number, default: 2025 },

  // ── Màu sắc cá nhân hóa — đây là phần core của Custom Order ──
  colorConfig: { type: colorConfigSchema, required: true },

  // ── Nội thất ──
  interiorColor: { type: String, default: 'Black' },
  interiorMaterial: {
    type: String,
    enum: ['leather', 'alcantara', 'carbon', 'mixed'],
    default: 'leather',
  },

  // ── Options thêm ──
  addOnOptions: [orderOptionSchema],

  // ── Giá ──
  basePrice:    { type: Number, required: true },  // giá xe gốc
  colorUpgrade: { type: Number, default: 0 },      // phí màu PTS/custom
  optionsTotal: { type: Number, default: 0 },      // tổng options thêm
  totalPrice:   { type: Number, required: true },  // tổng cộng
  depositAmount:{ type: Number, default: 500_000_000 }, // đặt cọc 500tr

  // ── Trạng thái ──
  status: {
    type: String,
    enum: ['draft', 'pending_deposit', 'deposit_paid', 'in_production', 'shipped', 'delivered', 'cancelled'],
    default: 'draft',
  },
  estimatedDelivery: { type: Date },   // thời gian giao xe dự kiến (6-8 tháng)

  // ── Thanh toán ──
  depositPaidAt: { type: Date },
  depositTxnId:  { type: String },     // mã giao dịch đặt cọc

  // ── Dealer phụ trách ──
  assignedDealer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // ── Ghi chú ──
  customerNote: { type: String, maxlength: 500 },
  internalNote: { type: String, maxlength: 500 },

  // ── Showroom ──
  showroom: {
    type: String,
    enum: ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'],
    default: 'Hà Nội',
  },
}, { timestamps: true });

// ── Auto tạo orderNumber ──
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    const year  = new Date().getFullYear();
    this.orderNumber = `POR-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// ── Auto tính totalPrice ──
orderSchema.pre('save', function (next) {
  this.optionsTotal = this.addOnOptions.reduce((sum, o) => sum + o.price, 0);
  this.totalPrice   = this.basePrice + this.colorUpgrade + this.optionsTotal;
  next();
});

export default mongoose.model('Order', orderSchema);