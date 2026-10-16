import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  sendWhatsAppOtp,
  verifyWhatsAppOtp,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendWhatsAppOtp);
router.post("/verify-otp", verifyWhatsAppOtp);
router.get("/me", protect, getMe);

export default router;
