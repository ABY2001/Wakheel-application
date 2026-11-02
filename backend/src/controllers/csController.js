import { BoardMeeting } from "../models/BoardMeeting.js";
import { BoardResolution } from "../models/BoardResolution.js";
import { CorporateEntity } from "../models/CorporateEntity.js";
import { RocFiling } from "../models/RocFiling.js";
import { StatutoryRegister } from "../models/StatutoryRegister.js";
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

// ============================================================================
// 3. CORPORATE ENTITIES CONTROLLERS
// ============================================================================

export const getCorporateEntities = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (shouldUseDevStore()) {
      const entities = devStore.getCorporateEntities(userId);
      return res.json({ success: true, entities, mode: "dummy_data" });
    }

    const entities = await CorporateEntity.find({
      $or: [{ userId }, { userId: "cs_1" }, { userId: "default_firm" }],
    }).sort({ companyName: 1 });

    res.json({
      success: true,
      entities: entities.map((e) => ({ ...e.toObject(), id: e.entityId || e._id.toString() })),
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getCorporateEntities error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCorporateEntity = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (shouldUseDevStore()) {
      const entity = devStore.createCorporateEntity(userId, req.body);
      return res.status(201).json({ success: true, entity });
    }

    const entity = await CorporateEntity.create({
      ...req.body,
      entityId: req.body.id || `ent-${Date.now()}`,
      userId,
    });

    res.status(201).json({
      success: true,
      entity: { ...entity.toObject(), id: entity.entityId || entity._id.toString() },
    });
  } catch (error) {
    console.error("createCorporateEntity error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCorporateEntity = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      const entity = devStore.updateCorporateEntity(req.params.id, req.body);
      if (!entity) return res.status(404).json({ success: false, message: "Entity not found" });
      return res.json({ success: true, entity });
    }

    const entity = await CorporateEntity.findOneAndUpdate(
      { $or: [{ entityId: req.params.id }, { _id: req.params.id }] },
      { $set: req.body },
      { new: true }
    );
    if (!entity) return res.status(404).json({ success: false, message: "Entity not found" });

    res.json({
      success: true,
      entity: { ...entity.toObject(), id: entity.entityId || entity._id.toString() },
    });
  } catch (error) {
    console.error("updateCorporateEntity error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCorporateEntity = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      devStore.deleteCorporateEntity(req.params.id);
      return res.json({ success: true, message: "Entity deleted successfully" });
    }

    await CorporateEntity.findOneAndDelete({
      $or: [{ entityId: req.params.id }, { _id: req.params.id }],
    });
    res.json({ success: true, message: "Entity deleted successfully" });
  } catch (error) {
    console.error("deleteCorporateEntity error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 4. MCA21 & ROC STATUTORY FILINGS CONTROLLERS
// ============================================================================

export const getRocFilings = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { companyName, status, formName } = req.query;

    if (shouldUseDevStore()) {
      const filings = devStore.getRocFilings(userId, { companyName, status, formName });
      return res.json({ success: true, filings, mode: "dummy_data" });
    }

    const query = {
      $or: [{ userId }, { userId: "cs_1" }, { userId: "default_firm" }],
    };
    if (companyName) query.companyName = companyName;
    if (status && status !== "ALL") query.status = status;
    if (formName && formName !== "ALL") query.formName = formName;

    const filings = await RocFiling.find(query).sort({ dueDate: 1 });

    res.json({
      success: true,
      filings: filings.map((f) => ({ ...f.toObject(), id: f.filingId || f._id.toString() })),
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getRocFilings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRocFiling = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (shouldUseDevStore()) {
      const filing = devStore.createRocFiling(userId, req.body);
      return res.status(201).json({ success: true, filing });
    }

    const filing = await RocFiling.create({
      ...req.body,
      filingId: req.body.id || `roc-${Date.now()}`,
      userId,
    });

    res.status(201).json({
      success: true,
      filing: { ...filing.toObject(), id: filing.filingId || filing._id.toString() },
    });
  } catch (error) {
    console.error("createRocFiling error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRocFiling = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      const filing = devStore.updateRocFiling(req.params.id, req.body);
      if (!filing) return res.status(404).json({ success: false, message: "Filing not found" });
      return res.json({ success: true, filing });
    }

    const filing = await RocFiling.findOneAndUpdate(
      { $or: [{ filingId: req.params.id }, { _id: req.params.id }] },
      { $set: req.body },
      { new: true }
    );
    if (!filing) return res.status(404).json({ success: false, message: "Filing not found" });

    res.json({
      success: true,
      filing: { ...filing.toObject(), id: filing.filingId || filing._id.toString() },
    });
  } catch (error) {
    console.error("updateRocFiling error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRocFiling = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      devStore.deleteRocFiling(req.params.id);
      return res.json({ success: true, message: "Filing deleted successfully" });
    }

    await RocFiling.findOneAndDelete({
      $or: [{ filingId: req.params.id }, { _id: req.params.id }],
    });
    res.json({ success: true, message: "Filing deleted successfully" });
  } catch (error) {
    console.error("deleteRocFiling error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 5. STATUTORY REGISTERS CONTROLLERS (SEC 88, 170, 85, 186)
// ============================================================================

export const getStatutoryRegisters = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { companyName, registerType } = req.query;

    if (shouldUseDevStore()) {
      const registers = devStore.getStatutoryRegisters(userId, { companyName, registerType });
      return res.json({ success: true, registers, mode: "dummy_data" });
    }

    const query = {
      $or: [{ userId }, { userId: "cs_1" }, { userId: "default_firm" }],
    };
    if (companyName) query.companyName = companyName;
    if (registerType && registerType !== "ALL") query.registerType = registerType;

    const registers = await StatutoryRegister.find(query).sort({ entryDate: -1 });

    res.json({
      success: true,
      registers: registers.map((r) => ({ ...r.toObject(), id: r.registerEntryId || r._id.toString() })),
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getStatutoryRegisters error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRegisterEntry = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (shouldUseDevStore()) {
      const entry = devStore.createRegisterEntry(userId, req.body);
      return res.status(201).json({ success: true, entry });
    }

    const entry = await StatutoryRegister.create({
      ...req.body,
      registerEntryId: req.body.id || `reg-${Date.now()}`,
      userId,
    });

    res.status(201).json({
      success: true,
      entry: { ...entry.toObject(), id: entry.registerEntryId || entry._id.toString() },
    });
  } catch (error) {
    console.error("createRegisterEntry error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRegisterEntry = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      const entry = devStore.updateRegisterEntry(req.params.id, req.body);
      if (!entry) return res.status(404).json({ success: false, message: "Register entry not found" });
      return res.json({ success: true, entry });
    }

    const entry = await StatutoryRegister.findOneAndUpdate(
      { $or: [{ registerEntryId: req.params.id }, { _id: req.params.id }] },
      { $set: req.body },
      { new: true }
    );
    if (!entry) return res.status(404).json({ success: false, message: "Register entry not found" });

    res.json({
      success: true,
      entry: { ...entry.toObject(), id: entry.registerEntryId || entry._id.toString() },
    });
  } catch (error) {
    console.error("updateRegisterEntry error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRegisterEntry = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      devStore.deleteRegisterEntry(req.params.id);
      return res.json({ success: true, message: "Register entry deleted successfully" });
    }

    await StatutoryRegister.findOneAndDelete({
      $or: [{ registerEntryId: req.params.id }, { _id: req.params.id }],
    });
    res.json({ success: true, message: "Register entry deleted successfully" });
  } catch (error) {
    console.error("deleteRegisterEntry error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 6. SECRETARIAL AUDIT REPORT (FORM MR-3 PER SECTION 204)
// ============================================================================

export const getSecretarialAuditReport = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { companyName } = req.query;
    const report = devStore.getSecretarialAuditReport(userId, companyName || "CyberCorp Technologies Pvt Ltd");
    res.json({ success: true, report });
  } catch (error) {
    console.error("getSecretarialAuditReport error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
