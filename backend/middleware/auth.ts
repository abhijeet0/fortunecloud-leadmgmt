import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

export interface AuthRequest extends Request {
  uid?: string;
  email?: string;
  phone?: string;
  userRole?: string;
}

export const authenticateFranchise = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.uid = decodedToken.uid;
    req.email = decodedToken.email;
    req.phone = decodedToken.phone_number;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authenticateAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.uid = decodedToken.uid;
    req.email = decodedToken.email;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authorizeFinanceAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await admin.auth().getUser(req.uid!);
    const customClaims = (user.customClaims || {}) as Record<string, any>;

    if (
      customClaims.role !== "finance_admin" &&
      customClaims.role !== "admin"
    ) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }
    req.userRole = customClaims.role;
    next();
  } catch (error) {
    res.status(403).json({ error: "Authorization check failed" });
  }
};
