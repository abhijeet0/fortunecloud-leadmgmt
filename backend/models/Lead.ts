import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILead extends Document {
  franchiseId: Types.ObjectId;
  studentName: string;
  qualification: string;
  stream: string;
  yearOfPassing?: number;
  city: string;
  phone: string;
  email?: string;
  currentStatus:
    | 'Submitted'
    | 'Lead acknowledged'
    | 'HOT'
    | 'WARM'
    | 'Unspoken'
    | 'COLD'
    | 'Visited'
    | 'Enrolled';
  remarks?: string;
  admissionAmount?: number;
  enrollmentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>({
  franchiseId: {
    type: Schema.Types.ObjectId,
    ref: 'Franchise',
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  qualification: {
    type: String,
    required: true,
  },
  stream: {
    type: String,
    required: true,
  },
  yearOfPassing: {
    type: Number,
  },
  city: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  currentStatus: {
    type: String,
    enum: ['Submitted', 'Lead acknowledged', 'HOT', 'WARM', 'Unspoken', 'COLD', 'Visited', 'Enrolled'],
    default: 'Submitted',
  },
  remarks: {
    type: String,
  },
  admissionAmount: {
    type: Number,
  },
  enrollmentDate: {
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

export default mongoose.model<ILead>('Lead', leadSchema);
