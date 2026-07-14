import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'elite'],
    required: true,
  },
  price:        { type: Number, required: true }, // giá tại thời điểm mua
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'pending_payment'],
    default: 'pending_payment',
  },
  startDate:    { type: Date },
  endDate:      { type: Date },               // startDate + 30 ngày
  renewsAt:     { type: Date },               // ngày gia hạn tự động
  cancelledAt:  { type: Date },

  // Thanh toán
  paymentMethod: {
    type: String,
    enum: ['visa', 'mastercard', 'bank_transfer', 'momo', 'zalopay'],
  },
  txnId:        { type: String },             // mã giao dịch

  // Lịch sử dùng dịch vụ trong tháng
  testDrivesUsed: { type: Number, default: 0 },
  configsSaved:   { type: Number, default: 0 },
}, { timestamps: true });

// ── Tự tính endDate = startDate + 30 ngày ──
subscriptionSchema.pre('save', function (next) {
  if (this.isModified('startDate') && this.startDate) {
    const end = new Date(this.startDate);
    end.setDate(end.getDate() + 30);
    this.endDate  = end;
    this.renewsAt = end;
  }
  next();
});

// ── Method kiểm tra còn hạn không ──
subscriptionSchema.methods.isActive = function () {
  return this.status === 'active' && this.endDate > new Date();
};

export default mongoose.model('Subscription', subscriptionSchema);