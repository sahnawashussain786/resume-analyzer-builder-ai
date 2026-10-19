import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resumes.js';
import aiRoutes from './routes/ai.js';
import coverLetterRoutes from './routes/coverLetters.js';
import dashboardRoutes from './routes/dashboard.js';

connectDB();

const app = express();

app.use(express.json({ limit: '2mb' }));
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173',
    credentials: true,
  })
);

import { aiStatus } from './services/aiService.js';

app.get('/api/health', (req, res) => {
  const ai = aiStatus();
  res.json({ status: 'ok', ai: ai.mock ? 'mock' : 'live' });
});

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/coverletters', coverLetterRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ResumeForge API running on http://localhost:${PORT}`);
  console.log(
    `🤖 AI mode: ${aiStatus().mock ? 'MOCK (no live AI key configured — add GEMINI_API_KEY in server/.env for the free tier, or GROQ_API_KEY / OPENAI_API_KEY)' : 'LIVE'}`,
  );

});
