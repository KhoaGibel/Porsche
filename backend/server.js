import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDB } from './src/config/db.js';;

import authRoutes         from './src/routes/AuthRoutes.js';
import userRoutes         from './src/routes/UserRoutes.js';
// import orderRoutes        from './src/routes/orderRoutes.js';
// import { subRouter }      from './src/routes/orderRoutes.js';
import adminRoutes        from './src/routes/AdminRoutes.js';
import paymentRoutes      from './src/routes/paymentRoutes.js';

const app  = express();
const PORT = process.env.PORT ?? 5000;

await connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10kb' }));

// ── Chống SPAM / Rate Limiting ──
// 1. Global Limiter (Áp dụng chung): Tối đa 150 request / 1 phút / IP
const globalLimiter = rateLimit({ 
  windowMs: 60 * 1000, // 1 phút
  max: 150, 
  message: { message: 'Bạn thao tác quá nhanh. Vui lòng chậm lại chút nhé!' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// 2. Strict Limiter (Cho Auth & Thanh toán): Tối đa 20 request / 1 phút / IP
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: 'Quá nhiều yêu cầu thanh toán/đăng nhập. Thử lại sau 1 phút.' }
});

// ── Routes ──
app.use('/api/auth',          strictLimiter, authRoutes);
app.use('/api/users',         userRoutes);
// app.use('/api/inventory',     inventoryRoutes);
// app.use('/api/orders',        orderRoutes);
// app.use('/api/subscriptions', subRouter);
app.use('/api/payments',      strictLimiter, paymentRoutes);

app.use('/api/admin',         adminRoutes); 

app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', message: 'Porsche API 🏎️', time: new Date() })
);

app.use('*', (req, res) => res.status(404).json({ message: `${req.originalUrl} không tồn tại.` }));
app.use((err, req, res, next) => res.status(500).json({ message: err.message }));

app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));