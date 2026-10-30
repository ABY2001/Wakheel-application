"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Send,
  MessageSquare,
  Calendar,
  Handshake,
  TrendingUp,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Flame,
  Radio,
  X,
  Phone,
  Mail,
  FileText,
  Briefcase,
  AlertCircle,
  Building,
  Scale,
  Award,
  Layers,
  Star,
  ArrowRight,
  Check,
} from "lucide-react";

export type CitizenPipelineStage =
  | "discover"
  | "shortlisted"
  | "inquired"
  | "consulted"
  | "hearing"
  | "retained";

export interface CitizenContact {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  role: string;
  court: string;
  location: string;
  stage: CitizenPipelineStage;
  practiceArea: string;
  source: string;
  feeText: string;
  statusQuote: string;
  lastActive: string;
  isOnline: boolean;
  barEnrollment: string;
  phone: string;
  email: string;
  assignedMatterNo?: string;
  assignedMatterTitle?: string;
  nextHearingDate?: string;
}

export interface RepresentationActivity {
  id: string;
  type: "stay" | "filing" | "notice" | "consultation" | "vakalatnama";
  advocateName: string;
  description: string;
  timestamp: string;
}

export interface UpcomingHearingFollowUp {
  id: string;
  advocateName: string;
  task: string;
  dueText: string;
  dueUrgent?: boolean;
}

export interface RecommendedSpecialist {
  id: string;
  name: string;
  specialty: string;
  court: string;
  experience: string;
  status: "consult" | "inquired";
}

