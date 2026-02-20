import express from 'express';
import * as adminController from '../controllers/adminController';
import { authenticateAdmin, authorizeFinanceAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/leads', authenticateAdmin, adminController.getAllLeads);
router.get('/leads/:leadId', authenticateAdmin, adminController.getLeadDetails);
router.put('/leads/:leadId', authenticateAdmin, adminController.updateLead);
router.put('/leads/:leadId/status', authenticateAdmin, adminController.updateLeadStatus);
router.delete('/leads/:leadId', authenticateAdmin, adminController.deleteLead);
router.post('/enrollments', authenticateAdmin, adminController.createEnrollment);
router.get('/dashboard', authenticateAdmin, adminController.getAdminDashboard);
router.get('/franchises', authenticateAdmin, adminController.getFranchises);
router.put('/franchises/:franchiseId', authenticateAdmin, adminController.updateFranchise);
router.delete('/franchises/:franchiseId', authenticateAdmin, adminController.deleteFranchise);

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
