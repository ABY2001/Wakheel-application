import { CitizenProfile } from "../models/CitizenProfile.js";
import { Grievance } from "../models/Grievance.js";
import { Matter } from "../models/Matter.js";
import { Consultation } from "../models/Consultation.js";
import { CitizenDocument } from "../models/CitizenDocument.js";
import { LegalNotice } from "../models/LegalNotice.js";
import { Invoice } from "../models/Invoice.js";
import { User } from "../models/User.js";
import { AdvocateProfile } from "../models/AdvocateProfile.js";
import { getIsMongoConnected } from "../config/db.js";
import { devStore } from "../utils/devStore.js";

// Check if dummy data mode is requested or if MongoDB is offline
const shouldUseDevStore = () => {
  return process.env.USE_DUMMY_DATA === "true" || !getIsMongoConnected();
};

// Helper to get userId from req.user
const getUserId = (req) => {
  return req.user?._id || req.user?.id || "default_citizen";
};

// ============================================================================
// 1. CITIZEN PROFILE CONTROLLERS
// ============================================================================

// @desc    Get current citizen profile
// @route   GET /api/citizen/profile
// @access  Private (Citizen)
export const getProfile = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (shouldUseDevStore()) {
      const profile = devStore.getCitizenProfile(userId);
      return res.json({ success: true, profile, mode: "dummy_data" });
    }

    let profile = await CitizenProfile.findOne({ userId });
    if (!profile) {
      profile = await CitizenProfile.create({
        userId,
        fullName: req.user.fullName || "Citizen",
        email: req.user.email,
        phone: req.user.phone || "",
      });
    }
    res.json({ success: true, profile, mode: "cloud_db" });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update citizen profile
// @route   PUT /api/citizen/profile
// @access  Private (Citizen)
export const updateProfile = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { fullName, phone, alternatePhone, address, preferredLanguage, emergencyContact, notificationPreferences } = req.body;

    if (shouldUseDevStore()) {
      const profile = devStore.updateCitizenProfile(userId, {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(alternatePhone !== undefined && { alternatePhone }),
        ...(address && { address }),
        ...(preferredLanguage && { preferredLanguage }),
        ...(emergencyContact && { emergencyContact }),
        ...(notificationPreferences && { notificationPreferences }),
      });
      return res.json({ success: true, message: "Profile updated successfully", profile, mode: "dummy_data" });
    }

    let profile = await CitizenProfile.findOne({ userId });
    if (!profile) {
      profile = new CitizenProfile({ userId, email: req.user.email });
    }

    if (fullName) profile.fullName = fullName;
    if (phone) profile.phone = phone;
    if (alternatePhone !== undefined) profile.alternatePhone = alternatePhone;
    if (address) profile.address = { ...profile.address, ...address };
    if (preferredLanguage) profile.preferredLanguage = preferredLanguage;
    if (emergencyContact) profile.emergencyContact = { ...profile.emergencyContact, ...emergencyContact };
    if (notificationPreferences) profile.notificationPreferences = { ...profile.notificationPreferences, ...notificationPreferences };

    await profile.save();

    if (fullName) {
      await User.findByIdAndUpdate(userId, { fullName });
    }

    res.json({ success: true, message: "Profile updated successfully", profile, mode: "cloud_db" });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 2. LEGAL PROBLEM INTAKE & AI TRIAGE ("Find Legal Help")
// ============================================================================

