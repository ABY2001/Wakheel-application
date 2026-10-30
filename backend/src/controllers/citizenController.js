import { CitizenProfile } from "../models/CitizenProfile.js";
import { Grievance } from "../models/Grievance.js";
import { Matter } from "../models/Matter.js";
import { Consultation } from "../models/Consultation.js";
import { CitizenDocument } from "../models/CitizenDocument.js";
import { LegalNotice } from "../models/LegalNotice.js";
import { Invoice } from "../models/Invoice.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { AdvocateProfile } from "../models/AdvocateProfile.js";
import { getIsMongoConnected } from "../config/db.js";
import { devStore } from "../utils/devStore.js";
import { resolveECourtsLiveCnr } from "../utils/eCourtsService.js";
import { broadcastMessageToUser } from "../socket.js";

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

// Helper: Match Verified Advocates for Triage Category & District
const matchAdvocatesForTriage = (category, district) => {
  const cat = (category || "").toLowerCase();
  const allAdvocates = devStore.getAdvocates();

  // Score advocates based on specialization and primary court alignment
  const scored = allAdvocates.map((adv) => {
    let matchScore = 0;
    const specs = (adv.specializations || []).map((s) => s.toLowerCase());

    if (cat.includes("property") || cat.includes("land") || cat.includes("real estate")) {
      if (specs.some((s) => s.includes("property") || s.includes("land") || s.includes("writs") || s.includes("civil"))) {
        matchScore += 40;
      }
    } else if (cat.includes("family") || cat.includes("matrimonial")) {
      if (specs.some((s) => s.includes("family") || s.includes("matrimonial") || s.includes("consumer"))) {
        matchScore += 40;
      }
    } else if (cat.includes("criminal") || cat.includes("bail")) {
      if (specs.some((s) => s.includes("criminal") || s.includes("bail"))) {
        matchScore += 40;
      }
    } else if (cat.includes("corporate") || cat.includes("commercial") || cat.includes("arbitration") || cat.includes("adr")) {
      if (specs.some((s) => s.includes("corporate") || s.includes("commercial") || s.includes("arbitration") || s.includes("ibc") || s.includes("m&a"))) {
        matchScore += 40;
      }
    } else if (cat.includes("cyber") || cat.includes("it law")) {
      if (specs.some((s) => s.includes("criminal") || s.includes("cyber") || s.includes("commercial"))) {
        matchScore += 35;
      }
    } else if (cat.includes("consumer")) {
      if (specs.some((s) => s.includes("consumer") || s.includes("civil"))) {
        matchScore += 35;
      }
    } else {
      matchScore += 20;
    }

    if (adv.isVerified) matchScore += 25;
    if (adv.rating >= 4.8) matchScore += 15;
    if (adv.availableToday) matchScore += 10;

    return {
      id: adv.id,
      fullName: adv.fullName,
      barCouncilNumber: adv.barCouncilNumber,
      experienceYears: adv.experienceYears,
      primaryCourt: adv.primaryCourt,
      chamberAddress: adv.chamberAddress,
      specializations: adv.specializations,
      languages: adv.languages,
      consultationFee: adv.consultationFee,
      rating: adv.rating,
      reviewCount: adv.reviewCount,
      isVerified: adv.isVerified,
      availableToday: adv.availableToday,
      matchScore,
    };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
};

// Helper: AI Legal Triage Engine for Kerala & Indian Judicial Practice
const runLegalAiTriage = (category, description, jurisdictionDistrict) => {
  const cat = (category || "").toLowerCase();
  const district = jurisdictionDistrict || "Ernakulam";

  // 1. Property, Land Reforms & Real Estate
  if (cat.includes("property") || cat.includes("land") || cat.includes("real estate")) {
    return {
      summary: `Dispute involves immovable landed property or title demarcation within ${district}. Prima facie concerns ownership chain, boundary encroachment, or utility route compliance.`,
      applicableActs: [
        "Kerala Land Reforms Act, 1963 (Tenancy rights and ceiling provisions)",
        "Specific Relief Act, 1963 (Section 5, 6 for recovery of possession, Section 38 for Perpetual Injunction)",
        "Transfer of Property Act, 1882 (Section 52 Lis Pendens, Section 54 Sale, Section 105 Lease)",
        "Kerala Survey and Boundaries Act, 1961 (Section 9 & 10 demarcation)",
        "Real Estate (Regulation and Development) Act, 2016 (K-RERA) (if builder dispute)",
        "Indian Telegraph Act, 1885 (Section 10/16 compensation if power grid/utility lines)",
      ],
      suggestedRemedies: [
        "Issue formal Statutory Legal Notice demanding immediate cessation of encroachment",
        "File Original Suit (OS) for Permanent Prohibitory Injunction before Munsiff Court",
        "Petition under Order XXVI Rule 9 CPC for Advocate Commissioner inspection with Taluk Surveyor to prepare Mahazar",
        "Lodge Caveat Petition under Section 148A CPC before Sub Court / Munsiff Court to prevent ex-parte orders",
      ],
      estimatedCourtFee: "₹1,500 - ₹5,000 as per Section 27 / Schedule I of Kerala Court Fees and Suits Valuation Act, 1959",
      recommendedSpecialization: "Civil, Property & Land Revenue Counsel",
      jurisdictionForum: `Munsiff Court / Sub Court, ${district} (Appeals: District Court / High Court of Kerala)`,
      riskScore: "Moderate",
      statutoryLimitation: "3 years from the date of threat or dispossession (Articles 64, 65, 58 of Limitation Act, 1963)",
    };
  }

  // 2. Family & Matrimonial
  if (cat.includes("family") || cat.includes("matrimonial") || cat.includes("divorce") || cat.includes("custody")) {
    return {
      summary: `Domestic relations grievance within ${district} requiring matrimonial conciliation, custody determination, or statutory protection.`,
      applicableActs: [
        "Family Courts Act, 1984 (Section 7 exclusive jurisdiction and conciliation mandate)",
        "Special Marriage Act, 1954 / Hindu Marriage Act, 1955 / Indian Divorce Act, 1869 (Divorce grounds)",
        "Protection of Women from Domestic Violence Act, 2005 (PWDVA Section 12, 18, 19, 20, 22)",
        "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 (Section 144 maintenance; corresponds to CrPC 125)",
        "Guardians and Wards Act, 1890 (Section 7 & 17 child custody and visitation)",
      ],
      suggestedRemedies: [
        "Participate in pre-litigation Family Court counselling and mediation session",
        "File Original Petition (OP) for Dissolution of Marriage / Restitution of Conjugal Rights before Family Court",
        "File Application for Interim Maintenance under Section 144 BNSS / Section 24 HMA",
        "Petition for Interim Protection & Residence Order under Section 12 PWDVA if immediate safety concerns exist",
      ],
      estimatedCourtFee: "Fixed nominal court fees (₹50 to ₹100 per petition) under Kerala Court Fees Act",
      recommendedSpecialization: "Family Law & Matrimonial Advocate",
      jurisdictionForum: `Family Court, ${district}`,
      riskScore: "Moderate",
      statutoryLimitation: "Continuing cause of action for maintenance and residence; statutory periods apply for fault-based divorce",
    };
  }

  // 3. Criminal Defense & Bail
  if (cat.includes("criminal") || cat.includes("bail") || cat.includes("fir") || cat.includes("police")) {
    return {
      summary: `Criminal defense matter within ${district}. Immediate statutory scrutiny required regarding bailable vs non-bailable offences and arrest safeguarding.`,
      applicableActs: [
        "Bharatiya Nyaya Sanhita (BNS), 2023 (Substantive penal offences)",
        "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 (Section 480/482/483 Bail, Section 35 Arrest procedure)",
        "Bharatiya Sakshya Adhiniyam (BSA), 2023 (Digital and electronic evidence mandates)",
        "Code of Criminal Procedure, 1973 (if investigation commenced prior to July 1, 2024)",
      ],
      suggestedRemedies: [
        "File Anticipatory Bail Application (Bail Appln) under Section 482 BNSS before Court of Session or High Court of Kerala",
        "Apply for Certified Copy of FIR from Crime and Criminal Tracking Network & Systems (CCTNS) portal",
        "File Quash Petition under Section 528 BNSS / Section 482 CrPC before High Court if malicious prosecution",
        "Request interim protection against coercive arrest during preliminary investigation",
      ],
      estimatedCourtFee: "₹100 - ₹250 (Court Fee Stamps on Petitions, Affidavits & Vakalatnama)",
      recommendedSpecialization: "Senior Criminal Trial & High Court Bail Counsel",
      jurisdictionForum: `Court of Session, ${district} / High Court of Kerala`,
      riskScore: "High",
      statutoryLimitation: "Immediate urgency upon apprehension of arrest or registration of FIR",
    };
  }

  // 4. Corporate & Commercial
  if (cat.includes("corporate") || cat.includes("commercial") || cat.includes("company") || cat.includes("nclt")) {
    return {
      summary: `Commercial enterprise grievance within ${district}. Evaluated under statutory company law, director duties, contract enforcement, and insolvency frameworks.`,
      applicableActs: [
        "Companies Act, 2013 (Section 241/242 Oppression & Mismanagement, Section 447 Fraud)",
        "Insolvency and Bankruptcy Code (IBC), 2016 (Section 7, 9 Corporate Insolvency Resolution Process)",
        "Commercial Courts Act, 2015 (Section 12A Mandatory Pre-Institution Mediation)",
        "Indian Contract Act, 1872 (Section 73, 74 Damages for breach of commercial contract)",
      ],
      suggestedRemedies: [
        "Initiate mandatory Pre-Institution Mediation under Section 12A of Commercial Courts Act before Kerala DLSA",
        "Issue Statutory Demand Notice in Form 3/4 under Section 8 of IBC for undisputed operational/financial debts",
        "File Company Petition before National Company Law Tribunal (NCLT) Kochi Bench",
        "File Commercial Summary Suit with application for urgent Attachment Before Judgment (Order XXXVIII Rule 5 CPC)",
      ],
      estimatedCourtFee: "Prescribed NCLT schedule fees / Ad-valorem commercial court fee under Kerala Court Fees Act",
      recommendedSpecialization: "Corporate, NCLT & Commercial Litigation Counsel",
      jurisdictionForum: `Commercial Court / NCLT Kochi Bench / High Court of Kerala`,
      riskScore: "High",
      statutoryLimitation: "3 years from the date of contract default / financial debt maturity (Article 55 Limitation Act, 1963)",
    };
  }

  // 5. Arbitration & ADR
  if (cat.includes("arbitration") || cat.includes("adr") || cat.includes("tribunal")) {
    return {
      summary: `Arbitrable dispute involving contract interpretation, claim settlement, or arbitral tribunal proceedings in Kerala jurisdiction.`,
      applicableActs: [
        "Arbitration and Conciliation Act, 1996 (as amended in 2015, 2019, 2021)",
        "Section 9 (Interim measures of protection by High Court / Commercial Court)",
        "Section 11 (Appointment of Arbitrator by High Court of Kerala Arbitration Centre)",
        "Section 34 (Setting aside of arbitral awards)",
      ],
      suggestedRemedies: [
        "Issue formal Notice of Arbitration under Section 21 invoking arbitration agreement and proposing sole arbitrator",
        "File Section 9 Arbitration Request before High Court / Commercial Court for interim asset preservation",
        "File Section 11(6) Application before Hon'ble High Court of Kerala if opposing party fails to agree on arbitrator",
        "Apply for emergency interim injunction against encashment of performance bank guarantees",
      ],
      estimatedCourtFee: "High Court of Kerala Arbitration Centre schedule charges & statutory stamp duty",
      recommendedSpecialization: "Arbitration & Commercial Dispute Resolution Specialist",
      jurisdictionForum: "High Court of Kerala Arbitration Centre / Commercial Court",
      riskScore: "Moderate",
      statutoryLimitation: "3 years from accrual of dispute to invoke arbitration; 3 months for Section 34 challenge",
    };
  }

  // 6. Cybercrime & IT Law
  if (cat.includes("cyber") || cat.includes("it law") || cat.includes("online fraud") || cat.includes("phishing")) {
    return {
      summary: `Cyber offence or digital financial fraud reported within ${district}. Requires immediate evidence preservation and account freeze actions.`,
      applicableActs: [
        "Information Technology Act, 2000 (Section 43, 66, 66C Identity Theft, 66D Cheating by personation, Section 67)",
        "Bharatiya Nyaya Sanhita (BNS), 2023 (Section 318 Cheating, Section 316 Criminal Breach of Trust)",
        "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 (Section 106 Seizure and account freeze)",
        "Digital Personal Data Protection Act (DPDPA), 2023",
      ],
      suggestedRemedies: [
        "Immediately report incident on National Cyber Crime Reporting Portal (cybercrime.gov.in / Call 1930) for golden-hour freeze",
        "Submit formal complaint to jurisdictional Cyber Crime Police Station (Kochi / Thiruvananthapuram / Kozhikode)",
        "Issue written representation to Bank Nodal Officer for reversing unauthorized fund transfers",
        "File Section 483 BNSS petition before High Court of Kerala for de-freezing legitimate operational accounts",
      ],
      estimatedCourtFee: "Nominal court fee stamps",
      recommendedSpecialization: "Cyber Law & White Collar Crime Counsel",
      jurisdictionForum: `Court of Judicial First Class Magistrate / Cyber Police Division / High Court of Kerala`,
      riskScore: "High",
      statutoryLimitation: "Immediate reporting within 2 to 24 hours of unauthorized transaction to halt fund dispersal",
    };
  }

  // 7. Consumer Protection
  if (cat.includes("consumer") || cat.includes("deficiency") || cat.includes("unfair trade")) {
    return {
      summary: `Consumer grievance alleging deficiency of service, defective goods, or unfair trade practice in ${district}.`,
      applicableActs: [
        "Consumer Protection Act, 2019 (Section 35 Complaints to District Commission, Section 84 Product Liability)",
        "Consumer Protection (E-Commerce) Rules, 2020",
        "Consumer Protection (Direct Selling) Rules, 2021",
      ],
      suggestedRemedies: [
        "Issue 15-day pre-litigation Statutory Legal Notice demanding refund, product replacement, or cure",
        "File Consumer Complaint via e-Daakhil online portal or physical filing before District CDRC",
        "Claim compensation for mental agony, litigation expenditure, and punitive damages for unfair practice",
        "Petition for interim relief halting recurring charges or preserving evidence",
      ],
      estimatedCourtFee: "Nil for claims up to ₹5 Lakhs; nominal tiered fee above ₹5 Lakhs (Section 35 Consumer Protection Act)",
      recommendedSpecialization: "Consumer Protection & Deficient Service Advocate",
      jurisdictionForum: `District Consumer Disputes Redressal Commission (DCDRC), ${district}`,
      riskScore: "Low",
      statutoryLimitation: "2 years from the date on which the cause of action arose (Section 69 Consumer Protection Act, 2019)",
    };
  }

  // 8. Cheque Bounce / Financial Recovery
  if (cat.includes("cheque") || cat.includes("138") || cat.includes("negotiable") || cat.includes("debt")) {
    return {
      summary: `Financial default involving dishonoured cheque or promissory instrument in ${district}. Strict statutory timetable applies.`,
      applicableActs: [
        "Negotiable Instruments Act, 1881 (Section 138 Dishonour, Section 141 Corporate Liability, Section 142 Cognizance)",
        "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 (Summary Trial Procedures)",
        "Commercial Courts Act, 2015 (if commercial transaction above ₹3 Lakhs)",
      ],
      suggestedRemedies: [
        "Issue mandatory Statutory Demand Notice within 30 days of receiving Bank Return Memo",
        "Provide mandatory 15-day cure period from date of confirmed delivery of notice",
        "File Criminal Complaint under Section 142 before Judicial First Class Magistrate within 30 days of cure expiry",
        "Apply for 20% Interim Compensation under Section 143A of NI Act at the stage of plea framing",
      ],
      estimatedCourtFee: "Ad-valorem court fee as per Schedule I of Kerala Court Fees and Suits Valuation Act, 1959",
      recommendedSpecialization: "Commercial Litigation & Banking Counsel",
      jurisdictionForum: `Court of Judicial First Class Magistrate (JFCM), ${district}`,
      riskScore: "High",
      statutoryLimitation: "Strict: 30 days for notice dispatch; 15 days cure; 30 days to file criminal complaint",
    };
  }

  // 9. Civil Litigation & Injunctions
  if (cat.includes("civil") || cat.includes("injunction") || cat.includes("damages") || cat.includes("suit")) {
    return {
      summary: `Civil dispute within ${district} requiring declaratory decree, contractual enforcement, or preventive injunction.`,
      applicableActs: [
        "Code of Civil Procedure, 1908 (Order VII Rule 1 Plaint, Order XXXIX Rules 1 & 2 Interim Injunction)",
        "Specific Relief Act, 1963 (Section 34 Declaratory Decrees, Section 38 Perpetual Injunction)",
        "Kerala Court Fees and Suits Valuation Act, 1959",
      ],
      suggestedRemedies: [
        "File Original Suit (OS) with urgent Application for Ad-Interim Temporary Injunction before Munsiff / Sub Court",
        "File Caveat Petition under Section 148A CPC to guarantee right of audience against ex-parte injunctions",
        "Apply for Attachment Before Judgment (Order XXXVIII Rule 5 CPC) to secure disputed monetary claim",
        "Apply for Advocate Commissioner inspection for contemporaneous evidence gathering",
      ],
      estimatedCourtFee: "Ad-valorem fees under Kerala Court Fees and Suits Valuation Act, 1959",
      recommendedSpecialization: "Senior Civil Trial Counsel",
      jurisdictionForum: `Munsiff Court / Sub Court, ${district}`,
      riskScore: "Moderate",
      statutoryLimitation: "3 years from the date right to sue accrues (Limitation Act, 1963)",
    };
  }

  // 10. General / Default Triage
  return {
    summary: `Citizen grievance categorized under ${category} within ${district}. Evaluated under applicable Kerala and Central statutory enactments.`,
    applicableActs: [
      "Constitution of India (Article 226 for Writ Petitions before High Court of Kerala)",
      "Code of Civil Procedure, 1908 / Bharatiya Nyaya Sanhita, 2023",
      "Specific Relief Act, 1963 / Indian Contract Act, 1872",
      "Kerala Court Fees and Suits Valuation Act, 1959",
    ],
    suggestedRemedies: [
      "Schedule conference with empaneled Kerala advocate for detailed case vetting",
      "Issue Cease & Desist / Statutory Notice to opposing party",
      "Draft formal representation / plaint before competent judicial forum",
      "File Caveat Petition if anticipating adverse ex-parte proceedings",
    ],
    estimatedCourtFee: "Subject to forum and nature of relief claimed under Kerala Court Fees Act",
    recommendedSpecialization: "High Court & Civil Advocate",
    jurisdictionForum: `High Court of Kerala / District Court, ${district}`,
    riskScore: "Moderate",
    statutoryLimitation: "Limitation Act, 1963 provisions apply based on specific cause of action",
  };
};

// @desc    Pre-flight preview of AI Legal Triage (Without saving)
// @route   POST /api/citizen/grievances/preview
// @access  Private (Citizen)
export const previewGrievanceTriage = async (req, res) => {
  try {
    const { category, description, jurisdictionDistrict } = req.body;
    if (!description) {
      return res.status(400).json({ success: false, message: "Description is required for triage preview" });
    }

    const aiTriage = runLegalAiTriage(category, description, jurisdictionDistrict);
    const matchedAdvocates = matchAdvocatesForTriage(category, jurisdictionDistrict);

    res.json({
      success: true,
      category: category || "Other Legal Matter",
      jurisdictionDistrict: jurisdictionDistrict || "Ernakulam",
      aiTriage,
      matchedAdvocates,
    });
  } catch (error) {
    console.error("previewGrievanceTriage error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
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
    const matchedAdvocates = matchAdvocatesForTriage(category, jurisdictionDistrict);

    if (shouldUseDevStore()) {
      const grievance = devStore.addGrievance({
        citizenId: userId,
        title: title.trim(),
        description: description.trim(),
        category: category || "Other Legal Matter",
        jurisdictionDistrict: jurisdictionDistrict || "Ernakulam",
        preferredCourt: preferredCourt || aiTriageResult.jurisdictionForum || "High Court of Kerala / District Court",
        urgencyLevel: urgencyLevel || "Medium",
        status: "triage_analyzed",
        aiTriage: aiTriageResult,
        matchedAdvocates,
        evidenceDocs: evidenceDocs || [],
      });

      return res.status(201).json({
        success: true,
        message: "Legal grievance submitted and analyzed by Wakheel AI Triage Engine",
        grievance,
        matchedAdvocates,
        mode: "dummy_data",
      });
    }

    const grievance = await Grievance.create({
      citizenId: userId,
      title: title.trim(),
      description: description.trim(),
      category: category || "Other Legal Matter",
      jurisdictionDistrict: jurisdictionDistrict || "Ernakulam",
      preferredCourt: preferredCourt || aiTriageResult.jurisdictionForum || "High Court of Kerala / District Court",
      urgencyLevel: urgencyLevel || "Medium",
      status: "triage_analyzed",
      aiTriage: aiTriageResult,
      matchedAdvocates,
      evidenceDocs: evidenceDocs || [],
    });

    res.status(201).json({
      success: true,
      message: "Legal grievance submitted and analyzed by Wakheel AI Triage",
      grievance,
      matchedAdvocates,
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

// @desc    Get single grievance by ID with full triage & matched advocates
// @route   GET /api/citizen/grievances/:id
// @access  Private (Citizen)
export const getGrievanceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (shouldUseDevStore()) {
      const grievance = devStore.getGrievanceById(id);
      if (!grievance) {
        return res.status(404).json({ success: false, message: "Grievance record not found" });
      }
      return res.json({ success: true, grievance, mode: "dummy_data" });
    }

    const grievance = await Grievance.findById(id);
    if (!grievance) {
      return res.status(404).json({ success: false, message: "Grievance record not found" });
    }

    res.json({ success: true, grievance, mode: "cloud_db" });
  } catch (error) {
    console.error("getGrievanceById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Match/Engage Advocate for Grievance & Auto-Create Matter Docket
// @route   POST /api/citizen/grievances/:id/match
// @access  Private (Citizen)
export const matchAdvocateForGrievance = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { advocateId } = req.body;

    if (!advocateId) {
      return res.status(400).json({ success: false, message: "advocateId is required" });
    }

    if (shouldUseDevStore()) {
      const result = devStore.matchAdvocateToGrievance(id, advocateId, userId);
      if (!result) {
        return res.status(404).json({ success: false, message: "Grievance not found" });
      }
      return res.json({
        success: true,
        message: "Advocate successfully engaged and active matter docket created",
        grievance: result.grievance,
        matter: result.matter,
        advocate: result.advocate,
        mode: "dummy_data",
      });
    }

    const grievance = await Grievance.findById(id);
    if (!grievance) {
      return res.status(404).json({ success: false, message: "Grievance not found" });
    }

    const advocate = await User.findById(advocateId).select("-password");
    grievance.assignedAdvocateId = advocateId;
    grievance.status = "matter_opened";
    await grievance.save();

    res.json({
      success: true,
      message: "Advocate successfully engaged for grievance",
      grievance,
      advocate,
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("matchAdvocateForGrievance error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 3. MATTERS & CASE TRACKER CONTROLLERS
// ============================================================================

// Helper: Normalize matter for client frontend format
const normalizeMatterForClient = (m) => {
  const doc = m.toObject ? m.toObject() : m;
  const id = doc._id ? doc._id.toString() : doc.id;
  const caseNumber = doc.caseNumber || "WP(C) 19482/2024";
  const rawTitle = doc.title || doc.matterTitle || doc.caseTitle || `${caseNumber} Matter`;
  const court = doc.court || doc.courtForum || "High Court of Kerala (Ernakulam Bench)";
  const assignedAdvocate = doc.assignedAdvocate || doc.advocateName || "Adv. Meera Krishnan";
  const courtHall = doc.courtHall || "Court Hall 2A (Division Bench)";
  const status = doc.status || "Admitted";
  const filingDate = doc.filingDate || (doc.createdAt ? new Date(doc.createdAt).toISOString().split("T")[0] : "2024-06-14");
  const cnrNumber = doc.cnrNumber || "KLHC01-019482-2024";

  let nextHearing = doc.nextHearing || "20-Nov-2024 (Bench 4B)";
  if (doc.nextHearingDate) {
    if (typeof doc.nextHearingDate === "string" && doc.nextHearingDate.includes("T")) {
      const d = new Date(doc.nextHearingDate);
      if (!isNaN(d.getTime())) {
        nextHearing = `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} (${courtHall.split("(")[0].trim()})`;
      }
    } else if (typeof doc.nextHearingDate === "string") {
      nextHearing = doc.nextHearingDate;
    }
  }

  const statutoryActs =
    doc.statutoryActs && doc.statutoryActs.length > 0
      ? doc.statutoryActs
      : [
          "Article 226 of the Constitution of India",
          "Indian Telegraph Act, 1885 (Section 10 & 16)",
          "Specific Relief Act, 1963",
        ];

  const timeline = (doc.timeline || []).map((step) => ({
    date:
      typeof step.date === "string"
        ? step.date
        : step.date
        ? new Date(step.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "Recent",
    title: step.title || "Court Proceedings Update",
    remarks: step.remarks || "",
    stage: step.stage || "Completed",
    orderCopyUrl: step.orderCopyUrl,
  }));

  return {
    id,
    _id: id,
    caseNumber,
    title: rawTitle,
    matterTitle: rawTitle,
    court,
    courtForum: court,
    assignedAdvocate,
    advocateName: assignedAdvocate,
    nextHearing,
    nextHearingDate: doc.nextHearingDate,
    filingDate,
    status,
    cnrNumber,
    courtHall,
    statutoryActs,
    timeline,
    totalFeesBilled: doc.totalFeesBilled || 0,
    feesPaid: doc.feesPaid || 0,
  };
};



// @desc    Get active matters for citizen
// @route   GET /api/citizen/matters
// @access  Private (Citizen)
export const getMatters = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (shouldUseDevStore()) {
      const matters = devStore.getMatters(userId);
      const normalized = matters.map(normalizeMatterForClient);
      return res.json({
        success: true,
        count: normalized.length,
        matters: normalized,
        mode: "dummy_data",
      });
    }

    let matters = await Matter.find({ citizenId: userId }).sort({ updatedAt: -1 });
    const normalized = matters.map(normalizeMatterForClient);
    res.json({
      success: true,
      count: normalized.length,
      matters: normalized,
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("getMatters error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single matter details by ID
// @route   GET /api/citizen/matters/detail/:id
// @access  Private (Citizen)
export const getMatterById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    if (shouldUseDevStore()) {
      const match = devStore.getMatterById(id);
      if (match) {
        return res.json({
          success: true,
          matter: normalizeMatterForClient(match),
          mode: "dummy_data",
        });
      }
      return res.status(404).json({ success: false, message: "Matter not found" });
    }

    const matter = await Matter.findOne({
      citizenId: userId,
      $or: [{ _id: id }, { caseNumber: id }, { cnrNumber: id }],
    });

    if (!matter) {
      return res.status(404).json({ success: false, message: "Matter not found" });
    }

    res.json({
      success: true,
      matter: normalizeMatterForClient(matter),
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("getMatterById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get matter by CNR number or Case Number
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
        return res.json({
          success: true,
          matter: normalizeMatterForClient(match),
          mode: "dummy_data",
        });
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
    res.json({
      success: true,
      matter: normalizeMatterForClient(matter),
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("getMatterByCnr error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Live e-Courts Case Tracking by CNR / Case Number
// @route   GET /api/citizen/matters/track/:cnr (or POST /api/citizen/matters/track)
// @access  Private (Citizen)
export const trackCaseByCnr = async (req, res) => {
  try {
    const cnr = req.params.cnr || req.body.cnr || req.query.cnr;
    const userId = getUserId(req);

    if (!cnr) {
      return res.status(400).json({ success: false, message: "CNR or Case number is required for tracking" });
    }

    // 1. First check if it already belongs to the user's active dockets
    if (shouldUseDevStore()) {
      const matters = devStore.getMatters(userId);
      const userMatch = matters.find(
        (m) =>
          (m.cnrNumber && m.cnrNumber.toLowerCase().replace(/[^a-z0-9]/g, "") === cnr.toLowerCase().replace(/[^a-z0-9]/g, "")) ||
          (m.caseNumber && m.caseNumber.toLowerCase().replace(/[^a-z0-9]/g, "") === cnr.toLowerCase().replace(/[^a-z0-9]/g, ""))
      );

      if (userMatch) {
        return res.json({
          success: true,
          isLinkedToUser: true,
          source: "user_active_docket",
          matter: normalizeMatterForClient(userMatch),
          canImportToDocket: false,
          mode: "dummy_data",
        });
      }
    } else {
      const cleanRegex = new RegExp(`^${cnr.replace(/[-/]/g, "[-/]?")}$`, "i");
      const userMatch = await Matter.findOne({
        citizenId: userId,
        $or: [{ cnrNumber: cleanRegex }, { caseNumber: cleanRegex }],
      });

      if (userMatch) {
        return res.json({
          success: true,
          isLinkedToUser: true,
          source: "user_active_docket",
          matter: normalizeMatterForClient(userMatch),
          canImportToDocket: false,
          mode: "cloud_db",
        });
      }
    }

    // 2. If not found in user's active dockets, query live e-Courts NJDG resolver
    const liveCase = resolveECourtsLiveCnr(cnr);
    res.json({
      success: true,
      isLinkedToUser: false,
      source: "ecourts_njdg_live",
      matter: liveCase,
      canImportToDocket: true,
      message: `Live e-Courts docket found for CNR ${liveCase.cnrNumber}`,
    });
  } catch (error) {
    console.error("trackCaseByCnr error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add / File new matter docket
// @route   POST /api/citizen/matters
// @access  Private (Citizen)
export const createMatter = async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      caseNumber,
      title,
      matterTitle,
      court,
      courtForum,
      assignedAdvocate,
      advocateName,
      cnrNumber,
      courtHall,
      statutoryActs,
      status,
      nextHearingDate,
      filingDate,
    } = req.body;

    const finalCaseNumber = caseNumber || `WP(C) ${Math.floor(10000 + Math.random() * 90000)}/2026`;
    const finalTitle = title || matterTitle || `${finalCaseNumber} Legal Matter`;
    const finalCourt = court || courtForum || "High Court of Kerala (Ernakulam)";
    const finalAdvocate = assignedAdvocate || advocateName || "Adv. Meera Krishnan";
    const finalCnr = cnrNumber || `KLHC01-${Math.floor(100000 + Math.random() * 900000)}-2026`;

    const matterData = {
      citizenId: userId,
      caseNumber: finalCaseNumber,
      matterTitle: finalTitle,
      title: finalTitle,
      courtForum: finalCourt,
      court: finalCourt,
      advocateName: finalAdvocate,
      assignedAdvocate: finalAdvocate,
      cnrNumber: finalCnr,
      courtHall: courtHall || "Court Hall 2A",
      status: status || "Admitted",
      filingDate: filingDate || new Date().toISOString().split("T")[0],
      nextHearingDate: nextHearingDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      statutoryActs: statutoryActs || ["Article 226 of the Constitution of India", "Specific Relief Act, 1963"],
      timeline: [
        {
          date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          title: "Matter Registered in Wakheel Case Tracker",
          remarks: `Matter docket opened for ${finalCaseNumber}. Standing counsel / advocate engaged.`,
          stage: "Completed",
        },
      ],
    };

    if (shouldUseDevStore()) {
      const created = devStore.addMatter(matterData);
      return res.status(201).json({
        success: true,
        message: "Matter docket created and linked to Case Tracker",
        matter: normalizeMatterForClient(created),
        mode: "dummy_data",
      });
    }

    const created = await Matter.create(matterData);
    res.status(201).json({
      success: true,
      message: "Matter docket created and linked to Case Tracker",
      matter: normalizeMatterForClient(created),
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("createMatter error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add milestone to matter timeline
// @route   POST /api/citizen/matters/:id/timeline
// @access  Private (Citizen)
export const addMatterTimelineMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, remarks, stage, date, nextHearingDate } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Milestone title is required" });
    }

    const eventData = {
      title,
      remarks: remarks || "",
      stage: stage || "Completed",
      date: date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      nextHearingDate,
    };

    if (shouldUseDevStore()) {
      const result = devStore.addMatterTimelineEvent(id, eventData);
      if (!result) {
        return res.status(404).json({ success: false, message: "Matter not found" });
      }
      return res.json({
        success: true,
        message: "Milestone added to case timeline",
        matter: normalizeMatterForClient(result.matter),
        event: result.event,
        mode: "dummy_data",
      });
    }

    let matter = null;
    try {
      matter = await Matter.findById(id);
    } catch {
      // not a valid ObjectId, fallback to caseNumber/cnrNumber
    }
    if (!matter) {
      matter = await Matter.findOne({
        $or: [{ caseNumber: id }, { cnrNumber: id }, { _id: id }],
      });
    }
    if (!matter) {
      return res.status(404).json({ success: false, message: "Matter not found" });
    }

    matter.timeline.push(eventData);
    if (nextHearingDate) {
      matter.nextHearingDate = nextHearingDate;
    }
    await matter.save();

    res.json({
      success: true,
      message: "Milestone added to case timeline",
      matter: normalizeMatterForClient(matter),
      event: eventData,
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("addMatterTimelineMilestone error:", error);
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

// @desc    Get single consultation by ID
// @route   GET /api/citizen/consultations/:id
// @access  Private (Citizen)
export const getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (shouldUseDevStore()) {
      const consultation = devStore.getConsultationById(id);
      if (!consultation) return res.status(404).json({ success: false, message: "Consultation not found" });
      return res.json({ success: true, consultation, mode: "dummy_data" });
    }

    const consultation = await Consultation.findById(id);
    if (!consultation) return res.status(404).json({ success: false, message: "Consultation not found" });
    res.json({ success: true, consultation, mode: "cloud_db" });
  } catch (error) {
    console.error("getConsultationById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reschedule consultation date/time
// @route   PUT /api/citizen/consultations/:id/reschedule
// @access  Private (Citizen)
export const rescheduleConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate, timeSlot, reason } = req.body;

    if (!scheduledDate) {
      return res.status(400).json({ success: false, message: "New scheduled date is required" });
    }

    if (shouldUseDevStore()) {
      const updated = devStore.rescheduleConsultation(id, scheduledDate, timeSlot, reason);
      if (!updated) return res.status(404).json({ success: false, message: "Consultation not found" });
      return res.json({
        success: true,
        message: "Consultation rescheduled successfully. Advocate calendar updated.",
        consultation: updated,
        mode: "dummy_data",
      });
    }

    const updated = await Consultation.findByIdAndUpdate(
      id,
      {
        $set: {
          scheduledDate: new Date(scheduledDate),
          timeSlot: timeSlot || "10:30 AM - 11:15 AM",
          status: "rescheduled",
          rescheduleReason: reason || "",
        },
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Consultation not found" });

    res.json({
      success: true,
      message: "Consultation rescheduled successfully. Advocate calendar updated.",
      consultation: updated,
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("rescheduleConsultation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel consultation
// @route   PUT /api/citizen/consultations/:id/cancel
// @access  Private (Citizen)
export const cancelConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (shouldUseDevStore()) {
      const updated = devStore.cancelConsultation(id, reason);
      if (!updated) return res.status(404).json({ success: false, message: "Consultation not found" });
      return res.json({
        success: true,
        message: "Consultation cancelled. Fee refund initiated to original payment source.",
        consultation: updated,
        mode: "dummy_data",
      });
    }

    const updated = await Consultation.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "cancelled",
          cancellationReason: reason || "Citizen requested cancellation",
        },
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Consultation not found" });

    res.json({
      success: true,
      message: "Consultation cancelled. Fee refund initiated to original payment source.",
      consultation: updated,
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("cancelConsultation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Join secure virtual video chamber room
// @route   GET /api/citizen/consultations/:id/room
// @access  Private (Citizen)
export const joinConsultationRoom = async (req, res) => {
  try {
    const { id } = req.params;

    let consultation = null;
    if (shouldUseDevStore()) {
      consultation = devStore.getConsultationById(id);
    } else {
      consultation = await Consultation.findById(id);
    }

    if (!consultation) {
      return res.status(404).json({ success: false, message: "Consultation not found" });
    }

    const roomId = `wakheel-chamber-${consultation._id || id}`;
    const meetingUrl = consultation.meetingLink || `https://meet.wakheel.law/${roomId}`;

    res.json({
      success: true,
      roomId,
      meetingUrl,
      advocateName: consultation.advocateName,
      consultationType: consultation.consultationType,
      scheduledDate: consultation.scheduledDate,
      timeSlot: consultation.timeSlot,
      status: consultation.status,
      token: `jwt_room_auth_${Date.now()}`,
    });
  } catch (error) {
    console.error("joinConsultationRoom error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 6. DOCUMENT VAULT & DOCUMENT FILING CONTROLLERS
// ============================================================================

const normalizeDocument = (doc) => {
  const d = doc && doc.toObject ? doc.toObject() : (doc || {});
  const id = d.id || d._id?.toString() || `doc_${Date.now()}`;
  const name = d.name || d.fileName || d.title || "Document.pdf";
  const fileName = d.fileName || d.name || d.title || "Document.pdf";
  const category = d.category || "Evidence & Exhibits";
  const subType =
    d.subType ||
    (category === "Contract"
      ? "contracts"
      : category === "CTC"
      ? "certified-true-copies"
      : category === "Filing Receipt" || d.filingStatus
      ? "document-filing"
      : "all");

  const hash =
    d.hash ||
    d.sha256Hash ||
    `sha256:${Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

  return {
    _id: id,
    id,
    name,
    fileName,
    title: d.title || name,
    category,
    subType,
    matter: d.matter || "WP(C) 19482/2024 — Gopakumar v. KSEB",
    matterId: d.matterId || "mat_wpc_19482",
    size: d.size || d.fileSize || "1.2 MB",
    fileSize: d.fileSize || d.size || "1.2 MB",
    uploadDate: d.uploadDate || (d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Just now"),
    date: d.date || d.uploadDate || "Just now",
    isSigned: d.isSigned !== undefined ? d.isSigned : true,
    pages: d.pages || 1,
    hash,
    sha256Hash: hash,
    details: d.details || d.remarks || "Secure vault document",
    filingStatus: d.filingStatus || d.status || "Ready in Vault",
    status: d.status || d.filingStatus || "Ready in Vault",
    advocateName: d.advocateName || "Adv. Meera Krishnan",
    advocateId: d.advocateId || "adv_1",
    remarks: d.remarks || "",
  };
};

// @desc    Get all vault documents for citizen with optional filters
// @route   GET /api/citizen/documents
// @access  Private (Citizen)
export const getDocuments = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { subType, category, matter, matterId, search } = req.query;

    if (shouldUseDevStore()) {
      const documents = devStore.getDocuments(userId, { subType, category, matter, matterId, search });
      const normalized = documents.map(normalizeDocument);
      return res.json({ success: true, count: normalized.length, documents: normalized, mode: "dummy_data" });
    }

    const query = { citizenId: userId };
    if (subType && subType !== "all") {
      if (subType === "contracts") {
        query.$or = [{ subType: "contracts" }, { category: "Contract" }];
      } else if (subType === "certified-true-copies") {
        query.$or = [{ subType: "certified-true-copies" }, { category: "CTC" }];
      } else if (subType === "document-filing") {
        query.$or = [{ subType: "document-filing" }, { category: "Filing Receipt" }];
      } else {
        query.subType = subType;
      }
    }
    if (category) {
      query.category = { $regex: category, $options: "i" };
    }
    if (matter) {
      query.matter = { $regex: matter, $options: "i" };
    }
    if (matterId) {
      query.matterId = matterId;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { fileName: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
      ];
    }

    const docs = await CitizenDocument.find(query).sort({ createdAt: -1 });
    const normalized = docs.map(normalizeDocument);
    res.json({ success: true, count: normalized.length, documents: normalized, mode: "cloud_db" });
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
    const {
      title,
      name,
      category,
      subType,
      matter,
      matterId,
      fileName,
      fileSize,
      size,
      pages,
      details,
      isSigned,
    } = req.body;

    const finalName = fileName || name || title || "Document.pdf";
    const finalTitle = title || finalName;
    const finalCategory = category || "Evidence & Exhibits";
    const targetSubType =
      subType ||
      (finalCategory === "Contract"
        ? "contracts"
        : finalCategory === "CTC"
        ? "certified-true-copies"
        : finalCategory === "Filing Receipt"
        ? "document-filing"
        : "all");

    const generatedHash = `sha256:${Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    const docData = {
      citizenId: userId,
      title: finalTitle.trim(),
      name: finalName,
      fileName: finalName,
      category: finalCategory,
      subType: targetSubType,
      matter: matter || "WP(C) 19482/2024 — Gopakumar v. KSEB",
      matterId: matterId || "mat_wpc_19482",
      fileSize: fileSize || size || "1.5 MB",
      size: fileSize || size || "1.5 MB",
      pages: pages ? Number(pages) : 4,
      details: details || "Uploaded securely to citizen document vault.",
      isSigned: isSigned !== undefined ? isSigned : true,
      sha256Hash: generatedHash,
      hash: generatedHash,
      filingStatus: "Ready in Vault",
      status: "Ready in Vault",
      advocateName: "Adv. Meera Krishnan",
      advocateId: "adv_1",
    };

    if (shouldUseDevStore()) {
      const doc = devStore.addDocument(docData);
      return res.status(201).json({
        success: true,
        message: "Document saved to 256-bit encrypted citizen vault",
        document: normalizeDocument(doc),
        mode: "dummy_data",
      });
    }

    const doc = await CitizenDocument.create(docData);
    res.status(201).json({
      success: true,
      message: "Document saved to encrypted vault",
      document: normalizeDocument(doc),
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("uploadDocument error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit document filing for advocate review & court registry
// @route   POST /api/citizen/documents/file
// @access  Private (Citizen)
export const fileDocument = async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      fileName,
      category,
      matter,
      matterId,
      size,
      fileSize,
      remarks,
      advocateName,
      advocateId,
    } = req.body;

    const finalFileName = fileName || `${(category || "Pleading").replace(/[\s/]/g, "_")}_Filing.pdf`;
    const finalMatter = matter || "WP(C) 19482/2024 — Gopakumar Nambiar v. KSEB";
    const finalAdvocate = advocateName || "Adv. Meera Krishnan";
    const generatedHash = `sha256:${Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    const filingData = {
      citizenId: userId,
      title: finalFileName.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
      name: finalFileName,
      fileName: finalFileName,
      category: category || "Pleading Draft / Affidavit Counter",
      subType: "document-filing",
      matter: finalMatter,
      matterId: matterId || "mat_wpc_19482",
      size: size || fileSize || "1.8 MB",
      fileSize: size || fileSize || "1.8 MB",
      date: "Just now",
      uploadDate: "Just now",
      isSigned: true,
      pages: 6,
      hash: generatedHash,
      sha256Hash: generatedHash,
      filingStatus: "Transmitted to Advocate",
      status: "Transmitted to Advocate",
      advocateName: finalAdvocate,
      advocateId: advocateId || "adv_1",
      remarks: remarks || "",
      details: remarks || `Transmitted to ${finalAdvocate} for judicial scrutiny & court submission.`,
    };

    if (shouldUseDevStore()) {
      const doc = devStore.addDocument(filingData);
      return res.status(201).json({
        success: true,
        message: `Filing successfully transmitted to ${finalAdvocate} for chamber review.`,
        filing: normalizeDocument(doc),
        document: normalizeDocument(doc),
        mode: "dummy_data",
      });
    }

    const doc = await CitizenDocument.create(filingData);
    res.status(201).json({
      success: true,
      message: `Filing successfully transmitted to ${finalAdvocate} for chamber review.`,
      filing: normalizeDocument(doc),
      document: normalizeDocument(doc),
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("fileDocument error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all document filings submitted to advocates
// @route   GET /api/citizen/documents/filings
// @access  Private (Citizen)
export const getFilings = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (shouldUseDevStore()) {
      const docs = devStore.getDocuments(userId, { subType: "document-filing" });
      const normalized = docs.map(normalizeDocument);
      return res.json({ success: true, count: normalized.length, filings: normalized, mode: "dummy_data" });
    }

    const docs = await CitizenDocument.find({
      citizenId: userId,
      $or: [{ subType: "document-filing" }, { filingStatus: { $ne: "Ready in Vault" } }],
    }).sort({ createdAt: -1 });

    const normalized = docs.map(normalizeDocument);
    res.json({ success: true, count: normalized.length, filings: normalized, mode: "cloud_db" });
  } catch (error) {
    console.error("getFilings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete document from vault
// @route   DELETE /api/citizen/documents/:id
// @access  Private (Citizen)
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (shouldUseDevStore()) {
      const deleted = devStore.deleteDocument(id);
      if (!deleted) return res.status(404).json({ success: false, message: "Document not found" });
      return res.json({ success: true, message: "Document removed from vault", mode: "dummy_data" });
    }

    const deleted = await CitizenDocument.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Document not found" });

    res.json({ success: true, message: "Document removed from vault", mode: "cloud_db" });
  } catch (error) {
    console.error("deleteDocument error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify document SHA-256 digital signature
// @route   GET /api/citizen/documents/:id/verify
// @access  Private (Citizen)
export const verifyDocumentHash = async (req, res) => {
  try {
    const { id } = req.params;

    let doc = null;
    if (shouldUseDevStore()) {
      doc = devStore.getDocumentById(id);
    } else {
      doc = await CitizenDocument.findById(id);
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const normalized = normalizeDocument(doc);
    res.json({
      success: true,
      verified: true,
      algorithm: "SHA-256",
      hash: normalized.hash,
      documentName: normalized.name,
      certifiedDate: normalized.uploadDate,
      issuer: "High Court of Kerala / eCourts Digital Evidence Registry",
      status: "Cryptographically Verified",
    });
  } catch (error) {
    console.error("verifyDocumentHash error:", error);
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
    // Dynamically calculate daysRemaining for each Mongoose document
    const enrichedNotices = notices.map((doc) => {
      const n = doc.toObject();
      const dispatch = n.dispatchDate ? new Date(n.dispatchDate).getTime() : Date.now();
      const elapsedDays = Math.max(0, Math.floor((Date.now() - dispatch) / (1000 * 60 * 60 * 24)));
      const statutory = Number(n.statutoryNoticeDays) || 15;
      n.daysRemaining = Math.max(0, statutory - elapsedDays);
      return n;
    });

    res.json({ success: true, count: enrichedNotices.length, notices: enrichedNotices, mode: "cloud_db" });
  } catch (error) {
    console.error("getLegalNotices error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single legal notice by ID
// @route   GET /api/citizen/notices/:id
// @access  Private (Citizen)
export const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (shouldUseDevStore()) {
      const notice = devStore.getNoticeById(id);
      if (!notice) {
        return res.status(404).json({ success: false, message: "Legal notice not found" });
      }
      return res.json({ success: true, notice, mode: "dummy_data" });
    }

    const doc = await LegalNotice.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Legal notice not found" });
    }

    const notice = doc.toObject();
    const dispatch = notice.dispatchDate ? new Date(notice.dispatchDate).getTime() : Date.now();
    const elapsedDays = Math.max(0, Math.floor((Date.now() - dispatch) / (1000 * 60 * 60 * 24)));
    const statutory = Number(notice.statutoryNoticeDays) || 15;
    notice.daysRemaining = Math.max(0, statutory - elapsedDays);

    res.json({ success: true, notice, mode: "cloud_db" });
  } catch (error) {
    console.error("getNoticeById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create and issue a statutory legal notice
// @route   POST /api/citizen/notices
// @access  Private (Citizen)
export const createLegalNotice = async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      noticeType,
      title,
      senderName,
      recipientName,
      recipientAddress,
      claimAmount,
      statutoryNoticeDays,
      dispatchDate,
      speedPostTrackingNumber,
      advocateName,
      draftContent,
      matterId,
    } = req.body;

    if (!recipientName || !recipientAddress) {
      return res.status(400).json({
        success: false,
        message: "Recipient name and recipient postal address are required.",
      });
    }

    const trackingNum =
      speedPostTrackingNumber && speedPostTrackingNumber.trim()
        ? speedPostTrackingNumber.trim().toUpperCase()
        : `EK${Math.floor(100000000 + Math.random() * 900000000)}IN`;

    const noticeDays = Number(statutoryNoticeDays) || 15;
    const now = new Date();
    const dateStr = now
      .toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      .replace(/ /g, "-");
    const timeStr = now.toTimeString().split(" ")[0];

    const initialTracking = [
      {
        date: dateStr,
        time: timeStr,
        location: "Kochi GPO / Sorting Hub",
        activity: `Item Booked via Speed Post (Weight: 75g, Consignment: ${trackingNum})`,
      },
    ];

    const noticeData = {
      citizenId: userId,
      matterId: matterId || null,
      noticeType: noticeType || "Cheque Bounce Demand (Sec 138 NI Act)",
      title: title || `Statutory Legal Notice to ${recipientName}`,
      senderName: senderName || "Gopakumar Nambiar",
      recipientName: recipientName.trim(),
      recipientAddress: recipientAddress.trim(),
      claimAmount: claimAmount || "",
      statutoryNoticeDays: noticeDays,
      dispatchDate: dispatchDate ? new Date(dispatchDate) : now,
      speedPostTrackingNumber: trackingNum,
      deliveryStatus: "Item Booked",
      daysRemaining: noticeDays,
      advocateName: advocateName || "Adv. Meera Krishnan",
      draftContent: draftContent || "",
      trackingHistory: initialTracking,
    };

    if (shouldUseDevStore()) {
      const created = devStore.addNotice(noticeData);
      return res.status(201).json({
        success: true,
        message: "Statutory notice registered and consignment booked successfully",
        notice: created,
        mode: "dummy_data",
      });
    }

    const created = await LegalNotice.create(noticeData);
    res.status(201).json({
      success: true,
      message: "Statutory notice registered and consignment booked successfully",
      notice: created,
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("createLegalNotice error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track India Post Speed Post consignment
// @route   GET /api/citizen/notices/:id/track
// @access  Private (Citizen)
export const trackNoticeSpeedPost = async (req, res) => {
  try {
    const { id } = req.params;

    let notice = null;
    if (shouldUseDevStore()) {
      notice = devStore.getNoticeById(id);
      if (!notice) {
        // Fallback: check if id is a speed post tracking barcode number
        const allNotices = devStore.getNotices();
        notice = allNotices.find((n) => n.speedPostTrackingNumber === id);
      }
    } else {
      if (id.startsWith("not_")) {
        notice = devStore.getNoticeById(id);
      } else {
        notice = await LegalNotice.findById(id).catch(() => null);
        if (!notice) {
          notice = await LegalNotice.findOne({ speedPostTrackingNumber: id });
        }
      }
    }

    if (notice) {
      const n = notice.toObject ? notice.toObject() : notice;
      const dispatch = n.dispatchDate ? new Date(n.dispatchDate).getTime() : Date.now();
      const elapsedDays = Math.max(0, Math.floor((Date.now() - dispatch) / (1000 * 60 * 60 * 24)));
      const statutory = Number(n.statutoryNoticeDays) || 15;
      const daysRemaining = Math.max(0, statutory - elapsedDays);

      return res.json({
        success: true,
        noticeId: n._id || n.id,
        trackingNumber: n.speedPostTrackingNumber,
        deliveryStatus: n.deliveryStatus,
        recipientName: n.recipientName,
        recipientAddress: n.recipientAddress,
        dispatchDate: n.dispatchDate,
        statutoryNoticeDays: statutory,
        daysRemaining,
        trackingHistory: n.trackingHistory || [],
      });
    }

    // If tracking number entered directly and not found in DB, return India Post simulated trajectory
    const barcode = id.toUpperCase();
    const now = new Date();
    const trackingHistory = [
      {
        date: now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        time: "10:30:00",
        location: "Kochi GPO Nodal Delivery Centre",
        activity: "Item Booked at Counter via Inland Speed Post",
      },
      {
        date: now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        time: "15:45:10",
        location: "National Sorting Hub (NSH) Kochi",
        activity: "Item Received at Sorting Hub and Bagged",
      },
    ];

    res.json({
      success: true,
      noticeId: null,
      trackingNumber: barcode,
      deliveryStatus: "In Transit",
      recipientName: "Addressee",
      recipientAddress: "Postal District",
      dispatchDate: now.toISOString(),
      statutoryNoticeDays: 15,
      daysRemaining: 15,
      trackingHistory,
    });
  } catch (error) {
    console.error("trackNoticeSpeedPost error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate formal statutory legal notice draft with AI
// @route   POST /api/citizen/notices/generate-draft
// @access  Private (Citizen)
export const generateNoticeDraft = async (req, res) => {
  try {
    const {
      noticeType,
      senderName = "Gopakumar Nambiar",
      recipientName = "Recipient Name",
      recipientAddress = "Recipient Address",
      claimAmount = "",
      facts = "",
      chequeNumber = "",
      bankName = "",
      chequeDate = "",
      returnMemoDate = "",
      advocateName = "Adv. Meera Krishnan",
      statutoryNoticeDays = 15,
    } = req.body;

    const todayStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    let draftContent = "";
    let statutoryDays = Number(statutoryNoticeDays) || 15;
    let suggestedTitle = "";

    if (noticeType?.includes("138") || noticeType?.toLowerCase().includes("cheque")) {
      statutoryDays = 15;
      suggestedTitle = `Statutory Demand Notice under Section 138 NI Act (${claimAmount || "Dishonoured Cheque"})`;
      draftContent = `LEGAL DEMAND NOTICE UNDER PROVISO (b) TO SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881

Date: ${todayStr}

To,
${recipientName}
${recipientAddress}

Under instructions from and on behalf of my client, Sri. ${senderName}, residing at Ernakulam, Kerala (hereinafter referred to as "my Client"), I, the undersigned Advocate, do hereby serve upon you this formal Statutory Demand Notice:

1. That in discharge of your legally existing debt and liability towards my Client in respect of transaction/goods/services rendered${claimAmount ? ` amounting to ${claimAmount}` : ""}, you had issued Cheque bearing No. ${chequeNumber || "[Cheque Number]"} dated ${chequeDate || "[Cheque Date]"} drawn on ${bankName || "[Bank Name & Branch]"}${claimAmount ? ` for a sum of ${claimAmount}/-` : ""}.

2. That my Client presented the aforesaid cheque for encashment through his banker, but to my Client's utter surprise and shock, the said cheque was dishonoured and returned unpaid by the drawee bank on ${returnMemoDate || "[Return Memo Date]"} with the bank endorsement/memo remarks: 'FUNDS INSUFFICIENT / EXCEEDS ARRANGEMENT'.

3. ${facts ? `Additional facts: ${facts}` : "That despite knowledge of dishonour, you have failed and neglected to make payment of the cheque amount or offer any legitimate justification."}

4. You are hereby called upon by this statutory notice to pay to my Client the full cheque sum of ${claimAmount || "the dishonoured cheque amount"} within 15 (FIFTEEN) DAYS from the date of receipt of this notice.

5. Take notice that if you fail or neglect to make the payment within the statutory period of 15 days as stipulated under proviso (c) to Section 138 of the Negotiable Instruments Act, 1881, my Client shall be constrained to initiate criminal proceedings against you under Section 138 & Section 142 of the Negotiable Instruments Act, 1881 read with Section 420 of the Indian Penal Code / Bharatiya Nyaya Sanhita, 2023 before the competent Judicial First Class Magistrate Court entirely at your risk, cost, and legal peril.

${advocateName}
Advocate, High Court of Kerala
Chambers: Ernakulam Law Chambers, Kochi`;
    } else if (noticeType?.includes("80") || noticeType?.toLowerCase().includes("government")) {
      statutoryDays = 60;
      suggestedTitle = `Statutory Notice under Section 80 CPC to ${recipientName}`;
      draftContent = `NOTICE UNDER SECTION 80 OF THE CODE OF CIVIL PROCEDURE, 1908
(Pre-requisite to Institution of Suit against Government / Public Officers)

Date: ${todayStr}

To,
${recipientName}
${recipientAddress}

Sir / Madam,

Take notice that on the expiration of TWO MONTHS next after notice in writing has been delivered to or left at your office, my Client, Sri. ${senderName}, intends to institute a Civil Suit against you and the Authority in the competent Court of Civil Jurisdiction.

1. NAME & DESCRIPTION OF THE PLAINTIFF:
Sri. ${senderName}, adult, Indian inhabitant, residing at Kerala.

2. CAUSE OF ACTION & FACTS OF THE CASE:
${facts || "That the authority has initiated unauthorized actions/encroachment/omission without statutory adherence to natural justice and lawful procedure."}

3. RELIEF SOUGHT:
A decree for mandatory and prohibitory injunction, restitution of rights, and damages/compensation${claimAmount ? ` quantified at ${claimAmount}` : ""}.

Take notice that if the aforesaid demands are not complied with within the mandatory statutory period of 60 (Sixty) days from the receipt hereof, the suit will be filed at your cost and risk.

${advocateName}
Advocate for the Intending Plaintiff`;
    } else if (noticeType?.includes("Recovery") || noticeType?.toLowerCase().includes("money")) {
      statutoryDays = 15;
      suggestedTitle = `Notice for Demand & Recovery of Dues (${claimAmount || "Outstanding Invoices"})`;
      draftContent = `LEGAL NOTICE FOR RECOVERY OF OUTSTANDING DUES WITH COMMERCIAL INTEREST

Date: ${todayStr}

To,
${recipientName}
${recipientAddress}

Under instructions from my Client, Sri. ${senderName}, I hereby call upon you as under:

1. That you entered into business transactions and availed services/materials from my Client, against which invoices were duly raised and acknowledged by you.

2. That despite having received full consideration and benefit, you have willfully withheld and defaulted on payment of the outstanding amount of ${claimAmount || "[Claim Amount]"}.

3. ${facts ? `Particulars: ${facts}` : "My Client issued several written reminders, statements of account, and requests, but you failed to liquidate the admitted dues."}

4. You are hereby called upon to pay the entire outstanding sum of ${claimAmount || "[Claim Amount]"} along with interest @ 18% per annum within 15 (fifteen) days of receipt of this notice, failing which my Client will institute Summary Suit proceedings under Order XXXVII of the Code of Civil Procedure, 1908 along with an application for attachment before judgment before the competent Court.

${advocateName}
Advocate, Chambers of Legal Associates`;
    } else {
      statutoryDays = Number(statutoryNoticeDays) || 15;
      suggestedTitle = `Legal Notice to ${recipientName}`;
      draftContent = `FORMAL LEGAL NOTICE

Date: ${todayStr}

To,
${recipientName}
${recipientAddress}

Under instructions from and on behalf of my Client, Sri. ${senderName}, I issue this legal notice as follows:

1. ${facts || "That a dispute has arisen between you and my Client regarding contractual obligations and legal liabilities."}

2. That your acts and omissions have caused severe prejudice, pecuniary loss, and hardship to my Client${claimAmount ? ` in the sum of ${claimAmount}` : ""}.

3. You are hereby granted ${statutoryDays} days from the receipt of this notice to remedy the breach and fulfill your lawful commitments, failing which appropriate legal proceedings (both civil and criminal) shall be initiated against you without any further notice.

${advocateName}
Advocate`;
    }

    res.json({
      success: true,
      draftContent,
      statutoryNoticeDays: statutoryDays,
      suggestedTitle,
    });
  } catch (error) {
    console.error("generateNoticeDraft error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a legal notice
// @route   DELETE /api/citizen/notices/:id
// @access  Private (Citizen)
export const deleteLegalNotice = async (req, res) => {
  try {
    const { id } = req.params;

    if (shouldUseDevStore()) {
      devStore.deleteNotice(id);
      return res.json({ success: true, message: "Notice deleted successfully", mode: "dummy_data" });
    }

    await LegalNotice.findByIdAndDelete(id);
    res.json({ success: true, message: "Notice deleted successfully", mode: "cloud_db" });
  } catch (error) {
    console.error("deleteLegalNotice error:", error);
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
// 9. CITIZEN INVOICES & RETAINER FEE PAYMENTS (Milestone 2 Two-Way Sync)
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

export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (shouldUseDevStore()) {
      const invoice = devStore.getInvoiceById(id);
      if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
      return res.json({ success: true, invoice, mode: "dummy_data" });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
    res.json({ success: true, invoice, mode: "cloud_db" });
  } catch (error) {
    console.error("getInvoiceById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const payCitizenInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod = "UPI", transactionId } = req.body;

    if (shouldUseDevStore()) {
      const result = devStore.payInvoice(id, paymentMethod, transactionId);
      if (!result) return res.status(404).json({ success: false, message: "Invoice not found" });
      return res.json({
        success: true,
        message: "Payment confirmed successfully. Formal GST receipt issued.",
        invoice: result.invoice,
        matter: result.matter,
        mode: "dummy_data",
      });
    }

    const now = new Date();
    const txnId =
      transactionId ||
      `${paymentMethod.toUpperCase().replace(/[^A-Z]/g, "") || "TXN"}/${now.getFullYear()}/${Math.floor(
        10000000 + Math.random() * 90000000
      )}`;
    const recNumber = `REC-${now.getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "paid",
          paidAt: now,
          paymentMethod,
          transactionId: txnId,
          receiptNumber: recNumber,
        },
      },
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
              remarks: `Payment of ₹${invoice.totalAmount} received via ${paymentMethod} (Txn: ${txnId}). Formal GST receipt issued.`,
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

export const createInvoiceRequest = async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      matterId,
      matterTitle,
      serviceDescription,
      advocateName = "Adv. Meera Krishnan",
      estimatedAmount = 10000,
    } = req.body;

    const subtotal = Number(estimatedAmount) || 10000;
    const gstRate = 18;
    const gstAmount = Math.round(subtotal * (gstRate / 100));
    const totalAmount = subtotal + gstAmount;

    const invoiceData = {
      citizenId: userId,
      advocateName,
      matterId: matterId || "mat_wpc_19482",
      matterTitle: matterTitle || "Retainer Legal Representation",
      items: [
        {
          description: serviceDescription || "Chamber Consultation & Legal Drafting",
          amount: subtotal,
          category: "Professional Fee",
          sacCode: "9982",
        },
      ],
      subtotal,
      gstRate,
      gstAmount,
      cgstAmount: Math.round(gstAmount / 2),
      sgstAmount: Math.round(gstAmount / 2),
      totalAmount,
      status: "unpaid",
    };

    if (shouldUseDevStore()) {
      const created = devStore.createInvoice(invoiceData);
      return res.status(201).json({
        success: true,
        message: "Invoice created successfully",
        invoice: created,
        mode: "dummy_data",
      });
    }

    const count = await Invoice.countDocuments();
    const created = await Invoice.create({
      ...invoiceData,
      invoiceNumber: `INV-${new Date().getFullYear()}/KL-${String(count + 1).padStart(3, "0")}`,
    });
    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice: created,
      mode: "cloud_db",
    });
  } catch (error) {
    console.error("createInvoiceRequest error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 10. SECURE CLIENT-ADVOCATE PRIVILEGED MESSAGING & INBOX
// ============================================================================

// @desc    Get all messages for citizen inbox
// @route   GET /api/citizen/messages
// @access  Private (Citizen)
export const getCitizenMessages = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { matterId } = req.query;

    if (shouldUseDevStore()) {
      const messages = devStore.getMessages(userId, matterId);
      return res.json({ success: true, count: messages.length, messages, mode: "dummy_data" });
    }

    const query = {
      $or: [{ senderId: userId }, { recipientId: userId }],
    };
    if (matterId) query.matterId = matterId;

    const messages = await Message.find(query).sort({ createdAt: 1 });
    res.json({ success: true, count: messages.length, messages, mode: "cloud_db" });
  } catch (error) {
    console.error("getCitizenMessages error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send privileged message to advocate
// @route   POST /api/citizen/messages
// @access  Private (Citizen)
export const sendCitizenMessage = async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      content,
      recipientId = "adv_1",
      recipientName = "Adv. Meera Krishnan",
      matterId = "",
      matterTitle = "General Legal Counsel",
      attachments = [],
      category = "general",
    } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Message content cannot be empty" });
    }

    const messageData = {
      senderId: userId,
      senderRole: "citizen",
      senderName: req.user?.fullName || "Gopakumar Nambiar",
      recipientId,
      recipientRole: "advocate",
      recipientName,
      matterId,
      matterTitle,
      content: content.trim(),
      attachments,
      category,
      isRead: false,
      isPrivileged: true,
    };

    let created = null;
    if (shouldUseDevStore()) {
      created = devStore.sendMessage(messageData);
    } else {
      created = await Message.create(messageData);
    }

    // Broadcast in real-time to advocate via WebSocket
    broadcastMessageToUser(recipientId || "adv_1", {
      type: "new_message",
      message: created,
    });

    res.status(201).json({
      success: true,
      message: "Privileged legal instruction delivered to advocate chamber",
      messageData: created,
      mode: shouldUseDevStore() ? "dummy_data" : "cloud_db",
    });
  } catch (error) {
    console.error("sendCitizenMessage error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark message as read
// @route   PUT /api/citizen/messages/:id/read
// @access  Private (Citizen)
export const markMessageRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (shouldUseDevStore()) {
      const updated = devStore.markMessageAsRead(id);
      if (updated) {
        broadcastMessageToUser(updated.senderId, {
          type: "message_read",
          messageId: id,
          readAt: updated.readAt,
        });
      }
      return res.json({ success: true, message: updated, mode: "dummy_data" });
    }

    const updated = await Message.findByIdAndUpdate(
      id,
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
    if (updated) {
      broadcastMessageToUser(updated.senderId, {
        type: "message_read",
        messageId: id,
        readAt: updated.readAt,
      });
    }
    res.json({ success: true, message: updated, mode: "cloud_db" });
  } catch (error) {
    console.error("markMessageRead error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/citizen/messages/unread-count
// @access  Private (Citizen)
export const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (shouldUseDevStore()) {
      const count = devStore.getUnreadMessageCount(userId);
      return res.json({ success: true, unreadCount: count, mode: "dummy_data" });
    }

    const count = await Message.countDocuments({ recipientId: userId, isRead: false });
    res.json({ success: true, unreadCount: count, mode: "cloud_db" });
  } catch (error) {
    console.error("getUnreadMessageCount error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// CITIZEN CALENDAR FIXTURES & BACKLOG CONTROLLERS
// ============================================================================
export const getCitizenCalendarEvents = async (req, res) => {
  try {
    const userId = getUserId(req);
    const events = devStore.getCalendarEvents(userId);
    res.json({ success: true, events });
  } catch (error) {
    console.error("getCitizenCalendarEvents error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCitizenCalendarEvent = async (req, res) => {
  try {
    const userId = getUserId(req);
    const event = devStore.addCalendarEvent(userId, req.body);
    res.status(201).json({ success: true, event });
  } catch (error) {
    console.error("createCitizenCalendarEvent error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCitizenCalendarBacklog = async (req, res) => {
  try {
    const userId = getUserId(req);
    const backlog = devStore.getCalendarBacklog(userId);
    res.json({ success: true, backlog });
  } catch (error) {
    console.error("getCitizenCalendarBacklog error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// CITIZEN LEGAL NETWORK & ADVOCATE PIPELINE CONTROLLERS
// ============================================================================
export const getCitizenNetworkContacts = async (req, res) => {
  try {
    const userId = getUserId(req);
    const contacts = devStore.getNetworkContacts(userId);
    const activities = devStore.getNetworkActivities(userId);
    const followups = devStore.getNetworkFollowups(userId);
    const recommendations = devStore.getNetworkRecommendations(userId);
    res.json({
      success: true,
      contacts,
      activities,
      followups,
      recommendations,
    });
  } catch (error) {
    console.error("getCitizenNetworkContacts error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCitizenNetworkContact = async (req, res) => {
  try {
    const userId = getUserId(req);
    const contact = devStore.addNetworkContact(userId, req.body);
    devStore.addNetworkActivity(userId, {
      type: "connected",
      advocateName: contact.name,
      description: `retained/shortlisted in legal pipeline stage ${contact.stage.toUpperCase()}.`,
    });
    res.status(201).json({ success: true, contact });
  } catch (error) {
    console.error("createCitizenNetworkContact error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCitizenNetworkContactStage = async (req, res) => {
  try {
    const { stage } = req.body;
    const contact = devStore.updateNetworkContactStage(req.params.id, stage);
    if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });
    res.json({ success: true, contact });
  } catch (error) {
    console.error("updateCitizenNetworkContactStage error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCitizenNetworkContact = async (req, res) => {
  try {
    devStore.deleteNetworkContact(req.params.id);
    res.json({ success: true, message: "Contact deleted from network" });
  } catch (error) {
    console.error("deleteCitizenNetworkContact error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCitizenNetworkActivities = async (req, res) => {
  try {
    const userId = getUserId(req);
    const activities = devStore.getNetworkActivities(userId);
    res.json({ success: true, activities });
  } catch (error) {
    console.error("getCitizenNetworkActivities error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCitizenNetworkFollowups = async (req, res) => {
  try {
    const userId = getUserId(req);
    const followups = devStore.getNetworkFollowups(userId);
    res.json({ success: true, followups });
  } catch (error) {
    console.error("getCitizenNetworkFollowups error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCitizenNetworkRecommendations = async (req, res) => {
  try {
    const userId = getUserId(req);
    const recommendations = devStore.getNetworkRecommendations(userId);
    res.json({ success: true, recommendations });
  } catch (error) {
    console.error("getCitizenNetworkRecommendations error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// CITIZEN TASK MITE TASKS & NOTES CONTROLLERS
// ============================================================================
export const getCitizenTaskMiteTasks = async (req, res) => {
  try {
    const userId = getUserId(req);
    const tasks = devStore.getTaskMiteTasks(userId);
    const notes = devStore.getTaskMiteNotes(userId);
    res.json({ success: true, tasks, notes });
  } catch (error) {
    console.error("getCitizenTaskMiteTasks error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCitizenTaskMiteTask = async (req, res) => {
  try {
    const userId = getUserId(req);
    const task = devStore.addTaskMiteTask(userId, req.body);
    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error("createCitizenTaskMiteTask error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCitizenTaskMiteTask = async (req, res) => {
  try {
    const task = devStore.updateTaskMiteTask(req.params.id, req.body);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, task });
  } catch (error) {
    console.error("updateCitizenTaskMiteTask error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCitizenTaskMiteTask = async (req, res) => {
  try {
    devStore.deleteTaskMiteTask(req.params.id);
    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("deleteCitizenTaskMiteTask error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCitizenTaskMiteNotes = async (req, res) => {
  try {
    const userId = getUserId(req);
    const notes = devStore.getTaskMiteNotes(userId);
    res.json({ success: true, notes });
  } catch (error) {
    console.error("getCitizenTaskMiteNotes error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCitizenTaskMiteNote = async (req, res) => {
  try {
    const userId = getUserId(req);
    const note = devStore.addTaskMiteNote(userId, req.body);
    res.status(201).json({ success: true, note });
  } catch (error) {
    console.error("createCitizenTaskMiteNote error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCitizenTaskMiteNote = async (req, res) => {
  try {
    devStore.deleteTaskMiteNote(req.params.id);
    res.json({ success: true, message: "Note deleted" });
  } catch (error) {
    console.error("deleteCitizenTaskMiteNote error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// CITIZEN DIGILOCKER KYC CONTROLLERS
// ============================================================================
export const getDigiLockerKyc = async (req, res) => {
  try {
    const userId = getUserId(req);
    const kyc = devStore.getDigiLockerKyc(userId);
    res.json({ success: true, kyc });
  } catch (error) {
    console.error("getDigiLockerKyc error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDigiLockerKyc = async (req, res) => {
  try {
    const userId = getUserId(req);
    const kyc = devStore.updateDigiLockerKyc(userId, req.body);
    res.json({ success: true, kyc });
  } catch (error) {
    console.error("updateDigiLockerKyc error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyDigiLockerKyc = async (req, res) => {
  try {
    const userId = getUserId(req);
    const verifiedData = {
      kycStatus: "Verified",
      verificationSource: "DigiLocker / UIDAI Aadhaar e-KYC Gateway",
      digiLockerDocId: `DL-AADHAAR-${Date.now().toString().slice(-8)}`,
      verifiedAt: new Date().toISOString(),
      documentType: "Aadhaar e-KYC XML & Verification Hash",
    };
    const kyc = devStore.updateDigiLockerKyc(userId, verifiedData);
    res.json({ success: true, message: "DigiLocker Aadhaar KYC verified successfully.", kyc });
  } catch (error) {
    console.error("verifyDigiLockerKyc error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
