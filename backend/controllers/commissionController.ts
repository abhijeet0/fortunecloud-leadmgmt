import { Response } from 'express';
import mongoose from 'mongoose';
import Commission from '../models/Commission';
import Lead from '../models/Lead';
import { AuthRequest } from '../middleware/auth';
import * as notificationController from './notificationController';

export const getCommissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const commissions = await Commission.find(query)
      .populate('franchiseId', 'franchiseName ownerName')
      .populate('leadId', 'studentName admissionAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Commission.countDocuments(query);

    res.json({
      commissions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCommissionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { commissionId } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ['Pending', 'Approved', 'Paid'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const commission = await Commission.findByIdAndUpdate(
      commissionId,
      {
        status,
        remarks,
        paidDate: status === 'Paid' ? new Date() : undefined,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!commission) {
      res.status(404).json({ error: 'Commission not found' });
      return;
    }

    if (status === 'Approved') {
      await notificationController.sendCommissionApprovedNotification(
        commission.franchiseId as any,
        commission.commissionAmount
      );
    } else if (status === 'Paid') {
      await notificationController.sendCommissionPaidNotification(
        commission.franchiseId as any,
        commission.commissionAmount
      );
    }

    res.json({
      message: 'Commission status updated',
      commission,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCommissionSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const summary = await Commission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$commissionAmount' },
        },
      },
    ]);

    const totalCommissions = await Commission.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$commissionAmount' },
        },
      },
    ]);

    res.json({
      byStatus: summary,
      total: totalCommissions[0]?.total || 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCommissionByFranchise = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { franchiseId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = { franchiseId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const commissions = await Commission.find(query)
      .populate('leadId', 'studentName admissionAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Commission.countDocuments(query);

    const summary = await Commission.aggregate([
      { $match: { franchiseId: new mongoose.Types.ObjectId(franchiseId as string) } },
      {
        $group: {
          _id: null,
          totalEarned: { $sum: '$commissionAmount' },
          totalPaid: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Paid'] }, '$commissionAmount', 0],
            },
          },
        },
      },
    ]);

    res.json({
      commissions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
      summary: summary[0] || { totalEarned: 0, totalPaid: 0 },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
