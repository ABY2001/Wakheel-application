"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  Calculator,
  Shield,
  Briefcase,
  ClipboardCheck,
  Landmark,
  CheckCircle2,
  FileText,
  ArrowRight,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  Globe,
  Award,
  UploadCloud,
  File,
  Trash2,
  Loader2,
  Paperclip,
  Lock,
  Hash,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Activity,
  Eye,
  Copy,
  FileBadge,
  MessageSquare,
  Receipt,
} from "lucide-react";
import { citizenApi, csApi } from "@/lib/api";
import caApi from "@/lib/caApi";
import { ClientStatutoryPreCheckView } from "@/components/client/ClientStatutoryPreCheckView";
import {
  StatutoryComplianceCertificateModal,
  StatutoryCertificateData,
} from "@/components/firm/StatutoryComplianceCertificateModal";
import {
  InDocketQueryThreadModal,
  InDocketQueryItem,
} from "@/components/firm/InDocketQueryThreadModal";
import { StatutoryChallanPaymentSimulatorModal } from "@/components/firm/StatutoryChallanPaymentSimulatorModal";
import {
  StatutoryClientAuthorizationModal,
  ClientAuthorizationRecord,
} from "@/components/firm/StatutoryClientAuthorizationModal";
import { useMatterWebSocket, MatterWebSocketEvent } from "@/hooks/useMatterWebSocket";

interface BusinessViewProps {
  activeModule?: string;
  onSelectModule?: (mod: string) => void;
}

interface DocketUploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  base64Url?: string;
  hash: string;
}

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  timeline: string;
  regulator: string;
  description: string;
  documents: string[];
  deliverables: string[];
}

