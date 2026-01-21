import express from 'express';
import * as franchiseController from '../controllers/franchiseController';
import { authenticateFranchise } from '../middleware/auth';

const router = express.Router();

router.post('/leads', authenticateFranchise, franchiseController.createLead);
router.get('/leads', authenticateFranchise, franchiseController.getLeads);
router.get('/leads/:leadId', authenticateFranchise, franchiseController.getLead);
router.get('/dashboard', authenticateFranchise, franchiseController.getFranchiseDashboard);
router.get('/commissions', authenticateFranchise, franchiseController.getCommissionSummary);

export default router;
