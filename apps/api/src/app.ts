import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.router';
import { studentRouter } from './modules/profiles/student.router';
import { companyRouter } from './modules/profiles/company.router';
import { quizRouter } from './modules/quiz/quiz.router';
import { listingsRouter } from './modules/listings/listings.router';
import { swipesRouter } from './modules/swipes/swipes.router';
import { matchesRouter } from './modules/matches/matches.router';
import { chatRouter } from './modules/chat/chat.router';
import { applicationsRouter } from './modules/applications/applications.router';
import { berufsschulenRouter } from './modules/berufsschulen/berufsschulen.router';
import { berufeRouter } from './modules/berufe/berufe.router';

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/students', studentRouter);
app.use('/api/companies', companyRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/swipes', swipesRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/berufsschulen', berufsschulenRouter);
app.use('/api/berufe', berufeRouter);

// Error handling
app.use(errorHandler);

export { app };
