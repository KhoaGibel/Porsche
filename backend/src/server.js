
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT ?? 5000;

// ── Kết nối MongoDB ──
await connectDB();

// ── Middleware ──
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting — bảo vệ khỏi brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100,
  message: { message: 'Quá nhiều request. Vui lòng thử lại sau 15 phút.' },
});
app.use('/api', limiter);

// Rate limiting chặt hơn cho auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Routes ──
app.use('/api/auth',  authRoutes);
app.use('/api/users', userRoutes);

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Porsche Showroom API đang chạy 🏎️',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ──
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} không tồn tại.` });
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status ?? 500).json({
    message: err.message ?? 'Lỗi server không xác định.',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/api/health`);
});