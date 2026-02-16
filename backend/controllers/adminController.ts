import { Response } from 'express';
import Lead from '../models/Lead';
import LeadStatusHistory from '../models/LeadStatusHistory';
import Commission from '../models/Commission';
import Franchise from '../models/Franchise';
import AdminModel from '../models/Admin';
import { AuthRequest } from '../middleware/auth';
import * as notificationController from './notificationController';

export const getAllLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { franchise, city, status, date, searchTerm, page = 1, limit = 20 } = req.query;

    const query: any = {};

    if (franchise) {
      query.franchiseId = franchise;
    }

    if (city) {
      query.city = city;
    }

    if (status) {
      query.currentStatus = status;
    }

    if (date) {
      const targetDate = new Date(date as string);
      query.createdAt = {
        $gte: new Date(targetDate.setHours(0, 0, 0)),
        $lte: new Date(targetDate.setHours(23, 59, 59)),
      };
    }

    if (searchTerm) {
      query.$or = [
        { studentName: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const leads = await Lead.find(query)
      .populate('franchiseId', 'franchiseName ownerName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Lead.countDocuments(query);

    res.json({
      leads,
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

export const getLeadDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadId } = req.params;

    const lead = await Lead.findById(leadId).populate(
      'franchiseId',
      'franchiseName ownerName email phone'
    );

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const history = await LeadStatusHistory.find({ leadId })
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    const commission = await Commission.findOne({ leadId });

    res.json({
      lead,
      history,
      commission,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateLeadStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadId } = req.params;
    const { newStatus, remarks } = req.body;
    const adminUser = await AdminModel.findOne({ firebaseUid: req.uid });

    const validStatuses = [
      'Submitted',
      'Lead acknowledged',
      'HOT',
      'WARM',
      'Unspoken',
      'COLD',
      'Visited',
      'Enrolled',
    ];
    if (!validStatuses.includes(newStatus)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const previousStatus = lead.currentStatus;
    lead.currentStatus = newStatus as any;
    lead.remarks = remarks;

    if (newStatus === 'Enrolled' && !lead.enrollmentDate) {
      lead.enrollmentDate = new Date();
    }

    await lead.save();

    await LeadStatusHistory.create({
      leadId,
      previousStatus,
      newStatus,
      remarks,
      updatedBy: adminUser?._id,
    });

    const notificationResult = await notificationController.sendLeadStatusNotification(
      lead.franchiseId as any,
      lead.studentName,
      newStatus,
      lead._id.toString()
    );
    if (!notificationResult.success) {
      console.warn('Lead status notification failed:', notificationResult.error || notificationResult.message);
    }

    res.json({
      message: 'Lead status updated',
      lead,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createEnrollment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadId, admissionAmount } = req.body;
    const adminUser = await AdminModel.findOne({ firebaseUid: req.uid });

    if (!leadId || !admissionAmount) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    lead.admissionAmount = admissionAmount;
    lead.currentStatus = 'Enrolled';
    lead.enrollmentDate = new Date();
    await lead.save();

    const franchise = await Franchise.findById(lead.franchiseId);
    const commissionPercentage = franchise?.commissionPercentage || 10;
    const commissionAmount = (admissionAmount * commissionPercentage) / 100;

    const commission = new Commission({
      leadId,
      franchiseId: lead.franchiseId,
      admissionAmount,
      commissionPercentage,
      commissionAmount,
      status: 'Pending',
    });

    await commission.save();

    await LeadStatusHistory.create({
      leadId,
      previousStatus: lead.currentStatus,
      newStatus: 'Enrolled',
      remarks: `Enrolled with admission amount: ${admissionAmount}`,
      updatedBy: adminUser?._id,
    });

    const notificationResult = await notificationController.sendLeadStatusNotification(
      lead.franchiseId as any,
      lead.studentName,
      'Enrolled',
      lead._id.toString()
    );
    if (!notificationResult.success) {
      console.warn('Enrollment notification failed:', notificationResult.error || notificationResult.message);
    }

    res.status(201).json({
      message: 'Enrollment created and commission calculated',
      lead,
      commission,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalLeads = await Lead.countDocuments();
    const enrolledLeads = await Lead.countDocuments({ currentStatus: 'Enrolled' });

    const leadsByStatus = await Lead.aggregate([
      { $group: { _id: '$currentStatus', count: { $sum: 1 } } },
    ]);

    const leadsByFranchise = await Lead.aggregate([
      {
        $group: {
          _id: '$franchiseId',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'franchises',
          localField: '_id',
          foreignField: '_id',
          as: 'franchise',
        },
      },
    ]);

    const commissions = await Commission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$commissionAmount' },
        },
      },
    ]);

    res.json({
      summary: {
        totalLeads,
        enrolledLeads,
        totalFranchises: await Franchise.countDocuments(),
      },
      leadsByStatus,
      leadsByFranchise,
      commissions,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReportLeadsByStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const report = await Lead.aggregate([
      {
        $group: {
          _id: '$currentStatus',
          count: { $sum: 1 },
          leads: { $push: '$studentName' },
        },
      },
    ]);

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReportLeadsByFranchise = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const report = await Lead.aggregate([
      {
        $lookup: {
          from: 'franchises',
          localField: 'franchiseId',
          foreignField: '_id',
          as: 'franchise',
        },
      },
      {
        $group: {
          _id: '$franchiseId',
          franchiseName: { $first: { $arrayElemAt: ['$franchise.franchiseName', 0] } },
          count: { $sum: 1 },
          enrolled: {
            $sum: {
              $cond: [{ $eq: ['$currentStatus', 'Enrolled'] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReportCommissionSummary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const report = await Commission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$commissionAmount' },
        },
      },
    ]);

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
