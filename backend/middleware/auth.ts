import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import AdminModel from '../models/Admin';

export interface AuthRequest extends Request {
  uid?: string;
  email?: string;
  phone?: string;
  userRole?: string;
}

export const authenticateFranchise = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.uid = decodedToken.uid;
    req.email = decodedToken.email;
    req.phone = decodedToken.phone_number;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authenticateAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.uid = decodedToken.uid;
    req.email = decodedToken.email;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorizeFinanceAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await admin.auth().getUser(req.uid!);
    const customClaims = (user.customClaims || {}) as Record<string, any>;
    const claimRole = customClaims.role;

    // Fallback to Mongo role when Firebase custom claims are not configured.
    let dbRole: string | undefined;
    if (!claimRole) {
      const adminUser = await AdminModel.findOne({ firebaseUid: req.uid }).select('role');
      dbRole = adminUser?.role;
    }
    const effectiveRole = claimRole || dbRole;

    if (effectiveRole !== 'finance_admin' && effectiveRole !== 'admin') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    req.userRole = effectiveRole;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Authorization check failed' });
  }
};
