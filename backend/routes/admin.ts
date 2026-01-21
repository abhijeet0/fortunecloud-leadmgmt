import express from 'express';
import * as adminController from '../controllers/adminController';
import { authenticateAdmin, authorizeFinanceAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/leads', authenticateAdmin, adminController.getAllLeads);
router.get('/leads/:leadId', authenticateAdmin, adminController.getLeadDetails);
router.put('/leads/:leadId/status', authenticateAdmin, adminController.updateLeadStatus);
router.post('/enrollments', authenticateAdmin, adminController.createEnrollment);
router.get('/dashboard', authenticateAdmin, adminController.getAdminDashboard);

router.get('/reports/leads-by-status', authenticateAdmin, adminController.getReportLeadsByStatus);
router.get(
  '/reports/leads-by-franchise',
  authenticateAdmin,
  adminController.getReportLeadsByFranchise
);
router.get(
  '/reports/commission-summary',
  authenticateAdmin,
  adminController.getReportCommissionSummary
);

export default router;
