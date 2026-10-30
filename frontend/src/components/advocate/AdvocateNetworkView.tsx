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
  SlidersHorizontal,
  Layers,
  ArrowRight,
  Check,
  RefreshCw,
} from "lucide-react";

export type PipelineStage =
  | "discover"
  | "connected"
  | "contacted"
  | "engaged"
  | "meeting"
  | "active";

export interface NetworkContact {
  id: string;
  name: string;
  degree: "1st" | "2nd" | "3rd";
  role: string;
  chamber: string;
  bench: string;
  location: string;
  stage: PipelineStage;
  practiceArea: string;
  source: string;
  mutualsCount: number;
  statusQuote: string;
  lastActive: string;
  isOnline: boolean;
  barEnrollment: string;
  phone: string;
  email: string;
  briefsCount: number;
}

export interface ActivityItem {
  id: string;
  type: "connected" | "transitioned" | "brief" | "meeting";
  advocateName: string;
  description: string;
  timestamp: string;
}

export interface FollowUpItem {
  id: string;
  advocateName: string;
  task: string;
  dueText: string;
  dueUrgent?: boolean;
}

export interface RecommendedAdvocate {
  id: string;
  name: string;
  specialty: string;
  bar: string;
  mutuals: number;
  status: "connect" | "pending";
}

