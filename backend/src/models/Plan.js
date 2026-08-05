import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  planId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  color: { 
    type: String, 
    default: '#6b7280' 
  },
  highlight: { 
    type: Boolean, 
    default: false 
  },
  badge: { 
    type: String 
  },
  duration: { 
    type: String, 
    required: true 
  },
  sessions: { 
    type: Number, 
    default: 1 
  },
  location: { 
    type: String, 
    default: 'Showroom Porsche' 
  },
  tagline: { 
    type: String 
  },
  cars: [{ 
    type: String 
  }],
  defaultInsurance: { 
    type: String, 
    default: 'basic' 
  },
  features: [{
    text: String,
    ok: Boolean
  }],
  status: { 
    type: String, 
    enum: ['Đang mở bán', 'Tạm ngưng'], 
    default: 'Đang mở bán' 
  },
}, { timestamps: true });

export default mongoose.model('Plan', planSchema);
