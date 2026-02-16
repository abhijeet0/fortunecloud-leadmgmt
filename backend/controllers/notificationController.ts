import { Response } from 'express';
import { Types } from 'mongoose';
import admin from 'firebase-admin';
import Franchise from '../models/Franchise';
import AdminModel from '../models/Admin';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

interface NotificationResult {
  success: boolean;
  message?: string;
  successCount?: number;
  failureCount?: number;
  error?: string;
}

type NotificationData = Record<string, unknown>;
const VALID_NOTIFICATION_TYPES = [
  'lead_status_update',
  'commission_approved',
  'commission_paid',
  'general',
] as const;

const toStringData = (data: NotificationData): Record<string, string> => {
  return Object.entries(data).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value === undefined || value === null) {
      return acc;
    }
    acc[key] = typeof value === 'string' ? value : String(value);
    return acc;
  }, {});
};

const getNotificationType = (typeValue?: string): (typeof VALID_NOTIFICATION_TYPES)[number] => {
  return VALID_NOTIFICATION_TYPES.includes(typeValue as any)
    ? (typeValue as (typeof VALID_NOTIFICATION_TYPES)[number])
    : 'general';
};

const INVALID_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

const removeFranchiseTokens = async (franchiseId: Types.ObjectId, tokensToRemove: string[]) => {
  if (!tokensToRemove.length) {
    return;
  }
  await Franchise.updateOne(
    {_id: franchiseId},
    {$pull: {deviceTokens: {token: {$in: tokensToRemove}}}}
  );
};

const removeAdminTokens = async (adminId: Types.ObjectId, tokensToRemove: string[]) => {
  if (!tokensToRemove.length) {
    return;
  }
  await AdminModel.updateOne(
    {_id: adminId},
    {$pull: {deviceTokens: {token: {$in: tokensToRemove}}}}
  );
};

