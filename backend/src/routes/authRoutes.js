import express from "express";
import {
  registerUser,
  loginUser,
  adminLogin,
  getMe,
  sendWhatsAppOtp,
  verifyWhatsAppOtp,
  googleLogin,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", adminLogin);
router.post("/send-otp", sendWhatsAppOtp);
router.post("/verify-otp", verifyWhatsAppOtp);
router.post("/google", googleLogin);
router.get("/me", protect, getMe);

export default router;
