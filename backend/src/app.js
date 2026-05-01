import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import limiter from './middleware/rateLimiter.js';
import taskRoutes from './routes/taskRoutes.js';




dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/auth', limiter, authRoutes);
app.use('/api/tasks', taskRoutes);

export default app;
