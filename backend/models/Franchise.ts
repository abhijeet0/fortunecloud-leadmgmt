import mongoose, { Schema, Document } from 'mongoose';

interface IDeviceToken {
  token: string;
  device: string;
  createdAt?: Date;
}

export interface IFranchise extends Document {
  firebaseUid: string;
  phone: string;
  franchiseName: string;
  ownerName: string;
  email: string;
  city: string;
  isVerified: boolean;
  leadsSubmitted: number;
  commissionPercentage: number;
  status: 'active' | 'inactive' | 'suspended';
  deviceTokens: IDeviceToken[];
  createdAt: Date;
  updatedAt: Date;
}

const franchiseSchema = new Schema<IFranchise>({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{10}$/, 'Please fill a valid 10-digit phone number'],
  },
  franchiseName: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address'],
  },
  city: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  leadsSubmitted: {
    type: Number,
    default: 0,
  },
  commissionPercentage: {
    type: Number,
    default: 10,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
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

export default mongoose.model<IFranchise>('Franchise', franchiseSchema);
