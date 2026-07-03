// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ── Schema cấu hình xe đã lưu ──
const carConfigSchema = new mongoose.Schema({
  carModel:  { type: String, required: true }, // 'GT3 RS', 'GT3', '911 TURBO S'
  colorName: { type: String, required: true }, // 'Guards Red'
  colorHex:  { type: String, required: true }, // '#E8001A'
  savedAt:   { type: Date, default: Date.now },
  note:      { type: String, maxlength: 200 }, // ghi chú tuỳ chọn
});

// ── Schema lịch đặt lái thử ──
const testDriveSchema = new mongoose.Schema({
  carModel:    { type: String, required: true },
  colorHex:    { type: String },
  scheduledAt: { type: Date, required: true },
  location:    { type: String, default: 'Showroom Hà Nội' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

// ── User Schema chính ──
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Họ tên là bắt buộc'],
      trim: true,
      minlength: [2, 'Tên phải có ít nhất 2 ký tự'],
      maxlength: [80, 'Tên không được quá 80 ký tự'],
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    password: {
      type: String,
      minlength: [8, 'Mật khẩu phải có ít nhất 8 ký tự'],
      select: false, // không trả về password khi query mặc định
    },
    // Dùng khi đăng nhập qua Google/Facebook (không có password)
    authProvider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local',
    },
    firebaseUid: { type: String, sparse: true }, // UID từ Firebase Auth

    avatar:      { type: String, default: '' },
    phone:       { type: String, default: '' },
    isVerified:  { type: Boolean, default: false },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // Dữ liệu Porsche showroom
    savedConfigs: [carConfigSchema],
    testDrives:   [testDriveSchema],

    // Xe yêu thích
    favoriteModel: {
      type: String,
      enum: ['GT3 RS', 'GT3', '911 TURBO S', ''],
      default: '',
    },

    lastLoginAt: { type: Date },
  },
  {
    timestamps: true, // tự thêm createdAt, updatedAt
  }
);

// ── Hash password trước khi save ──
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Method so sánh password ──
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Loại bỏ password khi convert sang JSON ──
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export default mongoose.model('User', userSchema);