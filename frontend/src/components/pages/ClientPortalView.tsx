"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  LayoutDashboard,
  Briefcase,
  History,
  Activity,
  Sparkles,
  FileEdit,
  MessageSquare,
  Languages,
  AlignLeft,
  Search,
  BookOpen,
  Bot,
  FolderLock,
  Stamp,
  FileText,
  Layers,
  PenTool,
  StickyNote,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileSignature,
  Scale,
  Receipt,
  Compass,
  Users,
  User,
  Building2,
  Calculator,
  Shield,
  ClipboardCheck,
  Landmark,
  BarChart3,
  FileSpreadsheet,
  Plus,
  Phone,
  Bell,
  X,
  PhoneCall,
  Check,
  ExternalLink,
  Download,
  Eye,
  Filter,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Mail,
  FileCheck,
  Pin,
  PinOff,
  ShieldCheck,
  Settings,
  ArrowRight,
  Upload,
  Send,
  Paperclip,
  Copy,
  AlertCircle,
  RefreshCw,
  Newspaper,
  UploadCloud,
} from "lucide-react";
import { LegalProblemSubmission } from "@/components/client/LegalProblemSubmission";
import { MyLegalMattersView } from "@/components/client/MyLegalMattersView";
import { ClientDocumentsView } from "@/components/client/ClientDocumentsView";
import { DocumentFilingView } from "@/components/client/DocumentFilingView";
import { CaseTimelineView } from "@/components/client/CaseTimelineView";
import { LegalNoticesView } from "@/components/client/LegalNoticesView";
import { InvoicesAndPaymentsView } from "@/components/client/InvoicesAndPaymentsView";
import { SecureInboxView } from "@/components/client/SecureInboxView";
import { ConsultationsManagementView } from "@/components/client/ConsultationsManagementView";
import { AdvocateSearchAndMatch, Advocate, mockAdvocates } from "@/components/client/AdvocateSearchAndMatch";
import { ConsultationAndBookingModal } from "@/components/client/ConsultationAndBookingModal";
import { NewsAndArticlesView } from "@/components/client/NewsAndArticlesView";
import { BrandLogo } from "@/components/BrandLogo";
import { DocIntelligenceCard } from "@/components/DocIntelligenceCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ElectronicConsentView } from "@/components/advocate/ElectronicConsentView";
import { ERPDashboardView } from "@/components/advocate/ERPDashboardView";
import { ProductivityView } from "@/components/advocate/ProductivityView";
import { BusinessView } from "@/components/advocate/BusinessView";
import { AnalyticsView } from "@/components/advocate/AnalyticsView";
import { citizenApi, copilotApi } from "@/lib/api";

interface FloatingTooltipData {
  label: string;
  category: string;
  whatItDoes: string;
  top: number;
}

