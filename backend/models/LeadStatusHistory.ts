import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILeadStatusHistory extends Document {
  leadId: Types.ObjectId;
  previousStatus?: string;
  newStatus: string;
  remarks?: string;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
}

const leadStatusHistorySchema = new Schema<ILeadStatusHistory>({
  leadId: {
    type: Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  previousStatus: {
    type: String,
  },
  newStatus: {
    type: String,
    required: true,
  },
  remarks: {
    type: String,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ILeadStatusHistory>('LeadStatusHistory', leadStatusHistorySchema);
