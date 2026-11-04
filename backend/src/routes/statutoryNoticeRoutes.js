import express from "express";
import {
  getStatutoryNotices,
  getStatutoryNoticeById,
  createStatutoryNotice,
  updateNoticeStatus,
  generateNoticeReply,
  attachEvidenceDocument,
  signNoticeReplyWithDsc,
  scheduleVirtualHearing,
  deleteStatutoryNotice,
} from "../controllers/statutoryNoticeController.js";

const router = express.Router();

router.get("/", getStatutoryNotices);
router.get("/:id", getStatutoryNoticeById);
router.post("/", createStatutoryNotice);
router.patch("/:id/status", updateNoticeStatus);
router.post("/:id/generate-reply", generateNoticeReply);
router.post("/:id/annexures", attachEvidenceDocument);
router.post("/:id/sign-dsc", signNoticeReplyWithDsc);
router.post("/:id/schedule-hearing", scheduleVirtualHearing);
router.delete("/:id", deleteStatutoryNotice);

export default router;
