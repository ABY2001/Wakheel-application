import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getBoardMeetings,
  createBoardMeeting,
  updateBoardMeeting,
  deleteBoardMeeting,
  getBoardResolutions,
  createBoardResolution,
  updateBoardResolution,
  deleteBoardResolution,
  generateCtcResolution,
} from "../controllers/csController.js";

const router = express.Router();

// Board & General Meetings (SS-1 & SS-2)
router.route("/meetings").get(protect, getBoardMeetings).post(protect, createBoardMeeting);
router.route("/meetings/:id").put(protect, updateBoardMeeting).delete(protect, deleteBoardMeeting);

// Statutory Resolutions & Certified True Copy (CTC)
router.route("/resolutions").get(protect, getBoardResolutions).post(protect, createBoardResolution);
router.route("/resolutions/:id").put(protect, updateBoardResolution).delete(protect, deleteBoardResolution);
router.route("/resolutions/:id/ctc").post(protect, generateCtcResolution);

export default router;
