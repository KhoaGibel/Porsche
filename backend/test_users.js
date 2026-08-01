import mongoose from 'mongoose';
import 'dotenv/config';

import User from './src/models/User.js';

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    
    const users = await User.find({});
    console.log('Total users:', users.length);
    for (const u of users) {
      if (!u.fullName) {
        console.log('User missing fullName:', u._id, u.email);
      }
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

test();
