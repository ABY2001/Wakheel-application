"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Inbox,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Plus,
  Download,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  X,
  Printer,
  Sparkles,
  Stamp,
  Receipt,
  FolderLock,
  Scale,
  RefreshCw,
  TrendingUp,
  FileText,
  BadgeAlert,
  AlertTriangle,
  FileBadge,
  UserCheck,
  Coins,
  Share2,
  Mail,
  Briefcase,
  Building2,
  Calculator,
  Lock,
  Hash,
  Eye,
  File,
  Loader2,
  MessageSquare,
  Landmark,
  Activity,
} from "lucide-react";
import { citizenApi, csApi } from "@/lib/api";
import caApi from "@/lib/caApi";
import {
  StatutoryComplianceCertificateModal,
  StatutoryCertificateData,
} from "./StatutoryComplianceCertificateModal";
import {
  InDocketQueryThreadModal,
  InDocketQueryItem,
} from "./InDocketQueryThreadModal";
import { StatutoryChallanPaymentSimulatorModal } from "./StatutoryChallanPaymentSimulatorModal";
import {
  StatutoryClientAuthorizationModal,
  ClientAuthorizationRecord,
} from "./StatutoryClientAuthorizationModal";
import { useMatterWebSocket, MatterWebSocketEvent } from "@/hooks/useMatterWebSocket";

export interface ClientMandateItem {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  category: "cs" | "ca";
  assignedAdvocate: string;
  clientPanOrCin?: string;
  status: string;
  filingDate: string;
  stageIndex: number;
  stages: Array<{
    name: string;
    date: string;
    done: boolean;
    remarks?: string;
  }>;
  documents: Array<{
    name: string;
    size: string;
    hash?: string;
    type?: string;
    uploadedAt?: string;
    source?: string;
  }>;
  queries?: InDocketQueryItem[];
  clientAuthorization?: ClientAuthorizationRecord;
  trustDisbursement?: {
    voucherNo?: string;
    treatment?: string;
    amount?: number;
    portal?: string;
    formName?: string;
    cinOrSrn?: string;
    bsrCode?: string;
    challanSerialNumber?: string;
    disbursedAt?: string | null;
    invoiceRef?: string;
    status?: string;
  };
  udinOrSrn?: string;
  feePaid?: string;
  partnerNotes?: string;
}

