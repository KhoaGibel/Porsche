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
import planRoutes         from './src/routes/PlanRoutes.js';

const app  = express();
const PORT = process.env.PORT ?? 5000;

await connectDB();

// ── Danh sách origin được phép (thêm domain Vercel của bạn vào đây) ──
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://porsche-rlrd.vercel.app',
  // Thêm preview URLs của Vercel
  /^https:\/\/porsche.*\.vercel\.app$/,
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép request không có origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    const allowed = ALLOWED_ORIGINS.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (allowed) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' }));


// ── Chống SPAM / Rate Limiting ──
// 1. Global Limiter (Áp dụng chung): Tối đa 500 request / 1 phút / IP
const globalLimiter = rateLimit({ 
  windowMs: 60 * 1000, // 1 phút
  max: 500, 
  message: { message: 'Bạn thao tác quá nhanh. Vui lòng chậm lại chút nhé!' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// 2. Strict Limiter (Cho Auth & Thanh toán): Tối đa 50 request / 1 phút / IP
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: { message: 'Quá nhiều yêu cầu thanh toán/đăng nhập. Thử lại sau 1 phút.' }
});

// ── Routes ──
app.use('/api/auth',          strictLimiter, authRoutes);
app.use('/api/users',         userRoutes);
// app.use('/api/inventory',     inventoryRoutes);
// app.use('/api/orders',        orderRoutes);
// app.use('/api/subscriptions', subRouter);
app.use('/api/payments',      strictLimiter, paymentRoutes);
app.use('/api/plans',         planRoutes);

app.use('/api/admin',         adminRoutes); 

app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', message: 'Porsche API 🏎️', time: new Date() })
);

app.use('*', (req, res) => res.status(404).json({ message: `${req.originalUrl} không tồn tại.` }));
app.use((err, req, res, next) => res.status(500).json({ message: err.message }));

app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));