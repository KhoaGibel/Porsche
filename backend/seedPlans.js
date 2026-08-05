import mongoose from 'mongoose';
import 'dotenv/config';
import Plan from './src/models/Plan.js';

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const count = await Plan.countDocuments();
    if (count === 0) {
      console.log('Seeding plans...');
      await Plan.insertMany([
        {
          planId: 'essential',
          name: 'Essential',
          price: 50000000,
          color: '#6b7280',
          highlight: false,
          duration: '60 phút',
          sessions: 1,
          location: 'Showroom nội thành',
          tagline: 'Trải nghiệm Porsche lần đầu',
          cars: ['Porsche 911 GT3'],
          defaultInsurance: 'basic',
          features: [
            { text: '1 buổi lái thử 60 phút', ok: true },
            { text: 'Xe Porsche 911 GT3', ok: true },
            { text: 'Huấn luyện viên đi kèm', ok: true },
            { text: 'Bảo hiểm TNDS cơ bản', ok: true },
            { text: 'Chứng chỉ lái thử Porsche', ok: true },
            { text: 'Lái thử trên track đua', ok: false },
            { text: 'GT3 RS hoặc 911 Turbo S', ok: false },
            { text: 'Video & ảnh kỷ niệm', ok: false },
          ],
          status: 'Đang mở bán'
        },
        {
          planId: 'performance',
          name: 'Performance',
          price: 75000000,
          color: '#dc2626',
          highlight: true,
          badge: 'Phổ biến nhất',
          duration: '90 phút',
          sessions: 2,
          location: 'Cao tốc + Showroom',
          tagline: 'Hiệu suất thật sự',
          cars: ['GT3 RS', 'GT3', '911 Turbo S'],
          defaultInsurance: 'standard',
          features: [
            { text: '2 buổi lái thử 90 phút/buổi', ok: true },
            { text: 'Toàn bộ dòng xe (GT3, GT3 RS, Turbo S)', ok: true },
            { text: 'Huấn luyện viên chuyên nghiệp', ok: true },
            { text: 'Bảo hiểm tiêu chuẩn (70% hư hại)', ok: true },
            { text: 'Video HD + ảnh kỷ niệm', ok: true },
            { text: 'Lái thử trên track đua', ok: true },
            { text: 'Buổi đào tạo kỹ thuật lái', ok: false },
            { text: 'VIP lounge & quà tặng Porsche', ok: false },
          ],
          status: 'Đang mở bán'
        },
        {
          planId: 'elite',
          name: 'Elite',
          price: 100000000,
          color: '#d4af37',
          highlight: false,
          badge: 'VIP',
          duration: 'Trọn ngày',
          sessions: -1,
          location: 'Đường đua Bình Dương Motor Sport',
          tagline: 'Trải nghiệm VIP không giới hạn',
          cars: ['GT3 RS', 'GT3', '911 Turbo S'],
          defaultInsurance: 'premium',
          features: [
            { text: 'Lái thử trọn ngày (8 giờ)', ok: true },
            { text: 'Toàn bộ dòng xe không giới hạn', ok: true },
            { text: 'HLV cá nhân Porsche Sport Driving School', ok: true },
            { text: 'Bảo hiểm cao cấp (100% toàn phần)', ok: true },
            { text: 'Video onboard + drone footage', ok: true },
            { text: 'Trọn ngày trên track đua chuyên nghiệp', ok: true },
            { text: 'Đào tạo kỹ thuật lái với HLV quốc tế', ok: true },
            { text: 'VIP lounge, ẩm thực & quà tặng Porsche', ok: true },
          ],
          status: 'Đang mở bán'
        }
      ]);
      console.log('Seeded plans successfully!');
    } else {
      console.log('Plans already exist. Skipping seed.');
    }
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    process.exit(0);
  }
};

seedPlans();