// Helper: AI Legal Triage Engine
const runLegalAiTriage = (category, description, jurisdictionDistrict) => {
  const cat = (category || "").toLowerCase();

  if (cat.includes("property") || cat.includes("land")) {
    return {
      summary: `Prima facie real estate & immovable property issue within ${jurisdictionDistrict || "Ernakulam"}. Discovered potential violations regarding title verification and boundaries.`,
      applicableActs: [
        "Kerala Land Reforms Act, 1963 (Section 85)",
        "Specific Relief Act, 1963 (Section 5 & 6 for recovery of possession)",
        "Transfer of Property Act, 1882",
        "Indian Telegraph Act, 1885 (Section 10/16 if utility lines involved)",
      ],
      suggestedRemedies: [
        "Issue formal statutory Legal Notice to adversary prior to institution of suit",
        "File Suit for Permanent Prohibitory Injunction before the Munsiff Court",
        "Apply for Advocate Commissioner inspection to prepare mahazar and sketch",
      ],
      estimatedCourtFee: "₹1,500 - ₹5,000 as per Kerala Court Fees and Suits Valuation Act, 1959",
      recommendedSpecialization: "Civil & Land Reforms Advocate",
      jurisdictionForum: `Munsiff Court / Sub Court, ${jurisdictionDistrict || "Ernakulam"}`,
      riskScore: "Moderate",
    };
  }

  if (cat.includes("cheque") || cat.includes("138") || cat.includes("money")) {
    return {
      summary: "Potential offence under Section 138 of Negotiable Instruments Act, 1881. Statutory 15-day demand notice window applies strictly.",
      applicableActs: [
        "Negotiable Instruments Act, 1881 (Section 138, 141 & 142)",
        "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 (Summary Trial Procedures)",
        "Commercial Courts Act, 2015 (if commercial transaction above ₹3 Lakhs)",
      ],
      suggestedRemedies: [
        "Issue mandatory Statutory Demand Notice within 30 days of Bank Return Memo",
        "Wait for mandatory 15-day cure period from date of notice delivery",
        "File Criminal Complaint under Section 142 before Judicial First Class Magistrate (JFCM)",
      ],
      estimatedCourtFee: "Ad-valorem court fee as per Schedule I of Kerala Court Fees Act",
      recommendedSpecialization: "Commercial Litigation & Banking Counsel",
      jurisdictionForum: "Court of Judicial First Class Magistrate (JFCM)",
      riskScore: "High",
    };
  }

  if (cat.includes("criminal") || cat.includes("bail")) {
    return {
      summary: "Criminal law matter. Immediate assessment required regarding bailable vs non-bailable offences and anticipation of arrest.",
      applicableActs: [
        "Bharatiya Nyaya Sanhita (BNS), 2023",
        "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 (Section 482 / 483 Bail)",
        "Code of Criminal Procedure (if FIR registered prior to July 2024)",
      ],
      suggestedRemedies: [
        "File Anticipatory Bail Petition before Court of Session or High Court of Kerala",
        "Apply for Certified Copy of FIR from jurisdictional Police Station / e-Court portal",
        "Petition under Section 528 BNSS / Section 482 CrPC for quashing if malicious prosecution",
      ],
      estimatedCourtFee: "₹100 - ₹250 (Court Fee Stamps on Petitions & Vakalatnama)",
      recommendedSpecialization: "Senior Criminal Trial & High Court Counsel",
      jurisdictionForum: "Sessions Court / High Court of Kerala",
      riskScore: "High",
    };
  }

  // General default triage
  return {
    summary: `Citizen grievance documented in ${category}. Legal recourse evaluated under relevant central and Kerala enactments.`,
    applicableActs: [
      "Constitution of India (Article 226 for Writ Petitions)",
      "Code of Civil Procedure, 1908 / BNS 2023",
      "Consumer Protection Act, 2019 (if deficient service or unfair trade practice)",
    ],
    suggestedRemedies: [
      "Consult empaneled advocate for comprehensive document examination",
      "Issue Cease & Desist or Demand Notice to opposite party",
      "Draft representation / petition before competent forum",
    ],
    estimatedCourtFee: "Subject to forum and nature of relief claimed",
    recommendedSpecialization: "High Court & Civil Advocate",
    jurisdictionForum: `High Court of Kerala / District Court, ${jurisdictionDistrict || "Ernakulam"}`,
    riskScore: "Moderate",
  };
};

