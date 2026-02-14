import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import admin from "firebase-admin";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import franchiseRoutes from "./routes/franchise";
import adminRoutes from "./routes/admin";
import commissionRoutes from "./routes/commission";
import notificationRoutes from "./routes/notifications";

dotenv.config();

const app: Express = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://localhost:8081",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// Initialize Firebase Admin SDK
admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID || "fortune-cloud-franchise-app",
});

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/fortunecloud")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/franchise", franchiseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/commission", commissionRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
