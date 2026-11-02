import { BoardMeeting } from "../models/BoardMeeting.js";
import { BoardResolution } from "../models/BoardResolution.js";
import { getIsMongoConnected } from "../config/db.js";
import { devStore } from "../utils/devStore.js";

const shouldUseDevStore = () => {
  return process.env.USE_DUMMY_DATA === "true" || !getIsMongoConnected();
};

const getUserId = (req) => {
  return req.user?._id || req.user?.id || "cs_1";
};

// ============================================================================
// 1. BOARD MEETINGS CONTROLLERS (SS-1 COMPLIANT)
// ============================================================================

export const getBoardMeetings = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (shouldUseDevStore()) {
      const meetings = devStore.getBoardMeetings(userId);
      return res.json({ success: true, meetings, mode: "dummy_data" });
    }

    const meetings = await BoardMeeting.find({
      $or: [{ userId }, { userId: "cs_1" }, { userId: "default_firm" }],
    }).sort({ date: -1 });

    res.json({
      success: true,
      meetings: meetings.map((m) => ({ ...m.toObject(), id: m.meetingId || m._id.toString() })),
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getBoardMeetings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBoardMeeting = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (shouldUseDevStore()) {
      const meeting = devStore.createBoardMeeting(userId, req.body);
      return res.status(201).json({ success: true, meeting });
    }

    const meeting = await BoardMeeting.create({
      ...req.body,
      meetingId: req.body.id || `bm-${Date.now()}`,
      userId,
    });

    res.status(201).json({
      success: true,
      meeting: { ...meeting.toObject(), id: meeting.meetingId || meeting._id.toString() },
    });
  } catch (error) {
    console.error("createBoardMeeting error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBoardMeeting = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      const meeting = devStore.updateBoardMeeting(req.params.id, req.body);
      if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });
      return res.json({ success: true, meeting });
    }

    const meeting = await BoardMeeting.findOneAndUpdate(
      { $or: [{ meetingId: req.params.id }, { _id: req.params.id }] },
      { $set: req.body },
      { new: true }
    );
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

    res.json({
      success: true,
      meeting: { ...meeting.toObject(), id: meeting.meetingId || meeting._id.toString() },
    });
  } catch (error) {
    console.error("updateBoardMeeting error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBoardMeeting = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      devStore.deleteBoardMeeting(req.params.id);
      return res.json({ success: true, message: "Meeting deleted" });
    }

    await BoardMeeting.deleteOne({
      $or: [{ meetingId: req.params.id }, { _id: req.params.id }],
    });
    res.json({ success: true, message: "Meeting deleted" });
  } catch (error) {
    console.error("deleteBoardMeeting error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 2. BOARD RESOLUTIONS CONTROLLERS & CTC GENERATION
// ============================================================================

export const getBoardResolutions = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (shouldUseDevStore()) {
      const resolutions = devStore.getBoardResolutions(userId);
      return res.json({ success: true, resolutions, mode: "dummy_data" });
    }

    const resolutions = await BoardResolution.find({
      $or: [{ userId }, { userId: "cs_1" }, { userId: "default_firm" }],
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      resolutions: resolutions.map((r) => ({ ...r.toObject(), id: r.resolutionId || r._id.toString() })),
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getBoardResolutions error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBoardResolution = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (shouldUseDevStore()) {
      const resolution = devStore.createBoardResolution(userId, req.body);
      return res.status(201).json({ success: true, resolution });
    }

    const resolution = await BoardResolution.create({
      ...req.body,
      resolutionId: req.body.id || `res-${Date.now()}`,
      userId,
    });

    res.status(201).json({
      success: true,
      resolution: { ...resolution.toObject(), id: resolution.resolutionId || resolution._id.toString() },
    });
  } catch (error) {
    console.error("createBoardResolution error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBoardResolution = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      const resolution = devStore.updateBoardResolution(req.params.id, req.body);
      if (!resolution) return res.status(404).json({ success: false, message: "Resolution not found" });
      return res.json({ success: true, resolution });
    }

    const resolution = await BoardResolution.findOneAndUpdate(
      { $or: [{ resolutionId: req.params.id }, { _id: req.params.id }] },
      { $set: req.body },
      { new: true }
    );
    if (!resolution) return res.status(404).json({ success: false, message: "Resolution not found" });

    res.json({
      success: true,
      resolution: { ...resolution.toObject(), id: resolution.resolutionId || resolution._id.toString() },
    });
  } catch (error) {
    console.error("updateBoardResolution error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBoardResolution = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      devStore.deleteBoardResolution(req.params.id);
      return res.json({ success: true, message: "Resolution deleted" });
    }

    await BoardResolution.deleteOne({
      $or: [{ resolutionId: req.params.id }, { _id: req.params.id }],
    });
    res.json({ success: true, message: "Resolution deleted" });
  } catch (error) {
    console.error("deleteBoardResolution error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateCtcResolution = async (req, res) => {
  try {
    const { certifiedBy } = req.body;
    if (shouldUseDevStore()) {
      const resolution = devStore.generateCtcResolution(req.params.id, certifiedBy);
      if (!resolution) return res.status(404).json({ success: false, message: "Resolution not found" });
      return res.json({ success: true, message: "Certified True Copy (CTC) generated successfully", resolution });
    }

    const resolution = await BoardResolution.findOneAndUpdate(
      { $or: [{ resolutionId: req.params.id }, { _id: req.params.id }] },
      {
        $set: {
          isCtcGenerated: true,
          ctcCertifiedBy: certifiedBy || "CS Rajesh Sharma (FCS 8492, CP 10294)",
          ctcCertifiedAt: new Date().toISOString().split("T")[0],
        },
      },
      { new: true }
    );
    if (!resolution) return res.status(404).json({ success: false, message: "Resolution not found" });

    res.json({
      success: true,
      message: "Certified True Copy (CTC) generated successfully",
      resolution: { ...resolution.toObject(), id: resolution.resolutionId || resolution._id.toString() },
    });
  } catch (error) {
    console.error("generateCtcResolution error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