const INITIAL_CONTACTS: NetworkContact[] = [
  // 1. DISCOVER
  {
    id: "c-1",
    name: "Senior Adv. Sneha Kulkarni",
    degree: "2nd",
    role: "Senior Counsel • Constitutional & Civil Writs",
    chamber: "Kulkarni Law Chambers",
    bench: "High Court of Kerala",
    location: "Kochi, Kerala",
    stage: "discover",
    practiceArea: "Constitutional Law",
    source: "Network Recommendation",
    mutualsCount: 11,
    statusQuote: "Connection invitation dispatched via Bar Council Directory",
    lastActive: "1mo ago",
    isOnline: true,
    barEnrollment: "K/001429/2012",
    phone: "+91 94471 28910",
    email: "sneha.kulkarni@hcbar.in",
    briefsCount: 0,
  },
  {
    id: "c-2",
    name: "Adv. Tariq Mansoor",
    degree: "2nd",
    role: "Appellate Counsel • Commercial Disputes",
    chamber: "Mansoor & Associates",
    bench: "Delhi High Court",
    location: "New Delhi",
    stage: "discover",
    practiceArea: "Commercial Arbitration",
    source: "Network Recommendation",
    mutualsCount: 7,
    statusQuote: "Profile vetted for co-counseling in cross-border tech licensing",
    lastActive: "3w ago",
    isOnline: false,
    barEnrollment: "D/1092/2015",
    phone: "+91 98110 43921",
    email: "tariq@mansoorlaw.com",
    briefsCount: 0,
  },

  // 2. CONNECTED
  {
    id: "c-3",
    name: "Adv. Rahul Sharma",
    degree: "1st",
    role: "Chamber Head • Corporate Insolvency & IBC",
    chamber: "Sharma & Partners Law Offices",
    bench: "NCLAT / High Court of Karnataka",
    location: "Bengaluru, India",
    stage: "connected",
    practiceArea: "Corporate & Insolvency",
    source: "Network Recommendation",
    mutualsCount: 18,
    statusQuote: "Connection established; reciprocal briefing agreement shared",
    lastActive: "1mo ago",
    isOnline: true,
    barEnrollment: "KAR/2381/2014",
    phone: "+91 98450 19283",
    email: "rahul@sharmapartners.in",
    briefsCount: 1,
  },
  {
    id: "c-4",
    name: "Adv. Nandita Sengupta",
    degree: "1st",
    role: "Managing Associate • Banking & SARFAESI",
    chamber: "Calcutta Jurists Collective",
    bench: "Calcutta High Court",
    location: "Kolkata, West Bengal",
    stage: "connected",
    practiceArea: "Corporate & Insolvency",
    source: "Bar Council Directory",
    mutualsCount: 14,
    statusQuote: "Mutual referral protocol confirmed for DRT appeals",
    lastActive: "2w ago",
    isOnline: true,
    barEnrollment: "WB/892/2017",
    phone: "+91 98301 77291",
    email: "nandita@caljurists.com",
    briefsCount: 1,
  },
  {
    id: "c-5",
    name: "Adv. Raghavan Pillai",
    degree: "1st",
    role: "Standing Counsel • State Revenue & Stamp Duty",
    chamber: "Pillai Chambers of Law",
    bench: "High Court of Kerala",
    location: "Ernakulam, Kerala",
    stage: "connected",
    practiceArea: "Tax & Revenue",
    source: "High Court Bar Assn",
    mutualsCount: 22,
    statusQuote: "Accepted chamber alliance invite for Section 16 Telegraph Act matters",
    lastActive: "3w ago",
    isOnline: false,
    barEnrollment: "K/000984/2009",
    phone: "+91 94470 55432",
    email: "raghavan.pillai@keralabar.org",
    briefsCount: 2,
  },

  // 3. CONTACTED
  {
    id: "c-6",
    name: "Adv. Karan Patel",
    degree: "1st",
    role: "Director of Practice & Ops • Dispute Resolution",
    chamber: "Patel & Lex Associates",
    bench: "Bombay High Court",
    location: "Mumbai, India",
    stage: "contacted",
    practiceArea: "Commercial Arbitration",
    source: "LinkedIn Import",
    mutualsCount: 19,
    statusQuote: "Initial partnership message sent with joint case synopsis",
    lastActive: "1mo ago",
    isOnline: false,
    barEnrollment: "MAH/4102/2013",
    phone: "+91 98200 48190",
    email: "karan@patellex.in",
    briefsCount: 1,
  },
  {
    id: "c-7",
    name: "Adv. Vikramaditya Mehta",
    degree: "1st",
    role: "Senior Partner • IP, Trademarks & Media Rights",
    chamber: "Mehta Legal Chambers",
    bench: "High Court of Telangana",
    location: "Hyderabad, India",
    stage: "contacted",
    practiceArea: "Intellectual Property",
    source: "Direct Reachout",
    mutualsCount: 14,
    statusQuote: "Personalized intro message sent with prior judgment citations",
    lastActive: "1mo ago",
    isOnline: true,
    barEnrollment: "TS/1984/2011",
    phone: "+91 98490 33419",
    email: "vikram@mehtalegal.com",
    briefsCount: 1,
  },

  // 4. ENGAGED
  {
    id: "c-8",
    name: "Adv. Priya Sundaram",
    degree: "1st",
    role: "Principal Arbitration Counsel • Infra & Energy",
    chamber: "Sundaram Arbitration Chambers",
    bench: "Bombay High Court",
    location: "Mumbai, India",
    stage: "engaged",
    practiceArea: "Commercial Arbitration",
    source: "HC Bar Conference",
    mutualsCount: 31,
    statusQuote: "Positive response received: 'Would love to review rejoinder brief.'",
    lastActive: "1mo ago",
    isOnline: true,
    barEnrollment: "MAH/1820/2010",
    phone: "+91 98205 99401",
    email: "priya@sundaramchambers.in",
    briefsCount: 2,
  },
  {
    id: "c-9",
    name: "Adv. Farooq Abdullah Qureshi",
    degree: "1st",
    role: "Special Counsel • Criminal Appeals & Special Acts",
    chamber: "Qureshi & Co. Criminal Barristers",
    bench: "Delhi High Court",
    location: "New Delhi",
    stage: "engaged",
    practiceArea: "Criminal Appeals",
    source: "Referral Network",
    mutualsCount: 26,
    statusQuote: "Reviewed Section 482 quashing draft; suggested additional grounds",
    lastActive: "1w ago",
    isOnline: false,
    barEnrollment: "D/3920/2008",
    phone: "+91 98101 22849",
    email: "farooq@qureshilaw.com",
    briefsCount: 2,
  },

  // 5. MEETING / CHAMBER BRIEFING
  {
    id: "c-10",
    name: "Adv. Arjun Nambiar",
    degree: "1st",
    role: "Senior Chamber Counsel • Public Law & Writs",
    chamber: "Nambiar & Kurian Advocates",
    bench: "Supreme Court of India / High Court of Kerala",
    location: "Bengaluru / Ernakulam",
    stage: "meeting",
    practiceArea: "Constitutional Law",
    source: "Direct Reachout",
    mutualsCount: 22,
    statusQuote: "Chamber pre-trial strategy conference scheduled for Monday 10:30 AM",
    lastActive: "1mo ago",
    isOnline: true,
    barEnrollment: "K/001844/2007",
    phone: "+91 94473 11820",
    email: "arjun@nambiaradvocates.com",
    briefsCount: 3,
  },
  {
    id: "c-11",
    name: "Adv. Meenakshi Lekhi",
    degree: "1st",
    role: "Senior Advocate • Criminal Writs & CBI Matters",
    chamber: "Lekhi Chambers of Law",
    bench: "Delhi High Court Bar Association",
    location: "New Delhi",
    stage: "meeting",
    practiceArea: "Criminal Appeals",
    source: "Chamber Alumni",
    mutualsCount: 45,
    statusQuote: "Senior conference set for Thursday 04:30 PM on interim bail SLP",
    lastActive: "4d ago",
    isOnline: true,
    barEnrollment: "D/00492/1998",
    phone: "+91 98111 60293",
    email: "m.lekhi@delhibar.org",
    briefsCount: 3,
  },

  // 6. ACTIVE ALLIANCE / CO-COUNSEL
  {
    id: "c-12",
    name: "Senior Adv. K. Parasaran",
    degree: "1st",
    role: "Senior Counsel • Supreme Court Constitution Bench",
    chamber: "Parasaran Law Chambers",
    bench: "Supreme Court of India",
    location: "New Delhi",
    stage: "active",
    practiceArea: "Constitutional Law",
    source: "High Court Bar Assn",
    mutualsCount: 68,
    statusQuote: "Active Co-Counsel on WP(C) 19482/2024 Constitution Bench reference",
    lastActive: "1d ago",
    isOnline: true,
    barEnrollment: "SC/00012/1980",
    phone: "+91 98100 11200",
    email: "chambers@parasaran.legal",
    briefsCount: 5,
  },
  {
    id: "c-13",
    name: "Adv. Harish Salve KC",
    degree: "1st",
    role: "King's Counsel & Senior Advocate • Cross-Border Arbitrations",
    chamber: "Blackstone / Salve Chambers",
    bench: "Supreme Court / London Commercial Court",
    location: "Mumbai / London",
    stage: "active",
    practiceArea: "Commercial Arbitration",
    source: "Referral Network",
    mutualsCount: 82,
    statusQuote: "Designated Lead Senior on international enforcement arbitration matter",
    lastActive: "2d ago",
    isOnline: false,
    barEnrollment: "MAH/00055/1982",
    phone: "+44 20 7404 0000",
    email: "salve.clerk@blackstonechambers.com",
    briefsCount: 4,
  },
  {
    id: "c-14",
    name: "Adv. Rohinton Nariman Chambers",
    degree: "1st",
    role: "Arbitration Tribunal Arbitrator & Senior Advocate",
    chamber: "Nariman Legal Chambers",
    bench: "Supreme Court Bar Association",
    location: "New Delhi",
    stage: "active",
    practiceArea: "Corporate & Insolvency",
    source: "Bar Council Directory",
    mutualsCount: 54,
    statusQuote: "Joint settlement memo submitted under Section 30 Arbitration Act",
    lastActive: "3d ago",
    isOnline: true,
    barEnrollment: "SC/00098/1985",
    phone: "+91 98110 99882",
    email: "nariman@supremecourtbar.in",
    briefsCount: 3,
  },
];

