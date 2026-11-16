import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { DEFAULT_DUE_DILIGENCE_AUDITS } from "./seedDueDiligence.js";
import { DEFAULT_STATUTORY_NOTICES } from "./seedNotices.js";
import { DEFAULT_MDP_FIRM_GOVERNANCE } from "./seedMdpGovernance.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../../data");

const ensureFile = (filename, defaultContent = []) => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
  }
  return filePath;
};

const readFile = (filename, defaultContent = []) => {
  const filePath = ensureFile(filename, defaultContent);
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch {
    return defaultContent;
  }
};

const writeFile = (filename, data) => {
  const filePath = ensureFile(filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// ============================================================================
// DEFAULT SEED DUMMY DATA FOR CITIZEN PORTAL
// ============================================================================
const DEFAULT_MATTERS = [];
const DEFAULT_GRIEVANCES = [];
const DEFAULT_CONSULTATIONS = [];
const DEFAULT_DOCUMENTS = [];
const DEFAULT_NOTICES = [];
const DEFAULT_ADVOCATES = [];
const DEFAULT_CAUSE_LIST = [];
const DEFAULT_INVOICES = [];
const DEFAULT_CASE_NOTES = [];
const DEFAULT_ADVOCATE_PROFILES = [];
const DEFAULT_MESSAGES = [];
const DEFAULT_CLIENTS = [];
const DEFAULT_DICTATIONS = [];
const DEFAULT_TRUST_TRANSACTIONS = [];
const DEFAULT_EXPENSES = [];
const DEFAULT_ASSOCIATES = [];
const DEFAULT_CHAMBER_REPORTS = [];

export const parseNotificationEpoch = (record) => {
  const candidates = [
    record?.updatedAt,
    record?.createdAt,
    record?.scheduledDate,
    record?.courtDate,
    record?.date,
  ];
  for (const c of candidates) {
    if (c) {
      const t = new Date(c).getTime();
      if (!Number.isNaN(t) && t > 0) return t;
    }
  }
  const rawId = String(record?._id || record?.id || "");
  const m = rawId.match(/(\d{10,13})/);
  if (m) {
    const num = Number(m[1]);
    if (!Number.isNaN(num) && num > 0) return m[1].length === 10 ? num * 1000 : num;
  }
  return Date.now();
};

export const formatRelativeTime = (epochMs) => {
  if (!epochMs) return "Recently";
  const diffMs = Math.max(0, Date.now() - epochMs);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(epochMs).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/** Build sorted, deduplicated chamber notifications covering client leads, petitions, consultations, filings, messages, and causelist items. */
export const buildAdvocateNotifications = ({
  leads = [],
  matters = [],
  consultations = [],
  documents = [],
  messages = [],
  causeList = [],
  readIds = [],
  dismissedIds = [],
}) => {
  const readSet = new Set((readIds || []).map(String));
  const dismissedSet = new Set((dismissedIds || []).map(String));
  const matterById = new Map();
  const matterByGrievanceId = new Map();

  for (const m of matters) {
    const mid = String(m._id || m.id || "");
    if (mid) matterById.set(mid, m);
    if (m.grievanceId) matterByGrievanceId.set(String(m.grievanceId), m);
  }

  const items = [];
  const pushItem = (item) => {
    if (!item?.id || dismissedSet.has(String(item.id))) return;
    items.push({
      ...item,
      isRead: readSet.has(String(item.id)),
      timestamp: formatRelativeTime(item.epochMs),
    });
  };

  for (const g of leads) {
    const gid = String(g._id || g.id || "");
    if (!gid) continue;
    const hasLinkedMatter =
      matterByGrievanceId.has(gid) || (g.linkedMatterId && matterById.has(String(g.linkedMatterId)));
    if (hasLinkedMatter && g.status === "matter_opened") continue;

    const clientName = g.citizenName || g.clientName || "Citizen Client";
    const isDirectInterest = Boolean(g.assignedAdvocateId || g.assignedAdvocateName);
    const epochMs = parseNotificationEpoch(g);

    pushItem({
      id: `notif_lead_${gid}`,
      sourceId: gid,
      sourceType: "lead",
      type: isDirectInterest ? "warning" : "info",
      category: "client_interest",
      categoryLabel: isDirectInterest ? "Client Engaged You" : "Client Interest Lead",
      title: isDirectInterest
        ? `Client Interest: ${clientName} selected you`
        : `New Client Lead: ${clientName}`,
      summary: `${g.title || "Legal representation request"} • ${g.category || "General Legal"} (${g.preferredCourt || "Kerala Courts"})`,
      clientName,
      clientEmail: g.citizenEmail || "",
      caseRef: g.category || "Intake Lead",
      priority: String(g.urgencyLevel || "").toLowerCase() === "high" ? "high" : "normal",
      actionLabel: "Review Lead",
      targetTab: "matters",
      epochMs,
      createdAt: new Date(epochMs).toISOString(),
    });
  }

  for (const m of matters) {
    const mid = String(m._id || m.id || "");
    if (!mid) continue;
    const clientName = m.citizenName || m.clientName || m.petitioner || "Citizen Client";
    const titleText = m.matterTitle || m.title || m.caseTitle || m.caseNumber || "Client Petition";
    const epochMs = parseNotificationEpoch(m);

    pushItem({
      id: `notif_matter_${mid}`,
      sourceId: mid,
      sourceType: "matter",
      type: "success",
      category: "client_interest",
      categoryLabel: m.grievanceId ? "Client Engaged You" : "Client Petition",
      title: `Client Petition: ${clientName} — ${titleText}`,
      summary: `${m.matterType || "Civil / Family Litigation"} • ${m.courtForum || "Court Registry"}${m.caseNumber ? ` (${m.caseNumber})` : ""}`,
      clientName,
      clientEmail: m.citizenEmail || "",
      caseRef: m.caseNumber || m.cnrNumber || m.matterType || "Petition",
      priority: "high",
      actionLabel: "View Petition",
      targetTab: "matters",
      epochMs,
      createdAt: new Date(epochMs).toISOString(),
    });
  }

  for (const c of consultations) {
    const cid = String(c._id || c.id || "");
    if (!cid || c.status === "cancelled") continue;
    const clientName = c.citizenName || c.clientName || "Citizen Client";
    const epochMs = parseNotificationEpoch(c);
    const dateLabel = c.scheduledDate
      ? new Date(c.scheduledDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "Upcoming";
    const modeLabel =
      c.consultationType === "video"
        ? "Video Consult"
        : c.consultationType === "chamber"
        ? "Chamber Visit"
        : "Phone Consult";

    pushItem({
      id: `notif_cons_${cid}`,
      sourceId: cid,
      sourceType: "consultation",
      type: "warning",
      category: "client_interest",
      categoryLabel: "Consultation Interest",
      title: `Consultation Request: ${clientName}`,
      summary: `${c.subject || "Legal Consultation"} • ${dateLabel}${c.timeSlot ? ` (${c.timeSlot})` : ""}`,
      clientName,
      clientEmail: c.citizenEmail || "",
      caseRef: modeLabel,
      priority: "high",
      actionLabel: "Open Appointments",
      targetTab: "appointments",
      epochMs,
      createdAt: new Date(epochMs).toISOString(),
    });
  }

  for (const d of documents) {
    const did = String(d._id || d.id || "");
    if (!did) continue;
    const isClientFiling =
      Boolean(d.citizenId) || d.subType === "document-filing" || Boolean(d.citizenName);
    if (!isClientFiling) continue;
    const clientName = d.citizenName || "Citizen Client";
    const docName = d.name || d.fileName || "Filed Document";
    const epochMs = parseNotificationEpoch(d);

    pushItem({
      id: `notif_doc_${did}`,
      sourceId: did,
      sourceType: "document",
      type: "info",
      category: "filings",
      categoryLabel: d.subType === "document-filing" ? "Client Document Filing" : "Client Vault Upload",
      title: `Client Filing: ${docName}`,
      summary: `Submitted by ${clientName} • ${d.matter || d.category || "Case Filing"}`,
      clientName,
      clientEmail: d.citizenEmail || "",
      caseRef: d.matter || d.category || "Document Filing",
      priority: "normal",
      actionLabel: "Open Vault",
      targetTab: "vault",
      epochMs,
      createdAt: new Date(epochMs).toISOString(),
    });
  }

  const unreadByCitizen = new Map();
  for (const msg of messages) {
    const isInbound = msg.recipientRole === "advocate" || !msg.senderRole || msg.senderRole === "citizen";
    if (!isInbound || msg.isRead) continue;
    const cid = String(msg.citizenId || msg.senderId || "unknown");
    const epochMs = parseNotificationEpoch(msg);
    const existing = unreadByCitizen.get(cid);
    if (!existing) {
      unreadByCitizen.set(cid, { latest: msg, count: 1, epochMs });
    } else {
      existing.count += 1;
      if (epochMs > existing.epochMs) {
        existing.latest = msg;
        existing.epochMs = epochMs;
      }
    }
  }
  for (const [cid, entry] of unreadByCitizen.entries()) {
    const msg = entry.latest;
    const clientName = msg.citizenName || msg.senderName || "Citizen Client";
    const msgId = String(msg._id || msg.id || cid);
    const bodyText = String(msg.text || msg.content || msg.message || "Sent a message").trim();

    pushItem({
      id: `notif_msg_${msgId}`,
      sourceId: msgId,
      sourceType: "message",
      type: "info",
      category: "client_interest",
      categoryLabel: entry.count > 1 ? `${entry.count} Unread Client Messages` : "Client Message",
      title: `Message from ${clientName}`,
      summary: `${msg.matterTitle ? `${msg.matterTitle}: ` : ""}${bodyText.slice(0, 110)}`,
      clientName,
      caseRef: msg.matterTitle || "Direct Message",
      priority: "high",
      actionLabel: "Reply",
      targetTab: "messages",
      epochMs: entry.epochMs,
      createdAt: new Date(entry.epochMs).toISOString(),
    });
  }

  for (const c of causeList) {
    const cid = String(c._id || c.id || "");
    if (!cid) continue;
    const epochMs = parseNotificationEpoch(c);

    pushItem({
      id: `notif_cl_${cid}`,
      sourceId: cid,
      sourceType: "causelist",
      type: "warning",
      category: "causelist",
      categoryLabel: "Court Causelist",
      title: `Causelist: ${c.caseNumber || c.matterTitle || "Listed Hearing"}`,
      summary: `${c.courtHall || c.courtName || "Court Registry"} • ${c.stage || c.callingStatus || "Listed for Hearing"}`,
      clientName: c.petitioner || "",
      caseRef: c.caseNumber || c.cnrNumber || "Causelist",
      priority: "high",
      actionLabel: "View Causelist",
      targetTab: "causelist",
      epochMs,
      createdAt: new Date(epochMs).toISOString(),
    });
  }

  items.sort((a, b) => (b.epochMs || 0) - (a.epochMs || 0));
  return items;
};

export const buildCitizenNotifications = ({
  grievances = [],
  matters = [],
  consultations = [],
  notices = [],
  documents = [],
  invoices = [],
  messages = [],
  userId = "",
  readIds = [],
  dismissedIds = [],
}) => {
  const readSet = new Set((readIds || []).map(String));
  const dismissedSet = new Set((dismissedIds || []).map(String));
  const items = [];

  const pushItem = (item) => {
    if (!item?.id || dismissedSet.has(String(item.id))) return;
    items.push({
      ...item,
      isRead: readSet.has(String(item.id)),
      timestamp: formatRelativeTime(item.epochMs),
    });
  };

  for (const m of matters) {
    const mid = String(m._id || m.id || "");
    if (!mid) continue;
    const epochMs = parseNotificationEpoch(m);
    const hasHearing = Boolean(m.nextHearingDate);
    pushItem({
      id: `cit_notif_matter_${mid}`,
      type: m.advocateName ? "success" : "info",
      category: hasHearing ? "hearings" : "filings",
      categoryLabel: hasHearing ? "Scheduled Hearing" : "Matter Filing",
      title: `${m.matterTitle || m.title || m.caseNumber || "Active Matter"}`,
      summary: `${m.courtForum || m.court || "Court Registry"}${m.advocateName ? ` • Counsel: ${m.advocateName}` : ""}${m.stage ? ` • ${m.stage}` : ""}`,
      caseRef: m.caseNumber || m.cnrNumber || m.matterType || "Matter",
      priority: hasHearing ? "high" : "normal",
      actionLabel: "Open Matter",
      epochMs,
    });
  }

  for (const c of consultations) {
    const cid = String(c._id || c.id || "");
    if (!cid || c.status === "cancelled") continue;
    const epochMs = parseNotificationEpoch(c);
    pushItem({
      id: `cit_notif_cons_${cid}`,
      type: c.status === "confirmed" ? "success" : "warning",
      category: "hearings",
      categoryLabel: "Chamber Consult",
      title: `Consultation with ${c.advocateName || "Counsel"}`,
      summary: `${c.subject || "Legal Consultation"}${c.timeSlot ? ` • ${c.timeSlot}` : ""} (${c.status || "Scheduled"})`,
      caseRef: c.consultationType || "Consultation",
      priority: "high",
      actionLabel: "View Consult",
      epochMs,
    });
  }

  for (const n of notices) {
    const nid = String(n._id || n.id || "");
    if (!nid) continue;
    const epochMs = parseNotificationEpoch(n);
    pushItem({
      id: `cit_notif_notice_${nid}`,
      type: "info",
      category: "notices",
      categoryLabel: n.noticeType || "Statutory Notice",
      title: n.title || `Legal Notice to ${n.recipientName || "Noticee"}`,
      summary: `${n.recipientName ? `To: ${n.recipientName} • ` : ""}${n.speedPostTrackingNumber ? `Speed Post: ${n.speedPostTrackingNumber}` : n.status || "Tracked Notice"}`,
      caseRef: n.speedPostTrackingNumber || "Notice",
      priority: "normal",
      actionLabel: "Track Notice",
      epochMs,
    });
  }

  for (const g of grievances) {
    const gid = String(g._id || g.id || "");
    if (!gid) continue;
    const epochMs = parseNotificationEpoch(g);
    pushItem({
      id: `cit_notif_griev_${gid}`,
      type: g.assignedAdvocateName ? "success" : "info",
      category: "filings",
      categoryLabel: g.assignedAdvocateName ? "Counsel Assigned" : "Petition Intake",
      title: g.title || "Submitted Legal Grievance",
      summary: `${g.category || "Legal Representation"}${g.assignedAdvocateName ? ` • Assigned to ${g.assignedAdvocateName}` : ""}`,
      caseRef: g.category || "Petition",
      priority: "normal",
      actionLabel: "View Petition",
      epochMs,
    });
  }

  for (const d of documents) {
    const did = String(d._id || d.id || "");
    if (!did) continue;
    const epochMs = parseNotificationEpoch(d);
    const isOrder =
      String(d.category || "").toLowerCase().includes("order") ||
      String(d.subType || "").toLowerCase().includes("order");
    pushItem({
      id: `cit_notif_doc_${did}`,
      type: isOrder ? "success" : "info",
      category: isOrder ? "orders" : "filings",
      categoryLabel: d.category || "Vault Document",
      title: d.name || d.title || d.fileName || "Document Filed",
      summary: `${d.matter ? `${d.matter} • ` : ""}${d.filingStatus || "Stored in Vault"}`,
      caseRef: d.matter || "Document Vault",
      priority: isOrder ? "high" : "normal",
      actionLabel: "Open Vault",
      epochMs,
    });
  }

  for (const inv of invoices) {
    const iid = String(inv._id || inv.id || "");
    if (!iid || inv.status === "paid") continue;
    const epochMs = parseNotificationEpoch(inv);
    pushItem({
      id: `cit_notif_inv_${iid}`,
      type: "warning",
      category: "notices",
      categoryLabel: "Fee Statement",
      title: `Invoice from ${inv.advocateName || "Counsel"}`,
      summary: `${inv.matterTitle || "Legal Representation"} • ₹${Number(inv.totalAmount || 0).toLocaleString("en-IN")} (${inv.status || "unpaid"})`,
      caseRef: inv.invoiceNumber || "Invoice",
      priority: "high",
      actionLabel: "View Billing",
      epochMs,
    });
  }

  for (const msg of messages) {
    if (msg.isRead) continue;
    if (userId && String(msg.recipientId) !== String(userId) && msg.senderRole === "citizen") continue;
    const mid = String(msg._id || msg.id || "");
    if (!mid) continue;
    const epochMs = parseNotificationEpoch(msg);
    pushItem({
      id: `cit_notif_msg_${mid}`,
      type: "info",
      category: "orders",
      categoryLabel: "Counsel Message",
      title: `Message from ${msg.senderName || "Counsel"}`,
      summary: `${msg.matterTitle ? `${msg.matterTitle}: ` : ""}${String(msg.content || "").slice(0, 110)}`,
      caseRef: msg.matterTitle || "Privileged Message",
      priority: "high",
      actionLabel: "Reply",
      epochMs,
    });
  }

  items.sort((a, b) => (b.epochMs || 0) - (a.epochMs || 0));
  return items;
};

// ============================================================================
// DEV STORE REPOSITORY
// ============================================================================
export const devStore = {
  // --- Users ---
  getUsers() {
    return readFile("dev_users.json", []);
  },

  async createUser({ fullName, email, password, role, verifyMethod, ...rest }) {
    const users = this.getUsers();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const normalizedEmail = email.toLowerCase().trim();

    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    const cleanRole = ["advocate", "client", "citizen", "cs", "ca"].includes(role) ? role : "citizen";

    if (existingIndex !== -1) {
      users[existingIndex] = {
        ...users[existingIndex],
        fullName: fullName || users[existingIndex].fullName,
        password: hashedPassword,
        role: cleanRole,
        verifyMethod: verifyMethod || users[existingIndex].verifyMethod || "email",
        ...rest,
      };
      writeFile("dev_users.json", users);
      return users[existingIndex];
    }

    const newUser = {
      _id: "dev_" + Date.now().toString(),
      fullName: fullName || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password: hashedPassword,
      role: cleanRole,
      verifyMethod: verifyMethod || "email",
      isVerified: false,
      ...rest,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeFile("dev_users.json", users);
    return newUser;
  },

  updateUserRole(email, role) {
    const users = this.getUsers();
    const normalizedEmail = email.toLowerCase().trim();
    const idx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
    if (idx !== -1 && role) {
      users[idx].role = ["advocate", "client", "citizen", "cs", "ca"].includes(role) ? role : "citizen";
      writeFile("dev_users.json", users);
      return users[idx];
    }
    return null;
  },

  findUserByEmail(email) {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async matchPassword(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  },

  // --- Citizen Profiles ---
  getCitizenProfile(userId) {
    const profiles = readFile("dev_citizen_profiles.json", []);
    let profile = profiles.find((p) => p.userId === userId);
    if (!profile) {
      const user = this.getUserById(userId);
      const userFullName = user?.fullName || user?.name || "";
      const userUsername = user?.username || (user?.email ? user.email.split("@")[0] : "");
      profile = {
        userId,
        username: userUsername,
        fullName: userFullName,
        email: user?.email || "",
        phone: user?.phone || "",
        alternatePhone: "",
        address: {
          street: "",
          city: "",
          district: "",
          state: "Kerala",
          pincode: "",
        },
        preferredLanguage: "en",
        emergencyContact: {
          name: "",
          relationship: "",
          phone: "",
        },
        kycVerified: false,
        notificationPreferences: {
          whatsapp: true,
          email: true,
          inApp: true,
          courtHearingAlerts: true,
        },
      };
      profiles.push(profile);
      writeFile("dev_citizen_profiles.json", profiles);
    }
    return profile;
  },

  updateCitizenProfile(userId, updates) {
    const profiles = readFile("dev_citizen_profiles.json", []);
    const idx = profiles.findIndex((p) => p.userId === userId);
    let updated;
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...updates };
      writeFile("dev_citizen_profiles.json", profiles);
      updated = profiles[idx];
    } else {
      const newProfile = { userId, ...updates };
      profiles.push(newProfile);
      writeFile("dev_citizen_profiles.json", profiles);
      updated = newProfile;
    }
    if (updates.fullName || updates.username) {
      const users = this.getUsers();
      const uIdx = users.findIndex((u) => u._id === userId || u.id === userId);
      if (uIdx !== -1) {
        if (updates.fullName) users[uIdx].fullName = updates.fullName;
        if (updates.username) users[uIdx].username = updates.username;
        writeFile("dev_users.json", users);
      }
    }
    return updated;
  },

  // --- Grievances / Legal Problem Intake ---
  getGrievances(userId) {
    const grvs = readFile("dev_grievances.json", DEFAULT_GRIEVANCES);
    if (!userId) return [];
    return grvs.filter((g) => g.citizenId === userId || g.userId === userId);
  },

  getGrievanceById(id) {
    const grvs = readFile("dev_grievances.json", DEFAULT_GRIEVANCES);
    return grvs.find((g) => g._id === id) || null;
  },

  addGrievance(data) {
    const grvs = readFile("dev_grievances.json", DEFAULT_GRIEVANCES);
    const newGrv = {
      _id: "grv_" + Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    grvs.unshift(newGrv);
    writeFile("dev_grievances.json", grvs);

    // Auto-create initial pre-filing matter docket in dev_matters.json so the filed case immediately appears in Dashboard and My Legal Matters!
    const matters = readFile("dev_matters.json", DEFAULT_MATTERS);
    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const isWrit =
      (data.category || "").includes("Property") ||
      (data.category || "").includes("Writ") ||
      (data.category || "").includes("Constitutional");
    const casePrefix = isWrit ? "WP(C)" : "OS";
    const caseNumber = `${casePrefix} ${randomNum}/${year}`;
    const cnrNumber = `KLHC01-${Math.floor(100000 + Math.random() * 900000)}-${year}`;
    const citizenInfo = this.getCitizenDisplayInfo(data.citizenId);

    const hasDirectAdv = Boolean(data.advocateId);
    const directAdv = hasDirectAdv
      ? this.resolveAdvocateByIdOrName(data.advocateId, data.advocateName)
      : null;
    const initialAdvName = directAdv?.advocateName || data.advocateName || "Counsel Matching in Progress";

    const newMatter = {
      _id: "mat_" + Date.now().toString(),
      citizenId: data.citizenId || "default_citizen",
      citizenName: data.citizenName || citizenInfo.citizenName,
      citizenEmail: citizenInfo.citizenEmail,
      grievanceId: newGrv._id,
      advocateId: directAdv?.advocateId || data.advocateId || "",
      advocateName: initialAdvName,
      assignedAdvocate: initialAdvName,
      matterTitle: `${caseNumber} — ${data.title}`,
      title: `${caseNumber} — ${data.title}`,
      matterType: data.category || "Civil Litigation",
      caseNumber,
      cnrNumber,
      courtForum:
        data.preferredCourt ||
        (data.aiTriage && data.aiTriage.jurisdictionForum) ||
        "High Court of Kerala / District Court",
      court:
        data.preferredCourt ||
        (data.aiTriage && data.aiTriage.jurisdictionForum) ||
        "High Court of Kerala / District Court",
      courtHall: hasDirectAdv ? "Court Hall 2A" : "Registry Scrutiny Counter",
      status: hasDirectAdv ? "active" : "Pre Filing",
      filingDate: new Date().toISOString().split("T")[0],
      nextHearingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      statutoryActs: data.aiTriage?.applicableActs || [
        "Specific Relief Act, 1963",
        "Constitution of India Article 226",
      ],
      timeline: [
        {
          date: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          title: "Legal Grievance & Pre-Filing Intake Submitted",
          remarks: `Initial case particulars cataloged for ${caseNumber}. Pre-filing statutory assessment completed.`,
          stage: "Completed",
        },
      ],
      totalFeesBilled: 0,
      feesPaid: 0,
    };
    matters.unshift(newMatter);
    writeFile("dev_matters.json", matters);

    newGrv.linkedMatterId = newMatter._id;
    newGrv.caseNumber = caseNumber;
    writeFile("dev_grievances.json", grvs);

    return { ...newGrv, matter: newMatter };
  },

  matchAdvocateToGrievance(grievanceId, advocateId, citizenId = "") {
    const grvs = readFile("dev_grievances.json", DEFAULT_GRIEVANCES);
    const index = grvs.findIndex((g) => g._id === grievanceId);
    if (index === -1) return null;

    const advocates = this.getAdvocates();
    const directAdv = advocates.find(
      (a) => a.id === advocateId || a._id === advocateId || a.userId === advocateId
    );
    const resolvedAdv = directAdv
      ? {
          advocateId: directAdv.id || directAdv._id || directAdv.userId,
          advocateName: directAdv.fullName,
          primaryCourt: directAdv.primaryCourt,
        }
      : this.resolveAdvocateByIdOrName(advocateId);
    const advocate = directAdv || {
      id: resolvedAdv.advocateId,
      fullName: resolvedAdv.advocateName,
      primaryCourt: "High Court of Kerala (Ernakulam)",
    };
    const citizenInfo = this.getCitizenDisplayInfo(grvs[index].citizenId || citizenId);

    grvs[index].assignedAdvocateId = advocate.id;
    grvs[index].assignedAdvocateName = advocate.fullName;
    if (!grvs[index].citizenName) grvs[index].citizenName = citizenInfo.citizenName;
    grvs[index].status = "matter_opened";
    writeFile("dev_grievances.json", grvs);

    // Auto-create or update active matter in dev_matters.json so it immediately appears in My Matters
    const matters = readFile("dev_matters.json", DEFAULT_MATTERS);
    const existing = matters.find((m) => m.grievanceId === grievanceId);
    if (existing) {
      existing.advocateId = advocate.id;
      existing.advocateName = advocate.fullName;
      existing.assignedAdvocate = advocate.fullName;
      existing.status = "active";
      if (!existing.citizenId && (grvs[index].citizenId || citizenId)) {
        existing.citizenId = grvs[index].citizenId || citizenId;
      }
      existing.courtForum = existing.courtForum || advocate.primaryCourt || "High Court of Kerala (Ernakulam)";
      existing.court = existing.courtForum;
      existing.timeline = existing.timeline || [];
      existing.timeline.unshift({
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        title: "Counsel Engaged & Retained",
        remarks: `Retained ${advocate.fullName} for formal legal representation. Consultation and vakalatnama scheduled.`,
        stage: "Completed",
      });
      existing.totalFeesBilled = advocate.consultationFee ? advocate.consultationFee * 10 : 25000;
      writeFile("dev_matters.json", matters);
      grvs[index].linkedMatterId = existing._id;
      writeFile("dev_grievances.json", grvs);
      return { grievance: grvs[index], matter: existing, advocate };
    }

    if (!existing) {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const isWrit = grvs[index].category?.includes("Property") || grvs[index].category?.includes("Writ");
      const casePrefix = isWrit ? "WP(C)" : "OS";
      const caseNumber = `${casePrefix} ${randomNum}/${year}`;
      const cnrNumber = `KLHC01-${Math.floor(100000 + Math.random() * 900000)}-${year}`;

      const newMatter = {
        _id: "mat_" + Date.now().toString(),
        citizenId: grvs[index].citizenId || citizenId,
        citizenName: grvs[index].citizenName || citizenInfo.citizenName,
        citizenEmail: citizenInfo.citizenEmail,
        grievanceId: grvs[index]._id,
        advocateId: advocate.id,
        advocateName: advocate.fullName,
        matterTitle: `${caseNumber} — ${grvs[index].title}`,
        matterType: grvs[index].category || "Civil Litigation",
        caseNumber,
        cnrNumber,
        courtForum: grvs[index].preferredCourt || advocate.primaryCourt || "High Court of Kerala (Ernakulam)",
        courtHall: "Court Hall 2A",
        status: "active",
        nextHearingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        statutoryActs: grvs[index].aiTriage?.applicableActs || ["Specific Relief Act, 1963", "Constitution of India Article 226"],
        timeline: [
          {
            date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            title: "Legal Grievance Triaged & Counsel Engaged",
            remarks: `Initial consultation scheduled with ${advocate.fullName}. Preliminary case grounds drafted.`,
            stage: "Completed",
          },
          {
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            title: "Chamber Conference & Document Scrutiny",
            remarks: "Verification of title deeds, revenue extracts, and drafting of formal pleadings.",
            stage: "Scheduled",
          },
        ],
        totalFeesBilled: advocate.consultationFee ? advocate.consultationFee * 10 : 25000,
        feesPaid: 0,
      };

      matters.unshift(newMatter);
      writeFile("dev_matters.json", matters);
      grvs[index].linkedMatterId = newMatter._id;
      writeFile("dev_grievances.json", grvs);
      return { grievance: grvs[index], matter: newMatter, advocate };
    }

    return { grievance: grvs[index], matter: existing, advocate };
  },

  // --- Matters ---
  getMatters(userId) {
    if (!userId) return [];
    const uid = String(userId);
    const matters = readFile("dev_matters.json", []);
    return matters.filter(
      (m) =>
        String(m.citizenId || "") === uid ||
        String(m.userId || "") === uid ||
        String(m.clientId || "") === uid ||
        String(m.advocateId || "") === uid ||
        String(m.assignedAdvocateId || "") === uid ||
        (String(m.citizenId || "") === "default_citizen" && (uid.startsWith("dev_") || uid === "default_citizen"))
    );
  },

  getMatterById(id) {
    if (!id) return null;
    const cleanId = String(id).toLowerCase();
    const matters = readFile("dev_matters.json", []);
    return (
      matters.find(
        (m) =>
          String(m._id || m.id || "").toLowerCase() === cleanId ||
          (m.caseNumber && m.caseNumber.toLowerCase() === cleanId) ||
          (m.cnrNumber && m.cnrNumber.toLowerCase() === cleanId) ||
          (m.grievanceId && String(m.grievanceId).toLowerCase() === cleanId)
      ) || null
    );
  },

  updateMatter(id, updateData) {
    const matters = readFile("dev_matters.json", []);
    const index = matters.findIndex(
      (m) => m._id === id || (m.caseNumber && m.caseNumber.toLowerCase() === id.toLowerCase())
    );
    if (index === -1) return null;
    matters[index] = {
      ...matters[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    writeFile("dev_matters.json", matters);
    return matters[index];
  },

  addMatter(data) {
    const matters = readFile("dev_matters.json", []);
    const newMatter = {
      _id: "mat_" + Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    matters.unshift(newMatter);
    writeFile("dev_matters.json", matters);
    return newMatter;
  },

  addMatterQuery(matterId, queryData) {
    const matters = readFile("dev_matters.json", []);
    const index = matters.findIndex(
      (m) => m._id === matterId || (m.caseNumber && m.caseNumber.toLowerCase() === matterId.toLowerCase())
    );
    if (index === -1) return null;

    if (!matters[index].queries) {
      matters[index].queries = [];
    }

    const newQuery = {
      id: "qry_" + Date.now().toString(),
      type: queryData.type || "CLARIFICATION",
      title: queryData.title,
      description: queryData.description || "",
      requestedDocumentName: queryData.requestedDocumentName || null,
      status: queryData.status || "OPEN",
      raisedBy: {
        name: queryData.raisedBy?.name || "Practicing Professional",
        role: queryData.raisedBy?.role || "Engagement Lead",
        date: queryData.raisedBy?.date || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    matters[index].queries.unshift(newQuery);
    matters[index].updatedAt = new Date().toISOString();
    writeFile("dev_matters.json", matters);
    return { matter: matters[index], query: newQuery };
  },

  resolveMatterQuery(matterId, queryId, responseData) {
    const matters = readFile("dev_matters.json", []);
    const index = matters.findIndex(
      (m) => m._id === matterId || (m.caseNumber && m.caseNumber.toLowerCase() === matterId.toLowerCase())
    );
    if (index === -1) return null;

    if (!matters[index].queries) matters[index].queries = [];
    const qIndex = matters[index].queries.findIndex(
      (q) => q.id === queryId || q._id === queryId
    );
    if (qIndex === -1) return null;

    const currentQ = matters[index].queries[qIndex];
    currentQ.status = responseData.status || "RESOLVED";
    currentQ.clientResponse = {
      notes: responseData.notes || "",
      submittedAt: new Date().toISOString(),
      attachments: responseData.attachments || [],
    };
    currentQ.resolvedAt = new Date().toISOString();
    currentQ.resolutionNotes = responseData.resolutionNotes || responseData.notes || "";
    currentQ.updatedAt = new Date().toISOString();

    if (responseData.attachments && Array.isArray(responseData.attachments) && responseData.attachments.length > 0) {
      if (!matters[index].documents) matters[index].documents = [];
      for (const att of responseData.attachments) {
        matters[index].documents.push({
          name: att.name,
          size: att.size || "—",
          hash: att.hash || "",
          uploadedAt: new Date().toISOString(),
          source: "query_reupload",
          queryId: queryId,
        });
      }
    }

    matters[index].updatedAt = new Date().toISOString();
    writeFile("dev_matters.json", matters);
    return { matter: matters[index], query: currentQ };
  },

  authorizeMatter(matterId, authData) {
    const matters = readFile("dev_matters.json", []);
    const index = matters.findIndex(
      (m) => m._id === matterId || (m.caseNumber && m.caseNumber.toLowerCase() === matterId.toLowerCase())
    );
    if (index === -1) return null;

    const matter = matters[index];
    const authRecord = {
      authId: authData.authId || `ESIGN-${Date.now()}`,
      signMethod: authData.signMethod || "AADHAAR_ESIGN",
      signerName: authData.signerName || "Authorized Signatory",
      signerPanOrDin: authData.signerPanOrDin || "",
      signerAadhaarMasked: authData.signerAadhaarMasked || "",
      signerDesignation: authData.signerDesignation || "Director",
      espReference: authData.espReference || `ESP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: authData.timestamp || new Date().toISOString(),
      status: "AUTHORIZED",
      statutoryDeclarationAccepted: true,
      documentTitle: authData.documentTitle || "Statutory Board Consent & Filing Authorization",
      authHash: authData.authHash || "",
      legalSection: "Information Technology Act 2000 Section 3A & Second Schedule / Companies Act 2013 Section 448",
    };

    matter.clientAuthorization = authRecord;

    if (!matter.documents) matter.documents = [];
    const docTitleSlug = (authData.documentTitle || "Filing").replace(/[^a-zA-Z0-9]/g, "_");
    matter.documents.push({
      name: `Signed_Statutory_Consent_${docTitleSlug}.pdf`,
      size: "412 KB",
      hash: authRecord.authHash
        ? (authRecord.authHash.startsWith("sha256:") ? authRecord.authHash : `sha256:${authRecord.authHash.slice(0, 32)}`)
        : "",
      type: "application/pdf",
      uploadedAt: new Date().toISOString(),
      source: "client_aadhaar_esign",
    });

    if (Array.isArray(matter.stages) && matter.stages.length >= 3) {
      if (!matter.stages[2].done) {
        matter.stages[2].done = true;
        matter.stages[2].remarks = `Signed via ${authRecord.signMethod === "AADHAAR_ESIGN" ? "Aadhaar e-Sign" : "Class 3 DSC"} by ${authRecord.signerName}`;
        if (typeof matter.stageIndex === "number" && matter.stageIndex < 3) {
          matter.stageIndex = 3;
        }
      }
    }

    if (!matter.timeline) matter.timeline = [];
    matter.timeline.push({
      date: new Date().toISOString(),
      title: "Client Statutory Authorization Executed (Aadhaar e-Sign)",
      remarks: `Executed by ${authRecord.signerName} (${authRecord.signerDesignation}) via C-DAC ESP. Ref: ${authRecord.espReference}`,
      stage: "Completed",
    });

    matter.updatedAt = new Date().toISOString();
    writeFile("dev_matters.json", matters);
    return { matter, authorization: authRecord };
  },

  // --- Consultations ---
  getConsultations(userId) {
    const list = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    if (!userId) return [];
    return list.filter(
      (c) => c.citizenId === userId || c.userId === userId
    );
  },

  getConsultationById(id) {
    const list = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    return list.find((c) => c._id === id || c.id === id) || null;
  },

  addConsultation(data) {
    const cons = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    const roomCode = Math.floor(1000 + Math.random() * 9000);
    const resolvedAdv = this.resolveAdvocateByIdOrName(data.advocateId, data.advocateName);
    const citizenInfo = this.getCitizenDisplayInfo(data.citizenId);
    const finalType = data.consultationType || "video";
    const newCon = {
      _id: "con_" + Date.now().toString(),
      id: "con_" + Date.now().toString(),
      citizenId: data.citizenId || "",
      citizenName: data.citizenName || citizenInfo.citizenName,
      citizenEmail: data.citizenEmail || citizenInfo.citizenEmail,
      barCouncilNumber: data.barCouncilNumber || resolvedAdv.barCouncilNumber || "",
      consultationType: finalType,
      scheduledDate: data.scheduledDate || new Date().toISOString(),
      timeSlot: data.timeSlot || "10:30 AM - 11:15 AM",
      durationMinutes: Number(data.durationMinutes) || 45,
      meetingLink: finalType === "video" ? `https://meet.wakheel.law/chambers-room-${roomCode}` : "",
      chamberAddress: data.chamberAddress || "Chamber #412, KHCAA Golden Jubilee Complex, High Court Road, Kochi 682031",
      subject: data.subject || "Legal Consultation & Strategy Session",
      clientNotes: data.clientNotes || "",
      adviceNotes: "",
      feeAmount: Number(data.feeAmount) || 1500,
      paymentStatus: "paid",
      status: "scheduled",
      createdAt: new Date().toISOString(),
      ...data,
      advocateId: resolvedAdv.advocateId,
      advocateName: resolvedAdv.advocateName,
    };
    cons.unshift(newCon);
    writeFile("dev_consultations.json", cons);
    return newCon;
  },

  rescheduleConsultation(id, newDate, newTimeSlot, reason = "") {
    const cons = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    const idx = cons.findIndex((c) => c._id === id || c.id === id);
    if (idx === -1) return null;
    cons[idx].scheduledDate = new Date(newDate).toISOString();
    if (newTimeSlot) cons[idx].timeSlot = newTimeSlot;
    cons[idx].status = "rescheduled";
    cons[idx].rescheduleReason = reason;
    cons[idx].updatedAt = new Date().toISOString();
    writeFile("dev_consultations.json", cons);
    return cons[idx];
  },

  cancelConsultation(id, reason = "") {
    const cons = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    const idx = cons.findIndex((c) => c._id === id || c.id === id);
    if (idx === -1) return null;
    cons[idx].status = "cancelled";
    cons[idx].cancellationReason = reason;
    cons[idx].updatedAt = new Date().toISOString();
    writeFile("dev_consultations.json", cons);
    return cons[idx];
  },

  addConsultationNote(id, note) {
    const cons = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    const idx = cons.findIndex((c) => c._id === id || c.id === id);
    if (idx === -1) return null;
    cons[idx].clientNotes = (cons[idx].clientNotes ? cons[idx].clientNotes + "\n" : "") + note;
    cons[idx].updatedAt = new Date().toISOString();
    writeFile("dev_consultations.json", cons);
    return cons[idx];
  },

  // --- Documents & Vault ---
  getDocuments(userId, filter = {}) {
    const docs = readFile("dev_documents.json", DEFAULT_DOCUMENTS);
    if (!userId) return [];
    const userDocs = docs.filter((d) => d.citizenId === userId || d.userId === userId);
    return userDocs.filter((d) => {
      if (filter.subType && filter.subType !== "all") {
        if (filter.subType === "contracts" && d.category !== "Contract" && d.subType !== "contracts") return false;
        if (filter.subType === "certified-true-copies" && d.category !== "CTC" && d.subType !== "certified-true-copies") return false;
        if (filter.subType === "document-filing" && d.subType !== "document-filing" && d.category !== "Filing Receipt") return false;
        if (filter.subType === "case-diary" && d.subType !== "case-diary") return false;
      }
      if (filter.category && d.category && !d.category.toLowerCase().includes(filter.category.toLowerCase())) {
        return false;
      }
      if (filter.matter && d.matter && !d.matter.toLowerCase().includes(filter.matter.toLowerCase())) {
        return false;
      }
      if (filter.matterId && d.matterId && d.matterId !== filter.matterId) {
        return false;
      }
      return true;
    });
  },

  getDocumentById(id) {
    const docs = readFile("dev_documents.json", DEFAULT_DOCUMENTS);
    return docs.find((d) => d._id === id || d.id === id);
  },

  addDocument(data) {
    const docs = readFile("dev_documents.json", DEFAULT_DOCUMENTS);
    const id = data.id || data._id || "doc_" + Date.now().toString();
    const hasExplicitAdvocate = Boolean(
      (data.advocateId && String(data.advocateId).trim()) ||
      (data.advocateName && String(data.advocateName).trim())
    );
    let resolvedAdv = { advocateId: "", advocateName: "" };
    if (hasExplicitAdvocate) {
      resolvedAdv = this.resolveAdvocateByIdOrName(data.advocateId, data.advocateName);
    } else if (data.matterId) {
      const matters = readFile("dev_matters.json", []);
      const matchedMatter = matters.find((m) => m.id === data.matterId || m._id === data.matterId);
      if (
        matchedMatter &&
        (matchedMatter.assignedAdvocateId ||
          matchedMatter.advocateId ||
          matchedMatter.advocateName ||
          matchedMatter.assignedAdvocate)
      ) {
        resolvedAdv = this.resolveAdvocateByIdOrName(
          matchedMatter.assignedAdvocateId || matchedMatter.advocateId,
          matchedMatter.advocateName || matchedMatter.assignedAdvocate
        );
      }
    }
    const citizenInfo = this.getCitizenDisplayInfo(data.citizenId);
    const newDoc = {
      _id: id,
      id,
      citizenName: data.citizenName || citizenInfo.citizenName,
      citizenEmail: data.citizenEmail || citizenInfo.citizenEmail,
      name: data.name || data.fileName || "Document.pdf",
      fileName: data.fileName || data.name || "Document.pdf",
      category: data.category || "Evidence & Exhibits",
      subType: data.subType || "all",
      matter: data.matter || "General Legal Vault",
      size: data.size || data.fileSize || "1.2 MB",
      fileSize: data.fileSize || data.size || "1.2 MB",
      uploadDate: data.uploadDate || data.date || "Just now",
      date: data.date || data.uploadDate || "Just now",
      isSigned: data.isSigned !== undefined ? data.isSigned : true,
      pages: data.pages || 1,
      hash: data.hash || data.sha256Hash || `sha256:${Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      sha256Hash: data.sha256Hash || data.hash || `sha256:${Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      details: data.details || data.remarks || "Uploaded to secure vault",
      filingStatus: data.filingStatus || data.status || "Ready in Vault",
      status: data.status || data.filingStatus || "Ready in Vault",
      remarks: data.remarks || "",
      ...data,
      advocateId: resolvedAdv.advocateId,
      advocateName: resolvedAdv.advocateName,
      createdAt: new Date().toISOString(),
    };
    docs.unshift(newDoc);
    writeFile("dev_documents.json", docs);
    return newDoc;
  },

  updateDocument(id, updates) {
    const docs = readFile("dev_documents.json", DEFAULT_DOCUMENTS);
    const idx = docs.findIndex((d) => d._id === id || d.id === id);
    if (idx !== -1) {
      docs[idx] = { ...docs[idx], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_documents.json", docs);
      return docs[idx];
    }
    return null;
  },

  deleteDocument(id) {
    const docs = readFile("dev_documents.json", DEFAULT_DOCUMENTS);
    const filtered = docs.filter((d) => d._id !== id && d.id !== id);
    if (filtered.length !== docs.length) {
      writeFile("dev_documents.json", filtered);
      return true;
    }
    return false;
  },

  normalizeAdvocateName(name = "") {
    return String(name || "")
      .toLowerCase()
      .replace(/^adv\.?\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
  },

  getAdvocateRegistry() {
    const users = this.getUsers().filter(
      (u) => u.role === "advocate" || u.accountType === "independent_advocate"
    );
    const profiles = readFile("dev_advocate_profiles.json", DEFAULT_ADVOCATE_PROFILES);
    const directory = typeof this.getAdvocates === "function" ? this.getAdvocates() : [];
    const entries = [];

    for (const a of directory) {
      entries.push({
        id: String(a.id || a._id || a.userId || ""),
        userId: String(a.userId || a.id || a._id || ""),
        fullName: a.fullName || a.name || "",
        email: (a.email || "").toLowerCase().trim(),
        barCouncilNumber: a.barCouncilNumber || "",
      });
    }
    for (const p of profiles) {
      entries.push({
        id: String(p.userId || p._id || ""),
        userId: String(p.userId || p._id || ""),
        fullName: p.fullName || p.name || "",
        email: (p.email || "").toLowerCase().trim(),
        barCouncilNumber: p.barCouncilNumber || "",
      });
    }
    for (const u of users) {
      entries.push({
        id: String(u._id || u.id || ""),
        userId: String(u._id || u.id || ""),
        fullName: u.fullName || "",
        email: (u.email || "").toLowerCase().trim(),
        barCouncilNumber: u.barCouncilId || "",
      });
    }
    return entries;
  },

  getAdvocateIdentities(advocateId = "") {
    const ids = new Set(advocateId ? [String(advocateId)] : []);
    const names = new Set();
    const emails = new Set();
    let primaryName = "";
    const registry = advocateId ? this.getAdvocateRegistry() : [];

    const matchedEntries = registry.filter(
      (e) => e.id === String(advocateId) || e.userId === String(advocateId)
    );
    for (const entry of matchedEntries) {
      if (entry.id) ids.add(entry.id);
      if (entry.userId) ids.add(entry.userId);
      if (entry.email) emails.add(entry.email);
      const norm = this.normalizeAdvocateName(entry.fullName);
      if (norm) names.add(norm);
      if (!primaryName && entry.fullName) primaryName = entry.fullName;
    }

    // Match any sibling entries sharing the same normalized email or name
    for (const entry of registry) {
      const norm = this.normalizeAdvocateName(entry.fullName);
      if ((entry.email && emails.has(entry.email)) || (norm && names.has(norm))) {
        if (entry.id) ids.add(entry.id);
        if (entry.userId) ids.add(entry.userId);
      }
    }

    if (primaryName && !/^adv[\.\s]/i.test(primaryName)) {
      primaryName = `Adv. ${primaryName}`;
    }

    return {
      ids,
      names,
      emails,
      primaryName: primaryName || "Adv. Counsel",
      primaryEmail: Array.from(emails)[0] || "",
    };
  },

  resolveAdvocateByIdOrName(advocateId, advocateName) {
    const registry = this.getAdvocateRegistry();
    const cleanId = advocateId && String(advocateId).trim();
    const normInputName = this.normalizeAdvocateName(advocateName);

    // Prefer explicit ID match, unless a distinct advocateName was explicitly chosen
    if (cleanId) {
      const byId = registry.find((e) => e.id === cleanId || e.userId === cleanId);
      if (byId) {
        let formattedName = advocateName || byId.fullName || "Advocate";
        if (!/^adv[\.\s]/i.test(formattedName)) formattedName = `Adv. ${formattedName}`;
        return {
          advocateId: byId.id || cleanId,
          advocateName: formattedName,
          barCouncilNumber: byId.barCouncilNumber || "",
        };
      }
    }

    if (normInputName) {
      const byName = registry.find((e) => {
        const norm = this.normalizeAdvocateName(e.fullName);
        return norm && (norm === normInputName || norm.includes(normInputName) || normInputName.includes(norm));
      });
      if (byName) {
        let formattedName = advocateName || byName.fullName;
        if (!/^adv[\.\s]/i.test(formattedName)) formattedName = `Adv. ${formattedName}`;
        return {
          advocateId: byName.id || byName.userId || cleanId || "",
          advocateName: formattedName,
          barCouncilNumber: byName.barCouncilNumber || "",
        };
      }
      let formattedName = advocateName.trim();
      if (!/^adv[\.\s]/i.test(formattedName)) formattedName = `Adv. ${formattedName}`;
      return {
        advocateId: cleanId || `adv_name_${normInputName.replace(/\s+/g, "_")}`,
        advocateName: formattedName,
        barCouncilNumber: "",
      };
    }

    if (!cleanId && !normInputName) {
      return {
        advocateId: "",
        advocateName: "",
        barCouncilNumber: "",
      };
    }

    const fallback = this.getAdvocateIdentities(cleanId);
    const resolvedName =
      fallback.primaryName && fallback.primaryName !== "Adv. Counsel"
        ? fallback.primaryName
        : "";
    const resolvedEntry = registry.find((e) => e.id === cleanId || e.userId === cleanId);
    return {
      advocateId: cleanId || "",
      advocateName: resolvedName,
      barCouncilNumber: resolvedEntry?.barCouncilNumber || "",
    };
  },

  getCitizenDisplayInfo(citizenId) {
    if (!citizenId) {
      return { citizenName: "Registered Client", citizenEmail: "", citizenPhone: "" };
    }
    const profiles = readFile("dev_citizen_profiles.json", []);
    const profile = profiles.find((p) => p.userId === citizenId || p._id === citizenId);
    const user = this.getUsers().find((u) => u._id === citizenId || u.id === citizenId);
    return {
      citizenName: profile?.fullName || user?.fullName || (user?.username ? `@${user.username}` : citizenId),
      citizenEmail: profile?.email || user?.email || "",
      citizenPhone: profile?.phone || user?.phone || "",
    };
  },

  enrichWithCitizenInfo(record) {
    if (!record) return record;
    const info = this.getCitizenDisplayInfo(record.citizenId || record.userId);
    return {
      ...record,
      citizenName: record.citizenName || info.citizenName,
      citizenEmail: record.citizenEmail || info.citizenEmail,
      citizenPhone: record.citizenPhone || info.citizenPhone,
    };
  },

  matchesAdvocate(record, advocateId = "") {
    if (!record || !advocateId) return false;
    const identity = this.getAdvocateIdentities(advocateId);
    const recIds = [record.advocateId, record.assignedAdvocateId, record.matchedAdvocateId]
      .filter(Boolean)
      .map((v) => String(v));

    if (recIds.some((id) => identity.ids.has(id))) {
      return true;
    }

    const recNameNorm = this.normalizeAdvocateName(
      record.advocateName || record.assignedAdvocateName || record.assignedAdvocate || ""
    );
    if (recNameNorm) {
      for (const n of identity.names) {
        if (recNameNorm === n || (n.length >= 3 && recNameNorm.includes(n))) {
          return true;
        }
      }
    }

    const recEmail = (record.advocateEmail || "").toLowerCase().trim();
    if (recEmail && identity.emails.has(recEmail)) {
      return true;
    }

    return false;
  },

  getAdvocateDocuments(advocateId) {
    if (!advocateId) return [];
    const docs = readFile("dev_documents.json", DEFAULT_DOCUMENTS);
    return docs
      .filter((d) => this.matchesAdvocate(d, advocateId))
      .map((d) => this.enrichWithCitizenInfo(d));
  },

  // --- Legal Notices ---
  getNotices(userId) {
    const notices = readFile("dev_notices.json", DEFAULT_NOTICES);
    if (!userId) return [];
    const userNotices = notices.filter((n) => n.citizenId === userId || n.userId === userId);
    return userNotices.map((n) => {
      const dispatch = n.dispatchDate ? new Date(n.dispatchDate).getTime() : Date.now();
      const elapsedDays = Math.max(0, Math.floor((Date.now() - dispatch) / (1000 * 60 * 60 * 24)));
      const statutory = Number(n.statutoryNoticeDays) || 15;
      const dynamicDaysRemaining = Math.max(0, statutory - elapsedDays);
      return {
        ...n,
        daysRemaining: n.daysRemaining !== undefined ? n.daysRemaining : dynamicDaysRemaining,
      };
    });
  },

  getNoticeById(id) {
    const notices = this.getNotices();
    return notices.find((n) => n._id === id || n.id === id) || null;
  },

  addNotice(data) {
    const notices = readFile("dev_notices.json", DEFAULT_NOTICES);
    const trackingNum =
      data.speedPostTrackingNumber ||
      `EK${Math.floor(100000000 + Math.random() * 900000000)}IN`;
    const now = new Date();
    const dateStr = now
      .toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
    const timeStr = now.toTimeString().split(" ")[0];

    const initialTracking =
      data.trackingHistory && data.trackingHistory.length > 0
        ? data.trackingHistory
        : [
            {
              date: dateStr,
              time: timeStr,
              location: "Kochi Head Post Office",
              activity: `Item Booked via Speed Post (Weight: 65g, Barcode: ${trackingNum})`,
            },
          ];

    const newNotice = {
      _id: "not_" + Date.now().toString(),
      id: "not_" + Date.now().toString(),
      citizenId: data.citizenId || "",
      senderName: data.senderName || "Client",
      recipientName: data.recipientName || "Recipient",
      recipientAddress: data.recipientAddress || "Address",
      claimAmount: data.claimAmount || "",
      noticeType: data.noticeType || "Statutory Legal Notice",
      title: data.title || "Legal Notice",
      statutoryNoticeDays: Number(data.statutoryNoticeDays) || 15,
      dispatchDate: data.dispatchDate || now.toISOString(),
      speedPostTrackingNumber: trackingNum,
      deliveryStatus: data.deliveryStatus || "Item Booked",
      daysRemaining: Number(data.statutoryNoticeDays) || 15,
      advocateName: data.advocateName || "Counsel",
      draftContent: data.draftContent || "",
      trackingHistory: initialTracking,
      createdAt: now.toISOString(),
      ...data,
    };
    notices.unshift(newNotice);
    writeFile("dev_notices.json", notices);
    return newNotice;
  },

  updateNotice(id, updates) {
    const notices = readFile("dev_notices.json", DEFAULT_NOTICES);
    const idx = notices.findIndex((n) => n._id === id || n.id === id);
    if (idx === -1) return null;
    notices[idx] = { ...notices[idx], ...updates, updatedAt: new Date().toISOString() };
    writeFile("dev_notices.json", notices);
    return notices[idx];
  },

  deleteNotice(id) {
    const notices = readFile("dev_notices.json", DEFAULT_NOTICES);
    const filtered = notices.filter((n) => n._id !== id && n.id !== id);
    writeFile("dev_notices.json", filtered);
    return true;
  },

  // --- Advocates Directory ---
  getAdvocates() {
    const users = this.getUsers();
    const profiles = readFile("dev_advocate_profiles.json", DEFAULT_ADVOCATE_PROFILES);

    // Filter all registered users who have role 'advocate' or accountType 'independent_advocate'
    const advocateUsers = users.filter(
      (u) => u.role === "advocate" || u.accountType === "independent_advocate"
    );

    // Map profiles by userId, email, and _id for fast lookup
    const profileMap = new Map();
    profiles.forEach((p) => {
      if (p.userId) profileMap.set(p.userId.toString(), p);
      if (p.email) profileMap.set(p.email.toLowerCase(), p);
      if (p._id) profileMap.set(p._id.toString(), p);
    });

    const registeredAdvocates = advocateUsers.map((u, index) => {
      const uId = u._id || u.id || `adv_user_${index}`;
      const email = u.email ? u.email.toLowerCase() : "";
      const profile = profileMap.get(uId) || (email ? profileMap.get(email) : null);

      let cleanName = (u.fullName || profile?.fullName || "Advocate").trim();
      if (!cleanName.toLowerCase().startsWith("adv.") && !cleanName.toLowerCase().startsWith("adv ")) {
        cleanName = `Adv. ${cleanName}`;
      }

      // Generate a stable Bar Council ID if not present
      const pseudoHash = Math.abs(
        (email || cleanName).split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
      );
      const defaultBarNo = `K/00${(pseudoHash % 9000) + 1000}/${2010 + (pseudoHash % 14)}`;

      const barCouncilNumber =
        profile?.barCouncilNumber ||
        u.barCouncilId ||
        u.barCouncilNumber ||
        defaultBarNo;

      const experienceYears =
        typeof profile?.experienceYears === "number"
          ? profile.experienceYears
          : 6 + (pseudoHash % 15);

      const primaryCourt =
        profile?.primaryCourt ||
        u.additionalDetails?.practiceCourt ||
        (u.stateBarCouncil ? `${u.stateBarCouncil} & High Court` : "High Court of Kerala (Ernakulam)");

      const chamberAddress =
        profile?.chamberAddress ||
        (u.stateBarCouncil
          ? `Chambers, High Court Road, ${u.stateBarCouncil.replace("Bar Council of ", "")}`
          : "Chamber Suite, High Court Road, Marine Drive, Kochi 682031");

      const location =
        profile?.chamberAddress
          ? profile.chamberAddress.split(",").slice(-2).join(",").trim()
          : "Ernakulam, Kerala";

      const specializations =
        profile?.specializations && profile.specializations.length > 0
          ? profile.specializations
          : ["Civil Litigation", "Constitutional Writs", "Commercial Law"];

      const consultationFee =
        typeof profile?.consultationFee === "number"
          ? profile.consultationFee
          : 1200 + (pseudoHash % 10) * 150;

      return {
        id: uId,
        _id: uId,
        userId: uId,
        fullName: cleanName,
        name: cleanName,
        email: u.email,
        barCouncilNumber,
        experienceYears,
        experience: `${experienceYears}+ Years Experience`,
        primaryCourt,
        chamberAddress,
        location,
        specializations,
        specialties: specializations,
        languages: profile?.languages || ["English", "Malayalam"],
        consultationFee,
        fee: `₹${consultationFee.toLocaleString()} / session`,
        rating: profile?.rating || 4.9,
        reviewCount: profile?.reviewCount || 18 + (pseudoHash % 30),
        reviewsCount: profile?.reviewCount || 18 + (pseudoHash % 30),
        matchScore: profile?.matchScore || 98,
        isVerified: true,
        availableToday: true,
        bio: profile?.bio || `Practicing Advocate before the ${primaryCourt}.`,
        upiId: profile?.upiId || `${(email || "counsel").split("@")[0]}@okaxis`,
      };
    });

    // Merge registeredAdvocates with DEFAULT_ADVOCATES, deduplicating
    const existingIds = new Set(registeredAdvocates.map((a) => a.id));
    const existingEmails = new Set(
      registeredAdvocates.map((a) => a.email?.toLowerCase()).filter(Boolean)
    );
    const existingNames = new Set(
      registeredAdvocates.map((a) => a.name.toLowerCase().replace(/^adv\.\s*/, ""))
    );

    const remainingSeeds = DEFAULT_ADVOCATES.filter((seed) => {
      const normName = (seed.fullName || seed.name || "").toLowerCase().replace(/^adv\.\s*/, "");
      const normEmail = (seed.email || "").toLowerCase();
      if (existingIds.has(seed.id)) return false;
      if (normEmail && existingEmails.has(normEmail)) return false;
      if (normName && existingNames.has(normName)) return false;
      return true;
    });

    const normalizedSeeds = remainingSeeds.map((seed) => ({
      ...seed,
      name: seed.fullName || seed.name,
      specialties: seed.specializations || seed.specialties || ["Civil Law"],
      location: seed.chamberAddress
        ? seed.chamberAddress.split(",").slice(-2).join(",").trim()
        : seed.location || "Ernakulam, Kerala",
      experience:
        typeof seed.experienceYears === "number"
          ? `${seed.experienceYears}+ Years Experience`
          : seed.experience || "10+ Years Experience",
      fee:
        typeof seed.consultationFee === "number"
          ? `₹${seed.consultationFee.toLocaleString()} / session`
          : seed.fee || "₹1,500 / session",
      reviewsCount: seed.reviewCount || seed.reviewsCount || 38,
      matchScore: seed.matchScore || (seed.isVerified ? 98 : 90),
    }));

    // Newly registered / logged in advocates appear at the front
    return [...registeredAdvocates, ...normalizedSeeds];
  },

  // --- Advocate Profile & Chambers ---
  getAdvocateProfile(advocateId = "") {
    if (!advocateId) return null;
    const profiles = readFile("dev_advocate_profiles.json", DEFAULT_ADVOCATE_PROFILES);
    let profile = profiles.find((p) => p.userId === advocateId || p._id === advocateId);
    if (!profile) {
      const users = this.getUsers();
      const user = users.find(
        (u) => u._id === advocateId || u.id === advocateId || u.email === advocateId
      );
      if (user) {
        let cleanName = (user.fullName || "Advocate").trim();
        if (!cleanName.toLowerCase().startsWith("adv.") && !cleanName.toLowerCase().startsWith("adv ")) {
          cleanName = `Adv. ${cleanName}`;
        }
        profile = {
          _id: "prof_" + user._id,
          userId: user._id,
          fullName: cleanName,
          email: user.email,
          phone: user.phone || "",
          barCouncilNumber: user.barCouncilId || "",
          experienceYears: 0,
          primaryCourt: user.additionalDetails?.practiceCourt || "",
          secondaryCourts: [],
          chamberAddress: "",
          specializations: [],
          languages: ["English"],
          consultationFee: 0,
          rating: 0,
          reviewCount: 0,
          isVerified: Boolean(user.isVerified),
          availableToday: true,
          bio: "",
          upiId: "",
        };
        profiles.push(profile);
        writeFile("dev_advocate_profiles.json", profiles);
      }
    }
    return profile || null;
  },

  updateAdvocateProfile(advocateId = "", updates = {}) {
    const profiles = readFile("dev_advocate_profiles.json", DEFAULT_ADVOCATE_PROFILES);
    const idx = profiles.findIndex((p) => p.userId === advocateId || p._id === advocateId);
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_advocate_profiles.json", profiles);
      return profiles[idx];
    }
    const newProf = { _id: "prof_" + advocateId, userId: advocateId, ...updates, updatedAt: new Date().toISOString() };
    profiles.push(newProf);
    writeFile("dev_advocate_profiles.json", profiles);
    return newProf;
  },

  // --- Cause List (Court Board) ---
  getCauseList(advocateId) {
    if (!advocateId) return [];
    const causeList = readFile("dev_causelists.json", DEFAULT_CAUSE_LIST);
    return causeList.filter((item) => item.advocateId && String(item.advocateId) === String(advocateId));
  },

  addCauseListItem(data) {
    const causeList = readFile("dev_causelists.json", DEFAULT_CAUSE_LIST);
    const newItem = {
      _id: "cl_" + Date.now().toString(),
      status: "listed",
      ...data,
      createdAt: new Date().toISOString(),
    };
    causeList.unshift(newItem);
    writeFile("dev_causelists.json", causeList);
    return newItem;
  },

  updateCauseListItem(id, updates, advocateId = null) {
    const causeList = readFile("dev_causelists.json", DEFAULT_CAUSE_LIST);
    const idx = causeList.findIndex(
      (item) => item._id === id && (!advocateId || (item.advocateId && String(item.advocateId) === String(advocateId)))
    );
    if (idx !== -1) {
      causeList[idx] = { ...causeList[idx], ...updates, advocateId: causeList[idx].advocateId };
      writeFile("dev_causelists.json", causeList);
      return causeList[idx];
    }
    return null;
  },

  // --- Advocate Active Matters Pipeline ---
  getAdvocateMatters(advocateId = "") {
    if (!advocateId) return [];
    const allMatters = readFile("dev_matters.json", DEFAULT_MATTERS);
    return allMatters
      .filter((m) => this.matchesAdvocate(m, advocateId))
      .map((m) => this.enrichWithCitizenInfo(m));
  },

  // --- Advocate Consultations & Chamber Bookings ---
  getAdvocateConsultations(advocateId = "") {
    if (!advocateId) return [];
    const allConsultations = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    return allConsultations
      .filter((c) => this.matchesAdvocate(c, advocateId))
      .map((c) => this.enrichWithCitizenInfo(c));
  },

  updateConsultationStatus(id, updates) {
    const cons = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    const idx = cons.findIndex((c) => c._id === id || c.id === id);
    if (idx !== -1) {
      cons[idx] = { ...cons[idx], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_consultations.json", cons);
      return cons[idx];
    }
    return null;
  },

  recordConsultationAdvice(id, adviceNotes, extraUpdates = {}) {
    const cons = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    const idx = cons.findIndex((c) => c._id === id || c.id === id);
    if (idx !== -1) {
      cons[idx].adviceNotes = adviceNotes;
      cons[idx].status = "completed";
      cons[idx].completedAt = new Date().toISOString();
      cons[idx].updatedAt = new Date().toISOString();
      Object.assign(cons[idx], extraUpdates);
      writeFile("dev_consultations.json", cons);
      return cons[idx];
    }
    return null;
  },

  // --- Advocate Invoices & Fee Billing ---
  getInvoices(advocateId = "") {
    if (!advocateId) return [];
    const invoices = readFile("dev_invoices.json", DEFAULT_INVOICES);
    return invoices.filter((inv) => this.matchesAdvocate(inv, advocateId));
  },

  createInvoice(data) {
    const invoices = readFile("dev_invoices.json", DEFAULT_INVOICES);
    const resolvedAdv = this.resolveAdvocateByIdOrName(data.advocateId, data.advocateName);
    const subtotal = data.items
      ? data.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
      : Number(data.subtotal) || 0;
    const gstRate = data.gstRate !== undefined ? Number(data.gstRate) : 18;
    const gstAmount = data.gstAmount !== undefined ? Number(data.gstAmount) : Math.round((subtotal * gstRate) / 100);
    const totalAmount = data.totalAmount !== undefined ? Number(data.totalAmount) : subtotal + gstAmount;

    const newInvoice = {
      ...data,
      _id: "inv_" + Date.now().toString(),
      invoiceNumber:
        data.invoiceNumber || `INV-${new Date().getFullYear()}/KL-${String(invoices.length + 1).padStart(3, "0")}`,
      advocateId: resolvedAdv.advocateId,
      advocateName: resolvedAdv.advocateName,
      barCouncilNumber: data.barCouncilNumber || resolvedAdv.barCouncilNumber || "",
      citizenId: data.citizenId || "",
      clientName: data.clientName || "Client",
      clientPhone: data.clientPhone || "",
      matterId: data.matterId || "",
      matterTitle: data.matterTitle || "General Legal Retainer",
      items: data.items || [
        { description: "Legal Consultation & Drafting", amount: subtotal, category: "Professional Fee", sacCode: "9982" },
      ],
      subtotal,
      gstRate,
      gstAmount,
      cgstAmount: Math.round(gstAmount / 2),
      sgstAmount: Math.round(gstAmount / 2),
      totalAmount,
      status: data.status || "unpaid",
      dueDate: data.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: data.paymentMethod || "UPI",
      createdAt: new Date().toISOString(),
    };
    invoices.unshift(newInvoice);
    writeFile("dev_invoices.json", invoices);
    return newInvoice;
  },

  updateInvoice(id, updates) {
    const invoices = readFile("dev_invoices.json", DEFAULT_INVOICES);
    const idx = invoices.findIndex((inv) => inv._id === id);
    if (idx !== -1) {
      invoices[idx] = { ...invoices[idx], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_invoices.json", invoices);
      return invoices[idx];
    }
    return null;
  },

  // --- Chamber Notes & Case Briefings ---
  getCaseNotes(advocateId = "", matterId = "") {
    if (!advocateId) return [];
    const notes = readFile("dev_casenotes.json", DEFAULT_CASE_NOTES);
    return notes.filter((n) => {
      const matchAdv = n.advocateId === advocateId;
      const matchMatter = !matterId || n.matterId === matterId;
      return matchAdv && matchMatter;
    });
  },

  addCaseNote(data) {
    const notes = readFile("dev_casenotes.json", DEFAULT_CASE_NOTES);
    const newNote = {
      _id: "note_" + Date.now().toString(),
      advocateId: data.advocateId || "",
      matterId: data.matterId || "",
      matterTitle: data.matterTitle || "General Chamber Memo",
      title: data.title || "Untitled Case Note",
      content: data.content || "",
      category: data.category || "hearing_memo",
      isConfidential: data.isConfidential !== undefined ? data.isConfidential : true,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
    };
    notes.unshift(newNote);
    writeFile("dev_casenotes.json", notes);
    return newNote;
  },

  deleteCaseNote(id) {
    const notes = readFile("dev_casenotes.json", DEFAULT_CASE_NOTES);
    const filtered = notes.filter((n) => n._id !== id);
    writeFile("dev_casenotes.json", filtered);
    return { success: true, deletedId: id };
  },

  // --- Incoming Leads / Grievances for Intake ---
  getIncomingGrievances(advocateId = "") {
    if (!advocateId) return [];
    const grievances = readFile("dev_grievances.json", DEFAULT_GRIEVANCES);
    return grievances
      .filter((g) => {
        if (this.matchesAdvocate(g, advocateId)) return true;
        const isAssignedElsewhere = Boolean(g.assignedAdvocateId || g.assignedAdvocateName);
        return !isAssignedElsewhere && ["pending_review", "Under AI Triage", "matched"].includes(g.status);
      })
      .map((g) => this.enrichWithCitizenInfo(g));
  },

  acceptGrievance(grievanceId, advocateId = "") {
    const grievances = readFile("dev_grievances.json", DEFAULT_GRIEVANCES);
    const grvIndex = grievances.findIndex((g) => g._id === grievanceId);
    if (grvIndex === -1) return null;

    const resolvedAdv = this.resolveAdvocateByIdOrName(advocateId);
    const citizenInfo = this.getCitizenDisplayInfo(grievances[grvIndex].citizenId);

    grievances[grvIndex].status = "matter_opened";
    grievances[grvIndex].assignedAdvocateId = resolvedAdv.advocateId;
    grievances[grvIndex].assignedAdvocateName = resolvedAdv.advocateName;
    if (!grievances[grvIndex].citizenName) grievances[grvIndex].citizenName = citizenInfo.citizenName;
    grievances[grvIndex].updatedAt = new Date().toISOString();
    writeFile("dev_grievances.json", grievances);

    // Also auto-create a corresponding active matter if it doesn't already exist
    const matters = readFile("dev_matters.json", DEFAULT_MATTERS);
    const existing = matters.find((m) => m.grievanceId === grievanceId);
    if (!existing) {
      const newMatter = {
        _id: "mat_" + Date.now().toString(),
        citizenId: grievances[grvIndex].citizenId || "",
        citizenName: grievances[grvIndex].citizenName || citizenInfo.citizenName,
        citizenEmail: citizenInfo.citizenEmail,
        grievanceId,
        advocateId: resolvedAdv.advocateId,
        advocateName: resolvedAdv.advocateName,
        matterTitle: grievances[grvIndex].title,
        matterType: grievances[grvIndex].category || "Civil Litigation",
        caseNumber: `WP(C) ${Math.floor(10000 + Math.random() * 90000)}/2026`,
        cnrNumber: `KLHC01-${Math.floor(100000 + Math.random() * 900000)}-2026`,
        courtForum: grievances[grvIndex].preferredCourt || "High Court of Kerala (Ernakulam)",
        courtHall: "Court Hall 2A",
        status: "active",
        nextHearingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        statutoryActs: grievances[grvIndex].aiTriage?.applicableActs || ["Article 226 of the Constitution of India"],
        timeline: [
          {
            date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            title: "Lead Accepted & Matter Opened",
            remarks: "Chamber conference scheduled with client; drafting vakalatnama and writ grounds",
            stage: "Completed",
          },
        ],
        totalFeesBilled: 25000,
        feesPaid: 0,
        createdAt: new Date().toISOString(),
      };
      matters.unshift(newMatter);
      writeFile("dev_matters.json", matters);
    }

    return grievances[grvIndex];
  },

  // --- Two-Way Realtime Synchronization Engine ---
  getCitizenInvoices(citizenId) {
    const invoices = readFile("dev_invoices.json", DEFAULT_INVOICES);
    if (!citizenId) return [];
    return invoices.filter(
      (inv) => inv.citizenId === citizenId || inv.userId === citizenId
    );
  },

  getInvoiceById(invoiceId) {
    const invoices = readFile("dev_invoices.json", DEFAULT_INVOICES);
    return invoices.find((i) => i._id === invoiceId || i.invoiceNumber === invoiceId) || null;
  },

  payInvoice(invoiceId, paymentMethod = "UPI", transactionId = "") {
    const invoices = readFile("dev_invoices.json", DEFAULT_INVOICES);
    const inv = invoices.find((i) => i._id === invoiceId || i.invoiceNumber === invoiceId);
    if (!inv) return null;

    const now = new Date();
    inv.status = "paid";
    inv.paidAt = now.toISOString();
    inv.paymentMethod = paymentMethod;
    inv.transactionId =
      transactionId ||
      `${paymentMethod.toUpperCase().replace(/[^A-Z]/g, "") || "TXN"}/${now.getFullYear()}/${Math.floor(
        10000000 + Math.random() * 90000000
      )}`;
    inv.receiptNumber =
      inv.receiptNumber ||
      `REC-${now.getFullYear()}/${inv.invoiceNumber.replace(/[^0-9]/g, "").slice(-3) || "001"}`;
    writeFile("dev_invoices.json", invoices);

    // Cross-portal sync: increment feesPaid on the matter & add timeline milestone
    const matters = readFile("dev_matters.json", DEFAULT_MATTERS);
    const matter = matters.find(
      (m) =>
        m._id === inv.matterId ||
        m.id === inv.matterId ||
        m.caseNumber === inv.matterId ||
        (inv.matterTitle && m.matterTitle && m.matterTitle.includes(inv.matterTitle.slice(0, 15)))
    );
    if (matter) {
      matter.feesPaid =
        (Number(matter.feesPaid) || 0) + (Number(inv.totalAmount) || Number(inv.subtotal) || 0);
      if (!matter.timeline) matter.timeline = [];
      matter.timeline.unshift({
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        title: `Retainer Bill Settled (${inv.invoiceNumber})`,
        remarks: `Payment of ₹${Number(inv.totalAmount).toLocaleString(
          "en-IN"
        )} confirmed via ${paymentMethod} (Txn: ${inv.transactionId}). Formal GST receipt ${
          inv.receiptNumber
        } issued.`,
        stage: "Completed",
      });
      writeFile("dev_matters.json", matters);
    }

    return { invoice: inv, matter };
  },

  addMatterTimelineEvent(matterId, eventData) {
    const matters = readFile("dev_matters.json", DEFAULT_MATTERS);
    const matter = matters.find((m) => m._id === matterId || m.caseNumber === matterId || m.matterTitle.includes(matterId));
    if (!matter) return null;

    if (!matter.timeline) matter.timeline = [];
    const newEvent = {
      date: eventData.date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      title: eventData.title || "Court Proceedings Update",
      remarks: eventData.remarks || "",
      stage: eventData.stage || "Completed",
    };
    matter.timeline.push(newEvent);
    if (eventData.nextHearingDate) {
      matter.nextHearingDate = eventData.nextHearingDate;
    }
    matter.updatedAt = new Date().toISOString();
    writeFile("dev_matters.json", matters);
    return { matter, event: newEvent };
  },

  shareCourtDocument(data) {
    const docs = readFile("dev_documents.json", DEFAULT_DOCUMENTS);
    const docId = data.id || data._id || "doc_" + Date.now().toString();
    const hash = data.hash || data.sha256Hash || `sha256:${Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    const newDoc = {
      _id: docId,
      id: docId,
      citizenId: data.citizenId || "",
      matterId: data.matterId || "",
      matter: data.matter || "General Legal Matter",
      title: data.title || "Certified Court Order",
      name: data.fileName || data.title || "Certified_Court_Order.pdf",
      fileName: data.fileName || data.title || "Certified_Court_Order.pdf",
      category: data.category || "Certified Court Orders",
      folder: "Certified Court Orders",
      subType: data.subType || "certified-true-copies",
      size: data.fileSize || data.size || "1.8 MB",
      fileSize: data.fileSize || data.size || "1.8 MB",
      isSigned: true,
      signedAt: new Date().toISOString(),
      uploadDate: "Today, Just now",
      date: "Just now",
      pages: data.pages || 4,
      hash,
      sha256Hash: hash,
      uploadedBy: data.uploadedBy || data.advocateName || "Chamber Counsel",
      advocateName: data.advocateName || data.uploadedBy || "",
      advocateId: data.advocateId || "",
      filingStatus: data.filingStatus || "Counsel Certified & Served",
      status: data.filingStatus || "Counsel Certified & Served",
      notes: data.notes || data.details || "Certified court order attested and shared to client docket with digital chamber seal.",
      details: data.notes || data.details || "Certified court order attested and shared to client docket with digital chamber seal.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    docs.unshift(newDoc);
    writeFile("dev_documents.json", docs);
    return newDoc;
  },

  // --- Secure Client-Advocate Messaging ---
  getMessages(userId = "", matterId = "") {
    const cleanUserId = String(userId || "").trim();
    if (!cleanUserId) return [];
    const messages = readFile("dev_messages.json", DEFAULT_MESSAGES);

    return messages
      .filter((m) => {
        const senderStr = m.senderId ? String(m.senderId) : "";
        const recipStr = m.recipientId ? String(m.recipientId) : "";
        const matchUser = senderStr === cleanUserId || recipStr === cleanUserId;
        const matchMatter = !matterId || String(m.matterId || "") === String(matterId);
        return matchUser && matchMatter;
      })
      .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
  },

  sendMessage(data) {
    const messages = readFile("dev_messages.json", DEFAULT_MESSAGES);
    const now = new Date();
    const senderId = data.senderId ? String(data.senderId) : "";
    const citizenInfo = this.getCitizenDisplayInfo(senderId);

    let resolvedAdv = null;
    if (data.recipientId || data.recipientName) {
      resolvedAdv = this.resolveAdvocateByIdOrName(data.recipientId, data.recipientName);
    }

    const fallbackRecipientId = data.recipientId
      ? String(data.recipientId)
      : resolvedAdv?.advocateId || "";
    const fallbackRecipientName =
      data.recipientName ||
      resolvedAdv?.advocateName ||
      "Counsel";

    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newMsg = {
      _id: id,
      id,
      senderId,
      senderRole: data.senderRole || "citizen",
      senderName:
        data.senderName ||
        citizenInfo.citizenName ||
        "Registered Citizen",
      recipientId: fallbackRecipientId,
      recipientRole: data.recipientRole || "advocate",
      recipientName: fallbackRecipientName,
      matterId: data.matterId || "",
      matterTitle: data.matterTitle || "General Legal Counsel",
      content: data.content,
      attachments: data.attachments || [],
      isRead: false,
      isPrivileged: data.isPrivileged !== undefined ? data.isPrivileged : true,
      category: data.category || "general",
      createdAt: now.toISOString(),
    };
    messages.push(newMsg);
    writeFile("dev_messages.json", messages);
    return newMsg;
  },

  markMessageAsRead(messageId, actorUserId = "") {
    const messages = readFile("dev_messages.json", DEFAULT_MESSAGES);
    const msg = messages.find((m) => String(m._id) === String(messageId) || String(m.id) === String(messageId));
    if (!msg) return null;
    if (actorUserId && String(msg.recipientId) !== String(actorUserId) && String(msg.senderId) !== String(actorUserId)) {
      return null;
    }
    msg.isRead = true;
    msg.readAt = new Date().toISOString();
    writeFile("dev_messages.json", messages);
    return msg;
  },

  getUnreadMessageCount(userId = "") {
    const cleanUserId = String(userId || "").trim();
    if (!cleanUserId) return 0;
    const messages = this.getMessages(cleanUserId);
    return messages.filter((m) => String(m.recipientId) === cleanUserId && !m.isRead).length;
  },

  // --- Advocate Messaging & Threads ---
  getAdvocateMessages(advocateId = "") {
    const cleanId = String(advocateId || "").trim();
    if (!cleanId) return [];
    const messages = readFile("dev_messages.json", DEFAULT_MESSAGES);
    const identity = this.getAdvocateIdentities(cleanId);

    return messages.filter((m) => {
      const senderStr = m.senderId ? String(m.senderId) : "";
      const recipStr = m.recipientId ? String(m.recipientId) : "";

      if (senderStr === cleanId || recipStr === cleanId) return true;
      if (identity.ids.has(senderStr) || identity.ids.has(recipStr)) return true;

      if (
        this.matchesAdvocate(
          { advocateId: recipStr || m.advocateId, advocateName: m.recipientName || m.advocateName },
          cleanId
        )
      ) {
        return true;
      }

      if (
        m.senderRole === "advocate" &&
        this.matchesAdvocate({ advocateId: senderStr, advocateName: m.senderName }, cleanId)
      ) {
        return true;
      }

      return false;
    });
  },

  getAdvocateThreads(advocateId = "") {
    const cleanAdvId = String(advocateId || "").trim();
    const identity = this.getAdvocateIdentities(cleanAdvId);
    const messages = this.getAdvocateMessages(cleanAdvId);
    const threadsMap = new Map();

    messages.forEach((msg) => {
      const senderStr = msg.senderId ? String(msg.senderId) : "";
      const isOutbound =
        senderStr === cleanAdvId || identity.ids.has(senderStr) || msg.senderRole === "advocate";
      const citizenId = String(isOutbound ? msg.recipientId : msg.senderId || "").trim();
      if (!citizenId) return;

      const rawCitizenName = isOutbound ? msg.recipientName : msg.senderName;
      const citizenInfo = this.getCitizenDisplayInfo(citizenId);
      const displayCitizenName =
        rawCitizenName && rawCitizenName !== "Citizen Client" && rawCitizenName !== "Registered Client"
          ? rawCitizenName
          : citizenInfo.citizenName || "Registered Client";

      if (!threadsMap.has(citizenId)) {
        threadsMap.set(citizenId, {
          citizenId,
          citizenName: displayCitizenName,
          citizenEmail: citizenInfo.citizenEmail || "",
          citizenPhone: citizenInfo.citizenPhone || "",
          matterId: msg.matterId || "",
          matterTitle: msg.matterTitle || "Direct Counsel Communication",
          messages: [],
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      const thread = threadsMap.get(citizenId);
      thread.messages.push(msg);
      if (new Date(msg.createdAt || 0) >= new Date(thread.lastMessage.createdAt || 0)) {
        thread.lastMessage = msg;
        if (msg.matterTitle) thread.matterTitle = msg.matterTitle;
      }
      if (!msg.isRead && !isOutbound) {
        thread.unreadCount += 1;
      }
    });

    threadsMap.forEach((t) => {
      t.messages.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    });

    return Array.from(threadsMap.values()).sort(
      (a, b) => new Date(b.lastMessage.createdAt || 0).getTime() - new Date(a.lastMessage.createdAt || 0).getTime()
    );
  },

  getAdvocateThread(advocateId = "", citizenId = "") {
    const cleanCitizenId = String(citizenId || "").trim();
    if (!advocateId || !cleanCitizenId) return [];
    const messages = this.getAdvocateMessages(advocateId);
    return messages
      .filter(
        (m) => String(m.senderId) === cleanCitizenId || String(m.recipientId) === cleanCitizenId
      )
      .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
  },

  sendAdvocateMessage(data) {
    const messages = readFile("dev_messages.json", DEFAULT_MESSAGES);
    const now = new Date();
    const senderId = data.senderId ? String(data.senderId) : "";
    const identity = this.getAdvocateIdentities(senderId);
    const recipientId = data.recipientId ? String(data.recipientId) : "";
    const citizenInfo = recipientId ? this.getCitizenDisplayInfo(recipientId) : { citizenName: "" };

    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newMsg = {
      _id: id,
      id,
      senderId,
      senderRole: "advocate",
      senderName: data.senderName || identity.primaryName || "Counsel",
      recipientId,
      recipientRole: "citizen",
      recipientName: data.recipientName || citizenInfo.citizenName || "Client",
      matterId: data.matterId || "",
      matterTitle: data.matterTitle || "Direct Counsel Communication",
      content: data.content,
      attachments: data.attachments || [],
      isRead: false,
      isPrivileged: true,
      category: data.category || "general",
      createdAt: now.toISOString(),
    };
    messages.push(newMsg);
    writeFile("dev_messages.json", messages);
    return newMsg;
  },

  markAdvocateThreadRead(advocateId = "", citizenId = "") {
    const cleanAdvId = String(advocateId || "").trim();
    const cleanCitizenId = String(citizenId || "").trim();
    if (!cleanAdvId || !cleanCitizenId) return 0;

    const messages = readFile("dev_messages.json", DEFAULT_MESSAGES);
    const identity = this.getAdvocateIdentities(cleanAdvId);
    let updatedCount = 0;

    messages.forEach((m) => {
      const senderStr = m.senderId ? String(m.senderId) : "";
      const recipStr = m.recipientId ? String(m.recipientId) : "";
      const fromTargetCitizen = senderStr === cleanCitizenId;
      const targetsThisAdvocate =
        recipStr === cleanAdvId ||
        identity.ids.has(recipStr) ||
        this.matchesAdvocate(
          { advocateId: recipStr || m.advocateId, advocateName: m.recipientName || m.advocateName },
          cleanAdvId
        );

      if (fromTargetCitizen && targetsThisAdvocate && !m.isRead) {
        m.isRead = true;
        m.readAt = new Date().toISOString();
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      writeFile("dev_messages.json", messages);
    }
    return updatedCount;
  },

  getAdvocateUnreadCount(advocateId = "") {
    const cleanAdvId = String(advocateId || "").trim();
    if (!cleanAdvId) return 0;
    const identity = this.getAdvocateIdentities(cleanAdvId);
    const messages = this.getAdvocateMessages(cleanAdvId);
    return messages.filter((m) => {
      const senderStr = m.senderId ? String(m.senderId) : "";
      const isOutbound =
        senderStr === cleanAdvId || identity.ids.has(senderStr) || m.senderRole === "advocate";
      return !isOutbound && !m.isRead;
    }).length;
  },

  // --- Persisted Formal Mailbox (Chamber & Citizen Correspondence) ---
  getMailboxEmails(ownerId = "", ownerRole = "advocate") {
    const cleanOwnerId = String(ownerId || "").trim();
    if (!cleanOwnerId) return [];
    const raw = readFile("dev_mails.json", []);
    const allMails = Array.isArray(raw) ? raw : [];

    return allMails
      .filter((mail) => {
        if (!mail) return false;
        const mailOwner = String(mail.ownerId || "");
        if (ownerRole === "advocate") {
          return (
            mailOwner === cleanOwnerId ||
            (mail.ownerRole === "advocate" &&
              this.matchesAdvocate(
                { advocateId: mailOwner, advocateName: mail.ownerName || mail.recipientName },
                cleanOwnerId
              ))
          );
        }
        return mailOwner === cleanOwnerId;
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  },

  sendMailboxEmail({
    senderId,
    senderRole = "advocate",
    senderName = "",
    senderEmail = "",
    recipientId = "",
    recipientRole = "",
    recipientName = "",
    recipientEmail = "",
    matterTitle = "General Correspondence",
    subject = "",
    body = [],
    category = "general",
    categoryLabel = "Correspondence",
    categoryColor = "sky",
    folder = "sent",
    attachments = [],
  }) {
    const raw = readFile("dev_mails.json", []);
    const allMails = Array.isArray(raw) ? raw : [];
    const now = new Date();
    const isoNow = now.toISOString();
    const formattedDate = now.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const shortTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const bodyParagraphs = Array.isArray(body)
      ? body.filter(Boolean)
      : String(body || "")
          .split("\n")
          .filter(Boolean);
    const snippet = bodyParagraphs.join(" ").slice(0, 140);

    const initialsOf = (name) =>
      String(name || "WL")
        .replace(/^adv\.?\s*/i, "")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0] || "")
        .join("")
        .toUpperCase() || "WL";

    let resolvedRecipientId = String(recipientId || "").trim();
    let resolvedRecipientName = String(recipientName || "").trim();
    let resolvedRecipientRole =
      recipientRole || (senderRole === "citizen" ? "advocate" : "citizen");

    if (senderRole === "citizen" && (!resolvedRecipientId || resolvedRecipientRole === "advocate")) {
      const adv = this.resolveAdvocateByIdOrName(resolvedRecipientId, resolvedRecipientName);
      if (adv?.advocateId && (resolvedRecipientId || resolvedRecipientName)) {
        resolvedRecipientId = adv.advocateId;
        resolvedRecipientName = resolvedRecipientName || adv.advocateName;
      }
    }

    const baseId = `mail_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const senderCopy = {
      id: baseId,
      ownerId: String(senderId || ""),
      ownerRole: senderRole,
      ownerName: senderName,
      senderId: String(senderId || ""),
      senderRole,
      senderName: senderName || (senderRole === "advocate" ? "Counsel" : "Registered Citizen"),
      senderEmail: senderEmail || "",
      senderAvatarText: initialsOf(senderName),
      recipientId: resolvedRecipientId,
      recipientRole: resolvedRecipientRole,
      recipientName: resolvedRecipientName || "Recipient",
      recipientEmail: recipientEmail || "",
      matterTitle: matterTitle || "General Correspondence",
      subject: String(subject || "").trim(),
      snippet: snippet.length === 140 ? `${snippet}...` : snippet,
      body: bodyParagraphs,
      timestamp: shortTime,
      fullDate: formattedDate,
      folder: folder === "drafts" ? "drafts" : "sent",
      category: category || "general",
      categoryLabel: categoryLabel || "Correspondence",
      categoryColor: categoryColor || "sky",
      isRead: true,
      isStarred: false,
      attachments: Array.isArray(attachments) ? attachments : [],
      createdAt: isoNow,
    };

    allMails.unshift(senderCopy);

    if (senderCopy.folder !== "drafts" && resolvedRecipientId) {
      const recipientCopy = {
        ...senderCopy,
        id: `${baseId}_inbox`,
        ownerId: resolvedRecipientId,
        ownerRole: resolvedRecipientRole,
        ownerName: resolvedRecipientName,
        folder: "inbox",
        isRead: false,
      };
      allMails.unshift(recipientCopy);
    }

    writeFile("dev_mails.json", allMails);
    return senderCopy;
  },

  replyMailboxEmail(mailId, actorId, actorRole, content, actorName = "") {
    const raw = readFile("dev_mails.json", []);
    const allMails = Array.isArray(raw) ? raw : [];
    const target = allMails.find((m) => String(m.id) === String(mailId));
    if (!target) return null;

    const cleanActorId = String(actorId || "");
    const ownsTarget =
      String(target.ownerId) === cleanActorId ||
      (actorRole === "advocate" &&
        target.ownerRole === "advocate" &&
        this.matchesAdvocate({ advocateId: target.ownerId, advocateName: target.ownerName }, cleanActorId));
    if (!ownsTarget) return null;

    const now = new Date();
    const formattedDate = now.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const replyLine = `[Reply by ${actorName || cleanActorId} • ${formattedDate}]: ${String(content || "").trim()}`;
    target.body = [...(Array.isArray(target.body) ? target.body : []), replyLine];
    target.snippet = String(content || "").trim().slice(0, 120);
    target.fullDate = formattedDate;
    target.timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const counterId =
      String(target.senderId) === cleanActorId ? target.recipientId : target.senderId;
    const counterRole =
      String(target.senderId) === cleanActorId ? target.recipientRole : target.senderRole;
    const counterName =
      String(target.senderId) === cleanActorId ? target.recipientName : target.senderName;

    if (counterId) {
      const inboxCopy = {
        ...target,
        id: `mail_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        ownerId: String(counterId),
        ownerRole: counterRole || (actorRole === "citizen" ? "advocate" : "citizen"),
        ownerName: counterName || "",
        senderId: cleanActorId,
        senderRole: actorRole,
        senderName: actorName || target.recipientName || "Sender",
        recipientId: String(counterId),
        recipientName: counterName || "Recipient",
        subject: target.subject.startsWith("Re:") ? target.subject : `Re: ${target.subject}`,
        folder: "inbox",
        isRead: false,
        createdAt: now.toISOString(),
      };
      allMails.unshift(inboxCopy);
    }

    writeFile("dev_mails.json", allMails);
    return target;
  },

  updateMailboxEmail(mailId, actorId, actorRole = "advocate", updates = {}) {
    const raw = readFile("dev_mails.json", []);
    const allMails = Array.isArray(raw) ? raw : [];
    const target = allMails.find((m) => String(m.id) === String(mailId));
    if (!target) return null;

    const cleanActorId = String(actorId || "");
    const ownsTarget =
      String(target.ownerId) === cleanActorId ||
      (actorRole === "advocate" &&
        target.ownerRole === "advocate" &&
        this.matchesAdvocate({ advocateId: target.ownerId, advocateName: target.ownerName }, cleanActorId));
    if (!ownsTarget) return null;

    if (typeof updates.isRead === "boolean") target.isRead = updates.isRead;
    if (typeof updates.isStarred === "boolean") target.isStarred = updates.isStarred;
    if (updates.folder && ["inbox", "starred", "drafts", "sent", "archive", "trash"].includes(updates.folder)) {
      target.folder = updates.folder;
    }
    writeFile("dev_mails.json", allMails);
    return target;
  },

  deleteMailboxEmail(mailId, actorId, actorRole = "advocate") {
    const raw = readFile("dev_mails.json", []);
    const allMails = Array.isArray(raw) ? raw : [];
    const idx = allMails.findIndex((m) => String(m.id) === String(mailId));
    if (idx === -1) return null;

    const target = allMails[idx];
    const cleanActorId = String(actorId || "");
    const ownsTarget =
      String(target.ownerId) === cleanActorId ||
      (actorRole === "advocate" &&
        target.ownerRole === "advocate" &&
        this.matchesAdvocate({ advocateId: target.ownerId, advocateName: target.ownerName }, cleanActorId));
    if (!ownsTarget) return null;

    if (target.folder === "trash") {
      allMails.splice(idx, 1);
    } else {
      target.folder = "trash";
    }
    writeFile("dev_mails.json", allMails);
    return target;
  },

  // --- Citizen Notifications ---
  getCitizenNotifications(userId) {
    if (!userId) return [];
    const grievances = this.getGrievances(userId);
    const matters = this.getMatters(userId);
    const consultations = this.getConsultations(userId);
    const notices = this.getNotices(userId);
    const documents = this.getDocuments(userId);
    const invoices = this.getCitizenInvoices(userId);
    const messages = this.getMessages(userId);
    const state = this.getNotificationState(`citizen::${userId}`);

    return buildCitizenNotifications({
      grievances,
      matters,
      consultations,
      notices,
      documents,
      invoices,
      messages,
      userId,
      readIds: state.readIds,
      dismissedIds: state.dismissedIds,
    });
  },

  markCitizenNotificationsRead(userId, notificationIds = []) {
    return this.updateNotificationState(`citizen::${userId}`, "readIds", notificationIds);
  },

  dismissCitizenNotifications(userId, notificationIds = []) {
    return this.updateNotificationState(`citizen::${userId}`, "dismissedIds", notificationIds);
  },

  // --- Advocate Notifications (Client Interest, Petitions, Consultations, Filings & Causelist) ---
  getNotificationState(advocateId = "") {
    const store = readFile("dev_notification_state.json", {});
    const key = String(advocateId || "");
    if (!key) return { readIds: [], dismissedIds: [] };
    const entry = store && typeof store === "object" && !Array.isArray(store) ? store[key] : null;
    return entry || { readIds: [], dismissedIds: [] };
  },

  updateNotificationState(advocateId = "", field, notificationIds = []) {
    const raw = readFile("dev_notification_state.json", {});
    const store = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const key = String(advocateId || "");
    if (!key) return { readIds: [], dismissedIds: [] };
    const current = store[key] || { readIds: [], dismissedIds: [] };
    const merged = new Set([...(current[field] || []).map(String), ...(notificationIds || []).map(String)]);
    store[key] = { ...current, [field]: Array.from(merged), updatedAt: new Date().toISOString() };
    writeFile("dev_notification_state.json", store);
    return store[key];
  },

  markAdvocateNotificationsRead(advocateId = "", notificationIds = []) {
    return this.updateNotificationState(advocateId, "readIds", notificationIds);
  },

  dismissAdvocateNotifications(advocateId = "", notificationIds = []) {
    return this.updateNotificationState(advocateId, "dismissedIds", notificationIds);
  },

  getAdvocateNotifications(advocateId = "") {
    if (!advocateId) return [];
    const leads = this.getIncomingGrievances(advocateId);
    const matters = this.getAdvocateMatters(advocateId);
    const consultations = this.getAdvocateConsultations(advocateId);
    const documents = this.getAdvocateDocuments(advocateId);
    const allMessages = readFile("dev_messages.json", DEFAULT_MESSAGES);
    const messages = allMessages
      .filter(
        (m) =>
          String(m.senderId) === String(advocateId) ||
          String(m.recipientId) === String(advocateId) ||
          this.matchesAdvocate(
            { advocateId: m.recipientId || m.advocateId, advocateName: m.recipientName || m.advocateName },
            advocateId
          )
      )
      .map((m) => this.enrichWithCitizenInfo(m));
    const causeList = this.getCauseList(advocateId).filter((c) => this.matchesAdvocate(c, advocateId));
    const state = this.getNotificationState(advocateId);

    return buildAdvocateNotifications({
      leads,
      matters,
      consultations,
      documents,
      messages,
      causeList,
      readIds: state.readIds,
      dismissedIds: state.dismissedIds,
    });
  },

  // --- Advocate Clients & Representation Roster ---
  getClients(advocateId = "") {
    if (!advocateId) return [];
    const storedClients = readFile("dev_clients.json", DEFAULT_CLIENTS);
    const matchingStored = storedClients.filter((c) => this.matchesAdvocate(c, advocateId));

    const advMatters = this.getAdvocateMatters(advocateId);
    const advConsultations = this.getAdvocateConsultations(advocateId);
    const advDocs = this.getAdvocateDocuments(advocateId);
    const advGrievances = readFile("dev_grievances.json", DEFAULT_GRIEVANCES).filter((g) =>
      this.matchesAdvocate(g, advocateId)
    );

    const byCitizenId = new Map();
    for (const c of matchingStored) {
      const key = c.citizenId || c._id || c.id;
      byCitizenId.set(String(key), { ...c });
    }

    const ensureDerivedClient = (citizenId, matterTitle) => {
      if (!citizenId) return;
      const key = String(citizenId);
      const info = this.getCitizenDisplayInfo(citizenId);
      const existing = byCitizenId.get(key);
      if (existing) {
        if (matterTitle && Array.isArray(existing.activeMatters) && !existing.activeMatters.includes(matterTitle)) {
          existing.activeMatters.push(matterTitle);
          existing.activeMattersCount = existing.activeMatters.length;
        }
        return;
      }
      const citMatters = advMatters.filter((m) => String(m.citizenId) === key);
      const titles = citMatters.map((m) => m.matterTitle || m.title).filter(Boolean);
      if (matterTitle && !titles.includes(matterTitle)) titles.push(matterTitle);
      byCitizenId.set(key, {
        _id: `cli_${key}`,
        id: `cli_${key}`,
        citizenId: key,
        advocateId,
        fullName: info.citizenName || "Registered Client",
        category: "Individual Citizen",
        email: info.citizenEmail || "",
        phone: info.citizenPhone || "",
        location: "Kerala, India",
        kycVerified: false,
        vakalatnamaExecuted: citMatters.length > 0,
        status: citMatters.length > 0 ? "Active Matter" : "Consultation / Lead",
        activeMatters: titles,
        activeMattersCount: titles.length,
        totalBilled: citMatters.reduce((s, m) => s + (m.totalFeesBilled || 0), 0),
        totalPaid: citMatters.reduce((s, m) => s + (m.feesPaid || 0), 0),
        nextHearing: citMatters[0]?.nextHearingDate || "Pending Chamber Review",
        notes: "Synced from client petition / consultation engagement.",
        createdAt: new Date().toISOString(),
      });
    };

    advMatters.forEach((m) => ensureDerivedClient(m.citizenId, m.matterTitle || m.title));
    advGrievances.forEach((g) => ensureDerivedClient(g.citizenId, g.title));
    advConsultations.forEach((c) => ensureDerivedClient(c.citizenId, c.subject));
    advDocs.forEach((d) => ensureDerivedClient(d.citizenId, d.matter));

    return Array.from(byCitizenId.values());
  },

  getClientById(id) {
    const clients = readFile("dev_clients.json", DEFAULT_CLIENTS);
    const direct = clients.find((c) => c._id === id || c.id === id || c.citizenId === id);
    if (direct) return direct;

    // Synthesize dossier header from derived citizenId if dynamically linked via matters/consultations
    const citizenId = String(id).startsWith("cli_") ? String(id).slice(4) : String(id);
    const info = this.getCitizenDisplayInfo(citizenId);
    if (!info.citizenName || info.citizenName === "Registered Client") return null;
    return {
      _id: id,
      id,
      citizenId,
      fullName: info.citizenName,
      category: "Individual Citizen",
      email: info.citizenEmail,
      phone: info.citizenPhone,
      location: "Kerala, India",
      kycVerified: false,
      vakalatnamaExecuted: false,
      status: "Active Matter",
    };
  },

  addClient(data) {
    const clients = readFile("dev_clients.json", DEFAULT_CLIENTS);
    const newClient = {
      _id: "cli_" + Date.now().toString(),
      id: "cli_" + Date.now().toString(),
      citizenId: data.citizenId || "cit_" + Date.now().toString(),
      advocateId: data.advocateId || "",
      fullName: data.fullName,
      category: data.category || "Individual Citizen",
      contactPerson: data.contactPerson || "",
      email: data.email || "",
      phone: data.phone || "",
      alternatePhone: data.alternatePhone || "",
      address: data.address || {
        city: data.city || "Kochi",
        state: "Kerala",
        district: "Ernakulam",
      },
      location: data.location || `${data.city || "Kochi"}, Kerala`,
      kycVerified: data.kycVerified !== undefined ? data.kycVerified : true,
      vakalatnamaExecuted: data.vakalatnamaExecuted !== undefined ? data.vakalatnamaExecuted : false,
      status: data.status || "Active Matter",
      activeMatters: data.initialMatter ? [data.initialMatter] : [],
      activeMattersCount: data.initialMatter ? 1 : 0,
      totalBilled: Number(data.totalBilled) || 0,
      totalPaid: Number(data.totalPaid) || 0,
      nextHearing: data.nextHearing || "Initial Chamber Conference",
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
      ...data,
    };
    clients.unshift(newClient);
    writeFile("dev_clients.json", clients);
    return newClient;
  },

  updateClient(id, updates) {
    const clients = readFile("dev_clients.json", DEFAULT_CLIENTS);
    const idx = clients.findIndex((c) => c._id === id || c.id === id || c.citizenId === id);
    if (idx !== -1) {
      clients[idx] = { ...clients[idx], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_clients.json", clients);
      return clients[idx];
    }
    return null;
  },

  // --- Chamber Voice Dictations & Audio Notes ---
  getDictations(advocateId = "") {
    if (!advocateId) return [];
    const dictations = readFile("dev_dictations.json", DEFAULT_DICTATIONS);
    return dictations.filter((d) => this.matchesAdvocate(d, advocateId));
  },

  getDictationById(id) {
    const dictations = readFile("dev_dictations.json", DEFAULT_DICTATIONS);
    return dictations.find((d) => d._id === id || d.id === id) || null;
  },

  createDictation(data) {
    const dictations = readFile("dev_dictations.json", DEFAULT_DICTATIONS);
    const newDictation = {
      _id: "dict_" + Date.now().toString(),
      id: "dict_" + Date.now().toString(),
      advocateId: data.advocateId || "",
      title: data.title || `Chamber Dictation — ${new Date().toLocaleDateString("en-IN")}`,
      category: data.category || "General Chamber",
      matter: data.matter || "General Practice",
      matterId: data.matterId || "",
      duration: data.duration || "00:45",
      date: data.date || "Just now",
      transcript: data.transcript || "",
      actionItems: Array.isArray(data.actionItems) ? data.actionItems : [],
      audioUrl: data.audioUrl || "",
      status: "archived",
      createdAt: new Date().toISOString(),
      ...data,
    };
    dictations.unshift(newDictation);
    writeFile("dev_dictations.json", dictations);
    return newDictation;
  },

  deleteDictation(id) {
    const dictations = readFile("dev_dictations.json", DEFAULT_DICTATIONS);
    const filtered = dictations.filter((d) => d._id !== id && d.id !== id);
    writeFile("dev_dictations.json", filtered);
    return filtered.length < dictations.length;
  },

  convertDictationToCaseNote(id, advocateId = "") {
    const dictations = readFile("dev_dictations.json", DEFAULT_DICTATIONS);
    const dict = dictations.find((d) => d._id === id || d.id === id);
    if (!dict) return null;

    const actionList = (dict.actionItems || []).map((a, i) => `${i + 1}. ${a}`).join("\n");
    const noteContent = `${dict.transcript}\n\nKey Action Items:\n${actionList}`;

    const newNote = this.addCaseNote({
      advocateId,
      matterId: dict.matterId || "general",
      matterTitle: dict.matter || "General Chamber Practice",
      title: `[Audio Dictation] ${dict.title}`,
      content: noteContent,
      category: dict.category === "Cross-Exam Strategy" ? "precedent_notes" : "client_instructions",
      isConfidential: true,
      tags: ["Voice Dictation", dict.category, "Chamber Memo"],
    });

    return newNote;
  },

  // --- ERP: Trust / IOLTA Escrow Accounting ---
  getTrustTransactions(advocateId = "") {
    if (!advocateId) return [];
    const transactions = readFile("dev_trust.json", DEFAULT_TRUST_TRANSACTIONS);
    return transactions.filter((t) => this.matchesAdvocate(t, advocateId));
  },

  addTrustTransaction(data) {
    const transactions = readFile("dev_trust.json", DEFAULT_TRUST_TRANSACTIONS);
    const resolvedAdv = this.resolveAdvocateByIdOrName(data.advocateId, data.verifiedBy || data.advocateName);
    const newTx = {
      _id: "tru_" + Date.now().toString(),
      id: "tru_" + Date.now().toString(),
      type: data.type || "deposit",
      clientName: data.clientName || "Client Deposit",
      citizenId: data.citizenId || "",
      matterTitle: data.matterTitle || "General Client Escrow",
      matterId: data.matterId || "",
      purpose: data.purpose || "Advance Retainer Escrow",
      referenceNumber: data.referenceNumber || `TXN/${Date.now()}`,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      status: "cleared",
      createdAt: new Date().toISOString(),
      ...data,
      amount: Number(data.amount) || 0,
      advocateId: resolvedAdv.advocateId,
      advocateName: resolvedAdv.advocateName,
      verifiedBy: data.verifiedBy || resolvedAdv.advocateName,
    };
    transactions.unshift(newTx);
    writeFile("dev_trust.json", transactions);
    return newTx;
  },

  // --- ERP: Chamber Disbursements & Expenses ---
  getExpenses(advocateId = "") {
    if (!advocateId) return [];
    const expenses = readFile("dev_expenses.json", DEFAULT_EXPENSES);
    return expenses.filter((e) => this.matchesAdvocate(e, advocateId));
  },

  addExpense(data) {
    const expenses = readFile("dev_expenses.json", DEFAULT_EXPENSES);
    const resolvedAdv = this.resolveAdvocateByIdOrName(data.advocateId, data.advocateName);
    const newExp = {
      _id: "exp_" + Date.now().toString(),
      id: "exp_" + Date.now().toString(),
      matterTitle: data.matterTitle || "Chamber Operations",
      matterId: data.matterId || "general",
      clientName: data.clientName || "Chamber Expense",
      category: data.category || "Court Fee Stamps & Welfare",
      description: data.description || "Chamber operating disbursement",
      paidBy: data.paidBy || "Chamber Petty Cash",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      receiptNumber: data.receiptNumber || `RCP/${Date.now().toString().slice(-4)}`,
      isReimbursable: data.isReimbursable !== undefined ? data.isReimbursable : true,
      status: "approved",
      createdAt: new Date().toISOString(),
      ...data,
      amount: Number(data.amount) || 0,
      advocateId: resolvedAdv.advocateId,
      advocateName: resolvedAdv.advocateName,
    };
    expenses.unshift(newExp);
    writeFile("dev_expenses.json", expenses);
    return newExp;
  },

  // --- ERP: Human Resource Management (Huremaso) ---
  getAssociates(advocateId = "") {
    if (!advocateId) return [];
    const associates = readFile("dev_associates.json", DEFAULT_ASSOCIATES);
    return associates.filter((a) => this.matchesAdvocate(a, advocateId));
  },

  addAssociate(data) {
    const associates = readFile("dev_associates.json", DEFAULT_ASSOCIATES);
    const resolvedAdv = this.resolveAdvocateByIdOrName(data.advocateId, data.advocateName);
    const newAsc = {
      _id: "asc_" + Date.now().toString(),
      id: "asc_" + Date.now().toString(),
      fullName: data.fullName,
      role: data.role || "Litigation Junior",
      enrollmentNumber: data.enrollmentNumber || "Bar Enrollment Pending",
      phone: data.phone || "",
      email: data.email || "",
      status: "Active",
      courtPass: data.courtPass || "KHCAA Temporary Pass",
      activeMattersAssigned: Number(data.activeMattersAssigned) || 0,
      attendanceToday: "Present — Chamber Desk",
      createdAt: new Date().toISOString(),
      ...data,
      advocateId: resolvedAdv.advocateId,
      advocateName: resolvedAdv.advocateName,
    };
    associates.unshift(newAsc);
    writeFile("dev_associates.json", associates);
    return newAsc;
  },

  // --- ERP: Overview & Financial Ledger Summary ---
  getErpOverview(advocateId = "") {
    const invoices = this.getInvoices(advocateId);
    const trust = this.getTrustTransactions(advocateId);
    const expenses = this.getExpenses(advocateId);
    const associates = this.getAssociates(advocateId);
    const clients = this.getClients(advocateId);

    const totalBilled = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    const totalCollected = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    const totalPending = totalBilled - totalCollected;

    const totalTrustDeposits = trust
      .filter((t) => t.type === "deposit")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalTrustDisbursements = trust
      .filter((t) => t.type === "disbursement" || t.type === "drawdown")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const trustEscrowBalance = totalTrustDeposits - totalTrustDisbursements;

    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const reimbursableExpenses = expenses
      .filter((e) => e.isReimbursable)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const totalGstBilled = invoices.reduce((sum, inv) => sum + (Number(inv.gstAmount) || 0), 0);

    return {
      financials: {
        totalBilled,
        totalCollected,
        totalPending,
        trustEscrowBalance,
        totalTrustDeposits,
        totalTrustDisbursements,
        totalExpenses,
        reimbursableExpenses,
        totalGstBilled,
        gstRcmEligibleCount: invoices.filter((i) => i.clientName?.toLowerCase().includes("ltd") || i.clientName?.toLowerCase().includes("llp")).length,
      },
      counts: {
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter((i) => i.status === "paid").length,
        pendingInvoices: invoices.filter((i) => i.status !== "paid").length,
        trustTransactions: trust.length,
        expensesCount: expenses.length,
        associatesCount: associates.length,
        retainersCount: clients.filter((c) => c.status === "Retainer" || c.category?.toLowerCase().includes("corporate")).length,
      },
    };
  },

  // --- Bench Analytics & Chamber Reports ---
  getBenchAnalytics(advocateId) {
    if (!advocateId) {
      return {
        kpis: {
          winRate: "0%",
          judgmentsAnalyzed: 0,
          avgDisposalMonths: "—",
          citationEfficacy: "—",
          favorableSettlementRatio: "0%",
          activeMattersCount: 0,
          todayHearingsCount: 0,
        },
        practiceAreas: [],
        courtBenches: [],
      };
    }

    const matters = this.getAdvocateMatters(advocateId) || [];
    const causelist = this.getCauseList(advocateId) || [];

    const totalMatters = matters.length;
    const disposedStatuses = ["disposed", "decided", "closed", "completed", "won", "settled", "favorable"];
    const settledStatuses = ["settled", "mediated", "lok_adalat"];
    const activeStatuses = ["active", "in_progress", "hearing", "pending", "open", "filed"];

    const disposedMatters = matters.filter((m) =>
      disposedStatuses.some((s) => String(m.status || "").toLowerCase().includes(s))
    );
    const favorableMatters = disposedMatters.filter((m) => {
      const outcome = `${m.status || ""} ${m.outcome || ""} ${m.disposition || ""}`.toLowerCase();
      return !outcome.includes("dismissed") && !outcome.includes("lost") && !outcome.includes("adverse");
    });
    const settledMatters = matters.filter((m) =>
      settledStatuses.some((s) => `${m.status || ""} ${m.outcome || ""}`.toLowerCase().includes(s))
    );
    const activeMatters = matters.filter((m) => {
      const st = String(m.status || "").toLowerCase();
      return !st || activeStatuses.some((s) => st.includes(s));
    });

    const winRatePct =
      disposedMatters.length > 0 ? Math.round((favorableMatters.length / disposedMatters.length) * 100) : 0;
    const settlementPct =
      totalMatters > 0 && settledMatters.length > 0
        ? `${Math.round((settledMatters.length / totalMatters) * 100)}%`
        : "0%";

    const domainMap = new Map();
    for (const m of matters) {
      const area = (m.category || m.practiceArea || m.caseType || "General Litigation").trim();
      if (!domainMap.has(area)) domainMap.set(area, { total: 0, favorable: 0, disposed: 0 });
      const entry = domainMap.get(area);
      entry.total += 1;
      const outcome = `${m.status || ""} ${m.outcome || ""} ${m.disposition || ""}`.toLowerCase();
      if (disposedStatuses.some((s) => outcome.includes(s))) {
        entry.disposed += 1;
        if (!outcome.includes("dismissed") && !outcome.includes("lost") && !outcome.includes("adverse")) {
          entry.favorable += 1;
        }
      }
    }
    const practiceAreas = Array.from(domainMap.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 6)
      .map(([area, stats]) => ({
        area,
        rate: stats.disposed > 0 ? `${Math.round((stats.favorable / stats.disposed) * 100)}%` : "0%",
        count: `${stats.total} ${stats.total === 1 ? "matter" : "matters"}`,
      }));

    const benchMap = new Map();
    for (const c of causelist) {
      const bench = (c.courtHall || c.courtName || c.court || "Unassigned Court").trim();
      if (!benchMap.has(bench)) {
        benchMap.set(bench, {
          bench,
          judge: (c.judge || c.coram || c.presidingJudge || "Bench").trim(),
          hearings: 0,
        });
      }
      benchMap.get(bench).hearings += 1;
    }
    for (const m of matters) {
      const bench = (m.court || m.courtName || "").trim();
      if (!bench) continue;
      if (!benchMap.has(bench)) {
        benchMap.set(bench, {
          bench,
          judge: (m.judge || m.coram || "Presiding Bench").trim(),
          hearings: 0,
        });
      }
      benchMap.get(bench).hearings += 1;
    }
    const courtBenches = Array.from(benchMap.values())
      .sort((a, b) => b.hearings - a.hearings)
      .slice(0, 6)
      .map((b) => ({
        bench: b.bench,
        judge: b.judge,
        matters: `${b.hearings} ${b.hearings === 1 ? "record" : "records"}`,
        disposition: disposedMatters.length > 0 ? `${winRatePct}% Favorable` : "Active Docket",
      }));

    return {
      kpis: {
        winRate: disposedMatters.length > 0 ? `${winRatePct}%` : "0%",
        judgmentsAnalyzed: disposedMatters.length,
        avgDisposalMonths: "—",
        citationEfficacy: "—",
        favorableSettlementRatio: settlementPct,
        activeMattersCount: activeMatters.length,
        todayHearingsCount: causelist.length,
      },
      practiceAreas,
      courtBenches,
    };
  },

  getChamberReports(advocateId) {
    if (!advocateId) return [];
    const reports = readFile("dev_reports.json", []);
    return Array.isArray(reports)
      ? reports.filter((r) => r.advocateId && String(r.advocateId) === String(advocateId))
      : [];
  },

  generateChamberReport(data) {
    if (!data?.advocateId) {
      throw new Error("advocateId is required to generate a chamber report");
    }
    const reports = readFile("dev_reports.json", []);
    const list = Array.isArray(reports) ? reports : [];
    const newReport = {
      _id: "rep_" + Date.now().toString(),
      id: "rep_" + Date.now().toString(),
      advocateId: String(data.advocateId),
      title: data.title || `Practice Audit — ${new Date().toLocaleDateString("en-IN")}`,
      category: data.category || "General Audit",
      period: data.period || "Current Period",
      generatedDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      metrics: data.metrics || {},
      fileSize: data.fileSize || "Generated TXT",
      status: "Certified",
      createdAt: new Date().toISOString(),
    };
    list.unshift(newReport);
    writeFile("dev_reports.json", list);
    return newReport;
  },

  // --- Case Preparation & Bench Argument Dossiers ---
  getCasePrepDossier(matterId = "", advocateId = "") {
    const cleanMatterId = String(matterId || "").trim();
    if (!cleanMatterId || !advocateId) {
      return null;
    }

    const targetId = cleanMatterId;
    const store = readFile("dev_case_prep.json", {});
    const matters = readFile("dev_matters.json", DEFAULT_MATTERS);
    const matchedMatter = matters.find(
      (item) =>
        item._id === targetId ||
        item.id === targetId ||
        item.caseNumber === targetId ||
        item.matterTitle === targetId ||
        item.title === targetId
    );

    if (matchedMatter && !this.matchesAdvocate(matchedMatter, advocateId)) {
      return null;
    }

    const canonicalId = matchedMatter?._id || targetId;
    const scopedKey = `${advocateId}::${canonicalId}`;
    if (store[scopedKey]) {
      return store[scopedKey];
    }

    if (store[canonicalId]) {
      const existing = store[canonicalId];
      const ownedByAdv =
        (existing.advocateId && String(existing.advocateId) === String(advocateId)) ||
        (matchedMatter && this.matchesAdvocate(matchedMatter, advocateId));

      if (ownedByAdv) {
        return existing;
      }
    }

    if (!matchedMatter) {
      return null;
    }

    const m = matchedMatter || {};
    return {
      matterId: canonicalId,
      advocateId: String(advocateId || ""),
      matterTitle: m.matterTitle || m.title || "Untitled Matter",
      caseNumber: m.caseNumber || "Pending Filing",
      courtForum: m.courtForum || m.court || "Forum Not Specified",
      bench: m.courtHall || "Awaiting Listing",
      coram: "",
      hearingStage: m.stage || m.status || "Active Matter",
      itemNumber: "",
      listedDate: m.nextHearingDate
        ? new Date(m.nextHearingDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Not Listed",
      issues: [],
      precedents: [],
      benchInquiries: [],
      speakingNotes: [],
      witnessQuestions: [],
      evidenceExhibits: [],
      lastUpdated: m.updatedAt || m.createdAt || new Date().toISOString(),
    };
  },

  saveCasePrepDossier(matterId, dossierData, advocateId = "") {
    if (!matterId || !advocateId) return null;
    const store = readFile("dev_case_prep.json", {});
    const cleanId = String(matterId || "").trim();
    const scopedKey = `${advocateId}::${cleanId}`;
    store[scopedKey] = {
      ...dossierData,
      matterId: cleanId,
      advocateId: String(advocateId || ""),
      lastUpdated: new Date().toISOString(),
    };
    writeFile("dev_case_prep.json", store);
    return store[scopedKey];
  },

  // --- Autonomous AI Legal Agents & Workflows (Option 4) ---
  getAgents() {
    return readFile("dev_agents.json", DEFAULT_AGENTS);
  },

  toggleAgentStatus(agentId) {
    const agents = this.getAgents();
    const idx = agents.findIndex((a) => a.id === agentId);
    if (idx !== -1) {
      agents[idx].status = agents[idx].status === "active" ? "paused" : "active";
      writeFile("dev_agents.json", agents);
      return agents[idx];
    }
    return null;
  },

  triggerAgent(agentId, params = {}) {
    const agents = this.getAgents();
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return null;

    const now = new Date();
    const nowTimeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " IST";
    let newLogs = [];
    let executionResult = {};

    if (agentId === "agent_causelist") {
      newLogs = [
        { timestamp: nowTimeStr, level: "info", message: "Connecting to eCourts High Court of Kerala API Gateway..." },
        { timestamp: nowTimeStr, level: "info", message: `Executing query for Advocate Roll No: ${agent.config?.barRollNumber || "Chamber Roll"}` },
        { timestamp: nowTimeStr, level: "info", message: "Parsing Court Hall 2A (Division Bench) & Court Hall 1 (Sub Court) daily rosters..." },
        { timestamp: nowTimeStr, level: "success", message: "Discovered 2 Active Items: Item #14 in Court Hall 2A (WP(C) 19482/2024) and Item #22 in Sub Court (OS 412/2023)." },
        { timestamp: nowTimeStr, level: "success", message: "Causelist synchronized with chamber calendar & WhatsApp alerts dispatched." },
      ];
      executionResult = {
        itemsDiscovered: 2,
        courtHall: "Court Hall 2A & Hall 1",
        bench: "Division Bench / Special Original",
        syncedToDashboard: true,
      };
    } else if (agentId === "agent_caveat") {
      newLogs = [
        { timestamp: nowTimeStr, level: "info", message: "Polling e-Filing Registry: Caveat Petitions under Section 148A CPC..." },
        { timestamp: nowTimeStr, level: "info", message: "Cross-matching against chamber active client roster (8 clients)..." },
        { timestamp: nowTimeStr, level: "success", message: "Verification completed: 0 adverse caveats registered in last 24 hours against active clients." },
        { timestamp: nowTimeStr, level: "info", message: "Caveat Watchlist status: Green / All clients cleared." },
      ];
      executionResult = {
        clientsScanned: 8,
        adverseCaveatsFound: 0,
        registryCleared: true,
      };
    } else if (agentId === "agent_bns_concordance") {
      newLogs = [
        { timestamp: nowTimeStr, level: "info", message: `Running BNS-BNSS Statutory Concordance Engine on query: "${params.query || "IPC 420 / CrPC 438"}"` },
        { timestamp: nowTimeStr, level: "info", message: "Cross-referencing Bharatiya Nyaya Sanhita 2023 & BNSS 2023 concordances..." },
        { timestamp: nowTimeStr, level: "success", message: "IPC Section 420 (Cheating) successfully mapped to BNS Section 318(4). Punishment: 7 Years + Fine." },
        { timestamp: nowTimeStr, level: "success", message: "CrPC Section 438 (Anticipatory Bail) mapped to BNSS Section 482. Procedural mandate verified." },
      ];
      executionResult = {
        ipcSection: "IPC 420",
        bnsSection: "BNS 318(4)",
        bnsTitle: "Cheating and dishonestly inducing delivery of property",
        punishment: "Imprisonment extending to 7 years and fine",
        bnssProcedure: "Section 482 (Anticipatory Bail)",
      };
    } else {
      newLogs = [
        { timestamp: nowTimeStr, level: "info", message: "Executing Client Intake Triage & Conflict Check..." },
        { timestamp: nowTimeStr, level: "info", message: "Scanning Chamber Representation History (Bar Council Rule 33)..." },
        { timestamp: nowTimeStr, level: "success", message: "Conflict Check: No prior representation of respondent found." },
        { timestamp: nowTimeStr, level: "success", message: "Jurisdiction & forum routing completed: High Court of Kerala (WP(C))." },
      ];
      executionResult = {
        conflictClear: true,
        recommendedCourt: "High Court of Kerala (Ernakulam)",
        estimatedStamp: "₹2,500",
      };
    }

    agent.lastRunAt = now.toISOString();
    agent.lastStatus = "success";
    agent.recentLogs = [...newLogs, ...(agent.recentLogs || [])].slice(0, 15);
    if (!agent.metrics) agent.metrics = { totalRuns: 1, successRate: "100%", itemsDiscovered: 1 };
    agent.metrics.totalRuns = (agent.metrics.totalRuns || 0) + 1;

    writeFile("dev_agents.json", agents);
    return { agent, logs: newLogs, executionResult };
  },

  convertBnsSection(query = "420") {
    const q = String(query).trim().toLowerCase();
    const map = {
      "420": {
        ipc: "IPC Section 420",
        ipcTitle: "Cheating and dishonestly inducing delivery of property",
        bns: "BNS Section 318(4)",
        bnsTitle: "Cheating and dishonestly inducing delivery of property",
        punishment: "Imprisonment of either description for a term which may extend to 7 years, and shall also be liable to fine.",
        substantiveChange: "Cognizable and non-bailable; triable by Magistrate of First Class. Language aligned with modern electronic property transactions.",
        correspondingBnss: "Section 173 (Registration of FIR) & Section 480/483 (Bail)",
      },
      "302": {
        ipc: "IPC Section 302",
        ipcTitle: "Punishment for Murder",
        bns: "BNS Section 103(1)",
        bnsTitle: "Punishment for Murder",
        punishment: "Death or imprisonment for life, and shall also be liable to fine.",
        substantiveChange: "Includes sub-section 103(2) penalizing mob lynching by 5 or more persons based on race, caste, or community with death or life imprisonment.",
        correspondingBnss: "Section 193 (Charge-sheet) & Section 483 (High Court Bail)",
      },
      "379": {
        ipc: "IPC Section 379",
        ipcTitle: "Punishment for Theft",
        bns: "BNS Section 303(2)",
        bnsTitle: "Punishment for Theft",
        punishment: "Imprisonment of either description for a term which may extend to 3 years, or with fine, or with both.",
        substantiveChange: "First-time offenders where stolen value is under ₹5,000 may be awarded Community Service upon return of property under proviso to Section 303(2).",
        correspondingBnss: "Section 173 / Section 480",
      },
      "406": {
        ipc: "IPC Section 406",
        ipcTitle: "Punishment for Criminal Breach of Trust",
        bns: "BNS Section 316(2)",
        bnsTitle: "Punishment for Criminal Breach of Trust",
        punishment: "Imprisonment of either description for a term which may extend to 5 years, or with fine, or with both.",
        substantiveChange: "Increased maximum imprisonment from 3 years under IPC to 5 years under BNS 316(2).",
        correspondingBnss: "Section 480 / Section 482",
      },
      "498a": {
        ipc: "IPC Section 498A",
        ipcTitle: "Husband or relative of husband of a woman subjecting her to cruelty",
        bns: "BNS Section 85",
        bnsTitle: "Husband or relative of husband subjecting woman to cruelty",
        punishment: "Imprisonment for a term which may extend to 3 years and shall also be liable to fine.",
        substantiveChange: "Substantive definition of cruelty maintained; placed under Chapter V (Offences Against Women and Children).",
        correspondingBnss: "Section 482 (Anticipatory Bail before High Court)",
      },
      "438": {
        ipc: "CrPC Section 438",
        ipcTitle: "Direction for grant of bail to person apprehending arrest (Anticipatory Bail)",
        bns: "BNSS Section 482",
        bnsTitle: "Direction for grant of bail to person apprehending arrest",
        punishment: "Procedural Bail Mandate",
        substantiveChange: "High Court and Court of Session retain concurrent jurisdiction. Statutory notice to Public Prosecutor and mandatory presence conditions preserved.",
        correspondingBnss: "Section 482 BNSS 2023",
      },
    };

    const cleanNum = q.replace(/[^0-9a-z]/g, "");
    return map[cleanNum] || map["420"];
  },

  // --- Chamber Knowledge Base & Bare Act Studio (Milestone 1) ---
  getBareActs(query = "") {
    const acts = readFile("dev_bare_acts.json", DEFAULT_BARE_ACTS);
    if (!query || !query.trim()) return acts;
    const q = query.toLowerCase();
    return acts.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.shortTitle.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.sections.some((s) => s.sectionNumber.toLowerCase().includes(q) || s.heading.toLowerCase().includes(q))
    );
  },

  getBareActDetails(actId) {
    const acts = readFile("dev_bare_acts.json", DEFAULT_BARE_ACTS);
    return acts.find((a) => a.id === actId) || acts[0];
  },

  getPlaybooks() {
    return readFile("dev_playbooks.json", DEFAULT_PLAYBOOKS);
  },

  getKbArticles() {
    return readFile("dev_kb_articles.json", DEFAULT_KB_ARTICLES);
  },

  getResearchBriefs(advocateId = "") {
    if (!advocateId) return [];
    const briefs = readFile("dev_research_briefs.json", DEFAULT_RESEARCH_BRIEFS);
    return briefs.filter((b) => this.matchesAdvocate(b, advocateId));
  },

  createResearchBrief(data) {
    const briefs = readFile("dev_research_briefs.json", DEFAULT_RESEARCH_BRIEFS);
    const newBrief = {
      _id: "brief_" + Date.now().toString(),
      id: "brief_" + Date.now().toString(),
      title: data.title || "Untitled Research Brief",
      matterReference: data.matterReference || "General Chamber Research",
      category: data.category || "Constitutional Law",
      legalPropositions: data.legalPropositions || [],
      citations: data.citations || [],
      author: data.author || "Counsel",
      summary: data.summary || "",
      createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      ...data,
    };
    briefs.unshift(newBrief);
    writeFile("dev_research_briefs.json", briefs);
    return newBrief;
  },

  // --- Multi-Party Case Collaboration Room (Milestone 2) ---
  getCollabRooms(advocateId = "") {
    if (!advocateId) return [];
    const rooms = readFile("dev_collab_rooms.json", DEFAULT_COLLAB_ROOMS);
    return rooms.filter(
      (r) =>
        this.matchesAdvocate(r, advocateId) ||
        (Array.isArray(r.participants) && r.participants.some((p) => String(p.id) === String(advocateId)))
    );
  },

  getCollabRoomById(roomId) {
    const rooms = readFile("dev_collab_rooms.json", DEFAULT_COLLAB_ROOMS);
    return rooms.find((r) => r.id === roomId) || null;
  },

  createCollabRoom(data) {
    const rooms = readFile("dev_collab_rooms.json", DEFAULT_COLLAB_ROOMS);
    const newRoom = {
      id: data.id || "room_" + Date.now().toString(),
      subject: data.subject || "Chamber Case Collaboration Session",
      matterId: data.matterId || "",
      matterTitle: data.matterTitle || "Active Chamber Matter",
      status: "ready",
      scheduledFor: data.scheduledFor || "Immediate Session",
      pinnedExhibit: data.pinnedExhibit || null,
      participants: data.participants || [
        {
          id: data.advocateId || "",
          name: data.hostName || "Lead Counsel",
          role: "Lead Advocate (Host)",
          enrollment: data.barCouncilNumber || "",
          isOnline: true,
          isMuted: false,
          isVideoOn: true,
        },
      ],
      notes: "",
      createdAt: new Date().toISOString(),
      ...data,
    };
    rooms.unshift(newRoom);
    writeFile("dev_collab_rooms.json", rooms);
    return newRoom;
  },

  saveCollabNotes(roomId, notes, advocateId = "") {
    const rooms = readFile("dev_collab_rooms.json", DEFAULT_COLLAB_ROOMS);
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      room.notes = notes;
      writeFile("dev_collab_rooms.json", rooms);

      // Also automatically create or update a case note for the associated matter
      if (room.matterId) {
        devStore.addCaseNote({
          advocateId,
          matterId: room.matterId,
          title: `Collaboration Room Notes: ${room.subject}`,
          content: notes,
          category: "hearing_memo",
          isConfidential: true,
        });
      }
      return room;
    }
    return null;
  },

  // --- Courtroom Oral Argument AI Simulator & Bench Query Coach (Milestone 3) ---
  simulateBenchTurn(data) {
    const {
      matterId = "mat_wpc_19482",
      benchPersona = "division_bench_2a",
      argument = "",
      turnIndex = 0,
    } = data;

    const lowerArg = argument.toLowerCase();

    // Check for legal keywords in argument
    const hasValsamma = lowerArg.includes("valsamma");
    const hasSection16 = lowerArg.includes("16") || lowerArg.includes("section 16");
    const hasWhirlpool = lowerArg.includes("whirlpool");
    const hasNaturalJustice = lowerArg.includes("natural justice") || lowerArg.includes("audi alteram");
    const hasArbitrary = lowerArg.includes("arbitrary") || lowerArg.includes("article 14");
    const hasPrecedent = lowerArg.includes("scc") || lowerArg.includes("klt") || lowerArg.includes("air");
    const hasJurisdiction = lowerArg.includes("jurisdiction") || lowerArg.includes("maintainable");
    const hasInjunction = lowerArg.includes("injunction") || lowerArg.includes("stay") || lowerArg.includes("status quo");

    // Calculate dynamic scores based on legal quality
    let persuasiveness = 74;
    let statutoryPrecision = 72;
    let disposition = "Skeptical on Maintainability";
    let nextQuery = "";
    let recommendedCitation = "Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1";
    let coachCritique = "Good opening demeanor. However, address the statutory remedy under Section 16(3) before pressing for Article 226.";

    if (benchPersona === "division_bench_2a") {
      // Mustaque & Eapen, JJ. - Kerala High Court Division Bench 2A
      if (turnIndex === 0) {
        if (hasWhirlpool || hasJurisdiction || hasNaturalJustice) {
          persuasiveness = 88;
          statutoryPrecision = 90;
          disposition = "Engaged on Statutory Jurisdiction";
          nextQuery =
            "Counsel, we take note of Whirlpool. But look at paragraph 8 of the KSEB counter affidavit. They claim the transmission line falls under an already notified gazette corridor under Section 164. What is your specific factual answer to the gazette alignment?";
          recommendedCitation = "Power Grid Corp of India v. Century Textiles Ltd (2017) 5 SCC 143";
          coachCritique =
            "Strong rebuttal establishing lack of jurisdiction. Now pivot directly to the absence of landowner notice prior to the gazette notification.";
        } else {
          persuasiveness = 75;
          statutoryPrecision = 72;
          disposition = "Skeptical on Alternative Remedy";
          nextQuery =
            "Counsel, before we examine the merits of your tree-felling grievance, why should this Division Bench exercise extraordinary prerogative writ jurisdiction when Section 16(3) of the Telegraph Act provides an efficacious statutory forum before the District Court?";
          recommendedCitation = "Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1";
          coachCritique =
            "You must invoke the three exceptions in Whirlpool Corporation (breach of natural justice, total lack of jurisdiction, or violation of fundamental rights) to bypass the alternate remedy bar.";
        }
      } else if (turnIndex === 1) {
        if (hasValsamma || hasSection16) {
          persuasiveness = 94;
          statutoryPrecision = 96;
          disposition = "Inclined to Grant Interim Order";
          nextQuery =
            "Very well, Counsel. Valsamma is a Full Bench decision binding on us. If resistance was formally lodged and the licensee did not approach the District Magistrate, the entry appears prima facie without authority of law. What interim directions are you seeking pending counter from the Board?";
          recommendedCitation = "Valsamma v. KSEB 2012 (2) KLT 368 (Full Bench)";
          coachCritique =
            "Outstanding invocation of the Valsamma Full Bench ratio! You have persuaded the Bench that the board cannot enter private land upon objection without a District Magistrate order under Section 16(1). Frame your interim prayer concisely.";
        } else {
          persuasiveness = 78;
          statutoryPrecision = 80;
          disposition = "Pressing for Precedent Authority";
          nextQuery =
            "You argue that the utility cannot enter upon resistance, but which binding precedent of this Court establishes that the authority MUST refer the matter to the District Magistrate rather than proceeding unilaterally?";
          recommendedCitation = "Valsamma v. KSEB 2012 (2) KLT 368 (Full Bench)";
          coachCritique =
            "Immediately cite Valsamma v. KSEB 2012 (2) KLT 368 (FB). That judgment directly settles that unilateral entry upon landowner objection is an actionable trespass.";
        }
      } else {
        if (hasInjunction || hasArbitrary || hasValsamma) {
          persuasiveness = 96;
          statutoryPrecision = 98;
          disposition = "Interim Stay Granted";
          nextQuery =
            "We have heard the Counsel. In view of the law laid down in Valsamma and absence of an order under Section 16(1), there shall be an interim stay of all felling activities in Sy. No. 142/3 for a period of four weeks. Standing counsel to file detailed counter.";
          recommendedCitation = "Executive Engineer, KSEB v. Doddakka (2015) 15 SCC 738";
          coachCritique =
            "Full oral argument victory! Bench disposition converted from skeptical to an interim stay of execution.";
        } else {
          persuasiveness = 85;
          statutoryPrecision = 84;
          disposition = "Notice Before Admission Issued";
          nextQuery =
            "We will issue Notice Before Admission to respondents 1 to 3 returnable in two weeks. Status quo to be maintained in the interregnum.";
          recommendedCitation = "Century Textiles & Industries Ltd (2017) 5 SCC 143";
          coachCritique =
            "Favorable result achieved. For next rehearsal, emphasize the precise survey number to secure an absolute stay rather than mere status quo.";
        }
      }
    } else {
      // Single Bench / General Criminal / Commercial Bench
      if (hasPrecedent || hasSection16 || hasWhirlpool) {
        persuasiveness = 91;
        statutoryPrecision = 92;
        disposition = "Persuaded on Merits";
        nextQuery =
          "Counsel, your precedent formulation is coherent. How do you respond to the question of delay and laches in approaching this Court?";
        recommendedCitation = "State of M.P. v. Bhailal Bhai AIR 1964 SC 1006";
        coachCritique = "Well argued on substantive grounds. Rebut the laches query by showing immediate cause of action.";
      } else {
        persuasiveness = 76;
        statutoryPrecision = 74;
        disposition = "Seeking Clarification";
        nextQuery =
          "Counsel, substantiate your oral submission with specific statutory provisions and judicial ratios. Which Section is violated?";
        recommendedCitation = "Arnesh Kumar v. State of Bihar (2014) 8 SCC 273";
        coachCritique = "Anchor your argument in statutory subsections rather than broad assertions.";
      }
    }

    return {
      success: true,
      turnIndex: turnIndex + 1,
      benchPersona,
      matterId,
      benchQuery: nextQuery,
      persuasiveness,
      statutoryPrecision,
      disposition,
      recommendedCitation,
      coachCritique,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
  },

  getCourtroomSessions(advocateId = "") {
    if (!advocateId) return [];
    const sessions = readFile("dev_courtroom_sessions.json", DEFAULT_COURTROOM_SESSIONS);
    return sessions.filter((s) => this.matchesAdvocate(s, advocateId));
  },

  saveCourtroomSession(data) {
    const sessions = readFile("dev_courtroom_sessions.json", DEFAULT_COURTROOM_SESSIONS);
    const newSession = {
      id: "session_" + Date.now().toString(),
      advocateId: data.advocateId || "",
      matterId: data.matterId || "",
      matterTitle: data.matterTitle || "Oral Argument Practice Session",
      benchPersona: data.benchPersona || "division_bench_2a",
      benchName: data.benchName || "High Court Division Bench",
      finalScore: data.finalScore || 92,
      statutoryPrecision: data.statutoryPrecision || 94,
      disposition: data.disposition || "Interim Stay Granted",
      turns: data.turns || [],
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      duration: data.duration || "06:42",
      ...data,
    };
    sessions.unshift(newSession);
    writeFile("dev_courtroom_sessions.json", sessions);
    return newSession;
  },

  // --- Personal AI Legal Twin & Autonomous Associate Workforce Studio (Milestone 4) ---
  getAdvocateTwin(advocateId = "") {
    const twins = readFile("dev_ai_twins.json", {});
    return (advocateId && twins[advocateId]) || { ...DEFAULT_AI_TWIN, advocateId };
  },

  updateAdvocateTwin(advocateId = "", updateData = {}) {
    if (!advocateId) return { ...DEFAULT_AI_TWIN };
    const twins = readFile("dev_ai_twins.json", {});
    const current = twins[advocateId] || { ...DEFAULT_AI_TWIN, advocateId };
    const updated = {
      ...current,
      ...updateData,
      lastCalibratedAt: new Date().toISOString(),
    };
    twins[advocateId] = updated;
    writeFile("dev_ai_twins.json", twins);
    return updated;
  },

  simulateTwinReasoning(data = {}) {
    const {
      advocateId = "",
      query = "",
      draftingStyle = "constitutional_assertive",
      primaryJurisdiction = "high_court_kerala",
    } = data;

    const lower = (query || "").toLowerCase();
    let legalOpinion = "";
    let proceduralRoadmap = [];
    let draftClause = "";
    let bindingCitations = [];
    let confidenceScore = 98.6;

    if (
      lower.includes("telegraph") ||
      lower.includes("kseb") ||
      lower.includes("line") ||
      lower.includes("tree") ||
      lower.includes("tower") ||
      lower.includes("16")
    ) {
      legalOpinion =
        "Under Section 10(d) of the Indian Telegraph Act, 1885, the transmission licensee acquires only a user right and is statutorily obligated to cause minimal damage. The moment the property owner offers resistance or files written objections, Section 16(1) mandates that the licensee must approach the District Magistrate for prior permission. Unilateral entry without a District Magistrate order is ultra vires and constitutes actionable trespass amenable to extraordinary writ jurisdiction under Article 226.";
      proceduralRoadmap = [
        "Issue immediate written objection notice under Section 16(1) to Assistant Executive Engineer, KSEB.",
        "Serve caveat petition or representation before the District Magistrate / District Collector, Ernakulam.",
        "File Writ Petition (Civil) under Article 226 before High Court of Kerala seeking mandamus directing referral under Section 16(1) and ad-interim injunction restraining line drawing.",
      ];
      draftClause =
        "It is most respectfully submitted that Respondent No. 2 acted wholly without jurisdiction in entering upon the Petitioner's residential plot without petitioning the District Magistrate under Section 16(1) of the Indian Telegraph Act, 1885, contrary to the binding Full Bench dictum in Valsamma v. KSEB 2012 (2) KLT 368.";
      bindingCitations = [
        "Valsamma v. KSEB 2012 (2) KLT 368 (Full Bench)",
        "Power Grid Corporation of India v. Century Textiles & Industries Ltd. (2017) 5 SCC 143",
        "Executive Engineer, KSEB v. Doddakka (2015) 15 SCC 738",
      ];
    } else if (
      lower.includes("138") ||
      lower.includes("cheque") ||
      lower.includes("negotiable") ||
      lower.includes("notice") ||
      lower.includes("alavi") ||
      lower.includes("demand")
    ) {
      legalOpinion =
        "Under Chapter XVII of the Negotiable Instruments Act, 1881, the cause of action is strictly governed by statutory timelines. Statutory demand notice must be dispatched within 30 days of receiving the bank memo. Where notice is returned unserved with endorsement 'Door Locked' or 'Not Claimed', the three-judge bench decision in C.C. Alavi Haji establishes deemed service under Section 27 of the General Clauses Act. The drawer has 15 days from deemed receipt to pay; failure creates a crystalline cause of action to file the complaint within the subsequent 30 days.";
      proceduralRoadmap = [
        "Procure official Postal Tracking Delivery / Return Certificate from Department of Posts.",
        "Compute 15-day statutory cure window starting from the date of postal delivery or return endorsement.",
        "Draft and institute Criminal Complaint under Section 138 read with Section 142(1)(b) before Judicial First Class Magistrate having territorial jurisdiction over payee bank branch.",
      ];
      draftClause =
        "The Complainant submits that the Statutory Demand Notice was dispatched via Registered Post with Acknowledgment Due to the correct residential address of the Accused. The returned postal envelope with endorsement 'Not Claimed' constitutes deemed service in law under Section 27 of the General Clauses Act as authoritatively settled in C.C. Alavi Haji v. Palapetty Muhammed (2007) 6 SCC 555.";
      bindingCitations = [
        "C.C. Alavi Haji v. Palapetty Muhammed (2007) 6 SCC 555",
        "K. Bhaskaran v. Sankaran Vaidhyan Balan (1999) 7 SCC 510",
        "Dashrath Rupsingh Rathod v. State of Maharashtra (2014) 9 SCC 129",
      ];
    } else if (
      lower.includes("bail") ||
      lower.includes("bnss") ||
      lower.includes("arrest") ||
      lower.includes("482") ||
      lower.includes("fir") ||
      lower.includes("custodial")
    ) {
      legalOpinion =
        "Under Section 482 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 (corresponding to legacy Section 438 CrPC), anticipatory bail is an extraordinary judicial discretion to protect personal liberty against unwarranted incarceration. Since the offence does not mandate life imprisonment and the accused has deep roots in the community, custodial interrogation is unnecessary if the applicant undertakes to cooperate with the investigating officer under Section 35(3) BNSS.";
      proceduralRoadmap = [
        "Verify issuance of Section 35(3) BNSS Notice of Appearance by Investigating Officer.",
        "Compile documentary proof demonstrating clean antecedents, proof of permanent residence, and willingness to join probe.",
        "File Pre-Arrest Bail Application under Section 482 BNSS before the High Court or Sessions Court with prayer for interim protection against coercive steps.",
      ];
      draftClause =
        "The Applicant respectfully submits that the allegations in the FIR are purely civil in texture and lack the foundational ingredients of criminal breach of trust. The Applicant undertakes to cooperate fully with the investigation, surrender passport, and abide by any condition imposed under Section 482(2) BNSS.";
      bindingCitations = [
        "Arnesh Kumar v. State of Bihar (2014) 8 SCC 273",
        "Sushila Aggarwal v. State (NCT of Delhi) (2020) 5 SCC 1",
        "Satender Kumar Antil v. CBI (2022) 10 SCC 51",
      ];
    } else {
      legalOpinion =
        "Reviewing this legal proposition under High Court of Kerala practice standards: Where administrative action is arbitrary, discriminatory, or violative of natural justice (audi alteram partem), the threshold bar of alternate statutory remedies is superseded pursuant to the Whirlpool doctrine. The chamber formulation requires asserting jurisdictional incompetence and procedural non-compliance in the primary synopsis.";
      proceduralRoadmap = [
        "Conduct thorough statutory scrutiny of impugned order or administrative communication.",
        "Formulate core questions of law emphasizing jurisdictional error or violation of Article 14.",
        "Institute appropriate writ or civil proceedings with prayer for status quo ante.",
      ];
      draftClause =
        "It is respectfully submitted that the impugned action violates the salutary principles of natural justice and is tainted with total non-application of mind, warranting the extraordinary exercise of this Hon'ble Court's plenary powers under Article 226 of the Constitution of India.";
      bindingCitations = [
        "Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1",
        "Maneka Gandhi v. Union of India (1978) 1 SCC 248",
        "State of M.P. v. Bhailal Bhai AIR 1964 SC 1006",
      ];
    }

    const simRecord = {
      id: "sim_" + Date.now().toString(),
      query,
      legalOpinion,
      proceduralRoadmap,
      draftClause,
      bindingCitations,
      confidenceScore,
      draftingStyle,
      primaryJurisdiction,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };

    const twins = readFile("dev_ai_twins.json", {});
    if (advocateId) {
      const current = twins[advocateId] || { ...DEFAULT_AI_TWIN, advocateId };
      current.recentSimulations = [simRecord, ...(current.recentSimulations || []).slice(0, 9)];
      twins[advocateId] = current;
      writeFile("dev_ai_twins.json", twins);
    }

    return {
      success: true,
      ...simRecord,
    };
  },

  getTrainingModules() {
    return readFile("dev_training_modules.json", DEFAULT_TRAINING_MODULES);
  },

  evaluateAssociateSubmission(data = {}) {
    const { moduleId, associateAnswer = "", associateName = "Junior Counsel" } = data;
    const modules = readFile("dev_training_modules.json", DEFAULT_TRAINING_MODULES);
    const mod = modules.find((m) => m.id === moduleId) || modules[0];

    const lowerAns = (associateAnswer || "").toLowerCase();
    let issueSpotting = 70;
    let statutoryPrecision = 72;
    let citationAccuracy = 68;

    if (mod.quizScenario && Array.isArray(mod.quizScenario.keyIssues)) {
      mod.quizScenario.keyIssues.forEach((issue) => {
        const words = issue.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        const match = words.some((w) => lowerAns.includes(w));
        if (match) {
          issueSpotting += 8;
          statutoryPrecision += 7;
        }
      });

      if (
        lowerAns.includes("scc") ||
        lowerAns.includes("klt") ||
        lowerAns.includes("air") ||
        lowerAns.includes("2024") ||
        lowerAns.includes("1998") ||
        lowerAns.includes("2007")
      ) {
        citationAccuracy += 22;
      }
    }

    issueSpotting = Math.min(98, issueSpotting);
    statutoryPrecision = Math.min(99, statutoryPrecision);
    citationAccuracy = Math.min(96, citationAccuracy);

    const overallScore = Math.round((issueSpotting + statutoryPrecision + citationAccuracy) / 3);
    const passed = overallScore >= 75;

    let seniorFeedback = passed
      ? "Commendable legal precision. The analysis properly distinguishes substantive vs procedural statutory application and cites the controlling High Court/Supreme Court ratio."
      : "The argument needs stronger grounding in exact statutory sections and landmark ratios. Revisit the module curriculum before drafting live pleadings.";

    const result = {
      success: true,
      moduleId,
      associateName,
      overallScore,
      passed,
      issueSpotting,
      statutoryPrecision,
      citationAccuracy,
      seniorFeedback,
      benchmarkAnswer: mod.quizScenario?.benchmarkAnswer || "",
      landmarkCitation: mod.quizScenario?.landmarkCitation || "",
      evaluatedAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };

    return result;
  },

  getRecruitmentCandidates() {
    return readFile("dev_candidates.json", DEFAULT_CANDIDATES);
  },

  addRecruitmentCandidate(data = {}) {
    const candidates = readFile("dev_candidates.json", DEFAULT_CANDIDATES);
    const newCand = {
      id: "cand_" + Date.now().toString(),
      name: data.name || "Candidate",
      college: data.college || "Government Law College, Ernakulam",
      role: data.role || "Litigation Associate",
      enrollmentNumber: data.enrollmentNumber || `K/${Math.floor(1000 + Math.random() * 9000)}/2024`,
      status: "Screening Review",
      score: "92%",
      experienceYears: data.experienceYears || "1-2 Years",
      appliedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      ...data,
    };
    candidates.unshift(newCand);
    writeFile("dev_candidates.json", candidates);
    return newCand;
  },

  updateCandidateStatus(id, status) {
    const candidates = readFile("dev_candidates.json", DEFAULT_CANDIDATES);
    const cand = candidates.find((c) => c.id === id);
    if (cand) {
      cand.status = status;
      writeFile("dev_candidates.json", candidates);
    }
    return cand;
  },

  // --- Smart Court Causelist Aggregator, Conflict Radar & Client Dispatcher (Milestone 5) ---
  getCauselistRadar(advocateId, meta = {}) {
    if (!advocateId) {
      return {
        success: true,
        todayDate: new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        advocateRoll: meta.enrollmentNumber || "",
        advocateName: meta.advocateName || "Counsel on Record",
        totalHearings: 0,
        conflictsCount: 0,
        items: [],
        conflicts: [],
      };
    }

    const causelist = readFile("dev_causelists.json", DEFAULT_CAUSE_LIST);
    const todayItems = causelist.filter(
      (item) => item.advocateId && String(item.advocateId) === String(advocateId)
    );
    const resolvedAdvocateName = meta.advocateName || "Counsel on Record";

    // Detect Conflicts
    const conflicts = [];
    for (let i = 0; i < todayItems.length; i++) {
      for (let j = i + 1; j < todayItems.length; j++) {
        const a = todayItems[i];
        const b = todayItems[j];

        const differentHall = a.courtHall !== b.courtHall;
        const differentComplex = a.courtName !== b.courtName;

        if (differentHall || differentComplex) {
          conflicts.push({
            id: `conf_${a._id}_${b._id}`,
            severity: differentComplex ? "critical" : "warning",
            severityLabel: differentComplex ? "Critical Multi-Venue Conflict" : "Court Bench Hall Conflict",
            distanceWarning: differentComplex
              ? `Different Court Complexes (${a.courtName || "Court A"} vs ${b.courtName || "Court B"})`
              : "Different Court Halls within the same complex",
            timeA: a.approxTime || "Morning Call",
            timeB: b.approxTime || "Morning Call",
            itemA: {
              id: a._id,
              caseNumber: a.caseNumber,
              courtHall: a.courtHall,
              courtName: a.courtName,
              itemNumber: a.itemNumber,
              bench: a.bench,
            },
            itemB: {
              id: b._id,
              caseNumber: b.caseNumber,
              courtHall: b.courtHall,
              courtName: b.courtName,
              itemNumber: b.itemNumber,
              bench: b.bench,
            },
            recommendation: differentComplex
              ? `${resolvedAdvocateName} cannot physically appear in both ${a.courtHall || "Court A"} (${a.courtName || "Venue A"}) and ${b.courtHall || "Court B"} (${b.courtName || "Venue B"}) simultaneously. Recommend delegating ${b.caseNumber} to a chamber associate or submitting a passover memo.`
              : `Concurrent listing across Court Halls. Submit a passover slip in ${b.courtHall || "the alternate court hall"} to hold the matter for 2nd Call.`,
          });
        }
      }
    }

    return {
      success: true,
      todayDate: new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      advocateRoll: meta.enrollmentNumber || "",
      advocateName: resolvedAdvocateName,
      totalHearings: todayItems.length,
      conflictsCount: conflicts.length,
      items: todayItems,
      conflicts,
    };
  },

  generatePassoverSlip(data = {}) {
    const {
      itemId,
      caseNumber,
      courtHall,
      itemNumber,
      bench,
      reason,
      passoverUntil = "12:00 PM / 2nd Call",
      seniorCounselName = "",
      enrollmentNumber = "",
    } = data;
    const causelist = readFile("dev_causelists.json", DEFAULT_CAUSE_LIST);
    const item = causelist.find(
      (c) => (itemId && c._id === itemId) || (caseNumber && c.caseNumber === caseNumber)
    );

    const resolvedCaseNo = caseNumber || item?.caseNumber || "Listed Matter";
    const passoverSlip = {
      slipNumber: `PS-${Date.now().toString().slice(-6)}`,
      courtHall: courtHall || item?.courtHall || "Court Hall",
      bench: bench || item?.bench || "Presiding Bench",
      itemNumber: itemNumber || item?.itemNumber || 1,
      caseNumber: resolvedCaseNo,
      parties: `${item?.petitioner || "Petitioner"} vs ${item?.respondent || "Respondents"}`,
      seniorCounselName: seniorCounselName || "Counsel on Record",
      enrollmentNumber: enrollmentNumber || "",
      reason:
        reason ||
        `Counsel is currently engaged before another Bench and requests a passover for ${resolvedCaseNo}.`,
      requestedTime: passoverUntil,
      dispatchedTo: "Court Master & Bench Scrutiny Officer",
      generatedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    if (item) {
      item.status = "passover_requested";
      item.passoverSlip = passoverSlip;
      writeFile("dev_causelists.json", causelist);
    }

    return {
      success: true,
      message: "Passover memo drafted and registered for bench presentation.",
      passoverSlip,
      item,
    };
  },

  reassignCauselistItem(data = {}) {
    const { itemId, associateId, associateName = "Chamber Associate", briefNotes = "" } = data;
    const causelist = readFile("dev_causelists.json", DEFAULT_CAUSE_LIST);
    const item = causelist.find((c) => c._id === itemId);

    if (item) {
      item.status = "associate_assigned";
      item.assignedAssociate = {
        id: associateId || "",
        name: associateName,
        enrollmentNumber: data.enrollmentNumber || "",
        assignedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        briefNotes:
          briefNotes ||
          "Appear before the Bench and seek appropriate directions.",
      };
      writeFile("dev_causelists.json", causelist);
    }

    return {
      success: true,
      message: `Representation successfully delegated to ${associateName}.`,
      item,
    };
  },

  dispatchClientHearingUpdate(data = {}) {
    const {
      itemId,
      caseNumber = "",
      clientName = "Client",
      clientPhone = "",
      courtOutcome = "",
      nextHearingDate = "",
      benchRemarks = "",
      seniorCounselName = "Counsel on Record",
    } = data;

    const causelist = readFile("dev_causelists.json", DEFAULT_CAUSE_LIST);
    const item = causelist.find(
      (c) => (itemId && c._id === itemId) || (caseNumber && c.caseNumber === caseNumber)
    );
    const resolvedCaseNo = caseNumber || item?.caseNumber || "Matter";

    if (item) {
      item.status = courtOutcome.toLowerCase().includes("stay") ? "stay_granted" : "adjourned";
      item.lastOutcome = courtOutcome;
      item.nextHearingDate = nextHearingDate;
      item.benchRemarks = benchRemarks;
      writeFile("dev_causelists.json", causelist);
    }

    const englishMessage = `Namaskaram ${clientName}, your matter ${resolvedCaseNo} was heard before the Hon'ble Court today.${courtOutcome ? ` Outcome: ${courtOutcome}.` : ""}${benchRemarks ? ` ${benchRemarks}` : ""}${nextHearingDate ? ` Next listing date: ${nextHearingDate}.` : ""} Warm regards, ${seniorCounselName}.`;
    const malayalamMessage = `നമസ്കാരം ${clientName}, താങ്കളുടെ കേസ് ${resolvedCaseNo} ഇന്ന് ബഹുമാനപ്പെട്ട കോടതി പരിഗണിച്ചു.${courtOutcome ? ` വിധി/ഉത്തരവ്: ${courtOutcome}.` : ""}${benchRemarks ? ` ${benchRemarks}` : ""}${nextHearingDate ? ` അടുത്ത വാദം കേൾക്കുന്ന തീയതി: ${nextHearingDate}.` : ""} സ്നേഹാദരങ്ങളോടെ, ${seniorCounselName}.`;

    const dispatchRecord = {
      dispatchId: `DISP-${Date.now().toString().slice(-6)}`,
      caseNumber: resolvedCaseNo,
      clientName,
      clientPhone,
      courtOutcome,
      nextHearingDate,
      englishMessage,
      malayalamMessage,
      channels: ["WhatsApp Business API (Verified)", "SMS Gateway (CP-WAKHEEL)"],
      deliveredAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      status: "Delivered",
    };

    return {
      success: true,
      message: `Hearing outcome dispatched to ${clientName} via WhatsApp & SMS.`,
      dispatchRecord,
      item,
    };
  },

  // ==========================================================================
  // --- Calendar Fixtures & Backlog Suite ---
  // ==========================================================================
  getCalendarEvents(userId) {
    if (!userId) return [];
    const events = readFile("dev_calendar_fixtures.json", DEFAULT_CALENDAR_FIXTURES);
    return events.filter((e) => e.userId && String(e.userId) === String(userId));
  },

  addCalendarEvent(userId, data = {}) {
    const events = readFile("dev_calendar_fixtures.json", DEFAULT_CALENDAR_FIXTURES);
    const newEvent = {
      id: `evt-${Date.now()}`,
      userId,
      title: data.title || "Scheduled Court Event",
      category: data.category || "hearing",
      date: data.date || new Date().toISOString().split("T")[0],
      time: data.time || "10:30 AM",
      duration: data.duration || "45m",
      caseNumber: data.caseNumber || "",
      forum: data.forum || "",
      clientName: data.clientName || "",
      notes: data.notes || "",
      status: data.status || "confirmed",
      createdAt: new Date().toISOString(),
    };
    events.push(newEvent);
    writeFile("dev_calendar_fixtures.json", events);
    return newEvent;
  },

  updateCalendarEvent(id, updates = {}) {
    const events = readFile("dev_calendar_fixtures.json", DEFAULT_CALENDAR_FIXTURES);
    const index = events.findIndex((e) => e.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_calendar_fixtures.json", events);
      return events[index];
    }
    return null;
  },

  deleteCalendarEvent(id) {
    let events = readFile("dev_calendar_fixtures.json", DEFAULT_CALENDAR_FIXTURES);
    events = events.filter((e) => e.id !== id);
    writeFile("dev_calendar_fixtures.json", events);
    return true;
  },

  getCalendarBacklog(userId) {
    if (!userId) return [];
    const backlog = readFile("dev_calendar_backlog.json", DEFAULT_CALENDAR_BACKLOG);
    return backlog.filter((b) => b.userId && String(b.userId) === String(userId));
  },

  addCalendarBacklogItem(userId, data = {}) {
    const backlog = readFile("dev_calendar_backlog.json", DEFAULT_CALENDAR_BACKLOG);
    const newItem = {
      id: `task-bk-${Date.now()}`,
      userId,
      title: data.title || "Backlog Task",
      category: data.category || "drafting",
      priority: data.priority || "normal",
      estimatedTime: data.estimatedTime || "1h",
      caseRef: data.caseRef || "General Chamber",
      createdAt: new Date().toISOString(),
    };
    backlog.unshift(newItem);
    writeFile("dev_calendar_backlog.json", backlog);
    return newItem;
  },

  updateCalendarBacklogItem(id, updates = {}) {
    const backlog = readFile("dev_calendar_backlog.json", DEFAULT_CALENDAR_BACKLOG);
    const index = backlog.findIndex((b) => b.id === id);
    if (index !== -1) {
      backlog[index] = { ...backlog[index], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_calendar_backlog.json", backlog);
      return backlog[index];
    }
    return null;
  },

  deleteCalendarBacklogItem(id) {
    let backlog = readFile("dev_calendar_backlog.json", DEFAULT_CALENDAR_BACKLOG);
    backlog = backlog.filter((b) => b.id !== id);
    writeFile("dev_calendar_backlog.json", backlog);
    return true;
  },

  // ==========================================================================
  // --- Professional Network & Legal Pipeline Suite ---
  // ==========================================================================
  getNetworkContacts(userId) {
    if (!userId) return [];
    const contacts = readFile("dev_network_contacts.json", DEFAULT_NETWORK_CONTACTS);
    return contacts.filter((c) => c.userId === userId);
  },

  addNetworkContact(userId, data = {}) {
    if (!userId) return null;
    const contacts = readFile("dev_network_contacts.json", DEFAULT_NETWORK_CONTACTS);
    const newContact = {
      id: data.id || `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      name: data.name || "New Contact",
      degree: data.degree || "1st",
      role: data.role || "",
      chamber: data.chamber || "",
      bench: data.bench || "",
      court: data.court || data.bench || "",
      location: data.location || "",
      stage: data.stage || "discover",
      practiceArea: data.practiceArea || "",
      source: data.source || "Direct",
      mutualsCount: Number.isFinite(Number(data.mutualsCount)) ? Number(data.mutualsCount) : 0,
      statusQuote: data.statusQuote || "",
      lastActive: data.lastActive || "Just now",
      isOnline: Boolean(data.isOnline),
      barEnrollment: data.barEnrollment || "",
      phone: data.phone || "",
      email: data.email || "",
      briefsCount: Number.isFinite(Number(data.briefsCount)) ? Number(data.briefsCount) : 0,
      rating: Number.isFinite(Number(data.rating)) ? Number(data.rating) : 0,
      reviewsCount: Number.isFinite(Number(data.reviewsCount)) ? Number(data.reviewsCount) : 0,
      feeText: data.feeText || "",
      createdAt: new Date().toISOString(),
    };
    contacts.unshift(newContact);
    writeFile("dev_network_contacts.json", contacts);
    return newContact;
  },

  updateNetworkContactStage(id, stage, userId) {
    if (!userId) return null;
    const contacts = readFile("dev_network_contacts.json", DEFAULT_NETWORK_CONTACTS);
    const index = contacts.findIndex((c) => c.id === id && c.userId === userId);
    if (index !== -1) {
      contacts[index].stage = stage;
      contacts[index].updatedAt = new Date().toISOString();
      writeFile("dev_network_contacts.json", contacts);
      return contacts[index];
    }
    return null;
  },

  deleteNetworkContact(id, userId) {
    if (!userId) return false;
    const contacts = readFile("dev_network_contacts.json", DEFAULT_NETWORK_CONTACTS);
    const filtered = contacts.filter((c) => !(c.id === id && c.userId === userId));
    if (filtered.length === contacts.length) return false;
    writeFile("dev_network_contacts.json", filtered);
    return true;
  },

  getNetworkActivities(userId) {
    if (!userId) return [];
    const activities = readFile("dev_network_activities.json", DEFAULT_NETWORK_ACTIVITIES);
    return activities.filter((a) => a.userId === userId);
  },

  addNetworkActivity(userId, data = {}) {
    if (!userId) return null;
    const activities = readFile("dev_network_activities.json", DEFAULT_NETWORK_ACTIVITIES);
    const newAct = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      type: data.type || "connected",
      advocateName: data.advocateName || "Contact",
      description: data.description || "updated collaboration status.",
      timestamp: "Just now",
      createdAt: new Date().toISOString(),
    };
    activities.unshift(newAct);
    writeFile("dev_network_activities.json", activities);
    return newAct;
  },

  getNetworkFollowups(userId) {
    if (!userId) return [];
    const followups = readFile("dev_network_followups.json", DEFAULT_NETWORK_FOLLOWUPS);
    return followups.filter((f) => f.userId === userId);
  },

  addNetworkFollowup(userId, data = {}) {
    if (!userId) return null;
    const followups = readFile("dev_network_followups.json", DEFAULT_NETWORK_FOLLOWUPS);
    const newFu = {
      id: `fu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      advocateName: data.advocateName || "Contact",
      task: data.task || "Follow up on matter",
      dueText: data.dueText || "Due Tomorrow",
      dueUrgent: Boolean(data.dueUrgent),
      createdAt: new Date().toISOString(),
    };
    followups.unshift(newFu);
    writeFile("dev_network_followups.json", followups);
    return newFu;
  },

  getNetworkRecommendations(userId) {
    if (!userId) return [];
    const recs = readFile("dev_network_recommendations.json", DEFAULT_NETWORK_RECOMMENDATIONS);
    return recs.filter((r) => r.userId === userId);
  },

  toggleNetworkRecommendation(id, userId) {
    if (!userId) return null;
    const recs = readFile("dev_network_recommendations.json", DEFAULT_NETWORK_RECOMMENDATIONS);
    const index = recs.findIndex((r) => r.id === id && r.userId === userId);
    if (index !== -1) {
      recs[index].status = recs[index].status === "connect" ? "pending" : "connect";
      writeFile("dev_network_recommendations.json", recs);
      return recs[index];
    }
    return null;
  },

  // ==========================================================================
  // --- Task Mite Tasks & Chamber Notes Suite ---
  // ==========================================================================
  getTaskMiteTasks(userId) {
    if (!userId) return [];
    const tasks = readFile("dev_taskmite_tasks.json", DEFAULT_TASKMITE_TASKS);
    return tasks.filter((t) => t.userId && String(t.userId) === String(userId));
  },

  addTaskMiteTask(userId, data = {}) {
    if (!userId) return null;
    const tasks = readFile("dev_taskmite_tasks.json", DEFAULT_TASKMITE_TASKS);
    const newTask = {
      id: data.id || `task-${Date.now()}`,
      userId: String(userId),
      title: data.title || "New Task",
      caseMatter: data.caseMatter || undefined,
      status: data.status || "not_started",
      type: data.type || "Court Filing",
      dueDate: data.dueDate || "Upcoming",
      dueTime: data.dueTime,
      isDueUrgent: Boolean(data.isDueUrgent),
      priority: data.priority || "medium",
      assignee: data.assignee || {
        name: "Unassigned",
        role: "Self",
        avatarInitials: "U",
      },
      notes: data.notes || undefined,
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    writeFile("dev_taskmite_tasks.json", tasks);
    return newTask;
  },

  updateTaskMiteTask(id, updates = {}, userId = null) {
    const tasks = readFile("dev_taskmite_tasks.json", DEFAULT_TASKMITE_TASKS);
    const index = tasks.findIndex(
      (t) =>
        (t.id === id || t._id === id) &&
        (!userId || (t.userId && String(t.userId) === String(userId)))
    );
    if (index !== -1) {
      tasks[index] = {
        ...tasks[index],
        ...updates,
        userId: tasks[index].userId,
        updatedAt: new Date().toISOString(),
      };
      writeFile("dev_taskmite_tasks.json", tasks);
      return tasks[index];
    }
    return null;
  },

  deleteTaskMiteTask(id, userId = null) {
    const tasks = readFile("dev_taskmite_tasks.json", DEFAULT_TASKMITE_TASKS);
    const filtered = tasks.filter(
      (t) =>
        !(
          (t.id === id || t._id === id) &&
          (!userId || (t.userId && String(t.userId) === String(userId)))
        )
    );
    if (filtered.length === tasks.length) return false;
    writeFile("dev_taskmite_tasks.json", filtered);
    return true;
  },

  getTaskMiteNotes(userId) {
    if (!userId) return [];
    const notes = readFile("dev_taskmite_notes.json", DEFAULT_TASKMITE_NOTES);
    return notes.filter((n) => n.userId && String(n.userId) === String(userId));
  },

  addTaskMiteNote(userId, data = {}) {
    if (!userId) return null;
    const notes = readFile("dev_taskmite_notes.json", DEFAULT_TASKMITE_NOTES);
    const newNote = {
      id: data.id || `note-${Date.now()}`,
      userId: String(userId),
      title: data.title || "Untitled Note",
      category: data.category || "hearing_memo",
      categoryLabel: data.categoryLabel || "Hearing Memo",
      content: data.content || "",
      tags: Array.isArray(data.tags) ? data.tags : ["General"],
      updatedAt: "Just now",
      isPinned: Boolean(data.isPinned),
      createdAt: new Date().toISOString(),
    };
    notes.unshift(newNote);
    writeFile("dev_taskmite_notes.json", notes);
    return newNote;
  },

  deleteTaskMiteNote(id, userId = null) {
    const notes = readFile("dev_taskmite_notes.json", DEFAULT_TASKMITE_NOTES);
    const filtered = notes.filter(
      (n) =>
        !(
          (n.id === id || n._id === id) &&
          (!userId || (n.userId && String(n.userId) === String(userId)))
        )
    );
    if (filtered.length === notes.length) return false;
    writeFile("dev_taskmite_notes.json", filtered);
    return true;
  },

  updateTaskMiteNote(id, updates = {}, userId = null) {
    const notes = readFile("dev_taskmite_notes.json", DEFAULT_TASKMITE_NOTES);
    const idx = notes.findIndex(
      (n) =>
        (n.id === id || n._id === id) &&
        (!userId || (n.userId && String(n.userId) === String(userId)))
    );
    if (idx !== -1) {
      notes[idx] = {
        ...notes[idx],
        ...updates,
        userId: notes[idx].userId,
        updatedAt: updates.updatedAt || "Just now",
        lastModified: new Date().toISOString(),
      };
      writeFile("dev_taskmite_notes.json", notes);
      return notes[idx];
    }
    return null;
  },

  // ==========================================================================
  // --- CS Board Governance (Meetings, Resolutions & SS-1 Minutes) ---
  // ==========================================================================
  getBoardMeetings(userId) {
    if (!userId) return [];
    const meetings = readFile("dev_board_meetings.json", []);
    return meetings.filter((m) => m.userId && String(m.userId) === String(userId));
  },

  createBoardMeeting(userId, data) {
    if (!userId) return null;
    const meetings = readFile("dev_board_meetings.json", []);
    const userMeetings = meetings.filter((m) => String(m.userId || "") === String(userId));
    const newMeeting = {
      id: data.id || `bm-${Date.now()}`,
      meetingId: data.id || `bm-${Date.now()}`,
      userId: String(userId),
      companyName: data.companyName || "",
      cin: data.cin || "",
      meetingNumber: data.meetingNumber || `BM-${String(userMeetings.length + 1).padStart(2, "0")}/${new Date().getFullYear()}`,
      meetingType: data.meetingType || "board_meeting",
      date: data.date || new Date().toISOString().split("T")[0],
      time: data.time || "",
      venue: data.venue || "",
      isVideoConference: data.isVideoConference !== undefined ? data.isVideoConference : true,
      chairperson: data.chairperson || "",
      directors: Array.isArray(data.directors) ? data.directors : [],
      isShorterNotice: Boolean(data.isShorterNotice),
      shorterNoticeReason: data.shorterNoticeReason || "",
      status: data.status || "scheduled",
      agendaItems: Array.isArray(data.agendaItems) ? data.agendaItems : [],
      minutes: data.minutes || { draftContent: "", finalContent: "", signedBy: "", signedAt: "" },
      createdAt: new Date().toISOString(),
    };
    meetings.unshift(newMeeting);
    writeFile("dev_board_meetings.json", meetings);
    return newMeeting;
  },

  updateBoardMeeting(id, updates = {}, userId = null) {
    let meetings = readFile("dev_board_meetings.json", []);
    const idx = meetings.findIndex(
      (m) => (m.id === id || m.meetingId === id) && (!userId || String(m.userId || "") === String(userId))
    );
    if (idx !== -1) {
      meetings[idx] = { ...meetings[idx], ...updates, userId: meetings[idx].userId, updatedAt: new Date().toISOString() };
      writeFile("dev_board_meetings.json", meetings);
      return meetings[idx];
    }
    return null;
  },

  deleteBoardMeeting(id, userId = null) {
    let meetings = readFile("dev_board_meetings.json", []);
    meetings = meetings.filter(
      (m) => !((m.id === id || m.meetingId === id) && (!userId || String(m.userId || "") === String(userId)))
    );
    writeFile("dev_board_meetings.json", meetings);
    return true;
  },

  getBoardResolutions(userId) {
    if (!userId) return [];
    const resolutions = readFile("dev_board_resolutions.json", []);
    return resolutions.filter((r) => r.userId && String(r.userId) === String(userId));
  },

  createBoardResolution(userId, data) {
    if (!userId) return null;
    const resolutions = readFile("dev_board_resolutions.json", []);
    const userRes = resolutions.filter((r) => String(r.userId || "") === String(userId));
    const newRes = {
      id: data.id || `res-${Date.now()}`,
      resolutionId: data.id || `res-${Date.now()}`,
      userId: String(userId),
      meetingId: data.meetingId || "",
      companyName: data.companyName || "",
      cin: data.cin || "",
      resolutionNumber: data.resolutionNumber || `RES-${String(userRes.length + 1).padStart(2, "0")}/${new Date().getFullYear()}`,
      type: data.type || "board",
      category: data.category || "banking",
      title: data.title || "Statutory Board Resolution",
      actSection: data.actSection || "Section 179(3) of Companies Act 2013",
      preambleText: data.preambleText || "",
      resolutionText: data.resolutionText || "",
      furtherResolutionText: data.furtherResolutionText || "",
      authorizedSignatories: Array.isArray(data.authorizedSignatories) ? data.authorizedSignatories : [],
      status: data.status || "passed_unanimously",
      isCtcGenerated: Boolean(data.isCtcGenerated),
      ctcCertifiedBy: data.ctcCertifiedBy || "",
      ctcCertifiedAt: data.ctcCertifiedAt || "",
      createdAt: new Date().toISOString(),
    };
    resolutions.unshift(newRes);
    writeFile("dev_board_resolutions.json", resolutions);
    return newRes;
  },

  updateBoardResolution(id, updates = {}, userId = null) {
    let resolutions = readFile("dev_board_resolutions.json", []);
    const idx = resolutions.findIndex(
      (r) => (r.id === id || r.resolutionId === id) && (!userId || String(r.userId || "") === String(userId))
    );
    if (idx !== -1) {
      resolutions[idx] = { ...resolutions[idx], ...updates, userId: resolutions[idx].userId, updatedAt: new Date().toISOString() };
      writeFile("dev_board_resolutions.json", resolutions);
      return resolutions[idx];
    }
    return null;
  },

  deleteBoardResolution(id, userId = null) {
    let resolutions = readFile("dev_board_resolutions.json", []);
    resolutions = resolutions.filter(
      (r) => !((r.id === id || r.resolutionId === id) && (!userId || String(r.userId || "") === String(userId)))
    );
    writeFile("dev_board_resolutions.json", resolutions);
    return true;
  },

  generateCtcResolution(id, certifiedBy, userId = null) {
    let resolutions = readFile("dev_board_resolutions.json", []);
    const idx = resolutions.findIndex(
      (r) => (r.id === id || r.resolutionId === id) && (!userId || String(r.userId || "") === String(userId))
    );
    if (idx !== -1) {
      resolutions[idx].isCtcGenerated = true;
      resolutions[idx].ctcCertifiedBy = certifiedBy || "";
      resolutions[idx].ctcCertifiedAt = new Date().toISOString().split("T")[0];
      writeFile("dev_board_resolutions.json", resolutions);
      return resolutions[idx];
    }
    return null;
  },

  // ==========================================================================
  // --- CS Corporate Entities & Master Register ---
  // ==========================================================================
  getCorporateEntities(userId) {
    if (!userId) return [];
    const entities = readFile("dev_corporate_entities.json", []);
    return entities.filter((e) => e.userId && String(e.userId) === String(userId));
  },

  createCorporateEntity(userId, data) {
    if (!userId) return null;
    const entities = readFile("dev_corporate_entities.json", []);
    const newEntity = {
      id: data.id || `ent-${Date.now()}`,
      entityId: data.id || `ent-${Date.now()}`,
      userId: String(userId),
      companyName: data.companyName || "",
      cin: (data.cin || "").toUpperCase(),
      rocJurisdiction: data.rocJurisdiction || "",
      entityType: data.entityType || "pvt_ltd",
      incorporationDate: data.incorporationDate || "",
      authorizedCapital: Number(data.authorizedCapital) || 0,
      paidUpCapital: Number(data.paidUpCapital) || 0,
      registeredAddress: data.registeredAddress || "",
      email: data.email || "",
      pan: (data.pan || "").toUpperCase(),
      gstin: (data.gstin || "").toUpperCase(),
      directors: Array.isArray(data.directors) ? data.directors : [],
      financialYearEnd: data.financialYearEnd || "March 31",
      complianceHealthScore: Number(data.complianceHealthScore) || 0,
      status: data.status || "active",
      createdAt: new Date().toISOString(),
    };
    entities.unshift(newEntity);
    writeFile("dev_corporate_entities.json", entities);
    return newEntity;
  },

  updateCorporateEntity(id, updates = {}, userId = null) {
    let entities = readFile("dev_corporate_entities.json", []);
    const idx = entities.findIndex(
      (e) => (e.id === id || e.entityId === id) && (!userId || String(e.userId || "") === String(userId))
    );
    if (idx !== -1) {
      entities[idx] = { ...entities[idx], ...updates, userId: entities[idx].userId, updatedAt: new Date().toISOString() };
      writeFile("dev_corporate_entities.json", entities);
      return entities[idx];
    }
    return null;
  },

  deleteCorporateEntity(id, userId = null) {
    let entities = readFile("dev_corporate_entities.json", []);
    entities = entities.filter(
      (e) => !((e.id === id || e.entityId === id) && (!userId || String(e.userId || "") === String(userId)))
    );
    writeFile("dev_corporate_entities.json", entities);
    return true;
  },

  // ==========================================================================
  // --- CS MCA21 & ROC Statutory Filings Tracker ---
  // ==========================================================================
  getRocFilings(userId, filters = {}) {
    if (!userId) return [];
    let filings = readFile("dev_roc_filings.json", []);
    filings = filings.filter((f) => f.userId && String(f.userId) === String(userId));
    if (filters.companyName) {
      filings = filings.filter((f) => f.companyName === filters.companyName);
    }
    if (filters.status && filters.status !== "ALL") {
      filings = filings.filter((f) => f.status === filters.status);
    }
    if (filters.formName && filters.formName !== "ALL") {
      filings = filings.filter((f) => f.formName === filters.formName);
    }
    return filings;
  },

  createRocFiling(userId, data) {
    if (!userId) return null;
    const filings = readFile("dev_roc_filings.json", []);
    const newFiling = {
      id: data.id || `roc-${Date.now()}`,
      filingId: data.id || `roc-${Date.now()}`,
      userId: String(userId),
      companyName: data.companyName || "",
      cin: data.cin || "",
      formName: data.formName || "AOC-4",
      formDescription: data.formDescription || "Statutory e-Form Filing with Registrar of Companies",
      financialYear: data.financialYear || "FY 2025-26",
      statutorySection: data.statutorySection || "Companies Act 2013",
      dueDate: data.dueDate || new Date().toISOString().split("T")[0],
      filingDate: data.filingDate || "",
      status: data.status || "drafted",
      srn: data.srn || "",
      challanAmount: Number(data.challanAmount) || 0,
      lateFeeAmount: Number(data.lateFeeAmount) || 0,
      paymentStatus: data.paymentStatus || "unpaid",
      signatoryDin: data.signatoryDin || "",
      signatoryName: data.signatoryName || "",
      pcsCertificateNumber: data.pcsCertificateNumber || "",
      attachmentCount: Number(data.attachmentCount) || 0,
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
    };
    filings.unshift(newFiling);
    writeFile("dev_roc_filings.json", filings);
    return newFiling;
  },

  updateRocFiling(id, updates = {}, userId = null) {
    let filings = readFile("dev_roc_filings.json", []);
    const idx = filings.findIndex(
      (f) => (f.id === id || f.filingId === id) && (!userId || String(f.userId || "") === String(userId))
    );
    if (idx !== -1) {
      filings[idx] = { ...filings[idx], ...updates, userId: filings[idx].userId, updatedAt: new Date().toISOString() };
      writeFile("dev_roc_filings.json", filings);
      return filings[idx];
    }
    return null;
  },

  deleteRocFiling(id, userId = null) {
    let filings = readFile("dev_roc_filings.json", []);
    filings = filings.filter(
      (f) => !((f.id === id || f.filingId === id) && (!userId || String(f.userId || "") === String(userId)))
    );
    writeFile("dev_roc_filings.json", filings);
    return true;
  },

  // ==========================================================================
  // --- CS Statutory Registers (Section 88, 170, 85, 186) ---
  // ==========================================================================
  getStatutoryRegisters(userId, filters = {}) {
    if (!userId) return [];
    let registers = readFile("dev_statutory_registers.json", []);
    registers = registers.filter((r) => r.userId && String(r.userId) === String(userId));
    if (filters.companyName) {
      registers = registers.filter((r) => r.companyName === filters.companyName);
    }
    if (filters.registerType && filters.registerType !== "ALL") {
      registers = registers.filter((r) => r.registerType === filters.registerType);
    }
    return registers;
  },

  createRegisterEntry(userId, data) {
    if (!userId) return null;
    const registers = readFile("dev_statutory_registers.json", []);
    const userRegisters = registers.filter((r) => String(r.userId || "") === String(userId));
    const newEntry = {
      id: data.id || `reg-${Date.now()}`,
      registerEntryId: data.id || `reg-${Date.now()}`,
      userId: String(userId),
      companyName: data.companyName || "",
      cin: data.cin || "",
      registerType: data.registerType || "members",
      statutoryForm: data.statutoryForm || "MGT-1",
      folioOrRefNumber: data.folioOrRefNumber || `REF-${String(userRegisters.length + 1).padStart(2, "0")}`,
      primaryHolderName: data.primaryHolderName || "",
      identificationNumber: data.identificationNumber || "",
      entryDate: data.entryDate || new Date().toISOString().split("T")[0],
      particulars: data.particulars || "",
      quantityOrAmount: Number(data.quantityOrAmount) || 0,
      distinctiveFrom: data.distinctiveFrom || "",
      distinctiveTo: data.distinctiveTo || "",
      certificateNumber: data.certificateNumber || "",
      status: data.status || "active",
      certifiedBy: data.certifiedBy || "",
      certifiedAt: data.certifiedAt || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };
    registers.unshift(newEntry);
    writeFile("dev_statutory_registers.json", registers);
    return newEntry;
  },

  updateRegisterEntry(id, updates = {}, userId = null) {
    let registers = readFile("dev_statutory_registers.json", []);
    const idx = registers.findIndex(
      (r) => (r.id === id || r.registerEntryId === id) && (!userId || String(r.userId || "") === String(userId))
    );
    if (idx !== -1) {
      registers[idx] = { ...registers[idx], ...updates, userId: registers[idx].userId, updatedAt: new Date().toISOString() };
      writeFile("dev_statutory_registers.json", registers);
      return registers[idx];
    }
    return null;
  },

  deleteRegisterEntry(id, userId = null) {
    let registers = readFile("dev_statutory_registers.json", []);
    registers = registers.filter(
      (r) => !((r.id === id || r.registerEntryId === id) && (!userId || String(r.userId || "") === String(userId)))
    );
    writeFile("dev_statutory_registers.json", registers);
    return true;
  },

  // ==========================================================================
  // --- CS Secretarial Audit Engine (Form MR-3 per Section 204) ---
  // ==========================================================================
  getSecretarialAuditReport(userId, companyName = "") {
    const cleanCompany = (companyName || "").trim();
    const filings = this.getRocFilings(userId, cleanCompany ? { companyName: cleanCompany } : {});
    const registers = this.getStatutoryRegisters(userId, cleanCompany ? { companyName: cleanCompany } : {});
    const meetings = this.getBoardMeetings(userId).filter((m) => !cleanCompany || m.companyName === cleanCompany);

    const aoc4Filing = filings.find((f) => String(f.formName || "").toUpperCase() === "AOC-4");
    const mgt7Filing = filings.find((f) => String(f.formName || "").toUpperCase().startsWith("MGT-7"));
    const chgFiling = filings.find((f) => String(f.formName || "").toUpperCase().startsWith("CHG-"));
    const signedMeetings = meetings.filter((m) => m.minutes?.signedBy || m.status === "completed");

    const statutoryChecklist = [
      {
        id: "chk-1",
        act: "Companies Act, 2013",
        section: "Section 149 & 152",
        subject: "Board Composition & Optimum Ratio of Independent Directors",
        status: meetings.some((m) => Array.isArray(m.directors) && m.directors.length > 0) ? "compliant" : "pending_verification",
        remarks: meetings.length > 0
          ? `Derived from ${meetings.length} recorded Board Meeting register(s).`
          : "No board meeting director roster recorded yet.",
      },
      {
        id: "chk-2",
        act: "Companies Act, 2013",
        section: "Section 173(1)",
        subject: "Frequency of Board Meetings & Gap not exceeding 120 days",
        status: meetings.length >= 4 ? "compliant" : meetings.length > 0 ? "observation" : "pending_verification",
        remarks: meetings.length > 0
          ? `${meetings.length} Board meeting(s) recorded for the audit period.`
          : "No Board meetings recorded yet for Section 173(1) gap verification.",
      },
      {
        id: "chk-3",
        act: "Companies Act, 2013",
        section: "Section 118 & SS-1",
        subject: "Maintenance of Statutory Minutes Book & Secretarial Standards Compliance",
        status: signedMeetings.length > 0 ? "compliant" : "pending_verification",
        remarks: signedMeetings.length > 0
          ? `${signedMeetings.length} Board meeting minutes signed and recorded per SS-1.`
          : "No signed Board meeting minutes recorded yet.",
      },
      {
        id: "chk-4",
        act: "Companies Act, 2013",
        section: "Section 137 & 92",
        subject: "Annual Filing of Financial Statements (AOC-4) and Annual Return (MGT-7)",
        status:
          aoc4Filing && aoc4Filing.status === "approved" && mgt7Filing && mgt7Filing.status === "approved"
            ? "compliant"
            : "pending_verification",
        remarks:
          filings.length > 0
            ? `${filings.length} ROC filing(s) tracked${aoc4Filing?.srn ? ` (AOC-4 SRN ${aoc4Filing.srn})` : ""}.`
            : "No ROC e-Forms (AOC-4 / MGT-7) recorded yet.",
      },
      {
        id: "chk-5",
        act: "Companies Act, 2013",
        section: "Section 88 & 170",
        subject: "Statutory Registers maintenance at Registered Office",
        status: registers.length >= 4 ? "compliant" : registers.length > 0 ? "observation" : "pending_verification",
        remarks:
          registers.length > 0
            ? `${registers.length} statutory register entry/entries recorded.`
            : "No statutory register entries recorded yet (MGT-1 / Sec 170 / CHG-7).",
      },
      {
        id: "chk-6",
        act: "Companies Act, 2013",
        section: "Section 77 & 85",
        subject: "Registration & Satisfaction of Charges with Registrar of Companies",
        status: chgFiling ? "compliant" : "pending_verification",
        remarks: chgFiling
          ? `Charge filing (${chgFiling.formName}) recorded with status: ${chgFiling.status}.`
          : "No Form CHG-1 / CHG-4 charge filing recorded.",
      },
      {
        id: "chk-7",
        act: "Companies Act, 2013",
        section: "Section 188",
        subject: "Related Party Transactions & Audit Committee / Board Approvals",
        status: registers.some((r) => String(r.statutoryForm || "").toUpperCase() === "MBP-4")
          ? "compliant"
          : "pending_verification",
        remarks: "Evaluated against recorded MBP-4 Related Party Register entries.",
      },
      {
        id: "chk-8",
        act: "Foreign Exchange Management Act, 1999",
        section: "FEMA (Non-debt Instruments) Rules 2019",
        subject: "Foreign Direct Investment (FDI) & Form FC-GPR Reporting on FIRMS Portal",
        status: "pending_verification",
        remarks: "Confirm any foreign inward remittances or RBI FIRMS filings for the audit period.",
      },
    ];

    const compliantCount = statutoryChecklist.filter((c) => c.status === "compliant").length;
    const auditScore = filings.length + registers.length + meetings.length > 0
      ? Math.round((compliantCount / statutoryChecklist.length) * 100)
      : 0;

    return {
      success: true,
      companyName: cleanCompany,
      financialYear: `FY ${new Date().getFullYear() - 1}-${String(new Date().getFullYear()).slice(-2)}`,
      auditingFirm: "",
      pcsName: "",
      membershipNumber: "",
      certificateOfPractice: "",
      peerReviewNumber: "",
      auditScore,
      qualificationCount: statutoryChecklist.filter((c) => c.status === "observation").length,
      auditPassed: auditScore >= 90,
      opinion:
        auditScore > 0
          ? auditScore >= 90
            ? "UNQUALIFIED / CLEAN OPINION based on the compliance records submitted for the audit period."
            : "PROVISIONAL AUDIT SUMMARY: Pending completion of open or unverified statutory compliance items."
          : "NO AUDIT RECORDS YET: Add Board Meetings, ROC Filings, or Statutory Registers to compute the Form MR-3 audit score.",
      checklist: statutoryChecklist,
      generatedAt: new Date().toISOString(),
    };
  },

  // ==========================================================================
  // --- CS Commercial Contracts & Shareholders' Agreements (SHA/SSA) ---
  // ==========================================================================
  getCorporateContracts(userId, filters = {}) {
    if (!userId) return [];
    let contracts = readFile("dev_corporate_contracts.json", []);
    contracts = contracts.filter((c) => c.userId && String(c.userId) === String(userId));
    if (filters.companyName) {
      contracts = contracts.filter((c) => c.companyName === filters.companyName);
    }
    if (filters.contractType && filters.contractType !== "ALL") {
      contracts = contracts.filter((c) => c.contractType === filters.contractType);
    }
    return contracts;
  },

  createCorporateContract(userId, data) {
    if (!userId) return null;
    const contracts = readFile("dev_corporate_contracts.json", []);
    const newContract = {
      id: data.id || `cont-${Date.now()}`,
      contractId: data.id || `cont-${Date.now()}`,
      userId: String(userId),
      companyName: data.companyName || "",
      title: data.title || "Commercial Agreement",
      contractType: data.contractType || "vendor_msa",
      parties: Array.isArray(data.parties) ? data.parties : [],
      effectiveDate: data.effectiveDate || new Date().toISOString().split("T")[0],
      expiryDate: data.expiryDate || "",
      contractValue: Number(data.contractValue) || 0,
      stampDutyPaid: Number(data.stampDutyPaid) || 0,
      eStampCertificateNumber: data.eStampCertificateNumber || "",
      governingLaw: data.governingLaw || "Laws of India",
      keyClauses: Array.isArray(data.keyClauses) ? data.keyClauses : [],
      status: data.status || "executed",
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
    };
    contracts.unshift(newContract);
    writeFile("dev_corporate_contracts.json", contracts);
    return newContract;
  },

  updateCorporateContract(id, updates = {}, userId = null) {
    let contracts = readFile("dev_corporate_contracts.json", []);
    const idx = contracts.findIndex(
      (c) => (c.id === id || c.contractId === id) && (!userId || String(c.userId || "") === String(userId))
    );
    if (idx !== -1) {
      contracts[idx] = { ...contracts[idx], ...updates, userId: contracts[idx].userId, updatedAt: new Date().toISOString() };
      writeFile("dev_corporate_contracts.json", contracts);
      return contracts[idx];
    }
    return null;
  },

  deleteCorporateContract(id, userId = null) {
    let contracts = readFile("dev_corporate_contracts.json", []);
    contracts = contracts.filter(
      (c) => !((c.id === id || c.contractId === id) && (!userId || String(c.userId || "") === String(userId)))
    );
    writeFile("dev_corporate_contracts.json", contracts);
    return true;
  },

  // ==========================================================================
  // --- CS Retainer Advocates & Litigation Counsel Gateway ---
  // ==========================================================================
  getRetainerAdvocates(userId, filters = {}) {
    if (!userId) return [];
    let advocates = readFile("dev_retainer_advocates.json", []);
    advocates = advocates.filter((a) => a.userId && String(a.userId) === String(userId));
    if (filters.status && filters.status !== "ALL") {
      advocates = advocates.filter((a) => a.status === filters.status);
    }
    return advocates;
  },

  createRetainerAdvocate(userId, data) {
    if (!userId) return null;
    const advocates = readFile("dev_retainer_advocates.json", []);
    const newAdvocate = {
      id: data.id || `adv-ret-${Date.now()}`,
      advocateId: data.id || `adv-ret-${Date.now()}`,
      userId: String(userId),
      fullName: data.fullName || "",
      barEnrollmentNumber: data.barEnrollmentNumber || "",
      primaryJurisdiction: data.primaryJurisdiction || "",
      specialization: data.specialization || "",
      email: data.email || "",
      phone: data.phone || "",
      retainerFee: Number(data.retainerFee) || 0,
      appearanceRatePerHearing: Number(data.appearanceRatePerHearing) || 0,
      activeBriefsCount: Number(data.activeBriefsCount) || 0,
      status: data.status || "active_retainer",
      createdAt: new Date().toISOString(),
    };
    advocates.unshift(newAdvocate);
    writeFile("dev_retainer_advocates.json", advocates);
    return newAdvocate;
  },

  updateRetainerAdvocate(id, updates = {}, userId = null) {
    let advocates = readFile("dev_retainer_advocates.json", []);
    const idx = advocates.findIndex(
      (a) => (a.id === id || a.advocateId === id) && (!userId || String(a.userId || "") === String(userId))
    );
    if (idx !== -1) {
      advocates[idx] = { ...advocates[idx], ...updates, userId: advocates[idx].userId, updatedAt: new Date().toISOString() };
      writeFile("dev_retainer_advocates.json", advocates);
      return advocates[idx];
    }
    return null;
  },

  deleteRetainerAdvocate(id, userId = null) {
    let advocates = readFile("dev_retainer_advocates.json", []);
    advocates = advocates.filter(
      (a) => !((a.id === id || a.advocateId === id) && (!userId || String(a.userId || "") === String(userId)))
    );
    writeFile("dev_retainer_advocates.json", advocates);
    return true;
  },

  // ==========================================================================
  // --- CS Statutory Charters Vault & DSC Token Manager ---
  // ==========================================================================
  getCorporateVaultItems(userId, filters = {}) {
    if (!userId) return [];
    let items = readFile("dev_corporate_vault.json", []);
    items = items.filter((v) => v.userId && String(v.userId) === String(userId));
    if (filters.companyName) {
      items = items.filter((v) => v.companyName === filters.companyName);
    }
    if (filters.docType && filters.docType !== "ALL") {
      items = items.filter((v) => v.docType === filters.docType);
    }
    return items;
  },

  createCorporateVaultItem(userId, data) {
    if (!userId) return null;
    const items = readFile("dev_corporate_vault.json", []);
    const newItem = {
      id: data.id || `vlt-${Date.now()}`,
      vaultId: data.id || `vlt-${Date.now()}`,
      userId: String(userId),
      companyName: data.companyName || "",
      docType: data.docType || "moa_aoa",
      title: data.title || "Statutory Charter Document",
      fileSize: data.fileSize || "—",
      uploadedAt: data.uploadedAt || new Date().toISOString().split("T")[0],
      validUntil: data.validUntil || "",
      holderName: data.holderName || "",
      issuingAuthority: data.issuingAuthority || "",
      status: data.status || "valid",
      createdAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    writeFile("dev_corporate_vault.json", items);
    return newItem;
  },

  updateCorporateVaultItem(id, updates = {}, userId = null) {
    let items = readFile("dev_corporate_vault.json", []);
    const idx = items.findIndex(
      (v) => (v.id === id || v.vaultId === id) && (!userId || String(v.userId || "") === String(userId))
    );
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates, userId: items[idx].userId, updatedAt: new Date().toISOString() };
      writeFile("dev_corporate_vault.json", items);
      return items[idx];
    }
    return null;
  },

  deleteCorporateVaultItem(id, userId = null) {
    let items = readFile("dev_corporate_vault.json", []);
    items = items.filter(
      (v) => !((v.id === id || v.vaultId === id) && (!userId || String(v.userId || "") === String(userId)))
    );
    writeFile("dev_corporate_vault.json", items);
    return true;
  },

  // ==========================================================================
  // --- CS Fee Notes & Secretarial Invoicing ---
  // ==========================================================================
  getSecretarialInvoices(userId, filters = {}) {
    if (!userId) return [];
    let invoices = readFile("dev_secretarial_invoices.json", []);
    invoices = invoices.filter((i) => i.userId && String(i.userId) === String(userId));
    if (filters.status && filters.status !== "ALL") {
      invoices = invoices.filter((i) => i.status === filters.status);
    }
    return invoices;
  },

  createSecretarialInvoice(userId, data) {
    if (!userId) return null;
    const invoices = readFile("dev_secretarial_invoices.json", []);
    const userInvoices = invoices.filter((i) => String(i.userId || "") === String(userId));
    const subtotal = Number(data.subtotal) || 0;
    const gstRate = Number(data.gstRate) || 18;
    const gstAmount = Math.round((subtotal * gstRate) / 100);
    const totalAmount = subtotal + gstAmount;

    const newInvoice = {
      id: data.id || `inv-cs-${Date.now()}`,
      invoiceId: data.id || `inv-cs-${Date.now()}`,
      userId: String(userId),
      invoiceNumber: data.invoiceNumber || `INV-CS-${new Date().getFullYear()}-${String(userInvoices.length + 1).padStart(3, "0")}`,
      clientCompanyName: data.clientCompanyName || "",
      clientGstin: data.clientGstin || "",
      sacCode: data.sacCode || "9982",
      billingType: data.billingType || "monthly_retainer",
      items: Array.isArray(data.items) ? data.items : [],
      subtotal,
      gstRate,
      gstAmount,
      totalAmount,
      dueDate: data.dueDate || new Date().toISOString().split("T")[0],
      status: data.status || "issued",
      createdAt: new Date().toISOString(),
    };
    invoices.unshift(newInvoice);
    writeFile("dev_secretarial_invoices.json", invoices);
    return newInvoice;
  },

  updateSecretarialInvoice(id, updates = {}, userId = null) {
    let invoices = readFile("dev_secretarial_invoices.json", []);
    const idx = invoices.findIndex(
      (i) => (i.id === id || i.invoiceId === id) && (!userId || String(i.userId || "") === String(userId))
    );
    if (idx !== -1) {
      invoices[idx] = { ...invoices[idx], ...updates, userId: invoices[idx].userId, updatedAt: new Date().toISOString() };
      writeFile("dev_secretarial_invoices.json", invoices);
      return invoices[idx];
    }
    return null;
  },

  deleteSecretarialInvoice(id, userId = null) {
    let invoices = readFile("dev_secretarial_invoices.json", []);
    invoices = invoices.filter(
      (i) => !((i.id === id || i.invoiceId === id) && (!userId || String(i.userId || "") === String(userId)))
    );
    writeFile("dev_secretarial_invoices.json", invoices);
    return true;
  },

  // ==========================================================================
  // --- CA Income Tax Returns & ITR Filing Studio ---
  // ==========================================================================
  getIncomeTaxReturns(userId, filters = {}) {
    if (!userId) return [];
    let returns = readFile("dev_income_tax_returns.json", []);
    returns = returns.filter((r) => r.userId && String(r.userId) === String(userId));
    if (filters.clientName) {
      returns = returns.filter((r) => r.clientName === filters.clientName);
    }
    if (filters.assessmentYear) {
      returns = returns.filter((r) => r.assessmentYear === filters.assessmentYear);
    }
    if (filters.itrForm && filters.itrForm !== "ALL") {
      returns = returns.filter((r) => r.itrForm === filters.itrForm);
    }
    if (filters.status && filters.status !== "ALL") {
      returns = returns.filter((r) => r.status === filters.status);
    }
    return returns;
  },

  createIncomeTaxReturn(userId, data) {
    if (!userId) return null;
    const returns = readFile("dev_income_tax_returns.json", []);
    const gross = Number(data.grossTotalIncome) || 0;
    const deductions = Number(data.deductionsChapterVIA) || 0;
    const taxable = Math.max(0, gross - deductions);
    const taxPayable = Number(data.taxPayable) || Math.round(taxable * 0.2517); // base corporate tax estimate
    const tds = Number(data.tdsTcsCredit) || 0;
    const adv = Number(data.advanceTaxPaid) || 0;
    const refund = Math.max(0, tds + adv - taxPayable);

    const newReturn = {
      id: data.id || `itr-${Date.now()}`,
      itrId: data.id || `itr-${Date.now()}`,
      userId: String(userId),
      clientName: data.clientName || "",
      pan: (data.pan || "").toUpperCase(),
      assessmentYear: data.assessmentYear || "AY 2026-27",
      financialYear: data.financialYear || "FY 2025-26",
      itrForm: data.itrForm || "ITR-6",
      grossTotalIncome: gross,
      deductionsChapterVIA: deductions,
      taxableIncome: taxable,
      taxPayable,
      tdsTcsCredit: tds,
      advanceTaxPaid: adv,
      selfAssessmentTax: Number(data.selfAssessmentTax) || 0,
      refundDueOrPayable: refund,
      aisReconciliationStatus: data.aisReconciliationStatus || "matched",
      filingDueDate: data.filingDueDate || "2026-10-31",
      filingDate: data.filingDate || "",
      acknowledgementNumber: data.acknowledgementNumber || "",
      status: data.status || "drafted",
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
    };
    returns.unshift(newReturn);
    writeFile("dev_income_tax_returns.json", returns);
    return newReturn;
  },

  updateIncomeTaxReturn(id, updates = {}, userId = null) {
    let returns = readFile("dev_income_tax_returns.json", []);
    const idx = returns.findIndex(
      (r) => (r.id === id || r.itrId === id) && (!userId || String(r.userId || "") === String(userId))
    );
    if (idx !== -1) {
      returns[idx] = { ...returns[idx], ...updates, userId: returns[idx].userId, updatedAt: new Date().toISOString() };
      writeFile("dev_income_tax_returns.json", returns);
      return returns[idx];
    }
    return null;
  },

  deleteIncomeTaxReturn(id, userId = null) {
    let returns = readFile("dev_income_tax_returns.json", []);
    returns = returns.filter(
      (r) => !((r.id === id || r.itrId === id) && (!userId || String(r.userId || "") === String(userId)))
    );
    writeFile("dev_income_tax_returns.json", returns);
    return true;
  },

  // ==========================================================================
  // --- CA GST Compliance Hub (GSTR-1, GSTR-3B, GSTR-9) ---
  // ==========================================================================
  getGstReturns(userId, filters = {}) {
    if (!userId) return [];
    let returns = readFile("dev_gst_returns.json", []);
    returns = returns.filter((g) => g.userId && String(g.userId) === String(userId));
    if (filters.clientName) {
      returns = returns.filter((g) => g.clientName === filters.clientName);
    }
    if (filters.returnType && filters.returnType !== "ALL") {
      returns = returns.filter((g) => g.returnType === filters.returnType);
    }
    if (filters.status && filters.status !== "ALL") {
      returns = returns.filter((g) => g.status === filters.status);
    }
    return returns;
  },

  createGstReturn(userId, data) {
    if (!userId) return null;
    const returns = readFile("dev_gst_returns.json", []);
    const turnover = Number(data.taxableTurnover) || 0;
    const igst = Number(data.igstAmount) || Math.round(turnover * 0.09);
    const cgst = Number(data.cgstAmount) || Math.round(turnover * 0.045);
    const sgst = Number(data.sgstAmount) || Math.round(turnover * 0.045);
    const liability = igst + cgst + sgst;
    const itcClaimed = Number(data.itcClaimed) || 0;
    const itc2B = Number(data.itcAvailable2B) || itcClaimed;

    const newGst = {
      id: data.id || `gst-${Date.now()}`,
      gstReturnId: data.id || `gst-${Date.now()}`,
      userId: String(userId),
      clientName: data.clientName || "",
      gstin: (data.gstin || "").toUpperCase(),
      returnType: data.returnType || "GSTR-3B",
      returnPeriod: data.returnPeriod || "",
      dueDate: data.dueDate || "2026-11-20",
      filingDate: data.filingDate || "",
      taxableTurnover: turnover,
      igstAmount: igst,
      cgstAmount: cgst,
      sgstAmount: sgst,
      totalTaxLiability: liability,
      itcClaimed,
      itcAvailable2B: itc2B,
      itcDifference: itcClaimed - itc2B,
      arn: data.arn || "",
      status: data.status || "ready_to_file",
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
    };
    returns.unshift(newGst);
    writeFile("dev_gst_returns.json", returns);
    return newGst;
  },

  updateGstReturn(id, updates = {}, userId = null) {
    let returns = readFile("dev_gst_returns.json", []);
    const idx = returns.findIndex(
      (g) => (g.id === id || g.gstReturnId === id) && (!userId || String(g.userId || "") === String(userId))
    );
    if (idx !== -1) {
      returns[idx] = { ...returns[idx], ...updates, userId: returns[idx].userId, updatedAt: new Date().toISOString() };
      writeFile("dev_gst_returns.json", returns);
      return returns[idx];
    }
    return null;
  },

  deleteGstReturn(id, userId = null) {
    let returns = readFile("dev_gst_returns.json", []);
    returns = returns.filter(
      (g) => !((g.id === id || g.gstReturnId === id) && (!userId || String(g.userId || "") === String(userId)))
    );
    writeFile("dev_gst_returns.json", returns);
    return true;
  },

  // ==========================================================================
  // --- CA Statutory & Tax Audit (Form 3CD & UDIN Generator) ---
  // ==========================================================================
  getTaxAuditReports(userId, filters = {}) {
    if (!userId) return [];
    let reports = readFile("dev_tax_audit_3cd.json", []);
    reports = reports.filter((a) => a.userId && String(a.userId) === String(userId));
    if (filters.clientName) {
      reports = reports.filter((a) => a.clientName === filters.clientName);
    }
    if (filters.auditType && filters.auditType !== "ALL") {
      reports = reports.filter((a) => a.auditType === filters.auditType);
    }
    return reports;
  },

  createTaxAuditReport(userId, data) {
    if (!userId) return null;
    const reports = readFile("dev_tax_audit_3cd.json", []);
    const d43b = Number(data.disallowanceSec43B) || 0;
    const d40a3 = Number(data.disallowanceSec40A3) || 0;
    const d40aia = Number(data.disallowanceSec40aia) || 0;

    const newReport = {
      id: data.id || `aud-3cd-${Date.now()}`,
      auditId: data.id || `aud-3cd-${Date.now()}`,
      userId: String(userId),
      clientName: data.clientName || "",
      pan: (data.pan || "").toUpperCase(),
      financialYear: data.financialYear || "FY 2025-26",
      assessmentYear: data.assessmentYear || "AY 2026-27",
      auditType: data.auditType || "tax_audit_44ab",
      turnover: Number(data.turnover) || 0,
      grossProfitRatio: Number(data.grossProfitRatio) || 0,
      netProfitRatio: Number(data.netProfitRatio) || 0,
      disallowanceSec43B: d43b,
      disallowanceSec40A3: d40a3,
      disallowanceSec40aia: d40aia,
      totalDisallowances: d43b + d40a3 + d40aia,
      udin: data.udin || "",
      caFirmName: data.caFirmName || "",
      caPartnerName: data.caPartnerName || "",
      caMembershipNumber: data.caMembershipNumber || "",
      caFirmRegistrationNumber: data.caFirmRegistrationNumber || "",
      auditOpinion: data.auditOpinion || "unqualified_clean",
      status: data.status || "draft",
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
    };
    reports.unshift(newReport);
    writeFile("dev_tax_audit_3cd.json", reports);
    return newReport;
  },

  updateTaxAuditReport(id, updates = {}, userId = null) {
    let reports = readFile("dev_tax_audit_3cd.json", []);
    const idx = reports.findIndex(
      (a) => (a.id === id || a.auditId === id) && (!userId || String(a.userId || "") === String(userId))
    );
    if (idx !== -1) {
      reports[idx] = { ...reports[idx], ...updates, userId: reports[idx].userId, updatedAt: new Date().toISOString() };
      writeFile("dev_tax_audit_3cd.json", reports);
      return reports[idx];
    }
    return null;
  },

  deleteTaxAuditReport(id, userId = null) {
    let reports = readFile("dev_tax_audit_3cd.json", []);
    reports = reports.filter(
      (a) => !((a.id === id || a.auditId === id) && (!userId || String(a.userId || "") === String(userId)))
    );
    writeFile("dev_tax_audit_3cd.json", reports);
    return true;
  },

  generateUdin(id, partnerName, membershipNo, userId = null) {
    let reports = readFile("dev_tax_audit_3cd.json", []);
    const idx = reports.findIndex(
      (a) => (a.id === id || a.auditId === id) && (!userId || String(a.userId || "") === String(userId))
    );
    if (idx !== -1) {
      const cleanMem = (membershipNo || reports[idx].caMembershipNumber || "").trim();
      if (!cleanMem) return null;
      const year = new Date().getFullYear().toString().slice(-2);
      const mem = cleanMem.padStart(6, "0").slice(-6);
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const generatedUdin = `${year}${mem}${randomSuffix}`.slice(0, 18);

      reports[idx].udin = generatedUdin;
      reports[idx].status = "signed_uploaded";
      if (partnerName) reports[idx].caPartnerName = partnerName;
      reports[idx].caMembershipNumber = cleanMem;

      writeFile("dev_tax_audit_3cd.json", reports);
      return reports[idx];
    }
    return null;
  },

  // ==========================================================================
  // --- CA Balance Sheet & Financial Statements Reconciliation ---
  // ==========================================================================
  getBalanceSheetRecons(userId, filters = {}) {
    if (!userId) return [];
    let recons = readFile("dev_balance_sheet_recons.json", []);
    recons = recons.filter((b) => b.userId && String(b.userId) === String(userId));
    if (filters.clientName) {
      recons = recons.filter((b) => b.clientName === filters.clientName);
    }
    if (filters.financialYear) {
      recons = recons.filter((b) => b.financialYear === filters.financialYear);
    }
    return recons;
  },

  createBalanceSheetRecon(userId, data) {
    if (!userId) return null;
    const recons = readFile("dev_balance_sheet_recons.json", []);
    const bookDep = Number(data.bookDepreciationScheduleII) || 0;
    const taxDep = Number(data.taxDepreciationRule5) || 0;
    const diff = taxDep - bookDep;
    const dtl = Math.round(diff * -0.2517); // 25.17% corporate tax rate

    const newRecon = {
      id: data.id || `bs-${Date.now()}`,
      reconId: data.id || `bs-${Date.now()}`,
      userId: String(userId),
      clientName: data.clientName || "",
      financialYear: data.financialYear || "FY 2025-26",
      accountingStandard: data.accountingStandard || "Ind_AS",
      totalAssets: Number(data.totalAssets) || 0,
      totalLiabilities: Number(data.totalLiabilities) || 0,
      shareCapital: Number(data.shareCapital) || 0,
      reservesAndSurplus: Number(data.reservesAndSurplus) || 0,
      longTermBorrowings: Number(data.longTermBorrowings) || 0,
      tradePayables: Number(data.tradePayables) || 0,
      tangibleFixedAssets: Number(data.tangibleFixedAssets) || 0,
      cashAndBank: Number(data.cashAndBank) || 0,
      bookDepreciationScheduleII: bookDep,
      taxDepreciationRule5: taxDep,
      depreciationDifference: diff,
      deferredTaxAssetLiability: dtl,
      reconciliationNotes: data.reconciliationNotes || "",
      status: data.status || "reconciled",
      createdAt: new Date().toISOString(),
    };
    recons.unshift(newRecon);
    writeFile("dev_balance_sheet_recons.json", recons);
    return newRecon;
  },

  updateBalanceSheetRecon(id, updates = {}, userId = null) {
    let recons = readFile("dev_balance_sheet_recons.json", []);
    const idx = recons.findIndex(
      (b) => (b.id === id || b.reconId === id) && (!userId || String(b.userId || "") === String(userId))
    );
    if (idx !== -1) {
      recons[idx] = { ...recons[idx], ...updates, userId: recons[idx].userId, updatedAt: new Date().toISOString() };
      writeFile("dev_balance_sheet_recons.json", recons);
      return recons[idx];
    }
    return null;
  },

  deleteBalanceSheetRecon(id, userId = null) {
    let recons = readFile("dev_balance_sheet_recons.json", []);
    recons = recons.filter(
      (b) => !((b.id === id || b.reconId === id) && (!userId || String(b.userId || "") === String(userId)))
    );
    writeFile("dev_balance_sheet_recons.json", recons);
    return true;
  },

  // ==========================================================================
  // --- Profiles (BCI Credentials & DigiLocker KYC) ---
  // ==========================================================================
  getBciCredentials(userId) {
    const raw = readFile("dev_bci_credentials.json", {});
    if (raw && typeof raw === "object" && !Array.isArray(raw) && !raw.advocateName && userId) {
      return raw[userId] || { ...DEFAULT_BCI_CREDENTIALS };
    }
    return { ...DEFAULT_BCI_CREDENTIALS };
  },

  updateBciCredentials(userId, data = {}) {
    const raw = readFile("dev_bci_credentials.json", {});
    const store = raw && typeof raw === "object" && !Array.isArray(raw) && !raw.advocateName ? raw : {};
    const key = String(userId || "default");
    const current = store[key] || { ...DEFAULT_BCI_CREDENTIALS };
    store[key] = { ...current, ...data, updatedAt: new Date().toISOString() };
    writeFile("dev_bci_credentials.json", store);
    return store[key];
  },

  getDigiLockerKyc(userId) {
    const raw = readFile("dev_digilocker_kyc.json", {});
    if (raw && typeof raw === "object" && !Array.isArray(raw) && !raw.citizenName && userId) {
      return raw[userId] || { ...DEFAULT_DIGILOCKER_KYC };
    }
    return { ...DEFAULT_DIGILOCKER_KYC };
  },

  updateDigiLockerKyc(userId, data = {}) {
    const raw = readFile("dev_digilocker_kyc.json", {});
    const store = raw && typeof raw === "object" && !Array.isArray(raw) && !raw.citizenName ? raw : {};
    const key = String(userId || "default");
    const current = store[key] || { ...DEFAULT_DIGILOCKER_KYC };
    store[key] = { ...current, ...data, updatedAt: new Date().toISOString() };
    writeFile("dev_digilocker_kyc.json", store);
    return store[key];
  },

  // ==========================================================================
  // --- Class 3 DSC Crypto Tokens & Hardware Signer ---
  // ==========================================================================
  getDscCertificates(userId, filters = {}) {
    if (!userId) return [];
    let certs = readFile("dev_dsc_certificates.json", []);
    certs = certs.filter((c) => c.userId && String(c.userId) === String(userId));
    if (filters.holderRole) {
      certs = certs.filter((c) => c.holderRole === filters.holderRole);
    }
    if (filters.tokenStatus) {
      certs = certs.filter((c) => c.tokenStatus === filters.tokenStatus);
    }
    return certs;
  },

  getDscCertificateById(id, userId = null) {
    const certs = readFile("dev_dsc_certificates.json", []);
    return (
      certs.find(
        (c) =>
          (c.id === id || c.certificateId === id || c.serialNumber === id) &&
          (!userId || (c.userId && String(c.userId) === String(userId)))
      ) || null
    );
  },

  updateDscCertificate(id, updates = {}, userId = null) {
    let certs = readFile("dev_dsc_certificates.json", []);
    const idx = certs.findIndex(
      (c) =>
        (c.id === id || c.certificateId === id || c.serialNumber === id) &&
        (!userId || (c.userId && String(c.userId) === String(userId)))
    );
    if (idx !== -1) {
      certs[idx] = { ...certs[idx], ...updates, userId: certs[idx].userId, updatedAt: new Date().toISOString() };
      writeFile("dev_dsc_certificates.json", certs);
      return certs[idx];
    }
    return null;
  },

  plugDscToken(id, isPlugged = true, userId = null) {
    let certs = readFile("dev_dsc_certificates.json", []);
    const idx = certs.findIndex(
      (c) =>
        (c.id === id || c.certificateId === id) &&
        (!userId || (c.userId && String(c.userId) === String(userId)))
    );
    if (idx !== -1) {
      certs[idx].tokenStatus = isPlugged ? "plugged_in" : "unplugged";
      certs[idx].updatedAt = new Date().toISOString();
      writeFile("dev_dsc_certificates.json", certs);
      return certs[idx];
    }
    return null;
  },

  // ==========================================================================
  // --- Statutory E-Challans (MCA21, GST PMT-06, ITNS 280/281) ---
  // ==========================================================================
  getStatutoryChallans(userId, filters = {}) {
    if (!userId) return [];
    let challans = readFile("dev_statutory_challans.json", []);
    challans = challans.filter((c) => c.userId && String(c.userId) === String(userId));
    if (filters.portal && filters.portal !== "ALL") {
      challans = challans.filter((c) => c.portal === filters.portal);
    }
    if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
      challans = challans.filter((c) => c.paymentStatus === filters.paymentStatus);
    }
    if (filters.entityName) {
      challans = challans.filter((c) => (c.entityName || "").toLowerCase().includes(filters.entityName.toLowerCase()));
    }
    return challans;
  },

  getStatutoryChallanById(id, userId = null) {
    const challans = readFile("dev_statutory_challans.json", []);
    return (
      challans.find(
        (c) =>
          (c.id === id || c.challanId === id || c.srnOrCpinOrCin === id) &&
          (!userId || (c.userId && String(c.userId) === String(userId)))
      ) || null
    );
  },

  createStatutoryChallan(userId, data) {
    if (!userId) return null;
    const challans = readFile("dev_statutory_challans.json", []);
    const id = data.id || `chl-${Date.now()}`;
    const portal = data.portal || "MCA21";

    let identifier = data.srnOrCpinOrCin;
    if (!identifier) {
      if (portal === "MCA21") {
        identifier = `SRN-F${Math.floor(1000000 + Math.random() * 9000000)}`;
      } else if (portal === "GSTN") {
        identifier = `2610${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      } else {
        identifier = `${(data.bsrCode || "0000000").slice(0, 7)}${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${Math.floor(10000 + Math.random() * 90000)}`;
      }
    }

    const newChallan = {
      id,
      challanId: id,
      userId: String(userId),
      portal,
      challanType: data.challanType || "ROC_ANNUAL_FILING",
      entityName: data.entityName || "",
      cinOrPanOrGstin: (data.cinOrPanOrGstin || "").toUpperCase(),
      financialYear: data.financialYear || "2025-26",
      assessmentYear: data.assessmentYear || "2026-27",
      filingForm: data.filingForm || "AOC-4",
      srnOrCpinOrCin: identifier,
      bsrCode: data.bsrCode || "",
      challanSerialNumber: data.challanSerialNumber || `${Math.floor(10000 + Math.random() * 90000)}`,
      tenderedBank: data.tenderedBank || "",
      paymentMode: data.paymentMode || "INTERNET_BANKING",
      amountBreakdown: data.amountBreakdown || {
        baseFeeOrTax: Number(data.amount) || 0,
        additionalOrLateFee: 0,
        interest: 0,
        penalty: 0,
        totalAmount: Number(data.amount) || 0,
      },
      paymentStatus: data.paymentStatus || "GENERATED",
      paidAt: data.paymentStatus === "PAID" ? new Date().toISOString() : null,
      receiptNumber: data.paymentStatus === "PAID" ? `RCPT-${portal.slice(0, 3)}-${Date.now().toString().slice(-6)}` : null,
      dscSignatory: data.dscSignatory || "",
      clientBilled: false,
      createdAt: new Date().toISOString(),
    };

    challans.unshift(newChallan);
    writeFile("dev_statutory_challans.json", challans);
    return newChallan;
  },

  payStatutoryChallan(id, paymentData = {}, userId = null) {
    let challans = readFile("dev_statutory_challans.json", []);
    const idx = challans.findIndex(
      (c) =>
        (c.id === id || c.challanId === id) &&
        (!userId || (c.userId && String(c.userId) === String(userId)))
    );
    if (idx !== -1) {
      const portal = challans[idx].portal;
      const receiptNo = `RCPT-${portal.slice(0, 3)}-${Date.now().toString().slice(-6)}`;
      challans[idx].paymentStatus = "PAID";
      challans[idx].paidAt = new Date().toISOString();
      challans[idx].receiptNumber = receiptNo;
      challans[idx].paymentMode = paymentData.paymentMode || challans[idx].paymentMode;
      challans[idx].tenderedBank = paymentData.tenderedBank || challans[idx].tenderedBank;
      challans[idx].updatedAt = new Date().toISOString();
      writeFile("dev_statutory_challans.json", challans);
      return challans[idx];
    }
    return null;
  },

  // ==========================================================================
  // --- Executive Board & Audit Committee Dossiers (Section 177) ---
  // ==========================================================================
  getBoardDossiers(userId, filters = {}) {
    if (!userId) return [];
    let dossiers = readFile("dev_board_dossiers.json", []);
    dossiers = dossiers.filter((d) => d.userId && String(d.userId) === String(userId));
    if (filters.entityName) {
      dossiers = dossiers.filter((d) =>
        d.clientEntity?.name?.toLowerCase().includes(filters.entityName.toLowerCase()) ||
        d.clientEntity?.cin?.toUpperCase() === filters.entityName.toUpperCase()
      );
    }
    if (filters.financialYear) {
      dossiers = dossiers.filter((d) => d.financialYear === filters.financialYear);
    }
    return dossiers;
  },

  getBoardDossierById(id, userId = null) {
    const dossiers = readFile("dev_board_dossiers.json", []);
    return (
      dossiers.find(
        (d) =>
          (d.id === id || d.dossierId === id || d._id === id) &&
          (!userId || (d.userId && String(d.userId) === String(userId)))
      ) || null
    );
  },

  createBoardDossier(userId, data) {
    if (!userId) return null;
    const dossiers = readFile("dev_board_dossiers.json", []);
    const newDossier = {
      id: data.id || `dos-${Date.now()}`,
      dossierId: data.dossierId || `WAK-EXD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: String(userId),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dossiers.unshift(newDossier);
    writeFile("dev_board_dossiers.json", dossiers);
    return newDossier;
  },

  deleteBoardDossier(id, userId = null) {
    let dossiers = readFile("dev_board_dossiers.json", []);
    dossiers = dossiers.filter(
      (d) => !((d.id === id || d.dossierId === id) && (!userId || String(d.userId || "") === String(userId)))
    );
    writeFile("dev_board_dossiers.json", dossiers);
    return { success: true };
  },

  // --- Statutory Due Diligence & M&A Compliance Health Scorecard ---
  getDueDiligenceAudits(userId, filters = {}) {
    if (!userId) return [];
    let audits = readFile("dev_due_diligence_audits.json", []);
    audits = audits.filter((a) => a.userId && String(a.userId) === String(userId));
    if (filters.entityName) {
      audits = audits.filter((a) =>
        a.clientEntity?.name?.toLowerCase().includes(filters.entityName.toLowerCase()) ||
        a.clientEntity?.cin?.toUpperCase() === filters.entityName.toUpperCase()
      );
    }
    if (filters.riskCategory) {
      audits = audits.filter((a) => a.riskCategory === filters.riskCategory);
    }
    return audits;
  },

  getDueDiligenceAuditById(id, userId = null) {
    const audits = readFile("dev_due_diligence_audits.json", []);
    return (
      audits.find(
        (a) =>
          (a.id === id || a.auditId === id || a._id === id) &&
          (!userId || (a.userId && String(a.userId) === String(userId)))
      ) || null
    );
  },

  createDueDiligenceAudit(userId, data) {
    if (!userId) return null;
    const audits = readFile("dev_due_diligence_audits.json", []);
    const newAudit = {
      id: data.id || `dd-${Date.now()}`,
      auditId: data.auditId || `WAK-DD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: String(userId),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    audits.unshift(newAudit);
    writeFile("dev_due_diligence_audits.json", audits);
    return newAudit;
  },

  updateDueDiligenceAudit(id, updates, userId = null) {
    let audits = readFile("dev_due_diligence_audits.json", []);
    const index = audits.findIndex(
      (a) => (a.id === id || a.auditId === id) && (!userId || String(a.userId || "") === String(userId))
    );
    if (index === -1) return null;
    audits[index] = {
      ...audits[index],
      ...updates,
      userId: audits[index].userId,
      updatedAt: new Date().toISOString(),
    };
    writeFile("dev_due_diligence_audits.json", audits);
    return audits[index];
  },

  deleteDueDiligenceAudit(id, userId = null) {
    let audits = readFile("dev_due_diligence_audits.json", []);
    audits = audits.filter(
      (a) => !((a.id === id || a.auditId === id) && (!userId || String(a.userId || "") === String(userId)))
    );
    writeFile("dev_due_diligence_audits.json", audits);
    return { success: true };
  },

  // --- Statutory E-Notice & SCN Legal Mailroom ---
  getStatutoryNotices(filters = {}) {
    let notices = readFile("dev_statutory_notices.json", []);
    if (filters.userId) {
      notices = notices.filter((n) => n.userId && String(n.userId) === String(filters.userId));
    }
    if (filters.portal && filters.portal !== "ALL") {
      notices = notices.filter((n) => n.portal === filters.portal);
    }
    if (filters.status && filters.status !== "ALL") {
      notices = notices.filter((n) => n.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      notices = notices.filter((n) =>
        n.referenceNumber?.toLowerCase().includes(q) ||
        n.statutorySection?.toLowerCase().includes(q) ||
        n.allegationSubject?.toLowerCase().includes(q) ||
        n.issuingAuthority?.toLowerCase().includes(q) ||
        n.clientEntity?.name?.toLowerCase().includes(q)
      );
    }
    return notices;
  },

  getStatutoryNoticeById(id, userId = null) {
    const notices = readFile("dev_statutory_notices.json", []);
    return (
      notices.find(
        (n) =>
          (n.id === id || n.noticeId === id || n._id === id) &&
          (!userId || (n.userId && String(n.userId) === String(userId)))
      ) || null
    );
  },

  createStatutoryNotice(data) {
    const notices = readFile("dev_statutory_notices.json", []);
    const newNotice = {
      id: data.id || `notice-${Date.now()}`,
      noticeId: data.noticeId || `WAK-SCN-${Date.now()}`,
      ...data,
      status: data.status || "PENDING_RESPONSE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notices.unshift(newNotice);
    writeFile("dev_statutory_notices.json", notices);
    return newNotice;
  },

  updateStatutoryNotice(id, updates, userId = null) {
    let notices = readFile("dev_statutory_notices.json", []);
    const index = notices.findIndex(
      (n) => (n.id === id || n.noticeId === id) && (!userId || String(n.userId || "") === String(userId))
    );
    if (index === -1) return null;
    notices[index] = {
      ...notices[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeFile("dev_statutory_notices.json", notices);
    return notices[index];
  },

  deleteStatutoryNotice(id, userId = null) {
    let notices = readFile("dev_statutory_notices.json", []);
    notices = notices.filter(
      (n) => !((n.id === id || n.noticeId === id) && (!userId || String(n.userId || "") === String(userId)))
    );
    writeFile("dev_statutory_notices.json", notices);
    return { success: true };
  },

  // MDP Firm Governance & Regulatory Lock Methods
  _emptyMdpGovernance(userId) {
    return {
      firmId: userId ? `mdp-${userId}` : "",
      userId: userId ? String(userId) : "",
      firmName: "",
      firmStructure: "Multi-Disciplinary Partnership (LLP)",
      registrationCinOrLlpin: "",
      caFirmRegNo: "",
      csFirmRegNo: "",
      barCouncilRegistration: "",
      headquarters: "",
      members: [],
      regulatoryRules: Array.isArray(DEFAULT_MDP_FIRM_GOVERNANCE?.regulatoryRules)
        ? DEFAULT_MDP_FIRM_GOVERNANCE.regulatoryRules
        : [],
      delegatedTasks: [],
      dualSignOffGates: [],
    };
  },

  _readMdpStore() {
    const raw = readFile("dev_mdp_governance.json", { byUser: {} });
    if (raw && typeof raw === "object" && raw.byUser && typeof raw.byUser === "object") {
      return raw;
    }
    return { byUser: {} };
  },

  getMdpFirmGovernance(userId) {
    if (!userId) return this._emptyMdpGovernance("");
    const store = this._readMdpStore();
    const uid = String(userId);
    const existing = store.byUser[uid];
    if (!existing) return this._emptyMdpGovernance(uid);
    const base = this._emptyMdpGovernance(uid);
    return {
      ...base,
      ...existing,
      userId: uid,
      regulatoryRules:
        Array.isArray(existing.regulatoryRules) && existing.regulatoryRules.length > 0
          ? existing.regulatoryRules
          : base.regulatoryRules,
      members: Array.isArray(existing.members) ? existing.members : [],
      delegatedTasks: Array.isArray(existing.delegatedTasks) ? existing.delegatedTasks : [],
      dualSignOffGates: Array.isArray(existing.dualSignOffGates) ? existing.dualSignOffGates : [],
    };
  },

  updateMdpFirmGovernance(userId, updates = {}) {
    if (!userId) return null;
    const store = this._readMdpStore();
    const uid = String(userId);
    const current = this.getMdpFirmGovernance(uid);
    const updated = { ...current, ...updates, userId: uid, updatedAt: new Date().toISOString() };
    store.byUser[uid] = updated;
    writeFile("dev_mdp_governance.json", store);
    return updated;
  },

  updateMdpTeamMember(userId, memberId, updates = {}) {
    if (!userId) return null;
    const gov = this.getMdpFirmGovernance(userId);
    const index = (gov.members || []).findIndex((m) => m.memberId === memberId);
    if (index === -1) return null;
    gov.members[index] = { ...gov.members[index], ...updates };
    this.updateMdpFirmGovernance(userId, { members: gov.members });
    return gov.members[index];
  },

  getDelegatedTasks(userId) {
    if (!userId) return [];
    const gov = this.getMdpFirmGovernance(userId);
    return gov.delegatedTasks || [];
  },

  createDelegatedTask(userId, taskData = {}) {
    if (!userId) return null;
    const gov = this.getMdpFirmGovernance(userId);
    const newTask = {
      taskId: taskData.taskId || `TASK-DEL-${Date.now()}`,
      title: taskData.title || "",
      clientName: taskData.clientName || "",
      module: taskData.module || "ROC_FILING",
      assignedTrainee: taskData.assignedTrainee || null,
      reviewingPartner: taskData.reviewingPartner || null,
      workpaperReference: taskData.workpaperReference || "",
      traineeNotes: taskData.traineeNotes || "",
      partnerReviewNotes: "",
      status: "DRAFTING_BY_TRAINEE",
      fourEyesVerified: false,
      statutoryLockPreventedDsc: true,
      submittedAt: new Date().toISOString(),
    };
    const delegatedTasks = [newTask, ...(gov.delegatedTasks || [])];
    this.updateMdpFirmGovernance(userId, { delegatedTasks });
    return newTask;
  },

  reviewDelegatedTask(userId, taskId, { partnerReviewNotes, status, reviewingPartner } = {}) {
    if (!userId) return null;
    const gov = this.getMdpFirmGovernance(userId);
    const tasks = [...(gov.delegatedTasks || [])];
    const index = tasks.findIndex((t) => t.taskId === taskId);
    if (index === -1) return null;
    const task = { ...tasks[index] };
    if (partnerReviewNotes !== undefined) task.partnerReviewNotes = partnerReviewNotes;
    if (status) task.status = status;
    if (status === "PARTNER_APPROVED") {
      task.fourEyesVerified = true;
      task.statutoryLockPreventedDsc = false;
      task.reviewedAt = new Date().toISOString();
    }
    if (reviewingPartner) {
      task.reviewingPartner = reviewingPartner;
    }
    tasks[index] = task;
    this.updateMdpFirmGovernance(userId, { delegatedTasks: tasks });
    return task;
  },

  getDualSignOffGates(userId) {
    if (!userId) return [];
    const gov = this.getMdpFirmGovernance(userId);
    return gov.dualSignOffGates || [];
  },

  signDualSignOffGate(userId, gateId, { role, signatoryName, membershipNumber, udin } = {}) {
    if (!userId) return null;
    const gov = this.getMdpFirmGovernance(userId);
    const gates = [...(gov.dualSignOffGates || [])];
    const index = gates.findIndex((g) => g.gateId === gateId);
    if (index === -1) return null;
    const gate = {
      ...gates[index],
      csGate: { ...(gates[index].csGate || {}) },
      caGate: { ...(gates[index].caGate || {}) },
    };

    if (role === "CS" || role === "practicing_cs" || role === "managing_partner") {
      gate.csGate.status = "SIGNED";
      gate.csGate.signedBy = signatoryName || "";
      gate.csGate.membershipNumber = membershipNumber || "";
      gate.csGate.signedAt = new Date().toISOString();
    } else if (role === "CA" || role === "practicing_ca" || role === "senior_partner") {
      gate.caGate.status = "SIGNED";
      gate.caGate.signedBy = signatoryName || "";
      gate.caGate.membershipNumber = membershipNumber || "";
      gate.caGate.udin = udin || "";
      gate.caGate.signedAt = new Date().toISOString();
    }

    if (gate.csGate.status === "SIGNED" && gate.caGate.status === "SIGNED") {
      gate.overallStatus = "FULLY_CERTIFIED_RELEASED";
      gate.releaseCertificateHash = `SHA256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}94812a0f`;
    } else if (gate.csGate.status === "SIGNED" || gate.caGate.status === "SIGNED") {
      gate.overallStatus = "PARTIALLY_SIGNED";
    }

    gates[index] = gate;
    this.updateMdpFirmGovernance(userId, { dualSignOffGates: gates });
    return gate;
  },
};

const DEFAULT_AGENTS = [];

export const DEFAULT_AI_TWIN = {
  advocateId: "",
  advocateName: "",
  enrollmentNumber: "",
  barCouncil: "",
  standingYears: 0,
  calibrationScore: 0,
  pleadingsTrainedCount: 0,
  activeSyncStatus: "Awaiting Sync",
  draftingStyle: "constitutional_assertive",
  draftingStyleLabel: "Assertive Constitutional & Precedent-First",
  primaryJurisdiction: "high_court_kerala",
  primaryJurisdictionLabel: "High Court of Kerala",
  preferredCitations: [],
  benchTemperamentPreference: "",
  autonomousIntakeEnabled: false,
  minimumConsultationFee: 0,
  conflictCheckStrictness: "high",
  emergencyBailAutoEscalate: false,
  twinPersonaSummary: "",
  recentSimulations: [],
};

export const DEFAULT_TRAINING_MODULES = [
  {
    id: "mod_bns_ipc",
    title: "BNS vs IPC & BNSS vs CrPC Statutory Concordance",
    category: "Criminal Law & Procedure",
    instructor: "Chamber Senior Counsel",
    level: "Senior Associate Level",
    estimatedMinutes: 45,
    progress: 100,
    status: "Completed",
    score: "96%",
    overview: "Mastering cross-statutory concordance, transitioning pending FIRs under IPC to trial under BNSS 2023, and anticipatory bail under BNSS Section 482.",
    quizScenario: {
      prompt: "An FIR was registered on 15 June 2024 under Section 420 IPC. The police file a supplementary chargesheet on 10 August 2024 invoking BNS provisions. Accused seeks pre-arrest protection. What procedural provisions govern the bail application?",
      keyIssues: ["BNSS Section 531(2)(a) repeal and savings clause", "Substantive offences governed by legacy IPC at date of commission", "Procedural bail application governed by BNSS Section 482"],
      benchmarkAnswer: "Under Section 531(2)(a) of BNSS 2023, pending investigations and offences committed prior to 1 July 2024 are substantively governed by IPC. However, procedural applications for pre-arrest bail instituted subsequent to 1 July 2024 must be filed under Section 482 of BNSS (legacy Section 438 CrPC), as held by Kerala High Court in Abdul Khader v. State of Kerala (2024).",
      landmarkCitation: "Abdul Khader v. State of Kerala 2024 (4) KLT 112",
    },
  },
  {
    id: "mod_wpc_maintainability",
    title: "Article 226 High Court Writ Maintainability & Whirlpool Exceptions",
    category: "Constitutional & Administrative Law",
    instructor: "Chamber Senior Roster",
    level: "Appellate Junior Level",
    estimatedMinutes: 60,
    progress: 85,
    status: "In Progress",
    score: "92%",
    overview: "Overcoming alternate statutory remedy objections, pleading ex-facie lack of jurisdiction, and demonstrating grave violation of natural justice (audi alteram partem).",
    quizScenario: {
      prompt: "A statutory authority issues an impugned demand notice without serving a prior show-cause notice or affording personal hearing. The relevant statute provides an appeal before an Appellate Tribunal. Can a Writ Petition under Article 226 be maintained directly?",
      keyIssues: ["Whirlpool Corporation 4 exceptions", "Breach of fundamental natural justice rules", "Alternative remedy is a rule of discretion, not an absolute jurisdictional bar"],
      benchmarkAnswer: "Yes. While existence of an alternate statutory remedy is generally a bar, the 3-Judge bench of the Supreme Court in Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1 carved four categorical exceptions: (i) violation of fundamental rights, (ii) breach of natural justice, (iii) proceedings wholly without jurisdiction, and (iv) challenge to vires of legislation. Total omission of prior show-cause notice satisfies exception (ii) and allows direct Article 226 invocation.",
      landmarkCitation: "Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1",
    },
  },
  {
    id: "mod_sec138_ni",
    title: "Negotiable Instruments Act (Sec 138-142) Notice Defenses & Limitation",
    category: "Commercial & Banking Litigation",
    instructor: "Evidence Lab",
    level: "Litigation Junior Level",
    estimatedMinutes: 40,
    progress: 40,
    status: "Active Session",
    score: "88%",
    overview: "Calculating 30-day statutory notice timelines, interpreting postal endorsements (unclaimed/refused), and drafting complaints strictly compliant with Section 142(1)(b).",
    quizScenario: {
      prompt: "A demand notice dispatched via registered post is returned with endorsement 'Door Locked / Addressee Absent'. Complainant waits 45 days before filing complaint. Is complaint maintainable or barred by limitation?",
      keyIssues: ["Deemed service under Section 27 General Clauses Act", "Cause of action crystallization after 15 days of deemed service", "30-day limitation window under Section 142(1)(b)"],
      benchmarkAnswer: "Under C.C. Alavi Haji (2007) 6 SCC 555, postal endorsement of 'Door Locked' triggers statutory presumption of deemed service under Section 27 General Clauses Act on the date of return. The drawer is granted 15 days from deemed receipt to make payment. On the 16th day, cause of action arises, and the complaint must be instituted within 30 days. Waiting 45 days after the 15-day window bars the complaint unless condonation of delay is sought under proviso to Section 142(1)(b).",
      landmarkCitation: "C.C. Alavi Haji v. Palapetty Muhammed (2007) 6 SCC 555",
    },
  },
  {
    id: "mod_bsa_electronic_evidence",
    title: "Electronic Evidence Certification under BSA Section 63 (Legacy 65B)",
    category: "Trial Practice & Evidence",
    instructor: "Appellate Council",
    level: "Senior Associate Level",
    estimatedMinutes: 50,
    progress: 10,
    status: "Scheduled",
    score: "—",
    overview: "Drafting certificates under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 for WhatsApp chats, CDR logs, CCTV footage, and digital ledger hashes.",
    quizScenario: {
      prompt: "In a corporate breach of trust trial, complainant tenders printouts of encrypted WhatsApp conversations without an accompanying Section 63 BSA certificate. Defense objects to admissibility. How should the Court rule?",
      keyIssues: ["Mandatory nature of electronic certificate", "Section 63 BSA 2023 mirrors Section 65B Evidence Act", "Arjun Panditrao Khotkar binding precedent"],
      benchmarkAnswer: "The Court must sustain the defense objection. As established by the Supreme Court in Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal (2020) 7 SCC 1, compliance with the statutory certificate requirement (now codified in Section 63 of Bharatiya Sakshya Adhiniyam 2023) is a mandatory condition precedent for the admissibility of electronic records in secondary evidence form.",
      landmarkCitation: "Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal (2020) 7 SCC 1",
    },
  },
];

export const DEFAULT_CANDIDATES = [];

// ============================================================================
// DEFAULT SEED DATA FOR CHAMBER KNOWLEDGE BASE & BARE ACT STUDIO (Milestone 1)
// ============================================================================
export const DEFAULT_BARE_ACTS = [
  {
    id: "act_telegraph_1885",
    title: "Indian Telegraph Act, 1885",
    shortTitle: "Telegraph Act, 1885",
    actNumber: "Act No. 13 of 1885",
    category: "Central Statutory Act / Infrastructure & Utilities",
    enactmentYear: 1885,
    lastAmended: "2016 (Tribunal Reforms Alignment)",
    jurisdiction: "Supreme Court of India & High Court of Kerala",
    overview:
      "Statute providing powers to telegraph authorities and electricity transmission utilities (under Section 164 of the Electricity Act 2003) to place transmission towers, overhead lines, and cables across private lands, while prescribing statutory dispute resolution before District Magistrates and compensation assessment before District Courts.",
    sections: [
      {
        sectionNumber: "Section 10",
        heading: "Power for telegraph authority to place and maintain telegraph lines and posts",
        fullText:
          "The telegraph authority may, from time to time, place and maintain a telegraph line under, over, along, or across, and posts in or upon, any immovable property: Provided that— (a) the telegraph authority shall not exercise the powers conferred by this section except for the purposes of a telegraph established or maintained by the Central Government, or to be so established or maintained; (b) the Central Government shall not acquire any right other than that of user only in the property under, over, along, across in or upon which the telegraph authority places any telegraph line or post; (c) except as hereinafter provided, the telegraph authority shall not exercise those powers in respect of any property vested in or under the control or management of any local authority, without the permission of that authority; and (d) in the exercise of the powers conferred by this section, the telegraph authority shall do as little damage as possible, and, when the exercise of those powers has caused damage to any property, shall pay full compensation to all persons interested for any damage sustained by them by reason of the exercise of those powers.",
        commentary:
          "High Court of Kerala settled law establishes that the utility acquires only a right of user and NOT title or ownership. Minimum damage is an express statutory condition precedent. Landowners cannot be arbitrarily dispossessed without valuation.",
        landmarkCitations: [
          "Valsamma v. KSEB 2012 (2) KLT 368",
          "Executive Engineer, KSEB v. Doddakka (2015) 15 SCC 738",
        ],
        amendments: "Preserved under Section 164 of the Electricity Act, 2003 for transmission licensees.",
      },
      {
        sectionNumber: "Section 16",
        heading: "Exercise of powers confers upon telegraph authority, and disputes as to compensation",
        fullText:
          "(1) If the exercise of the powers mentioned in section 10 in respect of property referred to in clause (d) of that section is resisted or obstructed, the District Magistrate may, in his discretion, order that the telegraph authority shall be permitted to exercise them.\n(2) If, after the making of an order under sub-section (1), any person resists the exercise of those powers, or, having control over the property, does not give all facilities for their being exercised, he shall be deemed to have committed an offence under section 188 of the Indian Penal Code (or corresponding section of BNS 2023).\n(3) If any dispute arises concerning the sufficiency of the compensation to be paid under section 10, clause (d), it shall, on application for that purpose by either of the disputing parties to the District Judge within whose jurisdiction the property is situate, be determined by him.",
        commentary:
          "The utility has NO jurisdiction to unilaterally adjudicate resistance. Upon the slightest objection by a landowner or occupier, the transmission licensee MUST pause works and petition the District Magistrate under Section 16(1). Entering without a Section 16 order is actionable trespass and amenable to Article 226 Writ Petition.",
        landmarkCitations: [
          "Valsamma v. KSEB 2012 (2) KLT 368 (Full Bench)",
          "Power Grid Corporation of India v. Century Textiles & Industries Ltd. (2017) 5 SCC 143",
        ],
        amendments: "Remains core statutory shield for agricultural and plantation properties in Kerala.",
      },
      {
        sectionNumber: "Section 17",
        heading: "Removal or alteration of telegraph line or post on request of owner or occupier",
        fullText:
          "(1) When, under the foregoing provisions of this Act, a telegraph line or post has been placed by the telegraph authority under, over, along, across, in or upon any property, and any person entitled to do so desires to deal with that property in such a manner as to render it necessary or convenient that the telegraph line or post should be removed to another part thereof or to a higher or lower level or altered in form, he may require the telegraph authority to remove or alter the line or post accordingly.\n(2) If compensation has been paid under section 10, clause (d), he shall, when making the requisition, tender to the telegraph authority the amount requisite to defray the expenses of the removal or alteration.",
        commentary:
          "Empowers property owners who subsequently construct buildings or develop plots to requisition line realignment. The High Court has directed KSEB to furnish cost estimates and accommodate feasible alternate routes without undue delay.",
        landmarkCitations: ["KSEB v. Sudhakaran 2008 (4) KLT 302"],
        amendments: "Subject to Central Electricity Authority (CEA) safety clearances.",
      },
    ],
  },
  {
    id: "act_ni_1881",
    title: "Negotiable Instruments Act, 1881",
    shortTitle: "NI Act, 1881",
    actNumber: "Act No. 26 of 1881",
    category: "Banking & Commercial Law",
    enactmentYear: 1881,
    lastAmended: "2018 (Section 143A & 148 Insertions)",
    jurisdiction: "Judicial Magistrate First Class / High Court / Supreme Court",
    overview:
      "Regulates negotiable instruments including promissory notes, cheques, and bills of exchange. Chapter XVII provides penal remedies for dishonour of cheques for insufficiency of funds or exceeding arrangements, ensuring commercial credibility.",
    sections: [
      {
        sectionNumber: "Section 138",
        heading: "Dishonour of cheque for insufficiency, etc., of funds in the account",
        fullText:
          "Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money to another person from out of that account for the discharge, in whole or in part, of any debt or other liability, is returned by the bank unpaid, either because of the amount of money standing to the credit of that account is insufficient to honour the cheque or that it exceeds the amount arranged to be paid from that account by an agreement made with that bank, such person shall be deemed to have committed an offence and shall, without prejudice to any other provision of this Act, be punished with imprisonment for a term which may be extended to two years, or with fine which may extend to twice the amount of the cheque, or with both.",
        commentary:
          "Strict statutory conditions precedent: (1) Cheque presented within validity (3 months); (2) Bank memo received; (3) Statutory demand notice dispatched within 30 days of memo; (4) Drawer fails to pay within 15 days of notice receipt. Cause of action crystallizes on the 16th day.",
        landmarkCitations: [
          "MSR Leathers v. S. Palaniappan (2013) 1 SCC 177",
          "Rangappa v. Sri Mohan (2010) 11 SCC 441",
          "K. Bhaskaran v. Sankaran Vaidhyan Balan (1999) 7 SCC 510",
        ],
        amendments: "Amended in 2002 to enhance imprisonment to 2 years.",
      },
      {
        sectionNumber: "Section 139",
        heading: "Presumption in favour of holder",
        fullText:
          "It shall be presumed, unless the contrary is proved, that the holder of a cheque received the cheque of the nature referred to in section 138 for the discharge, in whole or in part, of any debt or other liability.",
        commentary:
          "Constitutes a reverse burden of proof. The initial presumption operates against the accused upon admission of signature. The accused may rebut only through a preponderance of probabilities, not mere denials.",
        landmarkCitations: [
          "Bir Singh v. Mukesh Kumar (2019) 4 SCC 197",
          "Kalamani Tex v. P. Balasubramanian (2021) 5 SCC 283",
        ],
        amendments: "Reaffirmed by 3-judge Bench in Rangappa (2010).",
      },
      {
        sectionNumber: "Section 141",
        heading: "Offences by companies",
        fullText:
          "(1) If the person committing an offence under section 138 is a company, every person who; at the time the offence was committed, was in charge of, and was responsible to the company for the conduct of the business of the company, as well as the company, shall be deemed to be guilty of the offence and shall be liable to be proceeded against and punished accordingly.",
        commentary:
          "Mandatory requirement of specific pleading: The complaint must explicitly aver the role played by the individual director or signatory at the time the offence was committed. Managing Directors and signatories are liable by virtue of office.",
        landmarkCitations: [
          "SMS Pharmaceuticals Ltd. v. Neeta Bhalla (2005) 8 SCC 89",
          "Sunita Palita v. Panchami Stone Quarry (2022) 10 SCC 152",
        ],
        amendments: "Extended to Limited Liability Partnerships (LLPs).",
      },
      {
        sectionNumber: "Section 143A",
        heading: "Power to direct interim compensation",
        fullText:
          "(1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973, the Court trying an offence under section 138 may order the drawer of the cheque to pay interim compensation to the complainant— (a) in a summary trial or a summons case, where he pleads not guilty to the accusation made in the complaint; and (b) in any other case, upon framing of charge.\n(2) The interim compensation under sub-section (1) shall not exceed twenty per cent of the amount of the cheque.\n(3) The interim compensation shall be paid within sixty days from the date of the order.",
        commentary:
          "Substantive amendment introduced in 2018. Supreme Court in G.J. Raja v. Tejraj Sharma held Section 143A is prospective in nature. The award is discretionary and court must record reasons before imposing the maximum 20% cap.",
        landmarkCitations: [
          "G.J. Raja v. Tejraj Sharma (2019) 19 SCC 469",
          "Rakesh Ranjan Shrivastava v. State of Jharkhand (2024) 4 SCC 419",
        ],
        amendments: "Inserted by Act 20 of 2018, w.e.f. 01-09-2018.",
      },
    ],
  },
  {
    id: "act_bns_2023",
    title: "Bharatiya Nyaya Sanhita, 2023",
    shortTitle: "BNS, 2023",
    actNumber: "Act No. 45 of 2023",
    category: "Criminal Law / Substantive Penal Code",
    enactmentYear: 2023,
    lastAmended: "2024 (Enforced 1 July 2024)",
    jurisdiction: "All India Sessions & Magistrate Courts",
    overview:
      "Modernized penal code repealing the Indian Penal Code 1860. Restructures offences against property, economic crimes, bodily injuries, and introduces community service for specified petty offences.",
    sections: [
      {
        sectionNumber: "Section 318",
        heading: "Cheating",
        fullText:
          "(1) Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person, or to consent that any person shall retain any property, or intentionally induces the person so deceived to do or omit to do anything which he would not do or omit if he were not so deceived, is said to 'cheat'.\n(2) Whoever cheats shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.\n(3) Whoever cheats and thereby dishonestly induces the person deceived to deliver any property, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
        commentary:
          "Direct replacement for legacy Sections 415, 417, and 420 of the IPC. Sub-section (4) consolidates legacy Section 420 IPC (cheating and dishonestly inducing delivery of property). Retains the strict requirement of dishonest intention existing from the inception of the transaction.",
        landmarkCitations: [
          "Concordance with Hridaya Ranjan Prasad Verma v. State of Bihar (2000) 4 SCC 168",
          "Prof. R.K. Vijayasarathy v. Sudha Seetharam (2019) 16 SCC 739",
        ],
        amendments: "Effective from 1 July 2024 across all new FIRs.",
      },
      {
        sectionNumber: "Section 316",
        heading: "Criminal breach of trust",
        fullText:
          "(1) Whoever, being in any manner entrusted with property, or with any dominion over property, dishonestly misappropriates or converts to his own use that property, or dishonestly uses or disposes of that property in violation of any direction of law prescribing the mode in which such trust is to be discharged, commits 'criminal breach of trust'.",
        commentary:
          "Consolidates legacy Sections 405 and 406 of the IPC. Retains the essential dual ingredients: entrustment of property and subsequent dishonest conversion. In commercial disputes, pure accounts discrepancy cannot sustain a Section 316 prosecution.",
        landmarkCitations: ["S.W. Palanitkar v. State of Bihar (2002) 1 SCC 241"],
        amendments: "Effective 1 July 2024.",
      },
    ],
  },
  {
    id: "act_bnss_2023",
    title: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    shortTitle: "BNSS, 2023",
    actNumber: "Act No. 46 of 2023",
    category: "Criminal Procedure & Police Powers",
    enactmentYear: 2023,
    lastAmended: "2024 (Enforced 1 July 2024)",
    jurisdiction: "High Court of Kerala, Sessions & Magistrate Courts",
    overview:
      "Procedural code repealing the Code of Criminal Procedure, 1973 (CrPC). Codifies electronic summons, audio-video recording of search and seizure, forensic mandates, and preserves inherent high court powers.",
    sections: [
      {
        sectionNumber: "Section 482",
        heading: "Direction for grant of bail to person apprehending arrest (Anticipatory Bail)",
        fullText:
          "(1) When any person has reason to believe that he may be arrested on an accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section; and that Court may, if it thinks fit, direct that in the event of such arrest, he shall be released on bail.\n(2) When the High Court or the Court of Session makes a direction under sub-section (1), it may include such conditions in such directions in the light of the facts of the particular case, as it may think fit.",
        commentary:
          "Corresponds directly to legacy Section 438 of the CrPC. Concurrent jurisdiction of Court of Session and High Court preserved. The Kerala High Court practice requires applicant to approach Court of Session first unless exceptional urgency or district-wide jurisdiction is demonstrated.",
        landmarkCitations: [
          "Sushila Aggarwal v. State (NCT of Delhi) (2020) 5 SCC 1 (Constitutional Bench)",
          "Gurbaksh Singh Sibbia v. State of Punjab (1980) 2 SCC 565",
        ],
        amendments: "Effective 1 July 2024. Replaces Section 438 CrPC.",
      },
      {
        sectionNumber: "Section 528",
        heading: "Saving of inherent powers of High Court",
        fullText:
          "Nothing in this Sanhita shall be deemed to limit or affect the inherent powers of the High Court to make such orders as may be necessary to give effect to any order under this Sanhita, or to prevent abuse of the process of any Court or otherwise to secure the ends of justice.",
        commentary:
          "Direct concordance with legacy Section 482 CrPC. High Court retains plenary inherent jurisdiction to quash FIRs, complaint cases, and chargesheets where allegations do not disclose any cognizable offence or where proceedings are initiated with malafides.",
        landmarkCitations: [
          "State of Haryana v. Bhajan Lal 1992 Supp (1) SCC 335",
          "Neeharika Infrastructure Pvt Ltd v. State of Maharashtra (2021) 19 SCC 401",
        ],
        amendments: "Effective 1 July 2024.",
      },
    ],
  },
  {
    id: "act_arb_1996",
    title: "Arbitration and Conciliation Act, 1996",
    shortTitle: "Arbitration Act, 1996",
    actNumber: "Act No. 26 of 1996",
    category: "Commercial Arbitration & Dispute Resolution",
    enactmentYear: 1996,
    lastAmended: "2019 (Arbitration Council of India Alignment)",
    jurisdiction: "High Court of Kerala (Commercial Division) & District Courts",
    overview:
      "Comprehensive law relating to domestic arbitration, international commercial arbitration, and enforcement of arbitral awards. Provides speedy resolution mechanisms and curtails judicial intervention.",
    sections: [
      {
        sectionNumber: "Section 9",
        heading: "Interim measures, etc., by Court",
        fullText:
          "A party may, before or during arbitral proceedings or at any time after the making of the arbitral award but before it is enforced in accordance with section 36, apply to a Court: (i) for the appointment of a guardian for a minor or person of unsound mind; or (ii) for an interim measure of protection in respect of: (a) preservation, interim custody or sale of any goods which are the subject-matter of the arbitration agreement; (b) securing the amount in dispute in the arbitration; (c) the detention, preservation or inspection of any property or thing...",
        commentary:
          "Section 9 petitions may be moved prior to arbitral tribunal constitution. Once arbitral proceedings commence, Section 9(2) mandates that arbitration must commence within 90 days of an interim order.",
        landmarkCitations: [
          "Essar House Private Limited v. Arcellor Mittal Nippon Steel India Ltd (2022) SCC OnLine SC 1219",
          "Firm Ashok Traders v. Gurumukh Das Saluja (2004) 3 SCC 155",
        ],
        amendments: "Amended by Act 3 of 2016 to impose 90-day tribunal initiation timeline.",
      },
      {
        sectionNumber: "Section 12(5)",
        heading: "Grounds for challenge & Seventh Schedule ineligibility",
        fullText:
          "Notwithstanding any prior agreement to the contrary, any person whose relationship, with the parties or counsel or the subject-matter of the dispute, falls under any of the categories specified in the Seventh Schedule shall be ineligible to be appointed as an arbitrator: Provided that parties may, subsequent to disputes having arisen between them, waive the applicability of this sub-section by an express agreement in writing.",
        commentary:
          "The Perkins Eastman doctrine establishes that an interested party who is ineligible to act as an arbitrator cannot nominate or unilaterally appoint an arbitrator. Standard PSU/governmental clauses appointing managing directors or their nominees are void ab initio.",
        landmarkCitations: [
          "Perkins Eastman Architects DPC v. HSCC (India) Ltd (2020) 20 SCC 760",
          "TRF Limited v. Energo Engineering Projects Ltd (2017) 8 SCC 377",
          "Bharat Broadband Network Ltd v. United Telecoms Ltd (2019) 5 SCC 755",
        ],
        amendments: "Inserted by Act 3 of 2016 w.e.f. 23-10-2015.",
      },
    ],
  },
  {
    id: "act_klr_1963",
    title: "Kerala Land Reforms Act, 1963",
    shortTitle: "KLR Act, 1963",
    actNumber: "Act 1 of 1964",
    category: "Kerala State Enactment / Agrarian Law",
    enactmentYear: 1963,
    lastAmended: "2015 (Ceiling Revision & Plantation Definitions)",
    jurisdiction: "Land Tribunals, Taluk Land Boards & High Court of Kerala",
    overview:
      "Pivotal Kerala statute conferring proprietary rights upon cultivating tenants, eliminating intermediary tenures, establishing ceiling limits on land holdings, and setting statutory exemptions for commercial plantations.",
    sections: [
      {
        sectionNumber: "Section 72",
        heading: "Vesting in Government of landlord's rights in respect of holdings held by cultivating tenants",
        fullText:
          "(1) On a date to be notified by the Government in this behalf, all right, title and interest of the landowners and intermediaries in respect of holdings held by cultivating tenants entitled to fixity of tenure under section 13 shall, subject to the provisions of this section, vest in the Government free from all encumbrances.",
        commentary:
          "Statutory abolition of landlordism in Kerala. Cultivating tenants obtain absolute title upon issuance of Purchase Certificate (KLR Form 24) by the Land Tribunal. Purchase certificate is conclusive proof of title against subsequent challenge.",
        landmarkCitations: [
          "Govinda Pillai v. Land Tribunal 1978 KLT 234",
          "Sreedharan v. State of Kerala 1999 (2) KLT 456",
        ],
        amendments: "Vesting date notified as 1 January 1970.",
      },
      {
        sectionNumber: "Section 81",
        heading: "Exemptions from ceiling area",
        fullText:
          "(1) The provisions of this Chapter shall not apply to— (a) lands owned or held by the Government of India or the Government of any State; (e) plantations of tea, coffee, cocoa, rubber, cardamom or cinnamon exceeding such limit as may be prescribed.",
        commentary:
          "Crucial exemption protecting Kerala rubber and tea estates from land ceiling fragmentation. If plantation land is fragmented or used for non-plantation purposes, the exemption may be scrutinized under Section 85.",
        landmarkCitations: [
          "State of Kerala v. Moosa 1994 (2) KLT 318",
          "Harrison Malayalam Ltd. v. State of Kerala 2018 (2) KLT 369",
        ],
        amendments: "Clarification on ancillary factory and labor quarters inclusion.",
      },
    ],
  },
];

export const DEFAULT_PLAYBOOKS = [
  {
    id: "sop_writ_wp_c",
    code: "SOP-KLHC-WPC-01",
    title: "High Court of Kerala Writ Petition (Civil) Article 226 SOP",
    shortTitle: "Article 226 WP(C) Filing Playbook",
    forum: "High Court of Kerala (Ernakulam)",
    category: "Constitutional Writs",
    turnaround: "24-48 Hours",
    description:
      "Chamber standard operating procedure for drafting, vetting, formatting, e-filing, scrutiny clearance, and urgent bench mentioning for Writ Petitions before the High Court of Kerala.",
    checklist: [
      {
        stage: "Stage 1: Pre-Filing Due Diligence & Statutory Audit",
        items: [
          "Exhaustion of Alternative Remedies: Verify whether statutory appeal, revision, or Magistrate application under Section 16 Telegraph Act was pursued or if patent arbitrariness warrants direct Article 226 intervention.",
          "High Court Caveat Registry Search: Query eCourts Caveat Registry under Section 148A CPC for respondent state authorities or opposite parties to ensure caveator notice is served.",
          "Statutory Representation Proof: Verify that a formal representation or notice was served on the official respondent with registered postal proof or acknowledgement receipt.",
        ],
      },
      {
        stage: "Stage 2: Pleadings Drafting & Formatting Compliance",
        items: [
          "Rule 146 Margin Compliance: Ensure strict 2.0-inch (5 cm) left margin, 1.2-inch right, top, and bottom margins on legal size paper (8.5 x 14 in).",
          "Pleading Hierarchy: Synopsis & List of Dates -> Index of Pleadings -> Memo of Writ Petition (Civil) -> Verification Affidavit -> Exhibits Annexure P-1 to P-n.",
          "Affidavit True Copy Attestation: Each exhibit copy must bear the mandatory stamp 'True Copy / Advocate' along with Advocate Roll No. and signature.",
        ],
      },
      {
        stage: "Stage 3: e-Filing & Court Registry Scrutiny",
        items: [
          "eCourts EF Portal Ingestion: Upload unified PDF bundle with embedded OCR text layer and digital sign verification.",
          "Writ Stamp & Court Fee: Affix ₹100 High Court Writ Stamp, ₹25 Advocate Welfare Fund stamp, and requisite process memo fees.",
          "Registry Defect Rectification: Monitor filing status for scrutiny notes (Filing No. EF/KLHC/...). Clear objections within 48 hours to prevent registry laches.",
        ],
      },
      {
        stage: "Stage 4: Bench Listing & Motion Mentioning",
        items: [
          "Service on Standing Counsel: Deliver advanced copy with acknowledgement to the designated Standing Counsel (e.g., KSEB, Corporation, Government Pleader).",
          "Urgent Listing Memo: File Urgent Memo before the Registrar (Judicial) specifying the irreparable harm or date of impending execution.",
          "Bench Appearance Brief: Hand over Bench Argument Dossier with highlighted copies of landmark rulings to Senior Counsel.",
        ],
      },
    ],
  },
  {
    id: "sop_sec_138_ni",
    code: "SOP-NI138-TRIAL-02",
    title: "Section 138 Negotiable Instruments Act — Trial SOP",
    shortTitle: "Cheque Dishonour End-to-End SOP",
    forum: "Judicial First Class Magistrate (JFCM) Court",
    category: "Criminal & Banking",
    turnaround: "15-45 Days",
    description:
      "Chamber protocol covering the complete timeline from bank memo receipt, 30-day statutory demand notice, postal presumption tracking, cure countdown, to Section 142 complaint institution and Section 143A interim compensation.",
    checklist: [
      {
        stage: "Stage 1: Cheque Return Audit & Timeline Calculation",
        items: [
          "Memo Scrutiny: Verify return memo reason code ('Funds Insufficient', 'Account Closed', 'Exceeds Arrangement', 'Refer to Drawer').",
          "Presentation Validity: Ensure cheque was presented within 3 months of issuance date.",
          "30-Day Notice Deadline: Calculate the strict 30-day statutory limit from the date of intimation/return memo receipt.",
        ],
      },
      {
        stage: "Stage 2: Statutory Demand Notice Dispatch",
        items: [
          "Demand Specificity: Make an unequivocal demand for the exact cheque amount; avoid clubbing unliquidated damages or interest in the principal demand.",
          "Speed Post with Delivery Tracking: Dispatch notice via India Post Speed Post / Registered Post with A/D to all known residential and business addresses.",
          "Section 27 General Clauses Presumption: Download and preserve the certified India Post tracking report reflecting 'Item Delivered' or 'Refused / Unclaimed'.",
        ],
      },
      {
        stage: "Stage 3: 15-Day Cure Window & Cause of Action",
        items: [
          "Cure Period Monitoring: Track the mandatory 15 days from the date of confirmed delivery. The drawer has until the 15th day midnight to pay.",
          "Cause of Action Crystallization: The offence is committed on the 16th day following notice receipt. The complaint must be filed within 30 days of the 16th day.",
        ],
      },
      {
        stage: "Stage 4: Section 142 Complaint Institution",
        items: [
          "Jurisdiction Verification under S.142(2): Determine competent JFCM court based on the branch where the payee maintains his bank account.",
          "Section 145(1) Affidavit in Lieu of Sworn Statement: Accompany complaint with complainant's sworn evidence affidavit to dispense with physical presence.",
          "Section 143A Application: Move interim application praying for 20% interim compensation deposit upon appearance of the accused.",
        ],
      },
    ],
  },
  {
    id: "sop_anticipatory_bail",
    code: "SOP-BNSS482-BAIL-03",
    title: "Section 482 BNSS 2023 Anticipatory Bail SOP",
    shortTitle: "Pre-Arrest Protection Protocol",
    forum: "Court of Session / High Court of Kerala",
    category: "Criminal Procedure",
    turnaround: "24-72 Hours",
    description:
      "Protocol for securing anticipatory bail under Section 482 BNSS 2023 (formerly Section 438 CrPC), reviewing police summons under Section 35 BNSS, establishing clean antecedents, and obtaining interim protection.",
    checklist: [
      {
        stage: "Stage 1: Offence Cognizance & Notice Audit",
        items: [
          "FIR & Complaint Scrutiny: Obtain certified copy or eCourts web copy of the FIR; analyze penal sections charged under BNS 2023.",
          "Section 35 BNSS Notice Verification: Check if police served mandatory notice to appear under Section 35 BNSS (legacy 41A CrPC); document compliance or arbitrary arrest threats.",
          "Bailable vs Non-Bailable Classification: Confirm that at least one offence invoked is non-bailable under the First Schedule of BNSS.",
        ],
      },
      {
        stage: "Stage 2: Grounds Drafting & Personal Liberty Factors",
        items: [
          "Establish Bona Fides & Clean Antecedents: Formulate clear averments that applicant has no prior criminal records, is a permanent resident, and is not a flight risk.",
          "Absence of Custodial Interrogation Need: Establish that the case hinges on documentary or digital evidence already available, rendering custodial torture or custody unnecessary.",
          "Readiness to Cooperate: Include unconditional undertaking to appear before the Investigating Officer as and when summoned.",
        ],
      },
      {
        stage: "Stage 3: Public Prosecutor Service & Interim Order",
        items: [
          "Advance Service: Serve physical copy of bail application upon the Office of the Director General of Prosecution / Public Prosecutor.",
          "Interim Protection Motion: In high-urgency matters, move for interim direction that applicant shall not be arrested pending receipt of Case Diary (CD).",
          "Surety Readiness: Prepare two local solvent sureties with Aadhaar, tax receipts, or solvency certificates for immediate bail bond execution upon grant.",
        ],
      },
    ],
  },
  {
    id: "sop_caveat_cpc",
    code: "SOP-CPC148A-CAV-04",
    title: "Preemptive Caveat Petition under Section 148A CPC",
    shortTitle: "Caveat Lodgement & Monitoring SOP",
    forum: "High Court of Kerala & Subordinate District Courts",
    category: "Civil Procedure",
    turnaround: "Same-Day Execution",
    description:
      "Chamber workflow for preparing and lodging caveats under Section 148A CPC to guarantee advance notice before any ex-parte interim injunction or stay order can be granted against the client.",
    checklist: [
      {
        stage: "Stage 1: Risk Assessment & Adverse Party Identification",
        items: [
          "Apprehended Proceedings: Identify the anticipated suit, appeal, or writ petition likely to be filed by the opposing party.",
          "Exact Party Particulars: Extract verified names, official addresses, and designations of both caveator and proposed applicants.",
        ],
      },
      {
        stage: "Stage 2: Caveat Drafting & Formalities",
        items: [
          "High Court Form No. 19 / Civil Rules of Practice: Draft caveat petition reciting that caveator has right to appear on any application for interim relief.",
          "Supporting Affidavit: Execute solemn affidavit affirmed by caveator or power of attorney holder.",
        ],
      },
      {
        stage: "Stage 3: Service & Registry Registration",
        items: [
          "Pre-Filing Postal Service: Despatch caveat petition by Registered Post A/D to the proposed applicant; preserve postal booking receipts.",
          "Registry Lodgement: File caveat petition with registry receipt proof; obtain Caveat Registration Number.",
          "90-Day Renewal Calendar: Tag caveat expiry in ERP calendar (valid for 90 days from filing under Section 148A(5)).",
        ],
      },
    ],
  },
];

export const DEFAULT_KB_ARTICLES = [];
export const DEFAULT_RESEARCH_BRIEFS = [];
export const DEFAULT_COLLAB_ROOMS = [];
export const DEFAULT_COURTROOM_SESSIONS = [];
export const DEFAULT_CALENDAR_BACKLOG = [];
export const DEFAULT_CALENDAR_FIXTURES = [];
// ============================================================================
// DEFAULT PROFESSIONAL NETWORK CONSTANTS
// ============================================================================
export const DEFAULT_NETWORK_CONTACTS = [];

export const DEFAULT_NETWORK_ACTIVITIES = [];

const DEFAULT_NETWORK_FOLLOWUPS = [];

const DEFAULT_NETWORK_RECOMMENDATIONS = [];

// ============================================================================
// DEFAULT TASK MITE CONSTANTS
// ============================================================================
export const DEFAULT_TASKMITE_TASKS = [];

export const DEFAULT_TASKMITE_NOTES = [];

// ============================================================================
// DEFAULT PROFILES CONSTANTS (BCI & DIGILOCKER)
// ============================================================================
const DEFAULT_BCI_CREDENTIALS = {
  advocateName: "",
  enrollmentNumber: "",
  stateBarCouncil: "",
  enrollmentYear: "",
  verificationStatus: "Pending",
  verifiedBy: "",
  verifiedOn: "",
  certificateHash: "",
  practiceBenches: [],
  chamberName: "",
  chamberAddress: "",
  chamberEmail: "",
  chamberPhone: "",
};

const DEFAULT_DIGILOCKER_KYC = {
  citizenName: "",
  kycStatus: "Pending",
  verificationSource: "",
  digiLockerDocId: "",
  verifiedAt: "",
  documentType: "",
  maskedId: "",
  address: "",
  phone: "",
  email: "",
};

// ============================================================================
// DEFAULT CS BOARD GOVERNANCE CONSTANTS (MEETINGS & RESOLUTIONS)
// ============================================================================
export const DEFAULT_BOARD_MEETINGS = [
  {
    id: "bm-1",
    meetingId: "bm-1",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    meetingNumber: "BM-04/2026-27",
    meetingType: "board_meeting",
    date: "2026-11-10",
    time: "11:00 AM",
    venue: "Board Room, Registered Office & Two-Way Video Conference (Rule 3)",
    isVideoConference: true,
    chairperson: "Dr. Vikram Malhotra (Chairman & Independent Director)",
    directors: [
      { name: "Dr. Vikram Malhotra", din: "08912340", status: "present" },
      { name: "CS Rajesh Sharma", din: "07849102", status: "present" },
      { name: "Priya Sundaram", din: "09124589", status: "present_vc" },
      { name: "Karan Patel", din: "06451290", status: "leave_of_absence" },
    ],
    isShorterNotice: false,
    shorterNoticeReason: "",
    status: "notice_sent",
    agendaItems: [
      {
        itemNumber: 1,
        title: "Leave of Absence & Quorum Verification",
        description: "To grant leave of absence to Mr. Karan Patel and ascertain quorum presence per Section 174.",
        proposedBy: "Dr. Vikram Malhotra",
        isStatutory: true,
      },
      {
        itemNumber: 2,
        title: "Confirmation of Previous Minutes (BM-03/2026-27)",
        description: "To confirm and sign minutes of the previous Board Meeting held on 14 August 2026 per SS-1.",
        proposedBy: "CS Rajesh Sharma",
        isStatutory: true,
      },
      {
        itemNumber: 3,
        title: "Disclosure of Directors' Interest (Form MBP-1 / Section 184)",
        description: "To take on record general notices of disclosure of interest received from Directors in Form MBP-1.",
        proposedBy: "CS Rajesh Sharma",
        isStatutory: true,
      },
      {
        itemNumber: 4,
        title: "Private Placement of 50,000 CCPS under Section 42 & 62(1)(c)",
        description: "To approve Draft Form PAS-4 Private Placement Offer Letter and call an EGM for special resolution approval.",
        proposedBy: "Priya Sundaram",
        isStatutory: false,
      },
      {
        itemNumber: 5,
        title: "Revision of Bank Operation Mandates with HDFC Bank",
        description: "To authorize Joint Signatures for all banking transactions exceeding ₹25,00,000.",
        proposedBy: "Dr. Vikram Malhotra",
        isStatutory: false,
      },
    ],
    minutes: {
      draftContent: "DRAFT MINUTES OF THE 4TH MEETING OF THE BOARD OF DIRECTORS OF CYBERCORP TECHNOLOGIES PVT LTD HELD ON TUESDAY, 10 NOVEMBER 2026 AT 11:00 AM...",
      finalContent: "",
      signedBy: "Dr. Vikram Malhotra",
      signedAt: "",
    },
  },
  {
    id: "bm-2",
    meetingId: "bm-2",
    companyName: "Zenith FinTech India Pvt Ltd",
    cin: "U65990MH2021PTC362145",
    meetingNumber: "AGM-05/2026",
    meetingType: "agm",
    date: "2026-09-28",
    time: "02:30 PM",
    venue: "Auditorium Hall, Marine Lines, Mumbai & Live Webcast",
    isVideoConference: true,
    chairperson: "Smt. Devika Menon (Managing Director)",
    directors: [
      { name: "Smt. Devika Menon", din: "07123984", status: "present" },
      { name: "Rahul Sharma", din: "08451290", status: "present" },
      { name: "Arjun Nambiar", din: "09124589", status: "present" },
    ],
    isShorterNotice: false,
    shorterNoticeReason: "",
    status: "minutes_signed",
    agendaItems: [
      {
        itemNumber: 1,
        title: "Adoption of Audited Financial Statements FY 2025-26",
        description: "To receive, consider and adopt audited Balance Sheet, P&L, and Board Report.",
        proposedBy: "Smt. Devika Menon",
        isStatutory: true,
      },
      {
        itemNumber: 2,
        title: "Declaration of Final Dividend of ₹2.50 per Equity Share",
        description: "Recommendation of 25% dividend payout out of current year profits.",
        proposedBy: "Rahul Sharma",
        isStatutory: false,
      },
    ],
    minutes: {
      draftContent: "",
      finalContent: "MINUTES OF THE 5TH ANNUAL GENERAL MEETING OF ZENITH FINTECH INDIA PVT LTD HELD ON 28 SEPTEMBER 2026... All ordinary resolutions passed unanimously. Entered into Minutes Book on 12 October 2026.",
      signedBy: "Smt. Devika Menon",
      signedAt: "2026-10-12",
    },
  },
];

export const DEFAULT_BOARD_RESOLUTIONS = [
  {
    id: "res-1",
    resolutionId: "res-1",
    meetingId: "bm-1",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    resolutionNumber: "RES-01/BM-04/2026-27",
    type: "board",
    category: "banking",
    title: "Opening Current Account & Authorizing Digital Signatories with HDFC Bank Ltd",
    actSection: "Section 179(3)(e) of Companies Act 2013",
    preambleText: "WHEREAS the Company requires an enhanced corporate banking facility and CMS gateway for operational collections and automated payroll disbursements;",
    resolutionText: "RESOLVED THAT a Corporate Current Account in the name of 'CyberCorp Technologies Pvt Ltd' be opened with HDFC Bank Ltd, Connaught Place Branch, New Delhi, and that the Bank be and is hereby authorized to honor all cheques, promissory notes, and electronic RTGS/NEFT transfers drawn on behalf of the Company.",
    furtherResolutionText: "FURTHER RESOLVED THAT Dr. Vikram Malhotra (Director) and CS Rajesh Sharma (Company Secretary) be and are hereby jointly authorized to execute all account opening documentation, net banking mandates, and affix the Common Seal/Signature on behalf of the Company.",
    authorizedSignatories: ["Dr. Vikram Malhotra", "CS Rajesh Sharma"],
    status: "passed_unanimously",
    isCtcGenerated: true,
    ctcCertifiedBy: "CS Rajesh Sharma (FCS 8492, CP 10294)",
    ctcCertifiedAt: "2026-11-01",
  },
  {
    id: "res-2",
    resolutionId: "res-2",
    meetingId: "bm-1",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    resolutionNumber: "RES-02/BM-04/2026-27",
    type: "special",
    category: "share_allotment",
    title: "Approval of Private Placement Offer Letter (Form PAS-4) for 50,000 Series A CCPS",
    actSection: "Section 42 & Section 62(1)(c) of Companies Act 2013 read with PAS Rules",
    preambleText: "WHEREAS the Company proposes to raise capital for tech stack expansion through issuance of 0.01% Compulsorily Convertible Preference Shares (CCPS) on private placement terms;",
    resolutionText: "RESOLVED THAT subject to the approval of shareholders in General Meeting, the draft Private Placement Offer Letter in Form PAS-4 along with Application Form as placed before the Board be and is hereby approved for circulation to the identified institutional investor M/s Indus Venture Capital Fund.",
    furtherResolutionText: "FURTHER RESOLVED THAT an Extraordinary General Meeting (EGM) of the Company be convened on Friday, 28 November 2026 at 11:30 AM to pass the requisite Special Resolution under Section 42 and 62 of the Act.",
    authorizedSignatories: ["Priya Sundaram", "CS Rajesh Sharma"],
    status: "passed_unanimously",
    isCtcGenerated: false,
    ctcCertifiedBy: "",
    ctcCertifiedAt: "",
  },
  {
    id: "res-3",
    resolutionId: "res-3",
    meetingId: "bm-1",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    resolutionNumber: "RES-03/BM-04/2026-27",
    type: "board",
    category: "director_appointment",
    title: "Appointment of Dr. Ananya Sen as Additional Director (Independent)",
    actSection: "Section 161(1) and Section 149 of Companies Act 2013",
    preambleText: "WHEREAS the Nomination & Remuneration Committee has recommended the induction of Dr. Ananya Sen to strengthen board oversight in data privacy and cybersecurity standards;",
    resolutionText: "RESOLVED THAT pursuant to the provisions of Section 161(1) and other applicable provisions of the Companies Act, 2013 and the Articles of Association, Dr. Ananya Sen (DIN: 09841235) be and is hereby appointed as an Additional Director (Category: Independent) of the Company with immediate effect to hold office up to the date of the next Annual General Meeting.",
    furtherResolutionText: "FURTHER RESOLVED THAT CS Rajesh Sharma be authorized to electronically file Form DIR-12 with the Registrar of Companies, Delhi & Haryana, within 30 days.",
    authorizedSignatories: ["Dr. Vikram Malhotra"],
    status: "passed_unanimously",
    isCtcGenerated: true,
    ctcCertifiedBy: "CS Rajesh Sharma",
    ctcCertifiedAt: "2026-11-01",
  },
];

export const DEFAULT_CORPORATE_ENTITIES = [
  {
    id: "ent-1",
    entityId: "ent-1",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    rocJurisdiction: "RoC Delhi & Haryana",
    entityType: "pvt_ltd",
    incorporationDate: "2022-04-12",
    authorizedCapital: 5000000,
    paidUpCapital: 2500000,
    registeredAddress: "Plot 42, Okhla Industrial Area Phase-III, New Delhi, DL 110020",
    email: "compliance@cybercorp.tech",
    pan: "AAECS1234F",
    gstin: "07AAECS1234F1Z8",
    directors: [
      { din: "08912340", name: "Dr. Vikram Malhotra", designation: "Managing Director", appointmentDate: "2022-04-12", pan: "AAECS1234F", active: true },
      { din: "07849102", name: "CS Rajesh Sharma", designation: "Whole-Time Director & KMP", appointmentDate: "2022-04-12", pan: "ABCRS7890K", active: true },
      { din: "09124589", name: "Priya Sundaram", designation: "Director", appointmentDate: "2022-04-12", pan: "BDFPS5678G", active: true },
      { din: "09841235", name: "Dr. Ananya Sen", designation: "Additional Director (Independent)", appointmentDate: "2026-11-01", pan: "CGHPS9012M", active: true },
    ],
    financialYearEnd: "March 31",
    complianceHealthScore: 96,
    status: "active",
  },
  {
    id: "ent-2",
    entityId: "ent-2",
    companyName: "Apex FinTech Solutions Ltd",
    cin: "L65990MH2019PLC318902",
    rocJurisdiction: "RoC Mumbai",
    entityType: "public_ltd",
    incorporationDate: "2019-08-20",
    authorizedCapital: 100000000,
    paidUpCapital: 62500000,
    registeredAddress: "Level 14, Tower B, Peninsula Business Park, Lower Parel, Mumbai, MH 400013",
    email: "secretarial@apexfintech.in",
    pan: "AALCA4512H",
    gstin: "27AALCA4512H1Z5",
    directors: [
      { din: "01429810", name: "Rajeshwar Singhania", designation: "Executive Chairperson", appointmentDate: "2019-08-20", pan: "AALCA4512H", active: true },
      { din: "02849120", name: "Sunita Mehra", designation: "Whole-Time Director & CEO", appointmentDate: "2020-02-14", pan: "BNMPK6789L", active: true },
      { din: "05839210", name: "Anand K. Verma", designation: "Independent Director", appointmentDate: "2021-09-01", pan: "CDEMP1234N", active: true },
    ],
    financialYearEnd: "March 31",
    complianceHealthScore: 92,
    status: "active",
  },
  {
    id: "ent-3",
    entityId: "ent-3",
    companyName: "GreenEarth AgriVentures LLP",
    cin: "AAB-4921",
    rocJurisdiction: "RoC Bangalore",
    entityType: "llp",
    incorporationDate: "2023-01-15",
    authorizedCapital: 1500000,
    paidUpCapital: 1500000,
    registeredAddress: "4th Floor, Indiranagar 100ft Road, Bengaluru, KA 560038",
    email: "legal@greenearthllp.com",
    pan: "AABFG9012K",
    gstin: "29AABFG9012K1ZQ",
    directors: [
      { din: "07849102", name: "CS Rajesh Sharma", designation: "Designated Partner", appointmentDate: "2023-01-15", pan: "ABCRS7890K", active: true },
      { din: "08192039", name: "Arvind Rao", designation: "Designated Partner", appointmentDate: "2023-01-15", pan: "DKLPR3456T", active: true },
    ],
    financialYearEnd: "March 31",
    complianceHealthScore: 98,
    status: "active",
  },
];

export const DEFAULT_ROC_FILINGS = [
  {
    id: "roc-1",
    filingId: "roc-1",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    formName: "AOC-4",
    formDescription: "Filing of Financial Statements, Balance Sheet, P&L & Auditor Report with ROC",
    financialYear: "FY 2025-26",
    statutorySection: "Section 137, Companies Act 2013",
    dueDate: "2026-10-30",
    filingDate: "2026-10-25",
    status: "approved",
    srn: "F93821048",
    challanAmount: 600,
    lateFeeAmount: 0,
    paymentStatus: "paid",
    signatoryDin: "08912340",
    signatoryName: "Dr. Vikram Malhotra (MD)",
    pcsCertificateNumber: "CS Rajesh Sharma (FCS 8492, CP 10294)",
    attachmentCount: 4,
    notes: "Approved under STP mode by RoC Delhi.",
  },
  {
    id: "roc-2",
    filingId: "roc-2",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    formName: "MGT-7",
    formDescription: "Annual Return of Company Certified by Practising Company Secretary (PCS)",
    financialYear: "FY 2025-26",
    statutorySection: "Section 92(1) & Rule 11 of Management and Administration Rules",
    dueDate: "2026-11-29",
    filingDate: "",
    status: "dsc_affixed",
    srn: "",
    challanAmount: 600,
    lateFeeAmount: 0,
    paymentStatus: "unpaid",
    signatoryDin: "07849102",
    signatoryName: "CS Rajesh Sharma (Director & KMP)",
    pcsCertificateNumber: "CS Rajesh Sharma (FCS 8492, CP 10294)",
    attachmentCount: 3,
    notes: "DSC affixation completed. Ready for portal upload on MCA21 V3.",
  },
  {
    id: "roc-3",
    filingId: "roc-3",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    formName: "DIR-12",
    formDescription: "Appointment of Dr. Ananya Sen as Additional Director (Category: Independent)",
    financialYear: "FY 2026-27",
    statutorySection: "Section 161(1) and Section 170, Companies Act 2013",
    dueDate: "2026-12-01",
    filingDate: "2026-11-02",
    status: "uploaded_mca",
    srn: "G29481023",
    challanAmount: 300,
    lateFeeAmount: 0,
    paymentStatus: "paid",
    signatoryDin: "08912340",
    signatoryName: "Dr. Vikram Malhotra (MD)",
    pcsCertificateNumber: "CS Rajesh Sharma (CP 10294)",
    attachmentCount: 3,
    notes: "Filed with DIR-2 Consent letter and Form MBP-1 Disclosure.",
  },
  {
    id: "roc-4",
    filingId: "roc-4",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    formName: "PAS-3",
    formDescription: "Return of Allotment for 50,000 Series A CCPS under Section 42 Private Placement",
    financialYear: "FY 2026-27",
    statutorySection: "Section 39 & Section 42, Companies Act 2013",
    dueDate: "2026-12-15",
    filingDate: "",
    status: "drafted",
    srn: "",
    challanAmount: 1000,
    lateFeeAmount: 0,
    paymentStatus: "unpaid",
    signatoryDin: "09124589",
    signatoryName: "Priya Sundaram (Director)",
    pcsCertificateNumber: "CS Rajesh Sharma (CP 10294)",
    attachmentCount: 2,
    notes: "Drafted post EGM approval. Valuation certificate attached.",
  },
  {
    id: "roc-5",
    filingId: "roc-5",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    formName: "CHG-1",
    formDescription: "Creation of Charge in favour of HDFC Bank Limited (Working Capital Limit ₹2.5 Cr)",
    financialYear: "FY 2026-27",
    statutorySection: "Section 77(1), Companies Act 2013",
    dueDate: "2026-11-25",
    filingDate: "2026-11-01",
    status: "approved",
    srn: "C83920194",
    challanAmount: 600,
    lateFeeAmount: 0,
    paymentStatus: "paid",
    signatoryDin: "08912340",
    signatoryName: "Dr. Vikram Malhotra (MD)",
    pcsCertificateNumber: "CS Rajesh Sharma (CP 10294)",
    attachmentCount: 2,
    notes: "Certificate of Registration of Charge issued by RoC Delhi.",
  },
  {
    id: "roc-6",
    filingId: "roc-6",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    formName: "DPT-3",
    formDescription: "Return of Deposits and Particulars of Transactions Not Considered as Deposit",
    financialYear: "FY 2025-26",
    statutorySection: "Section 73 read with Rule 16 of Deposit Rules 2014",
    dueDate: "2026-06-30",
    filingDate: "2026-06-25",
    status: "approved",
    srn: "E19283746",
    challanAmount: 600,
    lateFeeAmount: 0,
    paymentStatus: "paid",
    signatoryDin: "07849102",
    signatoryName: "CS Rajesh Sharma (Director & KMP)",
    pcsCertificateNumber: "CS Rajesh Sharma (FCS 8492)",
    attachmentCount: 1,
    notes: "Auditor certificate on loans from directors and bank limits attached.",
  },
];

export const DEFAULT_STATUTORY_REGISTERS = [
  {
    id: "reg-1",
    registerEntryId: "reg-1",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    registerType: "members",
    statutoryForm: "MGT-1",
    folioOrRefNumber: "FOLIO-001",
    primaryHolderName: "Dr. Vikram Malhotra",
    identificationNumber: "PAN: AAECS1234F",
    entryDate: "2022-04-12",
    particulars: "Subscription to Memorandum: 125,000 Equity Shares of ₹10 each fully paid up",
    quantityOrAmount: 125000,
    distinctiveFrom: "000001",
    distinctiveTo: "125000",
    certificateNumber: "CERT-0001",
    status: "active",
    certifiedBy: "CS Rajesh Sharma, FCS 8492",
    certifiedAt: "2022-04-15",
  },
  {
    id: "reg-2",
    registerEntryId: "reg-2",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    registerType: "members",
    statutoryForm: "MGT-1",
    folioOrRefNumber: "FOLIO-002",
    primaryHolderName: "Priya Sundaram",
    identificationNumber: "PAN: BDFPS5678G",
    entryDate: "2022-04-12",
    particulars: "Subscription to Memorandum: 125,000 Equity Shares of ₹10 each fully paid up",
    quantityOrAmount: 125000,
    distinctiveFrom: "125001",
    distinctiveTo: "250000",
    certificateNumber: "CERT-0002",
    status: "active",
    certifiedBy: "CS Rajesh Sharma, FCS 8492",
    certifiedAt: "2022-04-15",
  },
  {
    id: "reg-3",
    registerEntryId: "reg-3",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    registerType: "directors",
    statutoryForm: "Sec 170",
    folioOrRefNumber: "DIR-01",
    primaryHolderName: "Dr. Vikram Malhotra",
    identificationNumber: "DIN: 08912340",
    entryDate: "2022-04-12",
    particulars: "Appointed as Managing Director. Holds 125,000 Equity Shares (50% voting capital).",
    quantityOrAmount: 125000,
    distinctiveFrom: "",
    distinctiveTo: "",
    certificateNumber: "",
    status: "active",
    certifiedBy: "CS Rajesh Sharma, FCS 8492",
    certifiedAt: "2022-04-15",
  },
  {
    id: "reg-4",
    registerEntryId: "reg-4",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    registerType: "directors",
    statutoryForm: "Sec 170",
    folioOrRefNumber: "DIR-02",
    primaryHolderName: "CS Rajesh Sharma",
    identificationNumber: "DIN: 07849102",
    entryDate: "2022-04-12",
    particulars: "Appointed as Whole-Time Director & Company Secretary (KMP under Sec 203).",
    quantityOrAmount: 0,
    distinctiveFrom: "",
    distinctiveTo: "",
    certificateNumber: "",
    status: "active",
    certifiedBy: "CS Rajesh Sharma, FCS 8492",
    certifiedAt: "2022-04-15",
  },
  {
    id: "reg-5",
    registerEntryId: "reg-5",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    registerType: "directors",
    statutoryForm: "Sec 170",
    folioOrRefNumber: "DIR-03",
    primaryHolderName: "Dr. Ananya Sen",
    identificationNumber: "DIN: 09841235",
    entryDate: "2026-11-01",
    particulars: "Appointed as Additional Director (Independent) pursuant to Section 161(1).",
    quantityOrAmount: 0,
    distinctiveFrom: "",
    distinctiveTo: "",
    certificateNumber: "",
    status: "active",
    certifiedBy: "CS Rajesh Sharma, FCS 8492",
    certifiedAt: "2026-11-01",
  },
  {
    id: "reg-6",
    registerEntryId: "reg-6",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    registerType: "charges",
    statutoryForm: "CHG-7",
    folioOrRefNumber: "CHG-2026-01",
    primaryHolderName: "HDFC Bank Limited",
    identificationNumber: "CHG-ID: 10098421",
    entryDate: "2026-11-01",
    particulars: "Hypothecation of entire current assets, book debts and plant & machinery for ₹2,50,00,000 facility.",
    quantityOrAmount: 25000000,
    distinctiveFrom: "",
    distinctiveTo: "",
    certificateNumber: "SRN: C83920194",
    status: "active",
    certifiedBy: "CS Rajesh Sharma, FCS 8492",
    certifiedAt: "2026-11-01",
  },
  {
    id: "reg-7",
    registerEntryId: "reg-7",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    registerType: "loans_investments",
    statutoryForm: "MBP-2",
    folioOrRefNumber: "LOAN-01",
    primaryHolderName: "FinEdge Analytics Technologies Pvt Ltd",
    identificationNumber: "CIN: U74999MH2023PTC412901",
    entryDate: "2026-03-20",
    particulars: "Inter-corporate deposit given under Section 186 at 9.5% interest per annum with prior board consent.",
    quantityOrAmount: 5000000,
    distinctiveFrom: "",
    distinctiveTo: "",
    certificateNumber: "RES-03/BM-02",
    status: "active",
    certifiedBy: "CS Rajesh Sharma, FCS 8492",
    certifiedAt: "2026-03-20",
  },
];

export const DEFAULT_CORPORATE_CONTRACTS = [];

export const DEFAULT_RETAINER_ADVOCATES = [
  {
    id: "adv-ret-1",
    advocateId: "adv-ret-1",
    fullName: "Adv. Arvind Swaminathan, Senior Counsel",
    barEnrollmentNumber: "D/1482/2004",
    primaryJurisdiction: "NCLT Principal Bench & NCLAT New Delhi",
    specialization: "Insolvency & Bankruptcy (IBC), Oppression & Mergers (Sec 230-232)",
    email: "arvind.swaminathan@delhibar.in",
    phone: "+91 98110 49201",
    retainerFee: 75000,
    appearanceRatePerHearing: 35000,
    activeBriefsCount: 2,
    status: "active_retainer",
  },
  {
    id: "adv-ret-2",
    advocateId: "adv-ret-2",
    fullName: "Adv. K. R. Meenakshi Sundaram",
    barEnrollmentNumber: "D/2901/2012",
    primaryJurisdiction: "Delhi High Court (Commercial Division)",
    specialization: "Commercial Arbitration, Section 9 Injunctions & Shareholder Disputes",
    email: "meenakshi.sundaram@chamberslaw.in",
    phone: "+91 99102 38491",
    retainerFee: 50000,
    appearanceRatePerHearing: 25000,
    activeBriefsCount: 1,
    status: "active_retainer",
  },
  {
    id: "adv-ret-3",
    advocateId: "adv-ret-3",
    fullName: "Adv. Prateek Singhania",
    barEnrollmentNumber: "MAH/4019/2015",
    primaryJurisdiction: "NCLT Mumbai Bench & Bombay High Court",
    specialization: "Compounding of ROC Offences, SFIO Inquiries & SEBI SAT Appeals",
    email: "p.singhania@mumbaicorporatelaw.com",
    phone: "+91 98201 98472",
    retainerFee: 60000,
    appearanceRatePerHearing: 30000,
    activeBriefsCount: 1,
    status: "empanelled",
  },
];

export const DEFAULT_CORPORATE_VAULT_ITEMS = [];

export const DEFAULT_SECRETARIAL_INVOICES = [
  {
    id: "inv-cs-1",
    invoiceId: "inv-cs-1",
    invoiceNumber: "INV-CS-2026-084",
    clientCompanyName: "CyberCorp Technologies Pvt Ltd",
    clientGstin: "07AAECS1234F1Z8",
    sacCode: "9982",
    billingType: "monthly_retainer",
    items: [
      { description: "Monthly Corporate Secretarial Retainership (SS-1/SS-2 Compliance & Advisory)", amount: 35000 },
      { description: "Board Meeting BM-04 Drafting, Minutes Circulation & CTC Extraction", amount: 15000 },
    ],
    subtotal: 50000,
    gstRate: 18,
    gstAmount: 9000,
    totalAmount: 59000,
    dueDate: "2026-11-15",
    status: "issued",
  },
  {
    id: "inv-cs-2",
    invoiceId: "inv-cs-2",
    invoiceNumber: "INV-CS-2026-079",
    clientCompanyName: "CyberCorp Technologies Pvt Ltd",
    clientGstin: "07AAECS1234F1Z8",
    sacCode: "9982",
    billingType: "annual_roc_package",
    items: [
      { description: "Statutory ROC Annual Filing Package: Form AOC-4 XBRL & Form MGT-7 Certification", amount: 45000 },
      { description: "Director KYC Filing (DIR-3 KYC Web) for 4 Directors", amount: 8000 },
    ],
    subtotal: 53000,
    gstRate: 18,
    gstAmount: 9540,
    totalAmount: 62540,
    dueDate: "2026-10-31",
    status: "paid",
  },
  {
    id: "inv-cs-3",
    invoiceId: "inv-cs-3",
    invoiceNumber: "INV-CS-2026-072",
    clientCompanyName: "Apex FinTech Solutions Ltd",
    clientGstin: "27AALCA4512H1Z5",
    sacCode: "9982",
    billingType: "event_filing",
    items: [
      { description: "Private Placement Advisory & Form PAS-3 / MGT-14 Documentation", amount: 65000 },
      { description: "Valuation Report Coordination & Stamp Duty Adjudication", amount: 25000 },
    ],
    subtotal: 90000,
    gstRate: 18,
    gstAmount: 16200,
    totalAmount: 106200,
    dueDate: "2026-11-20",
    status: "issued",
  },
];

export const DEFAULT_INCOME_TAX_RETURNS = [
  {
    id: "itr-1",
    itrId: "itr-1",
    clientName: "CyberCorp Technologies Pvt Ltd",
    pan: "AAECS1234F",
    assessmentYear: "AY 2026-27",
    financialYear: "FY 2025-26",
    itrForm: "ITR-6",
    grossTotalIncome: 28500000,
    deductionsChapterVIA: 1500000,
    taxableIncome: 27000000,
    taxPayable: 6795900,
    tdsTcsCredit: 4200000,
    advanceTaxPaid: 2600000,
    selfAssessmentTax: 0,
    refundDueOrPayable: 4100,
    aisReconciliationStatus: "matched",
    filingDueDate: "2026-10-31",
    filingDate: "2026-10-28",
    acknowledgementNumber: "684920194820194",
    status: "filed_verified",
    notes: "Filed per Section 139(1) with verified electronic DSC. Section 115BAA 22% base tax applied.",
  },
  {
    id: "itr-2",
    itrId: "itr-2",
    clientName: "Apex FinTech Solutions Ltd",
    pan: "AALCA4512H",
    assessmentYear: "AY 2026-27",
    financialYear: "FY 2025-26",
    itrForm: "ITR-6",
    grossTotalIncome: 142000000,
    deductionsChapterVIA: 4500000,
    taxableIncome: 137500000,
    taxPayable: 34608750,
    tdsTcsCredit: 22000000,
    advanceTaxPaid: 12650000,
    selfAssessmentTax: 0,
    refundDueOrPayable: 41250,
    aisReconciliationStatus: "matched",
    filingDueDate: "2026-10-31",
    filingDate: "2026-10-25",
    acknowledgementNumber: "910284719204812",
    status: "processed_143_1",
    notes: "Intimation under Section 143(1) received without any prima-facie adjustments.",
  },
  {
    id: "itr-3",
    itrId: "itr-3",
    clientName: "GreenEarth AgriVentures LLP",
    pan: "AABFG9012K",
    assessmentYear: "AY 2026-27",
    financialYear: "FY 2025-26",
    itrForm: "ITR-5",
    grossTotalIncome: 18400000,
    deductionsChapterVIA: 800000,
    taxableIncome: 17600000,
    taxPayable: 5491200,
    tdsTcsCredit: 3100000,
    advanceTaxPaid: 2400000,
    selfAssessmentTax: 0,
    refundDueOrPayable: 8800,
    aisReconciliationStatus: "matched",
    filingDueDate: "2026-10-31",
    filingDate: "2026-10-29",
    acknowledgementNumber: "492019482018471",
    status: "filed_verified",
    notes: "Partnership remuneration allowed under Section 40(b) verified per Partnership Deed.",
  },
  {
    id: "itr-4",
    itrId: "itr-4",
    clientName: "Dr. Vikram Malhotra (MD & Founder)",
    pan: "AAECS9988D",
    assessmentYear: "AY 2026-27",
    financialYear: "FY 2025-26",
    itrForm: "ITR-3",
    grossTotalIncome: 8400000,
    deductionsChapterVIA: 450000,
    taxableIncome: 7950000,
    taxPayable: 2324400,
    tdsTcsCredit: 2400000,
    advanceTaxPaid: 0,
    selfAssessmentTax: 0,
    refundDueOrPayable: 75600,
    aisReconciliationStatus: "matched",
    filingDueDate: "2026-07-31",
    filingDate: "2026-07-28",
    acknowledgementNumber: "104928194829104",
    status: "processed_143_1",
    notes: "Directorship salary and capital gains from mutual fund switches reconciled with 26AS/AIS.",
  },
];

export const DEFAULT_GST_RETURNS = [
  {
    id: "gst-1",
    gstReturnId: "gst-1",
    clientName: "CyberCorp Technologies Pvt Ltd",
    gstin: "07AAECS1234F1Z8",
    returnType: "GSTR-3B",
    returnPeriod: "October 2026",
    dueDate: "2026-11-20",
    filingDate: "2026-11-18",
    taxableTurnover: 12500000,
    igstAmount: 1125000,
    cgstAmount: 562500,
    sgstAmount: 562500,
    totalTaxLiability: 2250000,
    itcClaimed: 1680000,
    itcAvailable2B: 1680000,
    itcDifference: 0,
    arn: "AA0710260194820",
    status: "filed",
    notes: "100% ITC match with auto-drafted GSTR-2B. Cash ledger utilized for ₹570,000 balance.",
  },
  {
    id: "gst-2",
    gstReturnId: "gst-2",
    clientName: "CyberCorp Technologies Pvt Ltd",
    gstin: "07AAECS1234F1Z8",
    returnType: "GSTR-1",
    returnPeriod: "October 2026",
    dueDate: "2026-11-11",
    filingDate: "2026-11-10",
    taxableTurnover: 12500000,
    igstAmount: 1125000,
    cgstAmount: 562500,
    sgstAmount: 562500,
    totalTaxLiability: 2250000,
    itcClaimed: 0,
    itcAvailable2B: 0,
    itcDifference: 0,
    arn: "AA0710260049281",
    status: "filed",
    notes: "E-invoices auto-populated from IRP portal. B2B invoices reconciled.",
  },
  {
    id: "gst-3",
    gstReturnId: "gst-3",
    clientName: "Apex FinTech Solutions Ltd",
    gstin: "27AALCA4512H1Z5",
    returnType: "GSTR-3B",
    returnPeriod: "October 2026",
    dueDate: "2026-11-20",
    filingDate: "",
    taxableTurnover: 48000000,
    igstAmount: 4320000,
    cgstAmount: 2160000,
    sgstAmount: 2160000,
    totalTaxLiability: 8640000,
    itcClaimed: 6450000,
    itcAvailable2B: 6450000,
    itcDifference: 0,
    arn: "",
    status: "ready_to_file",
    notes: "Reconciliation complete. Awaiting partner OTP / DSC authorization.",
  },
  {
    id: "gst-4",
    gstReturnId: "gst-4",
    clientName: "CyberCorp Technologies Pvt Ltd",
    gstin: "07AAECS1234F1Z8",
    returnType: "GSTR-9",
    returnPeriod: "FY 2025-26",
    dueDate: "2026-12-31",
    filingDate: "2026-11-01",
    taxableTurnover: 145000000,
    igstAmount: 13050000,
    cgstAmount: 6525000,
    sgstAmount: 6525000,
    totalTaxLiability: 26100000,
    itcClaimed: 19800000,
    itcAvailable2B: 19800000,
    itcDifference: 0,
    arn: "AA0712250918234",
    status: "filed",
    notes: "Annual return filed. Reconciliation with audited financial statements signed.",
  },
];

export const DEFAULT_TAX_AUDIT_3CD = [
  {
    id: "aud-3cd-1",
    auditId: "aud-3cd-1",
    clientName: "CyberCorp Technologies Pvt Ltd",
    pan: "AAECS1234F",
    financialYear: "FY 2025-26",
    assessmentYear: "AY 2026-27",
    auditType: "tax_audit_44ab",
    turnover: 85000000,
    grossProfitRatio: 24.5,
    netProfitRatio: 11.2,
    disallowanceSec43B: 0,
    disallowanceSec40A3: 0,
    disallowanceSec40aia: 0,
    totalDisallowances: 0,
    udin: "26054921AAAAAA1029",
    caFirmName: "Singhania & Verma Associates, Chartered Accountants",
    caPartnerName: "CA Rajesh Singhania (FCA)",
    caMembershipNumber: "054921",
    caFirmRegistrationNumber: "014920N",
    auditOpinion: "unqualified_clean",
    status: "signed_uploaded",
    notes: "Clean report issued under Section 44AB. Form 3CA and 44-Clause Form 3CD electronically uploaded.",
  },
  {
    id: "aud-3cd-2",
    auditId: "aud-3cd-2",
    clientName: "Apex FinTech Solutions Ltd",
    pan: "AALCA4512H",
    financialYear: "FY 2025-26",
    assessmentYear: "AY 2026-27",
    auditType: "statutory_audit_143",
    turnover: 450000000,
    grossProfitRatio: 32.8,
    netProfitRatio: 15.4,
    disallowanceSec43B: 0,
    disallowanceSec40A3: 0,
    disallowanceSec40aia: 0,
    totalDisallowances: 0,
    udin: "26054921AAAAAB4920",
    caFirmName: "Singhania & Verma Associates, Chartered Accountants",
    caPartnerName: "CA Sneha Verma (FCA)",
    caMembershipNumber: "062194",
    caFirmRegistrationNumber: "014920N",
    auditOpinion: "unqualified_clean",
    status: "signed_uploaded",
    notes: "CARO 2020 21-clause compliance verified. Internal Financial Controls over Financial Reporting (IFCoFR) tested effective.",
  },
];

export const DEFAULT_BALANCE_SHEET_RECONS = [
  {
    id: "bs-1",
    reconId: "bs-1",
    clientName: "CyberCorp Technologies Pvt Ltd",
    financialYear: "FY 2025-26",
    accountingStandard: "Ind_AS",
    totalAssets: 45000000,
    totalLiabilities: 45000000,
    shareCapital: 2500000,
    reservesAndSurplus: 18500000,
    longTermBorrowings: 12000000,
    tradePayables: 6500000,
    tangibleFixedAssets: 22000000,
    cashAndBank: 8400000,
    bookDepreciationScheduleII: 2800000,
    taxDepreciationRule5: 3450000,
    depreciationDifference: 650000,
    deferredTaxAssetLiability: -163800,
    reconciliationNotes: "Depreciation timing differences reconciled under Ind AS 12. Book profit adjusted for MAT under Section 115JB.",
    status: "reconciled",
  },
  {
    id: "bs-2",
    reconId: "bs-2",
    clientName: "Apex FinTech Solutions Ltd",
    financialYear: "FY 2025-26",
    accountingStandard: "Ind_AS",
    totalAssets: 280000000,
    totalLiabilities: 280000000,
    shareCapital: 62500000,
    reservesAndSurplus: 125000000,
    longTermBorrowings: 50000000,
    tradePayables: 28000000,
    tangibleFixedAssets: 110000000,
    cashAndBank: 45000000,
    bookDepreciationScheduleII: 14200000,
    taxDepreciationRule5: 17800000,
    depreciationDifference: 3600000,
    deferredTaxAssetLiability: -906120,
    reconciliationNotes: "Full Schedule III financial reconciliation. Revenue recognized strictly per Ind AS 115 (Contracts with Customers).",
    status: "reconciled",
  },
];

export const DEFAULT_DSC_CERTIFICATES = [
  {
    id: "dsc-cs-1",
    certificateId: "DSC-CS-8921",
    userId: "cs_1",
    holderName: "CS Rajesh Sharma",
    holderRole: "practicing_cs",
    pan: "AAECS1234F",
    membershipNumber: "FCS-8921, CP-10293",
    tokenProvider: "e-Mudhra",
    hardwareModel: "WatchData ProxKey USB Token (FIPS 140-2 Level 2)",
    serialNumber: "7A 4B 91 02 C8 3F E1 2D",
    issuerCa: "e-Mudhra Sub-CA for Class 3 Individual 2014 (CCA India)",
    validFrom: "2024-05-10",
    validTo: "2027-05-09",
    keyAlgorithm: "RSA 2048-bit / SHA-256",
    keyUsage: ["Digital Signature", "Non-Repudiation"],
    tokenStatus: "plugged_in",
    totalSignaturesAffixed: 142,
    lastUsedAt: "2026-10-28T10:15:00Z",
  },
  {
    id: "dsc-ca-1",
    certificateId: "DSC-CA-054921",
    userId: "ca_1",
    holderName: "CA Ramanathan Iyer",
    holderRole: "practicing_ca",
    pan: "AAECS1234F",
    membershipNumber: "M.No 054921, FRN-018241N",
    tokenProvider: "Capricorn CA",
    hardwareModel: "ePass2003 Auto USB Token (FIPS 140-2 Level 2)",
    serialNumber: "8C 1F 3A 99 B0 44 2E 11",
    issuerCa: "Capricorn CA 2014 Class 3 Signing (CCA India)",
    validFrom: "2024-08-15",
    validTo: "2027-08-14",
    keyAlgorithm: "RSA 2048-bit / SHA-256",
    keyUsage: ["Digital Signature", "Non-Repudiation"],
    tokenStatus: "plugged_in",
    totalSignaturesAffixed: 218,
    lastUsedAt: "2026-10-30T14:30:00Z",
  },
  {
    id: "dsc-dir-1",
    certificateId: "DSC-DIR-08912340",
    userId: "cs_1",
    holderName: "Vikram Malhotra",
    holderRole: "company_director",
    pan: "ABCPM5678K",
    din: "08912340",
    tokenProvider: "VSign",
    hardwareModel: "mToken CryptoID USB Token",
    serialNumber: "3D 99 E4 71 88 1A 5B 00",
    issuerCa: "VSign CA Class 3 Individual 2014 (CCA India)",
    validFrom: "2025-01-10",
    validTo: "2028-01-09",
    keyAlgorithm: "RSA 2048-bit / SHA-256",
    keyUsage: ["Digital Signature", "Non-Repudiation"],
    tokenStatus: "plugged_in",
    totalSignaturesAffixed: 34,
    lastUsedAt: "2026-10-25T11:45:00Z",
  },
];

export const DEFAULT_STATUTORY_CHALLANS = [
  {
    id: "chl-mca-1",
    challanId: "CHL-MCA-001",
    userId: "cs_1",
    portal: "MCA21",
    challanType: "ROC_ANNUAL_FILING",
    entityName: "CyberCorp Technologies Pvt Ltd",
    cinOrPanOrGstin: "U72200DL2022PTC394812",
    financialYear: "2025-26",
    filingForm: "AOC-4",
    srnOrCpinOrCin: "SRN-F8910482",
    bsrCode: "0290142",
    challanSerialNumber: "00124",
    tenderedBank: "State Bank of India (SBI)",
    paymentMode: "INTERNET_BANKING",
    amountBreakdown: {
      baseFeeOrTax: 600,
      additionalOrLateFee: 0,
      interest: 0,
      penalty: 0,
      totalAmount: 600,
    },
    paymentStatus: "PAID",
    paidAt: "2026-10-14T11:30:00Z",
    receiptNumber: "RCPT-MCA-2026-0891",
    dscSignatory: "CS Rajesh Sharma (FCS-8921)",
    clientBilled: true,
  },
  {
    id: "chl-mca-2",
    challanId: "CHL-MCA-002",
    userId: "cs_1",
    portal: "MCA21",
    challanType: "ROC_ANNUAL_FILING",
    entityName: "CyberCorp Technologies Pvt Ltd",
    cinOrPanOrGstin: "U72200DL2022PTC394812",
    financialYear: "2025-26",
    filingForm: "MGT-7",
    srnOrCpinOrCin: "SRN-G1048921",
    bsrCode: "0290142",
    challanSerialNumber: "00125",
    tenderedBank: "HDFC Bank Corporate",
    paymentMode: "INTERNET_BANKING",
    amountBreakdown: {
      baseFeeOrTax: 600,
      additionalOrLateFee: 0,
      interest: 0,
      penalty: 0,
      totalAmount: 600,
    },
    paymentStatus: "GENERATED",
    dscSignatory: "CS Rajesh Sharma (FCS-8921)",
    clientBilled: false,
  },
  {
    id: "chl-mca-3",
    challanId: "CHL-MCA-003",
    userId: "cs_1",
    portal: "MCA21",
    challanType: "MGT_14_SPECIAL_RESOLUTION",
    entityName: "CyberCorp Technologies Pvt Ltd",
    cinOrPanOrGstin: "U72200DL2022PTC394812",
    financialYear: "2025-26",
    filingForm: "MGT-14",
    srnOrCpinOrCin: "SRN-H3920194",
    bsrCode: "0290142",
    challanSerialNumber: "00126",
    tenderedBank: "State Bank of India (SBI)",
    paymentMode: "INTERNET_BANKING",
    amountBreakdown: {
      baseFeeOrTax: 600,
      additionalOrLateFee: 0,
      interest: 0,
      penalty: 0,
      totalAmount: 600,
    },
    paymentStatus: "PAID",
    paidAt: "2026-10-20T16:00:00Z",
    receiptNumber: "RCPT-MCA-2026-1102",
    dscSignatory: "CS Rajesh Sharma (FCS-8921)",
    clientBilled: true,
  },
  {
    id: "chl-gst-1",
    challanId: "CHL-GST-001",
    userId: "ca_1",
    portal: "GSTN",
    challanType: "PMT_06_MONTHLY",
    entityName: "CyberCorp Technologies Pvt Ltd",
    cinOrPanOrGstin: "07AAECS1234F1Z8",
    financialYear: "2025-26",
    filingForm: "GSTR-3B",
    srnOrCpinOrCin: "26100700192841",
    bsrCode: "0290142",
    challanSerialNumber: "04912",
    tenderedBank: "State Bank of India (SBI)",
    paymentMode: "INTERNET_BANKING",
    amountBreakdown: {
      baseFeeOrTax: 485000,
      additionalOrLateFee: 0,
      interest: 0,
      penalty: 0,
      totalAmount: 485000,
    },
    paymentStatus: "PAID",
    paidAt: "2026-10-18T14:15:00Z",
    receiptNumber: "RCPT-GST-2026-5912",
    dscSignatory: "CA Ramanathan Iyer (M.No 054921)",
    clientBilled: true,
  },
  {
    id: "chl-gst-2",
    challanId: "CHL-GST-002",
    userId: "ca_1",
    portal: "GSTN",
    challanType: "DRC_03_VOLUNTARY",
    entityName: "CyberCorp Technologies Pvt Ltd",
    cinOrPanOrGstin: "07AAECS1234F1Z8",
    financialYear: "2024-25",
    filingForm: "DRC-03",
    srnOrCpinOrCin: "26100800418290",
    bsrCode: "0290142",
    challanSerialNumber: "05118",
    tenderedBank: "ICICI Bank Corporate",
    paymentMode: "NEFT_RTGS",
    amountBreakdown: {
      baseFeeOrTax: 120000,
      additionalOrLateFee: 0,
      interest: 18000,
      penalty: 0,
      totalAmount: 138000,
    },
    paymentStatus: "GENERATED",
    dscSignatory: "CA Ramanathan Iyer (M.No 054921)",
    clientBilled: false,
  },
  {
    id: "chl-it-1",
    challanId: "CHL-IT-001",
    userId: "ca_1",
    portal: "CBDT_INCOME_TAX",
    challanType: "ITNS_280_ADVANCE_TAX",
    entityName: "CyberCorp Technologies Pvt Ltd",
    cinOrPanOrGstin: "AAECS1234F",
    financialYear: "2025-26",
    assessmentYear: "2026-27",
    filingForm: "ITR-6",
    srnOrCpinOrCin: "02901422610202600124",
    bsrCode: "0290142",
    challanSerialNumber: "00124",
    tenderedBank: "State Bank of India (SBI)",
    paymentMode: "INTERNET_BANKING",
    amountBreakdown: {
      baseFeeOrTax: 1250000,
      additionalOrLateFee: 0,
      interest: 0,
      penalty: 0,
      totalAmount: 1250000,
    },
    paymentStatus: "PAID",
    paidAt: "2026-10-15T10:00:00Z",
    receiptNumber: "RCPT-IT-2026-9041",
    dscSignatory: "CA Ramanathan Iyer (M.No 054921)",
    clientBilled: true,
  },
  {
    id: "chl-it-2",
    challanId: "CHL-IT-002",
    userId: "ca_1",
    portal: "CBDT_INCOME_TAX",
    challanType: "ITNS_281_TDS",
    entityName: "CyberCorp Technologies Pvt Ltd",
    cinOrPanOrGstin: "AAECS1234F",
    financialYear: "2025-26",
    assessmentYear: "2026-27",
    filingForm: "Form 26Q",
    srnOrCpinOrCin: "02901422610202600318",
    bsrCode: "0290142",
    challanSerialNumber: "00318",
    tenderedBank: "State Bank of India (SBI)",
    paymentMode: "INTERNET_BANKING",
    amountBreakdown: {
      baseFeeOrTax: 345000,
      additionalOrLateFee: 0,
      interest: 0,
      penalty: 0,
      totalAmount: 345000,
    },
    paymentStatus: "PAID",
    paidAt: "2026-10-07T12:00:00Z",
    receiptNumber: "RCPT-IT-2026-9042",
    dscSignatory: "CA Ramanathan Iyer (M.No 054921)",
    clientBilled: true,
  },
];

// ============================================================================
// DEFAULT SEED DUMMY DATA FOR EXECUTIVE BOARD & AUDIT COMMITTEE DOSSIERS
// ============================================================================
export const DEFAULT_BOARD_DOSSIERS = [
  {
    id: "dos-cybercorp-q3-2026",
    dossierId: "WAK-EXD-2026-CC-8941",
    userId: "cs_1",
    clientEntity: {
      entityId: "ent-cybercorp",
      name: "CyberCorp Technologies Pvt Ltd",
      cin: "U72200DL2022PTC394812",
      pan: "AAECS1234F",
      gstin: "07AAECS1234F1Z8",
      registeredAddress: "Level 14, Cyber Towers, Barakhamba Road, Connaught Place, New Delhi 110001",
      entityType: "pvt_ltd",
      incorporationDate: "2022-04-12",
      authorizedCapital: 50000000,
      paidUpCapital: 25000000,
    },
    financialYear: "2025-26",
    assessmentYear: "2026-27",
    boardMeetingDate: "2026-11-15",
    meetingType: "Quarterly Board of Directors & Audit Committee Review (Q3)",
    governanceStandard: "Section 177 & 134(5) of Companies Act 2013 read with ICSI SS-1 & SS-2",
    directorsList: [
      {
        din: "08912340",
        name: "Dr. Vikram Malhotra",
        designation: "Managing Director",
        appointmentDate: "2022-04-12",
        kycStatus: "DIR-3 Web KYC Verified",
        sec164Clearance: true,
        shareholdingPercentage: 54.5,
      },
      {
        din: "09104928",
        name: "Ms. Ananya Sengupta",
        designation: "Whole-Time Director & COO",
        appointmentDate: "2022-04-12",
        kycStatus: "DIR-3 Web KYC Verified",
        sec164Clearance: true,
        shareholdingPercentage: 25.5,
      },
      {
        din: "07419201",
        name: "Mr. Rohan Murthy",
        designation: "Non-Executive Independent Director",
        appointmentDate: "2023-01-15",
        kycStatus: "DIR-3 Web KYC Verified",
        sec164Clearance: true,
        shareholdingPercentage: 0,
      },
      {
        din: "08192834",
        name: "Adv. Meera Nair",
        designation: "Independent Director & Audit Committee Chair",
        appointmentDate: "2023-05-10",
        kycStatus: "DIR-3 Web KYC Verified",
        sec164Clearance: true,
        shareholdingPercentage: 0,
      },
    ],
    csGovernanceData: {
      aoc4Status: "Approved & Reconciled",
      aoc4Srn: "AA8910245",
      mgt7Status: "Annual Return Filed",
      mgt7Srn: "M8819201",
      boardMeetingsConducted: 4,
      ss1ComplianceScore: 99.2,
      secretarialAuditOpinion: "Unqualified / Clean Opinion under Form MR-3",
      registeredChargesStatus: "Zero Default / Satisfaction CHG-4 Issued",
      activeLitigationsCount: 0,
    },
    caAuditData: {
      itrStatus: "ITR-6 Filed & Verified",
      itrAckNumber: "9812401823",
      gstr9Status: "Annual Return Reconciled (100% Match)",
      form3CdTurnover: 48500000,
      gstAnnualTurnover: 48500000,
      mcaFinancialTurnover: 48500000,
      turnoverVariance: 0,
      udin: "26401928AAAA129481",
      clause43bDisallowance: 0,
      indAs12DeferredTax: "Reconciled (Net DTA ₹37,755)",
      ifcControlRating: "Operating Effectively (Zero Material Weakness)",
    },
    auditCommitteeRisks: [
      {
        category: "Internal Financial Controls (IFC)",
        riskLevel: "Low",
        parameter: "Section 134(5)(e) Financial Reporting Framework",
        statutorySection: "Companies Act Section 134(5)(e)",
        observation: "Controls over revenue recognition and bank authorizations tested with 0 audit exceptions.",
        mitigationStatus: "Operating Effectively with automated ERP maker-checker controls.",
      },
      {
        category: "Loans & Investments",
        riskLevel: "Low",
        parameter: "Section 186 Statutory Ceiling (60% Paid-up + Reserves)",
        statutorySection: "Companies Act Section 186",
        observation: "Aggregate loans & investments stand at ₹1.10 Cr vs statutory limit of ₹3.60 Cr (30.5% utilized).",
        mitigationStatus: "Well within Board delegation threshold; no Special Resolution required.",
      },
      {
        category: "Director Advances & Guarantees",
        riskLevel: "Low",
        parameter: "Section 185 Prohibition on Loans to Directors",
        statutorySection: "Companies Act Section 185",
        observation: "Zero personal loans or guarantees provided to any director or interested entities.",
        mitigationStatus: "100% compliant with Section 185 statutory bar.",
      },
      {
        category: "MSME Vendor Dues",
        riskLevel: "Low",
        parameter: "Clause 43B(h) / Section 15 of MSMED Act",
        statutorySection: "Income Tax Act Sec 43B(h) & MSMED Act",
        observation: "All 18 registered MSME supplier invoices settled within 45 days. Disallowance ₹0 Nil.",
        mitigationStatus: "Audited ledger confirms zero overdue MSME balances at year-end.",
      },
      {
        category: "GST ITC Integrity",
        riskLevel: "Low",
        parameter: "Rule 36(4) / GSTR-2B vs GSTR-3B Input Tax Credit",
        statutorySection: "CGST Rules Rule 36(4)",
        observation: "100% input tax credit claimed matches invoice-level GSTR-2B inward supplies.",
        mitigationStatus: "Zero DRC-01 SCN notice risk; all tax liabilities settled via electronic cash ledger.",
      },
    ],
    boardResolutionsExtracts: [
      {
        agendaNo: "Item #01",
        title: "Adoption and Approval of Audited Annual Financial Statements for FY 2025-26",
        statutorySection: "Section 134 & Section 177",
        votingResult: "Passed Unanimously (4 in favor, 0 against)",
        signatoryDin: "08912340",
      },
      {
        agendaNo: "Item #02",
        title: "Consideration of Statutory Auditor's Report & Form 3CD Tax Audit Observations",
        statutorySection: "Section 143 & Section 44AB",
        votingResult: "Passed Unanimously (4 in favor, 0 against)",
        signatoryDin: "08192834",
      },
      {
        agendaNo: "Item #03",
        title: "Review and Adoption of Secretarial Audit Report under Form MR-3",
        statutorySection: "Section 204 & Secretarial Standards",
        votingResult: "Passed Unanimously (4 in favor, 0 against)",
        signatoryDin: "07419201",
      },
      {
        agendaNo: "Item #04",
        title: "Authorization for Strategic Technology Infrastructure Capex under Section 179(3)",
        statutorySection: "Section 179(3)(c)",
        votingResult: "Passed Unanimously (4 in favor, 0 against)",
        signatoryDin: "09104928",
      },
    ],
    dualAttestationSignOff: {
      csSignatory: {
        name: "CS Rajesh Sharma",
        membershipNo: "FCS-9182",
        cpNo: "10482",
        firm: "Apex Law & Secretarial Partners LLP",
        signatureHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        signedAt: "2026-11-15T11:30:00Z",
      },
      caSignatory: {
        name: "CA Ramanathan Iyer",
        membershipNo: "401928",
        firmRegNo: "018241N",
        firm: "Iyer & Co. Chartered Accountants",
        udin: "26401928AAAA129481",
        signatureHash: "4a59281a6e9742719a868f05151b72e0d37e6f80998a1f81d113ae87401c4501",
        signedAt: "2026-11-15T11:45:00Z",
      },
      jointDeclaration:
        "We, the practicing Company Secretary and the Statutory Auditor of CyberCorp Technologies Pvt Ltd, hereby jointly certify that we have examined the corporate secretarial registers, filings on the MCA21 portal, audited financial statements, Income Tax returns, and GST disclosures for the financial year 2025-26. We confirm that the reported revenues, statutory dues, and regulatory disclosures are reconciled with ZERO variance across MCA, CBDT, and GSTN frameworks.",
      qrVerificationUrl: "https://wakheel.legal/verify/dossier/WAK-EXD-2026-CC-8941",
      status: "Signed & Sealed",
    },
    dossierDigestSha256: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    version: "3.4.1-FINAL",
    createdAt: "2026-11-03T10:00:00Z",
  },
];

export { DEFAULT_DUE_DILIGENCE_AUDITS, DEFAULT_STATUTORY_NOTICES, DEFAULT_MDP_FIRM_GOVERNANCE };





