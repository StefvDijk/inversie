import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes placeholder
app.get('/api', (req, res) => {
  res.json({
    name: 'Inversie API',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET /api/potjes',
      'GET /api/decisions',
      'POST /api/decisions',
      'GET /api/money-requests',
      'POST /api/money-requests',
      'GET /api/transactions',
      'GET /api/documents',
      'POST /api/documents',
      'GET /api/savings-goals',
      'POST /api/savings-goals',
      'GET /api/surveys',
      'GET /api/appointments',
      'GET /api/notifications',
    ],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
================================================
  Inversie Backend Server
  Running on http://localhost:${PORT}
================================================
  `);
});

export default app;