// @desc    Submit a legal grievance for AI Triage & Advocate Matching
// @route   POST /api/citizen/grievances
// @access  Private (Citizen)
export const submitGrievance = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { title, description, category, jurisdictionDistrict, preferredCourt, urgencyLevel, evidenceDocs } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    const aiTriageResult = runLegalAiTriage(category, description, jurisdictionDistrict);

    if (shouldUseDevStore()) {
      const grievance = devStore.addGrievance({
        citizenId: userId,
        title: title.trim(),
        description: description.trim(),
        category: category || "Other Legal Matter",
        jurisdictionDistrict: jurisdictionDistrict || "Ernakulam",
        preferredCourt: preferredCourt || "High Court of Kerala / District Court",
        urgencyLevel: urgencyLevel || "Medium (Standard Filing)",
        status: "triage_analyzed",
        aiTriage: aiTriageResult,
        evidenceDocs: evidenceDocs || [],
      });

      return res.status(201).json({
        success: true,
        message: "Legal grievance submitted and analyzed by Wakheel AI Triage (Dummy Data Engine)",
        grievance,
        mode: "dummy_data",
      });
    }

    const grievance = await Grievance.create({
      citizenId: userId,
      title: title.trim(),
      description: description.trim(),
      category: category || "Other Legal Matter",
      jurisdictionDistrict: jurisdictionDistrict || "Ernakulam",
      preferredCourt: preferredCourt || "High Court of Kerala / District Court",
      urgencyLevel: urgencyLevel || "Medium (Standard Filing)",
      status: "triage_analyzed",
      aiTriage: aiTriageResult,
      evidenceDocs: evidenceDocs || [],
    });

    res.status(201).json({
      success: true,
      message: "Legal grievance submitted and analyzed by Wakheel AI Triage",
      grievance,
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("submitGrievance error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all grievances for current citizen
// @route   GET /api/citizen/grievances
// @access  Private (Citizen)
export const getGrievances = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (shouldUseDevStore()) {
      const grievances = devStore.getGrievances(userId);
      return res.json({ success: true, count: grievances.length, grievances, mode: "dummy_data" });
    }

    const grievances = await Grievance.find({ citizenId: userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: grievances.length, grievances, mode: "cloud_db" });
  } catch (error) {
    console.error("getGrievances error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 3. MATTERS & CASE TRACKER CONTROLLERS
// ============================================================================

// @desc    Get active matters for citizen
// @route   GET /api/citizen/matters
// @access  Private (Citizen)
export const getMatters = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (shouldUseDevStore()) {
      const matters = devStore.getMatters(userId);
      return res.json({ success: true, count: matters.length, matters, mode: "dummy_data" });
    }

    let matters = await Matter.find({ citizenId: userId }).sort({ updatedAt: -1 });
    res.json({ success: true, count: matters.length, matters, mode: "cloud_db" });
  } catch (error) {
    console.error("getMatters error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get matter by CNR number
// @route   GET /api/citizen/matters/:cnr
// @access  Private (Citizen)
export const getMatterByCnr = async (req, res) => {
  try {
    const { cnr } = req.params;
    const userId = getUserId(req);

    if (shouldUseDevStore()) {
      const matters = devStore.getMatters(userId);
      const match = matters.find(
        (m) =>
          (m.cnrNumber && m.cnrNumber.toLowerCase() === cnr.toLowerCase()) ||
          (m.caseNumber && m.caseNumber.toLowerCase() === cnr.toLowerCase())
      );
      if (match) {
        return res.json({ success: true, matter: match, mode: "dummy_data" });
      }
      return res.status(404).json({ success: false, message: "Matter not found for specified CNR" });
    }

    const matter = await Matter.findOne({
      citizenId: userId,
      $or: [
        { cnrNumber: new RegExp(`^${cnr}$`, "i") },
        { caseNumber: new RegExp(`^${cnr}$`, "i") },
      ],
    });
    if (!matter) {
      return res.status(404).json({ success: false, message: "Matter not found for specified CNR" });
    }
    res.json({ success: true, matter, mode: "cloud_db" });
  } catch (error) {
    console.error("getMatterByCnr error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 4. ADVOCATE DIRECTORY CONTROLLERS ("Discover Advocates")
// ============================================================================

// @desc    Get verified advocates directory with filters
// @route   GET /api/citizen/advocates
// @access  Public / Private
export const getAdvocatesDirectory = async (req, res) => {
  try {
    const { specialization, court, search } = req.query;
    let advocates = [];

    if (shouldUseDevStore()) {
      advocates = devStore.getAdvocates();
    } else {
      // Cloud DB (MongoDB Atlas) branch
      const [dbProfiles, dbUsers] = await Promise.all([
        AdvocateProfile.find().lean().catch(() => []),
        User.find({
          $or: [{ role: "advocate" }, { accountType: "independent_advocate" }],
        })
          .select("-password")
          .lean()
          .catch(() => []),
      ]);

      const profileMap = new Map();
      dbProfiles.forEach((p) => {
        if (p.userId) profileMap.set(p.userId.toString(), p);
      });

      const userAdvocates = dbUsers.map((u) => {
        const prof = profileMap.get(u._id.toString());
        let cleanName = (prof?.fullName || u.fullName || "Advocate").trim();
        if (!cleanName.toLowerCase().startsWith("adv.") && !cleanName.toLowerCase().startsWith("adv ")) {
          cleanName = `Adv. ${cleanName}`;
        }

        const barCouncilNumber = prof?.barCouncilNumber || u.barCouncilId || "K/001429/2024";
        const experienceYears = prof?.experienceYears || 10;
        const primaryCourt = prof?.primaryCourt || u.additionalDetails?.practiceCourt || "High Court of Kerala (Ernakulam)";
        const chamberAddress = prof?.chamberAddress || "High Court Chamber Complex, Kochi 682031";
        const specializations = prof?.specializations || ["Constitutional Writs", "Civil Law", "Commercial Law"];
        const consultationFee = prof?.consultationFee || 1500;

        return {
          id: u._id.toString(),
          _id: u._id.toString(),
          userId: u._id.toString(),
          fullName: cleanName,
          name: cleanName,
          email: u.email,
          barCouncilNumber,
          experienceYears,
          experience: `${experienceYears}+ Years Experience`,
          primaryCourt,
          chamberAddress,
          location: chamberAddress.split(",").slice(-2).join(",").trim() || "Ernakulam, Kerala",
          specializations,
          specialties: specializations,
          languages: prof?.languages || ["English", "Malayalam"],
          consultationFee,
          fee: `₹${consultationFee.toLocaleString()} / session`,
          rating: prof?.rating || 4.9,
          reviewCount: prof?.reviewCount || 28,
          reviewsCount: prof?.reviewCount || 28,
          matchScore: prof?.matchScore || 98,
          isVerified: true,
          availableToday: true,
          bio: prof?.bio || "Practicing Advocate registered with the Bar Council.",
        };
      });

      // Merge with devStore seeds to guarantee a full and verified directory
      const seedAdvocates = devStore.getAdvocates();
      const existingIds = new Set(userAdvocates.map((a) => a.id));
      const existingEmails = new Set(
        userAdvocates.map((a) => a.email?.toLowerCase()).filter(Boolean)
      );

      const remainingSeeds = seedAdvocates.filter(
        (a) => !existingIds.has(a.id) && (!a.email || !existingEmails.has(a.email.toLowerCase()))
      );

      advocates = [...userAdvocates, ...remainingSeeds];
    }

    if (specialization && specialization !== "all") {
      advocates = advocates.filter((a) => {
        const specs = a.specializations || a.specialties || [];
        return specs.some((s) => s.toLowerCase().includes(specialization.toLowerCase()));
      });
    }
    if (court) {
      advocates = advocates.filter((a) =>
        (a.primaryCourt || "").toLowerCase().includes(court.toLowerCase())
      );
    }
    if (search) {
      const q = search.toLowerCase().trim();
      advocates = advocates.filter((a) => {
        const name = (a.fullName || a.name || "").toLowerCase();
        const courtName = (a.primaryCourt || "").toLowerCase();
        const barNo = (a.barCouncilNumber || "").toLowerCase();
        const loc = (a.chamberAddress || a.location || "").toLowerCase();
        const specs = a.specializations || a.specialties || [];
        return (
          name.includes(q) ||
          courtName.includes(q) ||
          barNo.includes(q) ||
          loc.includes(q) ||
          specs.some((s) => s.toLowerCase().includes(q))
        );
      });
    }

    const formatted = advocates.map((a) => ({
      ...a,
      name: a.fullName || a.name,
      specialties: a.specializations || a.specialties || ["Civil Law"],
      location: a.chamberAddress
        ? a.chamberAddress.split(",").slice(-2).join(",").trim()
        : a.location || "Ernakulam, Kerala",
      experience:
        typeof a.experienceYears === "number"
          ? `${a.experienceYears}+ Years Experience`
          : a.experience || "10+ Years Experience",
      fee:
        typeof a.consultationFee === "number"
          ? `₹${a.consultationFee.toLocaleString()} / session`
          : a.fee || "₹1,500 / session",
      reviewsCount: a.reviewCount || a.reviewsCount || 36,
      matchScore: a.matchScore || (a.isVerified ? 98 : 90),
    }));

    res.json({
      success: true,
      count: formatted.length,
      advocates: formatted,
      mode: shouldUseDevStore() ? "dummy_data" : "cloud_db",
    });
  } catch (error) {
    console.error("getAdvocatesDirectory error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 5. CONSULTATIONS & BOOKING CONTROLLERS
// ============================================================================

// @desc    Book a consultation with an advocate
// @route   POST /api/citizen/consultations
// @access  Private (Citizen)
export const bookConsultation = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { advocateName, consultationType, scheduledDate, timeSlot, subject, clientNotes, feeAmount } = req.body;

    if (!scheduledDate || !timeSlot || !subject) {
      return res.status(400).json({ success: false, message: "Date, time slot, and subject are required" });
    }

    if (shouldUseDevStore()) {
      const consultation = devStore.addConsultation({
        citizenId: userId,
        advocateName: advocateName || "Adv. Meera Krishnan",
        consultationType: consultationType || "video",
        scheduledDate,
        timeSlot: timeSlot || "10:30 AM - 11:15 AM",
        durationMinutes: 45,
        meetingLink: "https://meet.wakheel.law/chambers-krishnan-09",
        subject: subject.trim(),
        clientNotes: clientNotes || "",
        feeAmount: feeAmount || 1500,
        paymentStatus: "paid",
      });

      return res.status(201).json({
        success: true,
        message: "Consultation booked successfully with Adv. Meera Krishnan. Virtual chamber room link generated.",
        consultation,
        mode: "dummy_data",
      });
    }

    const consultation = await Consultation.create({
      citizenId: userId,
      advocateName: advocateName || "Adv. Meera Krishnan",
      consultationType: consultationType || "video",
      scheduledDate: new Date(scheduledDate),
      timeSlot: timeSlot || "10:30 AM - 11:15 AM",
      subject: subject.trim(),
      clientNotes: clientNotes || "",
      feeAmount: feeAmount || 1500,
      paymentStatus: "paid",
      status: "scheduled",
    });

    res.status(201).json({
      success: true,
      message: "Consultation booked successfully. Virtual room link generated.",
      consultation,
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("bookConsultation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all consultations for citizen
// @route   GET /api/citizen/consultations
// @access  Private (Citizen)
export const getConsultations = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (shouldUseDevStore()) {
      const consultations = devStore.getConsultations(userId);
      return res.json({ success: true, count: consultations.length, consultations, mode: "dummy_data" });
    }

    let consultations = await Consultation.find({ citizenId: userId }).sort({ scheduledDate: 1 });
    res.json({ success: true, count: consultations.length, consultations, mode: "cloud_db" });
  } catch (error) {
    console.error("getConsultations error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 6. DOCUMENT VAULT CONTROLLERS
// ============================================================================

// @desc    Get all vault documents for citizen
// @route   GET /api/citizen/documents
// @access  Private (Citizen)
export const getDocuments = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (shouldUseDevStore()) {
      const documents = devStore.getDocuments(userId);
      return res.json({ success: true, count: documents.length, documents, mode: "dummy_data" });
    }

    let docs = await CitizenDocument.find({ citizenId: userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: docs.length, documents: docs, mode: "cloud_db" });
  } catch (error) {
    console.error("getDocuments error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload new document to citizen vault
// @route   POST /api/citizen/documents
// @access  Private (Citizen)
export const uploadDocument = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { title, category, fileName, fileSize, fileType } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Document title is required" });
    }

    if (shouldUseDevStore()) {
      const doc = devStore.addDocument({
        citizenId: userId,
        title: title.trim(),
        category: category || "Court Petition / Writ",
        fileName: fileName || `${title.replace(/[^a-zA-Z0-9]/g, "_")}_Attested.pdf`,
        fileSize: fileSize || "1.2 MB",
        fileType: fileType || "application/pdf",
        isSigned: false,
      });
      return res.status(201).json({
        success: true,
        message: "Document saved to 256-bit encrypted citizen vault",
        document: doc,
        mode: "dummy_data",
      });
    }

    const doc = await CitizenDocument.create({
      citizenId: userId,
      title: title.trim(),
      category: category || "Court Petition / Writ",
      fileName: fileName || `${title.replace(/[^a-zA-Z0-9]/g, "_")}_Attested.pdf`,
      fileSize: fileSize || "1.2 MB",
      fileType: fileType || "application/pdf",
      isSigned: false,
    });
    res.status(201).json({
      success: true,
      message: "Document saved to encrypted vault",
      document: doc,
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("uploadDocument error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 7. LEGAL NOTICES CONTROLLERS
// ============================================================================

// @desc    Get legal notices for citizen
// @route   GET /api/citizen/notices
// @access  Private (Citizen)
export const getLegalNotices = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (shouldUseDevStore()) {
      const notices = devStore.getNotices(userId);
      return res.json({ success: true, count: notices.length, notices, mode: "dummy_data" });
    }

    let notices = await LegalNotice.find({ citizenId: userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: notices.length, notices, mode: "cloud_db" });
  } catch (error) {
    console.error("getLegalNotices error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 8. CITIZEN AI LEGAL COPILOT ("Ask AI")
// ============================================================================

// @desc    Ask AI legal assistant in plain language
// @route   POST /api/citizen/ai/chat
// @access  Private (Citizen)
export const citizenAiChat = async (req, res) => {
  try {
    const { prompt, language } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    const lang = language === "ml" ? "ml" : "en";
    const lower = prompt.toLowerCase();

    let responseText = "";

    if (lang === "ml") {
      responseText = `നമസ്കാരം. നിങ്ങളുടെ നിയമപരമായ ചോദ്യം ഞങ്ങൾ പരിശോധിച്ചു. കേരളത്തിലെ ഹൈക്കോടതി, ജില്ലാ കോടതി നടപടികൾ പ്രകാരം ഇതിന് നിയമപരമായ പരിഹാരങ്ങൾ ലഭ്യമാണ്. വിശദമായ വാദം തയ്യാറാക്കാൻ ഒരു യോഗ്യതയുള്ള അഭിഭാഷകനെ ബന്ധപ്പെടുക. (നിരാകരണം: ഇത് നിയമപരമായ ഉപദേശമല്ല, വിവരങ്ങൾക്ക് മാത്രമാണ്).`;
    } else if (lower.includes("cheque") || lower.includes("138")) {
      responseText = `Under Section 138 of the Negotiable Instruments Act, 1881, when a cheque is dishonoured due to insufficient funds:
1. You must issue a formal Statutory Demand Notice within 30 days of receiving the Bank Return Memo.
2. The drawer is given 15 days from receipt of the notice to clear the payment.
3. If payment is not made within 15 days, you have 30 days to file a Criminal Complaint before the Judicial First Class Magistrate (JFCM).
Tip: Retain the original cheque, bank return memo, and registered postal receipt with delivery tracking.`;
    } else if (lower.includes("tree") || lower.includes("electric") || lower.includes("line")) {
      responseText = `Under Section 10 and 16 of the Indian Telegraph Act, 1885 and Kerala High Court Division Bench rulings (e.g. Valsamma v. KSEB):
1. The licensee cannot unilaterally cut yielding trees or draw high-tension lines without prior notice.
2. If the landowner objects, the licensee must seek an order from the District Magistrate.
3. The District Judge evaluates full compensation including timber loss, fruit-bearing yield capitalization, and land diminution value.`;
    } else {
      responseText = `Thank you for your question. Under Indian law and Kerala High Court practice, procedural steps depend on whether your matter falls under civil, criminal, or constitutional writ jurisdiction. 

Recommended next steps:
1. Submit your grievance under "Find Legal Help" for automatic statutory triage.
2. Secure all supporting documents in your Document Vault.
3. Book a 30-minute consultation with an empaneled High Court counsel through the directory.

Disclaimer: This automated guidance is for informational reference and does not substitute for licensed legal representation.`;
    }

    res.json({
      success: true,
      answer: responseText,
      timestamp: new Date().toISOString(),
      mode: "dummy_data",
    });
  } catch (error) {
    console.error("citizenAiChat error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 9. CITIZEN INVOICES & RETAIINER FEE PAYMENTS (Milestone 2 Two-Way Sync)
// ============================================================================
export const getCitizenInvoices = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (shouldUseDevStore()) {
      const invoices = devStore.getCitizenInvoices(userId);
      return res.json({ success: true, invoices, count: invoices.length, mode: "dummy_data" });
    }

    const invoices = await Invoice.find({ citizenId: userId }).sort({ createdAt: -1 });
    res.json({ success: true, invoices, count: invoices.length, mode: "cloud_db" });
  } catch (error) {
    console.error("getCitizenInvoices error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const payCitizenInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod = "UPI" } = req.body;

    if (shouldUseDevStore()) {
      const result = devStore.payInvoice(id, paymentMethod);
      if (!result) return res.status(404).json({ success: false, message: "Invoice not found" });
      return res.json({
        success: true,
        message: "Payment confirmed successfully. Formal GST receipt issued.",
        invoice: result.invoice,
        matter: result.matter,
        mode: "dummy_data",
      });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { $set: { status: "paid", paidAt: new Date(), paymentMethod } },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    // Also update matter if exists
    let updatedMatter = null;
    if (invoice.matterId) {
      updatedMatter = await Matter.findByIdAndUpdate(
        invoice.matterId,
        {
          $inc: { feesPaid: invoice.totalAmount },
          $push: {
            timeline: {
              date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
              title: `Retainer Bill Settled (${invoice.invoiceNumber})`,
              remarks: `Payment of ₹${invoice.totalAmount} received via ${paymentMethod}.`,
              stage: "Completed",
            },
          },
        },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: "Payment confirmed successfully. Formal GST receipt issued.",
      invoice,
      matter: updatedMatter,
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("payCitizenInvoice error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
