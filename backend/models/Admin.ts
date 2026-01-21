import mongoose, { Schema, Document } from 'mongoose';

interface IDeviceToken {
  token: string;
  device: string;
  createdAt?: Date;
}

export interface IAdmin extends Document {
  firebaseUid: string;
  email: string;
  name: string;
  role: 'admin' | 'finance_admin';
  status: 'active' | 'inactive';
  deviceTokens: IDeviceToken[];
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'finance_admin'],
    default: 'admin',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  deviceTokens: [
    {
      token: String,
      device: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IAdmin>('Admin', adminSchema);
