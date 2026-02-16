import mongoose, {Schema, Document, Types} from 'mongoose';

export type NotificationType =
  | 'lead_status_update'
  | 'commission_approved'
  | 'commission_paid'
  | 'general';

export interface INotification extends Document {
  franchiseId: Types.ObjectId;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    franchiseId: {
      type: Schema.Types.ObjectId,
      ref: 'Franchise',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['lead_status_update', 'commission_approved', 'commission_paid', 'general'],
      default: 'general',
    },
    data: {
      type: Map,
      of: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({franchiseId: 1, createdAt: -1});

export default mongoose.model<INotification>('Notification', notificationSchema);
