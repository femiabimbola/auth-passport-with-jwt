import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import passport from 'passport';
import cors from 'cors';
import connectDB from './config/db';
import authRouter from './routes/auth';
import configurePassport from './config/passport';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
configurePassport(passport);

connectDB();

app.use(
  cors({
    origin: process.env.WEB_URL, // Allow only your frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Express + TypeScript!' });
});

app.use('/auth', authRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
