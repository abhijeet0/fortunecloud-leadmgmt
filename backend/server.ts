import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import franchiseRoutes from './routes/franchise';
import adminRoutes from './routes/admin';
import commissionRoutes from './routes/commission';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app: Express = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:8081'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

admin.initializeApp({
  // credential: admin.credential.cert({
  //   type: process.env.FIREBASE_TYPE || 'service_account',
  //   project_id: process.env.FIREBASE_PROJECT_ID,
  //   private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  //   private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  //   client_email: process.env.FIREBASE_CLIENT_EMAIL,
  //   client_id: process.env.FIREBASE_CLIENT_ID,
  //   auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
  //   token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
  //   auth_provider_x509_cert_url:
  //     process.env.FIREBASE_AUTH_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
  //   client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  // }) as any,
  // databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: "fortune-cloud-franchise-app",

});

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fortunecloud')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/franchise', franchiseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/commission', commissionRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
