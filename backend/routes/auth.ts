import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

router.post('/franchise/signup', authController.franchiseSignup);
router.post('/franchise/login', authController.franchiseLogin);
router.post('/admin/login', authController.adminLogin);
router.post('/admin/create', authController.createAdmin);

export default router;
