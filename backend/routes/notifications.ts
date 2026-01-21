import express from 'express';
import * as notificationController from '../controllers/notificationController';
import { authenticateFranchise, authenticateAdmin } from '../middleware/auth';

const router = express.Router();

router.post(
  '/franchise/device-token',
  authenticateFranchise,
  notificationController.registerDeviceToken
);
router.post(
  '/admin/device-token',
  authenticateAdmin,
  notificationController.registerAdminDeviceToken
);

export default router;