const STAGE_CONFIG: {
  id: PipelineStage;
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
    subtitle: "People discovered through network recommendations.",
    accentBg: "bg-blue-500",
    badgeBg: "bg-blue-100 dark:bg-blue-950/60",
    badgeText: "text-blue-700 dark:text-blue-300",
  },
  {
    id: "connected",
    number: "2.",
    title: "CONNECTED",
    subtitle: "People who accepted or established a connection.",
    accentBg: "bg-emerald-500",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950/60",
    badgeText: "text-emerald-700 dark:text-emerald-300",
  },
  {
    id: "contacted",
    number: "3.",
    title: "CONTACTED",
    subtitle: "People who have been contacted.",
    accentBg: "bg-amber-500",
    badgeBg: "bg-amber-100 dark:bg-amber-950/60",
    badgeText: "text-amber-700 dark:text-amber-300",
  },
  {
    id: "engaged",
    number: "4.",
    title: "ENGAGED",
    subtitle: "People who replied or interacted.",
    accentBg: "bg-purple-500",
    badgeBg: "bg-purple-100 dark:bg-purple-950/60",
    badgeText: "text-purple-700 dark:text-purple-300",
  },
  {
    id: "meeting",
    number: "5.",
    title: "MEETING",
    subtitle: "People with a scheduled hearing or chamber briefing.",
    accentBg: "bg-cyan-500",
    badgeBg: "bg-cyan-100 dark:bg-cyan-950/60",
    badgeText: "text-cyan-700 dark:text-cyan-300",
  },
  {
    id: "active",
    number: "6.",
    title: "ACTIVE ALLIANCE",
    subtitle: "Senior counsel and active co-counsel alliances.",
    accentBg: "bg-[#6B1728]",
    badgeBg: "bg-[#6B1728]/15",
    badgeText: "text-[#6B1728] dark:text-[#ff94a6]",
  },
];

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "connected",
    advocateName: "Adv. Rahul Sharma",
    description: "accepted your connection request and reciprocal referral protocol.",
    timestamp: "2h ago",
  },
  {
    id: "act-2",
    type: "connected",
    advocateName: "Adv. Nandita Sengupta",
    description: "accepted your DRT appeal co-counsel invitation.",
    timestamp: "1d ago",
  },
  {
    id: "act-3",
    type: "transitioned",
    advocateName: "Senior Adv. K. Parasaran",
    description: "transitioned to Active Relationship partner for WP(C) 19482/2024.",
    timestamp: "2d ago",
  },
  {
    id: "act-4",
    type: "brief",
    advocateName: "Adv. Vikramaditya Mehta",
    description: "reviewed your counter-affidavit draft and shared 3 precedent annotations.",
    timestamp: "3d ago",
  },
  {
    id: "act-5",
    type: "meeting",
    advocateName: "Adv. Arjun Nambiar",
    description: "confirmed chamber briefing session for Monday 10:30 AM in Court Hall 4.",
    timestamp: "4d ago",
  },
  {
    id: "act-6",
    type: "transitioned",
    advocateName: "Dr. Siddharth Sen",
    description: "transitioned to Active Relationship partner.",
    timestamp: "38d ago",
  },
];

