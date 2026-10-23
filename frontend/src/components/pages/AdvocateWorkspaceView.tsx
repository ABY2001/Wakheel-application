"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AdvocateRegistrationWizard } from "@/components/advocate/AdvocateRegistrationWizard";
import {
  AdvocateOnboardingQuestionnaire,
  AdvocateOnboardingData,
} from "@/components/advocate/AdvocateOnboardingQuestionnaire";
import { DocIntelligenceCard } from "@/components/DocIntelligenceCard";
import { CaseChronologyBuilder } from "@/components/advocate/CaseChronologyBuilder";
import { ChamberVoiceDictation } from "@/components/advocate/ChamberVoiceDictation";
import { DocumentVaultView } from "@/components/advocate/DocumentVaultView";
import { LegalDraftingStudioView } from "@/components/advocate/LegalDraftingStudioView";
import { CasePreparationView } from "@/components/advocate/CasePreparationView";
import { ContractIntelligenceView } from "@/components/advocate/ContractIntelligenceView";
import { AutonomousAgentsView } from "@/components/advocate/AutonomousAgentsView";
import { BrandLogo } from "@/components/BrandLogo";
import { ElectronicConsentView } from "@/components/advocate/ElectronicConsentView";
import { ERPDashboardView } from "@/components/advocate/ERPDashboardView";
import { WorkForceView } from "@/components/advocate/WorkForceView";
import { CollabView } from "@/components/advocate/CollabView";
import { ERPModulesView } from "@/components/advocate/ERPModulesView";
import { AnalyticsView } from "@/components/advocate/AnalyticsView";
import { ProductivityView } from "@/components/advocate/ProductivityView";
import { AdvocateConsultationsView } from "@/components/advocate/AdvocateConsultationsView";
import { AdvocateInboxView } from "@/components/advocate/AdvocateInboxView";
import { AdvocateClientsView } from "@/components/advocate/AdvocateClientsView";
import { BusinessView } from "@/components/advocate/BusinessView";
import { PromoView } from "@/components/advocate/PromoView";
import { CorporateSuiteView } from "@/components/advocate/CorporateSuiteView";
import { ThemeToggle } from "@/components/ThemeToggle";
import { advocateApi, copilotApi } from "@/lib/api";
import {
  FirmProfile,
  ActiveWorkspace,
  DEFAULT_DEMO_FIRM,
} from "@/components/firm/firmTypes";
import { JoinFirmModal } from "@/components/firm/JoinFirmModal";
import { WorkspaceSwitcher } from "@/components/firm/WorkspaceSwitcher";
import {
  Home,
  LayoutDashboard,
  Briefcase,
  Sparkles,
  FileEdit,
  Globe,
  Languages,
  Search,
  BookOpen,
  Bot,
  FolderLock,
  FileText,
  Layers,
  CheckSquare,
  PenTool,
  StickyNote,
  Calendar,
  CheckCircle2,
  Clock,
  Activity,
  GraduationCap,
  Megaphone,
  FlaskConical,
  Target,
  Award,
  Cpu,
  UserPlus,
  Users,
  Share2,
  Compass,
  MessagesSquare,
  UserCheck,
  HeartHandshake,
  CreditCard,
  Grid,
  BarChart3,
  FileSpreadsheet,
  PanelLeftClose,
  PanelLeft,
  Scale,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  FolderOpen,
  Phone,
  Bell,
  Settings,
  HelpCircle,
  X,
  PhoneCall,
  Pin,
  PinOff,
  History,
  ListChecks,
  MessageSquare,
  AlignLeft,
  Stamp,
  Building2,
  Calculator,
  Shield,
  ClipboardCheck,
  Landmark,
  Plus,
  Mail,
  FileCheck,
  Video,
  Send,
  Eye,
  Filter,
  Download,
  ExternalLink,
  Paperclip,
  Copy,
  Check,
  Mic,
} from "lucide-react";

interface FloatingTooltipData {
  label: string;
  category: string;
  whatItDoes: string;
  top: number;
}

