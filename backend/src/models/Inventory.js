import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  carModel: {
    type: String,
    required: true,
    enum: ['GT3 RS', 'GT3', '911 TURBO S'],
  },
  vin:         { type: String, unique: true },      // số khung xe
  year:        { type: Number, default: 2024 },
  colorName:   { type: String, required: true },    // 'Guards Red'
  colorHex:    { type: String, required: true },    // '#E8001A'
  colorType:   { type: String, enum: ['standard', 'optional', 'pts'], default: 'standard' },
  price:       { type: Number, required: true },    // VND
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold', 'incoming'],
    default: 'available',
  },
  location:    { type: String, default: 'Showroom Hà Nội' },
  specs:       { type: Map, of: String },           // thông số xe
  images:      [{ type: String }],                  // URLs ảnh
  reservedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reservedAt:  { type: Date },
  soldAt:      { type: Date },
  notes:       { type: String },
}, { timestamps: true });

export default mongoose.model('Inventory', inventorySchema);