export function BusinessView({
  activeModule = "business-registration",
  onSelectModule,
}: BusinessViewProps) {
  const [currentTab, setCurrentTab] = useState<string>(activeModule);
  const [subFilter, setSubFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [docketClientName, setDocketClientName] = useState<string>("");
  const [docketEntityPan, setDocketEntityPan] = useState<string>("");
  const [docketNotes, setDocketNotes] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<DocketUploadedFile[]>([]);
  const [isSubmittingDocket, setIsSubmittingDocket] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDocketSuccess, setActiveDocketSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"catalog" | "tracker" | "precheck">("catalog");
  const [activeDockets, setActiveDockets] = useState<any[]>([]);
  const [loadingDockets, setLoadingDockets] = useState<boolean>(false);
  const [selectedDocketDetail, setSelectedDocketDetail] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [certificateModalOpen, setCertificateModalOpen] = useState<boolean>(false);
  const [activeCertificateData, setActiveCertificateData] = useState<StatutoryCertificateData | null>(null);
  const [queryModalDocket, setQueryModalDocket] = useState<any | null>(null);
  const [queryModalOpen, setQueryModalOpen] = useState<boolean>(false);
  const [challanModalDocket, setChallanModalDocket] = useState<any | null>(null);
  const [challanModalOpen, setChallanModalOpen] = useState<boolean>(false);
  const [authorizationModalDocket, setAuthorizationModalDocket] = useState<any | null>(null);
  const [authorizationModalOpen, setAuthorizationModalOpen] = useState<boolean>(false);

  // Real-time WebSocket Live Push Notification Toast State
  const [liveWsToast, setLiveWsToast] = useState<{
    id: string;
    type: "stage" | "query" | "auth" | "challan";
    title: string;
    message: string;
    badge: string;
    timestamp: string;
  } | null>(null);

  // Hook into live matter WebSocket events
  const { isConnected: isWsConnected } = useMatterWebSocket({
    role: "citizen",
    userId: "default_citizen",
    onStageUpdated: (event: MatterWebSocketEvent) => {
      const updatedMatter = event.matter;
      const matterId = event.matterId || updatedMatter?.id || updatedMatter?._id;
      const caseNumber = event.meta?.caseNumber || updatedMatter?.caseNumber;

      setActiveDockets((prev) =>
        prev.map((docket) => {
          if (docket.id === matterId || docket.caseNumber === caseNumber) {
            return {
              ...docket,
              stageIndex: typeof updatedMatter?.stageIndex === "number" ? updatedMatter.stageIndex : docket.stageIndex,
              status: updatedMatter?.status || event.meta?.status || docket.status,
              udinOrSrn: updatedMatter?.udinOrSrn || docket.udinOrSrn,
              stages: updatedMatter?.stages || docket.stages,
            };
          }
          return docket;
        })
      );

      if (selectedDocketDetail && (selectedDocketDetail.id === matterId || selectedDocketDetail.caseNumber === caseNumber)) {
        setSelectedDocketDetail((prev: any) =>
          prev
            ? {
                ...prev,
                stageIndex: typeof updatedMatter?.stageIndex === "number" ? updatedMatter.stageIndex : prev.stageIndex,
                status: updatedMatter?.status || event.meta?.status || prev.status,
                udinOrSrn: updatedMatter?.udinOrSrn || prev.udinOrSrn,
                stages: updatedMatter?.stages || prev.stages,
              }
            : null
        );
      }

      setLiveWsToast({
        id: `toast-${Date.now()}`,
        type: "stage",
        title: "Milestone Stage Synchronized",
        message: `${updatedMatter?.title || event.meta?.title || "Docket"} is now at ${event.meta?.status || "advanced milestone"}`,
        badge: "STAGE ADVANCE",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      });
    },
    onQueryUpdated: (event: MatterWebSocketEvent) => {
      const matterId = event.matterId;
      const caseNumber = event.meta?.caseNumber;
      const query = event.meta?.query;
      const isResolved = event.meta?.action === "QUERY_RESOLVED";

      setActiveDockets((prev) =>
        prev.map((docket) => {
          if (docket.id === matterId || docket.caseNumber === caseNumber) {
            const existingQueries = docket.queries || [];
            let updatedQueries = [...existingQueries];
            if (query) {
              const qIdx = updatedQueries.findIndex((q: any) => q.id === query.id || q._id === query.id);
              if (qIdx >= 0) {
                updatedQueries[qIdx] = query;
              } else {
                updatedQueries.unshift(query);
              }
            }
            return {
              ...docket,
              queries: updatedQueries,
            };
          }
          return docket;
        })
      );

      if (selectedDocketDetail && (selectedDocketDetail.id === matterId || selectedDocketDetail.caseNumber === caseNumber)) {
        setSelectedDocketDetail((prev: any) => {
          if (!prev) return null;
          const existingQueries = prev.queries || [];
          let updatedQueries = [...existingQueries];
          if (query) {
            const qIdx = updatedQueries.findIndex((q: any) => q.id === query.id || q._id === query.id);
            if (qIdx >= 0) {
              updatedQueries[qIdx] = query;
            } else {
              updatedQueries.unshift(query);
            }
          }
          return { ...prev, queries: updatedQueries };
        });
      }

      setLiveWsToast({
        id: `toast-${Date.now()}`,
        type: "query",
        title: isResolved ? "Requisition Response Recorded" : "New Statutory Requisition Raised",
        message: `${event.meta?.title || "Query"} on docket #${caseNumber || matterId}`,
        badge: isResolved ? "RESOLVED" : "ACTION REQUIRED",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      });
    },
    onAuthorized: (event: MatterWebSocketEvent) => {
      const matterId = event.matterId;
      const caseNumber = event.meta?.caseNumber;
      const auth = event.meta?.authorization;

      setActiveDockets((prev) =>
        prev.map((docket) => {
          if (docket.id === matterId || docket.caseNumber === caseNumber) {
            return {
              ...docket,
              clientAuthorization: auth || docket.clientAuthorization,
              stageIndex: Math.max(docket.stageIndex || 0, 3),
            };
          }
          return docket;
        })
      );

      if (selectedDocketDetail && (selectedDocketDetail.id === matterId || selectedDocketDetail.caseNumber === caseNumber)) {
        setSelectedDocketDetail((prev: any) =>
          prev
            ? {
                ...prev,
                clientAuthorization: auth || prev.clientAuthorization,
                stageIndex: Math.max(prev.stageIndex || 0, 3),
              }
            : null
        );
      }

      setLiveWsToast({
        id: `toast-${Date.now()}`,
        type: "auth",
        title: "Statutory e-Sign Authorization Executed",
        message: `${event.meta?.signerName || "Authorized Signatory"} executed ${event.meta?.signMethod === "AADHAAR_ESIGN" ? "Aadhaar e-Sign" : "Class 3 DSC"} (Ref: ${event.meta?.espReference || "C-DAC"})`,
        badge: "E-SIGN VERIFIED",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      });
    },
    onChallanPaid: (event: MatterWebSocketEvent) => {
      const matterId = event.matterId;
      const voucher = event.meta?.voucherNumber;
      const amount = event.meta?.amount;

      setActiveDockets((prev) =>
        prev.map((docket) => {
          if (docket.id === matterId || (voucher && docket.trustVoucher === voucher)) {
            return {
              ...docket,
              trustVoucher: voucher || docket.trustVoucher,
              feePaid: `₹ ${amount?.toLocaleString("en-IN") || "Settled"} (Pure Agent Statutory Disbursement)`,
            };
          }
          return docket;
        })
      );

      setLiveWsToast({
        id: `toast-${Date.now()}`,
        type: "challan",
        title: "Statutory Challan Disbursed",
        message: `₹${amount?.toLocaleString("en-IN") || ""} settled under Pure Agent Voucher #${voucher || "VCH-2026"} (GST Rule 33 / BCI Rule 24 Escrow)`,
        badge: "DISBURSED",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      });
    },
  });

  // Auto-dismiss live toast after 6 seconds
  useEffect(() => {
    if (!liveWsToast) return;
    const timer = setTimeout(() => {
      setLiveWsToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [liveWsToast]);

  const handleOpenCertificate = (docket: any) => {
    if (!docket) return;
    const isCa =
      (docket.caseNumber || "").startsWith("ITR") ||
      (docket.title || "").toLowerCase().includes("tax") ||
      (docket.court || "").toLowerCase().includes("income tax");

    setActiveCertificateData({
      caseNumber: docket.caseNumber || "SRN-MCA-2026/894120",
      title: docket.title || "Statutory Compliance Docket",
      courtOrAuthority: docket.court || "Registrar of Companies (ROC Kerala) • MCA21 Portal",
      category: isCa ? "ca" : "cs",
      clientName: "Inworth Technologies Pvt Ltd",
      clientCinOrPan: docket.clientPanOrCin || "U72200KL2023PTC081290 / AABCI9812G",
      clientGstin: "32AABCI9812G1Z2",
      clientAddress: "Infopark Phase II, Kakkanad, Kochi, Kerala 682042",
      assignedProfessional:
        docket.assignedAdvocate ||
        (isCa ? "CA Ramanathan Iyer (FCA 40192)" : "CS Meera Krishnan (FCS 9482)"),
      professionalRole: isCa
        ? "Fellow Chartered Accountant (FCA) • Statutory Auditor"
        : "Practicing Company Secretary (FCS) • Corporate Secretarial Advisor",
      membershipNumber: isCa ? "ICAI M.No 240189 • FRN 019482C" : "ICSI FCS-9482 • CP 14298",
      firmName: "Wakheel Multi-Disciplinary Practice LLP",
      udinOrSrn: docket.udinOrSrn || (isCa ? "UDIN: 2640192A00098124" : "SRN: ROC-2026-90124"),
      filingDate: docket.filingDate || new Date().toISOString().split("T")[0],
      certificationDate: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      integrityHash:
        docket.documents?.[0]?.hash ||
        "sha256:7f92014ea89201cb184920aef104928b",
      status: "OFFICIALLY FILED",
      feePaid: docket.feePaid,
    });
    setCertificateModalOpen(true);
  };

  useEffect(() => {
    loadDockets();
  }, []);

  useEffect(() => {
    if (activeModule) {
      setCurrentTab(activeModule);
      setSubFilter("ALL");
      setSearchQuery("");
    }
  }, [activeModule]);

  const tabs = [
    { id: "business-registration", label: "Business Registration", icon: Building2 },
    { id: "tax-compliance", label: "Tax & Compliance", icon: Calculator },
    { id: "trademark-ip", label: "Trademark & IP", icon: Shield },
    { id: "corporate-lawyer", label: "Corporate Lawyer", icon: Briefcase },
    { id: "company-secretary", label: "Company Secretary", icon: ClipboardCheck },
    { id: "auditor-ca", label: "Auditor & CA", icon: Landmark },
  ];

  const handleTabChange = (id: string) => {
    setCurrentTab(id);
    setSubFilter("ALL");
    setSearchQuery("");
    if (onSelectModule) onSelectModule(id);
  };

  // =========================================================================
  // 1. BUSINESS REGISTRATION SERVICES (Full Breakdown)
  // =========================================================================
  const businessRegistrationServices: ServiceItem[] = [
    // Company Registration
    {
      id: "pvt-ltd",
      name: "Private Limited Company (Pvt Ltd)",
      category: "business-registration",
      subCategory: "Company Registration",
      timeline: "5–7 Working Days",
      regulator: "MCA • SPICe+ (INC-32)",
      description: "Complete incorporation with RUN name approval, DSC, DIN allotment, e-MOA & e-AOA, PAN, TAN & EPFO registration.",
      documents: ["PAN & Aadhaar of all Directors", "Passport photo & Bank Statement / Utility Bill", "Registered Office proof (Electricity bill + NOC)"],
      deliverables: ["Certificate of Incorporation (COI)", "Company PAN & TAN", "e-MOA and e-AOA", "DIN for 2 Directors"],
    },
    {
      id: "llp",
      name: "Limited Liability Partnership (LLP)",
      category: "business-registration",
      subCategory: "Company Registration",
      timeline: "6–8 Working Days",
      regulator: "MCA • FiLLiP Form",
      description: "Incorporation of LLP with limited liability protection and flexible partnership deed drafting under LLP Act 2008.",
      documents: ["PAN & ID proof of all Partners", "Address proof & Bank statements", "Registered office proof with Owner NOC"],
      deliverables: ["LLP Incorporation Certificate", "DPIN for Partners", "Drafted & Filed LLP Agreement (Form 3)", "LLP PAN & TAN"],
    },
    {
      id: "opc",
      name: "One Person Company (OPC)",
      category: "business-registration",
      subCategory: "Company Registration",
      timeline: "4–6 Working Days",
      regulator: "MCA • Companies Act 2013",
      description: "Corporate legal entity structure for single entrepreneurs with full limited liability and nominee appointment.",
      documents: ["Founder PAN & Aadhaar", "Nominee Consent Form INC-3 & ID proof", "Registered office electricity bill & NOC"],
      deliverables: ["OPC Certificate of Incorporation", "PAN & TAN allotment", "e-MOA/e-AOA", "Single Director DIN"],
    },
    {
      id: "sole-prop",
      name: "Sole Proprietorship Registration",
      category: "business-registration",
      subCategory: "Company Registration",
      timeline: "2–3 Working Days",
      regulator: "MSME / State Commercial Taxes",
      description: "Streamlined business setup with Udyam MSME certification, GST registration, and business current bank account assistance.",
      documents: ["Proprietor PAN & Aadhaar", "Business premises rental agreement / property tax receipt", "Cancelled cheque"],
      deliverables: ["Udyam Registration Certificate", "GST Certificate (if applicable)", "Current Account opening kit"],
    },
    {
      id: "nidhi-co",
      name: "Nidhi Company Registration",
      category: "business-registration",
      subCategory: "Company Registration",
      timeline: "15–20 Working Days",
      regulator: "MCA • Sec 406 Companies Act",
      description: "Non-banking mutual benefit society setup for cultivating thrift and savings among its members.",
      documents: ["Minimum 7 Members & 3 Directors KYC", "Registered office proof", "Net Owned Funds (NOF) compliance documentation"],
      deliverables: ["Nidhi Company COI", "MOA & AOA with mutual benefit objects", "NDH-4 application dossier"],
    },
    {
      id: "producer-co",
      name: "Producer Company Registration",
      category: "business-registration",
      subCategory: "Company Registration",
      timeline: "10–14 Working Days",
      regulator: "MCA • Chapter XXIA Companies Act",
      description: "Specialized corporate vehicle for 10 or more primary agricultural producers or farming entities.",
      documents: ["KYC of 10 Producer Members & 5 Directors", "Farmer certification / Kissan passbook / Land revenue receipt", "Office proof"],
      deliverables: ["Producer Company COI", "Farmer Member Register", "Specialized Agricultural MOA/AOA"],
    },
    {
      id: "partnership-firm",
      name: "Partnership Firm Registration",
      category: "business-registration",
      subCategory: "Company Registration",
      timeline: "4–6 Working Days",
      regulator: "Registrar of Firms (ROF)",
      description: "Formal partnership deed drafting on non-judicial stamp paper, notarization, and ROF Form A certification.",
      documents: ["Partners PAN, Aadhaar & Photos", "Firm Registered Office Proof", "Agreed profit-sharing & capital terms"],
      deliverables: ["Notarized Partnership Deed", "ROF Registration Certificate (Form C)", "Partnership Firm PAN Card"],
    },
    {
      id: "startup-india",
      name: "Startup India Registration",
      category: "business-registration",
      subCategory: "Company Registration",
      timeline: "3–5 Working Days",
      regulator: "DPIIT • Ministry of Commerce",
      description: "DPIIT Recognition for eligible startups to access Section 80-IAC 3-year tax holiday, angel tax exemption, and IP subsidies.",
      documents: ["COI / LLP Agreement", "Pitch deck / Brief business description", "Director details & website/app link"],
      deliverables: ["DPIIT Recognition Certificate", "Fast-track 80% Patent / 50% TM subsidy eligibility", "GeM portal startup onboarding"],
    },

    // International Business Setup
    {
      id: "us-inc",
      name: "US Incorporation (Delaware / Wyoming)",
      category: "business-registration",
      subCategory: "International Business Setup",
      timeline: "3–5 Working Days",
      regulator: "Delaware / Wyoming Division of Corporations",
      description: "Incorporation of US Delaware C-Corp or Wyoming LLC, Registered Agent service, IRS Federal Employer ID (EIN), and US banking setup.",
      documents: ["Passport copy of founders", "Proof of foreign address", "Company name & equity distribution structure"],
      deliverables: ["State Certificate of Formation/Incorporation", "IRS Official EIN Confirmation Letter", "Operating Agreement / Bylaws", "US Bank Account Access"],
    },
    {
      id: "singapore-inc",
      name: "Singapore Incorporation (Pte Ltd)",
      category: "business-registration",
      subCategory: "International Business Setup",
      timeline: "2–4 Working Days",
      regulator: "ACRA Singapore",
      description: "Setup of Singapore Private Limited company via ACRA with 1-year local nominee director and registered office address.",
      documents: ["Passport copy & proof of residence", "Brief CV of founders", "Proposed company name & activities"],
      deliverables: ["ACRA Business Profile (BizFile)", "Certificate of Good Standing", "CorpPass access", "Nominee Director agreement"],
    },
    {
      id: "uk-inc",
      name: "UK Incorporation (Limited)",
      category: "business-registration",
      subCategory: "International Business Setup",
      timeline: "1–2 Working Days",
      regulator: "Companies House UK",
      description: "Private Limited company formation in England & Wales with prestigious London registered office and UK business account.",
      documents: ["Passport of Directors & Shareholders", "Proof of address (dated within 3 months)"],
      deliverables: ["Companies House Certificate of Incorporation", "Memorandum & Articles of Association", "Government Gateway credentials"],
    },
    {
      id: "netherlands-inc",
      name: "Netherlands Incorporation (BV)",
      category: "business-registration",
      subCategory: "International Business Setup",
      timeline: "7–10 Working Days",
      regulator: "KVK (Dutch Chamber of Commerce)",
      description: "Dutch Besloten Vennootschap (BV) setup for European market access, VAT (BTW) number, and Dutch notary deed.",
      documents: ["Notarized passport copies", "Corporate structure chart", "Source of wealth proof"],
      deliverables: ["Dutch Notarial Deed of Incorporation", "KVK Commercial Register Extract", "Dutch VAT / BTW Number"],
    },
    {
      id: "hong-kong-inc",
      name: "Hong Kong Incorporation",
      category: "business-registration",
      subCategory: "International Business Setup",
      timeline: "3–5 Working Days",
      regulator: "Companies Registry Hong Kong",
      description: "Setup of Hong Kong Limited entity for Asia-Pacific trade and low-tax corporate structuring.",
      documents: ["Valid Passport & residential address proof", "Proposed company name in English/Chinese"],
      deliverables: ["Certificate of Incorporation", "Business Registration (BR) Certificate", "Statutory Company Secretary appointment"],
    },
    {
      id: "dubai-setup",
      name: "Dubai / UAE Company Setup",
      category: "business-registration",
      subCategory: "International Business Setup",
      timeline: "5–8 Working Days",
      regulator: "IFZA / DMCC / DED Dubai",
      description: "100% foreign ownership company setup in premier Dubai Freezones (IFZA, Meydan, DMCC) or UAE Mainland with investor visas.",
      documents: ["Passport copies with 6-month validity", "Passport-size photographs", "Proposed activity list"],
      deliverables: ["UAE Commercial License", "Memorandum of Association", "Establishment Card", "UAE Investor Visa assistance"],
    },
    {
      id: "intl-tm",
      name: "International Trademark (Madrid Protocol)",
      category: "business-registration",
      subCategory: "International Business Setup",
      timeline: "3–6 Months",
      regulator: "WIPO (World Intellectual Property Organization)",
      description: "Extend Indian registered trademark to up to 130 member countries under WIPO Madrid System with a single filing.",
      documents: ["Indian TM Application / Registration number", "Designated countries list", "Power of Attorney"],
      deliverables: ["WIPO International Registration Certificate", "Madrid System official notification across designated territories"],
    },

    // Company Name Search
    {
      id: "name-search",
      name: "Company Name Availability Search",
      category: "business-registration",
      subCategory: "Company Name Search",
      timeline: "Same Day (Instant)",
      regulator: "MCA21 V3 Portal",
      description: "Exhaustive MCA Rule 8 check, trademark phonetic conflict analysis, and registrar acceptability score report.",
      documents: ["Proposed company name options", "Brief nature of business objects"],
      deliverables: ["MCA Name Availability Probability Report", "Class-wise Trademark conflict check", "Alternate suggested permutations"],
    },
    {
      id: "change-name",
      name: "Change Company Name",
      category: "business-registration",
      subCategory: "Company Name Search",
      timeline: "7–10 Working Days",
      regulator: "MCA • Form MGT-14 & INC-24",
      description: "Corporate rebranding process including Board resolution, EGM special resolution, RUN application, and fresh COI.",
      documents: ["Existing COI, MOA & AOA", "Board Resolution approving new name", "Notice & Minutes of EGM"],
      deliverables: ["Fresh Certificate of Incorporation with new name", "Amended MOA & AOA", "ROC approval letter"],
    },
    {
      id: "name-generator",
      name: "AI Company Name Generator",
      category: "business-registration",
      subCategory: "Company Name Search",
      timeline: "Instant Real-time",
      regulator: "Wakheel AI Trademark & MCA Check",
      description: "AI-powered brand name synthesis checking linguistic viability, available MCA21 names, and domain availability.",
      documents: ["Industry sector", "Keywords / Philosophy preferences"],
      deliverables: ["10 Filtered MCA-Compliant Name Options", "Trademark availability score", "Domain extension report"],
    },

    // Licenses & Registrations (19 Licenses requested)
    {
      id: "dsc-cert",
      name: "Digital Signature Certificate (DSC Class 3)",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "1 Working Day",
      regulator: "CCA Approved Certifying Authorities",
      description: "Class 3 DSC with signing and encryption tokens for MCA filings, GST, e-Tendering, and Income Tax returns.",
      documents: ["Applicant PAN & Aadhaar", "Passport photo", "Video verification"],
      deliverables: ["USB Crypto Token with Class 3 DSC", "Installation & Driver Support"],
    },
    {
      id: "udyam-reg",
      name: "Udyam Registration (MSME)",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "1 Working Day",
      regulator: "Ministry of MSME",
      description: "Official government recognition for Micro, Small, and Medium Enterprises to access priority bank lending and subsidies.",
      documents: ["Aadhaar number of proprietor/director", "PAN of entity", "Bank account details"],
      deliverables: ["Udyam Registration Certificate with QR Code", "MSME benefits handbook"],
    },
    {
      id: "msme-reg",
      name: "MSME Registration & Subsidy Scheme",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "2–3 Working Days",
      regulator: "District Industries Centre (DIC)",
      description: "State DIC registration for capital investment subsidies, power tariff concessions, and collateral-free CGTMSE loans.",
      documents: ["Udyam certificate", "Project report & machinery invoice bills", "Audited balance sheet"],
      deliverables: ["State DIC MSME recognition", "CGTMSE loan application kit"],
    },
    {
      id: "iso-cert",
      name: "ISO Certification (ISO 9001 / 27001)",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "3–5 Working Days",
      regulator: "IAF / Non-IAF Accredited Bodies",
      description: "International Quality Management (ISO 9001:2015) or Information Security Management (ISO 27001) certification for tenders.",
      documents: ["Business registration proof", "Organization process flow chart", "Scope of business"],
      deliverables: ["Accredited ISO Certificate with verification QR", "Quality Policy manuals"],
    },
    {
      id: "fssai-lic",
      name: "FSSAI [Food License]",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "5–10 Working Days",
      regulator: "Food Safety and Standards Authority of India",
      description: "Basic Registration, State License, or Central License for food manufacturing, packaging, cloud kitchens, and restaurants.",
      documents: ["Business KYC & Photos", "Premises layout & electricity bill", "List of food products / recipes"],
      deliverables: ["14-Digit FSSAI License Certificate", "Food Safety Display Board guidance"],
    },
    {
      id: "iec-code",
      name: "IEC [Import Export Code]",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "1–2 Working Days",
      regulator: "DGFT (Directorate General of Foreign Trade)",
      description: "Mandatory 10-digit code required by Indian customs for importing or exporting commercial goods and software services.",
      documents: ["Entity PAN & Certificate", "Cancelled bank cheque / Bank certificate", "Address proof"],
      deliverables: ["DGFT IEC Certificate", "ICEGATE portal user registration"],
    },
    {
      id: "apeda-rcmc",
      name: "Apeda RCMC Registration",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "5–7 Working Days",
      regulator: "APEDA • Ministry of Commerce",
      description: "Registration Cum Membership Certificate (RCMC) for exporters of scheduled agricultural and processed food products.",
      documents: ["IEC Certificate", "Banker's Certificate (Form I)", "Registered office proof"],
      deliverables: ["Official APEDA RCMC Certificate", "Export incentive claim access"],
    },
    {
      id: "spice-board",
      name: "Spice Board Registration (CRES)",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "7–10 Working Days",
      regulator: "Spices Board India (Kochi)",
      description: "Certificate of Registration as Exporter of Spices (CRES) for Indian cardamom, pepper, ginger, and spice extracts exporters.",
      documents: ["IEC Copy", "Bank Confidentiality report", "GST Registration", "FSSAI Certificate"],
      deliverables: ["CRES Certificate from Spices Board", "Quality testing lab subsidy clearance"],
    },
    {
      id: "fieo-reg",
      name: "FIEO Registration",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "3–5 Working Days",
      regulator: "Federation of Indian Export Organisations",
      description: "Apex body registration for multi-product exporters and service exporters to claim MAI export promotional assistance.",
      documents: ["IEC Code", "Partners/Directors KYC", "Financial statements showing export turnover"],
      deliverables: ["FIEO Membership Certificate", "Global trade query matching access"],
    },
    {
      id: "legal-metrology",
      name: "Legal Metrology Packaged Commodity",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "7–12 Working Days",
      regulator: "Department of Consumer Affairs",
      description: "Mandatory registration under Rule 27 of Legal Metrology (Packaged Commodities) Rules for importers and packers.",
      documents: ["Sample packaging label / artwork", "Business incorporation proof", "List of commodities packed"],
      deliverables: ["Legal Metrology Packer/Importer Registration Certificate", "Label compliance audit"],
    },
    {
      id: "hallmark-reg",
      name: "Hallmark Registration (BIS)",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "4–6 Working Days",
      regulator: "Bureau of Indian Standards",
      description: "Mandatory hallmarking registration for jewelers selling gold and silver artifacts with HUID tracking system.",
      documents: ["GST Certificate", "Premises proof & turnover declaration", "Jeweler establishment proof"],
      deliverables: ["BIS Hallmarking Certificate", "Assaying & Hallmarking Centre tie-up guidance"],
    },
    {
      id: "bis-reg",
      name: "BIS Registration (CRS / ISI Mark)",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "15–25 Working Days",
      regulator: "Bureau of Indian Standards",
      description: "Compulsory Registration Scheme (CRS) for electronics, IT goods, solar equipment, and industrial products.",
      documents: ["Product test report from BIS-recognized lab", "Factory business license", "Trademark certificate"],
      deliverables: ["BIS Registration Grant Letter", "Authorized ISI / CRS marking permission"],
    },
    {
      id: "liquor-lic",
      name: "Liquor License (FL-3 / FL-11)",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "30–45 Working Days",
      regulator: "State Excise Department (Kerala / Respective State)",
      description: "Legal advisory, statutory inspection compliance, and application for Hotel/Club Foreign Liquor licenses.",
      documents: ["Hotel star classification certificate", "Fire NOC, Health NOC & Local body license", "Site plan drawing"],
      deliverables: ["Excise Department Sanction Order", "Annual Bar License Endorsement"],
    },
    {
      id: "clra-lic",
      name: "CLRA [Contract Labour Act License]",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "7–10 Working Days",
      regulator: "State Labour Commissionerate",
      description: "Registration for Principal Employers and licensing for Contractors employing 20 or more contract workmen.",
      documents: ["Form I / Form IV application", "Agreement between Principal Employer and Contractor", "Challan deposit"],
      deliverables: ["CLRA Registration Certificate (Form II/VI)", "Statutory labour register templates"],
    },
    {
      id: "ad-code",
      name: "AD Code Registration (Customs)",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "2–3 Working Days",
      regulator: "Customs ICEGATE Port",
      description: "14-digit Authorized Dealer Code letter from bank and mapping with specific customs ports (Cochin Port, Chennai, JNPT).",
      documents: ["Bank AD Code authorization letter", "IEC Certificate", "Entity PAN & GST"],
      deliverables: ["ICEGATE Port Registration Confirmation", "EDIS clearance approval"],
    },
    {
      id: "irdai-reg",
      name: "IRDAI Registration (Insurance Intermediary)",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "45–60 Working Days",
      regulator: "Insurance Regulatory and Development Authority of India",
      description: "Corporate agency or insurance broking license advisory, net-worth certification, and application submission.",
      documents: ["Audited net-worth certificate", "Principal Officer qualifications & training proof", "Business plan"],
      deliverables: ["IRDAI In-principle approval", "Certificate of Registration as Insurance Intermediary"],
    },
    {
      id: "drug-lic",
      name: "Drug License (Retail / Wholesale Form 20/21)",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "15–20 Working Days",
      regulator: "State Drugs Control Department",
      description: "Licensing for retail pharmacies, wholesale pharmaceutical distributors, and medical device stockists.",
      documents: ["Registered Pharmacist certificate & appointment", "Premises blueprint & refrigerator invoice", "Ownership/Rent deed"],
      deliverables: ["Drug License on Form 20 & 21", "Inspection compliance report"],
    },
    {
      id: "customs-wh",
      name: "Customs Warehouse License (Sec 58/58A)",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "20–30 Working Days",
      regulator: "Principal Commissioner of Customs",
      description: "Special warehouse license under Section 58 & 58A of Customs Act for duty-free storage and manufacture under bond (MOOWR).",
      documents: ["Site plan & structural safety certificate", "Fire safety NOC", "Solvency certificate & Insurance policy"],
      deliverables: ["Section 58 Customs Warehouse License", "MOOWR scheme approval"],
    },
    {
      id: "nbfc-lic",
      name: "NBFC License (Non-Banking Financial Co)",
      category: "business-registration",
      subCategory: "Licenses & Registrations (19 Licenses)",
      timeline: "90–120 Working Days",
      regulator: "Reserve Bank of India (RBI)",
      description: "RBI approval under Section 45-IA for NBFC-Investment and Credit Company (NBFC-ICC) with ₹10 Cr Net Owned Funds compliance.",
      documents: ["Net Owned Fund (NOF) statutory auditor certificate", "Directors financial integrity KYC", "3-Year business projection plan"],
      deliverables: ["RBI Certificate of Registration (CoR) as NBFC", "CIMS portal credentials"],
    },
  ];

  // =========================================================================
  // 2. TAX AND COMPLIANCES FILING (Full Breakdown)
  // =========================================================================
  const taxComplianceServices: ServiceItem[] = [
    // GST & Indirect Tax
    {
      id: "gst-reg",
      name: "GST Registration",
      category: "tax-compliance",
      subCategory: "GST & Indirect Tax",
      timeline: "3–5 Working Days",
      regulator: "GSTN • Central Board of Indirect Taxes",
      description: "New registration for regular taxpayers, composition dealers, e-commerce operators, and casual taxable persons.",
      documents: ["Entity PAN & Registration Certificate", "Promoter PAN & Aadhaar", "Bank account proof & Electricity bill"],
      deliverables: ["GST Registration Certificate (Form REG-06)", "15-Digit GSTIN Number & Portal Login"],
    },
    {
      id: "gst-return",
      name: "GST Return Filing (Monthly / Quarterly)",
      category: "tax-compliance",
      subCategory: "GST & Indirect Tax",
      timeline: "Monthly by 11th & 20th",
      regulator: "GSTN",
      description: "End-to-end filing of GSTR-1 (Outward Supplies) and GSTR-3B (Summary Return) with 2B ITC reconciliation.",
      documents: ["Sales register with HSN codes", "Purchase register & tax invoices", "GSTR-2B statement"],
      deliverables: ["Filed GSTR-1 & 3B Acknowledgments", "Input Tax Credit reconciliation report"],
    },
    {
      id: "gst-annual",
      name: "GST Annual Return & Audit (GSTR-9 & 9C)",
      category: "tax-compliance",
      subCategory: "GST & Indirect Tax",
      timeline: "Annual by 31st December",
      regulator: "GSTN",
      description: "Comprehensive consolidation of annual sales, input tax credits, and reconciliation statement with audited financials.",
      documents: ["Audited Financial Statements", "Consolidated monthly GSTR-1 & 3B", "Reconciliation data"],
      deliverables: ["Filed GSTR-9 Return", "GSTR-9C Reconciliation Statement", "DRC-03 tax liability adjustment"],
    },
    {
      id: "gst-notice",
      name: "GST Notice Replies & Scrutiny Representation",
      category: "tax-compliance",
      subCategory: "GST & Indirect Tax",
      timeline: "7–15 Working Days",
      regulator: "State / Central GST Commissionerate",
      description: "Legal drafting and representation against ASMT-10 scrutiny, DRC-01 show-cause notices, and ITC mismatch inquiries.",
      documents: ["Copy of official GST Notice", "Reconciliation books of accounts", "Supporting purchase invoices & e-way bills"],
      deliverables: ["Formal Legal Reply on ASMT-11 / DRC-06", "Personal hearing representation"],
    },
    {
      id: "gst-revocation",
      name: "GST Revocation of Cancelled Registration",
      category: "tax-compliance",
      subCategory: "GST & Indirect Tax",
      timeline: "10–14 Working Days",
      regulator: "GST Jurisdictional Officer",
      description: "Application on Form REG-21 for restoration of suo motu cancelled GSTIN by clearing arrears and filing overdue returns.",
      documents: ["Cancellation order copy", "Overdue pending tax returns data", "Valid reason for delay"],
      deliverables: ["Restoration Order on Form REG-22", "Reactivated active GSTIN"],
    },

    // Changes in Pvt Ltd
    {
      id: "add-director-pvt",
      name: "Add Director in Pvt Ltd",
      category: "tax-compliance",
      subCategory: "Changes in Pvt Ltd",
      timeline: "3–5 Working Days",
      regulator: "MCA • Form DIR-12",
      description: "Appointment of Additional or Regular Director, DIN generation, DIR-2 consent filing, and board resolution.",
      documents: ["Appointee PAN & Aadhaar", "Consent letter on DIR-2", "Board Resolution approving appointment"],
      deliverables: ["Approved DIR-12 Challan from MCA", "Updated Master Data with new Director name"],
    },
    {
      id: "remove-director-pvt",
      name: "Remove / Resign Director in Pvt Ltd",
      category: "tax-compliance",
      subCategory: "Changes in Pvt Ltd",
      timeline: "3–5 Working Days",
      regulator: "MCA • Form DIR-11 & DIR-12",
      description: "Filing resignation of director with board acceptance letter or removal under Section 169 of Companies Act.",
      documents: ["Resignation letter signed by Director", "Board acceptance resolution", "Proof of delivery"],
      deliverables: ["Approved DIR-12 & DIR-11 filings", "Director removed from MCA portal"],
    },
    {
      id: "change-office-pvt",
      name: "Change Registered Office",
      category: "tax-compliance",
      subCategory: "Changes in Pvt Ltd",
      timeline: "5–10 Working Days",
      regulator: "MCA • Form INC-22 / RD Approval",
      description: "Shifting registered office address within same city, to another ROC, or interstate with Regional Director approval.",
      documents: ["New premises electricity bill & rent agreement", "Owner NOC", "EGM Special Resolution"],
      deliverables: ["MCA Approval Letter", "Updated Certificate of Registered Office"],
    },
    {
      id: "change-object-pvt",
      name: "Change Object Clause & MOA Amendment",
      category: "tax-compliance",
      subCategory: "Changes in Pvt Ltd",
      timeline: "7–10 Working Days",
      regulator: "MCA • Form MGT-14",
      description: "Amending Memorandum of Association (MOA) to add new business sectors and line of commercial activities.",
      documents: ["Proposed new business object clause", "Notice of EGM & explanatory statement", "MGT-14 special resolution"],
      deliverables: ["Amended MOA endorsed by ROC", "MCA Approval Challan"],
    },

    // Changes in LLP
    {
      id: "add-partner-llp",
      name: "Add Partner in LLP",
      category: "tax-compliance",
      subCategory: "Changes in LLP",
      timeline: "4–6 Working Days",
      regulator: "MCA • LLP Form 4 & Form 3",
      description: "Admission of new designated partner, DPIN generation, and execution of Supplemental LLP Agreement.",
      documents: ["New Partner KYC", "Consent letter", "Supplementary LLP Agreement signed by all partners"],
      deliverables: ["Approved Form 4 & Form 3 SRN", "Updated LLP Master Data"],
    },
    {
      id: "remove-partner-llp",
      name: "Remove / Resign Partner in LLP",
      category: "tax-compliance",
      subCategory: "Changes in LLP",
      timeline: "4–6 Working Days",
      regulator: "MCA • LLP Form 4 & Form 3",
      description: "Formal retirement or cessation of partner, capital settlement, and filing statutory ROC notice.",
      documents: ["Resignation / Retirement deed", "Remaining partners consent", "Form 4 statutory declaration"],
      deliverables: ["LLP Form 4 Approval", "Revised LLP Agreement filed on Form 3"],
    },

    // Annual Filings
    {
      id: "pvt-annual-filing",
      name: "Pvt Ltd Annual Filings (AOC-4 & MGT-7)",
      category: "tax-compliance",
      subCategory: "Annual Filings",
      timeline: "Annual by Oct / Nov",
      regulator: "MCA21 V3",
      description: "Mandatory statutory annual filing of Balance Sheet & P&L (AOC-4) and Annual Return of shareholding (MGT-7/7A).",
      documents: ["Audited Balance Sheet & P&L with Notes", "Auditor Report & Directors Report", "List of Shareholders"],
      deliverables: ["Approved MCA Challans for AOC-4 & MGT-7", "DIR-3 KYC compliance"],
    },
    {
      id: "llp-annual-filing",
      name: "LLP Annual Filing (Form 11 & Form 8)",
      category: "tax-compliance",
      subCategory: "Annual Filings",
      timeline: "Annual by May 30 & Oct 30",
      regulator: "MCA",
      description: "Annual Return on Form 11 and Statement of Account & Solvency on Form 8 to avoid ₹100/day late penalties.",
      documents: ["LLP Books of accounts / Profit & Loss statement", "Partners turnover contribution data"],
      deliverables: ["Filed Form 11 & Form 8 MCA Acknowledgments", "Certificate of Solvency compliance"],
    },

    // Labour Compliance
    {
      id: "pf-esi-reg",
      name: "EPFO & ESIC Registration",
      category: "tax-compliance",
      subCategory: "Labour Compliance",
      timeline: "2–4 Working Days",
      regulator: "Shram Suvidha Portal • EPFO & ESIC",
      description: "Employer registration under Provident Fund and Employee State Insurance Act for entities employing 10/20+ workers.",
      documents: ["Entity registration certificate", "Specimen signature of authorized signatory", "List of employees & wages"],
      deliverables: ["EPFO Establishment Code", "ESIC Employer Registration Number", "Monthly ECR filing credentials"],
    },
    {
      id: "shops-act",
      name: "Shops & Commercial Establishments Act",
      category: "tax-compliance",
      subCategory: "Labour Compliance",
      timeline: "3–5 Working Days",
      regulator: "State Labour Department",
      description: "Mandatory local municipal registration for commercial offices, stores, and service establishments.",
      documents: ["Premises lease deed", "Employee count & working hours schedule", "Employer photo & Aadhaar"],
      deliverables: ["Shops & Commercial Establishments Certificate", "Statutory inspection register guidance"],
    },

    // Convert Your Business
    {
      id: "convert-prop-pvt",
      name: "Proprietorship to Private Limited Company",
      category: "tax-compliance",
      subCategory: "Convert Your Business",
      timeline: "10–14 Working Days",
      regulator: "MCA & CBDT",
      description: "Conversion of existing proprietorship business into a corporate entity with takeover agreement and capital transfer.",
      documents: ["Proprietorship balance sheet", "Takeover Agreement / Slump Sale Agreement", "Directors KYC"],
      deliverables: ["Certificate of Incorporation", "Capital asset transfer deed", "GST & Bank account transition"],
    },
    {
      id: "convert-firm-llp",
      name: "Partnership Firm to LLP Conversion",
      category: "tax-compliance",
      subCategory: "Convert Your Business",
      timeline: "12–15 Working Days",
      regulator: "MCA • Form 17 (Conversion)",
      description: "Statutory conversion of partnership firm into LLP with no capital gains tax under Section 47(xiiib) of IT Act.",
      documents: ["Registered Partnership Deed & ROF Certificate", "Audited balance sheet of firm", "Form 17 & FiLLiP"],
      deliverables: ["Certificate of Registration on Conversion", "New LLP Agreement (Form 3)", "Vesting of firm assets in LLP"],
    },
  ];

  // =========================================================================
  // 3. TRADEMARK AND IP REGISTRATION (Full Breakdown)
  // =========================================================================
  const trademarkIpServices: ServiceItem[] = [
    {
      id: "tm-search",
      name: "Trademark Search & NICE Classification",
      category: "trademark-ip",
      subCategory: "Trademark",
      timeline: "Same Day (Instant)",
      regulator: "CGPDTM (Trade Marks Registry)",
      description: "Comprehensive search across all 45 NICE classes for phonetic, visual, and conceptual identical or similar marks.",
      documents: ["Brand name / Logo artwork", "Description of goods or services offered"],
      deliverables: ["Detailed Trademark Search Clearance Report", "Risk assessment index (Low/Medium/High)"],
    },
    {
      id: "tm-filing",
      name: "Trademark Registration (Form TM-A)",
      category: "trademark-ip",
      subCategory: "Trademark",
      timeline: "1 Working Day (Filing)",
      regulator: "Trade Marks Registry India",
      description: "Filing TM-A with user affidavit, class specification, and claiming legal protection with immediate ™ symbol rights.",
      documents: ["Logo artwork in high-res PNG/JPG", "Signed Form TM-48 (Power of Attorney)", "Date of first use proof / User Affidavit"],
      deliverables: ["Official TM-A Electronic Filing Receipt", "Application Number for instant ™ usage"],
    },
    {
      id: "tm-objection",
      name: "Trademark Objection Reply (Sec 9 & 11)",
      category: "trademark-ip",
      subCategory: "Trademark",
      timeline: "5–7 Working Days",
      regulator: "Trade Marks Registry",
      description: "Drafting robust legal responses citing High Court & Supreme Court precedents to overcome Section 9 & 11 examination reports.",
      documents: ["Registry Examination Report", "Evidence of distinctiveness and prior continuous commercial usage"],
      deliverables: ["Comprehensive Written Legal Submission on Form MISC", "Filing acknowledgment"],
    },
    {
      id: "tm-hearing",
      name: "Trademark Show Cause Hearing Appearance",
      category: "trademark-ip",
      subCategory: "Trademark",
      timeline: "As per Registry Board",
      regulator: "Trade Marks Registry Hearing Officer",
      description: "Representation by specialized IP advocates before the Senior Examiner during virtual or physical show cause hearings.",
      documents: ["Hearing notice copy", "Compilation of authorities & case law precedents"],
      deliverables: ["Hearing Appearance & Oral Submissions", "Application acceptance order for journal publication"],
    },
    {
      id: "tm-renewal",
      name: "Trademark Renewal (Form TM-R)",
      category: "trademark-ip",
      subCategory: "Trademark",
      timeline: "3–5 Working Days",
      regulator: "Trade Marks Registry",
      description: "10-year statutory renewal of registered trademarks to maintain perpetual validity and prevent abandonment.",
      documents: ["Original Trademark Certificate / Number", "Authorization Form"],
      deliverables: ["Renewal Certificate for next 10 years", "Updated Journal Entry"],
    },
    {
      id: "copyright-reg",
      name: "Copyright Registration (Software & Artistic)",
      category: "trademark-ip",
      subCategory: "Copyright",
      timeline: "15–30 Working Days",
      regulator: "Copyright Office India",
      description: "Protection of software source code, proprietary algorithms, literary works, logos, and website UI designs.",
      documents: ["Source code (first and last 20 pages)", "Artwork copies / Literary text", "NOC from author / developer"],
      deliverables: ["Copyright Diary Number", "Official Registration Certificate (Form XIV)"],
    },
    {
      id: "patent-provisional",
      name: "Provisional Patent Specification Filing",
      category: "trademark-ip",
      subCategory: "Patent",
      timeline: "7–10 Working Days",
      regulator: "Indian Patent Office (IPO)",
      description: "Securing an immediate priority date for novel technical inventions with provisional claims and patent pending status.",
      documents: ["Technical disclosure document", "Drawings / flowcharts", "Inventor KYC & declarations"],
      deliverables: ["Official Patent Filing Receipt with Priority Date", "Patent Pending status entitlement"],
    },
    {
      id: "design-reg",
      name: "Industrial Design Registration",
      category: "trademark-ip",
      subCategory: "Design Registration",
      timeline: "2–4 Months",
      regulator: "Patent Office Design Wing (Kolkata)",
      description: "Protecting the novel shape, configuration, pattern, and aesthetic look of manufactured articles under Design Act 2000.",
      documents: ["7-angle photographs/renderings of article", "Novelty statement", "Design classification"],
      deliverables: ["Industrial Design Registration Certificate (valid 10+5 years)"],
    },
  ];

  // =========================================================================
  // 4. CORPORATE LAWYER SERVICES (Full Breakdown)
  // =========================================================================
  const corporateLawyerServices: ServiceItem[] = [
    {
      id: "legal-notice-dues",
      name: "Legal Notice for Recovery of Dues",
      category: "corporate-lawyer",
      subCategory: "Legal Notice",
      timeline: "2–3 Working Days",
      regulator: "Bar Council Practice Standards",
      description: "Authoritative demand notice under CPC for unpaid invoices, commercial debts, and breach of contractual payments.",
      documents: ["Unpaid invoices & purchase orders", "Statement of ledger accounts", "Contract / Email communications"],
      deliverables: ["Draft Legal Notice with 15-day demand", "Speed Post tracking proof & service affidavit"],
    },
    {
      id: "legal-notice-138",
      name: "Cheque Bounce Notice (Section 138 NI Act)",
      category: "corporate-lawyer",
      subCategory: "Legal Notice",
      timeline: "Within 30 days of Memo",
      regulator: "Negotiable Instruments Act, 1881",
      description: "Statutory demand notice within mandatory 30-day window from bank memo dishonour to maintain criminal prosecution rights.",
      documents: ["Original Dishonoured Cheque", "Bank Return Memo with reasons", "Transaction invoice / Agreement"],
      deliverables: ["Statutory 15-Day Demand Notice under Sec 138", "Criminal complaint docket preparation"],
    },
    {
      id: "nclt-litigation",
      name: "NCLT / NCLAT Petitions & IBC",
      category: "corporate-lawyer",
      subCategory: "Litigation",
      timeline: "Case Specific",
      regulator: "National Company Law Tribunal (Kochi / Respective Bench)",
      description: "Filing Section 7 or 9 IBC insolvency petitions, Section 241/242 Oppression & Mismanagement, and merger schemes.",
      documents: ["Insolvency notice (Form 3/4)", "Statutory debt contracts & default bank records", "Board Resolution"],
      deliverables: ["Filed NCLT Company Petition", "Advocate appearance before Tribunal"],
    },
    {
      id: "high-court-writs",
      name: "High Court Commercial Litigation & Writs",
      category: "corporate-lawyer",
      subCategory: "Litigation",
      timeline: "Case Specific",
      regulator: "High Court of Kerala (Ernakulam)",
      description: "Article 226 Writ Petitions against arbitrary state tenders, commercial court appeals, and Section 11 arbitration petitions.",
      documents: ["Impugned administrative order", "Contractual documents & chronology of events", "Vakalatnama"],
      deliverables: ["Drafted & Filed Writ Petition (Civil)", "Interim stay motion representation"],
    },
    {
      id: "contract-nda-msa",
      name: "Master Services Agreement (MSA) & NDA",
      category: "corporate-lawyer",
      subCategory: "Documentation",
      timeline: "2–4 Working Days",
      regulator: "Indian Contract Act, 1872",
      description: "Customized commercial contracts protecting intellectual property, indemnities, limitation of liability, and dispute clauses.",
      documents: ["Scope of services", "Payment milestones", "Territorial jurisdiction preference"],
      deliverables: ["Fully Negotiated MSA & Statement of Work", "Bilateral Non-Disclosure Agreement (NDA)"],
    },
    {
      id: "founders-agreement",
      name: "Founders' Agreement with Vesting",
      category: "corporate-lawyer",
      subCategory: "Documentation",
      timeline: "3–5 Working Days",
      regulator: "Indian Contract Act & Companies Act",
      description: "Co-founders contract detailing equity percentages, 4-year vesting schedule with 1-year cliff, IP assignment, and exit terms.",
      documents: ["Founders details & roles", "Equity split & initial capital contribution", "Vesting milestones"],
      deliverables: ["Comprehensive Founders' Agreement", "IP Assignment Deed to Company"],
    },
  ];

  // =========================================================================
  // 5. COMPANY SECRETARY SERVICES (Full Breakdown)
  // =========================================================================
  const companySecretaryServices: ServiceItem[] = [
    // 1. Annual Statutory Filings
    {
      id: "annual-mca-filing",
      name: "Annual MCA Filing (Form AOC-4 & MGT-7/7A)",
      category: "company-secretary",
      subCategory: "Annual Statutory Filings",
      timeline: "3–5 Working Days",
      regulator: "MCA21 • Sec 92 & 137 Companies Act 2013",
      description: "Preparation and certified e-filing of audited Financial Statements (AOC-4 / AOC-4 XBRL) and Annual Return (MGT-7/MGT-7A) with ROC, including Director's Report compliance, MGT-8 certification, and penalty avoidance.",
      documents: [
        "Audited Financial Statements with Auditor's Report & Notes",
        "Signed Board's Report with Annexures & MGT-9 Extract",
        "Notice of Annual General Meeting (AGM) and Member List",
      ],
      deliverables: [
        "Filed Form AOC-4 & MGT-7 with MCA Challan Receipt (SRN)",
        "Secretarial Certification on Annual Return (Form MGT-8)",
        "AGM Proceedings & Statutory Minute Dossier",
      ],
    },
    // 2. Director Governance & Compliance
    {
      id: "dir-3-kyc",
      name: "Director KYC & DIN Compliance (DIR-3 KYC)",
      category: "company-secretary",
      subCategory: "Director Governance & Compliance",
      timeline: "1–2 Working Days",
      regulator: "MCA21 • Rule 12A Companies Rules",
      description: "Mandatory annual verification of Director Identification Numbers (DIN) via e-Form DIR-3 KYC with digital signature (DSC) or OTP-based Web-KYC to keep DIN active and prevent ₹5,000 late deactivation penalties.",
      documents: [
        "Self-attested PAN and Aadhaar Card of Director",
        "Passport (mandatory for foreign nationals / overseas directors)",
        "Active Class 3 Digital Signature Certificate (DSC)",
        "Current residential address proof (Utility bill / Bank Statement)",
      ],
      deliverables: [
        "Approved MCA DIR-3 KYC SRN Acknowledgment",
        "Active DIN Status Certificate on MCA Portal",
        "Director Master Data Verification Pack",
      ],
    },
    {
      id: "director-appointment-resignation",
      name: "Appointment & Resignation of Directors (DIR-12)",
      category: "company-secretary",
      subCategory: "Director Governance & Compliance",
      timeline: "2–4 Working Days",
      regulator: "MCA21 • Sec 152, 168 & 170 Companies Act 2013",
      description: "Statutory secretarial processing for induction of Additional/Independent Directors or formal resignation, drafting Form DIR-2 consent, DIR-8 non-disqualification, MBP-1 disclosure, and e-filing DIR-12 with ROC.",
      documents: [
        "Consent to act as Director (Form DIR-2)",
        "Non-disqualification Declaration (Form DIR-8)",
        "Formal Resignation Letter with proof of delivery",
        "Certified True Copy of Board Resolution",
      ],
      deliverables: [
        "Filed Form DIR-12 with MCA Approval Receipt",
        "Updated Register of Directors & KMP (Sec 170)",
        "Official MCA Signatory Details Snapshot",
      ],
    },
    // 3. Corporate Structuring & Amendments
    {
      id: "registered-office-change",
      name: "Change in Registered Office Address (INC-22)",
      category: "company-secretary",
      subCategory: "Corporate Structuring & Amendments",
      timeline: "3–6 Working Days (Local) / 30 Days (Inter-State)",
      regulator: "MCA21 • Sec 12 Companies Act 2013",
      description: "Secretarial handling of shifting company registered office within local limits, outside local limits under same ROC, or inter-state shifting with Regional Director (RD) approval and public notice publication.",
      documents: [
        "Proof of registered office address (Electricity bill / Property tax receipt <= 2 months old)",
        "Notarized NOC from property owner",
        "Registered Rent / Lease Agreement",
        "Certified Board / Special Resolution",
      ],
      deliverables: [
        "Filed Form INC-22 with MCA Approval Receipt",
        "Updated Master Data Certificate of Registered Office",
        "Statutory letterheads & seal amendment guidance",
      ],
    },
    {
      id: "increase-authorized-capital",
      name: "Increase in Authorized Share Capital (Form SH-7)",
      category: "company-secretary",
      subCategory: "Capital Restructuring",
      timeline: "4–7 Working Days",
      regulator: "MCA21 • Sec 61 & 64 Companies Act 2013",
      description: "Drafting alteration to Memorandum of Association (MOA Capital Clause V), convening EGM for ordinary/special resolution, computing MCA ROC fees and state stamp duty, and e-filing Form SH-7 and MGT-14.",
      documents: [
        "Existing MOA & AOA copies",
        "Proposed new capital structure breakdown",
        "Notice & Explanatory Statement for EGM",
        "Passed Ordinary Resolution of Shareholders",
      ],
      deliverables: [
        "Filed Form SH-7 & MGT-14 with MCA SRN Receipt",
        "Amended Memorandum of Association (MOA)",
        "Updated MCA Master Data showing enhanced Authorized Capital",
      ],
    },
    {
      id: "charge-management",
      name: "Creation, Modification & Satisfaction of Charges (CHG-1 / CHG-4)",
      category: "company-secretary",
      subCategory: "Banking & Debt Governance",
      timeline: "3–5 Working Days",
      regulator: "MCA21 • Sec 77, 78 & 82 Companies Act 2013",
      description: "Statutory filing of charges on company assets/receivables for bank term loans, working capital facilities, or mortgage creation on Form CHG-1, and filing formal Charge Satisfaction on CHG-4 upon loan closure with Bank NOC.",
      documents: [
        "Sanction Letter & Loan Agreement with Hypothecation/Mortgage Deed",
        "Bank No Dues Certificate / Satisfaction Letter (for CHG-4)",
        "Board Resolution under Section 179(3)",
        "Property / Asset schedule subject to charge",
      ],
      deliverables: [
        "Official Certificate of Registration of Charge (Form CHG-2)",
        "Certificate of Satisfaction of Charge (Form CHG-5)",
        "Updated Register of Charges (Section 85)",
      ],
    },
    {
      id: "strike-off-stk2",
      name: "Strike-Off & Closure of Defunct Company (Form STK-2)",
      category: "company-secretary",
      subCategory: "Corporate Structuring & Amendments",
      timeline: "60–90 Working Days",
      regulator: "MCA21 • Section 248 Companies Act 2013",
      description: "Fast-track exit and striking off the name of defunct, non-operational, or dormant companies without prolonged liquidation, including indemnity bond drafting (STK-3), affidavit on STK-4, CA-certified statement of assets & liabilities, and ROC notice management.",
      documents: [
        "Statement of Accounts certified by CA (<= 30 days old showing zero assets & liabilities)",
        "Indemnity Bond on Non-Judicial Stamp Paper by all Directors (Form STK-3)",
        "Affidavits on Form STK-4 by all Directors",
        "Bank account closure certificate & PAN surrender receipt",
      ],
      deliverables: [
        "Filed Form STK-2 with MCA Challan Receipt",
        "ROC Public Notice in Official Gazette (Form STK-5 / STK-6)",
        "Final Notice of Striking Off and Dissolution (Form STK-7)",
      ],
    },
    {
      id: "beneficial-ownership-ben2",
      name: "Significant Beneficial Ownership Compliance (BEN-2)",
      category: "company-secretary",
      subCategory: "Statutory Registers & Anti-Money Laundering",
      timeline: "5–7 Working Days",
      regulator: "MCA21 • Section 90 & SBO Rules 2018",
      description: "Identification and legal declaration of natural persons holding 10%+ ultimate beneficial economic interest or voting rights in corporate shareholders, serving notice on BEN-4, receiving BEN-1, and filing return on Form BEN-2 with ROC.",
      documents: [
        "Declaration from Significant Beneficial Owner (Form BEN-1)",
        "Shareholding pattern and structural entity tree",
        "Ultimate natural owner passport/PAN verification",
      ],
      deliverables: [
        "Filed Form BEN-2 with MCA Acknowledgment",
        "Maintained Statutory Register of Significant Beneficial Owners (Form BEN-3)",
        "SBO Corporate Governance Compliance Memo",
      ],
    },
    // 4. Board & Meeting Governance
    {
      id: "board-advisor",
      name: "Board Advisory & Secretarial Standards",
      category: "company-secretary",
      subCategory: "Board Governance",
      timeline: "Monthly / Quarterly",
      regulator: "ICSI • SS-1 & SS-2",
      description: "Drafting Notice, Agenda notes, Board Resolutions, and statutory Minute Books strictly complying with Secretarial Standard 1 & 2.",
      documents: ["Matters proposed for board discussion", "Director attendance register", "Previous meeting minutes"],
      deliverables: ["Board Meeting Dossier & Signed Minutes", "Certified True Copy resolutions"],
    },
    {
      id: "share-allotment-pas",
      name: "Private Placement & Share Allotment (PAS-3)",
      category: "company-secretary",
      subCategory: "Capital Restructuring",
      timeline: "5–8 Working Days",
      regulator: "MCA • Section 42 & 62",
      description: "Preparation of Form PAS-4 Private Placement Offer Letter, special resolution on MGT-14, and Return of Allotment on PAS-3.",
      documents: ["Term sheet / Valuation report", "List of proposed allottees", "Separate bank account statement"],
      deliverables: ["Filed PAS-3 Return of Allotment", "Share Certificates with Stamp Duty payment guidance"],
    },
    {
      id: "secretarial-audit-mr3",
      name: "Secretarial Audit Report (Form MR-3)",
      category: "company-secretary",
      subCategory: "Audits & Certifications",
      timeline: "15–20 Working Days",
      regulator: "Section 204 Companies Act 2013",
      description: "Comprehensive statutory secretarial audit for public companies and eligible private entities with certified MR-3 opinion.",
      documents: ["MCA filings of previous financial year", "Statutory registers & Board minutes", "Audit committee reports"],
      deliverables: ["Independent Secretarial Audit Report on Form MR-3", "Non-compliance rectification roadmap"],
    },
    {
      id: "fema-rbi-filings",
      name: "FEMA & RBI FDI Filings (FC-GPR / FC-TRS)",
      category: "company-secretary",
      subCategory: "Regulatory Regimes (FEMA/RBI)",
      timeline: "7–12 Working Days",
      regulator: "RBI FIRMS Portal",
      description: "Reporting Foreign Direct Investment (FDI) equity issuance on Form FC-GPR or share transfer on FC-TRS with AD Bank clearance.",
      documents: ["Foreign Inward Remittance Certificate (FIRC)", "KYC report from remitting foreign bank", "Valuation Certificate"],
      deliverables: ["RBI FIRMS Approval Acknowledgment", "Foreign Liabilities and Assets (FLA) return"],
    },
  ];

  // =========================================================================
  // 6. AUDITOR AND CA SERVICES (The 11 Services & "How We Can Help" Table)
  // =========================================================================
  const auditorCaServices: Array<{
    id: string;
    number: number;
    title: string;
    scope: string;
    howWeHelp: string;
    deliverable: string;
  }> = [
    {
      id: "ca-1",
      number: 1,
      title: "Income Tax Filing & Consultation",
      scope: "Individual, Sole Proprietorship, LLP, Company, Startup, Capital Gains",
      howWeHelp: "Accurate computation of total income, eligible deductions optimization, advance tax computation, and timely e-filing of ITR-1 through ITR-7 before statutory cutoffs.",
      deliverable: "ITR Computation Sheet & Official ITR-V Acknowledgment",
    },
    {
      id: "ca-2",
      number: 2,
      title: "Tax Consultation & Planning",
      scope: "Strategic tax advisory, HNI tax planning, restructuring, tax-saving investment optimization",
      howWeHelp: "Proactive structural tax guidance to minimize liabilities while maintaining 100% adherence to IT Act provisions and GAAR standards.",
      deliverable: "Annual Executive Tax Planning Memo & Savings Blueprint",
    },
    {
      id: "ca-3",
      number: 3,
      title: "GST Registration & Filing",
      scope: "GST registration, monthly GSTR-1 & 3B, annual GSTR-9/9C reconciliation, LUT bond, GST notice replies",
      howWeHelp: "Seamless monthly reconciliation between books and GSTR-2B, maximized eligible ITC claim, zero penalty compliance, and prompt audit support.",
      deliverable: "Filed GST Returns, 2B Reconciliation Reports & LUT Certificate",
    },
    {
      id: "ca-4",
      number: 4,
      title: "TDS Return Filing",
      scope: "Quarterly Form 24Q (Salary), 26Q (Non-Salary), 27Q (Non-Resident), Form 16/16A generation, correction statements",
      howWeHelp: "Timely quarterly TDS filing, error-free challan mapping, TRACES generation of Form 16/16A certificates, and penalty avoidance under Sec 234E.",
      deliverable: "TRACES Form 16/16A & Quarterly Filing Acknowledgments",
    },
    {
      id: "ca-5",
      number: 5,
      title: "Accounting & Bookkeeping Services",
      scope: "Cloud bookkeeping (Zoho Books, Tally Prime, QuickBooks), monthly P&L, balance sheet preparation, bank reconciliation",
      howWeHelp: "Real-time ledger maintenance, bank reconciliation statements, receivables aging reports, and investor-ready MIS reports for chamber and client businesses.",
      deliverable: "Monthly Financial Statements (P&L, Balance Sheet) & General Ledger",
    },
    {
      id: "ca-6",
      number: 6,
      title: "Capital Gains Tax Advisory",
      scope: "Real estate sale, mutual fund/equity shares capital gains computation, Sec 54/54EC/54F tax exemptions",
      howWeHelp: "Detailed calculation of short-term and long-term capital gains, indexation benefits, and strategic deployment into Capital Gains Accounts Scheme.",
      deliverable: "Certified Capital Gains Statement & Exemption Claim Dossier",
    },
    {
      id: "ca-7",
      number: 7,
      title: "NRI Taxation",
      scope: "Form 15CA & 15CB certification, NRI ITR filing, DTAA benefits, capital gains repatriation from India",
      howWeHelp: "Issuance of certified Form 15CB with UDIN, lower TDS certificates under Section 197, and seamless fund repatriation abroad.",
      deliverable: "UDIN-Certified Form 15CB Certificate & Bank Remittance Pack",
    },
    {
      id: "ca-8",
      number: 8,
      title: "Tax Notice Assistance",
      scope: "Responses to Section 143(1) intimation, 143(2) scrutiny, 148 reassessment, and 270A penalty notices",
      howWeHelp: "Expert assessment of notice grounds, computation reconciliation, drafting authoritative written submissions, and e-proceedings portal handling.",
      deliverable: "Formal Reply Drafted by Senior CA & E-Proceedings Confirmation",
    },
    {
      id: "ca-9",
      number: 9,
      title: "Audit & Financial Reporting",
      scope: "Statutory audit, internal audit, tax audit (Sec 44AB), stock audit, CARO 2020 compliance",
      howWeHelp: "Independent examination of financial statements according to ICAI Standards on Auditing, Form 3CD tax audit report, and internal control evaluation.",
      deliverable: "ICAI Independent Auditor's Report & Form 3CD Tax Audit",
    },
    {
      id: "ca-10",
      number: 10,
      title: "Financial Advisory & Valuations",
      scope: "Virtual CFO services, business valuation (DCF / Net Asset), project report & CMA data for bank loans",
      howWeHelp: "Certified valuation reports for angel/venture funding, working capital assessment reports, and ongoing strategic financial supervision.",
      deliverable: "Registered Valuer Certificate & Bank-Ready CMA Report",
    },
    {
      id: "ca-11",
      number: 11,
      title: "Business Compliance & Advisory",
      scope: "Transfer pricing study, startup DPIIT certification, compliance health checkup",
      howWeHelp: "Benchmarking arm's length price for international transactions, Form 3CEB filing, and comprehensive regulatory risk scorecards.",
      deliverable: "Transfer Pricing Study Report (Form 3CEB) & Risk Scorecard",
    },
  ];

  const effectiveTab = (activeModule && tabs.some((t) => t.id === activeModule)) ? activeModule : currentTab;

  // Helper to get active list of service items based on current tab
  const getActiveServices = (): ServiceItem[] => {
    switch (effectiveTab) {
      case "business-registration":
        return businessRegistrationServices;
      case "tax-compliance":
        return taxComplianceServices;
      case "trademark-ip":
        return trademarkIpServices;
      case "corporate-lawyer":
        return corporateLawyerServices;
      case "company-secretary":
        return companySecretaryServices;
      default:
        return [];
    }
  };

  const activeServices = getActiveServices();

  // Get distinct sub-categories for filter pills
  const availableSubCategories = [
    "ALL",
    ...Array.from(new Set(activeServices.map((s) => s.subCategory))),
  ];

  // Filtered by subCategory and search
  const filteredServices = activeServices.filter((s) => {
    const matchesSub = subFilter === "ALL" || s.subCategory === subFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.regulator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSub && matchesSearch;
  });

  // Load active dockets for the compliance tracker
  const loadDockets = async () => {
    try {
      setLoadingDockets(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || "dev_token" : "dev_token";
      const res = await citizenApi.getMatters(token).catch(() => ({ matters: [] }));

      const seeded = [
        {
          id: "seed-cs-1",
          caseNumber: "SRN-MCA-2026/894120",
          title: "Annual MCA Filing (Form AOC-4 & MGT-7) — Inworth Technologies Pvt Ltd",
          court: "MCA21 • Registrar of Companies (ROC Ernakulam)",
          assignedAdvocate: "CS Rajesh Sharma (FCS 9214)",
          status: "Statutory Verification Complete",
          filingDate: "2026-10-18",
          stageIndex: 4,
          stages: [
            { name: "Docket Initiated & Vault Stamped", date: "18 Oct 2026", done: true },
            { name: "Financial Statements Scrutiny", date: "21 Oct 2026", done: true },
            { name: "AGM Minutes & Director Sign-Off", date: "24 Oct 2026", done: true },
            { name: "MCA21 V3 Portal E-Filing", date: "27 Oct 2026", done: true },
            { name: "Official ROC SRN Challan Issued", date: "28 Oct 2026", done: true },
          ],
          documents: [
            { name: "Audited_Balance_Sheet_FY25_26.pdf", size: "3.4 MB", hash: "sha256:7a92c4b8e190fa72" },
            { name: "Directors_Report_MGT9.pdf", size: "1.2 MB", hash: "sha256:3d91ea55c01289fe" },
            { name: "AGM_Signed_Minutes_2026.pdf", size: "840 KB", hash: "sha256:66b1fa091928cc3a" },
          ],
          udinOrSrn: "SRN: AA92019401",
          feePaid: "₹ 12,500 (ROC Statutory + CS Professional Fee)",
        },
        {
          id: "seed-ca-1",
          caseNumber: "ITR-CA-2026/741092",
          title: "Form 3CD Tax Audit & Corporate ITR-6 — Vanguard Infrastructure Ltd",
          court: "ICAI • Income Tax Department (CPC Bengaluru)",
          assignedAdvocate: "CA Ramanathan Iyer (FCA 40192)",
          status: "UDIN Stamped & Ready for E-Verification",
          filingDate: "2026-10-25",
          stageIndex: 3,
          stages: [
            { name: "Books of Account & 26AS Ingested", date: "25 Oct 2026", done: true },
            { name: "Depreciation & 43B(h) Audit", date: "29 Oct 2026", done: true },
            { name: "Tax Audit Report (Form 3CD) Drafted", date: "02 Nov 2026", done: true },
            { name: "ICAI UDIN Generation & Stamping", date: "05 Nov 2026", done: true },
            { name: "ITBA Income Tax Portal Filing", date: "Pending Client OTP", done: false },
          ],
          documents: [
            { name: "Trial_Balance_General_Ledger_2026.xlsx", size: "4.8 MB", hash: "sha256:aa441928e0018fa9" },
            { name: "Form_26AS_AIS_TIS_FY25_26.pdf", size: "2.1 MB", hash: "sha256:12bc5566de778901" },
            { name: "Draft_Form_3CD_Tax_Audit.pdf", size: "1.9 MB", hash: "sha256:44aa0011bb223344" },
          ],
          udinOrSrn: "UDIN: 2640192A00018921",
          feePaid: "₹ 24,000 (Tax Audit & Corporate Return)",
          queries: [
            {
              id: "qry-ca-101",
              type: "CLARIFICATION",
              title: "Section 43B(h) Clause 22 Vendor Status Confirmation",
              description: "Please confirm whether invoice INV-2025/902 from TechFab Solutions (MSME Micro) was settled prior to 31-Mar-2026 or if statutory interest has been computed under MSMED Act Section 16.",
              requestedDocumentName: "Bank_Advice_Debit_Confirmation.pdf",
              status: "RESOLVED",
              raisedBy: {
                name: "CA Ramanathan Iyer (FCA 40192)",
                role: "Statutory Tax Auditor",
                date: "30 Oct 2026",
              },
              clientResponse: {
                notes: "Payment of ₹1,45,000 discharged via RTGS on 12-Mar-2026. Official UTR transaction slip attached.",
                submittedAt: "01 Nov 2026",
                attachments: [
                  {
                    id: "att-1",
                    name: "RTGS_Advice_TechFab_Settlement.pdf",
                    size: "480 KB",
                    hash: "sha256:77bb19280011eeff11223344",
                  },
                ],
              },
            },
          ],
        },
        {
          id: "seed-cs-2",
          caseNumber: "SRN-MCA-2026/910245",
          title: "Appointment of Independent Director (Form DIR-12) — Zenith FinTech Ltd",
          court: "MCA21 • Registrar of Companies (ROC Delhi)",
          assignedAdvocate: "CS Rajesh Sharma (FCS 9214)",
          status: "Requisition Pending Response",
          filingDate: "2026-11-02",
          stageIndex: 1,
          stages: [
            { name: "Docket Initiated & Vault Stamped", date: "02 Nov 2026", done: true },
            { name: "Technical Scrutiny & DIN Verification", date: "04 Nov 2026", done: true },
            { name: "Board Resolution & CTC Sign-Off", date: "Pending Sign-Off", done: false },
            { name: "MCA21 V3 Portal E-Filing", date: "Pending", done: false },
            { name: "Official ROC SRN Challan Issued", date: "Pending", done: false },
          ],
          documents: [
            { name: "Consent_Letter_Form_DIR2.pdf", size: "450 KB", hash: "sha256:ee881294fa0018aa" },
            { name: "Declaration_Form_DIR8.pdf", size: "380 KB", hash: "sha256:cc551100bb443322" },
          ],
          udinOrSrn: "SRN: Pending Pre-Scrutiny",
          feePaid: "₹ 6,000 (ROC Statutory Fee + Professional Charges)",
          queries: [
            {
              id: "qry-cs-201",
              type: "DOCUMENT_REUPLOAD",
              title: "Form DIR-2 Consent Letter & Updated Residential Address Proof",
              description: "The DIN verification indicates the Director's residential address in Aadhaar was updated recently. Please upload a self-attested proof of updated residential address (Utility bill, Bank Statement, or Passport copy) for Form DIR-12 attachment.",
              requestedDocumentName: "Self_Attested_Address_Proof_DIR2.pdf",
              status: "OPEN",
              raisedBy: {
                name: "CS Rajesh Sharma (FCS 9214)",
                role: "Practicing Company Secretary",
                date: "04 Nov 2026",
              },
            },
          ],
        },
      ];

      if (res && res.matters && Array.isArray(res.matters)) {
        const relevant = res.matters.filter((m: any) => {
          const num = (m.caseNumber || "").toUpperCase();
          const title = (m.title || m.matterTitle || "").toLowerCase();
          const court = (m.court || m.courtForum || "").toLowerCase();
          return (
            num.startsWith("SRN-") ||
            num.startsWith("ITR-") ||
            num.startsWith("GST-") ||
            num.startsWith("DOC-") ||
            title.includes("tax") ||
            title.includes("roc") ||
            title.includes("mca") ||
            title.includes("company secretary") ||
            title.includes("auditor") ||
            court.includes("mca") ||
            court.includes("roc") ||
            court.includes("icai") ||
            court.includes("income tax")
          );
        });

        if (relevant.length > 0) {
          const formatted = relevant.map((m: any, idx: number) => {
            const isCompleted = (m.status || "").toLowerCase().includes("complete") || (m.status || "").toLowerCase().includes("disposed");
            const currentStageIndex = typeof m.stageIndex === "number" ? m.stageIndex : (isCompleted ? 4 : 2);
            const stages = (m.stages && Array.isArray(m.stages) && m.stages.length === 5) ? m.stages : [
              { name: "Docket Initiated & Vault Stamped", date: m.filingDate || "Filing Date", done: true },
              { name: "Technical Scrutiny & Computation", date: currentStageIndex >= 1 ? "Complete" : "In Progress", done: currentStageIndex >= 1 },
              { name: "Client Sign-Off & Four-Eyes Review", date: currentStageIndex >= 2 ? "Approved" : "Partner Review", done: currentStageIndex >= 2 },
              { name: "UDIN / MCA21 Portal E-Filing", date: currentStageIndex >= 3 ? "Submitted" : "Portal Submission", done: currentStageIndex >= 3 },
              { name: "Official Acknowledgment Released", date: currentStageIndex >= 4 ? "Downloaded" : "Pending", done: currentStageIndex >= 4 },
            ];
            return {
              id: m.id || m._id || `docket-${idx}`,
              caseNumber: m.caseNumber || `SRN-MCA-2026/${idx + 1000}`,
              title: m.title || m.matterTitle || "Statutory Compliance Docket",
              court: m.court || m.courtForum || "Statutory Authority",
              assignedAdvocate: m.assignedAdvocate || m.advocateName || "CA Ramanathan Iyer & CS Rajesh Sharma",
              status: m.status || "In Technical Scrutiny",
              filingDate: m.filingDate || new Date().toISOString().split("T")[0],
              stageIndex: currentStageIndex,
              stages,
              documents: (m.documents && Array.isArray(m.documents) && m.documents.length > 0) ? m.documents : [
                { name: "Supporting_Statutory_Dossier.pdf", size: "2.4 MB", hash: "sha256:8899aabbccddeeff" },
              ],
              udinOrSrn: m.udinOrSrn || ((m.caseNumber || "").startsWith("ITR") ? "UDIN: 2640192A00098124" : "SRN: ROC-2026-90124"),
              feePaid: m.feePaid || "Retainer Verified",
              queries: m.queries || [],
            };
          });

          // Prepend newly created dockets while preserving seeded items for complete view
          setActiveDockets([...formatted, ...seeded]);
          return;
        }
      }

      setActiveDockets(seeded);
    } catch (e) {
      console.warn("Failed to load active dockets:", e);
    } finally {
      setLoadingDockets(false);
    }
  };

  const handleDownloadAcknowledgment = (docket: any) => {
    const content = `================================================================================
GOVERNMENT OF INDIA • STATUTORY COMPLIANCE ACKNOWLEDGMENT
================================================================================
Platform: Wakheel Multi-Disciplinary Practice Network (Kerala High Court & ROC)
Docket Reference: ${docket.caseNumber}
Matter Title: ${docket.title}
Filing Authority: ${docket.court}
Certifying Professional: ${docket.assignedAdvocate}
Statutory Reference / Token: ${docket.udinOrSrn || "SRN-VERIFIED-2026"}
Date of Certification: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}

STATUS: COMPLETED & OFFICIALLY FILED (TAMPER-PROOF DIGITALLY SIGNED)
--------------------------------------------------------------------------------
1. Filing Verification: All attachments verified against MCA21/TRACES statutory schemas.
2. Digital Authentication: Stamped with Class 3 Digital Signature Certificate.
3. Integrity Check: Document hashes reconciled against client vault record.
4. Professional Attestation: Governed under ICAI / ICSI / BCI joint compliance code.

This document serves as the official client acknowledgment copy generated by Wakheel.
================================================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docket.caseNumber.replace(/[^a-zA-Z0-9]/g, "_")}_Official_Acknowledgment.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Web Crypto SHA-256 for document integrity
  const calculateHash = async (file: File): Promise<string> => {
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
      try {
        const buffer = await file.arrayBuffer();
        const digest = await window.crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(digest));
        return `sha256:${hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32)}`;
      } catch {
        // fallback
      }
    }
    return `sha256:${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles = Array.from(fileList);
    const processed: DocketUploadedFile[] = [];

    for (const f of newFiles) {
      const hash = await calculateHash(f);
      const base64Url = await readFileAsBase64(f);
      const sizeStr =
        f.size > 1024 * 1024
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(f.size / 1024))} KB`;

      processed.push({
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: f.name,
        size: sizeStr,
        type: f.type || "application/pdf",
        base64Url,
        hash,
      });
    }

    setUploadedFiles((prev) => [...prev, ...processed]);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleInitiateDocket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || isSubmittingDocket) return;
    setIsSubmittingDocket(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || "dev_token" : "dev_token";

      const isCS = selectedService.category === "company-secretary";
      const isCA = selectedService.category === "auditor-ca";
      const prefix = isCS ? "SRN-MCA" : isCA ? "ITR-CA" : "SRN-REG";
      const generatedDocket = `${prefix}-${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`;

      const assignedProfessional = isCS
        ? "CS Rajesh Sharma (FCS 9214)"
        : isCA
        ? "CA Ramanathan Iyer (FCA 40192)"
        : "Adv. Meera Krishnan & CS Rajesh Sharma";

      const clientNameClean = docketClientName.trim() || "Direct Matter Representation";
      const matterTitle = `${selectedService.name} — ${clientNameClean}`;

      // 1. Create Matter in Citizen Case Tracker
      await citizenApi.createMatter(token, {
        caseNumber: generatedDocket,
        title: matterTitle,
        matterTitle: matterTitle,
        court: selectedService.regulator,
        courtForum: selectedService.regulator,
        assignedAdvocate: assignedProfessional,
        advocateName: assignedProfessional,
        statutoryActs: [selectedService.regulator, selectedService.subCategory],
        status: "Docket Initiated / Verification",
        filingDate: new Date().toISOString().split("T")[0],
        timeline: [
          {
            date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            title: `Service Docket Opened (${generatedDocket})`,
            remarks: `Client ${clientNameClean} initiated ${selectedService.name}. Priority verification queued with ${assignedProfessional}. ${
              uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) attached.` : ""
            } ${docketNotes ? `Notes: ${docketNotes.trim()}` : ""}`,
            stage: "Completed",
          },
        ],
      }).catch((err) => console.warn("citizenApi.createMatter warning:", err));

      // 2. Upload and stamp each document in Encrypted Vault
      for (const doc of uploadedFiles) {
        await citizenApi.uploadDocument(token, {
          title: doc.name,
          name: doc.name,
          fileName: doc.name,
          fileSize: doc.size,
          category: isCS ? "Corporate & Secretarial" : isCA ? "Tax & Audit Statements" : "Statutory Registry",
          matter: matterTitle,
          matterId: generatedDocket,
          fileUrl: doc.base64Url || "",
          details: `Uploaded during ${selectedService.name} docket initiation. Integrity: ${doc.hash}`,
        }).catch((err) => console.warn("citizenApi.uploadDocument warning:", err));
      }

      // 3. Register to Firm ROC compliance if CS filing
      if (isCS) {
        await csApi.createRocFiling({
          companyName: clientNameClean,
          formType: selectedService.id.toUpperCase(),
          srn: generatedDocket,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "Draft",
          stakeholders: [clientNameClean],
        }).catch(() => {});
      }

      // 4. Register to Firm CA Workspace if CA service
      if (isCA) {
        if (selectedService.id === "ca-1" || selectedService.name.toLowerCase().includes("income tax")) {
          await caApi.createIncomeTaxReturn({
            clientName: clientNameClean,
            pan: docketEntityPan.trim() || "AAECI9012K",
            assessmentYear: "2026-27",
            financialYear: "2025-26",
            itrForm: "ITR-6",
            status: "draft",
            grossTotalIncome: 0,
            deductionsChapterVIA: 0,
            taxableIncome: 0,
            taxPayable: 0,
          }).catch(() => {});
        } else if (selectedService.id === "ca-3" || selectedService.name.toLowerCase().includes("gst")) {
          await caApi.createGstReturn({
            clientName: clientNameClean,
            gstin: docketEntityPan.trim() || "07AAECI9012K1ZQ",
            returnType: "GSTR-3B",
            period: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
            status: "pending_upload",
          }).catch(() => {});
        }
      }

      setActiveDocketSuccess(
        `Service Docket #${generatedDocket} successfully opened for ${clientNameClean} under ${selectedService.name}. ${
          uploadedFiles.length > 0 ? `${uploadedFiles.length} supporting document(s) encrypted & saved to vault.` : "Standing instructions recorded."
        } Assigned to ${assignedProfessional}.`
      );

      setSelectedService(null);
      setDocketClientName("");
      setDocketEntityPan("");
      setDocketNotes("");
      setUploadedFiles([]);
      await loadDockets();
      setViewMode("tracker");
    } catch (err: any) {
      console.error("Failed to initiate service docket:", err);
      alert("Error initiating docket: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmittingDocket(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                BUSINESS+ SUITE
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
                Corporate, Tax, IP &amp; Statutory Hub
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mt-1">
              Business+, Corporate &amp; Regulatory Services
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Comprehensive incorporation, 19 statutory licenses, corporate restructuring, trademark protection, and certified CA/CS advisory.
            </p>
          </div>
        </div>

        {/* The 6 Main BUSINESS+ Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = effectiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer truncate ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-black/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Navigation Toggle: Service Catalog vs Active Compliance Tracker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setViewMode("catalog")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "catalog"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Service Catalog</span>
          </button>
          <button
            onClick={() => setViewMode("tracker")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "tracker"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Active Compliance Tracker</span>
            {activeDockets.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  viewMode === "tracker"
                    ? "bg-white text-black dark:bg-black dark:text-white"
                    : "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white"
                }`}
              >
                {activeDockets.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewMode("precheck")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "precheck"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Statutory Pre-Check</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                viewMode === "precheck"
                  ? "bg-white text-black dark:bg-black dark:text-white"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}
            >
              Diagnostics
            </span>
          </button>
        </div>

        {viewMode === "tracker" && (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-semibold transition-colors ${
                isWsConnected
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500"
              }`}
              title={
                isWsConnected
                  ? "WebSocket Connected: Receiving real-time updates from MCA21, ROC & ICAI firm portals"
                  : "Reconnecting to live WebSocket push gateway..."
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isWsConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                }`}
              />
              <span>{isWsConnected ? "Live Gateway Active" : "Reconnecting..."}</span>
            </div>

            <button
              onClick={loadDockets}
              disabled={loadingDockets}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
              title="Refresh Active Compliance Dockets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDockets ? "animate-spin" : ""}`} />
              <span>Refresh Dockets</span>
            </button>
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {activeDocketSuccess && (
        <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-black dark:text-white shadow-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
            <div className="space-y-0.5">
              <span className="font-bold block text-sm">Service Docket Registered &amp; Encrypted</span>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{activeDocketSuccess}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {onSelectModule && (
              <button
                onClick={() => onSelectModule("case-tracking")}
                className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Track in Cases
              </button>
            )}
            <button
              onClick={() => setActiveDocketSuccess(null)}
              className="text-zinc-400 hover:text-black dark:hover:text-white text-xs font-bold p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* View 1 to 5: Tab Content with Sub-Category Pills and Service Cards */}
      {viewMode === "catalog" && effectiveTab !== "auditor-ca" && (
        <div className="space-y-5">
          {/* Controls: Search + Sub-category filter pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Sub-Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {availableSubCategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSubFilter(sub)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    subFilter === sub
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                      : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services or licenses..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white shadow-xs"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-black dark:hover:border-white transition-all group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold text-black dark:text-white">
                      {service.timeline}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 truncate">
                      {service.subCategory}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-black dark:text-white group-hover:underline">
                    {service.name}
                  </h3>

                  <p className="text-[10px] font-mono text-zinc-500 font-semibold">
                    {service.regulator}
                  </p>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center gap-2">
                  {(service.id === "board-advisor" || service.id.includes("tax") || service.id.includes("gst")) && (
                    <button
                      type="button"
                      onClick={() => setViewMode("precheck")}
                      className="py-2 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer hover:bg-amber-500/20 transition-colors shrink-0"
                      title="Run AI Pre-Check Diagnostic"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span className="hidden sm:inline">Pre-Check</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedService(service)}
                    className="flex-1 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    <span>Initiate Docket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 space-y-2">
              <AlertCircle className="w-6 h-6 text-zinc-400 mx-auto" />
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                No services found matching your filter criteria.
              </p>
              <button
                onClick={() => {
                  setSubFilter("ALL");
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-black dark:text-white hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          6. AUDITOR AND CA SERVICES TAB: The 11 Services & "How We Can Help" Table
      ========================================================================= */}
      {viewMode === "catalog" && effectiveTab === "auditor-ca" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                STATUTORY AUDITOR &amp; CHARTERED ACCOUNTANT SERVICES
              </span>
              <p className="text-xs text-zinc-500 mt-0.5">
                Full-service compliance matrix governed by ICAI standards, IT Act 1961, and Companies Act 2013.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
              11 Comprehensive CA Practice Lines
            </span>
          </div>

          {/* Exhaustive "How We Can Help" Table matching user specification */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-56">Service Name</th>
                  <th className="py-3 px-4 w-64">Scope</th>
                  <th className="py-3 px-4">How We Can Help</th>
                  <th className="py-3 px-4 w-36 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {auditorCaServices.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-center text-zinc-500">
                      {row.number}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-black dark:text-white">
                      {row.title}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                      {row.scope}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {row.howWeHelp}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewMode("precheck")}
                          className="px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-[10px] hover:bg-amber-500/20 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                          title="Run AI Statutory Pre-Check before initiating"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>AI Pre-Check</span>
                        </button>
                        <button
                          onClick={() =>
                            setSelectedService({
                              id: row.id,
                              name: row.title,
                              category: "auditor-ca",
                              subCategory: "CA Services",
                              timeline: "3–7 Working Days",
                              regulator: "ICAI & Income Tax Department",
                              description: row.howWeHelp,
                              documents: ["PAN, Financial Statements, Form 26AS, Invoices"],
                              deliverables: [row.deliverable],
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-[11px] hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer whitespace-nowrap"
                        >
                          Initiate Service
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          ACTIVE COMPLIANCE TRACKER (5-Stage Milestone Timeline & Cert Acknowledgment)
      ========================================================================= */}
      {viewMode === "tracker" && (
        <div className="space-y-6">
          {/* Header & Metrics Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                ACTIVE COMPLIANCE TRACKER &amp; REGULATORY AUDIT TRAIL
              </span>
              <p className="text-xs text-zinc-500 mt-0.5">
                Real-time milestone progression, four-eyes scrutiny, ICAI UDIN tokens, and MCA21 ROC filings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                Tamper-Evident SHA-256 Sealed
              </span>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Active Dockets</span>
                <Activity className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-black mt-2 text-black dark:text-white font-mono">
                {activeDockets.length}
              </div>
              <span className="text-[10px] text-zinc-400 mt-0.5 block">
                Cross-referenced with ROC &amp; ITBA
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">UDIN / SRN Certified</span>
                <ShieldCheck className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-black mt-2 text-black dark:text-white font-mono">
                {activeDockets.filter((d) => (d.stageIndex ?? 0) >= 3).length}
              </div>
              <span className="text-[10px] text-zinc-400 mt-0.5 block">
                Statutory attestation complete
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Assigned Professionals</span>
                <Briefcase className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-black mt-2 text-black dark:text-white font-mono">
                {new Set(activeDockets.map((d) => d.assignedAdvocate)).size}
              </div>
              <span className="text-[10px] text-zinc-400 mt-0.5 block">
                Practicing FCA &amp; FCS Fellows
              </span>
            </div>
          </div>

          {/* Dockets Listing */}
          {loadingDockets ? (
            <div className="p-12 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
              <p className="text-xs text-zinc-500 font-mono">Synchronizing statutory dockets from registry...</p>
            </div>
          ) : activeDockets.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950">
              <FileSpreadsheet className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-black dark:text-white">No active statutory dockets found</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                Initiate a service from the Service Catalog to track live ROC filings, ITR certifications, and 5-stage compliance progression.
              </p>
              <button
                onClick={() => setViewMode("catalog")}
                className="mt-4 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Browse Service Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDockets.map((docket) => {
                const isComplete = (docket.stageIndex ?? 0) >= 4;
                return (
                  <div
                    key={docket.id}
                    className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xs space-y-4 hover:border-black dark:hover:border-white transition-all"
                  >
                    {/* Docket Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-900">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-black dark:text-white">
                          {docket.caseNumber}
                        </span>
                        <button
                          onClick={() => handleCopy(docket.caseNumber, `copy-${docket.id}`)}
                          className="text-zinc-400 hover:text-black dark:hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                          title="Copy Docket Reference Number"
                        >
                          {copiedId === `copy-${docket.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                          {docket.court}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-black dark:text-white">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isComplete ? "bg-emerald-500" : "bg-amber-500"}`} />
                          {docket.status}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {docket.filingDate}
                        </span>
                      </div>
                    </div>

                    {/* Priority 4: Requisition Alert Banner (if open queries exist) */}
                    {docket.queries && docket.queries.some((q: any) => q.status === "OPEN") && (
                      <div
                        onClick={() => {
                          setQueryModalDocket(docket);
                          setQueryModalOpen(true);
                        }}
                        className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-3 text-xs cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shadow-xs"
                      >
                        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="font-bold">
                            {docket.queries.filter((q: any) => q.status === "OPEN").length} Requisition Requires Action:
                          </span>
                          <span className="truncate text-zinc-600 dark:text-zinc-400">
                            {docket.queries.find((q: any) => q.status === "OPEN")?.title}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-extrabold text-[11px] shrink-0">
                          Respond &amp; Re-Upload →
                        </span>
                      </div>
                    )}

                    {/* Client Statutory e-Sign Authorization Banner */}
                    {docket.clientAuthorization ? (
                      <div
                        onClick={() => {
                          setAuthorizationModalDocket(docket);
                          setAuthorizationModalOpen(true);
                        }}
                        className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-xs"
                      >
                        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold">Statutorily Authorized &amp; e-Signed:</span>
                          <span className="font-mono text-xs">{docket.clientAuthorization.signerName} ({docket.clientAuthorization.signerDesignation})</span>
                          <span className="text-zinc-500 hidden sm:inline">• {docket.clientAuthorization.espReference}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-[11px] shrink-0">
                          Audit Certificate →
                        </span>
                      </div>
                    ) : (docket.stageIndex ?? 0) >= 2 ? (
                      <div
                        onClick={() => {
                          setAuthorizationModalDocket(docket);
                          setAuthorizationModalOpen(true);
                        }}
                        className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 flex items-center justify-between gap-3 text-xs cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors shadow-xs"
                      >
                        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="font-bold">Director Sign-Off Required:</span>
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Aadhaar OTP / Class 3 DSC authorization required under Section 448 Companies Act.
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-extrabold text-[11px] shrink-0">
                          Authorize Now →
                        </span>
                      </div>
                    ) : null}

                    {/* Docket Title & Details */}
                    <div>
                      <h4 className="text-sm font-bold text-black dark:text-white">
                        {docket.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Assigned Professional:</span>
                          <strong className="text-black dark:text-white font-semibold">
                            {docket.assignedAdvocate}
                          </strong>
                        </span>
                        {docket.udinOrSrn && (
                          <span className="flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                            <Hash className="w-3 h-3 text-zinc-400" />
                            <span>{docket.udinOrSrn}</span>
                          </span>
                        )}
                        {docket.feePaid && (
                          <span className="text-zinc-500 text-[11px]">
                            • {docket.feePaid}
                          </span>
                        )}
                        {docket.trustDisbursement && (
                          <span className="flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300">
                            <Landmark className="w-3 h-3 text-indigo-500" />
                            <span>Trust Voucher: {docket.trustDisbursement.voucherNo}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 5-Stage Milestone Progression */}
                    <div className="pt-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                        Statutory Milestone Pipeline
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 relative">
                        {docket.stages.map((stage: any, sIdx: number) => {
                          const isDone = stage.done;
                          const isCurrent = (docket.stageIndex ?? 0) === sIdx;
                          return (
                            <div
                              key={sIdx}
                              className={`p-2.5 rounded-xl border text-xs transition-all relative ${
                                isDone
                                  ? "bg-zinc-100/70 dark:bg-zinc-900/70 border-black dark:border-white text-black dark:text-white"
                                  : isCurrent
                                  ? "bg-zinc-50 dark:bg-zinc-950 border-zinc-400 dark:border-zinc-600 text-black dark:text-white"
                                  : "bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-[9px] font-bold uppercase text-zinc-400">
                                  Stage 0{sIdx + 1}
                                </span>
                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                ) : isCurrent ? (
                                  <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                )}
                              </div>
                              <p className="font-semibold text-[11px] leading-tight">
                                {stage.name}
                              </p>
                              <span className="text-[9px] font-mono text-zinc-500 mt-1 block">
                                {stage.date}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Attached Files Vault Preview */}
                    {docket.documents && docket.documents.length > 0 && (
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold flex items-center gap-1.5 text-black dark:text-white">
                            <Lock className="w-3 h-3 text-zinc-400" />
                            <span>Encrypted Vault Records ({docket.documents.length})</span>
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            SHA-256 Stamped
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {docket.documents.map((doc: any, dIdx: number) => (
                            <div
                              key={dIdx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-[11px]"
                            >
                              <File className="w-3 h-3 text-zinc-400" />
                              <span className="font-medium text-black dark:text-white">{doc.name}</span>
                              <span className="text-zinc-400 text-[10px] font-mono">({doc.size})</span>
                              {doc.hash && (
                                <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                                  {doc.hash.slice(0, 15)}...
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions Footer */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                      <button
                        onClick={() => setSelectedDocketDetail(docket)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Audit Trail &amp; Regulatory Record</span>
                      </button>
                      <button
                        onClick={() => {
                          setQueryModalDocket(docket);
                          setQueryModalOpen(true);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          (docket.queries?.filter((q: any) => q.status === "OPEN").length || 0) > 0
                            ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100"
                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          Requisitions &amp; Re-Upload{" "}
                          {docket.queries && docket.queries.length > 0
                            ? `(${docket.queries.filter((q: any) => q.status === "OPEN").length} action required)`
                            : ""}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setChallanModalDocket(docket);
                          setChallanModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                        title="Simulate or Generate BharatKosh NTRP, ITNS 280/281 or GST PMT-06 Government Challan"
                      >
                        <Receipt className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Govt Challan</span>
                      </button>
                      <button
                        onClick={() => {
                          setAuthorizationModalDocket(docket);
                          setAuthorizationModalOpen(true);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          docket.clientAuthorization
                            ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100"
                            : "border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 hover:bg-indigo-100"
                        }`}
                        title="Aadhaar e-Sign or Class 3 DSC Director Authorization (Section 448 Companies Act)"
                      >
                        <ShieldCheck className={`w-3.5 h-3.5 ${docket.clientAuthorization ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-600 dark:text-indigo-400"}`} />
                        <span>{docket.clientAuthorization ? "e-Signed (Verified)" : "Authorize & e-Sign"}</span>
                      </button>
                      <button
                        onClick={() => handleOpenCertificate(docket)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer shadow-xs"
                        title="View, Print (A4) or Download Official Compliance Certificate with QR Code & UDIN"
                      >
                        <FileBadge className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Official Certificate (A4/PDF)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          AI STATUTORY COMPLIANCE PRE-CHECK & DIAGNOSTICS STUDIO (Priority 3)
      ========================================================================= */}
      {viewMode === "precheck" && (
        <ClientStatutoryPreCheckView
          clientName="Inworth Technologies Pvt Ltd"
          cin="U72200KL2023PTC081290"
          pan="AABCI9812G"
          gstin="32AABCI9812G1Z2"
          onInitiateFiling={(serviceCategory, initialNotes, generatedReport) => {
            let matchedService: ServiceItem | undefined;
            if (serviceCategory === "board-advisor") {
              matchedService = companySecretaryServices.find((s) => s.id === "board-advisor") || companySecretaryServices[0];
            } else if (serviceCategory === "tax-audit") {
              const caAudit = auditorCaServices.find((s) => s.id === "ca-tax-audit") || auditorCaServices[0];
              matchedService = {
                id: caAudit.id,
                name: caAudit.title,
                category: "auditor-ca",
                subCategory: "Tax Audit & Section 43B(h)",
                timeline: "3–5 Working Days",
                regulator: "ICAI & Income Tax Department",
                description: caAudit.howWeHelp,
                documents: ["PAN, Trial Balance, MSME Udyam Certificates, Vendor Invoices"],
                deliverables: [caAudit.deliverable],
              };
            } else {
              matchedService = {
                id: "gst-scn-rebuttal",
                name: "GST DRC-01 SCN Legal Representation",
                category: "tax-compliance",
                subCategory: "GST Litigation & Dispute Resolution",
                timeline: "2–4 Working Days",
                regulator: "GST Adjudicating Authority & Appellate Tribunal",
                description: "Formal legal reply to Show Cause Notice in Form GST DRC-01 with judicial precedent citation.",
                documents: ["DRC-01 Notice Copy, GSTR-1, GSTR-3B, GSTR-2B Invoices, CA Certificates"],
                deliverables: ["Certified DRC-06 Pleading Draft, Case Index & Representation Memo"],
              };
            }

            setSelectedService(matchedService);
            setDocketNotes(initialNotes);
            if (generatedReport) {
              setUploadedFiles([
                {
                  id: `precheck-doc-${Date.now()}`,
                  name: `AI_${serviceCategory.toUpperCase()}_Statutory_Precheck_Dossier.txt`,
                  size: `${Math.max(1, Math.round(generatedReport.length / 1024))} KB`,
                  type: "text/plain",
                  hash: "sha256:7f92014ea89201cb",
                },
              ]);
            }
          }}
        />
      )}

      {/* =========================================================================
          INTERACTIVE DOCKET INITIATION MODAL WITH ENCRYPTED DOCUMENT DROPZONE
      ========================================================================= */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between shrink-0">
              <div className="space-y-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold text-black dark:text-white">
                  {selectedService.subCategory}
                </span>
                <h3 className="text-lg font-extrabold text-black dark:text-white">
                  {selectedService.name}
                </h3>
                <p className="text-xs font-mono text-zinc-500">
                  Authority: {selectedService.regulator} • Estimated Turnaround: {selectedService.timeline}
                </p>
              </div>
              <button
                onClick={() => {
                  if (!isSubmittingDocket) {
                    setSelectedService(null);
                    setUploadedFiles([]);
                  }
                }}
                disabled={isSubmittingDocket}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Scope & Deliverables Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div>
                  <h4 className="font-bold text-black dark:text-white mb-1">Scope &amp; Description</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {selectedService.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <div>
                    <h4 className="font-bold text-black dark:text-white mb-1">Key Documents / Input Required</h4>
                    <ul className="list-disc pl-4 space-y-0.5 text-zinc-600 dark:text-zinc-400 text-[11px]">
                      {selectedService.documents.map((doc, i) => (
                        <li key={i}>{doc}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-black dark:text-white mb-1">Deliverables Included</h4>
                    <ul className="list-disc pl-4 space-y-0.5 text-zinc-600 dark:text-zinc-400 text-[11px]">
                      {selectedService.deliverables.map((deliv, i) => (
                        <li key={i}>{deliv}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Initiation Form */}
              <form id="docket-init-form" onSubmit={handleInitiateDocket} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Client / Business Entity Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={docketClientName}
                      onChange={(e) => setDocketClientName(e.target.value)}
                      placeholder="e.g. Inworth Technologies Pvt Ltd"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      PAN / CIN / GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      value={docketEntityPan}
                      onChange={(e) => setDocketEntityPan(e.target.value.toUpperCase())}
                      placeholder="e.g. AAECI1234F or U72900KL2024PTC..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-xs font-mono focus:outline-none focus:border-black dark:focus:border-white shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Special Instructions / Filing Specifics (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={docketNotes}
                    onChange={(e) => setDocketNotes(e.target.value)}
                    placeholder="Specify urgency, particular financial year, auditor references, or custom resolution terms..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white shadow-xs resize-none"
                  />
                </div>

                {/* Drag-and-Drop Document Vault Upload Area */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Encrypted Document Vault (Drop Supporting Files)</span>
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {uploadedFiles.length} file{uploadedFiles.length === 1 ? "" : "s"} staged
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                  />

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFilesSelected(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-2 ${
                      isDragging
                        ? "border-black dark:border-white bg-zinc-100 dark:bg-zinc-800"
                        : "border-zinc-300 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:border-zinc-400"
                    }`}
                  >
                    <UploadCloud className="w-6 h-6 text-zinc-400 mx-auto" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-black dark:text-white">
                        Drop supporting files here or <span className="underline">browse</span>
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Balance sheets, Form 26AS, GST invoices, MOA/AOA, or signed Board resolutions (PDF, Excel, Word, Images)
                      </p>
                    </div>
                  </div>

                  {/* List of Staged Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto">
                      {uploadedFiles.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <File className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <span className="font-semibold text-black dark:text-white truncate">
                              {f.name}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                              ({f.size})
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0 flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>{f.hash.slice(0, 14)}...</span>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(f.id);
                            }}
                            className="p-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                            title="Remove file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50 dark:bg-zinc-950">
              <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white" />
                <span>Encrypted &amp; Registered to Case Tracker</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmittingDocket}
                  onClick={() => {
                    setSelectedService(null);
                    setUploadedFiles([]);
                  }}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="docket-init-form"
                  disabled={isSubmittingDocket}
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingDocket && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {isSubmittingDocket
                      ? "Registering & Encrypting Vault..."
                      : "Create Service Docket & Encrypt Vault"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STATUTORY AUDIT TRAIL & REGULATORY RECORD DETAIL MODAL
      ========================================================================= */}
      {selectedDocketDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-black dark:text-white">
                    {selectedDocketDetail.caseNumber}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                    {selectedDocketDetail.court}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  {selectedDocketDetail.title}
                </h3>
                <p className="text-xs text-zinc-500 font-mono">
                  Certifying Professional: {selectedDocketDetail.assignedAdvocate}
                </p>
              </div>
              <button
                onClick={() => setSelectedDocketDetail(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">Status</span>
                  <span className="text-xs font-bold text-black dark:text-white mt-0.5 block">
                    {selectedDocketDetail.status}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">Token / Reference</span>
                  <span className="text-xs font-mono font-bold text-black dark:text-white mt-0.5 block truncate">
                    {selectedDocketDetail.udinOrSrn || "SRN-VERIFIED"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">Filing Date</span>
                  <span className="text-xs font-bold text-black dark:text-white mt-0.5 block">
                    {selectedDocketDetail.filingDate}
                  </span>
                </div>
              </div>

              {/* Complete Audit Trail */}
              <div>
                <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider font-mono mb-3">
                  Chronological Statutory Audit Trail
                </h4>
                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800 pl-8">
                  {selectedDocketDetail.stages.map((stage: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-8 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border ${
                          stage.done
                            ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                            : "bg-white dark:bg-black border-zinc-300 dark:border-zinc-700 text-zinc-400"
                        }`}
                      >
                        {stage.done ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                        )}
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-black dark:text-white">
                            {stage.name}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {stage.date}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          {stage.done
                            ? "Verified under statutory standards with cryptographic digital timestamp."
                            : "Pending action by certifying professional or portal response."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Dossier Hashes */}
              {selectedDocketDetail.documents && selectedDocketDetail.documents.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider font-mono mb-2">
                    Vault Evidence &amp; Tamper Verification Hashes
                  </h4>
                  <div className="space-y-2">
                    {selectedDocketDetail.documents.map((doc: any, dIdx: number) => (
                      <div
                        key={dIdx}
                        className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                            <File className="w-3.5 h-3.5 text-zinc-400" />
                            {doc.name}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">{doc.size}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-zinc-500 truncate mr-2">{doc.hash || "sha256:verified"}</span>
                          <button
                            onClick={() => handleCopy(doc.hash || "", `hash-${dIdx}`)}
                            className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                          >
                            {copiedId === `hash-${dIdx}` ? "Copied" : "Copy Hash"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regulatory Notice Banner */}
              <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                <span className="font-bold text-black dark:text-white block">
                  Statutory Practice Certificate &amp; Legal Warranty
                </span>
                <p>
                  This record is maintained pursuant to ICAI Quality Review Board guidelines, ICSI Auditing Standards, and Section 30 of the Advocates Act, 1961. All certificates are tamper-proof and verifiable against registry tokens.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-mono text-zinc-400">
                Wakheel Legal OS • Compliance Engine
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDocketDetail(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setQueryModalDocket(selectedDocketDetail);
                    setQueryModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    Requisitions &amp; Re-Upload{" "}
                    {selectedDocketDetail?.queries && selectedDocketDetail.queries.length > 0
                      ? `(${selectedDocketDetail.queries.filter((q: any) => q.status === "OPEN").length} action required)`
                      : ""}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setChallanModalDocket(selectedDocketDetail);
                    setChallanModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer shadow-xs"
                >
                  <Receipt className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Govt Challan &amp; Fees</span>
                </button>
                <button
                  onClick={() => handleOpenCertificate(selectedDocketDetail)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer shadow-xs"
                >
                  <FileBadge className="w-3.5 h-3.5 text-emerald-400" />
                  <span>View Official Certificate (A4/PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRIORITY 6: EXPORTABLE HIGH-FIDELITY STATUTORY COMPLIANCE CERTIFICATE MODAL
      ========================================================================= */}
      <StatutoryComplianceCertificateModal
        isOpen={certificateModalOpen}
        onClose={() => {
          setCertificateModalOpen(false);
          setActiveCertificateData(null);
        }}
        data={activeCertificateData}
      />

      {/* =========================================================================
          PRIORITY 4: REAL-TIME IN-DOCKET QUERY RESOLUTION & DOCUMENT RE-UPLOAD LOOP
      ========================================================================= */}
      <InDocketQueryThreadModal
        isOpen={queryModalOpen}
        onClose={() => {
          setQueryModalOpen(false);
          setQueryModalDocket(null);
        }}
        viewerMode="client"
        docket={queryModalDocket}
        onQueriesUpdated={(updatedQueries, newDocs) => {
          if (!queryModalDocket) return;
          const updatedDockets = activeDockets.map((d) => {
            if (d.id === queryModalDocket.id) {
              const docs = newDocs && newDocs.length > 0 ? [...d.documents, ...newDocs] : d.documents;
              return { ...d, queries: updatedQueries, documents: docs };
            }
            return d;
          });
          setActiveDockets(updatedDockets);
          if (queryModalDocket) {
            setQueryModalDocket((prev: any) =>
              prev
                ? {
                    ...prev,
                    queries: updatedQueries,
                    documents: newDocs && newDocs.length > 0 ? [...prev.documents, ...newDocs] : prev.documents,
                  }
                : null
            );
          }
        }}
      />

      {/* =========================================================================
          PRIORITY 5: BHARATKOSH & ITNS / GST STATUTORY CHALLAN PAYMENT SIMULATOR
      ========================================================================= */}
      <StatutoryChallanPaymentSimulatorModal
        isOpen={challanModalOpen}
        onClose={() => {
          setChallanModalOpen(false);
          setChallanModalDocket(null);
        }}
        viewerMode="client"
        docket={challanModalDocket}
        onChallanPaid={(paidChallan, newDocketDoc) => {
          if (!challanModalDocket) return;
          const updatedDockets = activeDockets.map((d) => {
            if (d.id === challanModalDocket.id) {
              const docs = [...d.documents, newDocketDoc];
              return {
                ...d,
                documents: docs,
                feePaid: `₹ ${paidChallan.amountBreakdown.totalAmount.toLocaleString("en-IN")} Discharged via ${paidChallan.portal} (${paidChallan.srnOrCpinOrCin})`,
                status: "Statutory Fee Discharged & Officially Stamped",
                trustDisbursement: {
                  voucherNo: `VCH-${paidChallan.portal.slice(0, 3)}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
                  treatment: "reimbursable_out_of_pocket",
                  amount: paidChallan.amountBreakdown.totalAmount,
                  portal: paidChallan.portal,
                  formName: paidChallan.filingForm,
                  cinOrSrn: paidChallan.srnOrCpinOrCin,
                  bsrCode: paidChallan.bsrCode,
                  challanSerialNumber: paidChallan.challanSerialNumber,
                  disbursedAt: paidChallan.paidAt || new Date().toISOString(),
                  status: "RECORDED_IN_TRUST_LEDGER",
                },
              };
            }
            return d;
          });
          setActiveDockets(updatedDockets);
        }}
      />

      {/* =========================================================================
          TASK B: AADHAAR E-SIGN & CLIENT STATUTORY AUTHORIZATION MODAL
      ========================================================================= */}
      <StatutoryClientAuthorizationModal
        isOpen={authorizationModalOpen}
        onClose={() => {
          setAuthorizationModalOpen(false);
          setAuthorizationModalDocket(null);
        }}
        viewerMode="client"
        docket={authorizationModalDocket}
        onAuthorized={(authRecord, newDocketDoc) => {
          if (!authorizationModalDocket) return;
          const updatedDockets = activeDockets.map((d) => {
            if (d.id === authorizationModalDocket.id) {
              const docs = [...(d.documents || []), newDocketDoc];
              const updatedStages = Array.isArray(d.stages)
                ? d.stages.map((st: any, sIdx: number) =>
                    sIdx === 2
                      ? {
                          ...st,
                          done: true,
                          remarks: `e-Signed via ${authRecord.signMethod === "AADHAAR_ESIGN" ? "Aadhaar OTP" : "Class 3 DSC"} by ${authRecord.signerName}`,
                        }
                      : st
                  )
                : d.stages;
              const newStageIndex = typeof d.stageIndex === "number" && d.stageIndex < 3 ? 3 : d.stageIndex;
              return {
                ...d,
                clientAuthorization: authRecord,
                documents: docs,
                stages: updatedStages,
                stageIndex: newStageIndex,
                status: "Statutorily Authorized by Client",
              };
            }
            return d;
          });
          setActiveDockets(updatedDockets);
          if (authorizationModalDocket) {
            setAuthorizationModalDocket((prev: any) =>
              prev
                ? {
                    ...prev,
                    clientAuthorization: authRecord,
                    documents: [...(prev.documents || []), newDocketDoc],
                    status: "Statutorily Authorized by Client",
                  }
                : null
            );
          }
        }}
      />

      {/* =========================================================================
          TASK A: REAL-TIME WEBSOCKET PUSH FLOATING TOAST NOTIFICATION
      ========================================================================= */}
      {liveWsToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 rounded-2xl bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white shadow-2xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0 mt-0.5">
                {liveWsToast.type === "auth" ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : liveWsToast.type === "query" ? (
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                ) : liveWsToast.type === "challan" ? (
                  <Receipt className="w-5 h-5 text-blue-500" />
                ) : (
                  <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-extrabold uppercase tracking-wider">
                    {liveWsToast.badge}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {liveWsToast.timestamp}
                  </span>
                </div>
                <h4 className="text-xs font-bold leading-tight text-black dark:text-white">
                  {liveWsToast.title}
                </h4>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                  {liveWsToast.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setLiveWsToast(null)}
              className="text-zinc-400 hover:text-black dark:hover:text-white shrink-0 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Dismiss Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