const INITIAL_CITIZEN_CONTACTS: CitizenContact[] = [
  // 1. DISCOVER
  {
    id: "cit-1",
    name: "Adv. Tariq Mansoor",
    rating: 4.8,
    reviewsCount: 76,
    role: "Appellate Counsel • Commercial Disputes",
    court: "Delhi High Court / Supreme Court",
    location: "New Delhi",
    stage: "discover",
    practiceArea: "Commercial Arbitration",
    source: "AI Advocate Match",
    feeText: "₹4,000 / session",
    statusQuote: "Matched 96% for cross-border software licensing recovery dispute",
    lastActive: "1mo ago",
    isOnline: true,
    barEnrollment: "D/1092/2015",
    phone: "+91 98110 43921",
    email: "tariq@mansoorlaw.com",
  },
  {
    id: "cit-2",
    name: "Adv. Sneha Kulkarni",
    rating: 4.9,
    reviewsCount: 112,
    role: "Senior Counsel • Constitutional & Civil Writs",
    court: "High Court of Kerala",
    location: "Kochi, Kerala",
    stage: "discover",
    practiceArea: "Constitutional Writs",
    source: "Bar Council Directory",
    feeText: "₹3,500 / session",
    statusQuote: "Recommended for writ challenges against municipal utility acquisition",
    lastActive: "2w ago",
    isOnline: false,
    barEnrollment: "K/001429/2012",
    phone: "+91 94471 28910",
    email: "sneha.kulkarni@hcbar.in",
  },

  // 2. SHORTLISTED
  {
    id: "cit-3",
    name: "Adv. Rajiv Malhotra",
    rating: 4.8,
    reviewsCount: 88,
    role: "Principal Associate • Property Encroachment & Injunctions",
    court: "District & Sessions Court, Ernakulam",
    location: "Kochi, Kerala",
    stage: "shortlisted",
    practiceArea: "Property & Tenancy",
    source: "InWorth Verified",
    feeText: "₹2,500 / session",
    statusQuote: "Shortlisted for boundary re-survey sketch injunction appeal",
    lastActive: "1mo ago",
    isOnline: true,
    barEnrollment: "D/1492/2018",
    phone: "+91 98470 32189",
    email: "rajiv@lexadvocates.in",
  },
  {
    id: "cit-4",
    name: "Adv. Preeti Sharma",
    rating: 4.9,
    reviewsCount: 134,
    role: "Litigation & Writs Specialist • Consumer Redressal",
    court: "Kerala State Consumer Commission",
    location: "Trivandrum, Kerala",
    stage: "shortlisted",
    practiceArea: "Consumer Law",
    source: "Direct Recommendation",
    feeText: "₹2,000 / session",
    statusQuote: "Saved for filing defect in goods complaint against equipment vendor",
    lastActive: "3w ago",
    isOnline: true,
    barEnrollment: "K/003411/2021",
    phone: "+91 98950 14820",
    email: "preeti@sharmalegal.org",
  },

  // 3. INQUIRY SENT
  {
    id: "cit-5",
    name: "Adv. Karan Patel",
    rating: 4.7,
    reviewsCount: 65,
    role: "Director of Practice • NCLT Insolvency (IBC)",
    court: "NCLT Kochi Bench & Commercial Tribunal",
    location: "Kochi, Kerala",
    stage: "inquired",
    practiceArea: "Commercial Arbitration",
    source: "InWorth Verified",
    feeText: "₹3,500 / session",
    statusQuote: "Initial matter brief dispatched regarding milestone escrow dispute",
    lastActive: "1mo ago",
    isOnline: false,
    barEnrollment: "MAH/4102/2013",
    phone: "+91 98200 48190",
    email: "karan@patellex.in",
  },
  {
    id: "cit-6",
    name: "Adv. Vikramaditya Mehta",
    rating: 4.9,
    reviewsCount: 140,
    role: "Senior Partner • Intellectual Property & Software Agreements",
    court: "High Court Commercial Division",
    location: "Hyderabad / Kochi",
    stage: "inquired",
    practiceArea: "Commercial Arbitration",
    source: "Direct Reachout",
    feeText: "₹4,500 / session",
    statusQuote: "Case summary shared; awaiting preliminary legal opinion",
    lastActive: "1mo ago",
    isOnline: true,
    barEnrollment: "TS/1984/2011",
    phone: "+91 98490 33419",
    email: "vikram@mehtalegal.com",
  },

  // 4. CONSULTED
  {
    id: "cit-7",
    name: "Adv. Nandita Sengupta",
    rating: 4.8,
    reviewsCount: 92,
    role: "Banking & Loan Recovery Counsel",
    court: "Debts Recovery Tribunal (DRT)",
    location: "Kochi, Kerala",
    stage: "consulted",
    practiceArea: "Property & Tenancy",
    source: "AI Advocate Match",
    feeText: "₹2,800 / session",
    statusQuote: "Strategy conference completed; advised filing Section 17 DRT application",
    lastActive: "1mo ago",
    isOnline: true,
    barEnrollment: "WB/892/2017",
    phone: "+91 98301 77291",
    email: "nandita@caljurists.com",
  },
  {
    id: "cit-8",
    name: "Adv. Arjun Nambiar",
    rating: 4.9,
    reviewsCount: 120,
    role: "Chamber Counsel • Public Law & Land Acquisition",
    court: "High Court of Kerala",
    location: "Ernakulam, Kerala",
    stage: "consulted",
    practiceArea: "Constitutional Writs",
    source: "Bar Council Directory",
    feeText: "₹3,500 / session",
    statusQuote: "Consultation held; recommended Division Bench rejoinder citation list",
    lastActive: "2w ago",
    isOnline: true,
    barEnrollment: "K/001844/2007",
    phone: "+91 94473 11820",
    email: "arjun@nambiaradvocates.com",
  },

  // 5. HEARING / PROCEEDINGS SCHEDULED
  {
    id: "cit-9",
    name: "Adv. Priya Nair",
    rating: 4.9,
    reviewsCount: 116,
    role: "Family Law & Consumer Rights Advocate",
    court: "District Consumer Commission, Ernakulam",
    location: "Kollam / Ernakulam",
    stage: "hearing",
    practiceArea: "Consumer Law",
    source: "InWorth Verified",
    feeText: "₹2,000 / session",
    statusQuote: "Notice served via speed post; opposite party version hearing on 25 Nov",
    lastActive: "1mo ago",
    isOnline: true,
    barEnrollment: "K/002105/2017",
    phone: "+91 94460 77112",
    email: "priya.nair@barcouncilkerala.in",
    assignedMatterNo: "CC 892/2024",
    assignedMatterTitle: "Gopakumar v. Apex Electrical Infra Pvt Ltd",
    nextHearingDate: "25 Nov 2026",
  },
  {
    id: "cit-10",
    name: "Adv. Rajesh V. Varma",
    rating: 4.8,
    reviewsCount: 98,
    role: "Civil & Commercial Contract Specialist",
    court: "NCLT Kochi Bench & Arbitral Tribunal",
    location: "Trivandrum / Kochi",
    stage: "hearing",
    practiceArea: "Commercial Arbitration",
    source: "Bar Council Directory",
    feeText: "₹3,000 / session",
    statusQuote: "Arbitration slot scheduled for Nov 18: Section 17 interim relief arguments",
    lastActive: "1mo ago",
    isOnline: false,
    barEnrollment: "K/000892/2008",
    phone: "+91 98471 66209",
    email: "rajesh.varma@trivandrumbad.in",
    assignedMatterNo: "ARB/NCLT/KOCHI/2024/041",
    assignedMatterTitle: "Malabar Infotech Solutions v. Coastal Logistics",
    nextHearingDate: "18 Nov 2026",
  },

  // 6. ACTIVE VAKALATNAMA / RETAINED
  {
    id: "cit-11",
    name: "Adv. Meera Krishnan",
    rating: 4.9,
    reviewsCount: 168,
    role: "Senior Counsel • High Court Writs",
    court: "High Court of Kerala (Court Hall 2A)",
    location: "Ernakulam, Kerala",
    stage: "retained",
    practiceArea: "Constitutional Writs",
    source: "AI Advocate Match",
    feeText: "₹3,500 / session",
    statusQuote: "Active Stay Granted; rejoinder affidavit filed against KSEB alignment order",
    lastActive: "3h ago",
    isOnline: true,
    barEnrollment: "K/001429/2012",
    phone: "+91 94470 12849",
    email: "meera.krishnan@keralahc.gov.in",
    assignedMatterNo: "WP(C) 19482/2024",
    assignedMatterTitle: "Gopakumar Nambiar v. Kerala State Electricity Board & Anr.",
    nextHearingDate: "12 Nov 2026",
  },
  {
    id: "cit-12",
    name: "Adv. Sarah Jenkins",
    rating: 4.9,
    reviewsCount: 142,
    role: "Senior Property & Tenancy Advocate",
    court: "Principal Munsiff Court, Ernakulam",
    location: "Kochi, Kerala",
    stage: "retained",
    practiceArea: "Property & Tenancy",
    source: "InWorth Verified",
    feeText: "₹2,500 / session",
    statusQuote: "Pre-Trial Evidence Stage: Advocate Commissioner survey sketch verified",
    lastActive: "1d ago",
    isOnline: true,
    barEnrollment: "K/001429/2012",
    phone: "+91 98460 55431",
    email: "sarah.jenkins@lawchambers.in",
    assignedMatterNo: "OS 412/2023",
    assignedMatterTitle: "Gopakumar Nambiar v. Varghese Builders & Developers",
    nextHearingDate: "04 Nov 2026",
  },
  {
    id: "cit-13",
    name: "Senior Adv. K. Parasaran Chambers",
    rating: 5.0,
    reviewsCount: 240,
    role: "Lead Senior Counsel • Constitutional References",
    court: "Supreme Court of India",
    location: "New Delhi",
    stage: "retained",
    practiceArea: "Constitutional Writs",
    source: "Direct Recommendation",
    feeText: "Senior Retainer",
    statusQuote: "Vakalatnama on record for Article 226 Constitutional challenge appeal",
    lastActive: "2d ago",
    isOnline: true,
    barEnrollment: "SC/00012/1980",
    phone: "+91 98100 11200",
    email: "chambers@parasaran.legal",
    assignedMatterNo: "SLP(C) 28941/2026",
    assignedMatterTitle: "Gopakumar Nambiar v. State of Kerala & Anr.",
    nextHearingDate: "19 Dec 2026",
  },
  {
    id: "cit-14",
    name: "Adv. Rohinton Nariman",
    rating: 5.0,
    reviewsCount: 210,
    role: "Arbitration Tribunal Arbitrator & Senior Counsel",
    court: "Arbitration Tribunal, Kochi",
    location: "New Delhi / Kochi",
    stage: "retained",
    practiceArea: "Commercial Arbitration",
    source: "Bar Council Directory",
    feeText: "Tribunal Retainer",
    statusQuote: "Section 30 settlement draft vetted and submitted to Sole Arbitrator",
    lastActive: "3d ago",
    isOnline: false,
    barEnrollment: "SC/00098/1985",
    phone: "+91 98110 99882",
    email: "nariman@supremecourtbar.in",
    assignedMatterNo: "ARB/NCLT/041/2024",
    assignedMatterTitle: "Malabar Infotech v. Coastal Logistics",
    nextHearingDate: "18 Nov 2026",
  },
];

