import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICommission extends Document {
  leadId: Types.ObjectId;
  franchiseId: Types.ObjectId;
  admissionAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  status: 'Pending' | 'Approved' | 'Paid';
  remarks?: string;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const commissionSchema = new Schema<ICommission>({
  leadId: {
    type: Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  franchiseId: {
    type: Schema.Types.ObjectId,
    ref: 'Franchise',
    required: true,
  },
  admissionAmount: {
    type: Number,
    required: true,
  },
  commissionPercentage: {
    type: Number,
    required: true,
  },
  commissionAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Paid'],
    default: 'Pending',
  },
  remarks: {
    type: String,
  },
  paidDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ICommission>('Commission', commissionSchema);