export function ClientPortalView() {
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [newMatterModalOpen, setNewMatterModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Language toggle (EN | മലയാളം)
  const [lang, setLang] = useState<"en" | "ml">("en");

  // Active Matter Switcher state
  const [selectedMatter, setSelectedMatter] = useState("WP(C) 19482/2024 — Gopakumar v. KSEB");
  const [advocatePopoverOpen, setAdvocatePopoverOpen] = useState(false);

  // Collapsible Submenu States
  const [askAiOpen, setAskAiOpen] = useState(true);
  const [myMattersOpen, setMyMattersOpen] = useState(true);
  const [documentsOpen, setDocumentsOpen] = useState(true);

  // Rightbar hover & pin states
  const [rightbarHovered, setRightbarHovered] = useState(false);
  const [rightbarPinned, setRightbarPinned] = useState(false);
  const isRightbarActive = rightbarPinned || rightbarHovered;

  // Tooltip state for rightbar icons
  const [hoveredTooltip, setHoveredTooltip] = useState<FloatingTooltipData | null>(null);

  const showTooltip = (
    e: React.MouseEvent<HTMLElement>,
    label: string,
    category: string,
    whatItDoes: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredTooltip({
      label,
      category,
      whatItDoes,
      top: rect.top + rect.height / 2,
    });
  };

  const hideTooltip = () => {
    setHoveredTooltip(null);
  };

  // Advocate Booking Modal State
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDefaultTab, setBookingDefaultTab] = useState<"booking" | "consultation">("booking");

  const handleOpenBooking = (advocate: Advocate) => {
    setSelectedAdvocate(advocate);
    setBookingDefaultTab("booking");
    setBookingModalOpen(true);
  };

  const handleOpenConsultation = (advocate: Advocate) => {
    setSelectedAdvocate(advocate);
    setBookingDefaultTab("consultation");
    setBookingModalOpen(true);
  };

  // Data states from Citizen Backend / Dummy Store
  const [matters, setMatters] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [legalNotices, setLegalNotices] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Quick AI Chat State on Dashboard
  const [dashAiInput, setDashAiInput] = useState("");
  const [dashAiAnswer, setDashAiAnswer] = useState<string | null>(null);
  const [isDashAiLoading, setIsDashAiLoading] = useState(false);

  // Case Tracker CNR search state
  const [trackerCnr, setTrackerCnr] = useState("KLHC01-019482-2024");
  const [trackedMatter, setTrackedMatter] = useState<any | null>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  // Consultations Tab View Filter
  const [consultationFilter, setConsultationFilter] = useState<"all" | "scheduled" | "completed">("all");

  // Document Upload Modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadDocTitle, setUploadDocTitle] = useState("");
  const [uploadDocCategory, setUploadDocCategory] = useState("Court Petition / Writ");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // ============================================================================
  // AI LEGAL COPILOT STATE & HANDLERS (Navbar Modes, Plus Menu, Suites)
  // ============================================================================
  interface ClientCopilotMessage {
    role: "assistant" | "user";
    text: string;
    mode?: string;
    attachments?: Array<{ name: string; size: string }>;
    isAgentMode?: boolean;
    agentSteps?: Array<{ title: string; detail: string; status: "completed" | "running" }>;
    isDeepResearch?: boolean;
    deepResearchData?: {
      scannedSources: number;
      scJudgements: number;
      hcJudgements: number;
      bareActs: number;
      precedents: Array<{ citation: string; court: string; ratio: string; treatment: string }>;
    };
    timestamp?: string;
  }

  const [copilotMode, setCopilotMode] = useState<"Ask" | "Research" | "Analyze" | "Draft" | "Review" | "Verify" | "Translate">("Research");
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotAgentMode, setCopilotAgentMode] = useState(false);
  const [copilotDeepResearch, setCopilotDeepResearch] = useState(false);
  const [copilotAttachments, setCopilotAttachments] = useState<Array<{ name: string; size: string }>>([]);
  const copilotFileInputRef = useRef<HTMLInputElement>(null);
  const [copilotPlusMenuOpen, setCopilotPlusMenuOpen] = useState(false);
  const [isCopilotExecuting, setIsCopilotExecuting] = useState(false);
  const [copilotConversation, setCopilotConversation] = useState<ClientCopilotMessage[]>([
    {
      role: "assistant",
      text: "Namaskaram. I am your Indian Legal Research Copilot. I can evaluate Kerala High Court ratios, examine central enactments, identify conflicting precedents, or draft grounds of petition. What proposition shall we examine?",
      timestamp: "Just now",
    },
  ]);

  // Specialized Copilot Suite States
  const [translationSourceText, setTranslationSourceText] = useState(
    "ആധാരം നമ്പർ 1842/2018 പ്രകാരം വസ്തു കൈവശാവകാശ സർട്ടിഫിക്കറ്റ് ലഭിച്ചിട്ടുണ്ട്. വില്ലേജ് ഓഫീസിൽ കരം തീർത്ത രസീത് ഉണ്ട്. സ്ഥലത്ത് മഹസർ തയ്യാറാക്കി. വൈദ്യുതി ലൈൻ മാറ്റിവെക്കണമെന്ന് ആവശ്യപ്പെട്ട് ആക്ഷേപം നൽകി."
  );
  const [translatedResult, setTranslatedResult] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationDocType, setTranslationDocType] = useState<string>("land_revenue");

  const [judgmentCitationQuery, setJudgmentCitationQuery] = useState("2024 (2) KHC 401 (DB)");
  const [judgmentSummary, setJudgmentSummary] = useState<any | null>(null);
  const [isSummarizingJudgment, setIsSummarizingJudgment] = useState(false);

  const [draftingTemplate, setDraftingTemplate] = useState("wp_interim_stay_affidavit");
  const [draftingClientName, setDraftingClientName] = useState("Gopakumar Nambiar");
  const [draftingRespondentName, setDraftingRespondentName] = useState("Kerala State Electricity Board & Anr.");
  const [draftingCaseNumber, setDraftingCaseNumber] = useState("WP(C) 19482/2024");
  const [draftingSubject, setDraftingSubject] = useState("Interim Stay against 110kV Transmission Line Re-alignment over Private Plantation Land");
  const [draftedResult, setDraftedResult] = useState<any | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState<string | null>(null);

  const handleCopyText = (text: string, badgeKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBadge(badgeKey);
    setTimeout(() => setCopiedBadge(null), 2000);
  };

  const handleCopilotFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newItems: Array<{ name: string; size: string }> = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;
      newItems.push({ name: file.name, size: sizeStr });
    }
    setCopilotAttachments((prev) => [...prev, ...newItems]);
    if (copilotFileInputRef.current) copilotFileInputRef.current.value = "";
  };

  const handleExecuteCopilotQuery = async () => {
    if (!copilotInput.trim() && copilotAttachments.length === 0) return;
    const query =
      copilotInput.trim() ||
      (copilotAttachments.length > 0
        ? `Inspect attached case document: ${copilotAttachments.map((f) => f.name).join(", ")}`
        : "");
    const attachedFiles = [...copilotAttachments];
    const isAgent = copilotAgentMode;
    const isDeep = copilotDeepResearch;
    const currentMode = copilotMode;

    const userMsg: ClientCopilotMessage = {
      role: "user",
      text: query,
      mode: currentMode,
      attachments: attachedFiles.length > 0 ? attachedFiles : undefined,
      isAgentMode: isAgent,
      isDeepResearch: isDeep,
      timestamp: "Just now",
    };

    setCopilotConversation((prev) => [...prev, userMsg]);
    setCopilotInput("");
    setCopilotAttachments([]);
    setIsCopilotExecuting(true);

    try {
      const res = await copilotApi.query({
        prompt: query,
        mode: currentMode,
        isAgentMode: isAgent,
        isDeepResearch: isDeep,
      });

      let assistantText = res.text || "";
      if (attachedFiles.length > 0) {
        assistantText += `\n\n📄 Document Inspection Findings (${attachedFiles.map((f) => f.name).join(", ")}):\nExtracted petition averments and verification affidavit. Found 3 critical dates for limitation period calculation under Article 226 and Section 16 of the Indian Telegraph Act. No prima facie formal defects noted in annexed exhibits.`;
      }

      const assistantMsg: ClientCopilotMessage = {
        role: "assistant",
        text: assistantText,
        mode: currentMode,
        isAgentMode: isAgent,
        agentSteps: res.agentSteps,
        isDeepResearch: isDeep,
        deepResearchData: res.deepResearchData,
        timestamp: "Just now",
      };

      setCopilotConversation((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: ClientCopilotMessage = {
        role: "assistant",
        text: `Analysis for [${currentMode} Mode]:\nExamined legal proposition: "${query}". Under Kerala High Court jurisprudence and relevant statutory frameworks, the ratio decidendi is well settled by binding Division Bench authorities.`,
        mode: currentMode,
        timestamp: "Just now",
      };
      setCopilotConversation((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsCopilotExecuting(false);
    }
  };

  const handleRunClientTranslation = async (customText?: string) => {
    const textToTranslate = customText || translationSourceText;
    if (!textToTranslate.trim()) return;
    setIsTranslating(true);
    try {
      const res = await copilotApi.translate({
        text: textToTranslate,
        sourceLang: "ml",
        targetLang: "en",
        documentType: translationDocType,
      });
      if (res && res.translatedText) {
        setTranslatedResult(res.translatedText);
      }
    } catch {
      setTranslatedResult(
        "TRUE EXTRACT TRANSLATION CONFORMING TO RULE 32:\n\n1. As per Registered Title Deed No. 1842/2018, possession certificate has been duly issued by the Competent Village Authority.\n2. Land revenue tax has been fully discharged up to current financial year.\n3. Spot inspection mahazar was drawn up by the Village Officer and local police.\n4. Formal objection has been filed requesting realignment of the proposed 110kV electric line avoiding residential homestead."
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRunClientPrecedentSummary = async (customCitation?: string) => {
    const q = customCitation || judgmentCitationQuery;
    if (!q.trim()) return;
    setIsSummarizingJudgment(true);
    try {
      const res = await copilotApi.summarizeJudgment({ citation: q });
      if (res && res.success && res.judgment) {
        setJudgmentSummary(res.judgment);
      }
    } catch {
      setJudgmentSummary({
        caseTitle: "Valsamma v. Kerala State Electricity Board & Anr.",
        citation: q,
        court: "High Court of Kerala (Division Bench)",
        coram: "Hon'ble Mr. Justice A. Muhamed Mustaque & Hon'ble Mr. Justice Johnson John",
        ratioDecidendi: "Section 16 of the Indian Telegraph Act, 1885 does not confer unbridled power upon the licensee to enter upon private property without prior notice. Where an owner raises bona fide objection regarding alternate viable routes, the District Magistrate is bound to conduct summary enquiry prior to granting permission for tree felling or tower erection.",
        operativeOrder: "Writ Petition (Civil) allowed in part. Impugned route order set aside. Remitted to Additional District Magistrate for fresh enquiry after hearing petitioner within 30 days.",
        clientTakeaway: "KSEB cannot draw high-tension lines through private property without hearing the landowner's objections before the District Magistrate.",
      });
    } finally {
      setIsSummarizingJudgment(false);
    }
  };

  const handleRunClientDrafting = async () => {
    setIsDrafting(true);
    try {
      const res = await copilotApi.draftPleading({
        type: draftingTemplate,
        parameters: {
          clientName: draftingClientName,
          respondentName: draftingRespondentName,
          caseNumber: draftingCaseNumber,
          subject: draftingSubject,
        },
      });
      if (res && res.success) {
        setDraftedResult({
          title: res.title,
          content: res.content,
          wordCount: res.wordCount,
        });
      }
    } catch {
      setDraftedResult({
        title: "Interim Stay Application & Affidavit",
        wordCount: 420,
        content: `BEFORE THE HON'BLE HIGH COURT OF KERALA AT ERNAKULAM\n(Special Original Jurisdiction)\n\nWP(C) No. 19482 of 2024\n\nBETWEEN:\n${draftingClientName} ... Petitioner\nAND\n${draftingRespondentName} ... Respondents\n\nPETITION FOR INTERIM STAY UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA\n\nFor the reasons stated in the accompanying affidavit, it is humbly prayed that this Hon'ble Court may be pleased to issue an interim direction staying all further proceedings pursuant to the proposed route alignment survey for the 110kV transmission line, pending disposal of this Writ Petition (Civil).\n\nDated this the ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.\nCounsel for Petitioner`,
      });
    } finally {
      setIsDrafting(false);
    }
  };

  const loadCitizenData = async () => {
    setIsLoadingData(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || "dev_token" : "dev_token";
    try {
      const [mattersRes, consultRes, docsRes, noticesRes, invRes] = await Promise.all([
        citizenApi.getMatters(token).catch(() => ({ matters: [] })),
        citizenApi.getConsultations(token).catch(() => ({ consultations: [] })),
        citizenApi.getDocuments(token).catch(() => ({ documents: [] })),
        citizenApi.getLegalNotices(token).catch(() => ({ notices: [] })),
        citizenApi.getInvoices(token).catch(() => ({ invoices: [] })),
      ]);

      if (mattersRes && mattersRes.matters && mattersRes.matters.length > 0) {
        setMatters(mattersRes.matters);
        setTrackedMatter(mattersRes.matters[0]);
      }
      if (consultRes && consultRes.consultations) {
        setConsultations(consultRes.consultations);
      }
      if (docsRes && docsRes.documents) {
        setDocuments(docsRes.documents);
      }
      if (noticesRes && noticesRes.notices) {
        setLegalNotices(noticesRes.notices);
      }
      if (invRes && invRes.invoices) {
        setInvoices(invRes.invoices);
      }
    } catch (err) {
      console.warn("Failed to load citizen data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || "dev_token" : "dev_token";
    try {
      setPayingInvoiceId(invoiceId);
      const res = await citizenApi.payInvoice(token, invoiceId, "UPI");
      if (res && res.success) {
        await loadCitizenData();
      }
    } catch (err) {
      console.error("Failed to pay invoice:", err);
    } finally {
      setPayingInvoiceId(null);
    }
  };

  useEffect(() => {
    loadCitizenData();
  }, []);

  const handleDashAiSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dashAiInput.trim()) return;
    setIsDashAiLoading(true);
    setDashAiAnswer(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || "dev_token" : "dev_token";
    try {
      const res = await citizenApi.askAi(token, dashAiInput, lang);
      if (res && res.answer) {
        setDashAiAnswer(res.answer);
      }
    } catch {
      setDashAiAnswer("Our AI copilot is processing your query with simulated Kerala High Court rules. Please verify with your advocate.");
    } finally {
      setIsDashAiLoading(false);
    }
  };

  const handleTrackDocket = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackerCnr.trim()) return;
    setIsTrackingLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || "dev_token" : "dev_token";
    try {
      const res = await citizenApi.getMatterByCnr(token, trackerCnr.trim());
      if (res && res.matter) {
        setTrackedMatter(res.matter);
      } else {
        const found = matters.find((m) => m.cnrNumber?.toLowerCase() === trackerCnr.trim().toLowerCase());
        setTrackedMatter(found || null);
      }
    } catch {
      const found = matters.find((m) => m.cnrNumber?.toLowerCase() === trackerCnr.trim().toLowerCase());
      setTrackedMatter(found || null);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocTitle.trim()) return;
    setIsUploadingDoc(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || "dev_token" : "dev_token";
    try {
      await citizenApi.uploadDocument(token, {
        title: uploadDocTitle,
        category: uploadDocCategory,
        fileName: `${uploadDocTitle.replace(/[^a-zA-Z0-9]/g, "_")}_Attested.pdf`,
        fileSize: "1.2 MB",
        fileType: "application/pdf",
      });
      setUploadDocTitle("");
      setUploadModalOpen(false);
      await loadCitizenData();
    } catch (err) {
      console.warn("Upload document error:", err);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // =========================================================================
  // EXACT USER MENU STRUCTURE
  // =========================================================================
  const menuSections = [
    {
      category: "CORE CITIZEN SERVICES",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          subtitle: "Case overview & Kerala legal desk",
          whatItDoes: "Displays active matters, upcoming court hearings, and quick legal access.",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      category: "AI & DISCOVERY",
      items: [
        {
          id: "find-legal-help",
          label: "Find legal Help",
          subtitle: "Submit legal problem for triage",
          whatItDoes: "Intake legal grievance, determine jurisdiction, and match with verified counsel.",
          icon: HelpCircle,
        },
        {
          id: "discover-advocates",
          label: "Discover advocates",
          subtitle: "Search verified Kerala & High Court counsels",
          whatItDoes: "Search advocates by bar council license, court practice, and client ratings.",
          icon: Scale,
        },
        {
          id: "document-filing",
          label: "Document filing",
          subtitle: "Court petitions & registry submissions",
          whatItDoes: "Prepares petitions, vakalatnama, and affidavits for court registry submission.",
          icon: FileSignature,
        },
        {
          id: "legal-notices",
          label: "Legal Notices",
          subtitle: "Demand notices & statutory replies",
          whatItDoes: "Generates Section 138 NI Act notices, tenancy eviction replies, and recovery notices.",
          icon: FileCheck,
        },
        {
          id: "consultations",
          label: "Consultations",
          subtitle: "Video & chamber legal consults",
          whatItDoes: "Book and manage video consultations and physical chamber appointments.",
          icon: PhoneCall,
        },
        {
          id: "inbox",
          label: "Inbox",
          subtitle: "Advocate messages & court summons",
          whatItDoes: "Encrypted direct messages from your advocates, registry updates, and summons.",
          icon: Mail,
        },
      ],
    },
    {
      category: "PRODUCTIVITY",
      items: [
        {
          id: "notes",
          label: "Notes",
          subtitle: "Quick legal memos & briefs",
          whatItDoes: "Saves consultation notes, lawyer instructions, and case reminders.",
          icon: StickyNote,
        },
        {
          id: "calendar",
          label: "Calendar",
          subtitle: "Hearings & appointment dates",
          whatItDoes: "Tracks hearing dates, lawyer consultation appointments, and filing deadlines.",
          icon: Calendar,
        },
        {
          id: "taskmite",
          label: "Task Mite",
          subtitle: "Personal tasks & document checklist",
          whatItDoes: "Tracks required document submissions, affidavit signings, and client action items.",
          icon: CheckCircle2,
        },
        {
          id: "time-sheet",
          label: "Time sheet",
          subtitle: "Consultation & appearance hours",
          whatItDoes: "Inspects advocate consultation logs, billable minutes, and appearance time sheets.",
          icon: Clock,
        },
        {
          id: "case-tracker",
          label: "Case Tracker",
          subtitle: "Live eCourts CNR tracking",
          whatItDoes: "Monitors stage-by-stage litigation progress and next court hearing dates.",
          icon: Activity,
        },
        {
          id: "ask-ai",
          label: "Ask AI",
          subtitle: "24/7 instant legal copilot",
          whatItDoes: "Provides instant AI guidance on procedural steps, court fees, and document checklists.",
          icon: Bot,
        },
      ],
    },
    {
      category: "MY WAKHEEL",
      items: [
        {
          id: "my-advocates",
          label: "My advocates",
          subtitle: "Retained & assigned counsels",
          whatItDoes: "View contact information and consultation history with your legal representatives.",
          icon: Users,
        },
        {
          id: "appointments",
          label: "Appointments",
          subtitle: "Scheduled hearings & consultations",
          whatItDoes: "Manage upcoming advocate appointments, hearing slots, and chamber visits.",
          icon: Calendar,
        },
        {
          id: "messages",
          label: "Messages",
          subtitle: "Direct secure advocate communications",
          whatItDoes: "Encrypted client-advocate messaging, file sharing, and hearing briefs.",
          icon: MessageSquare,
        },
        {
          id: "task-and-timeline",
          label: "Tasks & Timeline",
          subtitle: "Case milestones & court schedule",
          whatItDoes: "Track the chronological history and upcoming milestones of your legal matter.",
          icon: History,
        },
        {
          id: "payments-and-invoice",
          label: "Payments and Invoice",
          subtitle: "Retainer bills, receipts & court fees",
          whatItDoes: "Views and downloads advocate fee invoices, court fee challans, and payment receipts.",
          icon: Receipt,
        },
      ],
    },
    {
      category: "BUSINESS +",
      items: [
        {
          id: "business-registration",
          label: "Business registration services",
          subtitle: "Pvt Ltd, LLP, OPC & MSME incorporation",
          whatItDoes: "Registers new companies, LLPs, partnerships, and startup incorporations.",
          icon: Building2,
        },
        {
          id: "tax-compliance",
          label: "Tax and Compliances Filing",
          subtitle: "GST, ITR, TDS & ROC annual filings",
          whatItDoes: "Manages periodic GST returns, income tax filings, and statutory compliance calendars.",
          icon: Calculator,
        },
        {
          id: "trademark-ip",
          label: "Trademark and IP registration",
          subtitle: "Brand trademark, copyright & patent filing",
          whatItDoes: "Conducts trademark searches, files TM applications, and tracks IP registry objections.",
          icon: Shield,
        },
        {
          id: "corporate-lawyer",
          label: "Corporate Lawyer services",
          subtitle: "M&A, shareholder agreements & advisory",
          whatItDoes: "Provides dedicated corporate counsel for contracts, term sheets, and board advisory.",
          icon: Briefcase,
        },
        {
          id: "company-secretary",
          label: "Company Secretary services",
          subtitle: "ROC filings, board minutes & MCA compliance",
          whatItDoes: "Handles secretarial audits, director KYC, share allotments, and MCA21 filings.",
          icon: ClipboardCheck,
        },
        {
          id: "auditor-ca",
          label: "Auditor and CA services",
          subtitle: "Statutory audit, valuation & tax certification",
          whatItDoes: "Connects with Chartered Accountants for balance sheet audits and tax certifications.",
          icon: Landmark,
        },
      ],
    },
    {
      category: "MY NETWORKS",
      items: [
        {
          id: "my-hub",
          label: "My Hub",
          subtitle: "Citizen command center & updates",
          whatItDoes: "Central hub for all shared files, advocate messages, and hearing alerts.",
          icon: Compass,
        },
        {
          id: "my-teams",
          label: "My teams",
          subtitle: "Assigned advocates & legal staff",
          whatItDoes: "Shows the assigned counsel, junior associates, and clerks handling your legal matters.",
          icon: Users,
        },
      ],
    },
    {
      category: "REPORTS",
      items: [
        {
          id: "ai-analytics",
          label: "AI Analytics",
          subtitle: "Case duration & outcome insights",
          whatItDoes: "Analyzes matter timelines, bench disposal trends, and litigation cost projections.",
          icon: BarChart3,
        },
        {
          id: "ai-reports",
          label: "AI Reports",
          subtitle: "Automated case & compliance reports",
          whatItDoes: "Generates downloadable AI summary reports of your active matters and filings.",
          icon: FileSpreadsheet,
        },
      ],
    },
  ];

  // Rightbar launcher sections
  const rightbarSections = [
    {
      category: "MY WAKHEEL",
      items: [
        {
          id: "consultations",
          label: "Consultations",
          whatItDoes: "Book and launch video consultations with your assigned advocate.",
          icon: PhoneCall,
        },
        {
          id: "discover-advocates",
          label: "Discover Advocates",
          whatItDoes: "Browse verified advocates and law firms.",
          icon: Scale,
        },
      ],
    },
    {
      category: "INVOICES & MATTERS",
      items: [
        {
          id: "payments-and-invoice",
          label: "Bills & Receipts",
          whatItDoes: "View advocate fee challans and invoices.",
          icon: Receipt,
        },
        {
          id: "case-tracker",
          label: "Case Tracker",
          whatItDoes: "Track live eCourts CNR status.",
          icon: Activity,
        },
      ],
    },
    {
      category: "AI SUITE",
      items: [
        {
          id: "draft",
          label: "AI Drafting",
          whatItDoes: "Draft notices, affidavits & agreements.",
          icon: FileEdit,
        },
        {
          id: "translate",
          label: "AI Translate",
          whatItDoes: "Translate Malayalam/Tamil/Hindi documents into certified English.",
          icon: Languages,
        },
      ],
    },
  ];

  const isCopilot =
    activeTab === "ai-copilot" ||
    ["draft", "translate", "summary", "research", "ask-ai"].includes(activeTab);

  const isProductivity = [
    "notes",
    "calendar",
    "taskmite",
    "time-sheet",
  ].includes(activeTab);

  const isBusiness = [
    "business-registration",
    "tax-compliance",
    "trademark-ip",
    "corporate-lawyer",
    "company-secretary",
    "auditor-ca",
  ].includes(activeTab);

  const isAnalytics = ["ai-analytics", "ai-reports"].includes(activeTab);

  // Helper to resolve assigned advocate for the active matter
  const getAssignedAdvocate = (matterTitle: string) => {
    const found = matters.find(
      (m) =>
        (m.matterTitle && m.matterTitle.toLowerCase().includes(matterTitle.toLowerCase().slice(0, 15))) ||
        (m.caseNumber && matterTitle.toLowerCase().includes(m.caseNumber.toLowerCase())) ||
        m._id === matterTitle
    );

    if (found && found.advocateName) {
      const isMeera = found.advocateName.toLowerCase().includes("meera");
      return {
        name: found.advocateName,
        enrolment: isMeera ? "K/001429/2012" : "K/002194/2015",
        chamber: found.courtForum || "High Court of Kerala (Ernakulam)",
        specialization: isMeera ? "Senior Counsel • Constitutional & Civil Writs" : "Corporate & Commercial Litigation",
        avatarText: isMeera ? "MK" : "RV",
        status: "Active Representation",
        verified: true,
      };
    }

    if (matterTitle.toLowerCase().includes("19482") || matterTitle.toLowerCase().includes("kseb")) {
      return {
        name: "Adv. Meera Krishnan",
        enrolment: "K/001429/2012",
        chamber: "High Court of Kerala (Court Hall 2A)",
        specialization: "Senior Counsel • Constitutional & Writs",
        avatarText: "MK",
        status: "Active Representation",
        verified: true,
      };
    }

    if (matterTitle.toLowerCase().includes("nclt") || matterTitle.toLowerCase().includes("malabar")) {
      return {
        name: "Adv. Rajesh V. Varma",
        enrolment: "K/002194/2015",
        chamber: "NCLT Kochi Bench & Commercial Court",
        specialization: "Corporate & Insolvency Counsel",
        avatarText: "RV",
        status: "Active Representation",
        verified: true,
      };
    }

    if (matterTitle.toLowerCase().includes("412") || matterTitle.toLowerCase().includes("varghese")) {
      return {
        name: "Adv. Rajesh V. Varma",
        enrolment: "K/002194/2015",
        chamber: "Sub Court, Ernakulam",
        specialization: "Civil & Land Title Dispute Counsel",
        avatarText: "RV",
        status: "Active Representation",
        verified: true,
      };
    }

    if (matterTitle === "new") {
      return {
        name: "Counsel Matching Pending",
        enrolment: "Bar Council of Kerala",
        chamber: "Chamber Registry Intake",
        specialization: "Intake Triage in Progress",
        avatarText: "AI",
        status: "Awaiting Counsel Assignment",
        verified: false,
      };
    }

    return {
      name: "Adv. Meera Krishnan",
      enrolment: "K/001429/2012",
      chamber: "High Court of Kerala (Ernakulam)",
      specialization: "Senior Counsel • High Court Writs",
      avatarText: "MK",
      status: "Active Representation",
      verified: true,
    };
  };

  const availableMatters =
    matters.length > 0
      ? matters.map((m) => ({
          id: m._id || m.caseNumber,
          title: m.matterTitle || `${m.caseNumber} — ${m.title || "Legal Matter"}`,
          shortTitle: m.caseNumber
            ? `${m.caseNumber} — ${((m.matterTitle || m.title || "").split("—")[1] || (m.matterTitle || m.title || "")).slice(0, 16).trim()}...`
            : m.matterTitle,
        }))
      : [
          {
            id: "mat_wpc_19482",
            title: "WP(C) 19482/2024 — Gopakumar v. KSEB",
            shortTitle: "WP(C) 19482/2024 — Gopakumar ...",
          },
          {
            id: "mat_nclt_041",
            title: "ARB/NCLT/KOCHI/2024/041 — Malabar Infotech",
            shortTitle: "ARB/NCLT/KOCHI/2024/041 — Malabar ...",
          },
          {
            id: "mat_os_412",
            title: "OS 412/2023 — Gopakumar v. Varghese Builders",
            shortTitle: "OS 412/2023 — Gopakumar v. Varghese ...",
          },
        ];

  const assignedAdvocate = getAssignedAdvocate(selectedMatter);

  return (
    <div className="h-screen w-screen flex bg-white dark:bg-black text-black dark:text-white font-sans overflow-hidden transition-colors duration-200">
      
      {/* =========================================================================
          LEFT SIDEBAR: Exact layout matching user's prompt & screenshot
      ========================================================================= */}
      <aside className="w-72 shrink-0 bg-white dark:bg-black text-black dark:text-white flex flex-col justify-between z-20 shadow-xs border-r border-zinc-200 dark:border-zinc-800">
        
        {/* Top Header: Wakheel.com Citizen - portal */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
          <div className="flex items-center justify-between mb-3">
            <BrandLogo size="sm" subtitleText="CITIZEN PORTAL" />

            <button
              onClick={() => {}}
              className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer shrink-0"
              title="Citizen Workspace Active"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Card: (GO) Gopakumar Nambiar, Kochi, Kerala */}
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
              GO
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-black dark:text-white truncate">
                Gopakumar Nambiar
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                Kochi, Kerala
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 text-xs font-medium no-scrollbar">
          
          {/* Main Top Actions */}
          <div className="space-y-0.5">
            {/* 1. Dashboard */}
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

          {/* 2. Case tracking */}
          <button
            onClick={() => setActiveTab("case-tracking")}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
              activeTab === "case-tracking" || activeTab === "case-tracker" || activeTab === "case-tracker-prod"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span>Case tracking</span>
          </button>

          {/* 3. My legal matters */}
          <button
            onClick={() => setActiveTab("my-matters")}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
              activeTab === "my-matters"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>My legal matters</span>
          </button>

          {/* 4. My Advocates */}
          <button
            onClick={() => setActiveTab("my-advocates")}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
              activeTab === "my-advocates"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>My Advocates</span>
          </button>

          {/* 5. Ai legal copilot */}
          <button
            onClick={() => setActiveTab("ai-copilot")}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
              activeTab === "ai-copilot" || ["draft", "translate", "summary", "research", "ask-ai"].includes(activeTab)
                ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Ai legal copilot</span>
          </button>

          {/* 6. Find legal help */}
          <button
            onClick={() => setActiveTab("find-legal-help")}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
              activeTab === "find-legal-help"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>Find legal help</span>
          </button>

          {/* 7. Discover advocate */}
          <button
            onClick={() => setActiveTab("discover-advocates")}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
              activeTab === "discover-advocates" || activeTab === "discover-advocate"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <Scale className="w-4 h-4 shrink-0" />
            <span>Discover advocate</span>
          </button>

          {/* 8. Document filing */}
          <button
            onClick={() => setActiveTab("document-filing")}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
              activeTab === "document-filing"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <FileSignature className="w-4 h-4 shrink-0" />
            <span>Document filing</span>
          </button>

          {/* 9. My case diary */}
          <button
            onClick={() => setActiveTab("case-diary")}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
              activeTab === "case-diary"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>My case diary</span>
          </button>

          {/* 10. Documents with Sub-items: i. Scan, ii. Translate */}
          <div className="space-y-0.5">
            <button
              onClick={() => {
                setActiveTab("documents");
                setDocumentsOpen(!documentsOpen);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                activeTab === "documents" ||
                activeTab === "certified-true-copies" ||
                activeTab === "contracts"
                  ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderLock className="w-4 h-4 shrink-0" />
                <span>Documents</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  documentsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Sub-items: i. Scan, ii. Translate */}
            {documentsOpen && (
              <div className="pl-6 pr-1 space-y-0.5 border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* i. Scan */}
                <button
                  onClick={() => {
                    setActiveTab("documents");
                    setUploadModalOpen(true);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                    uploadModalOpen && activeTab === "documents"
                      ? "bg-zinc-200 dark:bg-zinc-800 font-bold text-black dark:text-white"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <span className="font-mono text-[10px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0">i.</span>
                  <UploadCloud className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs">Scan</span>
                </button>

                {/* ii. Translate */}
                <button
                  onClick={() => {
                    setActiveTab("ai-copilot");
                    setCopilotMode("Translate");
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                    activeTab === "ai-copilot" && copilotMode === "Translate"
                      ? "bg-zinc-200 dark:bg-zinc-800 font-bold text-black dark:text-white"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <span className="font-mono text-[10px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0">ii.</span>
                  <Languages className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs">Translate</span>
                </button>
              </div>
            )}
          </div>

          {/* 11. Legal notices */}
          <button
            onClick={() => setActiveTab("legal-notices")}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
              activeTab === "legal-notices"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <FileCheck className="w-4 h-4 shrink-0" />
            <span>Legal notices</span>
          </button>

          {/* 12. Consultations */}
          <button
            onClick={() => setActiveTab("consultations")}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
              activeTab === "consultations" || activeTab === "appointments"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <PhoneCall className="w-4 h-4 shrink-0" />
            <span>Consultations</span>
          </button>

          {/* 13. News and articles */}
          <button
            onClick={() => setActiveTab("news-articles")}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
              activeTab === "news-articles"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <Newspaper className="w-4 h-4 shrink-0" />
            <span>News and articles</span>
          </button>

            {/* 14. Inbox */}
            <button
              onClick={() => setActiveTab("inbox")}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                activeTab === "inbox" || activeTab === "messages"
                  ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>Inbox</span>
            </button>
          </div>

          {/* Section: PRODUCTIVITY */}
          <div className="space-y-0.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
              PRODUCTIVITY
            </span>
            {[
              { id: "notes", label: "Notes", icon: StickyNote },
              { id: "calendar", label: "Calendar", icon: Calendar },
              { id: "taskmite", label: "Task Mite", icon: CheckCircle2 },
              { id: "time-sheet", label: "Time sheet", icon: Clock },
              { id: "ask-ai", label: "Ask AI", icon: Bot },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section: MY WAKHEEL */}
          <div className="space-y-0.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
              MY WAKHEEL
            </span>
            {[
              { id: "my-advocates", label: "My advocates", icon: Users },
              { id: "appointments", label: "Appointments", icon: Calendar },
              { id: "messages", label: "Messages", icon: MessageSquare },
              { id: "task-and-timeline", label: "Tasks & Timeline", icon: History },
              { id: "payments-and-invoice", label: "Payments and Invoice", icon: Receipt },
            ].map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.id === "task-and-timeline" &&
                  (activeTab === "tasks-and-timeline" || activeTab === "timeline"));
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section: BUSINESS + */}
          <div className="space-y-0.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
              BUSINESS +
            </span>
            {[
              { id: "business-registration", label: "Business registration services", icon: Building2 },
              { id: "tax-compliance", label: "Tax and Compliances Filing", icon: Calculator },
              { id: "trademark-ip", label: "Trademark and IP registration", icon: Shield },
              { id: "corporate-lawyer", label: "Corporate Lawyer services", icon: Briefcase },
              { id: "company-secretary", label: "Company Secretary services", icon: ClipboardCheck },
              { id: "auditor-ca", label: "Auditor and CA services", icon: Landmark },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section: MY NETWORKS */}
          <div className="space-y-0.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
              MY NETWORKS
            </span>
            {[
              { id: "my-hub", label: "My Hub", icon: Compass },
              { id: "my-teams", label: "My teams", icon: Users },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section: REPORTS */}
          <div className="space-y-0.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
              REPORTS
            </span>
            {[
              { id: "ai-analytics", label: "AI Analytics", icon: BarChart3 },
              { id: "ai-reports", label: "AI Reports", icon: FileSpreadsheet },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section: SETTINGS & PRIVACY */}
          <div className="space-y-0.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab("privacy-data")}
              className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all cursor-pointer ${
                activeTab === "privacy-data"
                  ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <FolderLock className="w-4 h-4 shrink-0" />
              <span>Privacy &amp; Data</span>
            </button>

            <button
              onClick={() => setSettingsModalOpen(true)}
              className="w-full flex items-center gap-3 p-2 rounded-xl text-left text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </button>
          </div>

        </div>

        {/* Sidebar Footer: Kerala / India Legal OS v1.0-fe with Quick Settings */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span>Kerala / India Legal OS</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-bold">
              v1.0-fe
            </span>
          </div>
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Portal Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

      </aside>

      {/* =========================================================================
          MAIN CANVAS (Matching Screenshot Exactly)
      ========================================================================= */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-zinc-50 dark:bg-black">
        {/* Top Header Bar */}
            <header className="px-4 sm:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-between shrink-0 shadow-xs gap-3">
              {/* Left: Active Matter Switcher & Assigned Advocate Section */}
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                {/* Active Matter Switcher */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white font-medium shadow-2xs">
                  <Scale className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                  <span className="font-bold shrink-0">Active Matter:</span>
                  <select
                    value={selectedMatter}
                    onChange={(e) => {
                      if (e.target.value === "new") {
                        setActiveTab("ai-copilot");
                      }
                      setSelectedMatter(e.target.value);
                    }}
                    className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer text-black dark:text-white max-w-[140px] sm:max-w-[210px] md:max-w-none truncate"
                  >
                    {availableMatters.map((m, mIdx) => (
                      <option key={`${m.id || m.title}_${mIdx}`} value={m.title}>
                        {m.shortTitle || m.title}
                      </option>
                    ))}
                    <option value="new">+ Intake New Legal Issue</option>
                  </select>
                </div>

                {/* Assigned Advocate Pill (Right Next to Active Matter Section) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAdvocatePopoverOpen(!advocatePopoverOpen)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-xs text-black dark:text-white font-medium transition-all cursor-pointer group shadow-2xs"
                    title="Assigned Legal Counsel for this matter — Click for credentials & chamber actions"
                  >
                    <div className="w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                      {assignedAdvocate.avatarText}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500 font-normal hidden sm:inline">Assigned Counsel:</span>
                      <span className="font-bold underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-2 group-hover:decoration-black dark:group-hover:decoration-white transition-all truncate max-w-[130px] sm:max-w-none">
                        {assignedAdvocate.name}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hidden md:inline">
                      {assignedAdvocate.enrolment}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-transform ${advocatePopoverOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Advocate Details Popover */}
                  {advocatePopoverOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setAdvocatePopoverOpen(false)} />
                      <div className="absolute top-full left-0 mt-2 w-80 sm:w-88 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 z-40 space-y-3 animate-in fade-in zoom-in-95 duration-150 text-xs">
                        {/* Header */}
                        <div className="flex items-start justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-bold text-xs font-mono text-black dark:text-white shrink-0">
                              {assignedAdvocate.avatarText}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-black dark:text-white text-sm">
                                  {assignedAdvocate.name}
                                </span>
                                {assignedAdvocate.verified && (
                                  <span title="Verified Bar Council Enrolment">
                                    <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-zinc-500 font-mono block">
                                {assignedAdvocate.enrolment} • {assignedAdvocate.chamber}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAdvocatePopoverOpen(false)}
                            className="text-zinc-400 hover:text-black dark:hover:text-white p-1 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Metadata */}
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between py-1 border-b border-zinc-50 dark:border-zinc-900">
                            <span className="text-zinc-400">Specialization</span>
                            <span className="font-semibold text-black dark:text-white text-right">{assignedAdvocate.specialization}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-zinc-50 dark:border-zinc-900">
                            <span className="text-zinc-400">Representation</span>
                            <span className="font-mono font-bold text-black dark:text-white">{assignedAdvocate.status}</span>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-zinc-400">Matter Docket</span>
                            <span className="font-mono text-zinc-600 dark:text-zinc-300 truncate max-w-[170px]">
                              {selectedMatter.split("—")[0].trim()}
                            </span>
                          </div>
                        </div>

                        {/* Quick Chamber Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                          <button
                            type="button"
                            onClick={() => {
                              setAdvocatePopoverOpen(false);
                              setActiveTab("inbox");
                            }}
                            className="px-3 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-[11px] flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Privileged Inbox</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAdvocatePopoverOpen(false);
                              setActiveTab("consultations");
                            }}
                            className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-bold text-[11px] flex items-center justify-center gap-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Consultations</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Citizen Demo Switcher Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white">
              <User className="w-3.5 h-3.5" />
              <span>Citizen (Switch Demo)</span>
            </div>

            {/* Language Selector: EN | മലയാളം */}
            <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 text-xs font-bold bg-zinc-100 dark:bg-zinc-900">
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  lang === "en"
                    ? "bg-white dark:bg-black text-black dark:text-white shadow-xs font-bold"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ml")}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  lang === "ml"
                    ? "bg-white dark:bg-black text-black dark:text-white shadow-xs font-bold"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                മലയാളം
              </button>
            </div>

            {/* Notification Bell with micro-burgundy dot */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-black dark:bg-white" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center">
                GO
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-black dark:text-white leading-tight">
                  Gopakumar Nambiar
                </span>
                <span className="text-[10px] text-zinc-500">Citizen</span>
              </div>
            </div>
          </div>

        </header>

        {/* Workspace Pilot Notice Bar */}
        <div className="px-6 py-1.5 bg-zinc-100 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" />
            <span className="font-medium text-black dark:text-white">
              Wakheel Simulated Intelligence Workspace • Kerala, India Legal Practice Pilot
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase text-zinc-500 font-bold">
            NO REAL EXTERNAL API CALLS
          </span>
        </div>

        {/* Dynamic Canvas Views */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* ============================================================== */}
          {/* VIEW: Dashboard (Exact Match to Screenshot)                    */}
          {/* ============================================================== */}
          {activeTab === "dashboard" && (
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* Hero Banner: Namaskaram, Gopakumar */}
              <div className="p-8 rounded-3xl bg-black text-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>Citizen Legal Services Portal • Kerala &amp; India</span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                    {lang === "ml" ? "നമസ്കാരം, ഗോപകുമാർ" : "Namaskaram, Gopakumar"}
                  </h2>
                  <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
                    Submit new legal grievances, track active court matters before the High Court of Kerala or Subordinate Courts, and consult with verified advocates without complicated legal jargon.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab("find-legal-help")}
                    className="px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit New Legal Issue</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("discover-advocates")}
                    className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Scale className="w-4 h-4" />
                    <span>Find Verified Advocates</span>
                  </button>
                </div>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Active Matters */}
                <div
                  onClick={() => setActiveTab("case-tracking")}
                  className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-black dark:hover:border-white transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                      ACTIVE MATTERS
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-black dark:text-white">
                        {matters.length > 0 ? matters.length : 2}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">Kerala High Court</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>

                {/* Upcoming Consultations */}
                <div
                  onClick={() => setActiveTab("consultations")}
                  className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-black dark:hover:border-white transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                      UPCOMING CONSULTATIONS
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-black dark:text-white">
                        {consultations.filter((c) => c.status === "scheduled").length || 2}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">Video &amp; Chamber</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                {/* Documents in Vault */}
                <div
                  onClick={() => setActiveTab("documents")}
                  className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-black dark:hover:border-white transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                      DOCUMENTS IN VAULT
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-black dark:text-white">
                        {documents.length > 0 ? documents.length : 4}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">256-bit Encrypted</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                {/* Statutory Notices / Pending Actions */}
                <div
                  onClick={() => setActiveTab("legal-notices")}
                  className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-black dark:hover:border-white transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                      STATUTORY NOTICES
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-black dark:text-white">
                        {legalNotices.length > 0 ? legalNotices.length : 2}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">Active Timelines</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

              </div>

              {/* 2-Column Split: Active Legal Matters & Upcoming Appointments */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 8 Cols: Active Legal Matters */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h3 className="text-base font-bold text-black dark:text-white">
                        Active Legal Matters
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Real-time court status and assigned advocate progress
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("case-tracking")}
                      className="text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All</span>
                      <span>→</span>
                    </button>
                  </div>

                  {matters.length > 0 ? (
                    matters.map((matter) => (
                      <div
                        key={matter._id}
                        className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-black dark:text-white">
                            {matter.caseNumber || matter.cnrNumber}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                            {matter.status === "active" ? "Admitted" : matter.status === "notice_issued" ? "Notice Issued" : "In Progress"}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-black dark:text-white">
                            {matter.matterTitle}
                          </h4>
                          <p className="text-xs text-zinc-500">
                            Court: {matter.courtForum} • Advocate: {matter.advocateName}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900 text-xs">
                          <span className="text-zinc-400 font-mono text-[11px]">
                            Next Hearing: {matter.nextHearingDate ? new Date(matter.nextHearingDate).toLocaleDateString() : "Listed for hearing"}
                          </span>
                          <button
                            onClick={() => {
                              setTrackerCnr(matter.cnrNumber || matter.caseNumber);
                              setTrackedMatter(matter);
                              setActiveTab("case-tracking");
                            }}
                            className="px-4 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold text-xs text-black dark:text-white cursor-pointer"
                          >
                            Matter Details
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-zinc-500 bg-white dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      Loading active matters from Kerala court registry...
                    </div>
                  )}

                </div>

                {/* Right 4 Cols: Upcoming Appointments & AI Assist */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-black dark:text-white">
                        Upcoming Consultations
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Scheduled advocate sessions
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("consultations")}
                      className="text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                    >
                      Manage
                    </button>
                  </div>

                  {consultations.length > 0 ? (
                    consultations.slice(0, 2).map((c) => (
                      <div
                        key={c._id}
                        className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-black dark:text-white truncate max-w-[190px]">
                            {c.subject}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
                            {c.consultationType}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">
                          {c.advocateName}
                        </p>
                        <span className="text-[11px] font-mono text-zinc-400 block">
                          {c.scheduledDate?.split("T")[0]} • {c.timeSlot}
                        </span>

                        {c.meetingLink && c.consultationType === "video" && (
                          <a
                            href={c.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-1.5 px-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Join Video Chamber</span>
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 text-center">
                      No consultations scheduled yet.
                    </div>
                  )}

                  {/* Ask Wakheel AI Box */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4 text-black dark:text-white" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                        ASK WAKHEEL AI
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-snug">
                      Instant procedural legal guidance on Indian statutes, court fees, and FIR filing.
                    </p>
                    <form onSubmit={handleDashAiSubmit} className="relative">
                      <input
                        type="text"
                        value={dashAiInput}
                        onChange={(e) => setDashAiInput(e.target.value)}
                        placeholder={lang === "ml" ? "മലയാളത്തിലോ ഇംഗ്ലീഷിലോ ചോദിക്കൂ..." : "Ask in Malayalam or English..."}
                        className="w-full pl-3 pr-16 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isDashAiLoading || !dashAiInput.trim()}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {isDashAiLoading ? "..." : "Ask AI"}
                      </button>
                    </form>

                    {dashAiAnswer && (
                      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-black dark:text-white pb-1 border-b border-zinc-200 dark:border-zinc-800">
                          <span className="flex items-center gap-1 font-mono uppercase">
                            <Sparkles className="w-3 h-3 text-black dark:text-white" /> Wakheel Legal Guidance
                          </span>
                          <button
                            type="button"
                            onClick={() => setDashAiAnswer(null)}
                            className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="whitespace-pre-line leading-relaxed text-[11px]">
                          {dashAiAnswer}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: Find Legal Help (Legal Help Submission Wizard)           */}
          {/* ============================================================== */}
          {activeTab === "find-legal-help" && (
            <div className="w-full max-w-5xl mx-auto space-y-6">
              <LegalProblemSubmission
                onSubmitted={loadCitizenData}
                onViewMatters={() => setActiveTab("my-matters")}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: Discover Advocates / Lawyer Services                     */}
          {/* ============================================================== */}
          {(activeTab === "discover-advocates" || activeTab === "discover-advocate" || activeTab === "my-advocates") && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    {activeTab === "my-advocates" ? "My Advocates & Assigned Counsel" : "Discover Verified Advocates"}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {activeTab === "my-advocates"
                      ? "Verified Bar Council of Kerala and High Court practitioners representing you with active matter assignments."
                      : "Verified Bar Council of Kerala and High Court practitioner profiles with real-time consultation slots."}
                  </p>
                </div>
              </div>
              <AdvocateSearchAndMatch
                onRequestConsultation={handleOpenConsultation}
                onSelectAdvocateToBook={handleOpenBooking}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: Consultations & Chamber Appointments                     */}
          {/* ============================================================== */}
          {(activeTab === "consultations" || activeTab === "appointments") && (
            <ConsultationsManagementView
              token={typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || "dev_token" : "dev_token"}
              onOpenBookingModal={() => {
                setSelectedAdvocate(mockAdvocates[0]);
                setBookingDefaultTab("booking");
                setBookingModalOpen(true);
              }}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW: Privileged Chamber Inbox & Direct Advocate Messages     */}
          {/* ============================================================== */}
          {(activeTab === "inbox" || activeTab === "messages") && (
            <SecureInboxView
              token={typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || "dev_token" : "dev_token"}
              onOpenConsultationModal={() => {
                setSelectedAdvocate(mockAdvocates[0]);
                setBookingDefaultTab("booking");
                setBookingModalOpen(true);
              }}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW: Statutory Legal Notices & Speed Post Tracking            */}
          {/* ============================================================== */}
          {activeTab === "legal-notices" && (
            <LegalNoticesView
              token={typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || "dev_token" : "dev_token"}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW: My Legal Matters & Live Case Tracking (eCourts CNR)      */}
          {/* ============================================================== */}
          {(activeTab === "my-matters" ||
            activeTab === "case-tracking" ||
            activeTab === "case-tracker" ||
            activeTab === "case-tracker-prod") && (
            <MyLegalMattersView
              initialShowCnrTracker={
                activeTab === "case-tracking" ||
                activeTab === "case-tracker" ||
                activeTab === "case-tracker-prod"
              }
              onSelectMatter={(matterTitle) => setSelectedMatter(matterTitle)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenConsultation={() => {
                setSelectedAdvocate(mockAdvocates[0]);
                setBookingDefaultTab("booking");
                setBookingModalOpen(true);
              }}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW: Document Submission for Advocate Review                   */}
          {/* ============================================================== */}
          {activeTab === "document-filing" && (
            <DocumentFilingView initialMatter={selectedMatter} />
          )}

          {/* ============================================================== */}
          {/* VIEW: Documents & Case Records (Full Width with Top Navbar)    */}
          {/* ============================================================== */}
          {(activeTab === "documents" ||
            activeTab === "case-diary" ||
            activeTab === "certified-true-copies" ||
            activeTab === "contracts") && (
            <ClientDocumentsView
              initialTab={
                activeTab === "case-diary"
                  ? "case-diary"
                  : activeTab === "certified-true-copies"
                  ? "certified-true-copies"
                  : activeTab === "contracts"
                  ? "contracts"
                  : "all"
              }
            />
          )}

          {/* ============================================================== */}
          {/* VIEW: News and Articles (Landmark Rulings & Legal Guides)      */}
          {/* ============================================================== */}
          {activeTab === "news-articles" && (
            <NewsAndArticlesView />
          )}

          {/* ============================================================== */}
          {/* VIEW: Wakheel AI Legal Copilot (Navbar Modes + Chatbot Console) */}
          {/* ============================================================== */}
          {isCopilot && (
            <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
              {/* Pilot Banner matching Screenshot */}
              <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium text-black dark:text-white">
                    Wakheel Simulated Intelligence Workspace • Kerala, India Legal Practice Pilot
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 hidden sm:inline">
                  NO REAL EXTERNAL API CALLS
                </span>
              </div>

              {/* Title & Model Pill */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
                    Wakheel AI Legal Copilot
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                    India Law Model
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-500">
                  Multi-modal research, contract inspection, and drafting copilot with certified citation cross-checking
                </p>
              </div>

              {/* Top Mode Navbar: Ask | Research | Analyze | Draft | Review | Verify | Translate */}
              <div className="p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid grid-cols-3 sm:grid-cols-7 gap-1.5 text-xs sm:text-sm font-bold text-center">
                {(["Ask", "Research", "Analyze", "Draft", "Review", "Verify", "Translate"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCopilotMode(mode)}
                    className={`py-2 px-2 rounded-xl transition-all cursor-pointer ${
                      copilotMode === mode
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* ========================================================= */}
              {/* SPECIALIZED SUITE: VERNACULAR TRANSLATION (Translate Mode) */}
              {/* ========================================================= */}
              {copilotMode === "Translate" && (
                <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-900">
                    <div>
                      <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                        <Languages className="w-4 h-4" />
                        Kerala High Court Vernacular Translation Suite
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Translates regional revenue and police records into formal court pleading English conforming to Rule 32 of Kerala High Court Rules.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const sample = "ആധാരം നമ്പർ 1842/2018 പ്രകാരം വസ്തു കൈവശാവകാശ സർട്ടിഫിക്കറ്റ് ലഭിച്ചിട്ടുണ്ട്. വില്ലേജ് ഓഫീസിൽ കരം തീർത്ത രസീത് ഉണ്ട്. സ്ഥലത്ത് മഹസർ തയ്യാറാക്കി. വൈദ്യുതി ലൈൻ മാറ്റിവെക്കണമെന്ന് ആവശ്യപ്പെട്ട് ആക്ഷേപം നൽകി.";
                          setTranslationSourceText(sample);
                          setTranslationDocType("land_revenue");
                          handleRunClientTranslation(sample);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                      >
                        Load Land Deed Sample
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const sample = "വില്ലേജ് ഓഫീസറും പോലീസും ചേർന്ന് സ്ഥലത്ത് മഹസർ തയ്യാറാക്കി. അതിരുകൾ തിരിച്ച് അളവ് സ്കെച്ച് എടുത്തു. സർവ്വേ കല്ലുകൾ ഭാഗികമായി നശിപ്പിക്കപ്പെട്ട നിലയിലാണ്. താല്ക്കാലിക നിരോധന ഉത്തരവ് നിലവിലുണ്ട്.";
                          setTranslationSourceText(sample);
                          setTranslationDocType("police_mahazar");
                          handleRunClientTranslation(sample);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                      >
                        Load Mahazar Sample
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-black dark:text-white uppercase tracking-wider text-[10px]">
                          Vernacular Source Document (Malayalam)
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {translationSourceText.length} characters
                        </span>
                      </div>
                      <textarea
                        rows={7}
                        value={translationSourceText}
                        onChange={(e) => setTranslationSourceText(e.target.value)}
                        placeholder="Paste Malayalam revenue deed, police mahazar, or complaint here..."
                        className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white leading-relaxed focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleRunClientTranslation()}
                        disabled={isTranslating || !translationSourceText.trim()}
                        className="w-full py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isTranslating ? "Translating & Cross-Checking Statutes..." : "Translate & Extract Legal Ratios"}</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-black dark:text-white uppercase tracking-wider text-[10px]">
                          Certified Court English Pleading
                        </span>
                        {translatedResult && (
                          <button
                            type="button"
                            onClick={() => handleCopyText(translatedResult, "client_trans")}
                            className="text-[11px] font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {copiedBadge === "client_trans" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedBadge === "client_trans" ? "Copied!" : "Copy Pleading"}</span>
                          </button>
                        )}
                      </div>
                      <div className="min-h-[178px] p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white leading-relaxed whitespace-pre-line font-serif overflow-y-auto max-h-[220px]">
                        {translatedResult || "English legal translation conforming to Kerala High Court standards will appear here once executed..."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SPECIALIZED SUITE: STATUTORY NOTICE DRAFTER (Draft Mode)  */}
              {/* ========================================================= */}
              {copilotMode === "Draft" && (
                <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-900">
                    <div>
                      <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                        <FileEdit className="w-4 h-4" />
                        Automated Statutory Notice &amp; Writ Drafter
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Generates court-tested legal notices and writ petition grounds with requisite statutory timeframes.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: "wp_interim_stay_affidavit", label: "WP(C) Stay Application" },
                        { id: "ni_138_demand_notice", label: "S.138 Cheque Notice" },
                        { id: "property_eviction_notice", label: "Eviction Notice" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setDraftingTemplate(t.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            draftingTemplate === t.id
                              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                              : "border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-black dark:text-white text-[10px] uppercase">
                        Client / Petitioner
                      </label>
                      <input
                        type="text"
                        value={draftingClientName}
                        onChange={(e) => setDraftingClientName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-black dark:text-white text-[10px] uppercase">
                        Opposing Party / Respondent
                      </label>
                      <input
                        type="text"
                        value={draftingRespondentName}
                        onChange={(e) => setDraftingRespondentName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-black dark:text-white text-[10px] uppercase">
                        Case / Subject Matter
                      </label>
                      <input
                        type="text"
                        value={draftingSubject}
                        onChange={(e) => setDraftingSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3 pt-1">
                      <button
                        type="button"
                        onClick={handleRunClientDrafting}
                        disabled={isDrafting}
                        className="w-full py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isDrafting ? "Drafting Pleading..." : "Draft Pleading"}</span>
                      </button>
                    </div>
                  </div>

                  {draftedResult && (
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-black dark:text-white" />
                          <span className="font-bold text-xs text-black dark:text-white">{draftedResult.title}</span>
                          <span className="text-[10px] font-mono text-zinc-500">({draftedResult.wordCount} words)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(draftedResult.content, "client_draft")}
                          className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedBadge === "client_draft" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedBadge === "client_draft" ? "Copied!" : "Copy Pleading"}</span>
                        </button>
                      </div>
                      <div className="font-mono text-xs leading-relaxed text-black dark:text-white whitespace-pre-line max-h-[300px] overflow-y-auto p-3 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800">
                        {draftedResult.content}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* SPECIALIZED SUITE: PRECEDENT SUMMARIZER (Research / Analyze) */}
              {/* ========================================================= */}
              {(copilotMode === "Research" || copilotMode === "Analyze") && (
                <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-900">
                    <div>
                      <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        Kerala High Court &amp; Supreme Court Precedent Summarizer
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Instantly extracts Coram, binding Ratio Decidendi, operative order, and plain-language client explainer.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {[
                        { q: "2024 (2) KHC 401 (DB)", label: "Valsamma v. KSEB" },
                        { q: "Dashrath Rupsingh", label: "Dashrath (S.138 NI Act)" },
                        { q: "Vineeta Sharma", label: "Vineeta (Daughters Rights)" },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setJudgmentCitationQuery(item.q);
                            handleRunClientPrecedentSummary(item.q);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={judgmentCitationQuery}
                      onChange={(e) => setJudgmentCitationQuery(e.target.value)}
                      placeholder="Enter legal citation or case title (e.g. 2024 (2) KHC 401, Vineeta Sharma)..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleRunClientPrecedentSummary()}
                      disabled={isSummarizingJudgment || !judgmentCitationQuery.trim()}
                      className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isSummarizingJudgment ? "Summarizing..." : "Summarize Ratio"}</span>
                    </button>
                  </div>

                  {judgmentSummary && (
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                        <span className="font-bold text-black dark:text-white text-sm">
                          {judgmentSummary.caseTitle}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono font-bold">
                          {judgmentSummary.citation}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold text-black dark:text-white flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5" />
                          Binding Ratio Decidendi (Core Legal Principle)
                        </span>
                        <p className="text-xs text-zinc-800 dark:text-zinc-200 font-serif italic leading-relaxed pt-1">
                          "{judgmentSummary.ratioDecidendi}"
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold text-zinc-600 dark:text-zinc-300 block">
                          Client Plain-Language Takeaway:
                        </span>
                        <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
                          {judgmentSummary.clientTakeaway}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Conversation Canvas */}
              <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs min-h-[340px] flex flex-col justify-between">
                <div className="space-y-4">
                  {copilotConversation.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shrink-0 mt-1">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}
                      <div
                        className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-3 ${
                          msg.role === "user"
                            ? "bg-black text-white dark:bg-white dark:text-black font-medium max-w-2xl sm:max-w-3xl ml-auto"
                            : "bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white flex-1 w-full max-w-5xl xl:max-w-6xl"
                        }`}
                      >
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pb-1">
                            {msg.attachments.map((att, aIdx) => (
                              <div key={aIdx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black text-[11px] font-mono">
                                <FileText className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[150px]">{att.name}</span>
                                <span className="opacity-70">({att.size})</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {msg.role === "user" && (msg.isAgentMode || msg.isDeepResearch) && (
                          <div className="flex items-center gap-1.5 pt-0.5 pb-1">
                            {msg.isAgentMode && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800">
                                Agent Mode
                              </span>
                            )}
                            {msg.isDeepResearch && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800">
                                Deep Research
                              </span>
                            )}
                          </div>
                        )}

                        <div className="whitespace-pre-line">{msg.text}</div>

                        {msg.agentSteps && msg.agentSteps.length > 0 && (
                          <div className="p-3.5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2.5 my-2 shadow-2xs">
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
                              <span className="text-[11px] font-mono uppercase font-bold text-black dark:text-white flex items-center gap-1.5">
                                <Bot className="w-3.5 h-3.5" />
                                Autonomous Agent Execution Pipeline (4/4 Completed)
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
                                Verified
                              </span>
                            </div>
                            <div className="space-y-2 text-xs">
                              {msg.agentSteps.map((step, sIdx) => (
                                <div key={sIdx} className="space-y-0.5">
                                  <div className="font-bold text-black dark:text-white flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                                    <span>{step.title}</span>
                                  </div>
                                  <p className="text-[11px] text-zinc-500 pl-5">{step.detail}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {msg.deepResearchData && (
                          <div className="p-3.5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 my-2 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-900">
                              <span className="text-[11px] font-mono uppercase font-bold text-black dark:text-white flex items-center gap-1.5">
                                <Compass className="w-3.5 h-3.5" />
                                Deep Legal Research Corpus (Verified)
                              </span>
                              <div className="flex items-center gap-2 text-[10px] font-mono">
                                <span className="text-zinc-500">{msg.deepResearchData.scannedSources} sources scanned</span>
                                <span className="font-bold text-black dark:text-white">• {msg.deepResearchData.precedents.length} key precedents</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                              {msg.deepResearchData.precedents.map((prec, pIdx) => (
                                <div key={pIdx} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-black dark:text-white font-mono text-[11px]">{prec.citation}</span>
                                    <span className="text-[10px] text-zinc-500">{prec.court}</span>
                                  </div>
                                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-serif italic">"{prec.ratio}"</p>
                                  <div className="text-[10px] font-mono text-zinc-500 pt-0.5">Treatment: {prec.treatment}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isCopilotExecuting && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shrink-0">
                        <Bot className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-black dark:bg-white animate-ping" />
                        <span>
                          {copilotAgentMode && copilotDeepResearch
                            ? "Agent synthesizing deep research across Kerala High Court & Supreme Court dockets..."
                            : copilotAgentMode
                            ? "Agent executing multi-step procedural reasoning and limitation audit..."
                            : copilotDeepResearch
                            ? "Deep research engine scanning binding precedent ratios and central bare acts..."
                            : "Analyzing legal proposition and cross-referencing statutory authorities..."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Prompts */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex flex-wrap gap-2 text-xs">
                  <span className="text-zinc-400 font-mono text-[11px] self-center">Prompt chips:</span>
                  {[
                    "Kerala High Court stay grounds on electricity lines",
                    "BNS Section 304A IPC equivalent comparison",
                    "Section 138 NI Act statutory notice 15-day period",
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCopilotInput(chip)}
                      className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chatbot Prompt Console with '+' Symbol (1. Upload attachment, 2. Agent mode, 3. Deep research) */}
              <div className="rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 shadow-xs space-y-3">
                {/* Uploaded Attachments preview pills */}
                {copilotAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-1">
                    {copilotAttachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                        <span className="font-semibold text-black dark:text-white truncate max-w-[180px]">{file.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">({file.size})</span>
                        <button
                          type="button"
                          onClick={() => setCopilotAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          className="ml-1 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                          title="Remove attachment"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Main Textarea Query Input */}
                <textarea
                  rows={2}
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleExecuteCopilotQuery();
                    }
                  }}
                  placeholder={
                    copilotAgentMode && copilotDeepResearch
                      ? "Ask Copilot with [Agent Mode + Deep Research]: Enter complex legal proposition for autonomous research & drafting..."
                      : copilotAgentMode
                      ? "Ask Copilot with [Agent Mode]: Enter objective for multi-step autonomous execution..."
                      : copilotDeepResearch
                      ? "Ask Copilot with [Deep Research]: Search deep precedent ratios across SC & Kerala High Court..."
                      : `Ask Copilot in [${copilotMode}] mode: e.g. What are the essential grounds to contest high tension line realignment in Kerala?`
                  }
                  className="w-full bg-transparent text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none resize-none leading-relaxed"
                />

                {/* Action Toolbar inside the prompt console */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-zinc-100 dark:border-zinc-900">
                  {/* Left: Plus Button with Popup Menu (1. Upload attachment, 2. Agent mode, 3. Deep research) */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={copilotFileInputRef}
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                      onChange={handleCopilotFileAttach}
                      className="hidden"
                    />

                    {/* The '+' Symbol Button with Popover */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setCopilotPlusMenuOpen(!copilotPlusMenuOpen)}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                          copilotPlusMenuOpen
                            ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs"
                            : "border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white bg-zinc-50 dark:bg-zinc-900"
                        }`}
                        title="Add context (Attachment, Agent mode, Deep research)"
                      >
                        <Plus className={`w-4 h-4 transition-transform duration-200 ${copilotPlusMenuOpen ? "rotate-45" : ""}`} />
                      </button>

                      {/* Dropdown Menu Popup */}
                      {copilotPlusMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setCopilotPlusMenuOpen(false)}
                          />
                          <div className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-1.5 z-30 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                            {/* 1. Upload attachment */}
                            <button
                              type="button"
                              onClick={() => {
                                setCopilotPlusMenuOpen(false);
                                copilotFileInputRef.current?.click();
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-black dark:text-white cursor-pointer group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                <Paperclip className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1">
                                <span className="block font-bold">1. Upload attachment</span>
                                <span className="text-[10px] text-zinc-500 font-normal">PDF, case brief, pleadings, deed</span>
                              </div>
                            </button>

                            {/* 2. Agent mode */}
                            <button
                              type="button"
                              onClick={() => {
                                setCopilotAgentMode(!copilotAgentMode);
                                setCopilotPlusMenuOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-black dark:text-white cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                  <Bot className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <span className="block font-bold">2. Agent mode</span>
                                  <span className="text-[10px] text-zinc-500 font-normal">Multi-step autonomous execution</span>
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                copilotAgentMode
                                  ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black"
                                  : "border-zinc-300 dark:border-zinc-700"
                              }`}>
                                {copilotAgentMode && <Check className="w-2.5 h-2.5" />}
                              </div>
                            </button>

                            {/* 3. Deep research */}
                            <button
                              type="button"
                              onClick={() => {
                                setCopilotDeepResearch(!copilotDeepResearch);
                                setCopilotPlusMenuOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-black dark:text-white cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                  <Compass className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <span className="block font-bold">3. Deep research</span>
                                  <span className="text-[10px] text-zinc-500 font-normal">Precedent &amp; ratio verification</span>
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                copilotDeepResearch
                                  ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black"
                                  : "border-zinc-300 dark:border-zinc-700"
                              }`}>
                                {copilotDeepResearch && <Check className="w-2.5 h-2.5" />}
                              </div>
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Active Mode Pills (shown when toggled on) */}
                    {copilotAgentMode && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black shadow-xs">
                        <Bot className="w-3.5 h-3.5" />
                        <span>Agent Mode</span>
                        <button
                          type="button"
                          onClick={() => setCopilotAgentMode(false)}
                          className="hover:opacity-75 cursor-pointer ml-0.5"
                          title="Disable Agent Mode"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {copilotDeepResearch && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black shadow-xs">
                        <Compass className="w-3.5 h-3.5" />
                        <span>Deep Research</span>
                        <button
                          type="button"
                          onClick={() => setCopilotDeepResearch(false)}
                          className="hover:opacity-75 cursor-pointer ml-0.5"
                          title="Disable Deep Research"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {/* If no feature active, subtle helper hint */}
                    {!copilotAgentMode && !copilotDeepResearch && copilotAttachments.length === 0 && (
                      <span className="text-[11px] text-zinc-400 select-none hidden sm:inline">
                        Click + to attach files, enable Agent mode, or Deep research
                      </span>
                    )}
                  </div>

                  {/* Right: Execute Button */}
                  <button
                    type="button"
                    onClick={handleExecuteCopilotQuery}
                    disabled={!copilotInput.trim() && copilotAttachments.length === 0}
                    className="px-5 py-2 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:opacity-40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ml-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Execute</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: Productivity & Business Modules                          */}
          {/* ============================================================== */}
          {isProductivity && (
            <ProductivityView />
          )}

          {isBusiness && (
            <BusinessView />
          )}

          {isAnalytics && (
            <AnalyticsView />
          )}

          {/* ============================================================== */}
          {/* VIEW: ERP & Networks Modules (My Hub / My Teams)               */}
          {/* ============================================================== */}
          {(activeTab === "my-hub" || activeTab === "my-teams") && (
            <ERPDashboardView
              onNavigateTab={(t) => setActiveTab(t)}
              hideTopBanner={true}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW: Tasks & Timeline (Case Timeline & Next Steps)            */}
          {/* ============================================================== */}
          {(activeTab === "task-and-timeline" ||
            activeTab === "tasks-and-timeline" ||
            activeTab === "timeline") && (
            <CaseTimelineView
              initialMatter={selectedMatter}
              onOpenBookingModal={(counsel) => {
                const adv = mockAdvocates[0];
                handleOpenConsultation(adv);
              }}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW: Payments and Invoices (Milestone 2 Realtime Sync)         */}
          {/* ============================================================== */}
          {activeTab === "payments-and-invoice" && (
            <InvoicesAndPaymentsView
              token={typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || "dev_token" : "dev_token"}
              onInvoicePaid={loadCitizenData}
            />
          )}

        </div>

      </main>

      {/* =========================================================================
          RIGHT SIDEBAR DOCK (Kept Functional for Fast Access)
      ========================================================================= */}
      <div
        className={`relative z-30 flex shrink-0 transition-all duration-300 ease-in-out ${
          isRightbarActive ? "w-14" : "w-10 opacity-70 hover:opacity-100"
        }`}
        onMouseEnter={() => setRightbarHovered(true)}
        onMouseLeave={() => setRightbarHovered(false)}
      >
        <aside className="w-full h-full bg-white dark:bg-black border-l border-zinc-200 dark:border-zinc-800 flex flex-col justify-between py-3 shadow-sm select-none">
          
          {/* Top Pin Toggle */}
          <div className="flex items-center justify-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setRightbarPinned(!rightbarPinned)}
              title={rightbarPinned ? "Unpin Quick Dock" : "Pin Quick Dock"}
              className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              {rightbarPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Middle Fast Launcher Icons */}
          <div className="flex-1 overflow-y-auto no-scrollbar w-full flex flex-col items-center gap-1.5 px-1 py-1">
            {rightbarSections.map((sec, secIdx) => (
              <React.Fragment key={secIdx}>
                {secIdx > 0 && <div className="w-4 h-px bg-zinc-200 dark:border-zinc-800 my-1" />}
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      onMouseEnter={(e) =>
                        showTooltip(e, item.label, sec.category, item.whatItDoes)
                      }
                      onMouseLeave={hideTooltip}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                          : "text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Bottom Settings & Theme */}
          <div className="flex flex-col items-center gap-1 w-full px-1 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <ThemeToggle />
          </div>

        </aside>
      </div>

      {/* Floating Tooltip Card */}
      {hoveredTooltip && (
        <div
          style={{ top: hoveredTooltip.top }}
          className="fixed right-16 -translate-y-1/2 w-64 p-3 bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-2xl z-50 border border-zinc-700 dark:border-zinc-300 pointer-events-none transition-all duration-150"
        >
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-zinc-700 dark:border-zinc-300">
            <span className="font-bold text-xs">{hoveredTooltip.label}</span>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 dark:bg-zinc-200 text-zinc-300 dark:text-zinc-700 font-bold">
              {hoveredTooltip.category}
            </span>
          </div>
          <p className="text-[11px] text-zinc-300 dark:text-zinc-700 leading-snug">
            {hoveredTooltip.whatItDoes}
          </p>
        </div>
      )}

      {/* Modals */}
      {/* Settings Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-black dark:text-white">Citizen Portal Settings</h3>
              <button onClick={() => setSettingsModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Notification Channel</label>
                <select className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <option>WhatsApp + SMS + In-App (Recommended)</option>
                  <option>Email &amp; In-App Only</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Primary State Jurisdiction</label>
                <select className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <option>Kerala (High Court of Kerala)</option>
                  <option>Delhi (Delhi High Court)</option>
                  <option>Maharashtra (Bombay High Court)</option>
                </select>
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {notificationsOpen && (
        <div className="fixed top-16 right-6 z-50 w-80 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-bold text-black dark:text-white">Portal Alerts</span>
            <button onClick={() => setNotificationsOpen(false)}>
              <X className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="font-bold block">WP(C) 19482/2024 Listed</span>
              <p className="text-[11px] text-zinc-500">Court Hall 2A item listed for 15 Nov 2026.</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-black dark:text-white">Upload to Encrypted Vault</h3>
              <button onClick={() => setUploadModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={uploadDocTitle}
                  onChange={(e) => setUploadDocTitle(e.target.value)}
                  placeholder="e.g. Electricity Board Bill Exhibit P2, Land Title Deed"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Category</label>
                <select
                  value={uploadDocCategory}
                  onChange={(e) => setUploadDocCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                >
                  <option>Court Petition / Writ</option>
                  <option>Property Deed / Revenue</option>
                  <option>Vakalatnama</option>
                  <option>Certified Court Order</option>
                  <option>Statutory Demand Notice</option>
                </select>
              </div>
              <div className="p-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-center space-y-1">
                <Upload className="w-5 h-5 mx-auto text-zinc-400" />
                <span className="text-zinc-500 block font-medium">Select PDF or Document scan</span>
                <span className="text-[10px] text-zinc-400">PDF, JPG, PNG up to 25MB</span>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingDoc || !uploadDocTitle.trim()}
                  className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isUploadingDoc ? "Uploading..." : "Save to Vault"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consultation Modal */}
      <ConsultationAndBookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          loadCitizenData();
        }}
        advocate={selectedAdvocate}
        defaultTab={bookingDefaultTab}
      />

    </div>
  );
}