const CITIZEN_STAGE_CONFIG: {
  id: CitizenPipelineStage;
  number: string;
  title: string;
  subtitle: string;
  accentBg: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    id: "discover",
    number: "1.",
    title: "DISCOVER",
    subtitle: "Advocates matched by AI or discovered via Bar directory.",
    accentBg: "bg-blue-500",
    badgeBg: "bg-blue-100 dark:bg-blue-950/60",
    badgeText: "text-blue-700 dark:text-blue-300",
  },
  {
    id: "shortlisted",
    number: "2.",
    title: "SHORTLISTED",
    subtitle: "Advocates saved for potential case consultation.",
    accentBg: "bg-emerald-500",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950/60",
    badgeText: "text-emerald-700 dark:text-emerald-300",
  },
  {
    id: "inquired",
    number: "3.",
    title: "INQUIRY SENT",
    subtitle: "Advocates sent initial case synopsis & legal queries.",
    accentBg: "bg-amber-500",
    badgeBg: "bg-amber-100 dark:bg-amber-950/60",
    badgeText: "text-amber-700 dark:text-amber-300",
  },
  {
    id: "consulted",
    number: "4.",
    title: "CONSULTED",
    subtitle: "Advocates with completed strategy conferences.",
    accentBg: "bg-purple-500",
    badgeBg: "bg-purple-100 dark:bg-purple-950/60",
    badgeText: "text-purple-700 dark:text-purple-300",
  },
  {
    id: "hearing",
    number: "5.",
    title: "HEARING SET",
    subtitle: "Advocates with upcoming court appearances.",
    accentBg: "bg-cyan-500",
    badgeBg: "bg-cyan-100 dark:bg-cyan-950/60",
    badgeText: "text-cyan-700 dark:text-cyan-300",
  },
  {
    id: "retained",
    number: "6.",
    title: "ACTIVE VAKALATNAMA",
    subtitle: "Retained advocates handling active court matters.",
    accentBg: "bg-[#6B1728]",
    badgeBg: "bg-[#6B1728]/15",
    badgeText: "text-[#6B1728] dark:text-[#ff94a6]",
  },
];

const INITIAL_CITIZEN_ACTIVITIES: RepresentationActivity[] = [
  {
    id: "c-act-1",
    type: "stay",
    advocateName: "Adv. Meera Krishnan",
    description: "obtained daily court order extending interim stay in WP(C) 19482/2024.",
    timestamp: "3h ago",
  },
  {
    id: "c-act-2",
    type: "filing",
    advocateName: "Adv. Sarah Jenkins",
    description: "filed verified Advocate Commissioner survey sketch in OS 412/2023.",
    timestamp: "1d ago",
  },
  {
    id: "c-act-3",
    type: "filing",
    advocateName: "Adv. Rajesh V. Varma",
    description: "finalized Section 17 Interim Relief memo for arbitral hearing.",
    timestamp: "2d ago",
  },
  {
    id: "c-act-4",
    type: "notice",
    advocateName: "Adv. Priya Nair",
    description: "confirmed delivery of registered statutory legal notice to opposite party.",
    timestamp: "3d ago",
  },
  {
    id: "c-act-5",
    type: "vakalatnama",
    advocateName: "Senior Adv. K. Parasaran Chambers",
    description: "executed Vakalatnama for Constitutional Bench reference appeal.",
    timestamp: "5d ago",
  },
  {
    id: "c-act-6",
    type: "consultation",
    advocateName: "Adv. Arjun Nambiar",
    description: "completed pre-trial briefing on Article 226 telegraph deviation grounds.",
    timestamp: "38d ago",
  },
];

const INITIAL_CITIZEN_FOLLOW_UPS: UpcomingHearingFollowUp[] = [
  {
    id: "c-fu-1",
    advocateName: "Adv. Meera Krishnan",
    task: "Submit revenue property receipts for Court Hall 2A hearing",
    dueText: "Due Tomorrow",
    dueUrgent: true,
  },
  {
    id: "c-fu-2",
    advocateName: "Adv. Sarah Jenkins",
    task: "Pre-trial witness cross-examination briefing at Munsiff Court",
    dueText: "In 3 days",
  },
  {
    id: "c-fu-3",
    advocateName: "Adv. Rajesh V. Varma",
    task: "Sign affidavit of software milestone ledger exhibits",
    dueText: "In 5 days",
  },
];

