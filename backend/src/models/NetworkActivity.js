import mongoose from "mongoose";

const networkActivitySchema = new mongoose.Schema(
  {
    activityId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["connected", "transitioned", "brief", "meeting", "stay", "filing", "notice", "consultation", "vakalatnama"],
      default: "connected",
    },
    advocateName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      default: "Just now",
    },
  },
  {
    timestamps: true,
  }
);

export const NetworkActivity = mongoose.model("NetworkActivity", networkActivitySchema);
