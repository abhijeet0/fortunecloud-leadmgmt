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

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || 'fortune-cloud-franchise-app';
const hasInlineServiceAccount = !!process.env.FIREBASE_CLIENT_EMAIL && !!process.env.FIREBASE_PRIVATE_KEY;
const hasGoogleCredentialsFile = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

const normalizePrivateKey = (rawKey?: string): string | undefined => {
  if (!rawKey) {
    return undefined;
  }
  let key = rawKey.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, '\n');
  return key;
};

const firebaseAppOptions: admin.AppOptions = {
  projectId: firebaseProjectId,
};

if (hasInlineServiceAccount) {
  try {
    firebaseAppOptions.credential = admin.credential.cert({
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: firebaseProjectId,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    } as any);
  } catch (error) {
    console.warn(
      'Invalid FIREBASE_PRIVATE_KEY format. Falling back to application default credentials (if available).'
    );
    if (hasGoogleCredentialsFile) {
      firebaseAppOptions.credential = admin.credential.applicationDefault();
    }
  }
} else if (hasGoogleCredentialsFile) {
  firebaseAppOptions.credential = admin.credential.applicationDefault();
} else {
  console.warn(
    'Firebase Admin running without service account credentials. FCM sends may fail. ' +
      'Set FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY or GOOGLE_APPLICATION_CREDENTIALS.'
  );
}

admin.initializeApp(firebaseAppOptions);

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