export const registerDeviceToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deviceToken, deviceName } = req.body;

    if (!deviceToken) {
      res.status(400).json({ error: 'Device token required' });
      return;
    }

    const franchise = await Franchise.findOne({ firebaseUid: req.uid });

    if (!franchise) {
      res.status(404).json({ error: 'Franchise not found' });
      return;
    }

    const existingToken = franchise.deviceTokens?.find((dt) => dt.token === deviceToken);

    if (!existingToken) {
      franchise.deviceTokens.push({
        token: deviceToken,
        device: deviceName || 'Unknown',
      });
      await franchise.save();
    }

    res.json({ message: 'Device token registered successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const registerAdminDeviceToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deviceToken, deviceName } = req.body;

    if (!deviceToken) {
      res.status(400).json({ error: 'Device token required' });
      return;
    }

    const adminUser = await AdminModel.findOne({ firebaseUid: req.uid });

    if (!adminUser) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    const existingToken = adminUser.deviceTokens?.find((dt) => dt.token === deviceToken);

    if (!existingToken) {
      adminUser.deviceTokens.push({
        token: deviceToken,
        device: deviceName || 'Unknown',
      });
      await adminUser.save();
    }

    res.json({ message: 'Device token registered successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendNotificationToFranchise = async (
  franchiseId: Types.ObjectId,
  title: string,
  body: string,
  data: NotificationData = {}
): Promise<NotificationResult> => {
  try {
    const dataStringMap = toStringData(data);

    await Notification.create({
      franchiseId,
      title,
      body,
      type: getNotificationType(dataStringMap.type),
      data: dataStringMap,
    });

    const franchise = await Franchise.findById(franchiseId);

    if (!franchise || !franchise.deviceTokens?.length) {
      return { success: true, message: 'Notification saved; no device tokens found' };
    }

    const tokens = franchise.deviceTokens.map((dt) => dt.token);

    const message = {
      notification: {
        title,
        body,
      },
      data: dataStringMap,
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message as any);
    const invalidTokens = tokens.filter((token, idx) => {
      const errCode = response.responses[idx]?.error?.code;
      return errCode ? INVALID_TOKEN_CODES.has(errCode) : false;
    });
    await removeFranchiseTokens(franchiseId, invalidTokens);

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
};

export const sendNotificationToAdmin = async (
  adminId: Types.ObjectId,
  title: string,
  body: string,
  data: NotificationData = {}
): Promise<NotificationResult> => {
  try {
    const adminUser = await AdminModel.findById(adminId);

    if (!adminUser || !adminUser.deviceTokens?.length) {
      return { success: false, message: 'No device tokens found' };
    }

    const tokens = adminUser.deviceTokens.map((dt) => dt.token);

    const message = {
      notification: {
        title,
        body,
      },
      data: toStringData(data),
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message as any);
    const invalidTokens = tokens.filter((token, idx) => {
      const errCode = response.responses[idx]?.error?.code;
      return errCode ? INVALID_TOKEN_CODES.has(errCode) : false;
    });
    await removeAdminTokens(adminId, invalidTokens);

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
};

export const sendLeadStatusNotification = async (
  franchiseId: Types.ObjectId,
  studentName: string,
  newStatus: string,
  leadId?: string
): Promise<NotificationResult> => {
  return sendNotificationToFranchise(
    franchiseId,
    'Lead Status Updated',
    `Lead for ${studentName} is now ${newStatus}`,
    { type: 'lead_status_update', status: newStatus, leadId: leadId || '' }
  );
};

export const sendCommissionApprovedNotification = async (
  franchiseId: Types.ObjectId,
  commissionAmount: number
): Promise<NotificationResult> => {
  return sendNotificationToFranchise(
    franchiseId,
    'Commission Approved',
    `Commission of ₹${commissionAmount} has been approved`,
    { type: 'commission_approved', amount: commissionAmount }
  );
};

export const sendCommissionPaidNotification = async (
  franchiseId: Types.ObjectId,
  commissionAmount: number
): Promise<NotificationResult> => {
  return sendNotificationToFranchise(
    franchiseId,
    'Commission Paid',
    `Commission of ₹${commissionAmount} has been paid`,
    { type: 'commission_paid', amount: commissionAmount }
  );
};

export const getFranchiseNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {page = 1, limit = 20} = req.query;

    const franchise = await Franchise.findOne({firebaseUid: req.uid});
    if (!franchise) {
      res.status(404).json({error: 'Franchise not found'});
      return;
    }

    const pageNo = Math.max(parseInt(page as string, 10), 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string, 10), 1), 100);
    const skip = (pageNo - 1) * pageSize;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({franchiseId: franchise._id}).sort({createdAt: -1}).skip(skip).limit(pageSize),
      Notification.countDocuments({franchiseId: franchise._id}),
      Notification.countDocuments({franchiseId: franchise._id, isRead: false}),
    ]);

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page: pageNo,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    res.status(500).json({error: error.message});
  }
};

export const markFranchiseNotificationRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {notificationId} = req.params;
    const franchise = await Franchise.findOne({firebaseUid: req.uid});
    if (!franchise) {
      res.status(404).json({error: 'Franchise not found'});
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      {_id: notificationId, franchiseId: franchise._id},
      {isRead: true},
      {new: true}
    );

    if (!notification) {
      res.status(404).json({error: 'Notification not found'});
      return;
    }

    res.json({message: 'Notification marked as read', notification});
  } catch (error: any) {
    res.status(500).json({error: error.message});
  }
};

export const markAllFranchiseNotificationsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const franchise = await Franchise.findOne({firebaseUid: req.uid});
    if (!franchise) {
      res.status(404).json({error: 'Franchise not found'});
      return;
    }

    await Notification.updateMany({franchiseId: franchise._id, isRead: false}, {isRead: true});
    res.json({message: 'All notifications marked as read'});
  } catch (error: any) {
    res.status(500).json({error: error.message});
  }
};