const INITIAL_FOLLOW_UPS: FollowUpItem[] = [
  {
    id: "fu-1",
    advocateName: "Adv. Vikramaditya Mehta",
    task: "Send follow-up on rejoinder draft & annexure list",
    dueText: "Due Tomorrow",
    dueUrgent: true,
  },
  {
    id: "fu-2",
    advocateName: "Adv. Arjun Nambiar",
    task: "Prepare compilation of Supreme Court citations for Bench 4",
    dueText: "In 2 days",
  },
  {
    id: "fu-3",
    advocateName: "Senior Adv. Harish Salve KC",
    task: "Confirm arbitral hearing timeline & procedural order 2",
    dueText: "In 4 days",
  },
];

const INITIAL_PEOPLE_YOU_MAY_KNOW: RecommendedAdvocate[] = [
  {
    id: "rec-1",
    name: "Adv. Sneha Kulkarni",
    specialty: "Constitutional & Tax • High Court of Kerala",
    bar: "Kerala High Court Bar Association",
    mutuals: 11,
    status: "pending",
  },
  {
    id: "rec-2",
    name: "Adv. Rohan Deshmukh",
    specialty: "Commercial Arbitration & IBC • NCLAT",
    bar: "Bombay High Court Bar Association",
    mutuals: 19,
    status: "connect",
  },
  {
    id: "rec-3",
    name: "Adv. Vrinda Grover",
    specialty: "Criminal Appeals & Writs • Delhi High Court",
    bar: "Delhi High Court Bar Association",
    mutuals: 34,
    status: "pending",
  },
];

