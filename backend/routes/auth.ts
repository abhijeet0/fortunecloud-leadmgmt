import express from "express";
import * as authController from "../controllers/authController";

const router = express.Router();

// Franchise signup
router.post("/franchise/signup", (req, res) => {
  return authController.franchiseSignup(req, res);
});

// Franchise login
router.post("/franchise/login", (req, res) => {
  return authController.franchiseLogin(req, res);
});

// Admin login
router.post("/admin/login", (req, res) => {
  return authController.adminLogin(req, res);
});

// Admin create
router.post("/admin/create", (req, res) => {
  return authController.createAdmin(req, res);
});

export default router;