const INITIAL_RECOMMENDED_SPECIALISTS: RecommendedSpecialist[] = [
  {
    id: "rec-sp-1",
    name: "Adv. K. Ramachandran Nair",
    specialty: "Land Revenue & Boundary Demarcation Writs",
    court: "High Court of Kerala",
    experience: "26+ Years Experience",
    status: "consult",
  },
  {
    id: "rec-sp-2",
    name: "Adv. Ananya Kurian",
    specialty: "Consumer Finance & Defective Goods Complaints",
    court: "Kerala State Consumer Commission",
    experience: "11+ Years Experience",
    status: "inquired",
  },
  {
    id: "rec-sp-3",
    name: "Adv. Gopakumar Menon",
    specialty: "Commercial Arbitration & Injunctions",
    court: "NCLT & Commercial Courts",
    experience: "19+ Years Experience",
    status: "consult",
  },
];

interface CitizenNetworkViewProps {
  onOpenConsultation?: (advocate: any) => void;
  onOpenBooking?: (advocate: any) => void;
  onViewCaseMatter?: (matterId: string) => void;
}

export function CitizenNetworkView({
  onOpenConsultation,
  onOpenBooking,
  onViewCaseMatter,
}: CitizenNetworkViewProps) {
  const [contacts, setContacts] = useState<CitizenContact[]>(INITIAL_CITIZEN_CONTACTS);
  const [activities, setActivities] = useState<RepresentationActivity[]>(
    INITIAL_CITIZEN_ACTIVITIES
  );
  const [followUps, setFollowUps] = useState<UpcomingHearingFollowUp[]>(
    INITIAL_CITIZEN_FOLLOW_UPS
  );
  const [recommendations, setRecommendations] = useState<RecommendedSpecialist[]>(
    INITIAL_RECOMMENDED_SPECIALISTS
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string>("all");
  const [selectedCourt, setSelectedCourt] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("recent");

  // View Mode: "kanban" vs "list"
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  // Detail Modal
  const [selectedContact, setSelectedContact] = useState<CitizenContact | null>(null);

  // Add Counsel Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialStage, setAddModalInitialStage] = useState<CitizenPipelineStage>("discover");
  const [newCounselName, setNewCounselName] = useState("");
  const [newCounselRole, setNewCounselRole] = useState("");
  const [newCounselCourt, setNewCounselCourt] = useState("High Court of Kerala");
  const [newCounselLocation, setNewCounselLocation] = useState("Kochi, Kerala");
  const [newCounselPracticeArea, setNewCounselPracticeArea] = useState("Constitutional Writs");
  const [newCounselSource, setNewCounselSource] = useState("AI Advocate Match");
  const [newCounselStatusQuote, setNewCounselStatusQuote] = useState("");

  // Filtering contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.court.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.practiceArea.toLowerCase().includes(q) ||
        (c.assignedMatterNo && c.assignedMatterNo.toLowerCase().includes(q));

      const matchStage = selectedStage === "all" || c.stage === selectedStage;
      const matchPractice =
        selectedPracticeArea === "all" || c.practiceArea === selectedPracticeArea;
      const matchCourt = selectedCourt === "all" || c.court.includes(selectedCourt);
      const matchSource = selectedSource === "all" || c.source === selectedSource;

      return matchSearch && matchStage && matchPractice && matchCourt && matchSource;
    });
  }, [contacts, searchQuery, selectedStage, selectedPracticeArea, selectedCourt, selectedSource]);

  // Stage breakdown
  const stageCounts = useMemo(() => {
    const counts: Record<CitizenPipelineStage, number> = {
      discover: 0,
      shortlisted: 0,
      inquired: 0,
      consulted: 0,
      hearing: 0,
      retained: 0,
    };
    contacts.forEach((c) => {
      if (counts[c.stage] !== undefined) {
        counts[c.stage]++;
      }
    });
    return counts;
  }, [contacts]);

  // Overall KPIs
  const totalNetworkCount = contacts.length;
  const contactedCount =
    stageCounts.inquired + stageCounts.consulted + stageCounts.hearing + stageCounts.retained;
  const respondedCount =
    stageCounts.consulted + stageCounts.hearing + stageCounts.retained;
  const meetingsCount = stageCounts.consulted + stageCounts.hearing;
  const activeCount = stageCounts.retained;
  const responseRatePct = contactedCount > 0 ? Math.round((respondedCount / contactedCount) * 100) : 78;
  const coreConversionPct = totalNetworkCount > 0 ? Math.round((activeCount / totalNetworkCount) * 100) : 29;

  // Toggle recommendation status
  const handleToggleSpecialist = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const next = r.status === "consult" ? "inquired" : "consult";
          return { ...r, status: next };
        }
        return r;
      })
    );
  };

  // Move stage
  const handleMoveStage = (contactId: string, newStage: CitizenPipelineStage) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === contactId) {
          return { ...c, stage: newStage };
        }
        return c;
      })
    );
    if (selectedContact && selectedContact.id === contactId) {
      setSelectedContact((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
  };

  // Create Counsel Submission
  const handleCreateCounsel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounselName.trim()) return;

    const newContact: CitizenContact = {
      id: `cit-${Date.now()}`,
      name: newCounselName.trim().startsWith("Adv.") || newCounselName.trim().startsWith("Senior Adv.")
        ? newCounselName.trim()
        : `Adv. ${newCounselName.trim()}`,
      rating: 4.9,
      reviewsCount: Math.floor(Math.random() * 80) + 20,
      role: newCounselRole.trim() || "Legal Counsel • Civil & Writs",
      court: newCounselCourt,
      location: newCounselLocation,
      stage: addModalInitialStage,
      practiceArea: newCounselPracticeArea,
      source: newCounselSource,
      feeText: "₹2,500 / session",
      statusQuote: newCounselStatusQuote.trim() || "Inquiry initiated via InWorth Portal",
      lastActive: "Just now",
      isOnline: true,
      barEnrollment: `K/${Math.floor(Math.random() * 9000) + 1000}/2020`,
      phone: "+91 94470 00000",
      email: `${newCounselName.toLowerCase().replace(/[^a-z]/g, "")}@keralabar.in`,
    };

    setContacts((prev) => [newContact, ...prev]);

    // Push activity
    setActivities((prev) => [
      {
        id: `c-act-${Date.now()}`,
        type: "consultation",
        advocateName: newContact.name,
        description: `added to legal pipeline at stage ${newContact.stage.toUpperCase()}.`,
        timestamp: "Just now",
      },
      ...prev,
    ]);

    // Reset and close
    setNewCounselName("");
    setNewCounselRole("");
    setNewCounselStatusQuote("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="w-full space-y-6 font-sans">
      {/* =========================================================================
          TOP HEADER: MATCHING SCREENSHOT 1 STRUCTURE WITH CITIZEN LEGAL CONTENT
      ========================================================================= */}
      <div className="space-y-3">
        {/* Subtitle / Meta Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a6] border border-[#6B1728]/25 shadow-2xs">
            <Flame className="w-3.5 h-3.5 fill-[#6B1728] text-[#6B1728] dark:fill-[#ff94a6] dark:text-[#ff94a6]" />
            Active Legal Team Hub
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
            Target: Verified Legal Representation
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>

        {/* Title + Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
                Professional Legal Network
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                {contacts.length} Contacts
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-3xl">
              Manage and track your legal relationships from inquiry to active court representation across pipeline stages.
            </p>
          </div>

          <button
            onClick={() => {
              setAddModalInitialStage("discover");
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#6B1728] hover:bg-[#581220] text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all shrink-0 hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Contact</span>
          </button>
        </div>

        {/* View Switcher Pill Toggle & AI Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kanban Funnel</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>My Network</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <Sparkles className="w-4 h-4 text-[#6B1728] dark:text-[#ff94a6]" />
            <span className="font-mono text-[11px] tracking-wide">
              AI-Assisted Legal Representation Intelligence
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6 KPI METRIC CARDS ROW: SCREENSHOT 1 STRUCTURE
      ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. TOTAL NETWORK */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1.5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
              TOTAL NETWORK
            </span>
            <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-black dark:text-white">
            {totalNetworkCount}
          </div>
          <p className="text-[11px] text-zinc-500 truncate">
            {stageCounts.discover} added recently
          </p>
        </div>

        {/* 2. NEW CONNECTIONS */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1.5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
              NEW CONNECTIONS
            </span>
            <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-black dark:text-white">
            +{stageCounts.shortlisted}
          </div>
          <p className="text-[11px] text-zinc-500 truncate">Active this month</p>
        </div>

        {/* 3. CONTACTED */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1.5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
              CONTACTED
            </span>
            <div className="w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-black dark:text-white">
            {contactedCount}
          </div>
          <p className="text-[11px] text-zinc-500 truncate">Outreach initiated</p>
        </div>

        {/* 4. RESPONDED */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1.5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
              RESPONDED
            </span>
            <div className="w-6 h-6 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-black dark:text-white">
            {respondedCount}
          </div>
          <p className="text-[11px] text-zinc-500 truncate">
            {responseRatePct}% response rate
          </p>
        </div>

        {/* 5. MEETINGS */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1.5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
              MEETINGS
            </span>
            <div className="w-6 h-6 rounded-full bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-black dark:text-white">
            {meetingsCount}
          </div>
          <p className="text-[11px] text-zinc-500 truncate">{meetingsCount} upcoming</p>
        </div>

        {/* 6. ACTIVE RELATIONS... */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1.5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider truncate">
              ACTIVE RETAINERS
            </span>
            <div className="w-6 h-6 rounded-full bg-[#6B1728]/15 flex items-center justify-center text-[#6B1728] dark:text-[#ff94a6]">
              <Handshake className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-black dark:text-white">
            {activeCount}
          </div>
          <p className="text-[11px] text-zinc-500 truncate">
            Executed Vakalatnamas
          </p>
        </div>
      </div>

      {/* =========================================================================
          NETWORK CONVERSION & ENGAGEMENT DEPTH PROGRESS BAR: SCREENSHOT 1 STRUCTURE
      ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-black dark:text-white">
            <TrendingUp className="w-4 h-4 text-[#6B1728] dark:text-[#ff94a6]" />
            <span>
              Network Conversion &amp; Engagement Depth
            </span>
            <span className="font-normal text-zinc-500 font-mono text-[11px]">
              ({activeCount} of {totalNetworkCount} relationships at top active tier)
            </span>
          </div>
          <div className="font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {responseRatePct}% Response Rate
            </span>{" "}
            •{" "}
            <span className="text-[#6B1728] dark:text-[#ff94a6] font-bold">
              {coreConversionPct}% Core Conversion
            </span>
          </div>
        </div>

        {/* Multi-segment bar */}
        <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${(stageCounts.discover / totalNetworkCount) * 100}%` }}
            className="h-full bg-blue-500 transition-all duration-500"
            title={`Discover: ${stageCounts.discover}`}
          />
          <div
            style={{ width: `${(stageCounts.shortlisted / totalNetworkCount) * 100}%` }}
            className="h-full bg-emerald-500 transition-all duration-500"
            title={`Connected / Shortlisted: ${stageCounts.shortlisted}`}
          />
          <div
            style={{ width: `${(stageCounts.inquired / totalNetworkCount) * 100}%` }}
            className="h-full bg-amber-500 transition-all duration-500"
            title={`Contacted / Inquired: ${stageCounts.inquired}`}
          />
          <div
            style={{ width: `${(stageCounts.consulted / totalNetworkCount) * 100}%` }}
            className="h-full bg-purple-500 transition-all duration-500"
            title={`Engaged / Consulted: ${stageCounts.consulted}`}
          />
          <div
            style={{ width: `${(stageCounts.hearing / totalNetworkCount) * 100}%` }}
            className="h-full bg-cyan-500 transition-all duration-500"
            title={`Meeting / Hearing: ${stageCounts.hearing}`}
          />
          <div
            style={{ width: `${(stageCounts.retained / totalNetworkCount) * 100}%` }}
            className="h-full bg-[#6B1728] transition-all duration-500"
            title={`Active Vakalatnama: ${stageCounts.retained}`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 font-medium pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Discover ({stageCounts.discover})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Connected ({stageCounts.shortlisted})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Contacted ({stageCounts.inquired})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            Engaged ({stageCounts.consulted})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            Meeting ({stageCounts.hearing})
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#6B1728] dark:text-[#ff94a6]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6B1728]" />
            Active Vakalatnama ({stageCounts.retained})
          </span>
        </div>
      </div>

      {/* =========================================================================
          SEARCH & FILTER ROW: SCREENSHOT 1 STRUCTURE
      ========================================================================= */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people, companies, jurisdiction, case matter..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Stage */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer font-medium"
            >
              <option value="all">All Stages</option>
              <option value="discover">1. Discover</option>
              <option value="shortlisted">2. Connected</option>
              <option value="inquired">3. Contacted</option>
              <option value="consulted">4. Engaged</option>
              <option value="hearing">5. Meeting</option>
              <option value="retained">6. Active Vakalatnama</option>
            </select>

            {/* Practice Areas / Industries */}
            <select
              value={selectedPracticeArea}
              onChange={(e) => setSelectedPracticeArea(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer font-medium"
            >
              <option value="all">All Industries</option>
              <option value="Constitutional Writs">Constitutional &amp; Writs</option>
              <option value="Property & Tenancy">Property &amp; Tenancy</option>
              <option value="Commercial Arbitration">Commercial Arbitration</option>
              <option value="Consumer Law">Consumer Law</option>
            </select>

            {/* Locations / Benches */}
            <select
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer font-medium"
            >
              <option value="all">All Locations</option>
              <option value="Kerala">Kerala High Court</option>
              <option value="Munsiff">Principal Munsiff, Ernakulam</option>
              <option value="NCLT">NCLT Kochi Bench</option>
              <option value="Consumer">District Consumer Commission</option>
              <option value="Supreme Court">Supreme Court of India</option>
            </select>

            {/* Sources */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer font-medium"
            >
              <option value="all">All Sources</option>
              <option value="AI Advocate Match">AI Advocate Match</option>
              <option value="InWorth Verified">InWorth Verified</option>
              <option value="Bar Council Directory">Bar Council Directory</option>
              <option value="Direct Recommendation">Direct Recommendation</option>
              <option value="Direct Reachout">Direct Reachout</option>
            </select>

            {/* Sort */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer font-medium"
            >
              <option value="recent">Recently Active</option>
              <option value="rating">Highest Rating</option>
              <option value="name">Name (A-Z)</option>
            </select>

            <button
              onClick={() => {
                setAddModalInitialStage("discover");
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#6B1728] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#581220] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MIDDLE SECTION: KANBAN FUNNEL COLUMNS (SCREENSHOT 2 STRUCTURE)
      ========================================================================= */}
      {viewMode === "kanban" ? (
        <div className="w-full overflow-x-auto pb-4 pt-1">
          <div className="flex gap-4 min-w-[1380px] items-start">
            {CITIZEN_STAGE_CONFIG.map((col) => {
              const contactsInCol = filteredContacts.filter((c) => c.stage === col.id);

              return (
                <div
                  key={col.id}
                  className="w-[280px] sm:w-[310px] shrink-0 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 p-3 space-y-3"
                >
                  {/* Column Header */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${col.accentBg}`} />
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-black dark:text-white">
                          {col.number} {col.title}
                        </h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${col.badgeBg} ${col.badgeText}`}
                      >
                        {contactsInCol.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-tight">
                      {col.subtitle}
                    </p>
                  </div>

                  {/* Cards List in this Column */}
                  <div className="space-y-3 min-h-[160px]">
                    {contactsInCol.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:shadow-md hover:border-black dark:hover:border-white transition-all space-y-2.5 relative group"
                      >
                        {/* Top: Avatar, Name, Degree/Rating, Role, Location */}
                        <div className="flex items-start gap-2.5">
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-full bg-zinc-800 text-white font-bold text-xs flex items-center justify-center border border-zinc-700 shadow-2xs">
                              {contact.name
                                .replace("Senior Adv.", "")
                                .replace("Adv.", "")
                                .trim()
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            {contact.isOnline && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black" />
                            )}
                          </div>

                          <div className="overflow-hidden flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-xs text-black dark:text-white truncate">
                                {contact.name}
                              </h4>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                1st
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-1">
                              {contact.role}
                            </p>
                            <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              <span>{contact.location}</span>
                            </p>
                          </div>
                        </div>

                        {/* Source Tag & Bar Verification */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            <Sparkles className="w-2.5 h-2.5 text-[#6B1728] dark:text-[#ff94a6]" />
                            {contact.source}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            ⭐ {contact.rating} ({contact.reviewsCount})
                          </span>
                        </div>

                        {/* Quote Snippet (italicized) */}
                        <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 text-[11px] text-zinc-600 dark:text-zinc-300 italic line-clamp-2">
                          &ldquo;{contact.statusQuote}&rdquo;
                        </div>

                        {/* Bottom Row: Timestamp + View > button */}
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px]">
                          <span className="flex items-center gap-1 text-zinc-400 font-mono">
                            <Clock className="w-3 h-3" />
                            {contact.lastActive}
                          </span>

                          <button
                            onClick={() => setSelectedContact(contact)}
                            className="font-bold text-[#6B1728] dark:text-[#ff94a6] hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {contactsInCol.length === 0 && (
                      <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-[11px] text-zinc-400 py-8">
                        No advocates in this stage.
                      </div>
                    )}
                  </div>

                  {/* Add Contact at bottom of column */}
                  <button
                    onClick={() => {
                      setAddModalInitialStage(col.id);
                      setIsAddModalOpen(true);
                    }}
                    className="w-full py-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors bg-white/50 dark:bg-black/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Contact</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-black dark:text-white">
              All Legal Contacts ({filteredContacts.length})
            </h3>
            <span className="text-xs text-zinc-500 font-mono">
              Displaying all advocates across pipeline
            </span>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
            {filteredContacts.map((c) => (
              <div
                key={c.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {c.name.replace("Senior Adv.", "").replace("Adv.", "").trim().slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-black dark:text-white">
                        {c.name}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        ⭐ {c.rating}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a6]">
                        {c.stage.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {c.role} • {c.court}
                    </p>
                    <p className="text-[11px] text-zinc-500 italic">
                      &ldquo;{c.statusQuote}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-[11px] font-mono text-zinc-500 hidden sm:block">
                    <div>{c.source}</div>
                    <div className="text-black dark:text-white font-bold">{c.feeText}</div>
                  </div>
                  <button
                    onClick={() => setSelectedContact(c)}
                    className="px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    View &gt;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          BOTTOM SECTION: SPLIT LAYOUT (SCREENSHOT 3 STRUCTURE)
          Left (65%): RECENT NETWORK ACTIVITY [Real-time badge]
          Right (35%):
            1. NETWORK INSIGHTS (4 metric cards: Network Size, Active Relationships, New Connections, Follow-ups Due)
            2. UPCOMING FOLLOW-UPS
            3. PEOPLE YOU MAY KNOW
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
        {/* =====================================================================
            LEFT PANEL: RECENT NETWORK ACTIVITY (lg:col-span-7)
        ===================================================================== */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#6B1728] dark:text-[#ff94a6]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                RECENT NETWORK ACTIVITY
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-time
            </span>
          </div>

          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 flex items-start gap-3 transition-colors hover:bg-zinc-100/70 dark:hover:bg-zinc-900"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <p className="text-zinc-800 dark:text-zinc-200">
                    <span className="font-extrabold text-black dark:text-white">
                      {act.advocateName}
                    </span>{" "}
                    {act.description}
                  </p>
                  <span className="text-[10px] font-mono text-zinc-400 block mt-1">
                    {act.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =====================================================================
            RIGHT PANEL: INSIGHTS, FOLLOW-UPS, RECOMMENDATIONS (lg:col-span-5)
        ===================================================================== */}
        <div className="lg:col-span-5 space-y-5">
          {/* Block 1: NETWORK INSIGHTS (4 Micro Metrics Grid) */}
          <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <Sparkles className="w-4 h-4 text-[#6B1728] dark:text-[#ff94a6]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                NETWORK INSIGHTS
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Insight 1: NETWORK SIZE */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                  NETWORK SIZE
                </span>
                <div className="text-xl font-black text-black dark:text-white">
                  {totalNetworkCount}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                  +{stageCounts.discover} this month
                </span>
              </div>

              {/* Insight 2: ACTIVE RELATIONSHIPS */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                  ACTIVE RELATIONSHIPS
                </span>
                <div className="text-xl font-black text-black dark:text-white">
                  {activeCount}
                </div>
                <span className="text-[10px] text-[#6B1728] dark:text-[#ff94a6] font-bold block">
                  High Value
                </span>
              </div>

              {/* Insight 3: NEW CONNECTIONS */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                  NEW CONNECTIONS
                </span>
                <div className="text-xl font-black text-black dark:text-white">
                  {stageCounts.shortlisted + stageCounts.inquired}
                </div>
                <span className="text-[10px] text-zinc-500 font-medium block">
                  Inbound &amp; Outbound
                </span>
              </div>

              {/* Insight 4: FOLLOW-UPS DUE */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                  FOLLOW-UPS DUE
                </span>
                <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                  {followUps.length}
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                  Action Required
                </span>
              </div>
            </div>
          </div>

          {/* Block 2: UPCOMING FOLLOW-UPS */}
          <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                UPCOMING FOLLOW-UPS
              </h3>
            </div>

            <div className="space-y-3">
              {followUps.map((fu) => (
                <div
                  key={fu.id}
                  className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 flex items-start gap-3 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 text-xs space-y-0.5">
                    <h4 className="font-extrabold text-black dark:text-white truncate">
                      {fu.advocateName}
                    </h4>
                    <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-tight">
                      {fu.task}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-mono font-bold pt-1 ${
                        fu.dueUrgent
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {fu.dueText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Block 3: PEOPLE YOU MAY KNOW */}
          <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <Users className="w-4 h-4 text-[#6B1728] dark:text-[#ff94a6]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                PEOPLE YOU MAY KNOW
              </h3>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-full bg-zinc-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {rec.name.replace("Adv.", "").trim().slice(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-extrabold text-xs text-black dark:text-white truncate">
                        {rec.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {rec.specialty}
                      </p>
                      <span className="text-[10px] text-zinc-400 font-mono block truncate">
                        {rec.court} • {rec.experience}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleSpecialist(rec.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      rec.status === "inquired"
                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        : "bg-[#6B1728] hover:bg-[#581220] text-white"
                    }`}
                  >
                    {rec.status === "inquired" ? "Pending" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: ADVOCATE DETAIL MODAL
      ========================================================================= */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-900 text-white font-bold text-sm flex items-center justify-center">
                  {selectedContact.name
                    .replace("Senior Adv.", "")
                    .replace("Adv.", "")
                    .trim()
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-black dark:text-white">
                      {selectedContact.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-bold">
                      ⭐ {selectedContact.rating}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">
                    {selectedContact.role}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedContact(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stage Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 block">
                Current Representation Stage
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {CITIZEN_STAGE_CONFIG.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleMoveStage(selectedContact.id, s.id)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold text-center cursor-pointer transition-all ${
                      selectedContact.stage === s.id
                        ? "bg-[#6B1728] text-white shadow-2xs"
                        : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-mono text-zinc-400 block">
                  BAR ENROLLMENT
                </span>
                <span className="font-mono font-bold text-black dark:text-white">
                  {selectedContact.barEnrollment}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-mono text-zinc-400 block">
                  COURT &amp; JURISDICTION
                </span>
                <span className="font-semibold text-black dark:text-white truncate block">
                  {selectedContact.court}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-mono text-zinc-400 block">
                  CONSULTATION FEE
                </span>
                <span className="font-mono font-semibold text-black dark:text-white">
                  {selectedContact.feeText}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-mono text-zinc-400 block">
                  OFFICIAL CONTACT
                </span>
                <span className="font-mono font-semibold text-black dark:text-white truncate block">
                  {selectedContact.phone}
                </span>
              </div>
            </div>

            {/* Assigned Matter Notice if Retained */}
            {selectedContact.assignedMatterNo && (
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">
                    Active Matter Assigned
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#6B1728] dark:text-[#ff94a6]">
                    Next Hearing: {selectedContact.nextHearingDate}
                  </span>
                </div>
                <div className="font-bold text-black dark:text-white">
                  {selectedContact.assignedMatterNo}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                  {selectedContact.assignedMatterTitle}
                </p>
              </div>
            )}

            {/* Status Quote */}
            <div className="p-3.5 rounded-xl bg-[#6B1728]/10 border border-[#6B1728]/25 text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#6B1728] dark:text-[#ff94a6] block">
                Latest Status &amp; Representation Note
              </span>
              <p className="italic">&ldquo;{selectedContact.statusQuote}&rdquo;</p>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedContact(null)}
                className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (onOpenConsultation) {
                    onOpenConsultation(selectedContact);
                  } else {
                    alert(`Opening direct consultation with ${selectedContact.name}.`);
                  }
                  setSelectedContact(null);
                }}
                className="px-4 py-2 rounded-full bg-[#6B1728] text-white text-xs font-bold cursor-pointer hover:bg-[#581220] transition-colors"
              >
                Book Consultation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD ADVOCATE MODAL
      ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <form
            onSubmit={handleCreateCounsel}
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  Add Legal Contact / Retain Advocate
                </h3>
                <p className="text-xs text-zinc-500">
                  Track a counsel, specialist advocate, or legal aid consultant in your team.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                  Advocate Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCounselName}
                  onChange={(e) => setNewCounselName(e.target.value)}
                  placeholder="e.g. Adv. K. Ramachandran Nair"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                  Title / Practice Focus
                </label>
                <input
                  type="text"
                  value={newCounselRole}
                  onChange={(e) => setNewCounselRole(e.target.value)}
                  placeholder="e.g. Senior Counsel • Land & Revenue Disputes"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    value={addModalInitialStage}
                    onChange={(e) => setAddModalInitialStage(e.target.value as CitizenPipelineStage)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
                  >
                    <option value="discover">1. Discover</option>
                    <option value="shortlisted">2. Connected</option>
                    <option value="inquired">3. Contacted</option>
                    <option value="consulted">4. Engaged</option>
                    <option value="hearing">5. Meeting</option>
                    <option value="retained">6. Active Vakalatnama</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                    Practice Specialty
                  </label>
                  <select
                    value={newCounselPracticeArea}
                    onChange={(e) => setNewCounselPracticeArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
                  >
                    <option value="Constitutional Writs">Constitutional Writs</option>
                    <option value="Property & Tenancy">Property &amp; Tenancy</option>
                    <option value="Commercial Arbitration">Commercial Arbitration</option>
                    <option value="Consumer Law">Consumer Law</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                    Court / Bench
                  </label>
                  <input
                    type="text"
                    value={newCounselCourt}
                    onChange={(e) => setNewCounselCourt(e.target.value)}
                    placeholder="High Court of Kerala"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                    Discovery Source
                  </label>
                  <select
                    value={newCounselSource}
                    onChange={(e) => setNewCounselSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
                  >
                    <option value="AI Advocate Match">AI Advocate Match</option>
                    <option value="InWorth Verified">InWorth Verified</option>
                    <option value="Bar Council Directory">Bar Council Directory</option>
                    <option value="Direct Recommendation">Direct Recommendation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                  Status Note / Case Synopsis
                </label>
                <input
                  type="text"
                  value={newCounselStatusQuote}
                  onChange={(e) => setNewCounselStatusQuote(e.target.value)}
                  placeholder="e.g. Discussed consultation for property injunction appeal"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#6B1728] text-white text-xs font-bold cursor-pointer hover:bg-[#581220] transition-colors"
              >
                Save Contact
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}