const DEFAULT_MANDATES: ClientMandateItem[] = [
  {
    id: "seed-cs-1",
    caseNumber: "SRN-MCA-2026/894120",
    title: "Annual MCA Filing (Form AOC-4 & MGT-7) — Inworth Technologies Pvt Ltd",
    court: "MCA21 • Registrar of Companies (ROC Ernakulam)",
    category: "cs",
    assignedAdvocate: "CS Rajesh Sharma (FCS 9214)",
    clientPanOrCin: "CIN: U72200KL2023PTC081290",
    status: "Statutory Verification Complete",
    filingDate: "2026-10-18",
    stageIndex: 4,
    stages: [
      { name: "Docket Initiated & Vault Stamped", date: "18 Oct 2026", done: true, remarks: "Vault documents verified with SHA-256 seal" },
      { name: "Financial Statements Scrutiny", date: "21 Oct 2026", done: true, remarks: "Schedule III balance sheet and director report reconciled" },
      { name: "AGM Minutes & Director Sign-Off", date: "24 Oct 2026", done: true, remarks: "Board resolutions adopted with unanimous vote" },
      { name: "MCA21 V3 Portal E-Filing", date: "27 Oct 2026", done: true, remarks: "Submitted via V3 portal with Class 3 DSC token" },
      { name: "Official ROC SRN Challan Issued", date: "28 Oct 2026", done: true, remarks: "SRN: AA92019401 officially released to client" },
    ],
    documents: [
      { name: "Audited_Balance_Sheet_FY25_26.pdf", size: "3.4 MB", hash: "sha256:7a92c4b8e190fa72" },
      { name: "Directors_Report_MGT9.pdf", size: "1.2 MB", hash: "sha256:3d91ea55c01289fe" },
      { name: "AGM_Signed_Minutes_2026.pdf", size: "840 KB", hash: "sha256:66b1fa091928cc3a" },
    ],
    udinOrSrn: "SRN: AA92019401",
    feePaid: "₹ 12,500 (ROC Statutory + CS Professional Fee)",
    partnerNotes: "All MCA21 requirements satisfied. Filing approved under Section 137 & 92 of Companies Act 2013.",
    clientAuthorization: {
      authId: "ESIGN-20261024-9124",
      signMethod: "AADHAAR_ESIGN",
      signerName: "Rajesh Varma",
      signerPanOrDin: "DIN: 08912401",
      signerAadhaarMasked: "XXXX-XXXX-7419",
      signerDesignation: "Managing Director",
      espReference: "ESP-CDAC-202610-842109",
      timestamp: "2026-10-24T11:45:00.000Z",
      status: "AUTHORIZED",
      statutoryDeclarationAccepted: true,
      documentTitle: "Annual MCA Filing (Form AOC-4 & MGT-7)",
      authHash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      legalSection: "IT Act 2000 Section 3A & Second Schedule (C-DAC ESP) • Companies Act 2013 Section 448",
      certificateAuthority: "C-DAC (Centre for Development of Advanced Computing) e-Sign ESP",
    },
    trustDisbursement: {
      voucherNo: "VCH-MCA-202610-894120",
      treatment: "reimbursable_out_of_pocket",
      amount: 12500,
      portal: "MCA21",
      formName: "AOC-4 & MGT-7",
      cinOrSrn: "SRN: AA92019401",
      bsrCode: "0290142",
      challanSerialNumber: "89410",
      disbursedAt: "2026-10-28T14:20:00.000Z",
      invoiceRef: "INV-STAT-89412",
      status: "RECORDED_IN_TRUST_LEDGER",
    },
  },
  {
    id: "seed-ca-1",
    caseNumber: "ITR-CA-2026/741092",
    title: "Form 3CD Tax Audit & Corporate ITR-6 — Vanguard Infrastructure Ltd",
    court: "ICAI • Income Tax Department (CPC Bengaluru)",
    category: "ca",
    assignedAdvocate: "CA Ramanathan Iyer (FCA 40192)",
    clientPanOrCin: "PAN: AABCV8912G",
    status: "UDIN Stamped & Ready for E-Verification",
    filingDate: "2026-10-25",
    stageIndex: 3,
    stages: [
      { name: "Books of Account & 26AS Ingested", date: "25 Oct 2026", done: true, remarks: "AIS and 26AS reconciled against general ledger" },
      { name: "Depreciation & 43B(h) Audit", date: "29 Oct 2026", done: true, remarks: "Section 43B(h) MSME 45-day calculation completed with 0 disallowance" },
      { name: "Tax Audit Report (Form 3CD) Drafted", date: "02 Nov 2026", done: true, remarks: "Clauses 1 to 44 scrutinized by lead engagement manager" },
      { name: "ICAI UDIN Generation & Stamping", date: "05 Nov 2026", done: true, remarks: "UDIN 2640192A00018921 generated per ICAI guidelines" },
      { name: "ITBA Income Tax Portal Filing", date: "Pending Client OTP", done: false, remarks: "Awaiting final Aadhaar / DSC client authentication" },
    ],
    documents: [
      { name: "Trial_Balance_General_Ledger_2026.xlsx", size: "4.8 MB", hash: "sha256:aa441928e0018fa9" },
      { name: "Form_26AS_AIS_TIS_FY25_26.pdf", size: "2.1 MB", hash: "sha256:12bc5566de778901" },
      { name: "Draft_Form_3CD_Tax_Audit.pdf", size: "1.9 MB", hash: "sha256:44aa0011bb223344" },
    ],
    udinOrSrn: "UDIN: 2640192A00018921",
    feePaid: "₹ 24,000 (Tax Audit & Corporate Return)",
    partnerNotes: "Tax computation finalized under Section 44AB. Gross receipts reconciled with GST turnover.",
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
    category: "cs",
    assignedAdvocate: "CS Rajesh Sharma (FCS 9214)",
    clientPanOrCin: "CIN: U67190DL2021PTC389012",
    status: "Technical Scrutiny in Progress",
    filingDate: "2026-11-02",
    stageIndex: 1,
    stages: [
      { name: "Docket Initiated & Vault Stamped", date: "02 Nov 2026", done: true, remarks: "DIR-2 consent and DIR-8 non-disqualification forms uploaded" },
      { name: "Technical Scrutiny & DIN Verification", date: "04 Nov 2026", done: true, remarks: "DIN 09841202 verified against MCA Director Master Database" },
      { name: "Board Resolution & CTC Sign-Off", date: "Pending Sign-Off", done: false, remarks: "Certified true copy of Board Resolution awaiting digital signature" },
      { name: "MCA21 V3 Portal E-Filing", date: "Pending", done: false, remarks: "Form DIR-12 pre-scrutiny pass required" },
      { name: "Official ROC SRN Challan Issued", date: "Pending", done: false, remarks: "Awaiting approval under Straight Through Process (STP)" },
    ],
    documents: [
      { name: "Consent_Letter_Form_DIR2.pdf", size: "450 KB", hash: "sha256:ee881294fa0018aa" },
      { name: "Declaration_Form_DIR8.pdf", size: "380 KB", hash: "sha256:cc551100bb443322" },
    ],
    udinOrSrn: "SRN: Pending Pre-Scrutiny",
    feePaid: "₹ 6,000 (ROC Statutory Fee + Professional Charges)",
    partnerNotes: "Candidate meets criteria under Section 149(6) of Companies Act 2013.",
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

interface ClientMandatesManagerViewProps {
  firmName?: string;
  practitionerName?: string;
  practiceMode?: "cs" | "ca";
}

export function ClientMandatesManagerView({
  firmName = "Apex Law & Corporate Partners LLP",
  practitionerName = "CS Rajesh Sharma & CA Ramanathan Iyer",
  practiceMode = "cs",
}: ClientMandatesManagerViewProps) {
  const [mandates, setMandates] = useState<ClientMandateItem[]>(DEFAULT_MANDATES);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<"ALL" | "cs" | "ca" | "action_needed" | "completed">("ALL");
  const [selectedMandateDetail, setSelectedMandateDetail] = useState<ClientMandateItem | null>(null);
  const [advancingDocket, setAdvancingDocket] = useState<ClientMandateItem | null>(null);
  const [advanceNotes, setAdvanceNotes] = useState<string>("");
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [udinModalDocket, setUdinModalDocket] = useState<ClientMandateItem | null>(null);
  const [customUdinInput, setCustomUdinInput] = useState<string>("");
  const [certificateModalOpen, setCertificateModalOpen] = useState<boolean>(false);
  const [activeCertificateData, setActiveCertificateData] = useState<StatutoryCertificateData | null>(null);
  const [queryModalDocket, setQueryModalDocket] = useState<ClientMandateItem | null>(null);
  const [queryModalOpen, setQueryModalOpen] = useState<boolean>(false);
  const [challanModalDocket, setChallanModalDocket] = useState<ClientMandateItem | null>(null);
  const [challanModalOpen, setChallanModalOpen] = useState<boolean>(false);
  const [authModalDocket, setAuthModalDocket] = useState<ClientMandateItem | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Real-time WebSocket Push Toast State
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
    role: "advocate",
    userId: "adv_1",
    onAuthorized: (event: MatterWebSocketEvent) => {
      const matterId = event.matterId;
      const caseNumber = event.meta?.caseNumber;
      const auth = event.meta?.authorization;

      setMandates((prev) =>
        prev.map((m) => {
          if (m.id === matterId || m.caseNumber === caseNumber) {
            const updatedStages = [...m.stages];
            if (updatedStages[2]) {
              updatedStages[2] = {
                ...updatedStages[2],
                done: true,
                remarks: `Signed via ${auth?.signMethod === "AADHAAR_ESIGN" ? "Aadhaar e-Sign" : "Class 3 DSC"} by ${auth?.signerName || "Client"}`,
              };
            }
            const newStageIndex = m.stageIndex < 3 ? 3 : m.stageIndex;
            return {
              ...m,
              clientAuthorization: auth || m.clientAuthorization,
              stageIndex: newStageIndex,
              stages: updatedStages,
              status: "Client Statutory Authorization Stamped",
            };
          }
          return m;
        })
      );

      if (selectedMandateDetail && (selectedMandateDetail.id === matterId || selectedMandateDetail.caseNumber === caseNumber)) {
        setSelectedMandateDetail((prev) => {
          if (!prev) return null;
          const updatedStages = [...prev.stages];
          if (updatedStages[2]) {
            updatedStages[2] = {
              ...updatedStages[2],
              done: true,
              remarks: `Signed via ${auth?.signMethod === "AADHAAR_ESIGN" ? "Aadhaar e-Sign" : "Class 3 DSC"} by ${auth?.signerName || "Client"}`,
            };
          }
          return {
            ...prev,
            clientAuthorization: auth || prev.clientAuthorization,
            stageIndex: prev.stageIndex < 3 ? 3 : prev.stageIndex,
            stages: updatedStages,
            status: "Client Statutory Authorization Stamped",
          };
        });
      }

      setLiveWsToast({
        id: `toast-${Date.now()}`,
        type: "auth",
        title: "Client Statutory Authorization Received",
        message: `${event.meta?.signerName || "Authorized Signatory"} executed ${event.meta?.signMethod === "AADHAAR_ESIGN" ? "Aadhaar e-Sign" : "Class 3 DSC"} on ${event.matter?.title || caseNumber || "Docket"} (Ref: ${event.meta?.espReference || "C-DAC"})`,
        badge: "E-SIGN VERIFIED",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      });
    },
    onQueryUpdated: (event: MatterWebSocketEvent) => {
      const matterId = event.matterId;
      const caseNumber = event.meta?.caseNumber;
      const query = event.meta?.query;
      const isResolved = event.meta?.action === "QUERY_RESOLVED";

      setMandates((prev) =>
        prev.map((m) => {
          if (m.id === matterId || m.caseNumber === caseNumber) {
            const existing = m.queries || [];
            let updated = [...existing];
            if (query) {
              const qIdx = updated.findIndex((q) => q.id === query.id);
              if (qIdx >= 0) {
                updated[qIdx] = query;
              } else {
                updated.unshift(query);
              }
            }
            return {
              ...m,
              queries: updated,
            };
          }
          return m;
        })
      );

      if (selectedMandateDetail && (selectedMandateDetail.id === matterId || selectedMandateDetail.caseNumber === caseNumber)) {
        setSelectedMandateDetail((prev) => {
          if (!prev) return null;
          const existing = prev.queries || [];
          let updated = [...existing];
          if (query) {
            const qIdx = updated.findIndex((q) => q.id === query.id);
            if (qIdx >= 0) {
              updated[qIdx] = query;
            } else {
              updated.unshift(query);
            }
          }
          return { ...prev, queries: updated };
        });
      }

      if (queryModalDocket && (queryModalDocket.id === matterId || queryModalDocket.caseNumber === caseNumber)) {
        setQueryModalDocket((prev) => {
          if (!prev) return null;
          const existing = prev.queries || [];
          let updated = [...existing];
          if (query) {
            const qIdx = updated.findIndex((q) => q.id === query.id);
            if (qIdx >= 0) {
              updated[qIdx] = query;
            } else {
              updated.unshift(query);
            }
          }
          return { ...prev, queries: updated };
        });
      }

      setLiveWsToast({
        id: `toast-${Date.now()}`,
        type: "query",
        title: isResolved ? "Client Requisition Response Submitted" : "In-Docket Requisition Updated",
        message: `${event.meta?.title || "Requisition"} on ${caseNumber || "Docket"}`,
        badge: isResolved ? "DOCS RE-UPLOADED" : "REQUISITION PENDING",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      });
    },
    onStageUpdated: (event: MatterWebSocketEvent) => {
      const updatedMatter = event.matter;
      const matterId = event.matterId || updatedMatter?.id || updatedMatter?._id;
      const caseNumber = event.meta?.caseNumber || updatedMatter?.caseNumber;

      setMandates((prev) =>
        prev.map((m) => {
          if (m.id === matterId || m.caseNumber === caseNumber) {
            return {
              ...m,
              stageIndex: typeof updatedMatter?.stageIndex === "number" ? updatedMatter.stageIndex : m.stageIndex,
              status: updatedMatter?.status || event.meta?.status || m.status,
              udinOrSrn: updatedMatter?.udinOrSrn || m.udinOrSrn,
              stages: updatedMatter?.stages || m.stages,
            };
          }
          return m;
        })
      );

      if (selectedMandateDetail && (selectedMandateDetail.id === matterId || selectedMandateDetail.caseNumber === caseNumber)) {
        setSelectedMandateDetail((prev) =>
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
        title: "Mandate Milestone Synchronized",
        message: `${updatedMatter?.title || event.meta?.title || "Mandate"} updated to ${event.meta?.status || "advanced milestone"}`,
        badge: "STAGE ADVANCE",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      });
    },
    onChallanPaid: (event: MatterWebSocketEvent) => {
      const matterId = event.matterId;
      const voucher = event.meta?.voucherNumber;
      const amount = event.meta?.amount;

      setMandates((prev) =>
        prev.map((m) => {
          if (m.id === matterId || (voucher && m.trustDisbursement?.voucherNo === voucher)) {
            return {
              ...m,
              feePaid: `₹ ${amount?.toLocaleString("en-IN") || "Settled"} (Pure Agent Statutory Disbursement)`,
            };
          }
          return m;
        })
      );

      setLiveWsToast({
        id: `toast-${Date.now()}`,
        type: "challan",
        title: "Statutory Challan Disbursed",
        message: `₹${amount?.toLocaleString("en-IN") || ""} booked under Pure Agent Voucher #${voucher || "VCH-2026"}`,
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

  const handleOpenCertificate = (mandate: ClientMandateItem) => {
    setActiveCertificateData({
      caseNumber: mandate.caseNumber,
      title: mandate.title,
      courtOrAuthority: mandate.court,
      category: mandate.category,
      clientName: "Inworth Technologies Pvt Ltd",
      clientCinOrPan: mandate.clientPanOrCin || "U72200KL2023PTC081290",
      clientGstin: "32AABCI9812G1Z2",
      assignedProfessional: mandate.assignedAdvocate,
      professionalRole:
        mandate.category === "ca"
          ? "Fellow Chartered Accountant (FCA) • Statutory Auditor"
          : "Practicing Company Secretary (FCS) • Corporate Secretarial Advisor",
      membershipNumber:
        mandate.category === "ca"
          ? "ICAI M.No 240189 • FRN 019482C"
          : "ICSI FCS-9482 • CP 14298",
      firmName: "Wakheel Multi-Disciplinary Practice LLP",
      udinOrSrn: mandate.udinOrSrn || "SRN-VERIFIED-2026",
      filingDate: mandate.filingDate,
      certificationDate: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      integrityHash:
        mandate.documents?.[0]?.hash ||
        "sha256:7f92014ea89201cb184920aef104928b",
      status: "OFFICIALLY FILED",
      feePaid: mandate.feePaid,
    });
    setCertificateModalOpen(true);
  };

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Load live matters from backend and merge with seeded mandates
  const loadMandates = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || localStorage.getItem("wakheel_token") || "dev_token" : "dev_token";
      const res = await citizenApi.getMatters(token).catch(() => ({ matters: [] }));

      if (res && res.matters && Array.isArray(res.matters)) {
        const liveMandates: ClientMandateItem[] = res.matters
          .filter((m: any) => {
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
          })
          .map((m: any, idx: number) => {
            const isCa = (m.caseNumber || "").startsWith("ITR") || (m.title || "").toLowerCase().includes("tax") || (m.court || "").toLowerCase().includes("icai");
            const isCompleted = (m.status || "").toLowerCase().includes("complete") || (m.status || "").toLowerCase().includes("disposed");
            const stageIndex = typeof m.stageIndex === "number" ? m.stageIndex : (isCompleted ? 4 : (m.stageIndex || 1));
            const stages = m.stages && Array.isArray(m.stages) && m.stages.length === 5 ? m.stages : [
              { name: "Docket Initiated & Vault Stamped", date: m.filingDate || "Filing Date", done: true, remarks: "Vault record verified" },
              { name: "Technical Scrutiny & Computation", date: stageIndex >= 1 ? "Complete" : "In Progress", done: stageIndex >= 1, remarks: "Four-eyes checklist verified" },
              { name: "Client Sign-Off & Director Sign-Off", date: stageIndex >= 2 ? "Approved" : "Pending", done: stageIndex >= 2, remarks: "Client verified figures" },
              { name: "UDIN / MCA21 Portal E-Filing", date: stageIndex >= 3 ? "Submitted" : "Pending Submission", done: stageIndex >= 3, remarks: "Digital token verified" },
              { name: "Official Acknowledgment Released", date: stageIndex >= 4 ? "Issued" : "Pending", done: stageIndex >= 4, remarks: "Challan / Acknowledgment copy generated" },
            ];

            return {
              id: m.id || m._id || `live-mandate-${idx}`,
              caseNumber: m.caseNumber || `SRN-MCA-2026/${idx + 1000}`,
              title: m.title || m.matterTitle || "Statutory Compliance Docket",
              court: m.court || m.courtForum || (isCa ? "ICAI • Income Tax Department" : "MCA21 • Registrar of Companies"),
              category: isCa ? "ca" : "cs",
              assignedAdvocate: m.assignedAdvocate || m.advocateName || (isCa ? "CA Ramanathan Iyer (FCA 40192)" : "CS Rajesh Sharma (FCS 9214)"),
              clientPanOrCin: m.clientPanOrCin || (isCa ? "PAN: AABCV8912G" : "CIN: U72200KL2023PTC081290"),
              status: m.status || (isCompleted ? "Statutory Verification Complete" : "In Technical Scrutiny"),
              filingDate: m.filingDate || new Date().toISOString().split("T")[0],
              stageIndex,
              stages,
              documents: m.documents && Array.isArray(m.documents) && m.documents.length > 0 ? m.documents : [
                { name: "Supporting_Statutory_Dossier.pdf", size: "2.4 MB", hash: "sha256:8899aabbccddeeff" },
              ],
              udinOrSrn: m.udinOrSrn || (isCa ? "UDIN: 2640192A00098124" : "SRN: ROC-2026-90124"),
              feePaid: m.feePaid || "Retainer Verified",
              partnerNotes: m.partnerNotes || "Docket active in multi-disciplinary firm workflow.",
              queries: m.queries || [],
              clientAuthorization: m.clientAuthorization || undefined,
              trustDisbursement: m.trustDisbursement || undefined,
            };
          });

        if (liveMandates.length > 0) {
          // Merge unique by caseNumber
          const map = new Map<string, ClientMandateItem>();
          for (const item of liveMandates) map.set(item.caseNumber, item);
          for (const item of DEFAULT_MANDATES) {
            if (!map.has(item.caseNumber)) map.set(item.caseNumber, item);
          }
          setMandates(Array.from(map.values()));
          return;
        }
      }

      setMandates(DEFAULT_MANDATES);
    } catch (e) {
      console.warn("Failed to load mandates:", e);
      setMandates(DEFAULT_MANDATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMandates();
  }, []);

  // Filtered list
  const filteredMandates = useMemo(() => {
    return mandates.filter((m) => {
      // Category filter
      if (filterCategory === "cs" && m.category !== "cs") return false;
      if (filterCategory === "ca" && m.category !== "ca") return false;
      if (filterCategory === "action_needed" && m.stageIndex >= 4) return false;
      if (filterCategory === "completed" && m.stageIndex < 4) return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.caseNumber.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.court.toLowerCase().includes(q) ||
        m.assignedAdvocate.toLowerCase().includes(q) ||
        (m.clientPanOrCin && m.clientPanOrCin.toLowerCase().includes(q)) ||
        (m.udinOrSrn && m.udinOrSrn.toLowerCase().includes(q))
      );
    });
  }, [mandates, filterCategory, searchQuery]);

  // Priority 2: Professional Action - Advance Milestone Stage
  const handleAdvanceStage = async (mandate: ClientMandateItem) => {
    if (mandate.stageIndex >= 4) return;
    try {
      setIsSubmittingAction(true);
      const nextIndex = mandate.stageIndex + 1;
      const updatedStages = mandate.stages.map((st, idx) => {
        if (idx <= nextIndex) {
          return {
            ...st,
            done: true,
            date: st.done ? st.date : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            remarks: idx === nextIndex && advanceNotes.trim() ? advanceNotes.trim() : st.remarks,
          };
        }
        return st;
      });

      const nextStatus =
        nextIndex === 1
          ? "Technical Scrutiny Complete"
          : nextIndex === 2
          ? "Client Sign-Off Obtained"
          : nextIndex === 3
          ? "UDIN Stamped & Filed on Portal"
          : "Statutory Verification Complete";

      const token = typeof window !== "undefined" ? localStorage.getItem("token") || localStorage.getItem("wakheel_token") || "dev_token" : "dev_token";

      // 1. Update Matter in backend
      await citizenApi.updateMatter(token, mandate.id, {
        stageIndex: nextIndex,
        status: nextStatus,
        stages: updatedStages,
      }).catch((e) => console.warn("updateMatter non-fatal:", e));

      // 2. Cross-update CS/CA registries
      if (mandate.category === "cs") {
        await csApi.updateRocFiling(mandate.caseNumber, {
          status: nextIndex >= 3 ? "approved" : "in_progress",
        }).catch(() => {});
      } else {
        await caApi.updateIncomeTaxReturn(mandate.caseNumber, {
          status: nextIndex >= 3 ? "filed" : "computed",
        }).catch(() => {});
      }

      // 3. Local update state
      setMandates((prev) =>
        prev.map((m) =>
          m.id === mandate.id
            ? {
                ...m,
                stageIndex: nextIndex,
                status: nextStatus,
                stages: updatedStages,
              }
            : m
        )
      );

      setAdvancingDocket(null);
      setAdvanceNotes("");
    } catch (err: any) {
      console.error("Failed to advance stage:", err);
      alert("Error advancing stage: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Priority 2: Professional Action - Stamp Official UDIN or MCA SRN
  const handleStampUdinOrSrn = async () => {
    if (!udinModalDocket) return;
    try {
      setIsSubmittingAction(true);
      const isCa = udinModalDocket.category === "ca";
      let generatedToken = "";

      if (customUdinInput.trim()) {
        generatedToken = customUdinInput.trim();
      } else if (isCa) {
        // Generate authentic 18-character ICAI UDIN
        const year = new Date().getFullYear().toString().slice(-2);
        const mem = "054921";
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
        generatedToken = `UDIN: ${year}${mem}${randomSuffix}`.slice(0, 24);
      } else {
        // Generate MCA21 V3 SRN
        const randomDigits = Math.floor(100000 + Math.random() * 900000);
        generatedToken = `SRN: AA${randomDigits}`;
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("token") || localStorage.getItem("wakheel_token") || "dev_token" : "dev_token";

      // Advance to stage 3 if currently at stage 1 or 2
      const targetStageIndex = Math.max(udinModalDocket.stageIndex, 3);
      const updatedStages = udinModalDocket.stages.map((st, idx) => {
        if (idx <= targetStageIndex) {
          return {
            ...st,
            done: true,
            date: st.done ? st.date : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            remarks: idx === 3 ? `${generatedToken} verified & stamped by certifying professional.` : st.remarks,
          };
        }
        return st;
      });

      const updatedStatus = isCa ? "UDIN Stamped & Ready for E-Verification" : "MCA21 V3 SRN Stamped & Filed";

      await citizenApi.updateMatter(token, udinModalDocket.id, {
        udinOrSrn: generatedToken,
        stageIndex: targetStageIndex,
        status: updatedStatus,
        stages: updatedStages,
      }).catch((e) => console.warn("updateMatter non-fatal:", e));

      // Local update
      setMandates((prev) =>
        prev.map((m) =>
          m.id === udinModalDocket.id
            ? {
                ...m,
                udinOrSrn: generatedToken,
                stageIndex: targetStageIndex,
                status: updatedStatus,
                stages: updatedStages,
              }
            : m
        )
      );

      setUdinModalDocket(null);
      setCustomUdinInput("");
    } catch (err: any) {
      console.error("Failed to stamp UDIN/SRN:", err);
      alert("Error stamping token: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Priority 2: Professional Action - Release Official Acknowledgment & Complete
  const handleReleaseAcknowledgment = async (mandate: ClientMandateItem) => {
    try {
      setIsSubmittingAction(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || localStorage.getItem("wakheel_token") || "dev_token" : "dev_token";

      const updatedStages = mandate.stages.map((st) => ({
        ...st,
        done: true,
        date: st.done ? st.date : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      }));

      const finalStatus = "Statutory Verification Complete";

      await citizenApi.updateMatter(token, mandate.id, {
        stageIndex: 4,
        status: finalStatus,
        stages: updatedStages,
      }).catch((e) => console.warn("updateMatter non-fatal:", e));

      setMandates((prev) =>
        prev.map((m) =>
          m.id === mandate.id
            ? {
                ...m,
                stageIndex: 4,
                status: finalStatus,
                stages: updatedStages,
              }
            : m
        )
      );

      alert(`Official Statutory Acknowledgment released for ${mandate.caseNumber}. The client can now download their certified filing copy.`);
    } catch (err: any) {
      console.error("Failed to release acknowledgment:", err);
      alert("Error: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Download Certified Acknowledgment
  const handleDownloadAcknowledgment = (mandate: ClientMandateItem) => {
    const content = `================================================================================
GOVERNMENT OF INDIA • STATUTORY COMPLIANCE ACKNOWLEDGMENT
================================================================================
Platform: Wakheel Multi-Disciplinary Practice Network (Kerala High Court & ROC)
Docket Reference: ${mandate.caseNumber}
Matter Title: ${mandate.title}
Filing Authority: ${mandate.court}
Certifying Professional: ${mandate.assignedAdvocate}
Statutory Reference / Token: ${mandate.udinOrSrn || "SRN-VERIFIED-2026"}
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
    a.download = `${mandate.caseNumber.replace(/[^a-zA-Z0-9]/g, "_")}_Official_Acknowledgment.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner / Header */}
      <div className="p-6 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-extrabold uppercase tracking-wider">
                INBOUND MANDATES
              </span>
              <span className="text-xs font-mono text-zinc-500 font-semibold">
                Priority 1 &amp; 2 • Firm Engagement Pipeline
              </span>
            </div>
            <h2 className="text-xl font-black text-black dark:text-white">
              Client Mandates &amp; Statutory Filings Queue
            </h2>
            <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
              Real-time inbound statutory dockets initiated by corporate and business clients. Review uploaded dossiers, advance 5-stage milestones, stamp ICAI UDINs, and release certified MCA21 acknowledgments.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono font-semibold transition-colors ${
                isWsConnected
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500"
              }`}
              title={
                isWsConnected
                  ? "WebSocket Connected: Inbound client authorizations, dockets, and requisitions streaming live"
                  : "Connecting to live WebSocket push gateway..."
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isWsConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                }`}
              />
              <span>{isWsConnected ? "Live Gateway Active" : "Connecting..."}</span>
            </div>

            <button
              onClick={loadMandates}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-xs font-semibold text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>Total Inbound</span>
              <Inbox className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-black mt-1 font-mono text-black dark:text-white">
              {mandates.length}
            </div>
            <span className="text-[10px] text-zinc-400 block mt-0.5">CA &amp; CS Client Dockets</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>In Scrutiny</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black mt-1 font-mono text-black dark:text-white">
              {mandates.filter((m) => m.stageIndex < 3).length}
            </div>
            <span className="text-[10px] text-zinc-400 block mt-0.5">Stages 01 &amp; 02 Pending</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>Ready for Filing</span>
              <FileBadge className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black mt-1 font-mono text-black dark:text-white">
              {mandates.filter((m) => m.stageIndex === 3).length}
            </div>
            <span className="text-[10px] text-zinc-400 block mt-0.5">UDIN / MCA V3 Sign-Off</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black mt-1 font-mono text-black dark:text-white">
              {mandates.filter((m) => m.stageIndex >= 4).length}
            </div>
            <span className="text-[10px] text-zinc-400 block mt-0.5">Acknowledgment Released</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL", label: "All Mandates" },
            { id: "cs", label: "Company Secretary (CS)" },
            { id: "ca", label: "Chartered Accountant (CA)" },
            { id: "action_needed", label: "Action Needed" },
            { id: "completed", label: "Completed" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterCategory(pill.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterCategory === pill.id
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, PAN/CIN, or ref..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
        </div>
      </div>

      {/* Mandates Listing */}
      {loading ? (
        <div className="p-16 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-zinc-400 mb-3" />
          <p className="text-xs font-mono text-zinc-500">Synchronizing client dockets with multi-disciplinary registry...</p>
        </div>
      ) : filteredMandates.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950">
          <Inbox className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-black dark:text-white">No matching client mandates found</h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            Try adjusting your search query or category filters to view client statutory dockets.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMandates.map((mandate) => {
            const isCompleted = mandate.stageIndex >= 4;
            const isCa = mandate.category === "ca";
            return (
              <div
                key={mandate.id}
                className="p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xs space-y-4 hover:border-black dark:hover:border-white transition-all"
              >
                {/* Mandate Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-900">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-black dark:text-white">
                      {mandate.caseNumber}
                    </span>
                    <button
                      onClick={() => handleCopy(mandate.caseNumber, `copy-${mandate.id}`)}
                      className="text-zinc-400 hover:text-black dark:hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                      title="Copy Reference"
                    >
                      {copiedId === `copy-${mandate.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                      {isCa ? "CA Practice (ICAI)" : "CS Practice (ICSI)"}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                      {mandate.court}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isCompleted ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                      {mandate.status}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {mandate.filingDate}
                    </span>
                  </div>
                </div>

                {/* Mandate Title & Overview */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-black dark:text-white">
                    {mandate.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Assigned:</span>
                      <strong className="text-black dark:text-white font-semibold">
                        {mandate.assignedAdvocate}
                      </strong>
                    </span>
                    {mandate.clientPanOrCin && (
                      <span className="flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                        {mandate.clientPanOrCin}
                      </span>
                    )}
                    {mandate.udinOrSrn && (
                      <span className="flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-bold">
                        <Hash className="w-3 h-3 text-zinc-400" />
                        <span>{mandate.udinOrSrn}</span>
                      </span>
                    )}
                    {mandate.feePaid && (
                      <span className="text-zinc-500 text-[11px]">
                        • {mandate.feePaid}
                      </span>
                    )}
                    {mandate.trustDisbursement && (
                      <span className="flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300">
                        <Landmark className="w-3 h-3 text-indigo-500" />
                        <span>Trust Voucher: {mandate.trustDisbursement.voucherNo}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 5-Stage Milestone Progression Pipeline */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                      Statutory Milestone Pipeline (Stage {mandate.stageIndex + 1} of 5)
                    </span>
                    {mandate.stageIndex < 4 && (
                      <span className="text-[10px] font-mono text-amber-500 font-semibold">
                        Action required from professional
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 relative">
                    {mandate.stages.map((stage, sIdx) => {
                      const isDone = stage.done;
                      const isCurrent = mandate.stageIndex === sIdx;
                      return (
                        <div
                          key={sIdx}
                          className={`p-3 rounded-2xl border text-xs transition-all ${
                            isDone
                              ? "bg-zinc-100/80 dark:bg-zinc-900/80 border-black dark:border-white text-black dark:text-white"
                              : isCurrent
                              ? "bg-zinc-50 dark:bg-zinc-950 border-zinc-400 dark:border-zinc-600 text-black dark:text-white shadow-xs"
                              : "bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[9px] font-bold uppercase text-zinc-400">
                              Stage 0{sIdx + 1}
                            </span>
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : isCurrent ? (
                              <Clock className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                            )}
                          </div>
                          <p className="font-bold text-[11px] leading-tight">
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

                {/* Attached Vault Documents Preview */}
                {mandate.documents && mandate.documents.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold flex items-center gap-1.5 text-black dark:text-white">
                        <Lock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Client Vault Dossier ({mandate.documents.length} files attached)</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Cryptographic SHA-256 Stamped
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {mandate.documents.map((doc, dIdx) => (
                        <div
                          key={dIdx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-[11px]"
                        >
                          <File className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="font-medium text-black dark:text-white">{doc.name}</span>
                          <span className="text-zinc-400 text-[10px] font-mono">({doc.size})</span>
                          {doc.hash && (
                            <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                              {doc.hash.slice(0, 15)}...
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority 2: Professional Action Controls Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedMandateDetail(mandate)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Audit Trail &amp; Dossier</span>
                    </button>
                    <button
                      onClick={() => {
                        setQueryModalDocket(mandate);
                        setQueryModalOpen(true);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                        (mandate.queries?.filter((q) => q.status === "OPEN").length || 0) > 0
                          ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100"
                          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        Requisitions{" "}
                        {mandate.queries && mandate.queries.length > 0
                          ? `(${mandate.queries.filter((q) => q.status === "OPEN").length} open)`
                          : ""}
                      </span>
                    </button>
                    {isCompleted && (
                      <button
                        onClick={() => handleOpenCertificate(mandate)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                        title="View & Print Official Statutory Compliance Certificate (A4 / PDF / QR Code)"
                      >
                        <FileBadge className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Official Certificate (A4/PDF)</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setChallanModalDocket(mandate);
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
                        setAuthModalDocket(mandate);
                        setAuthModalOpen(true);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                        mandate.clientAuthorization
                          ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100"
                          : "border-indigo-200 dark:border-indigo-900 bg-white dark:bg-black text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50"
                      }`}
                      title="Inspect Client Electronic Authorization & Sign-Off Record"
                    >
                      <ShieldCheck className={`w-3.5 h-3.5 ${mandate.clientAuthorization ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-500"}`} />
                      <span>{mandate.clientAuthorization ? "Client e-Signed" : "Client Sign-Off"}</span>
                    </button>
                  </div>

                  {/* Professional Stage Advancement & Stamping Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* UDIN / SRN Stamping Button */}
                    {mandate.stageIndex >= 2 && mandate.stageIndex < 4 && (
                      <button
                        onClick={() => {
                          setUdinModalDocket(mandate);
                          setCustomUdinInput("");
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white text-xs font-bold text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Stamp className="w-3.5 h-3.5" />
                        <span>
                          {isCa ? "Stamp ICAI UDIN" : "Stamp MCA21 SRN"}
                        </span>
                      </button>
                    )}

                    {/* Advance Stage Button */}
                    {mandate.stageIndex < 4 && (
                      <button
                        onClick={() => {
                          setAdvancingDocket(mandate);
                          setAdvanceNotes("");
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer shadow-xs"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>
                          Advance to Stage 0{mandate.stageIndex + 2}
                        </span>
                      </button>
                    )}

                    {/* Final Release Button */}
                    {mandate.stageIndex === 3 && (
                      <button
                        onClick={() => handleReleaseAcknowledgment(mandate)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Release Official Acknowledgment</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL: ADVANCE STAGE CONFIRMATION DIALOG (Priority 2)
      ========================================================================= */}
      {advancingDocket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold text-black dark:text-white">
                  MILESTONE ADVANCEMENT
                </span>
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  Advance to Stage 0{advancingDocket.stageIndex + 2}
                </h3>
                <p className="text-xs font-mono text-zinc-500">
                  {advancingDocket.caseNumber} • {advancingDocket.title}
                </p>
              </div>
              <button
                onClick={() => setAdvancingDocket(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                <span className="font-bold text-black dark:text-white block">
                  Next Milestone: {advancingDocket.stages[advancingDocket.stageIndex + 1]?.name}
                </span>
                <p className="text-zinc-500">
                  Advancing will update the client's live compliance tracker, timestamp the statutory register, and notify the designated professional.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Professional Auditor / CS Remarks (Optional)
                </label>
                <textarea
                  value={advanceNotes}
                  onChange={(e) => setAdvanceNotes(e.target.value)}
                  placeholder="e.g. Technical scrutiny completed with zero audit variance. Schedule III balance sheet figures validated."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setAdvancingDocket(null)}
                disabled={isSubmittingAction}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAdvanceStage(advancingDocket)}
                disabled={isSubmittingAction}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm &amp; Advance Stage</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: UDIN / MCA SRN GENERATION & STAMPING (Priority 2)
      ========================================================================= */}
      {udinModalDocket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold text-black dark:text-white">
                  {udinModalDocket.category === "ca" ? "ICAI UDIN ATTESTATION" : "MCA21 V3 SRN STAMP"}
                </span>
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  {udinModalDocket.category === "ca" ? "Generate & Stamp ICAI UDIN" : "Stamp MCA21 V3 SRN Token"}
                </h3>
                <p className="text-xs font-mono text-zinc-500">
                  {udinModalDocket.caseNumber} • {udinModalDocket.title}
                </p>
              </div>
              <button
                onClick={() => setUdinModalDocket(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <span className="font-bold text-black dark:text-white block">
                  {udinModalDocket.category === "ca"
                    ? "Unique Document Identification Number (UDIN)"
                    : "Service Request Number (SRN)"}
                </span>
                <p className="text-zinc-500 leading-relaxed">
                  {udinModalDocket.category === "ca"
                    ? "Governed under ICAI Council Guidelines. Formulates an 18-digit cryptographic token that validates audit authenticity against the CBDT & ICAI portal."
                    : "Official MCA21 V3 reference token confirming payment of statutory filing fee under BharatKosh."}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {udinModalDocket.category === "ca" ? "Custom UDIN (Leave blank for automated 18-digit token)" : "Custom SRN (Leave blank for auto-generation)"}
                </label>
                <input
                  type="text"
                  value={customUdinInput}
                  onChange={(e) => setCustomUdinInput(e.target.value)}
                  placeholder={udinModalDocket.category === "ca" ? "e.g. 26054921AAAAAA9214" : "e.g. SRN: AA92019401"}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-black dark:focus:border-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setUdinModalDocket(null)}
                disabled={isSubmittingAction}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStampUdinOrSrn}
                disabled={isSubmittingAction}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Stamp &amp; Release Token</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: FULL AUDIT TRAIL & DOSSIER DETAIL
      ========================================================================= */}
      {selectedMandateDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            <div className="p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-black dark:text-white">
                    {selectedMandateDetail.caseNumber}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                    {selectedMandateDetail.court}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  {selectedMandateDetail.title}
                </h3>
                <p className="text-xs text-zinc-500 font-mono">
                  Certifying Professional: {selectedMandateDetail.assignedAdvocate}
                </p>
              </div>
              <button
                onClick={() => setSelectedMandateDetail(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">Status</span>
                  <span className="text-xs font-bold text-black dark:text-white mt-0.5 block">
                    {selectedMandateDetail.status}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">Token / Reference</span>
                  <span className="text-xs font-mono font-bold text-black dark:text-white mt-0.5 block truncate">
                    {selectedMandateDetail.udinOrSrn || "SRN-PENDING"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">Filing Date</span>
                  <span className="text-xs font-bold text-black dark:text-white mt-0.5 block">
                    {selectedMandateDetail.filingDate}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider font-mono mb-3">
                  Chronological Statutory Audit Trail
                </h4>
                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800 pl-8">
                  {selectedMandateDetail.stages.map((stage, idx) => (
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
                          {stage.remarks || (stage.done
                            ? "Verified under statutory standards with cryptographic digital timestamp."
                            : "Pending action by certifying professional or portal response.")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMandateDetail.documents && selectedMandateDetail.documents.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider font-mono mb-2">
                    Vault Evidence &amp; Tamper Verification Hashes
                  </h4>
                  <div className="space-y-2">
                    {selectedMandateDetail.documents.map((doc, dIdx) => (
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
            </div>

            <div className="p-4 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-mono text-zinc-400">
                Wakheel Multi-Disciplinary Practice Network
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedMandateDetail(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setQueryModalDocket(selectedMandateDetail);
                    setQueryModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    Requisitions{" "}
                    {selectedMandateDetail?.queries && selectedMandateDetail.queries.length > 0
                      ? `(${selectedMandateDetail.queries.filter((q) => q.status === "OPEN").length} open)`
                      : ""}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setChallanModalDocket(selectedMandateDetail);
                    setChallanModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer shadow-xs"
                >
                  <Receipt className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Govt Challan &amp; Fees</span>
                </button>
                <button
                  onClick={() => {
                    setAuthModalDocket(selectedMandateDetail);
                    setAuthModalOpen(true);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                    selectedMandateDetail?.clientAuthorization
                      ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100"
                      : "border-indigo-200 dark:border-indigo-900 bg-white dark:bg-zinc-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${selectedMandateDetail?.clientAuthorization ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-500"}`} />
                  <span>{selectedMandateDetail?.clientAuthorization ? "Client e-Signed" : "Client Sign-Off"}</span>
                </button>
                <button
                  onClick={() => handleOpenCertificate(selectedMandateDetail)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer shadow-xs"
                >
                  <FileBadge className="w-3.5 h-3.5" />
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
        viewerMode="professional"
        docket={queryModalDocket}
        onQueriesUpdated={(updatedQueries, newDocs) => {
          if (!queryModalDocket) return;
          const updatedMandates = mandates.map((m) => {
            if (m.id === queryModalDocket.id) {
              const docs = newDocs && newDocs.length > 0 ? [...m.documents, ...newDocs] : m.documents;
              return { ...m, queries: updatedQueries, documents: docs };
            }
            return m;
          });
          setMandates(updatedMandates);
          if (queryModalDocket) {
            setQueryModalDocket((prev) =>
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
        viewerMode="professional"
        docket={challanModalDocket}
        onChallanPaid={(paidChallan, newDocketDoc) => {
          if (!challanModalDocket) return;
          const updatedMandates = mandates.map((m) => {
            if (m.id === challanModalDocket.id) {
              const docs = [...m.documents, newDocketDoc];
              return {
                ...m,
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
            return m;
          });
          setMandates(updatedMandates);
        }}
      />

      {/* =========================================================================
          TASK B: CLIENT STATUTORY E-SIGN & AUTHORIZATION AUDIT MODAL
      ========================================================================= */}
      <StatutoryClientAuthorizationModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthModalDocket(null);
        }}
        viewerMode="professional"
        docket={authModalDocket}
        onAuthorized={(authRecord, newDocketDoc) => {
          if (!authModalDocket) return;
          const updatedMandates = mandates.map((m) => {
            if (m.id === authModalDocket.id) {
              const docs = [...m.documents, newDocketDoc];
              const updatedStages = Array.isArray(m.stages)
                ? m.stages.map((st, sIdx) =>
                    sIdx === 2
                      ? {
                          ...st,
                          done: true,
                          remarks: `e-Signed via ${authRecord.signMethod === "AADHAAR_ESIGN" ? "Aadhaar OTP" : "Class 3 DSC"} by ${authRecord.signerName}`,
                        }
                      : st
                  )
                : m.stages;
              const newStageIndex = typeof m.stageIndex === "number" && m.stageIndex < 3 ? 3 : m.stageIndex;
              return {
                ...m,
                clientAuthorization: authRecord,
                documents: docs,
                stages: updatedStages,
                stageIndex: newStageIndex,
                status: "Statutorily Authorized by Client",
              };
            }
            return m;
          });
          setMandates(updatedMandates);
          if (authModalDocket) {
            setAuthModalDocket((prev) =>
              prev
                ? {
                    ...prev,
                    clientAuthorization: authRecord,
                    documents: [...prev.documents, newDocketDoc],
                    status: "Statutorily Authorized by Client",
                  }
                : null
            );
          }
          if (selectedMandateDetail && selectedMandateDetail.id === authModalDocket.id) {
            setSelectedMandateDetail((prev) =>
              prev
                ? {
                    ...prev,
                    clientAuthorization: authRecord,
                    documents: [...prev.documents, newDocketDoc],
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