export function AdvocateWorkspaceView() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("audit-history");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [selectedMatter, setSelectedMatter] = useState("WP(C) 19482/2024 — Gopakumar v. KSEB");
  const [lang, setLang] = useState<"en" | "ml">("en");

  // Modals
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [newMatterModalOpen, setNewMatterModalOpen] = useState(false);

  // First-Login Profile Setup Questionnaire State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [advocateProfile, setAdvocateProfile] = useState<AdvocateOnboardingData | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Live matters & leads state from advocateApi
  const [liveLeads, setLiveLeads] = useState<any[]>([]);
  const [liveMatters, setLiveMatters] = useState<any[]>([]);
  const [acceptingLeadId, setAcceptingLeadId] = useState<string | null>(null);

  // Milestone 2 Sync: Timeline update modal state
  const [timelineModalMatter, setTimelineModalMatter] = useState<any | null>(null);
  const [timelineEventTitle, setTimelineEventTitle] = useState("");
  const [timelineEventRemarks, setTimelineEventRemarks] = useState("");
  const [timelineEventStage, setTimelineEventStage] = useState("Interim Stay / Injunction Granted");
  const [isPostingTimeline, setIsPostingTimeline] = useState(false);

  // Firm & Multi-Workspace State
  const [activeWorkspace, setActiveWorkspace] = useState<ActiveWorkspace>({
    type: "chamber",
  });
  const [userFirms, setUserFirms] = useState<FirmProfile[]>([DEFAULT_DEMO_FIRM]);
  const [joinFirmModalOpen, setJoinFirmModalOpen] = useState(false);

  // Indian Legal Research Engine State
  const [researchSegment, setResearchSegment] = useState<"indian-legal-research" | "top-stories" | "news-updates" | "articles" | "digest">("indian-legal-research");
  const [researchCourtFilter, setResearchCourtFilter] = useState<"ALL" | "Supreme Court" | "High Court of Kerala" | "Parliament">("ALL");
  const [researchQuery, setResearchQuery] = useState("");

  // AI Legal Copilot State & Features (Upload attachment, Agent mode, Deep Research)
  interface CopilotMessage {
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
  const [copilotConversation, setCopilotConversation] = useState<CopilotMessage[]>([
    {
      role: "assistant",
      text: "Namaskaram Adv. Meera. I am your Indian Legal Research Copilot. I can evaluate Kerala High Court ratios, examine central enactments, identify conflicting precedents, or draft grounds of petition. What proposition shall we examine?",
      timestamp: "Just now",
    },
  ]);

  // ============================================================================
  // MILESTONE 3: AI LEGAL COPILOT SUITE STATE
  // ============================================================================
  // A. High Court Vernacular Translation Engine (Rule 32 Kerala High Court)
  const [translationSourceText, setTranslationSourceText] = useState(
    "ആധാരം നമ്പർ 1842/2018 പ്രകാരം വസ്തു കൈവശാവകാശ സർട്ടിഫിക്കറ്റ് ലഭിച്ചിട്ടുണ്ട്. വില്ലേജ് ഓഫീസിൽ കരം തീർത്ത രസീത് ഉണ്ട്. സ്ഥലത്ത് മഹസർ തയ്യാറാക്കി. വൈദ്യുതി ലൈൻ മാറ്റിവെക്കണമെന്ന് ആവശ്യപ്പെട്ട് ആക്ഷേപം നൽകി."
  );
  const [translationSourceLang, setTranslationSourceLang] = useState<"ml" | "en">("ml");
  const [translationTargetLang, setTranslationTargetLang] = useState<"en" | "ml">("en");
  const [translationDocType, setTranslationDocType] = useState("land_revenue");
  const [translatedResult, setTranslatedResult] = useState("");
  const [translationGlossary, setTranslationGlossary] = useState<
    Array<{ vernacularTerm: string; formalEnglishTerm: string; definition: string; statuteReference: string }>
  >([]);
  const [translationCertificate, setTranslationCertificate] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState<string | null>(null);

  // B. Automated Statutory Notice & Writ Drafter
  const [draftingTemplate, setDraftingTemplate] = useState<
    "ni_138_demand_notice" | "wpc_writ_petition" | "injunction_plaint"
  >("ni_138_demand_notice");
  const [draftingClientName, setDraftingClientName] = useState("Gopakumar Nambiar");
  const [draftingRespondentName, setDraftingRespondentName] = useState(
    "Varghese Builders & Developers Pvt. Ltd."
  );
  const [draftingChequeNumber, setDraftingChequeNumber] = useState("491028");
  const [draftingChequeAmount, setDraftingChequeAmount] = useState("5,00,000");
  const [draftingBankName, setDraftingBankName] = useState("State Bank of India, Aluva");
  const [draftingCaseNumber, setDraftingCaseNumber] = useState("WP(C) 19482/2024");
  const [draftingSubject, setDraftingSubject] = useState(
    "Unlawful diversion of high-tension electricity transmission line across registered agricultural holding"
  );
  const [draftedResult, setDraftedResult] = useState<{
    title: string;
    content: string;
    wordCount: number;
  } | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);

  // C. Precedent & Judgment Summarizer
  const [judgmentQuery, setJudgmentQuery] = useState("2024 (2) KHC 401 (DB)");
  const [judgmentSummary, setJudgmentSummary] = useState<any | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Corporate Suite Sub-Tab State
  const [corpActiveTab, setCorpActiveTab] = useState<"ip-manager" | "compliances" | "contracts" | "documents" | "due-diligence">("ip-manager");

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("wakheel_advocate_profile");
      if (savedProfile) {
        setAdvocateProfile(JSON.parse(savedProfile));
      }
      const isOnboarded = localStorage.getItem("wakheel_advocate_onboarded");
      const isFirstSignup = localStorage.getItem("wakheel_advocate_first_signup");

      if (isFirstSignup === "true" && isOnboarded !== "true") {
        setShowOnboarding(true);
      }

      const storedFirms = localStorage.getItem("wakheel_user_firms");
      if (storedFirms) {
        setUserFirms(JSON.parse(storedFirms));
      } else {
        localStorage.setItem("wakheel_user_firms", JSON.stringify([DEFAULT_DEMO_FIRM]));
        setUserFirms([DEFAULT_DEMO_FIRM]);
      }

      const storedWorkspace = localStorage.getItem("wakheel_active_workspace");
      if (storedWorkspace) {
        setActiveWorkspace(JSON.parse(storedWorkspace));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Synchronize activeTab with researchSegment for Indian Legal Research Engine
  useEffect(() => {
    if (activeTab === "indian-legal-research") setResearchSegment("indian-legal-research");
    else if (activeTab === "top-stories") setResearchSegment("top-stories");
    else if (activeTab === "news-updates") setResearchSegment("news-updates");
    else if (activeTab === "research-articles") setResearchSegment("articles");
    else if (activeTab === "wakheel-digest") setResearchSegment("digest");
  }, [activeTab]);

  // Load live matters and incoming intake leads for advocate workspace
  useEffect(() => {
    let isMounted = true;
    async function loadMattersAndLeads() {
      try {
        const [leadsRes, mattersRes] = await Promise.allSettled([
          advocateApi.getIncomingLeads(),
          advocateApi.getMatters(),
        ]);
        if (isMounted) {
          if (leadsRes.status === "fulfilled" && leadsRes.value?.success) {
            setLiveLeads(leadsRes.value.leads || []);
          }
          if (mattersRes.status === "fulfilled" && mattersRes.value?.success) {
            setLiveMatters(mattersRes.value.matters || []);
          }
        }
      } catch (err) {
        console.warn("Failed to load matters or leads:", err);
      }
    }
    loadMattersAndLeads();
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const handleAcceptLead = async (leadId: string) => {
    try {
      setAcceptingLeadId(leadId);
      const res = await advocateApi.acceptLead(leadId);
      if (res && res.success) {
        const [leadsRes, mattersRes] = await Promise.allSettled([
          advocateApi.getIncomingLeads(),
          advocateApi.getMatters(),
        ]);
        if (leadsRes.status === "fulfilled" && leadsRes.value?.success) {
          setLiveLeads(leadsRes.value.leads || []);
        }
        if (mattersRes.status === "fulfilled" && mattersRes.value?.success) {
          setLiveMatters(mattersRes.value.matters || []);
        }
      }
    } catch (err) {
      console.error("Failed to accept lead:", err);
    } finally {
      setAcceptingLeadId(null);
    }
  };

  const handlePostTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineModalMatter || !timelineEventTitle.trim()) return;
    try {
      setIsPostingTimeline(true);
      const res = await advocateApi.addTimelineEvent(timelineModalMatter._id, {
        title: timelineEventTitle.trim(),
        remarks: timelineEventRemarks.trim(),
        stage: timelineEventStage,
      });
      if (res && res.success) {
        const mattersRes = await advocateApi.getMatters();
        if (mattersRes.success) setLiveMatters(mattersRes.matters || []);
        setTimelineModalMatter(null);
        setTimelineEventTitle("");
        setTimelineEventRemarks("");
      }
    } catch (err) {
      console.error("Failed to post timeline update:", err);
    } finally {
      setIsPostingTimeline(false);
    }
  };

  // Rightbar hover & pin states (Easily accessible hover dock)
  const [rightbarHovered, setRightbarHovered] = useState(false);
  const [rightbarPinned, setRightbarPinned] = useState(false);
  const isRightbarActive = rightbarPinned || rightbarHovered;

  // Unclipped floating tooltip state for rightbar icons
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

  // =========================================================================
  // LEFTBAR MENU SECTIONS (Exactly matching the user's structured request)
  // =========================================================================
  const menuSections = [
    {
      category: "PRIMARY",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          subtitle: "Chamber ERP overview & KPI tiles",
          whatItDoes: "Displays active matters KPI cards, court registry docket feeds, and chamber operations summary.",
          icon: LayoutDashboard,
        },
        {
          id: "matters",
          label: "Matter intelligence",
          subtitle: "Case files, triage & court listings",
          whatItDoes: "Triages incoming client representation leads and organizes High Court active dockets.",
          icon: Briefcase,
        },
        {
          id: "clients",
          label: "Clients",
          subtitle: "Citizen directory & consultation roster",
          whatItDoes: "Manages verified citizen profiles, consultation appointments, and retainer contracts.",
          icon: Users,
        },
      ],
    },
    {
      category: "RESEARCH",
      items: [
        {
          id: "indian-legal-research",
          label: "Indian Legal research",
          subtitle: "SC & Kerala HC discovery engine",
          whatItDoes: "Discovers binding precedent ratios, negative judicial treatment, and legislative amendments.",
          icon: Search,
        },
        {
          id: "top-stories",
          label: "TOP stories",
          subtitle: "Supreme Court & High Court lead cases",
          whatItDoes: "Curates landmark constitutional rulings, full-bench orders, and daily judicial highlights.",
          icon: Sparkles,
        },
        {
          id: "news-updates",
          label: "News updates",
          subtitle: "Real-time court causelists & news",
          whatItDoes: "Live causelist rosters, judge designation gazettes, and court registry notification feeds.",
          icon: Globe,
        },
        {
          id: "research-articles",
          label: "Articles",
          subtitle: "Scholarly commentary & case notes",
          whatItDoes: "Detailed analytical write-ups on BNS-BNSS concordance and Commercial Courts Act precedents.",
          icon: FileText,
        },
        {
          id: "wakheel-digest",
          label: "WAKHEEL.COM DIGEST",
          subtitle: "Curated weekly precedent digest",
          whatItDoes: "Weekly digest of ratio decidendi indexed by statute sections and bench composition.",
          icon: BookOpen,
        },
      ],
    },
    {
      category: "AI COPILOT",
      items: [
        {
          id: "ai-copilot",
          label: "AI Legal copilot",
          subtitle: "Multi-modal Indian law copilot",
          whatItDoes: "Co-counsel interface with 7 modes: Ask, Research, Analyze, Draft, Review, Verify, and Translate.",
          icon: Bot,
        },
      ],
    },
    {
      category: "AI LEGAL AGENTS",
      items: [
        {
          id: "workflows",
          label: "Work Flows",
          subtitle: "Automated case pipelines & scrapers",
          whatItDoes: "Deploys autonomous pipelines for morning causelist scrapers and docket status tracking.",
          icon: Layers,
        },
        {
          id: "chamber-skills",
          label: "Chamber Skills",
          subtitle: "Agent capabilities & toolsets",
          whatItDoes: "Configures automated BNS cross-section checkers, caveat monitors, and stamp duty auditors.",
          icon: Target,
        },
      ],
    },
    {
      category: "DOCUMENTATION",
      items: [
        {
          id: "legal-drafting",
          label: "Legal Drafting",
          subtitle: "Pleadings, plaints & petitions",
          whatItDoes: "Generates formatted writ petitions, statutory notices, caveats, and appellate rejoinders.",
          icon: FileEdit,
        },
        {
          id: "contract-intelligence",
          label: "Contract Intelligence",
          subtitle: "Redlining & indemnity audit",
          whatItDoes: "Audits commercial agreements, flags unilateral arbitration clauses, and scores risk.",
          icon: FileCheck,
        },
        {
          id: "case-preparation",
          label: "Case preparation",
          subtitle: "Evidence bundle & witness cross",
          whatItDoes: "Prepares deposition outlines, cross-examination question banks, and bench briefing dossiers.",
          icon: FolderOpen,
        },
        {
          id: "chronology-facts",
          label: "Chronology & facts",
          subtitle: "Event timeline extraction from PDFs",
          whatItDoes: "Extracts chronological facts from case papers and maps dates against statutory limitations.",
          icon: History,
        },
        {
          id: "vault",
          label: "Document vault",
          subtitle: "256-bit encrypted file vault",
          whatItDoes: "Stores certified true copies, scanned case bundles, and privileged work product.",
          icon: FolderLock,
        },
        {
          id: "office-suite",
          label: "Office suit",
          subtitle: "Chamber stationery & formatting",
          whatItDoes: "High Court pleading margins, watermarked chamber stationery, and standard templates.",
          icon: Layers,
        },
        {
          id: "compliance",
          label: "Compliance",
          subtitle: "Bar Council ethics check",
          whatItDoes: "Runs conflict-of-interest checks, Bar Council code audits, and filing compliance inspections.",
          icon: CheckSquare,
        },
        {
          id: "esign",
          label: "E-signature",
          subtitle: "5-clause electronic consent suite",
          whatItDoes: "Verifies digital candidate certificates and gathers tamper-evident e-signatures.",
          icon: PenTool,
        },
      ],
    },
    {
      category: "PRODUCTIVITY",
      items: [
        {
          id: "notes",
          label: "Notes",
          subtitle: "Chamber memos & brief notes",
          whatItDoes: "Records witness cross points, judge observations, and chamber memos.",
          icon: StickyNote,
        },
        {
          id: "issues-authorities",
          label: "Issues and Authorities",
          subtitle: "Proposition & citation synthesis",
          whatItDoes: "Organizes legal issues with supporting citations, statutory provisions, and bench counter-arguments.",
          icon: Scale,
        },
        {
          id: "calendar",
          label: "Deadlines calendar",
          subtitle: "Limitation periods & court fixtures",
          whatItDoes: "Tracks High Court listing dates, limitation expiry alerts, and filing deadlines.",
          icon: Calendar,
        },
        {
          id: "appointments",
          label: "Appointments",
          subtitle: "Video & chamber client meetings",
          whatItDoes: "Schedules video consultations, client chamber conferences, and senior counsel briefings.",
          icon: Clock,
        },
        {
          id: "time-sheet",
          label: "Time sheet",
          subtitle: "Court appearance billing timers",
          whatItDoes: "Tracks billable courtroom appearance hours, conference timers, and drafting increments.",
          icon: Clock,
        },
        {
          id: "case-tracker",
          label: "Case Tracker",
          subtitle: "16-digit CNR live docket tracking",
          whatItDoes: "Synchronizes directly with eCourts to track stage of case, next hearing dates, and daily orders.",
          icon: Activity,
        },
        {
          id: "practice-ai",
          label: "Practice with AI",
          subtitle: "Moot & oral argument simulation",
          whatItDoes: "Simulates rigorous courtroom bench questions and evaluates oral argument rebuttals.",
          icon: GraduationCap,
        },
        {
          id: "taskmite",
          label: "Taskmite",
          subtitle: "Chamber task delegation",
          whatItDoes: "Manages urgent chamber task lists, filing deadlines, and associate assignments.",
          icon: CheckCircle2,
        },
      ],
    },
    {
      category: "COMMUNICATIONS",
      items: [
        {
          id: "inbox",
          label: "Inbox",
          subtitle: "Official court notices & email",
          whatItDoes: "Central repository for court registry notices, caveat notices, and client emails.",
          icon: Mail,
        },
        {
          id: "messages",
          label: "Messages",
          subtitle: "Encrypted client & advocate chats",
          whatItDoes: "End-to-end encrypted messaging with clients and briefing junior associates.",
          icon: MessageSquare,
        },
        {
          id: "chats",
          label: "Chats",
          subtitle: "Chamber internal associate threads",
          whatItDoes: "Real-time communication channels for chamber associate teams and senior advocates.",
          icon: MessagesSquare,
        },
        {
          id: "video-meet",
          label: "Video meet",
          subtitle: "HD encrypted client consults",
          whatItDoes: "Launches encrypted virtual chamber consultations with screen sharing and recording.",
          icon: Video,
        },
        {
          id: "recordings",
          label: "Voice Dictation",
          subtitle: "Instant audio notes & speech-to-text",
          whatItDoes: "Instant courtroom audio dictations, speech-to-text legal transcripts, and hearing memos.",
          icon: Mic,
        },
      ],
    },
    {
      category: "KNOWLEDGE BASE",
      items: [
        {
          id: "playbooks",
          label: "Play Books",
          subtitle: "Chamber SOPs & procedural guides",
          whatItDoes: "Standard operating procedures for writ petitions, caveats, and civil appeals.",
          icon: BookOpen,
        },
        {
          id: "kb-articles",
          label: "Articles",
          subtitle: "Internal commentary & law reviews",
          whatItDoes: "Repository of internal chamber analysis on landmark judgments and legislative shifts.",
          icon: FileText,
        },
        {
          id: "library",
          label: "Library",
          subtitle: "Bare acts & state statutory rules",
          whatItDoes: "Full collection of Central bare acts and Kerala state enactments with live amendments.",
          icon: Landmark,
        },
        {
          id: "kb-research",
          label: "Research",
          subtitle: "Precedent synthesis archive",
          whatItDoes: "Saved legal briefs, ratio analyses, and cross-statutory concordance databases.",
          icon: Search,
        },
      ],
    },
    {
      category: "CORPORATE",
      items: [
        {
          id: "corp-ip-manager",
          label: "IP manager",
          subtitle: "Trademarks, copyrights & patents",
          whatItDoes: "Tracks IP registry filings, trademark search reports, and opposition proceedings.",
          icon: Shield,
        },
        {
          id: "corp-compliances",
          label: "Compliances",
          subtitle: "MCA21 & ROC annual filing calendar",
          whatItDoes: "Manages corporate secretarial compliances, director KYC, and ROC annual returns.",
          icon: ClipboardCheck,
        },
        {
          id: "corp-contracts",
          label: "Contracts",
          subtitle: "Commercial & corporate agreements",
          whatItDoes: "Drafts and reviews NDAs, MSAs, shareholder agreements, and commercial leases.",
          icon: FileText,
        },
        {
          id: "corp-documents",
          label: "Documents",
          subtitle: "Board resolutions & powers of attorney",
          whatItDoes: "Vault for board resolutions, shareholder minutes, and statutory registers.",
          icon: FolderLock,
        },
        {
          id: "corp-due-diligence",
          label: "Due diligence",
          subtitle: "M&A & investment diligence checklists",
          whatItDoes: "Executes legal due diligence checklists, title scrutiny, and litigation risk reports.",
          icon: CheckSquare,
        },
      ],
    },
    {
      category: "BUSINESS +",
      items: [
        {
          id: "business-registration",
          label: "Business registration services",
          subtitle: "Pvt Ltd, LLP & OPC incorporation",
          whatItDoes: "End-to-end MCA incorporation, SPICe+ filing, DIN allotment, and MOA/AOA drafting.",
          icon: Building2,
        },
        {
          id: "tax-compliance",
          label: "Tax and Compliances Filing",
          subtitle: "GST, ITR & RoC annual calendar",
          whatItDoes: "Monthly GST reconciliation, corporate income tax filing, and annual statutory compliance.",
          icon: Calculator,
        },
        {
          id: "trademark-ip",
          label: "Trademark and IP registration",
          subtitle: "TM-A search, filing & examination",
          whatItDoes: "Comprehensive trademark search reports, class classification, and objection hearing replies.",
          icon: Shield,
        },
        {
          id: "corporate-lawyer",
          label: "Corporate Lawyer services",
          subtitle: "SHA, founders agreements & retainers",
          whatItDoes: "Drafts and negotiates investment agreements, commercial contracts, and general counsel retainers.",
          icon: Briefcase,
        },
        {
          id: "company-secretary",
          label: "Company Secretary services",
          subtitle: "Secretarial standards, ROC & board minutes",
          whatItDoes: "Secretarial compliance, board and AGM meeting notices, minute books, and share restructuring.",
          icon: ClipboardCheck,
        },
        {
          id: "auditor-ca",
          label: "Auditor and CA services",
          subtitle: "Statutory tax audit & valuation",
          whatItDoes: "Independent statutory audits, CARO reporting, transfer pricing, and 15CA/15CB certificates.",
          icon: Landmark,
        },
      ],
    },
    {
      category: "PROMO",
      items: [
        {
          id: "marketing",
          label: "Marketing",
          subtitle: "Chamber credentials & expertise bio",
          whatItDoes: "Manages Bar Council compliant chamber credentials, firm overview, and practice areas.",
          icon: Megaphone,
        },
        {
          id: "rd",
          label: "R&D",
          subtitle: "Jurisprudential research labs",
          whatItDoes: "Explores emerging digital evidence law, AI jurisprudence, and cross-border commercial trends.",
          icon: FlaskConical,
        },
        {
          id: "promotions",
          label: "Promotions",
          subtitle: "Legal seminars & client circulars",
          whatItDoes: "Distributes legal update circulars, statutory alerts, and seminar invitations to clients.",
          icon: Target,
        },
      ],
    },
    {
      category: "WORK FORCE",
      items: [
        {
          id: "training",
          label: "Training",
          subtitle: "Junior counsel onboarding & curriculum",
          whatItDoes: "Curriculum for junior advocates, courtroom demeanor checklists, and procedural briefs.",
          icon: Award,
        },
        {
          id: "my-ai-agents",
          label: "My AI Agents",
          subtitle: "Autonomous judicial task workers",
          whatItDoes: "Configures automated AI workers for BNS-BNSS concordance and bail petition drafting.",
          icon: Cpu,
        },
        {
          id: "my-ai-twin",
          label: "My AI Twin",
          subtitle: "Personal digital advocate voice",
          whatItDoes: "Drafts pleadings and case notes matching Adv. Meera Krishnan's exact legal voice.",
          icon: UserPlus,
        },
        {
          id: "hiring-suite",
          label: "Hiring Suite",
          subtitle: "Associate recruitment pipeline",
          whatItDoes: "Screens chamber associate applications and verifies Bar Council enrollment credentials.",
          icon: Users,
        },
      ],
    },
    {
      category: "COLLAB",
      items: [
        {
          id: "my-network",
          label: "My Network",
          subtitle: "Advocate & bar referral grid",
          whatItDoes: "Connects with verified Supreme Court and High Court advocates across India for referrals.",
          icon: Share2,
        },
        {
          id: "my-hub",
          label: "My Hub",
          subtitle: "Chamber command center & docket",
          whatItDoes: "Monitors daily chamber operations, live court halls, and associate briefs.",
          icon: Compass,
        },
        {
          id: "my-team",
          label: "My team",
          subtitle: "Chamber associates & counsel roster",
          whatItDoes: "Manages chamber associate caseloads, court clerk passes, and assigned matters.",
          icon: Users,
        },
        {
          id: "collask",
          label: "Collask",
          subtitle: "Cross-firm inquiry & Q&A exchange",
          whatItDoes: "Exchanges urgent statutory and bench questions with verified advocates across all benches.",
          icon: MessagesSquare,
        },
      ],
    },
    {
      category: "ERP",
      items: [
        {
          id: "billings-earnings",
          label: "Billings & Earnings",
          subtitle: "Chamber fees, GST & trust escrow",
          whatItDoes: "Tracks appearance fees, retainer invoices, and audits segregated client trust escrow.",
          icon: CreditCard,
        },
        {
          id: "huremaso",
          label: "Huremaso - HRM",
          subtitle: "Chamber staff, passes & attendance",
          whatItDoes: "Manages chamber personnel, clerk attendance, stipends, and Bar Council renewals.",
          icon: UserCheck,
        },
        {
          id: "curemaso",
          label: "Curemaso - CRM",
          subtitle: "Client retainers & matter leads",
          whatItDoes: "Manages corporate retainers, intake pipelines, and KYC compliance screening.",
          icon: HeartHandshake,
        },
        {
          id: "acmaso",
          label: "Acmaso - Accounts",
          subtitle: "GST invoicing & accounts ledger",
          whatItDoes: "Tracks billable chamber hours, generates GST-compliant invoices, and audits ledger.",
          icon: Calculator,
        },
        {
          id: "app-store",
          label: "App store",
          subtitle: "Legal plugins & court bridges",
          whatItDoes: "Installs verified legal extensions, eCourts live sync connectors, and MCA21 bridges.",
          icon: Grid,
        },
      ],
    },
    {
      category: "ANALYTICS",
      items: [
        {
          id: "audit-history",
          label: "Audit History",
          subtitle: "Immutable activity logs & timestamps",
          whatItDoes: "Displays immutable audit logs, document revision timestamps, and compliance trails.",
          icon: History,
        },
        {
          id: "ai-analytics",
          label: "AI Analytics",
          subtitle: "Bench win rates & citation metrics",
          whatItDoes: "Analyzes judicial bench disposition rates, win/settlement ratios, and precedent citation weight.",
          icon: BarChart3,
        },
        {
          id: "reports",
          label: "Reports",
          subtitle: "Official chamber audit & exports",
          whatItDoes: "Generates and downloads court-certified chamber audits, hearing logs, and quarterly reports.",
          icon: FileSpreadsheet,
        },
      ],
    },
    {
      category: "SETTINGS",
      items: [
        {
          id: "settings",
          label: "Settings",
          subtitle: "Chamber preferences & profile",
          whatItDoes: "Configures chamber branding, API connectors, security settings, and notifications.",
          icon: Settings,
        },
      ],
    },
  ];

  // Rightbar quick access modules (collapsible hover dock)
  const rightbarSections = [
    {
      category: "TOOLS",
      items: [
        { id: "ai-copilot", label: "AI Copilot", icon: Bot, whatItDoes: "Launches 7-mode multi-modal legal AI copilot." },
        { id: "indian-legal-research", label: "Research Engine", icon: Search, whatItDoes: "Discovers binding precedents across Supreme Court & Kerala High Court." },
        { id: "legal-drafting", label: "Legal Drafting", icon: FileEdit, whatItDoes: "Drafts petitions, plaints, and notices." },
        { id: "contract-intelligence", label: "Contract Intel", icon: FileCheck, whatItDoes: "Audits contract risks and flags indemnities." },
      ],
    },
    {
      category: "PRACTICE",
      items: [
        { id: "case-tracker", label: "Case Tracker", icon: Activity, whatItDoes: "Tracks live dockets via 16-digit CNR." },
        { id: "calendar", label: "Deadlines Calendar", icon: Calendar, whatItDoes: "Tracks causelists and court limitation dates." },
        { id: "vault", label: "Document Vault", icon: FolderLock, whatItDoes: "Stores certified true copies and court files." },
        { id: "audit-history", label: "Audit History", icon: History, whatItDoes: "Views immutable chamber activity trails." },
      ],
    },
  ];

  // Filter sections and items based on search input
  const filteredSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.label.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
          section.category.toLowerCase().includes(sidebarSearch.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  // Check which module category activeTab belongs to
  const isWorkForce = ["training", "my-ai-agents", "my-ai-twin", "hiring-suite"].includes(activeTab);
  const isCollab = ["my-network", "my-hub", "my-team", "collask"].includes(activeTab);
  const isERP = ["huremaso", "curemaso", "acmaso", "app-store", "billings-earnings"].includes(activeTab);
  const isAnalytics = ["ai-analytics", "reports"].includes(activeTab);
  const isProductivity = ["notes", "issues-authorities", "calendar", "time-sheet", "case-tracker", "practice-ai", "taskmite"].includes(activeTab);
  const isBusiness = ["business-registration", "tax-compliance", "trademark-ip", "corporate-lawyer", "company-secretary", "auditor-ca"].includes(activeTab);
  const isPromo = ["marketing", "rd", "promotions"].includes(activeTab);
  const isCorporate = ["corp-ip-manager", "corp-compliances", "corp-contracts", "corp-documents", "corp-due-diligence"].includes(activeTab);
  const isResearch = ["indian-legal-research", "top-stories", "news-updates", "research-articles", "wakheel-digest"].includes(activeTab);
  const isCopilot = ["ai-copilot", "ask", "copilot"].includes(activeTab);
  const isAgents = ["workflows", "chamber-skills"].includes(activeTab);
  const isRecordings = ["recordings", "voice-dictation", "audio-memos"].includes(activeTab);
  const isCommunications = ["inbox", "messages", "chats", "video-meet"].includes(activeTab);
  const isKnowledgeBase = ["playbooks", "kb-articles", "library", "kb-research"].includes(activeTab);

  const displayFullName = advocateProfile
    ? `${advocateProfile.firstName} ${advocateProfile.lastName}`.trim()
    : "Adv. Meera Krishnan";
  const displayRoleSubtitle = (advocateProfile as any)?.enrollmentNumber || advocateProfile?.roleDescription || "Ernakulam, Kerala";
  const displayInitials = advocateProfile
    ? `${advocateProfile.firstName[0] || "A"}${advocateProfile.lastName[0] || "D"}`
    : "AD";

  const isFirmWorkspace = activeWorkspace.type === "firm";
  const currentFirm = userFirms.find((f) => f.id === activeWorkspace.firmId);

  // Handle file attachment for Copilot
  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newAttachments: Array<{ name: string; size: string }> = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const sizeStr = f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`;
      newAttachments.push({ name: f.name, size: sizeStr });
    }
    setCopilotAttachments((prev) => [...prev, ...newAttachments]);
    if (copilotFileInputRef.current) {
      copilotFileInputRef.current.value = "";
    }
  };

  // ============================================================================
  // MILESTONE 3: COPILOT SUITE HANDLERS
  // ============================================================================
  const handleCopy = (text: string, badgeId: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedBadge(badgeId);
      setTimeout(() => setCopiedBadge(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleRunTranslation = async (customText?: string) => {
    const textToUse = customText || translationSourceText;
    if (!textToUse.trim()) return;
    setIsTranslating(true);
    try {
      const res = await copilotApi.translate({
        text: textToUse,
        sourceLang: translationSourceLang,
        targetLang: translationTargetLang,
        documentType: translationDocType,
        advocateName: displayFullName || "Adv. Meera Krishnan",
        barCouncilNumber: advocateProfile?.barCouncilEnrollmentNumber || "K/001429/2012",
      });
      if (res.success) {
        setTranslatedResult(res.translatedText);
        setTranslationGlossary(res.glossary || []);
        setTranslationCertificate(res.translationCertificate || "");
      }
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRunDrafting = async () => {
    setIsDrafting(true);
    try {
      const res = await copilotApi.draftPleading({
        type: draftingTemplate,
        parameters: {
          clientName: draftingClientName,
          respondentName: draftingRespondentName,
          advocateName: displayFullName || "Adv. Meera Krishnan",
          barCouncilNumber: advocateProfile?.barCouncilEnrollmentNumber || "K/001429/2012",
          chequeNumber: draftingChequeNumber,
          chequeAmount: draftingChequeAmount,
          bankName: draftingBankName,
          caseNumber: draftingCaseNumber,
          subject: draftingSubject,
        },
      });
      if (res.success) {
        setDraftedResult({
          title: res.title,
          content: res.content,
          wordCount: res.wordCount,
        });
      }
    } catch (err) {
      console.error("Drafting error:", err);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleRunSummarize = async (customCitation?: string) => {
    const q = customCitation || judgmentQuery;
    if (!q.trim()) return;
    setIsSummarizing(true);
    try {
      const res = await copilotApi.summarizeJudgment({ citation: q });
      if (res.success && res.judgment) {
        setJudgmentSummary(res.judgment);
      }
    } catch (err) {
      console.error("Summarize error:", err);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Handle Copilot execution with Agent mode, Deep Research, and Attachments
  const handleExecuteCopilot = async () => {
    if (!copilotInput.trim() && copilotAttachments.length === 0) return;
    const query = copilotInput.trim() || (copilotAttachments.length > 0 ? `Inspect attached case document: ${copilotAttachments.map(f => f.name).join(", ")}` : "");
    const attachedFiles = [...copilotAttachments];
    const isAgent = copilotAgentMode;
    const isDeep = copilotDeepResearch;
    const currentMode = copilotMode;

    const userMsg: CopilotMessage = {
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

      const assistantMsg: CopilotMessage = {
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
      const fallbackMsg: CopilotMessage = {
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

  // If first-time signup and hasn't finished profile setup, show onboarding questionnaire modal
  if (showOnboarding) {
    return (
      <AdvocateOnboardingQuestionnaire
        onComplete={(data) => {
          setAdvocateProfile(data);
          try {
            localStorage.setItem("wakheel_advocate_profile", JSON.stringify(data));
            localStorage.setItem("wakheel_advocate_onboarded", "true");
            localStorage.removeItem("wakheel_advocate_first_signup");
          } catch {
            // ignore
          }
          setShowOnboarding(false);
        }}
        onSkip={() => {
          try {
            localStorage.setItem("wakheel_advocate_onboarded", "true");
            localStorage.removeItem("wakheel_advocate_first_signup");
          } catch {
            // ignore
          }
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex bg-white dark:bg-black text-black dark:text-white font-sans overflow-hidden transition-colors duration-200">
      
      {/* =========================================================================
          LEFT SIDEBAR: Exact layout matching user's prompt & screenshot
      ========================================================================= */}
      <aside
        className={`${
          sidebarOpen ? "w-80" : "w-18"
        } shrink-0 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 flex flex-col justify-between z-20 shadow-xs`}
      >
        {/* Top Header: Wakheel.com Advocate Practice */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
          <div className="flex items-center justify-between mb-3">
            {sidebarOpen ? (
              <BrandLogo size="sm" subtitleText="ADVOCATE PRACTICE" />
            ) : (
              <BrandLogo size="sm" hideText={true} className="mx-auto" />
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer shrink-0"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Advocate Profile Card: (AD) Adv. Meera Krishnan, Ernakulam, Kerala */}
          {sidebarOpen && (
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {displayInitials}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-black dark:text-white truncate">
                  {displayFullName}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                  {displayRoleSubtitle}
                </span>
              </div>
            </div>
          )}

          {/* Module Filter Search */}
          {sidebarOpen && (
            <div className="mt-2.5 relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter modules..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-all font-sans"
              />
            </div>
          )}
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 text-xs font-medium no-scrollbar">
          {filteredSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-0.5">
              {sidebarOpen && (
                <span className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
                  {sec.category}
                </span>
              )}

              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <div key={item.id} className="relative group/nav">
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left p-2 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                        isActive
                          ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? "text-white dark:text-black" : "text-zinc-500"}`} />
                      {sidebarOpen && (
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-semibold leading-tight truncate">
                            {item.label}
                          </span>
                          <span className={`text-[10px] leading-tight truncate mt-0.5 ${isActive ? "text-zinc-300 dark:text-zinc-600 font-normal" : "text-zinc-400"}`}>
                            {item.subtitle}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* Hover Tooltip when sidebar is collapsed */}
                    {!sidebarOpen && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-60 p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-2xl opacity-0 group-hover/nav:opacity-100 pointer-events-none transition-all duration-150 z-50 border border-zinc-700 dark:border-zinc-300 text-xs">
                        <div className="font-bold flex items-center justify-between pb-1 mb-1 border-b border-zinc-700 dark:border-zinc-300">
                          <span>{item.label}</span>
                          <span className="text-[9px] font-mono uppercase">{sec.category}</span>
                        </div>
                        <p className="text-[10px] text-zinc-300 dark:text-zinc-700 leading-snug">
                          <span className="font-bold">What it will do: </span>
                          {item.whatItDoes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Kerala / India Legal OS v1.0-fe */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
          {sidebarOpen ? (
            <>
              <span>Kerala / India Legal OS</span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-bold">
                v1.0-fe
              </span>
            </>
          ) : (
            <span className="mx-auto font-bold text-[9px]">v1.0</span>
          )}
        </div>
      </aside>

      {/* =========================================================================
          CENTER MAIN CANVAS: Top Bar matching Screenshot 1 + Active Views
      ========================================================================= */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-zinc-50 dark:bg-black">
        
        {/* Top Header Bar matching Screenshot 1 */}
        <header className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-between shrink-0 shadow-xs">
          
          {/* Left: Active Matter Switcher */}
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white font-medium">
              <Scale className="w-3.5 h-3.5 text-black dark:text-white" />
              <span className="font-bold">Active Matter:</span>
              <select
                value={selectedMatter}
                onChange={(e) => setSelectedMatter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer text-black dark:text-white"
              >
                <option value="WP(C) 19482/2024 — Gopakumar v. KSEB">WP(C) 19482/2024 — Gopakumar ...</option>
                <option value="ARB/NCLT/KOCHI/2024/041 — Malabar Infotech">ARB/NCLT/KOCHI/2024/041 — Malabar ...</option>
                <option value="new">+ Intake New Legal Issue</option>
              </select>
            </div>

            <WorkspaceSwitcher
              activeWorkspace={activeWorkspace}
              firms={userFirms}
              advocateName={displayFullName}
              onSelectWorkspace={(ws) => {
                setActiveWorkspace(ws);
                try {
                  localStorage.setItem("wakheel_active_workspace", JSON.stringify(ws));
                } catch {}
              }}
              onOpenJoinFirm={() => setJoinFirmModalOpen(true)}
              variant="header"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Advocate Switch Demo Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Advocate (Switch Demo)</span>
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#800020]" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center">
                {displayInitials}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-black dark:text-white leading-tight">
                  {displayFullName}
                </span>
                <span className="text-[10px] text-zinc-500">Advocate</span>
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

        {/* Dynamic Content Views */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">

          {/* ============================================================== */}
          {/* VIEW 1: Chamber Audit History & Activity Logs (Screenshot 1)   */}
          {/* ============================================================== */}
          {activeTab === "audit-history" && (
            <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
                  Chamber Audit History &amp; Activity Logs
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500">
                  Immutable access trails, document revision timestamps, and compliance logs
                </p>
              </div>

              {/* Activity Log Entries Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                    VERIFIED IMMUTABLE LOGS
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    SHA-256 Ledger
                  </span>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {[
                    {
                      title: "Writ Petition Revision Saved",
                      description: "WP(C) 19482/2024 grounds updated by Adv. Meera Krishnan",
                      timestamp: "28-Oct-2024 14:22 IST",
                    },
                    {
                      title: "Contract Intelligence Run",
                      description: "Scanned MSA_Malabar_Coastal.pdf for unilateral arbitration clause",
                      timestamp: "26-Oct-2024 11:05 IST",
                    },
                    {
                      title: "Client Consultation Completed",
                      description: "Conducted video consultation with Gopakumar Nambiar",
                      timestamp: "24-Oct-2024 09:30 IST",
                    },
                    {
                      title: "Precedent Saved to Matter",
                      description: "Valsamma v. KSEB (2011 (2) KLT 234) linked to WP(C) 19482/2024",
                      timestamp: "20-Oct-2024 16:45 IST",
                    },
                    {
                      title: "eCourts CNR Sync Completed",
                      description: "Verified CNR KLHC01-019482-2024 daily listing before Court Hall 2A",
                      timestamp: "18-Oct-2024 08:15 IST",
                    },
                  ].map((log, idx) => (
                    <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-black dark:text-white">
                          {log.title}
                        </h4>
                        <p className="text-xs text-zinc-500">
                          {log.description}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
                        {log.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 2: Indian Legal Research Engine (Screenshot 2 + Red Box)  */}
          {/* ============================================================== */}
          {isResearch && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
                  Indian Legal Research Engine
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500">
                  Supreme Court &amp; Kerala High Court precedent discovery with verified negative treatment
                </p>
              </div>

              {/* The 5-Segment Box drawn in Red by User: Indian Legal research | TOP stories | News updates | Articles | WAKHEEL.COM DIGEST */}
              <div className="p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-5 gap-1 text-xs font-bold text-center">
                <button
                  onClick={() => {
                    setResearchSegment("indian-legal-research");
                    setActiveTab("indian-legal-research");
                  }}
                  className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                    researchSegment === "indian-legal-research" || activeTab === "indian-legal-research"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  Indian Legal research
                </button>
                <button
                  onClick={() => {
                    setResearchSegment("top-stories");
                    setActiveTab("top-stories");
                  }}
                  className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                    researchSegment === "top-stories" || activeTab === "top-stories"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  TOP stories
                </button>
                <button
                  onClick={() => {
                    setResearchSegment("news-updates");
                    setActiveTab("news-updates");
                  }}
                  className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                    researchSegment === "news-updates" || activeTab === "news-updates"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  News updates
                </button>
                <button
                  onClick={() => {
                    setResearchSegment("articles");
                    setActiveTab("research-articles");
                  }}
                  className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                    researchSegment === "articles" || activeTab === "research-articles"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  Articles
                </button>
                <button
                  onClick={() => {
                    setResearchSegment("digest");
                    setActiveTab("wakheel-digest");
                  }}
                  className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                    researchSegment === "digest" || activeTab === "wakheel-digest"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  WAKHEEL.COM DIGEST
                </button>
              </div>

              {/* SEGMENT 1: Indian Legal Research Precedent Engine */}
              {researchSegment === "indian-legal-research" && (
                <div className="space-y-4">
                  {/* Search Bar matching Screenshot 2 */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={researchQuery}
                        onChange={(e) => setResearchQuery(e.target.value)}
                        placeholder="Search keywords, Acts (e.g. Telegraph Act 1885, Arbitration Act 1996, BNS 2023), judge, or citations..."
                        className="w-full pl-10 pr-4 py-3 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white shadow-xs"
                      />
                    </div>
                    <button
                      onClick={() => {}}
                      className="px-6 py-3 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      Search Law
                    </button>
                  </div>

                  {/* Quick Citation Jump Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="font-bold text-zinc-500 mr-1">Quick Jump:</span>
                    {["2024 INSC", "2024 KER", "Arbitration Act Sec 11", "Telegraph Act Sec 16", "BNS Sec 103", "BNSS Sec 187"].map((pill) => (
                      <button
                        key={pill}
                        onClick={() => setResearchQuery(pill)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-black font-mono font-medium cursor-pointer transition-all"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>

                  {/* Court / Source Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-zinc-500 mr-1">Court / Source:</span>
                    {(["ALL", "Supreme Court", "High Court of Kerala", "Parliament"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setResearchCourtFilter(filter)}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          researchCourtFilter === filter
                            ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                            : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  {/* Results & Precedent Cards */}
                  <div className="space-y-4 pt-2">
                    {[
                      {
                        citation: "2011 (2) KLT 234",
                        caseName: "Valsamma & Ors. v. Kerala State Electricity Board",
                        court: "High Court of Kerala (Division Bench)",
                        headnote: "Indian Telegraph Act, 1885, Section 10 & 16 — Power lines passing over private agricultural land — Requirement of adequate notice and determination of compensation by District Judge.",
                        treatment: "Binding Precedent • Followed in WP(C) 19482/2024",
                      },
                      {
                        citation: "(2023) 4 SCC 1",
                        caseName: "NN Global Mercantile Pvt. Ltd. v. Indo Unique Flame Ltd.",
                        court: "Supreme Court of India (Constitution Bench)",
                        headnote: "Arbitration and Conciliation Act, 1996, Section 11(6) — Unstamped arbitration agreements — Enforceability at the referral stage.",
                        treatment: "Constitutional Ratio • Relevant for ARB/NCLT/KOCHI/2024/041",
                      },
                      {
                        citation: "2024 (1) KHC 892",
                        caseName: "Malabar Trading Corporation v. Union of India",
                        court: "High Court of Kerala",
                        headnote: "GST Act, Section 73 — Summary orders passed without affording effective personal hearing constitute violation of natural justice.",
                        treatment: "Recent Bench Ruling",
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5 hover:border-black dark:hover:border-white transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-black dark:text-white">
                            {item.citation}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                            {item.court}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-black dark:text-white">
                          {item.caseName}
                        </h4>

                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {item.headnote}
                        </p>

                        <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 text-xs">
                          <span className="text-[11px] font-mono text-zinc-500 font-semibold">
                            {item.treatment}
                          </span>
                          <button className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold text-black dark:text-white cursor-pointer">
                            Link to Matter
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEGMENT 2: TOP Stories */}
              {researchSegment === "top-stories" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                      LANDMARK BENCH RULINGS &amp; LEAD JUDGMENTS
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Supreme Court &amp; High Courts
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        tag: "Constitutional Bench (7-Judge)",
                        court: "Supreme Court of India",
                        date: "August 2024",
                        title: "State of Punjab v. Davinder Singh & Ors.",
                        summary: "Sub-classification within Scheduled Castes for the purpose of granting reserved quota benefits is constitutionally permissible under Article 341, subject to demonstrable empirical data and the exclusion of the 'creamy layer'.",
                        statute: "Constitution of India, Articles 14, 15, 16 & 341",
                      },
                      {
                        tag: "Curative Precedent (7-Judge)",
                        court: "Supreme Court of India",
                        date: "December 2023",
                        title: "In Re: Interplay between Arbitration Act and Stamp Act (NN Global Curative)",
                        summary: "Non-stamping or insufficient stamping of an underlying commercial contract does not render the arbitration agreement non-existent or void ab initio. Defect is curable and admissibility must be decided by arbitral tribunal under Section 16.",
                        statute: "Arbitration & Conciliation Act 1996, Sec 11(6) • Indian Stamp Act 1899",
                      },
                      {
                        tag: "Division Bench Judgment",
                        court: "High Court of Kerala",
                        date: "October 2024",
                        title: "P.K. Sivadasan v. Kerala State Electricity Board",
                        summary: "Drawing 110kV high-tension transmission conductors over private residential compounds without prior hearing violates administrative fairness. The compensation under Section 16 of the Telegraph Act must account for total land value diminution.",
                        statute: "Indian Telegraph Act, 1885 • Electricity Act, 2003",
                      },
                    ].map((story, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3 hover:border-black dark:hover:border-white transition-all">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                            {story.tag}
                          </span>
                          <span className="text-xs font-mono text-zinc-500">
                            {story.court} • {story.date}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-black dark:text-white">
                          {story.title}
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {story.summary}
                        </p>
                        <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 text-xs">
                          <span className="text-[11px] font-mono text-zinc-500">{story.statute}</span>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold text-black dark:text-white cursor-pointer">
                              Read Full Judgment
                            </button>
                            <button className="px-3 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black font-bold cursor-pointer">
                              Cite in Draft
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEGMENT 3: News Updates */}
              {researchSegment === "news-updates" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                      REAL-TIME COURT CAUSELISTS &amp; REGISTRY FEEDS
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Live Registry Sync
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-900 bg-white dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 text-xs">
                    {[
                      {
                        time: "Today 10:15 IST",
                        type: "High Court of Kerala",
                        headline: "Court Hall 1A Daily Causelist: Writ Petitions (Civil) Listed for Admission",
                        detail: "Division Bench comprising Chief Justice and Justice Basant Balaji will commence regular hearing of public interest matters and infrastructure challenge dockets.",
                      },
                      {
                        time: "Today 09:30 IST",
                        type: "eCourts Services CNR",
                        headline: "CNR Sync: WP(C) 19482/2024 listed at Item #14 in Court Hall 2B",
                        detail: "Matter titled 'Gopakumar v. KSEB' listed before Justice Murali Purushothaman. Counter-affidavit filed by respondent standing counsel.",
                      },
                      {
                        time: "Yesterday 18:40 IST",
                        type: "Registry Notification",
                        headline: "High Court of Kerala Notice: Mandatory E-TrueCopy System from Nov 1",
                        detail: "All applications for certified copy of orders and judgments to be routed exclusively via the unified online advocate e-Filing portal.",
                      },
                      {
                        time: "Yesterday 16:15 IST",
                        type: "Bar Council Gazette",
                        headline: "Bar Council of India issues guidelines on Digital Court Practice and AI Ethics",
                        detail: "Advocates cautioned against verbatim reliance on unverified generative AI outputs without cross-checking official Supreme Court Law Reports (SCR).",
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="pt-3 first:pt-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                            {item.type}
                          </span>
                          <span className="font-mono text-zinc-400 text-[10px]">{item.time}</span>
                        </div>
                        <h4 className="font-bold text-black dark:text-white text-sm">{item.headline}</h4>
                        <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEGMENT 4: Articles */}
              {researchSegment === "articles" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                      LEGAL SCHOLARSHIP, BNS CONCORDANCE &amp; PRACTICE NOTES
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Peer-Reviewed Chamber Articles
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: "Transitioning to BNS 2023: Corporate Liability Decoded",
                        author: "Chamber Knowledge Base • Adv. Meera Krishnan",
                        readTime: "7 min read",
                        abstract: "Detailed comparative analysis of IPC Section 420 vs BNS Section 318 (Cheating), Section 406 vs BNS Section 316 (Criminal Breach of Trust), and procedural safeguards under BNSS Section 173.",
                      },
                      {
                        title: "Enforceability of Arbitral Awards Post NN Global Curative",
                        author: "Arbitration Desk • Kochi Chamber",
                        readTime: "10 min read",
                        abstract: "Examining the Seven-Judge Constitution Bench ruling on curative petitions and its practical implications on Section 9 interim relief and Section 11 arbitrator appointments in Kerala.",
                      },
                      {
                        title: "Telegraph Act Section 10 & 16: Compensation Principles in Kerala",
                        author: "Property & Infrastructure Practice Group",
                        readTime: "8 min read",
                        abstract: "A comprehensive review of Full Bench ratios in Livisha, Valsamma, and subsequent Division Bench precedents governing tree cutting compensation and land diminution awards.",
                      },
                      {
                        title: "Commercial Courts Act Section 12A: Mediation Prerequisites",
                        author: "Commercial Litigation Research Group",
                        readTime: "6 min read",
                        abstract: "Judicial trends in Patil Automation v. Rakheja Engineers: How trial courts in Ernakulam evaluate 'urgent interim relief' exemptions to bypass pre-institution mediation.",
                      },
                    ].map((art, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3 hover:border-black dark:hover:border-white transition-all flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-zinc-500">{art.author}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-bold">{art.readTime}</span>
                          </div>
                          <h4 className="text-sm font-bold text-black dark:text-white">{art.title}</h4>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{art.abstract}</p>
                        </div>
                        <button className="w-full py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold text-xs transition-all cursor-pointer">
                          Read Scholarly Note
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEGMENT 5: WAKHEEL.COM DIGEST */}
              {researchSegment === "digest" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                      WAKHEEL.COM WEEKLY DIGEST • VOL. 14 / ISSUE 42 (OCTOBER 2024)
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Indexed by Statute &amp; Bench Strength
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        statute: "Companies Act, 2013 • Section 241, 242 (Oppression & Mismanagement)",
                        citation: "2024 SCC OnLine SC 1892",
                        ratio: "A single instance of corporate impropriety cannot support a claim of oppression unless it is shown to have an enduring continuous adverse effect on the affairs of the company.",
                        bench: "D.Y. Chandrachud CJI, J.B. Pardiwala & Manoj Misra JJ. (3-Judge Bench)",
                      },
                      {
                        statute: "Negotiable Instruments Act, 1881 • Section 138 & 142(b)",
                        citation: "2024 (3) KLT 412",
                        ratio: "The statutory period of one month for instituting complaint commences strictly from the date of cause of action. Delay cannot be condoned without formal application under Sec 142(b).",
                        bench: "A. Badharudeen J. (High Court of Kerala)",
                      },
                      {
                        statute: "Indian Telegraph Act, 1885 • Section 10 & 16",
                        citation: "2011 (2) KLT 234 (Affirmed in 2024)",
                        ratio: "District Judge evaluating compensation under Section 16(3) must adopt the capitalisation method for yielding fruit trees and market value diminution for non-yielding portions.",
                        bench: "C.N. Ramachandran Nair & P.S. Gopinathan JJ. (Division Bench)",
                      },
                      {
                        statute: "Specific Relief Act, 1963 • Section 20A (Special Provisions for Infrastructure)",
                        citation: "2024 (2) KHC 675",
                        ratio: "No injunction shall be granted by any court in a suit under this Act where granting injunction would cause impediment or delay in the progress or completion of infrastructure project.",
                        bench: "V.G. Arun J. (High Court of Kerala)",
                      },
                    ].map((entry, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2 hover:border-black dark:hover:border-white transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-xs font-bold text-black dark:text-white">
                            {entry.statute}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-zinc-500">
                            {entry.citation}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 font-serif italic leading-relaxed">
                          "{entry.ratio}"
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900 text-[10px] font-mono text-zinc-500">
                          <span>{entry.bench}</span>
                          <button className="font-bold text-black dark:text-white hover:underline cursor-pointer">
                            Copy Headnote &amp; Ratio
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 3: Wakheel AI Legal Copilot (Screenshot 3)                */}
          {/* ============================================================== */}
          {isCopilot && (
            <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
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
              </div>

              {/* The 7 Copilot Mode Tabs: Ask | Research | Analyze | Draft | Review | Verify | Translate */}
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
              {/* SPECIALIZED SUITE 1: VERNACULAR TRANSLATION (Translate Mode) */}
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
                          handleRunTranslation(sample);
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
                          handleRunTranslation(sample);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                      >
                        Load Mahazar Sample
                      </button>
                    </div>
                  </div>

                  {/* Dual-Pane Editor: Left Vernacular / Right High Court English */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Pane: Source Text */}
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
                        onClick={() => handleRunTranslation()}
                        disabled={isTranslating || !translationSourceText.trim()}
                        className="w-full py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isTranslating ? "Translating & Cross-Checking Statutes..." : "Translate & Extract Legal Ratios"}</span>
                      </button>
                    </div>

                    {/* Right Pane: Formal English Translation */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-black dark:text-white uppercase tracking-wider text-[10px]">
                          Certified Court English Pleading
                        </span>
                        {translatedResult && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopy(translatedResult, "trans")}
                              className="text-[11px] font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {copiedBadge === "trans" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedBadge === "trans" ? "Copied!" : "Copy Pleading"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowCertificateModal(true)}
                              className="text-[11px] font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <FileCheck className="w-3 h-3" />
                              <span>Rule 32 Certificate</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="min-h-[178px] p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white leading-relaxed whitespace-pre-line font-serif overflow-y-auto max-h-[220px]">
                        {translatedResult || (
                          <span className="text-zinc-400 font-sans italic">
                            Translated English court pleading will appear here with standardized High Court terminology...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Extracted Legal Glossary Terms */}
                  {translationGlossary.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                      <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block">
                        Identified Vernacular Legal Concordance ({translationGlossary.length} Terms):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                        {translationGlossary.map((term, tIdx) => (
                          <div
                            key={tIdx}
                            className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-1 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-black dark:text-white">{term.vernacularTerm}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                {term.statuteReference.split("(")[0]}
                              </span>
                            </div>
                            <span className="block text-zinc-600 dark:text-zinc-400 font-medium">{term.formalEnglishTerm}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* SPECIALIZED SUITE 2: STATUTORY NOTICE & WRIT DRAFTER (Draft Mode) */}
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
                        Court-ready pleadings formatted to Kerala High Court Rules, Civil Procedure Code &amp; NI Act.
                      </p>
                    </div>

                    {/* Template Pills */}
                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: "ni_138_demand_notice", label: "S.138 NI Act Notice" },
                        { id: "wpc_writ_petition", label: "Art. 226 Writ WP(C)" },
                        { id: "injunction_plaint", label: "Injunction Suit" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setDraftingTemplate(t.id as any);
                            setDraftedResult(null);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
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

                  {/* Form Parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-black dark:text-white text-[10px] uppercase">
                        Client / Complainant / Petitioner
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

                    {draftingTemplate === "ni_138_demand_notice" ? (
                      <>
                        <div className="space-y-1">
                          <label className="font-bold text-black dark:text-white text-[10px] uppercase">
                            Cheque Amount (₹)
                          </label>
                          <input
                            type="text"
                            value={draftingChequeAmount}
                            onChange={(e) => setDraftingChequeAmount(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-black dark:text-white text-[10px] uppercase">
                            Cheque Number &amp; Bank
                          </label>
                          <input
                            type="text"
                            value={draftingChequeNumber}
                            onChange={(e) => setDraftingChequeNumber(e.target.value)}
                            placeholder="Cheque No."
                            className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="font-bold text-black dark:text-white text-[10px] uppercase">
                            Case / Docket Reference
                          </label>
                          <input
                            type="text"
                            value={draftingCaseNumber}
                            onChange={(e) => setDraftingCaseNumber(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="font-bold text-black dark:text-white text-[10px] uppercase">
                            Subject / Grievance Summary
                          </label>
                          <input
                            type="text"
                            value={draftingSubject}
                            onChange={(e) => setDraftingSubject(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleRunDrafting}
                        disabled={isDrafting}
                        className="w-full py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isDrafting ? "Drafting Pleading..." : "Draft Pleading"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Drafted Pleading Result Box */}
                  {draftedResult && (
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-black dark:text-white" />
                          <span className="font-bold text-xs text-black dark:text-white">{draftedResult.title}</span>
                          <span className="text-[10px] font-mono text-zinc-500">({draftedResult.wordCount} words)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(draftedResult.content, "draft")}
                            className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedBadge === "draft" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedBadge === "draft" ? "Copied!" : "Copy Pleading"}</span>
                          </button>
                        </div>
                      </div>
                      <div className="font-mono text-xs leading-relaxed text-black dark:text-white whitespace-pre-line max-h-[350px] overflow-y-auto p-3 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800">
                        {draftedResult.content}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* SPECIALIZED SUITE 3: PRECEDENT & JUDGMENT SUMMARIZER (Research & Analyze Modes) */}
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
                            setJudgmentQuery(item.q);
                            handleRunSummarize(item.q);
                          }}
                          className="px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={judgmentQuery}
                      onChange={(e) => setJudgmentQuery(e.target.value)}
                      placeholder="Enter legal citation (e.g. 2024 (2) KHC 401 DB) or case title..."
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleRunSummarize()}
                      disabled={isSummarizing || !judgmentQuery.trim()}
                      className="px-5 py-2.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{isSummarizing ? "Extracting..." : "Summarize"}</span>
                    </button>
                  </div>

                  {/* Summary Card */}
                  {judgmentSummary && (
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                        <div>
                          <h4 className="font-bold text-sm text-black dark:text-white">{judgmentSummary.title}</h4>
                          <span className="text-[11px] font-mono text-zinc-500 font-bold">{judgmentSummary.citation}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                          {judgmentSummary.court}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                            Coram &amp; Bench
                          </span>
                          <p className="text-black dark:text-white font-medium">{judgmentSummary.coram}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                            Operative Order &amp; Directions
                          </span>
                          <p className="text-black dark:text-white">{judgmentSummary.operativeOrder}</p>
                        </div>
                      </div>

                      {/* Binding Ratio Decidendi */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold text-black dark:text-white flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5" />
                          Binding Ratio Decidendi (Core Legal Principle)
                        </span>
                        <p className="text-xs text-zinc-800 dark:text-zinc-200 font-serif italic leading-relaxed pt-1">
                          "{judgmentSummary.ratioDecidendi}"
                        </p>
                      </div>

                      {/* Plain-Language Client Takeaway */}
                      <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold text-zinc-600 dark:text-zinc-300 block">
                          Client Plain-Language Takeaway (Share with Litigant):
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
                        {/* If User message has attachments */}
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

                        {/* Mode / Feature Badges if user message used them */}
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

                        {/* Message Text */}
                        <div className="whitespace-pre-line">{msg.text}</div>

                        {/* Assistant Agent Steps (if agentMode) */}
                        {msg.agentSteps && msg.agentSteps.length > 0 && (
                          <div className="p-3.5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2.5 my-2 shadow-2xs">
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
                              <span className="text-[11px] font-mono uppercase font-bold text-black dark:text-white flex items-center gap-1.5">
                                <Bot className="w-3.5 h-3.5" />
                                Agent Autonomous Execution Pipeline (4/4 Completed)
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

                        {/* Assistant Deep Research Data (if deepResearch) */}
                        {msg.deepResearchData && (
                          <div className="p-3.5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 my-2 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-900">
                              <span className="text-[11px] font-mono uppercase font-bold text-black dark:text-white flex items-center gap-1.5">
                                <Compass className="w-3.5 h-3.5" />
                                Deep Research Synthesis Engine
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                                <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold border border-zinc-200 dark:border-zinc-800">
                                  {msg.deepResearchData.scJudgements} SC Judgements
                                </span>
                                <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold border border-zinc-200 dark:border-zinc-800">
                                  {msg.deepResearchData.hcJudgements} Kerala HC Ratios
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2 text-xs">
                              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Binding Precedent Ratios:</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {msg.deepResearchData.precedents.map((prec, pIdx) => (
                                  <div key={pIdx} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-black dark:text-white text-xs">{prec.citation}</span>
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 font-semibold text-black dark:text-white">
                                        {prec.court}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{prec.ratio}</p>
                                    <span className="text-[10px] font-mono text-zinc-400 block pt-0.5">{prec.treatment}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="text-[10px] text-zinc-400 font-mono">Verified negative judicial history: No overruling decisions found.</span>
                              <button
                                type="button"
                                onClick={() => alert("Downloading certified legal research brief (PDF)...")}
                                className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer w-fit"
                              >
                                <Download className="w-3 h-3" />
                                Download Brief
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Real-time Loader when executing */}
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

              {/* Prompt Input Box with Upload Attachment, Agent Mode, and Deep Research (matching screenshot) */}
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
                      handleExecuteCopilot();
                    }
                  }}
                  placeholder={
                    copilotAgentMode && copilotDeepResearch
                      ? "Ask Copilot with [Agent Mode + Deep Research]: Enter complex legal proposition for autonomous research & drafting..."
                      : copilotAgentMode
                      ? "Ask Copilot with [Agent Mode]: Enter chamber objective for multi-step autonomous execution..."
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
                      onChange={handleFileAttach}
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
                    onClick={handleExecuteCopilot}
                    disabled={!copilotInput.trim() && copilotAttachments.length === 0}
                    className="px-5 py-2 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:opacity-40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ml-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Execute</span>
                  </button>
                </div>
              </div>

              {/* Bottom Disclaimer matching Screenshot 3 */}
              <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                <HelpCircle className="w-4 h-4 shrink-0 text-black dark:text-white" />
                <span className="font-medium leading-relaxed">
                  <span className="font-bold text-black dark:text-white uppercase mr-1">LEGAL AI RESEARCH DISCLAIMER:</span>
                  AI-generated legal information for research and assistance. It is not a substitute for advice from a qualified legal professional.
                </span>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 4: Corporate Suite (IP Manager, Compliances, Contracts, Documents, Due Diligence) */}
          {/* ============================================================== */}
          {isCorporate && (
            <CorporateSuiteView activeModule={activeTab} onSelectModule={(m) => setActiveTab(m)} />
          )}

          {/* ============================================================== */}
          {/* VIEW 5: Clients / Citizens Directory                           */}
          {/* ============================================================== */}
          {activeTab === "clients" && (
            <AdvocateClientsView
              token={typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || "advocate_token" : "advocate_token"}
              advocateName={displayFullName}
              onOpenChat={() => setActiveTab("messages")}
              onOpenConsultation={() => setActiveTab("appointments")}
              onOpenMatter={() => setActiveTab("matters")}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW 6A: Chamber Voice Dictations & Audio Notes               */}
          {isRecordings && (
            <ChamberVoiceDictation
              currentMatter={selectedMatter}
              token={typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || "advocate_token" : "advocate_token"}
              advocateName={displayFullName}
              onNavigateToCaseNotes={() => setActiveTab("notes")}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW 6B: Communications (Inbox, Messages, Chats, Video Meet)   */}
          {isCommunications && (
            <AdvocateInboxView
              token={typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || "advocate_token" : "advocate_token"}
              advocateName={displayFullName}
              onOpenConsultation={() => setActiveTab("appointments")}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW 7: AI Legal Agents (Work Flows & Chamber Skills)          */}
          {isAgents && (
            <AutonomousAgentsView
              initialSubTab={activeTab === "chamber-skills" ? "chamber-skills" : "workflows"}
              advocateName={displayFullName}
              barCouncilNumber={(advocateProfile as any)?.enrollmentNumber || "K/1429/2016"}
              token={typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || "advocate_token" : "advocate_token"}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW 8: Knowledge Base (Play Books, Library, Articles)         */}
          {isKnowledgeBase && (
            <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
                  Chamber Knowledge Base &amp; Precedent Library
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500">
                  Internal legal playbooks, annotated central and state bare acts, and chamber research archives
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                    CENTRAL &amp; KERALA STATE BARE ACTS
                  </span>
                  <button className="px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer">
                    + Add Research Brief
                  </button>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-900 text-xs">
                  {[
                    { title: "Bharatiya Nyaya Sanhita (BNS), 2023", subtitle: "Full concordance map with Indian Penal Code, 1860" },
                    { title: "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023", subtitle: "Procedural changes in bail and arrest procedure" },
                    { title: "Kerala Land Reforms Act, 1963", subtitle: "Land ceiling, tenancy rights, and Section 85 exemptions" },
                    { title: "Indian Telegraph Act, 1885", subtitle: "Section 10 & 16 power line compensation ratios" },
                  ].map((act, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-black dark:text-white block">{act.title}</span>
                        <span className="text-zinc-500">{act.subtitle}</span>
                      </div>
                      <button className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold cursor-pointer">
                        Open Act
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: ERP Dashboard                                            */}
          {activeTab === "dashboard" && (
            <ERPDashboardView
              onNavigateTab={(tab) => setActiveTab(tab)}
              advocateName={displayFullName}
              hideTopBanner={true}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW: E-Sign Suite                                             */}
          {activeTab === "esign" && (
            <ElectronicConsentView />
          )}

          {/* ============================================================== */}
          {/* VIEW: Work Force (Training, AI Agents, AI Twin, Hiring Suite)  */}
          {isWorkForce && (
            <WorkForceView activeModule={activeTab} onSelectModule={(m) => setActiveTab(m)} />
          )}

          {/* ============================================================== */}
          {/* VIEW: Collab (My Network, My Hub, My Team, Collask)            */}
          {isCollab && (
            <CollabView
              activeModule={activeTab}
              onSelectModule={(m) => setActiveTab(m)}
              activeFirm={isFirmWorkspace ? currentFirm : null}
              onAddAssociate={() => setJoinFirmModalOpen(true)}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW: ERP (Huremaso, Curemaso, Acmaso, App Store)              */}
          {isERP && (
            <ERPModulesView
              activeModule={activeTab}
              onSelectModule={(m) => setActiveTab(m)}
              token={typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || "advocate_token" : "advocate_token"}
              advocateName={displayFullName}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW: Analytics (AI Analytics, Reports)                        */}
          {isAnalytics && (
            <AnalyticsView
              activeModule={activeTab}
              onSelectModule={(m) => setActiveTab(m)}
              token={typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || "advocate_token" : "advocate_token"}
              advocateName={displayFullName}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW: Productivity                                            */}
          {isProductivity && (
            <ProductivityView activeModule={activeTab} onSelectModule={(m) => setActiveTab(m)} />
          )}

          {/* ============================================================== */}
          {/* VIEW: Chamber Consultations & Video Appointments                */}
          {/* ============================================================== */}
          {(activeTab === "appointments" || activeTab === "consultations") && (
            <AdvocateConsultationsView
              token={typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || "advocate_token" : "advocate_token"}
              advocateName={displayFullName}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW: Business + (Corporate & Regulatory Services)              */}
          {isBusiness && (
            <BusinessView activeModule={activeTab} onSelectModule={(m) => setActiveTab(m)} />
          )}

          {/* ============================================================== */}
          {/* VIEW: Promo (Marketing, R&D, Promotions)                       */}
          {isPromo && (
            <PromoView activeModule={activeTab} onSelectModule={(m) => setActiveTab(m)} />
          )}

          {/* ============================================================== */}
          {/* VIEW: Matter Intelligence / Triage                             */}
          {activeTab === "matters" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-xl font-bold text-black dark:text-white">
                    Incoming Client Matters &amp; Lead Pipeline
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Live triage queue for High Court of Kerala &amp; District Court representation.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-xs font-bold text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
                  {liveLeads.length + liveMatters.length} Pipeline Records
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Incoming Leads */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">Incoming Leads</h3>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-black dark:text-white">
                      {liveLeads.length}
                    </span>
                  </div>

                  {liveLeads.length === 0 ? (
                    <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                      No pending client leads at this time.
                    </div>
                  ) : (
                    liveLeads.map((lead) => (
                      <div
                        key={lead._id}
                        className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 hover:border-black dark:hover:border-white transition-colors shadow-xs"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-black dark:text-white font-bold uppercase">
                            {lead.category || "General Grievance"}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {lead.urgencyLevel || "Normal"}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-black dark:text-white leading-snug">
                          {lead.title}
                        </h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                          {lead.aiTriage?.summary || lead.description}
                        </p>
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
                            Citizen ID: {lead.citizenId || "default"}
                          </span>
                          {lead.status === "matter_opened" ? (
                            <span className="text-[11px] font-bold text-black dark:text-white flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Opened
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAcceptLead(lead._id)}
                              disabled={acceptingLeadId === lead._id}
                              className="px-3 py-1 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black font-bold text-xs rounded-full cursor-pointer disabled:opacity-50"
                            >
                              {acceptingLeadId === lead._id ? "Opening..." : "Accept Matter"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 2. Active Matters */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">Active Matters</h3>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-black dark:text-white">
                      {liveMatters.length}
                    </span>
                  </div>

                  {liveMatters.length === 0 ? (
                    <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                      No active matters.
                    </div>
                  ) : (
                    liveMatters.map((matter) => (
                      <div
                        key={matter._id}
                        className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-black dark:text-white font-bold uppercase">
                            {matter.matterType || "High Court Writ"}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {matter.caseNumber}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-black dark:text-white">
                          {matter.matterTitle}
                        </h4>
                        <div className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 font-medium">
                          {matter.courtHall} • {matter.courtForum}
                        </div>
                        <div className="pt-2 flex items-center justify-between gap-2">
                          <span className="text-xs text-zinc-500 font-mono truncate">
                            CNR: {matter.cnrNumber || "KLHC01-2024"}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setTimelineModalMatter(matter);
                                setTimelineEventTitle("");
                                setTimelineEventRemarks("");
                              }}
                              className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-black dark:text-white font-bold text-[11px] rounded-full cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800"
                              title="Sync Live Court Milestone to Citizen"
                            >
                              + Hearing Update
                            </button>
                            <button
                              onClick={() => {
                                setSelectedMatter(matter.matterTitle);
                                setActiveTab("case-preparation");
                              }}
                              className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black font-bold text-xs rounded-full hover:opacity-85 cursor-pointer"
                            >
                              Case Prep
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 3. Completed Matters */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">Completed Matters</h3>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-black dark:text-white">18</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-black dark:text-white font-bold uppercase">Employment Law</span>
                      <span className="text-[10px] text-zinc-500">Yesterday</span>
                    </div>
                    <h4 className="text-base font-bold text-black dark:text-white">Executive Employment Agreement</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Opinion issued with revised non-compete clause.</p>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">Client: David Chen</span>
                      <span className="text-xs text-black dark:text-white font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: Documentation & Vault                                    */}
          {/* ============================================================== */}
          {/* VIEW: Case Chronology & Fact Timeline Builder (High Court)     */}
          {/* ============================================================== */}
          {activeTab === "chronology-facts" && (
            <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
              <CaseChronologyBuilder
                advocateName={displayFullName}
                barCouncilNumber={(advocateProfile as any)?.enrollmentNumber || "K/1429/2016"}
                currentMatterTitle={selectedMatter}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: 256-bit Encrypted Document Vault & Scrutiny              */}
          {activeTab === "vault" && (
            <DocumentVaultView
              currentMatter={selectedMatter}
              token={typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || "advocate_token" : "advocate_token"}
              advocateName={displayFullName}
              barCouncilNumber={(advocateProfile as any)?.enrollmentNumber || "K/1429/2016"}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW: Legal Drafting Studio (Milestone Suite)                  */}
          {activeTab === "legal-drafting" && (
            <LegalDraftingStudioView
              currentMatter={selectedMatter}
              advocateName={displayFullName}
              barCouncilNumber={(advocateProfile as any)?.enrollmentNumber || "K/1429/2016"}
              token={typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || "advocate_token" : "advocate_token"}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW: Case Preparation & Bench Argument Dossier (Option B)     */}
          {activeTab === "case-preparation" && (
            <CasePreparationView
              currentMatter={selectedMatter}
              advocateName={displayFullName}
              barCouncilNumber={(advocateProfile as any)?.enrollmentNumber || "K/1429/2016"}
              token={typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || "advocate_token" : "advocate_token"}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {/* ============================================================== */}
          {/* VIEW: Contract Intelligence & Risk Audit (Option C)           */}
          {activeTab === "contract-intelligence" && (
            <ContractIntelligenceView
              currentMatter={selectedMatter}
              advocateName={displayFullName}
              barCouncilNumber={(advocateProfile as any)?.enrollmentNumber || "K/1429/2016"}
              token={typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || "advocate_token" : "advocate_token"}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {["office-suite", "compliance"].includes(activeTab) && (
            <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white capitalize">
                      {activeTab.replace("-", " ")}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Standardized High Court chamber pleadings and 256-bit encrypted document vault.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                    {activeTab}
                  </span>
                </div>
                <DocIntelligenceCard />
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: Settings Modal                                           */}
          {activeTab === "settings" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-black dark:text-white">Chamber Preferences &amp; Settings</h3>
                  <span className="text-xs font-mono text-zinc-400">Kerala / India Legal OS v1.0-fe</span>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span className="font-bold text-black dark:text-white block">Bar Council Credentials</span>
                    <p className="text-zinc-500">Enrolled Advocate: {displayFullName} • {displayRoleSubtitle}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span className="font-bold text-black dark:text-white block">Theme &amp; Accessibility</span>
                    <div className="flex items-center gap-3">
                      <ThemeToggle />
                      <span className="text-zinc-500">Toggle light / dark mode</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* =========================================================================
          RIGHTBAR AUTO-HIDE / COMFORTABLE HOVER REVEAL DOCK
      ========================================================================= */}
      <div
        onMouseEnter={() => setRightbarHovered(true)}
        onMouseLeave={() => {
          setRightbarHovered(false);
          hideTooltip();
        }}
        className="relative z-30 shrink-0 flex items-stretch h-full"
      >
        <div
          className={`h-full flex flex-col items-center justify-between py-6 cursor-pointer transition-all duration-300 border-l border-zinc-200 dark:border-zinc-800 ${
            isRightbarActive
              ? "w-0 opacity-0 overflow-hidden pointer-events-none"
              : "w-10 sm:w-11 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-2xs"
          }`}
          title="Hover mouse here to reveal Tools & ERP dock"
        >
          <ChevronLeft className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white animate-pulse" />
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 rotate-90 select-none uppercase font-bold whitespace-nowrap">
              TOOLS • ERP
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-ping" />
          </div>
          <ChevronLeft className="w-4 h-4 text-zinc-400" />
        </div>

        {/* The Full Rightbar Vertical Dock */}
        <aside
          className={`h-full bg-white dark:bg-black border-l border-zinc-200 dark:border-zinc-800 flex flex-col justify-between py-2.5 items-center shadow-xl transition-all duration-300 ease-in-out ${
            isRightbarActive
              ? "w-16 opacity-100 translate-x-0"
              : "w-0 opacity-0 translate-x-full pointer-events-none overflow-hidden"
          }`}
        >
          {/* Top: Pin Toggle + Quick AI Copilot, Phone Hotline, Notifications */}
          <div className="flex flex-col items-center gap-1.5 w-full px-2">
            <button
              onClick={() => setRightbarPinned(!rightbarPinned)}
              onMouseEnter={(e) =>
                showTooltip(
                  e,
                  rightbarPinned ? "Unpin Dock" : "Pin Dock Open",
                  "Dock Control",
                  rightbarPinned
                    ? "Dock will auto-hide when mouse leaves."
                    : "Keeps this tools dock permanently visible on the right edge."
                )
              }
              onMouseLeave={hideTooltip}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-colors cursor-pointer mb-0.5 ${
                rightbarPinned
                  ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-2xs"
                  : "text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
              title={rightbarPinned ? "Unpin dock" : "Pin dock open"}
            >
              {rightbarPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>

            {/* AI Copilot Quick Button */}
            <button
              onClick={() => setActiveTab("ai-copilot")}
              onMouseEnter={(e) =>
                showTooltip(
                  e,
                  "AI Statutory Copilot",
                  "Co-Counsel",
                  "Launches statutory precedent search and multi-modal legal drafting."
                )
              }
              onMouseLeave={hideTooltip}
              className="w-10 h-10 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Quick Phone Hotline */}
            <button
              onClick={() => setPhoneModalOpen(true)}
              onMouseEnter={(e) =>
                showTooltip(
                  e,
                  "Chamber Speed Dial",
                  "Hotline",
                  "Opens direct speed dialer for court registries and standing counsel."
                )
              }
              onMouseLeave={hideTooltip}
              className="w-10 h-10 rounded-xl text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4" />
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              onMouseEnter={(e) =>
                showTooltip(
                  e,
                  "Court Alerts & Causelist",
                  "3 Alerts",
                  "Opens live causelist hearing calls and e-filing alerts."
                )
              }
              onMouseLeave={hideTooltip}
              className="w-10 h-10 rounded-xl text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#800020]" />
            </button>
          </div>

          {/* Divider */}
          <div className="w-8 h-px bg-zinc-200 dark:border-zinc-800 my-1.5" />

          {/* Middle: Rightbar Modules */}
          <div className="flex-1 overflow-y-auto no-scrollbar w-full flex flex-col items-center gap-1.5 px-2 py-1">
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
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-black text-white dark:bg-white dark:text-black shadow-xs ring-2 ring-black dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-black"
                          : "text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Divider */}
          <div className="w-8 h-px bg-zinc-200 dark:border-zinc-800 my-1.5" />

          {/* Bottom Actions */}
          <div className="flex flex-col items-center gap-1.5 w-full px-2">
            <button
              onClick={() => setActiveTab("settings")}
              className="w-9 h-9 rounded-xl text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
              title="Chamber Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </div>

      {/* Floating Tooltip Portal for Rightbar */}
      {hoveredTooltip && (
        <div
          className="fixed right-18 -translate-y-1/2 p-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-2xl z-50 pointer-events-none border border-zinc-700 dark:border-zinc-300 w-64 text-xs transition-opacity duration-150 animate-in fade-in"
          style={{ top: hoveredTooltip.top }}
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-700 dark:border-zinc-300">
            <span className="font-bold text-xs">{hoveredTooltip.label}</span>
            <span className="text-[9px] font-mono uppercase bg-zinc-800 dark:bg-zinc-200 text-white dark:text-black px-1.5 py-0.5 rounded">
              {hoveredTooltip.category}
            </span>
          </div>
          <p className="text-[11px] text-zinc-300 dark:text-zinc-700 leading-snug">
            {hoveredTooltip.whatItDoes}
          </p>
        </div>
      )}

      {/* Phone Hotline Modal */}
      {phoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-black dark:text-white" />
                <h3 className="text-sm font-bold text-black dark:text-white">Chamber Hotline</h3>
              </div>
              <button
                onClick={() => setPhoneModalOpen(false)}
                className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Direct connection to court registries, standing counsel, and emergency listings.
            </p>
            <div className="space-y-2 text-xs">
              {[
                { name: "Kerala High Court Registry", number: "+91 484 2562222" },
                { name: "Standing Counsel Cell", number: "+91 484 2390111" },
                { name: "Chamber Senior Clerk", number: "+91 94471 20412" },
              ].map((contact, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-black dark:text-white block">{contact.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{contact.number}</span>
                  </div>
                  <button className="px-3 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer">
                    Call
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-black dark:text-white" />
                <h3 className="text-sm font-bold text-black dark:text-white">Chamber Court Alerts</h3>
              </div>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-900 text-xs">
              <div className="py-2.5">
                <span className="font-bold text-black dark:text-white block">WP(C) 19482/2024 listed for Monday</span>
                <span className="text-zinc-500">Item No. 12 before Hon'ble High Court Division Bench 2A.</span>
              </div>
              <div className="py-2.5">
                <span className="font-bold text-black dark:text-white block">New Citizen Representation Lead</span>
                <span className="text-zinc-500">Alex Morgan requested tenancy dispute consultation.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestone 2 Two-Way Sync: Post Court Hearing Update Modal */}
      {timelineModalMatter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Post Court Milestone &amp; Hearing Update
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  {timelineModalMatter.caseNumber} • {timelineModalMatter.matterTitle}
                </p>
              </div>
              <button
                onClick={() => setTimelineModalMatter(null)}
                className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4 text-black dark:text-white" />
              </button>
            </div>

            <form onSubmit={handlePostTimelineEvent} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-black dark:text-white uppercase tracking-wider text-[10px]">
                  Court Stage
                </label>
                <select
                  value={timelineEventStage}
                  onChange={(e) => setTimelineEventStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden"
                >
                  <option value="Interim Stay / Injunction Granted">Interim Stay / Injunction Granted</option>
                  <option value="Notice Before Admission Issued">Notice Before Admission Issued</option>
                  <option value="Counter-Affidavit Filed by Respondent">Counter-Affidavit Filed by Respondent</option>
                  <option value="Advocate Commissioner Report Submitted">Advocate Commissioner Report Submitted</option>
                  <option value="Arguments Concluded & Orders Reserved">Arguments Concluded & Orders Reserved</option>
                  <option value="Final Judgment / Order Pronounced">Final Judgment / Order Pronounced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-black dark:text-white uppercase tracking-wider text-[10px]">
                  Hearing Milestone Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Division Bench Issued Stay on Tree Clearing"
                  value={timelineEventTitle}
                  onChange={(e) => setTimelineEventTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-black dark:text-white uppercase tracking-wider text-[10px]">
                  Chamber Remarks &amp; Citizen Sync Note
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed notes on judge's oral observations, compliance deadlines, or registry filings..."
                  value={timelineEventRemarks}
                  onChange={(e) => setTimelineEventRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
                ⚡ <strong>Two-Way Sync</strong>: Submitting this update will immediately reflect on the Citizen's Case Tracker timeline on the Citizen Portal.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTimelineModalMatter(null)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPostingTimeline}
                  className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-85 cursor-pointer disabled:opacity-50"
                >
                  {isPostingTimeline ? "Broadcasting..." : "Publish Court Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Milestone 3: Rule 32 Kerala High Court Translation Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-black dark:text-white" />
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    Rule 32 Advocate Translation Certificate
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    Conforming to Rules of the High Court of Kerala, 1971
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4 text-black dark:text-white" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs font-serif leading-relaxed text-black dark:text-white whitespace-pre-line max-h-[340px] overflow-y-auto">
              {translationCertificate || (
                "BEFORE THE HON'BLE HIGH COURT OF KERALA AT ERNAKULAM\nCERTIFICATE UNDER RULE 32\n\nI, Adv. Meera Krishnan, Advocate, Roll No. K/001429/2012, practicing before the Hon'ble High Court of Kerala, do hereby solemnly certify that I am proficient in both Malayalam and English, and the accompanying translation is true, faithful, and accurate in all material particulars.\n\nDated this day at Ernakulam.\n\n(Sd/-)\nAdvocate for the Deponent"
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-zinc-500 font-mono">
                Official court filing annexure format
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(translationCertificate, "cert")}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer flex items-center gap-1.5"
                >
                  {copiedBadge === "cert" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBadge === "cert" ? "Copied!" : "Copy Certificate"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-85 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Firm Modal */}
      {joinFirmModalOpen && (
        <JoinFirmModal
          isOpen={joinFirmModalOpen}
          onClose={() => setJoinFirmModalOpen(false)}
          onJoined={(firm: FirmProfile) => {
            const exists = userFirms.find((f) => f.id === firm.id);
            const updated = exists ? userFirms : [...userFirms, firm];
            setUserFirms(updated);
            setActiveWorkspace({ type: "firm", firmId: firm.id });
            try {
              localStorage.setItem("wakheel_user_firms", JSON.stringify(updated));
              localStorage.setItem(
                "wakheel_active_workspace",
                JSON.stringify({ type: "firm", firmId: firm.id })
              );
            } catch {}
          }}
          currentUserFullName={displayFullName}
          currentUserEmail={advocateProfile?.email || "advocate@inworth.law"}
        />
      )}

    </div>
  );
}
