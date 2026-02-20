import { Response } from 'express';
import mongoose from 'mongoose';
import Commission from '../models/Commission';
import Lead from '../models/Lead';
import { AuthRequest } from '../middleware/auth';
import * as notificationController from './notificationController';

export const getCommissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const getQueryValue = (value: unknown): string => {
      if (Array.isArray(value)) {
        const first = value[0];
        return typeof first === 'string' ? first.trim() : '';
      }
      return typeof value === 'string' ? value.trim() : '';
    };

    const status = getQueryValue(req.query.status);
    const pageParam = getQueryValue(req.query.page);
    const limitParam = getQueryValue(req.query.limit);

    const query: any = {};
    if (status !== '') {
      // Allow case-insensitive status values from clients.
      query.status = { $regex: `^${status}$`, $options: 'i' };
    }

    const parsedPage = parseInt(pageParam, 10);
    const parsedLimit = parseInt(limitParam, 10);
    const pageNumber = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const pageSize = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;
    const skip = (pageNumber - 1) * pageSize;

    const commissions = await Commission.find(query)
      .populate('franchiseId', 'franchiseName ownerName')
      .populate('leadId', 'studentName admissionAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Commission.countDocuments(query);

    res.json({
      commissions,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
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

export const deleteCommission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { commissionId } = req.params;
    const commission = await Commission.findByIdAndDelete(commissionId);

    if (!commission) {
      res.status(404).json({ error: 'Commission not found' });
      return;
    }

    res.json({ message: 'Commission deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
