import express from 'express';
import * as commissionController from '../controllers/commissionController';
import { authenticateAdmin, authorizeFinanceAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateAdmin, commissionController.getCommissions);
router.put(
  '/:commissionId/status',
  authenticateAdmin,
  authorizeFinanceAdmin,
  commissionController.updateCommissionStatus
);
router.delete(
  '/:commissionId',
  authenticateAdmin,
  authorizeFinanceAdmin,
  commissionController.deleteCommission
);
router.get('/summary', authenticateAdmin, commissionController.getCommissionSummary);
router.get(
  '/franchise/:franchiseId',
  authenticateAdmin,
  commissionController.getCommissionByFranchise
);

export default router;