export function AdvocateNetworkView() {
  const [contacts, setContacts] = useState<NetworkContact[]>(INITIAL_CONTACTS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(INITIAL_FOLLOW_UPS);
  const [recommendations, setRecommendations] = useState<RecommendedAdvocate[]>(
    INITIAL_PEOPLE_YOU_MAY_KNOW
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string>("all");
  const [selectedBench, setSelectedBench] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("recent");

  // View state: "kanban" vs "list"
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  // Detail Modal
  const [selectedContact, setSelectedContact] = useState<NetworkContact | null>(null);

  // Add Contact Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialStage, setAddModalInitialStage] = useState<PipelineStage>("discover");
  const [newContactName, setNewContactName] = useState("");
  const [newContactRole, setNewContactRole] = useState("");
  const [newContactBench, setNewContactBench] = useState("High Court of Kerala");
  const [newContactLocation, setNewContactLocation] = useState("Kochi, Kerala");
  const [newContactPracticeArea, setNewContactPracticeArea] = useState("Constitutional Law");
  const [newContactSource, setNewContactSource] = useState("Bar Council Directory");
  const [newContactStatusQuote, setNewContactStatusQuote] = useState("");

  // Filtering contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.chamber.toLowerCase().includes(q) ||
        c.bench.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.practiceArea.toLowerCase().includes(q);

      const matchStage = selectedStage === "all" || c.stage === selectedStage;
      const matchPractice =
        selectedPracticeArea === "all" || c.practiceArea === selectedPracticeArea;
      const matchBench = selectedBench === "all" || c.bench.includes(selectedBench);
      const matchSource = selectedSource === "all" || c.source === selectedSource;

      return matchSearch && matchStage && matchPractice && matchBench && matchSource;
    });
  }, [contacts, searchQuery, selectedStage, selectedPracticeArea, selectedBench, selectedSource]);

  // Stage breakdown
  const stageCounts = useMemo(() => {
    const counts: Record<PipelineStage, number> = {
      discover: 0,
      connected: 0,
      contacted: 0,
      engaged: 0,
      meeting: 0,
      active: 0,
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
  const contactedCount = stageCounts.contacted + stageCounts.engaged + stageCounts.meeting + stageCounts.active;
  const respondedCount = stageCounts.engaged + stageCounts.meeting + stageCounts.active;
  const meetingsCount = stageCounts.meeting;
  const activeCount = stageCounts.active;
  const responseRatePct = contactedCount > 0 ? Math.round((respondedCount / contactedCount) * 100) : 60;
  const coreConversionPct = totalNetworkCount > 0 ? Math.round((activeCount / totalNetworkCount) * 100) : 13;

  // Toggle recommendation connect status
  const handleToggleConnect = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextStatus = r.status === "connect" ? "pending" : "connect";
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
  };

  // Move stage
  const handleMoveStage = (contactId: string, newStage: PipelineStage) => {
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

  // Add Contact submission
  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    const newContact: NetworkContact = {
      id: `c-${Date.now()}`,
      name: newContactName.trim().startsWith("Adv.") || newContactName.trim().startsWith("Senior Adv.")
        ? newContactName.trim()
        : `Adv. ${newContactName.trim()}`,
      degree: "1st",
      role: newContactRole.trim() || "Chamber Associate • General Litigation",
      chamber: "Independent Chamber Practice",
      bench: newContactBench,
      location: newContactLocation,
      stage: addModalInitialStage,
      practiceArea: newContactPracticeArea,
      source: newContactSource,
      mutualsCount: Math.floor(Math.random() * 20) + 3,
      statusQuote: newContactStatusQuote.trim() || "Relationship initiated via Bar Council portal",
      lastActive: "Just now",
      isOnline: true,
      barEnrollment: `BCI/${Math.floor(Math.random() * 9000) + 1000}/2023`,
      phone: "+91 98000 00000",
      email: `${newContactName.toLowerCase().replace(/[^a-z]/g, "")}@barlaw.in`,
      briefsCount: 0,
    };

    setContacts((prev) => [newContact, ...prev]);

    // Also push to activity feed
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: "connected",
        advocateName: newContact.name,
        description: `added to pipeline at ${newContact.stage.toUpperCase()} stage.`,
        timestamp: "Just now",
      },
      ...prev,
    ]);

    // Reset and close
    setNewContactName("");
    setNewContactRole("");
    setNewContactStatusQuote("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="w-full space-y-6 font-sans">
      {/* =========================================================================
          TOP HEADER: EXACT MATCH TO SCREENSHOT 1
          Active Network Hub • Target: 50+ High-Value Alliances • Live Sync
          Professional Network [23 Contacts]
          Manage and track your professional relationships...
          + Add Contact
      ========================================================================= */}
      <div className="space-y-3">
        {/* Subtitle / Meta Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a6] border border-[#6B1728]/25 shadow-2xs">
            <Flame className="w-3.5 h-3.5 fill-[#6B1728] text-[#6B1728] dark:fill-[#ff94a6] dark:text-[#ff94a6]" />
            Active Network Hub
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
            Target: 50+ High-Value Bar Alliances
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
                Professional Network
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                {contacts.length} Contacts
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-3xl">
              Manage and track your professional relationships from discovery to active collaboration across pipeline stages.
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
              AI-Assisted Relationship Intelligence
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6 KPI METRIC CARDS ROW: EXACT MATCH TO SCREENSHOT 1
          1. TOTAL NETWORK (23, 0 added recently)
          2. NEW CONNECTIONS (+0, Active this month)
          3. CONTACTED (15, Outreach initiated)
          4. RESPONDED (9, 60% response rate)
          5. MEETINGS (3, 3 upcoming)
          6. ACTIVE RELATIONS... (3, Mentors, Leads & Partners)
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
            +{stageCounts.connected}
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
              ACTIVE ALLIANCES
            </span>
            <div className="w-6 h-6 rounded-full bg-[#6B1728]/15 flex items-center justify-center text-[#6B1728] dark:text-[#ff94a6]">
              <Handshake className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-black dark:text-white">
            {activeCount}
          </div>
          <p className="text-[11px] text-zinc-500 truncate">
            Senior Counsel &amp; Co-Counsel
          </p>
        </div>
      </div>

      {/* =========================================================================
          NETWORK CONVERSION & ENGAGEMENT DEPTH PROGRESS BAR: EXACT MATCH
          (3 of 23 relationships at top active tier) | 60% Response Rate • 13% Core Conversion
          Multi-color segmented bar + Legend below
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
            style={{ width: `${(stageCounts.connected / totalNetworkCount) * 100}%` }}
            className="h-full bg-emerald-500 transition-all duration-500"
            title={`Connected: ${stageCounts.connected}`}
          />
          <div
            style={{ width: `${(stageCounts.contacted / totalNetworkCount) * 100}%` }}
            className="h-full bg-amber-500 transition-all duration-500"
            title={`Contacted: ${stageCounts.contacted}`}
          />
          <div
            style={{ width: `${(stageCounts.engaged / totalNetworkCount) * 100}%` }}
            className="h-full bg-purple-500 transition-all duration-500"
            title={`Engaged: ${stageCounts.engaged}`}
          />
          <div
            style={{ width: `${(stageCounts.meeting / totalNetworkCount) * 100}%` }}
            className="h-full bg-cyan-500 transition-all duration-500"
            title={`Meeting: ${stageCounts.meeting}`}
          />
          <div
            style={{ width: `${(stageCounts.active / totalNetworkCount) * 100}%` }}
            className="h-full bg-[#6B1728] transition-all duration-500"
            title={`Active Alliance: ${stageCounts.active}`}
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
            Connected ({stageCounts.connected})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Contacted ({stageCounts.contacted})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            Engaged ({stageCounts.engaged})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            Meeting ({stageCounts.meeting})
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#6B1728] dark:text-[#ff94a6]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6B1728]" />
            Active Alliance ({stageCounts.active})
          </span>
        </div>
      </div>

      {/* =========================================================================
          SEARCH & FILTER ROW: EXACT MATCH TO SCREENSHOT 1
          Search people, companies, jurisdiction...
          All Stages v | All Industries v | All Locations v | All Sources v | Recently Active v
          + Add Contact
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
              placeholder="Search people, chambers, benches, practice areas..."
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
              <option value="connected">2. Connected</option>
              <option value="contacted">3. Contacted</option>
              <option value="engaged">4. Engaged</option>
              <option value="meeting">5. Meeting</option>
              <option value="active">6. Active Alliance</option>
            </select>

            {/* Practice Areas / Industries */}
            <select
              value={selectedPracticeArea}
              onChange={(e) => setSelectedPracticeArea(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer font-medium"
            >
              <option value="all">All Practice Areas</option>
              <option value="Constitutional Law">Constitutional &amp; Writs</option>
              <option value="Corporate & Insolvency">Corporate &amp; Insolvency</option>
              <option value="Commercial Arbitration">Commercial Arbitration</option>
              <option value="Criminal Appeals">Criminal Appeals</option>
              <option value="Tax & Revenue">Tax &amp; Revenue</option>
              <option value="Intellectual Property">Intellectual Property</option>
            </select>

            {/* Locations / Benches */}
            <select
              value={selectedBench}
              onChange={(e) => setSelectedBench(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer font-medium"
            >
              <option value="all">All Benches / Locations</option>
              <option value="Kerala">High Court of Kerala</option>
              <option value="Delhi">Delhi High Court</option>
              <option value="Bombay">Bombay High Court</option>
              <option value="Supreme Court">Supreme Court of India</option>
              <option value="NCLAT">NCLAT / NCLT</option>
            </select>

            {/* Sources */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer font-medium"
            >
              <option value="all">All Sources</option>
              <option value="Network Recommendation">Network Recommendation</option>
              <option value="Bar Council Directory">Bar Council Directory</option>
              <option value="High Court Bar Assn">High Court Bar Assn</option>
              <option value="LinkedIn Import">LinkedIn Import</option>
              <option value="Direct Reachout">Direct Reachout</option>
              <option value="Referral Network">Referral Network</option>
            </select>

            {/* Sort */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer font-medium"
            >
              <option value="recent">Recently Active</option>
              <option value="name">Name (A-Z)</option>
              <option value="mutuals">Most Mutuals</option>
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
          MIDDLE SECTION: KANBAN FUNNEL COLUMNS (SCREENSHOT 2)
          Horizontal scrollable 6 pipeline columns with contact cards
      ========================================================================= */}
      {viewMode === "kanban" ? (
        <div className="w-full overflow-x-auto pb-4 pt-1">
          <div className="flex gap-4 min-w-[1380px] items-start">
            {STAGE_CONFIG.map((col) => {
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
                        {/* Top: Avatar, Name, Degree, Role, Location */}
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
                                {contact.degree}
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

                        {/* Source Tag & Mutuals */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            <Sparkles className="w-2.5 h-2.5 text-[#6B1728] dark:text-[#ff94a6]" />
                            {contact.source}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {contact.mutualsCount} mutuals
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
                        No contacts in this stage.
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
        /* List / Table View */
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-black dark:text-white">
              All Contacts ({filteredContacts.length})
            </h3>
            <span className="text-xs text-zinc-500 font-mono">
              Displaying filtered advocates &amp; chamber allies
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
                        {c.degree}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a6]">
                        {c.stage.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {c.role} • {c.bench}
                    </p>
                    <p className="text-[11px] text-zinc-500 italic">
                      &ldquo;{c.statusQuote}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-[11px] font-mono text-zinc-500 hidden sm:block">
                    <div>{c.source}</div>
                    <div>{c.mutualsCount} mutual connections</div>
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
          BOTTOM SECTION: SPLIT LAYOUT (SCREENSHOT 3)
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
                  ACTIVE ALLIANCES
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
                  {stageCounts.connected + stageCounts.contacted}
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
                        {rec.mutuals} mutual connections
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleConnect(rec.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      rec.status === "pending"
                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        : "bg-[#6B1728] hover:bg-[#581220] text-white"
                    }`}
                  >
                    {rec.status === "pending" ? "Pending" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: CONTACT DETAIL MODAL (WHEN CLICKING 'VIEW >')
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
                      {selectedContact.degree}
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
                Current Pipeline Stage
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {STAGE_CONFIG.map((s) => (
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
                  BENCH &amp; COURT
                </span>
                <span className="font-semibold text-black dark:text-white truncate block">
                  {selectedContact.bench}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-mono text-zinc-400 block">
                  PHONE CONTACT
                </span>
                <span className="font-mono font-semibold text-black dark:text-white">
                  {selectedContact.phone}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-mono text-zinc-400 block">
                  OFFICIAL EMAIL
                </span>
                <span className="font-mono font-semibold text-black dark:text-white truncate block">
                  {selectedContact.email}
                </span>
              </div>
            </div>

            {/* Latest Status Quote */}
            <div className="p-3.5 rounded-xl bg-[#6B1728]/10 border border-[#6B1728]/25 text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#6B1728] dark:text-[#ff94a6] block">
                Latest Interaction Note
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
                  alert(`Case brief draft shared with ${selectedContact.name}.`);
                  setSelectedContact(null);
                }}
                className="px-4 py-2 rounded-full bg-[#6B1728] text-white text-xs font-bold cursor-pointer hover:bg-[#581220] transition-colors"
              >
                Send Case Brief
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD CONTACT MODAL (+ Add Contact button)
      ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <form
            onSubmit={handleCreateContact}
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  Add Professional Contact
                </h3>
                <p className="text-xs text-zinc-500">
                  Track a colleague, senior counsel, or referral partner in your pipeline.
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
                  Full Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. Adv. Arvind Narayanan"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={newContactRole}
                  onChange={(e) => setNewContactRole(e.target.value)}
                  placeholder="e.g. Senior Partner • Corporate Arbitration"
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
                    onChange={(e) => setAddModalInitialStage(e.target.value as PipelineStage)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
                  >
                    <option value="discover">1. Discover</option>
                    <option value="connected">2. Connected</option>
                    <option value="contacted">3. Contacted</option>
                    <option value="engaged">4. Engaged</option>
                    <option value="meeting">5. Meeting</option>
                    <option value="active">6. Active Alliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                    Practice Area
                  </label>
                  <select
                    value={newContactPracticeArea}
                    onChange={(e) => setNewContactPracticeArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
                  >
                    <option value="Constitutional Law">Constitutional &amp; Writs</option>
                    <option value="Corporate & Insolvency">Corporate &amp; Insolvency</option>
                    <option value="Commercial Arbitration">Commercial Arbitration</option>
                    <option value="Criminal Appeals">Criminal Appeals</option>
                    <option value="Tax & Revenue">Tax &amp; Revenue</option>
                    <option value="Intellectual Property">Intellectual Property</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                    Primary Bench
                  </label>
                  <input
                    type="text"
                    value={newContactBench}
                    onChange={(e) => setNewContactBench(e.target.value)}
                    placeholder="High Court of Kerala"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                    Discovery Source
                  </label>
                  <select
                    value={newContactSource}
                    onChange={(e) => setNewContactSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
                  >
                    <option value="Bar Council Directory">Bar Council Directory</option>
                    <option value="High Court Bar Assn">High Court Bar Assn</option>
                    <option value="Network Recommendation">Network Recommendation</option>
                    <option value="LinkedIn Import">LinkedIn Import</option>
                    <option value="Direct Reachout">Direct Reachout</option>
                    <option value="Referral Network">Referral Network</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                  Status Note / Initial Interaction
                </label>
                <input
                  type="text"
                  value={newContactStatusQuote}
                  onChange={(e) => setNewContactStatusQuote(e.target.value)}
                  placeholder="e.g. Discussed joint representation in commercial suit"
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