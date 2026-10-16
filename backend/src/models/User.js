import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["client", "citizen", "advocate", "cs", "ca"],
      default: "citizen",
      required: true,
    },
    verifyMethod: {
      type: String,
      enum: ["email", "whatsapp"],
      default: "email",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    accountType: {
      type: String,
      enum: ["independent_advocate", "advocate", "law_firm", "cs", "ca", "client", "citizen"],
      default: "independent_advocate",
    },
    barCouncilId: {
      type: String,
      trim: true,
      default: "",
    },
    firmName: {
      type: String,
      trim: true,
      default: "",
    },
    teamSize: {
      type: String,
      default: "",
    },
    firmRegistration: {
      type: String,
      trim: true,
      default: "",
    },
    icsiNumber: {
      type: String,
      trim: true,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving to MongoDB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
