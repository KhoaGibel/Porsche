import mongoose from 'mongoose';
import 'dotenv/config';

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

const TestDrive = mongoose.models.TestDrive || mongoose.model('TestDrive', testDriveSchema);

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    
    const newTestDrive = new TestDrive({
      orderNumber: 'TD-' + Math.random().toString(16).slice(2, 8).toUpperCase(),
      user: new mongoose.Types.ObjectId(),
      userName: 'Test User',
      phone: '0123456789',
      cars: ['GT3 RS'],
      showroom: 'Showroom Hà Nội',
      scheduledAt: new Date(),
      planId: 'plan1',
      planName: 'Pro Plan',
      note: 'Test note',
      status: 'pending'
    });
    
    // Check validation manually
    const err = newTestDrive.validateSync();
    if (err) {
      console.error('Validation error:', err);
    } else {
      console.log('Validation passed!');
    }
    
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

test();
