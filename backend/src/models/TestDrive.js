import mongoose from 'mongoose';

const testDriveSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  phone: { type: String },
  planId: { type: String },
  planName: { type: String },
  cars: [{ type: String }],
  scheduledAt: { type: Date, required: true },
  showroom: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled'], 
    default: 'pending' 
  },
  note: { type: String }
}, { timestamps: true });

export default mongoose.model('TestDrive', testDriveSchema);