import { Response } from 'express';
import Lead from '../models/Lead';
import LeadStatusHistory from '../models/LeadStatusHistory';
import Commission from '../models/Commission';
import Franchise from '../models/Franchise';
import { AuthRequest } from '../middleware/auth';

export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentName, qualification, stream, yearOfPassing, city, phone, email } = req.body;

    if (!studentName || !qualification || !stream || !city || !phone) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(phone)) {
      res.status(400).json({ error: 'Invalid phone number' });
      return;
    }

    if (email && !emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    const franchise = await Franchise.findOne({ firebaseUid: req.uid });

    if (!franchise) {
      res.status(404).json({ error: 'Franchise not found' });
      return;
    }

    const lead = new Lead({
      franchiseId: franchise._id,
      studentName,
      qualification,
      stream,
      yearOfPassing,
      city,
      phone,
      email,
    });

    await lead.save();

    await Franchise.findByIdAndUpdate(franchise._id, { $inc: { leadsSubmitted: 1 } });

    await LeadStatusHistory.create({
      leadId: lead._id,
      newStatus: 'Submitted',
      updatedBy: franchise._id,
    });

    res.status(201).json({
      message: 'Lead created successfully',
      lead,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, searchTerm, page = 1, limit = 20 } = req.query;

    const franchise = await Franchise.findOne({ firebaseUid: req.uid });

    if (!franchise) {
      res.status(404).json({ error: 'Franchise not found' });
      return;
    }

    const query: any = { franchiseId: franchise._id };

    if (status) {
      query.currentStatus = status;
    }

    if (searchTerm) {
      query.$or = [
        { studentName: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const leads = await Lead.find(query)
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

export const getLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadId } = req.params;

    const franchise = await Franchise.findOne({ firebaseUid: req.uid });

    if (!franchise) {
      res.status(404).json({ error: 'Franchise not found' });
      return;
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    if (lead.franchiseId.toString() !== franchise._id.toString()) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const history = await LeadStatusHistory.find({ leadId }).sort({ createdAt: -1 });

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

export const getFranchiseDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const franchise = await Franchise.findOne({ firebaseUid: req.uid });

    if (!franchise) {
      res.status(404).json({ error: 'Franchise not found' });
      return;
    }

    const totalLeads = await Lead.countDocuments({ franchiseId: franchise._id });

    const leadsByStatus = await Lead.aggregate([
      { $match: { franchiseId: franchise._id } },
      { $group: { _id: '$currentStatus', count: { $sum: 1 } } },
    ]);

    const commissions = await Commission.find({ franchiseId: franchise._id });

    const totalCommissionAmount = commissions.reduce((sum, comm) => sum + comm.commissionAmount, 0);
    const paidCommissionAmount = commissions
      .filter((comm) => comm.status === 'Paid')
      .reduce((sum, comm) => sum + comm.commissionAmount, 0);

    res.json({
      franchise: {
        name: franchise.franchiseName,
        owner: franchise.ownerName,
        email: franchise.email,
        city: franchise.city,
        commissionPercentage: franchise.commissionPercentage,
      },
      statistics: {
        totalLeads,
        leadsByStatus,
        totalCommissionEarned: totalCommissionAmount,
        paidCommission: paidCommissionAmount,
        pendingCommission: totalCommissionAmount - paidCommissionAmount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCommissionSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const franchise = await Franchise.findOne({ firebaseUid: req.uid });

    if (!franchise) {
      res.status(404).json({ error: 'Franchise not found' });
      return;
    }

    const commissions = await Commission.find({ franchiseId: franchise._id }).populate(
      'leadId',
      'studentName admissionAmount'
    );

    const summary = {
      total: commissions.length,
      pending: commissions.filter((c) => c.status === 'Pending').length,
      approved: commissions.filter((c) => c.status === 'Approved').length,
      paid: commissions.filter((c) => c.status === 'Paid').length,
      commissions,
    };

    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
