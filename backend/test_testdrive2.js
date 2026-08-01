import mongoose from 'mongoose';
import 'dotenv/config';
import User from './src/models/User.js';
import TestDrive from './src/models/TestDrive.js';

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    
    const user = await User.findOne({});
    console.log('Found user:', user._id);
    
    const orderNumber = 'TD-' + Math.random().toString(16).slice(2, 8).toUpperCase();
    
    const newTestDrive = await TestDrive.create({
      orderNumber,
      user: user._id,
      userName: user.fullName,
      phone: '0123456789',
      cars: ['911 Turbo'],
      showroom: 'Showroom Sài Gòn',
      scheduledAt: new Date(Date.now() + 86400000), // tomorrow
      planId: 'plan2',
      planName: 'Sport Plan',
      note: 'None',
      status: 'pending'
    });
    
    console.log('Successfully created TestDrive:', newTestDrive._id);
    
  } catch (err) {
    console.error('Create error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

test();
