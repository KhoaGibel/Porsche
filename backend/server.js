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

const app  = express();
const PORT = process.env.PORT ?? 5000;

await connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

// ── Routes ──
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
// app.use('/api/inventory',     inventoryRoutes);
// app.use('/api/orders',        orderRoutes);
// app.use('/api/subscriptions', subRouter);

app.use('/api/admin',         adminRoutes); 

app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', message: 'Porsche API 🏎️', time: new Date() })
);

app.use('*', (req, res) => res.status(404).json({ message: `${req.originalUrl} không tồn tại.` }));
app.use((err, req, res, next) => res.status(500).json({ message: err.message }));

app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));