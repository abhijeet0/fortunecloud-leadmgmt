import { Response } from 'express';
import { Types } from 'mongoose';
import admin from 'firebase-admin';
import Franchise from '../models/Franchise';
import AdminModel from '../models/Admin';
import { AuthRequest } from '../middleware/auth';

interface NotificationResult {
  success: boolean;
  message?: string;
  successCount?: number;
  failureCount?: number;
  error?: string;
}

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
  data: Record<string, any> = {}
): Promise<NotificationResult> => {
  try {
    const franchise = await Franchise.findById(franchiseId);

    if (!franchise || !franchise.deviceTokens?.length) {
      return { success: false, message: 'No device tokens found' };
    }

    const tokens = franchise.deviceTokens.map((dt) => dt.token);

    const message = {
      notification: {
        title,
        body,
      },
      data,
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message as any);

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
  data: Record<string, any> = {}
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
      data,
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message as any);

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
  newStatus: string
): Promise<NotificationResult> => {
  return sendNotificationToFranchise(
    franchiseId,
    'Lead Status Updated',
    `Lead for ${studentName} is now ${newStatus}`,
    { type: 'lead_status_update', status: newStatus }
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
