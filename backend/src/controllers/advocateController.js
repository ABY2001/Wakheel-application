import { AdvocateProfile } from "../models/AdvocateProfile.js";
import { CauseList } from "../models/CauseList.js";
import { Invoice } from "../models/Invoice.js";
import { CaseNote } from "../models/CaseNote.js";
import { Matter } from "../models/Matter.js";
import { Consultation } from "../models/Consultation.js";
import { Grievance } from "../models/Grievance.js";
import { CitizenDocument } from "../models/CitizenDocument.js";
import { getIsMongoConnected } from "../config/db.js";
import { devStore } from "../utils/devStore.js";
import { resolveECourtsLiveCnr } from "../utils/eCourtsService.js";

const shouldUseDevStore = () => {
  return process.env.USE_DUMMY_DATA === "true" || !getIsMongoConnected();
};

const getAdvocateId = (req) => {
  return req.user?._id || req.user?.id || "adv_1";
};

// ============================================================================
// 1. DASHBOARD & KPIS
// ============================================================================
export const getDashboardKpis = async (req, res) => {
  try {
    const advocateId = getAdvocateId(req);

    if (shouldUseDevStore()) {
      const matters = devStore.getAdvocateMatters(advocateId);
      const causeList = devStore.getCauseList(advocateId);
      const invoices = devStore.getInvoices(advocateId);
      const consultations = devStore.getAdvocateConsultations(advocateId);
      const notes = devStore.getCaseNotes(advocateId);
      const leads = devStore.getIncomingGrievances(advocateId);

      const todayStr = new Date().toDateString();
      const todayHearings = causeList.filter(
        (c) => new Date(c.courtDate).toDateString() === todayStr
      );

      const totalRevenue = invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

      const pendingFees = invoices
        .filter((inv) => inv.status === "unpaid" || inv.status === "partially_paid")
        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

      return res.json({
        success: true,
        kpis: {
          activeMattersCount: matters.length,
          todayHearingsCount: todayHearings.length,
          totalHearingsListed: causeList.length,
          pendingInvoicesCount: invoices.filter((i) => i.status !== "paid").length,
          pendingFeesAmount: pendingFees,
          totalRevenueCollected: totalRevenue,
          upcomingConsultationsCount: consultations.filter((c) => c.status === "scheduled").length,
          caseNotesCount: notes.length,
          incomingLeadsCount: leads.filter((l) => l.status === "pending_review").length,
          erpModulesCount: 46,
        },
        todayHearings,
        recentMatters: matters.slice(0, 5),
        recentInvoices: invoices.slice(0, 5),
        mode: "dummy_data",
      });
    }

    // Cloud DB branch
    const [mattersCount, causeList, invoices, consultations] = await Promise.all([
      Matter.countDocuments({ advocateId }),
      CauseList.find({ advocateId }).sort({ courtDate: 1 }),
      Invoice.find({ advocateId }),
      Consultation.find({ advocateId, status: "scheduled" }),
    ]);

    const totalRevenue = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const pendingFees = invoices
      .filter((inv) => inv.status !== "paid")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    res.json({
      success: true,
      kpis: {
        activeMattersCount: mattersCount,
        todayHearingsCount: causeList.length,
        pendingInvoicesCount: invoices.filter((i) => i.status !== "paid").length,
        pendingFeesAmount: pendingFees,
        totalRevenueCollected: totalRevenue,
        upcomingConsultationsCount: consultations.length,
        erpModulesCount: 46,
      },
      todayHearings: causeList.slice(0, 5),
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("getDashboardKpis error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 2. ADVOCATE PROFILE & CHAMBER SETTINGS
// ============================================================================
export const getProfile = async (req, res) => {
  try {
    const advocateId = getAdvocateId(req);

    if (shouldUseDevStore()) {
      const profile = devStore.getAdvocateProfile(advocateId);
      return res.json({ success: true, profile, mode: "dummy_data" });
    }

    let profile = await AdvocateProfile.findOne({ userId: advocateId });
    if (!profile) {
      profile = await AdvocateProfile.create({
        userId: advocateId,
        fullName: req.user.fullName || "Advocate",
        barCouncilNumber: req.user.barCouncilNumber || "K/001429/2012",
      });
    }
    res.json({ success: true, profile, mode: "cloud_db" });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const advocateId = getAdvocateId(req);

    if (shouldUseDevStore()) {
      const updated = devStore.updateAdvocateProfile(advocateId, req.body);
      return res.json({ success: true, profile: updated, mode: "dummy_data" });
    }

    const updated = await AdvocateProfile.findOneAndUpdate(
      { userId: advocateId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, profile: updated, mode: "cloud_db" });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 3. CAUSE LIST (COURT BOARD MANAGEMENT)
// ============================================================================
export const getCauseList = async (req, res) => {
  try {
    const advocateId = getAdvocateId(req);

    if (shouldUseDevStore()) {
      const causeList = devStore.getCauseList(advocateId);
      return res.json({ success: true, causeList, count: causeList.length, mode: "dummy_data" });
    }

    const causeList = await CauseList.find({ advocateId }).sort({ itemNumber: 1 });
    res.json({ success: true, causeList, count: causeList.length, mode: "cloud_db" });
  } catch (error) {
    console.error("getCauseList error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCauseListItem = async (req, res) => {
  try {
    const advocateId = getAdvocateId(req);
    const data = { ...req.body, advocateId };

    if (shouldUseDevStore()) {
      const item = devStore.addCauseListItem(data);
      return res.status(201).json({ success: true, item, mode: "dummy_data" });
    }

    const item = await CauseList.create(data);
    res.status(201).json({ success: true, item, mode: "cloud_db" });
  } catch (error) {
    console.error("addCauseListItem error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCauseListItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (shouldUseDevStore()) {
      const updated = devStore.updateCauseListItem(id, req.body);
      if (!updated) return res.status(404).json({ success: false, message: "Cause list item not found" });
      return res.json({ success: true, item: updated, mode: "dummy_data" });
    }

    const updated = await CauseList.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Cause list item not found" });
    res.json({ success: true, item: updated, mode: "cloud_db" });
  } catch (error) {
    console.error("updateCauseListItem error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 4. MATTERS & PIPELINE
// ============================================================================
export const getMatters = async (req, res) => {
  try {
    const advocateId = getAdvocateId(req);

    if (shouldUseDevStore()) {
      const matters = devStore.getAdvocateMatters(advocateId);
      return res.json({ success: true, matters, count: matters.length, mode: "dummy_data" });
    }

    const matters = await Matter.find({ advocateId }).sort({ updatedAt: -1 });
    res.json({ success: true, matters, count: matters.length, mode: "cloud_db" });
  } catch (error) {
    console.error("getMatters error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMatterDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const advocateId = getAdvocateId(req);

    if (shouldUseDevStore()) {
      const matters = devStore.getAdvocateMatters(advocateId);
      const matter = matters.find((m) => m._id === id || m.caseNumber === id || m.cnrNumber === id);
      if (!matter) return res.status(404).json({ success: false, message: "Matter not found" });
      return res.json({ success: true, matter, mode: "dummy_data" });
    }

    const matter = await Matter.findOne({
      $or: [{ _id: id }, { caseNumber: id }, { cnrNumber: id }],
    });
    if (!matter) return res.status(404).json({ success: false, message: "Matter not found" });
    res.json({ success: true, matter, mode: "cloud_db" });
  } catch (error) {
    console.error("getMatterDetails error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track matter docket by 16-digit CNR or Case Number
// @route   GET /api/advocate/matters/track/:cnr or POST /api/advocate/matters/track
// @access  Private (Advocate)
export const trackCaseByCnr = async (req, res) => {
  try {
    const advocateId = getAdvocateId(req);
    const cnr = req.params.cnr || req.body?.cnr || req.query?.cnr;
    const caseNumber = req.body?.caseNumber || req.query?.caseNumber || "";

    if (!cnr && !caseNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 16-digit CNR number or Case Type/Number.",
      });
    }

    const cleanCnr = (cnr || "").trim().toUpperCase();

    if (shouldUseDevStore()) {
      const advocateMatters = devStore.getAdvocateMatters(advocateId);
      const existing = advocateMatters.find(
        (m) =>
          (cleanCnr && m.cnrNumber && m.cnrNumber.toUpperCase().includes(cleanCnr)) ||
          (cleanCnr && m.caseNumber && m.caseNumber.toUpperCase().includes(cleanCnr)) ||
          (caseNumber && m.caseNumber && m.caseNumber.toUpperCase().includes(caseNumber.toUpperCase()))
      );

      if (existing) {
        return res.json({
          success: true,
          isLinkedToUser: true,
          source: "advocate_docket",
          matter: existing,
          canImportToDocket: false,
          message: "Matter already tracked in your chamber active dockets.",
          mode: "dummy_data",
        });
      }

      const liveCase = resolveECourtsLiveCnr(cleanCnr, caseNumber);
      return res.json({
        success: true,
        isLinkedToUser: false,
        source: "ecourts_njdg_live",
        matter: liveCase,
        canImportToDocket: true,
        message: `Live e-Courts docket found for CNR ${liveCase.cnrNumber}`,
        mode: "dummy_data",
      });
    }

    // Cloud DB lookup
    const query = { advocateId };
    const orConditions = [];
    if (cleanCnr) {
      orConditions.push({ cnrNumber: cleanCnr });
      orConditions.push({ caseNumber: cleanCnr });
    }
    if (caseNumber) {
      orConditions.push({ caseNumber });
    }
    if (orConditions.length > 0) query.$or = orConditions;

    const existing = await Matter.findOne(query);
    if (existing) {
      return res.json({
        success: true,
        isLinkedToUser: true,
        source: "advocate_docket",
        matter: existing,
        canImportToDocket: false,
        message: "Matter already tracked in your chamber active dockets.",
        mode: "cloud_db",
      });
    }

    const liveCase = resolveECourtsLiveCnr(cleanCnr, caseNumber);
    res.json({
      success: true,
      isLinkedToUser: false,
      source: "ecourts_njdg_live",
      matter: liveCase,
      canImportToDocket: true,
      message: `Live e-Courts docket found for CNR ${liveCase.cnrNumber}`,
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("advocate trackCaseByCnr error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add / Import tracked case to advocate matters
// @route   POST /api/advocate/matters
// @access  Private (Advocate)
export const createMatter = async (req, res) => {
  try {
    const advocateId = getAdvocateId(req);
    const {
      caseNumber,
      title,
      matterTitle,
      court,
      courtForum,
      cnrNumber,
      courtHall,
      statutoryActs,
      status,
      nextHearingDate,
      filingDate,
      addToCauseList,
      causeListItemNumber,
    } = req.body;

    const finalCaseNumber = caseNumber || `WP(C) ${Math.floor(10000 + Math.random() * 90000)}/2026`;
    const finalTitle = title || matterTitle || `${finalCaseNumber} Legal Matter`;
    const finalCourt = court || courtForum || "High Court of Kerala (Ernakulam Bench)";

    const matterData = {
      advocateId,
      citizenId: "default_citizen",
      caseNumber: finalCaseNumber,
      caseTitle: finalTitle,
      matterTitle: finalTitle,
      matterType: finalCaseNumber.includes("WP") ? "Writ Petition (Civil)" : "Civil Suit",
      courtForum: finalCourt,
      courtHall: courtHall || "Court Hall 2A",
      advocateName: req.user?.fullName || "Adv. Meera Krishnan",
      assignedAdvocate: req.user?.fullName || "Adv. Meera Krishnan",
      status: status || "Admitted",
      stage: "Active Proceedings",
      filingDate: filingDate || new Date().toISOString().split("T")[0],
      nextHearingDate: nextHearingDate || new Date(Date.now() + 14 * 86400000).toISOString(),
      cnrNumber: cnrNumber || `KLHC01${String(Math.floor(100000 + Math.random() * 900000))}2026`,
      statutoryActs: statutoryActs || ["Article 226 of the Constitution of India"],
      timeline: [
        {
          date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          title: "Docket Imported into Advocate Chamber Tracker",
          remarks: `CNR ${cnrNumber || finalCaseNumber} successfully synced with e-Courts NJDG repository.`,
          stage: "Completed",
        },
      ],
      orders: [],
    };

    if (shouldUseDevStore()) {
      const created = devStore.addMatter(matterData);

      // If requested, also add to Cause List for daily hearing board
      if (addToCauseList) {
        devStore.addCauseListItem({
          advocateId,
          itemNumber: causeListItemNumber || 14,
          caseNumber: finalCaseNumber,
          courtHall: courtHall || "Court Hall 2A",
          bench: "Division Bench",
          parties: finalTitle,
          stage: "Interim Relief / Final Arguments",
          status: "upcoming",
          date: new Date().toISOString().split("T")[0],
        });
      }

      return res.status(201).json({
        success: true,
        message: "Matter docket created and linked to Advocate Case Tracker",
        matter: created,
        mode: "dummy_data",
      });
    }

    const created = await Matter.create(matterData);

    if (addToCauseList) {
      await CauseList.create({
        advocateId,
        itemNumber: causeListItemNumber || 14,
        caseNumber: finalCaseNumber,
        courtHall: courtHall || "Court Hall 2A",
        bench: "Division Bench",
        parties: finalTitle,
        stage: "Interim Relief / Final Arguments",
        status: "upcoming",
        date: new Date().toISOString().split("T")[0],
      });
    }

    res.status(201).json({
      success: true,
      message: "Matter docket created and linked to Advocate Case Tracker",
      matter: created,
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("advocate createMatter error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 5. INVOICES & BILLING
// ============================================================================
export const getInvoices = async (req, res) => {
  try {
    const advocateId = getAdvocateId(req);

    if (shouldUseDevStore()) {
      const invoices = devStore.getInvoices(advocateId);
      return res.json({ success: true, invoices, count: invoices.length, mode: "dummy_data" });
    }

    const invoices = await Invoice.find({ advocateId }).sort({ createdAt: -1 });
    res.json({ success: true, invoices, count: invoices.length, mode: "cloud_db" });
  } catch (error) {
    console.error("getInvoices error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const advocateId = getAdvocateId(req);
    const data = { ...req.body, advocateId, advocateName: req.user?.fullName || "Adv. Meera Krishnan" };

    if (shouldUseDevStore()) {
      const invoice = devStore.createInvoice(data);
      return res.status(201).json({ success: true, invoice, mode: "dummy_data" });
    }

    const subtotal = data.items ? data.items.reduce((s, i) => s + (Number(i.amount) || 0), 0) : Number(data.subtotal) || 0;
    const gstRate = data.gstRate !== undefined ? Number(data.gstRate) : 18;
    const gstAmount = Math.round((subtotal * gstRate) / 100);
    const totalAmount = subtotal + gstAmount;

    const invoice = await Invoice.create({
      ...data,
      subtotal,
      gstRate,
      gstAmount,
      totalAmount,
    });
    res.status(201).json({ success: true, invoice, mode: "cloud_db" });
  } catch (error) {
    console.error("createInvoice error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentMethod } = req.body;

    if (shouldUseDevStore()) {
      const updated = devStore.updateInvoice(id, {
        status,
        ...(paymentMethod && { paymentMethod }),
        ...(status === "paid" && { paidAt: new Date().toISOString() }),
      });
      if (!updated) return res.status(404).json({ success: false, message: "Invoice not found" });
      return res.json({ success: true, invoice: updated, mode: "dummy_data" });
    }

    const updated = await Invoice.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          ...(paymentMethod && { paymentMethod }),
          ...(status === "paid" && { paidAt: new Date() }),
        },
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Invoice not found" });
    res.json({ success: true, invoice: updated, mode: "cloud_db" });
  } catch (error) {
    console.error("updateInvoiceStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 6. CASE NOTES & CHAMBER MEMOS
// ============================================================================
export const getCaseNotes = async (req, res) => {
  try {
    const advocateId = getAdvocateId(req);
    const { matterId } = req.query;

    if (shouldUseDevStore()) {
      const notes = devStore.getCaseNotes(advocateId, matterId);
      return res.json({ success: true, notes, count: notes.length, mode: "dummy_data" });
    }

    const query = { advocateId };
    if (matterId) query.matterId = matterId;
    const notes = await CaseNote.find(query).sort({ createdAt: -1 });
    res.json({ success: true, notes, count: notes.length, mode: "cloud_db" });
  } catch (error) {
    console.error("getCaseNotes error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCaseNote = async (req, res) => {
  try {
    const advocateId = getAdvocateId(req);
    const data = { ...req.body, advocateId };

    if (shouldUseDevStore()) {
      const note = devStore.addCaseNote(data);
      return res.status(201).json({ success: true, note, mode: "dummy_data" });
    }

    const note = await CaseNote.create(data);
    res.status(201).json({ success: true, note, mode: "cloud_db" });
  } catch (error) {
    console.error("createCaseNote error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCaseNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (shouldUseDevStore()) {
      const result = devStore.deleteCaseNote(id);
      return res.json({ success: true, ...result, mode: "dummy_data" });
    }

    const note = await CaseNote.findByIdAndDelete(id);
    if (!note) return res.status(404).json({ success: false, message: "Case note not found" });
    res.json({ success: true, message: "Case note deleted", deletedId: id, mode: "cloud_db" });
  } catch (error) {
    console.error("deleteCaseNote error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 7. CONSULTATIONS & CHAMBER BOOKINGS
// ============================================================================
export const getConsultations = async (req, res) => {
  try {
    const advocateId = getAdvocateId(req);

    if (shouldUseDevStore()) {
      const consultations = devStore.getAdvocateConsultations(advocateId);
      return res.json({ success: true, consultations, count: consultations.length, mode: "dummy_data" });
    }

    const consultations = await Consultation.find({ advocateId }).sort({ scheduledDate: 1 });
    res.json({ success: true, consultations, count: consultations.length, mode: "cloud_db" });
  } catch (error) {
    console.error("getConsultations error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateConsultation = async (req, res) => {
  try {
    const { id } = req.params;

    if (shouldUseDevStore()) {
      const updated = devStore.updateConsultationStatus(id, req.body);
      if (!updated) return res.status(404).json({ success: false, message: "Consultation not found" });
      return res.json({ success: true, consultation: updated, mode: "dummy_data" });
    }

    const updated = await Consultation.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Consultation not found" });
    res.json({ success: true, consultation: updated, mode: "cloud_db" });
  } catch (error) {
    console.error("updateConsultation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 8. INCOMING LEADS & GRIEVANCE INTAKE
// ============================================================================
export const getIncomingLeads = async (req, res) => {
  try {
    const advocateId = getAdvocateId(req);

    if (shouldUseDevStore()) {
      const grievances = devStore.getIncomingGrievances(advocateId);
      return res.json({ success: true, leads: grievances, count: grievances.length, mode: "dummy_data" });
    }

    const grievances = await Grievance.find({}).sort({ createdAt: -1 });
    res.json({ success: true, leads: grievances, count: grievances.length, mode: "cloud_db" });
  } catch (error) {
    console.error("getIncomingLeads error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptLead = async (req, res) => {
  try {
    const { id } = req.params;
    const advocateId = getAdvocateId(req);

    if (shouldUseDevStore()) {
      const lead = devStore.acceptGrievance(id, advocateId);
      if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
      return res.json({ success: true, message: "Lead accepted and matter initialized", lead, mode: "dummy_data" });
    }

    const lead = await Grievance.findByIdAndUpdate(
      id,
      { $set: { status: "matter_opened", assignedAdvocateId: advocateId } },
      { new: true }
    );
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, message: "Lead accepted and matter initialized", lead, mode: "cloud_db" });
  } catch (error) {
    console.error("acceptLead error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 9. MATTER TIMELINE PROCEEDINGS & COURT ORDER SHARING (Milestone 2 Sync)
// ============================================================================
export const addMatterTimelineEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, remarks, stage, date, nextHearingDate } = req.body;

    if (shouldUseDevStore()) {
      const result = devStore.addMatterTimelineEvent(id, { title, remarks, stage, date, nextHearingDate });
      if (!result) return res.status(404).json({ success: false, message: "Matter not found" });
      return res.json({
        success: true,
        message: "Court timeline updated successfully; synced to citizen portal.",
        matter: result.matter,
        event: result.event,
        mode: "dummy_data",
      });
    }

    const updated = await Matter.findByIdAndUpdate(
      id,
      {
        $push: {
          timeline: {
            date: date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            title: title || "Court Proceedings Update",
            remarks: remarks || "",
            stage: stage || "Completed",
          },
        },
        ...(nextHearingDate && { nextHearingDate }),
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Matter not found" });
    res.json({
      success: true,
      message: "Court timeline updated successfully; synced to citizen portal.",
      matter: updated,
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("addMatterTimelineEvent error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const shareCourtDocument = async (req, res) => {
  try {
    const advocateId = getAdvocateId(req);
    const data = {
      ...req.body,
      uploadedBy: req.user?.fullName || "Adv. Meera Krishnan",
      advocateId,
    };

    if (shouldUseDevStore()) {
      const doc = devStore.shareCourtDocument(data);
      return res.status(201).json({
        success: true,
        message: "Court document shared and synced to client vault.",
        document: doc,
        mode: "dummy_data",
      });
    }

    const doc = await CitizenDocument.create({
      citizenId: data.citizenId || "default_citizen",
      title: data.title || "Certified Court Order",
      category: data.category || "Certified Court Order",
      fileName: data.fileName || "Court_Order.pdf",
      fileSize: data.fileSize || "1.5 MB",
      isSigned: true,
      signedAt: new Date(),
    });
    res.status(201).json({
      success: true,
      message: "Court document shared and synced to client vault.",
      document: doc,
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("shareCourtDocument error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
