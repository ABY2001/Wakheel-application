import mongoose from "mongoose";

const advocateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    barCouncilNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true, // e.g. K/001429/2012
    },
    experienceYears: {
      type: Number,
      default: 10,
    },
    primaryCourt: {
      type: String,
      default: "High Court of Kerala (Ernakulam)",
    },
    secondaryCourts: {
      type: [String],
      default: ["District Court, Ernakulam", "Sub Court, Ernakulam", "NCLT Kochi Bench"],
    },
    chamberAddress: {
      type: String,
      default: "Chamber #412, KHCAA Complex, Marine Drive, Kochi 682031",
    },
    specializations: {
      type: [String],
      default: ["Constitutional Writs", "Land Reforms & Property", "Commercial Arbitration"],
    },
    languages: {
      type: [String],
      default: ["English", "Malayalam"],
    },
    consultationFee: {
      type: Number,
      default: 1500,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    reviewCount: {
      type: Number,
      default: 38,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    availableToday: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
      default: "Senior advocate practicing primarily before the High Court of Kerala with specialization in civil appeals, constitutional writs, and land title disputes.",
    },
    upiId: {
      type: String,
      default: "meera.krishnan@okaxis",
    },
  },
  { timestamps: true }
);

export const AdvocateProfile = mongoose.model("AdvocateProfile", advocateProfileSchema);
