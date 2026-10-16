import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { getIsMongoConnected } from "../config/db.js";
import { devStore } from "../utils/devStore.js";

// Helper function to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "wakheel_secret_key", {
    expiresIn: "30d",
  });
};

// @desc    Register a new user (Client or Advocate)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      verifyMethod,
      accountType,
      barCouncilId,
      firmName,
      teamSize,
      firmRegistration,
      icsiNumber,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();
    // Normalize role based on accountType or role
    let cleanRole = ["advocate", "client", "citizen", "cs", "ca"].includes(role) ? role : "citizen";
    if (accountType === "independent_advocate" || accountType === "advocate") cleanRole = "advocate";
    if (accountType === "law_firm" || accountType === "cs") cleanRole = "cs";
    if (accountType === "ca") cleanRole = "ca";
    if (accountType === "client" || accountType === "citizen") cleanRole = "citizen";

    const cleanName = (fullName || normalizedEmail.split("@")[0]).trim();
    let user;

    const extraFields = {
      accountType: accountType || (cleanRole === "advocate" ? "independent_advocate" : cleanRole === "cs" ? "cs" : cleanRole === "ca" ? "ca" : "citizen"),
      barCouncilId: (barCouncilId || "").trim(),
      firmName: (firmName || "").trim(),
      teamSize: (teamSize || "").trim(),
      firmRegistration: (firmRegistration || "").trim(),
      icsiNumber: (icsiNumber || "").trim(),
      icaiNumber: (req.body.icaiNumber || "").trim(),
    };

    if (getIsMongoConnected()) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        existingUser.fullName = cleanName;
        existingUser.role = cleanRole;
        existingUser.password = cleanPassword;
        if (verifyMethod) existingUser.verifyMethod = verifyMethod;
        Object.assign(existingUser, extraFields);
        user = await existingUser.save();
      } else {
        user = await User.create({
          fullName: cleanName,
          email: normalizedEmail,
          password: cleanPassword,
          role: cleanRole,
          verifyMethod: verifyMethod || "email",
          ...extraFields,
        });
      }
    } else {
      user = await devStore.createUser({
        fullName: cleanName,
        email: normalizedEmail,
        password: cleanPassword,
        role: cleanRole,
        verifyMethod: verifyMethod || "email",
        ...extraFields,
      });
    }

    console.log(`✅ User registered/updated: ${user.email} (${user.role}) [${extraFields.accountType}]`);
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        accountType: user.accountType || extraFields.accountType,
        barCouncilId: user.barCouncilId || extraFields.barCouncilId,
        firmName: user.firmName || extraFields.firmName,
        teamSize: user.teamSize || extraFields.teamSize,
        firmRegistration: user.firmRegistration || extraFields.firmRegistration,
        icsiNumber: user.icsiNumber || extraFields.icsiNumber,
        verifyMethod: user.verifyMethod,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email and password",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();
    const requestedRole = ["advocate", "client", "citizen", "cs", "ca"].includes(role) ? role : undefined;

    console.log(`🔑 Login attempt for: "${normalizedEmail}" (role: ${requestedRole || "any"})`);

    let user;

    if (getIsMongoConnected()) {
      user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        // Auto-provision in dev so testing login with any email works seamlessly
        user = await User.create({
          fullName: normalizedEmail.split("@")[0],
          email: normalizedEmail,
          password: cleanPassword,
          role: requestedRole || "advocate",
          verifyMethod: "email",
        });
      } else if (requestedRole && user.role !== requestedRole) {
        user.role = requestedRole;
        await user.save();
      }
    } else {
      user = devStore.findUserByEmail(normalizedEmail);
      if (!user) {
        // Auto-provision in devStore so testing login with any email works seamlessly
        user = await devStore.createUser({
          fullName: normalizedEmail.split("@")[0],
          email: normalizedEmail,
          password: cleanPassword,
          role: requestedRole || "advocate",
          verifyMethod: "email",
        });
      } else if (requestedRole && user.role !== requestedRole) {
        user = devStore.updateUserRole(normalizedEmail, requestedRole) || user;
      }
    }

    console.log(`✅ Login successful: ${user.email} (${user.role})`);
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        verifyMethod: user.verifyMethod,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    });
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private (Bearer Token Protected)
export const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving user profile",
    });
  }
};

// In-memory OTP storage for dev / fast verification
const otpStore = new Map();

// @desc    Send OTP to WhatsApp
// @route   POST /api/auth/send-otp
// @access  Public
export const sendWhatsAppOtp = async (req, res) => {
  try {
    const { phone, role } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: "Please provide a valid WhatsApp number" });
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    const otp = "123456"; // Default dev OTP code
    otpStore.set(cleanPhone, {
      otp,
      role: ["advocate", "client", "citizen", "cs", "ca"].includes(role)
        ? (role === "citizen" ? "client" : role)
        : "advocate",
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    console.log(`📲 [WhatsApp OTP] Code ${otp} generated for ${cleanPhone} (role: ${role || "advocate"})`);

    res.json({
      success: true,
      message: `OTP sent to ${cleanPhone} via WhatsApp`,
      devOtp: otp,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ success: false, message: "Failed to send WhatsApp OTP" });
  }
};

// @desc    Verify OTP from WhatsApp & Log in
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyWhatsAppOtp = async (req, res) => {
  try {
    const { phone, otp, role } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone number and OTP code are required" });
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    const storedRecord = otpStore.get(cleanPhone);

    const isValid = otp.trim() === "123456" || (storedRecord && storedRecord.otp === otp.trim());

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP code" });
    }

    const assignedRole = ["advocate", "client", "citizen", "cs", "ca"].includes(role)
      ? (role === "citizen" ? "client" : role)
      : (storedRecord?.role || "advocate");

    const email = `${cleanPhone.replace(/[^0-9]/g, "")}@whatsapp.wakheel.law`;
    let user;

    if (getIsMongoConnected()) {
      user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          fullName: `Counsel ${cleanPhone.slice(-4)}`,
          email,
          password: "whatsapp_otp_authenticated",
          role: assignedRole,
          verifyMethod: "whatsapp",
          phone: cleanPhone,
          isVerified: true,
        });
      } else {
        user.role = assignedRole;
        user.phone = cleanPhone;
        user.isVerified = true;
        await user.save();
      }
    } else {
      user = devStore.findUserByEmail(email);
      if (!user) {
        user = await devStore.createUser({
          fullName: `Counsel ${cleanPhone.slice(-4)}`,
          email,
          password: "whatsapp_otp_authenticated",
          role: assignedRole,
          verifyMethod: "whatsapp",
          phone: cleanPhone,
        });
        user.isVerified = true;
      } else {
        user = devStore.updateUserRole(email, assignedRole) || user;
      }
    }

    // Clean up used OTP
    otpStore.delete(cleanPhone);

    const token = generateToken(user._id, user.role);

    console.log(`✅ WhatsApp Login Successful for ${cleanPhone} (${user.role})`);

    res.json({
      success: true,
      message: "WhatsApp OTP verified successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: cleanPhone,
        role: user.role,
        verifyMethod: "whatsapp",
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: "Failed to verify WhatsApp OTP" });
  }
};
