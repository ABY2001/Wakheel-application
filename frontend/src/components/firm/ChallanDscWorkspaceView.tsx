"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  KeyRound,
  ShieldCheck,
  Receipt,
  Building2,
  Calculator,
  Percent,
  Check,
  Copy,
  Printer,
  Download,
  AlertTriangle,
  RefreshCw,
  Plus,
  ExternalLink,
  Lock,
  Unlock,
  Usb,
  FileCheck,
  Sparkles,
  QrCode,
  CreditCard,
  Building,
  CheckCircle2,
  X,
  FileText,
} from "lucide-react";
import {
  challanDscApi,
  DscCertificateItem,
  StatutoryChallanItem,
} from "@/lib/challanDscApi";

interface ChallanDscWorkspaceViewProps {
  firmName?: string;
  practitionerName?: string;
  defaultClient?: {
    name: string;
    cin?: string;
    pan?: string;
    gstin?: string;
  };
}

const formatInr = (amount?: number | null) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Default seed tokens if API loading
const DEFAULT_CERTIFICATES: DscCertificateItem[] = [
  {
    id: "dsc-cs-1",
    certificateId: "DSC-CS-8921",
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

const DEFAULT_CHALLANS: StatutoryChallanItem[] = [
  {
    id: "chl-mca-1",
    challanId: "CHL-MCA-001",
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
    id: "chl-gst-1",
    challanId: "CHL-GST-001",
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
    id: "chl-it-1",
    challanId: "CHL-IT-001",
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
];

export function ChallanDscWorkspaceView({
  firmName = "Wakheel Corporate & Tax Advisory LLP",
  practitionerName = "CS Rajesh Sharma & CA Ramanathan Iyer",
  defaultClient = {
    name: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    pan: "AAECS1234F",
    gstin: "07AAECS1234F1Z8",
  },
}: ChallanDscWorkspaceViewProps) {
  const [activeTab, setActiveTab] = useState<"dsc-manager" | "challan-simulator">("dsc-manager");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // DSC Datasets
  const [certificates, setCertificates] = useState<DscCertificateItem[]>(DEFAULT_CERTIFICATES);
  const [selectedCertId, setSelectedCertId] = useState<string>("dsc-cs-1");

  // Signing Sandbox State
  const [signingDocType, setSigningDocType] = useState<string>("board_resolution");
  const [docTitle, setDocTitle] = useState<string>("Board Resolution under Section 186 (Loans & Guarantees)");
  const [tokenPin, setTokenPin] = useState<string>("12345678");
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [signedPlaque, setSignedPlaque] = useState<any>(null);
  const [verifyStatus, setVerifyStatus] = useState<any>(null);

  // Challans Datasets
  const [challans, setChallans] = useState<StatutoryChallanItem[]>(DEFAULT_CHALLANS);
  const [portalFilter, setPortalFilter] = useState<"ALL" | "MCA21" | "GSTN" | "CBDT_INCOME_TAX">("ALL");

  // Late Fee Calculator State
  const [calcCapital, setCalcCapital] = useState<number>(25000000);
  const [calcFormType, setCalcFormType] = useState<string>("annual_return");
  const [calcDelayDays, setCalcDelayDays] = useState<number>(14);
  const [calcResult, setCalcResult] = useState<any>(null);

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // New Challan Modal State
  const [newChallanModalOpen, setNewChallanModalOpen] = useState(false);
  const [newChallanPortal, setNewChallanPortal] = useState<"MCA21" | "GSTN" | "CBDT_INCOME_TAX">("MCA21");
  const [newChallanForm, setNewChallanForm] = useState("AOC-4");
  const [newChallanAmount, setNewChallanAmount] = useState(600);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Load Initial Datasets
  const loadData = async () => {
    setLoading(true);
    try {
      const [dscRes, chlRes] = await Promise.allSettled([
        challanDscApi.getDscCertificates(),
        challanDscApi.getStatutoryChallans(),
      ]);

      if (dscRes.status === "fulfilled" && dscRes.value?.certificates?.length > 0) {
        setCertificates(dscRes.value.certificates);
      }
      if (chlRes.status === "fulfilled" && chlRes.value?.challans?.length > 0) {
        setChallans(chlRes.value.challans);
      }
    } catch (err) {
      console.warn("loadData error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    handleCalculateFee();
  }, []);

  const selectedCertificate = useMemo(() => {
    return (
      certificates.find(
        (c) => c.id === selectedCertId || c.certificateId === selectedCertId
      ) || certificates[0]
    );
  }, [certificates, selectedCertId]);

  // Toggle USB Token insertion
  const handleTogglePlug = async (certId: string, currentStatus: string) => {
    const newPlugState = currentStatus === "unplugged";
    try {
      await challanDscApi.toggleDscToken(certId, newPlugState);
      setCertificates((prev) =>
        prev.map((c) =>
          c.id === certId || c.certificateId === certId
            ? { ...c, tokenStatus: newPlugState ? "plugged_in" : "unplugged" }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // 1-Click Cryptographic Digital Signer
  const handleSignDocument = async () => {
    setIsSigning(true);
    setSignedPlaque(null);
    setVerifyStatus(null);
    try {
      const res = await challanDscApi.signDocumentWithDsc({
        certificateId: selectedCertificate?.certificateId || "DSC-CS-8921",
        pin: tokenPin,
        documentTitle: docTitle,
        documentType: signingDocType,
        documentPayload: `PAYLOAD::${docTitle}::${defaultClient.name}::${Date.now()}`,
        entityName: defaultClient.name,
      });

      if (res && res.signature) {
        setSignedPlaque(res.signature);
      } else {
        alert(res.message || "Failed to sign with DSC. Please check PIN.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigning(false);
    }
  };

  // Validate Affixed Signature
  const handleVerifySignature = async () => {
    if (!signedPlaque?.sha256Digest) return;
    try {
      const res = await challanDscApi.validateSignature(
        signedPlaque.sha256Digest,
        docTitle
      );
      setVerifyStatus(res);
    } catch (err) {
      console.error(err);
    }
  };

  // Run MCA Fee Calculation
  const handleCalculateFee = async () => {
    try {
      const res = await challanDscApi.calculateMcaFee(
        calcCapital,
        calcFormType,
        calcDelayDays
      );
      if (res && res.data) {
        setCalcResult(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate Instant Challan Payment
  const handlePayChallan = async (challanId: string) => {
    try {
      const res = await challanDscApi.payStatutoryChallan(challanId);
      if (res && res.challan) {
        setChallans((prev) =>
          prev.map((c) =>
            c.id === challanId || c.challanId === challanId ? res.challan : c
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Official Receipt Pack
  const handleOpenReceipt = async (challan: StatutoryChallanItem) => {
    try {
      const res = await challanDscApi.getChallanReceipt(challan.challanId || challan.id!);
      if (res && res.receipt) {
        setSelectedReceipt(res.receipt);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Challans
  const filteredChallans = useMemo(() => {
    if (portalFilter === "ALL") return challans;
    return challans.filter((c) => c.portal === portalFilter);
  }, [challans, portalFilter]);

  return (
    <div className="w-full space-y-6">
      
      {/* =========================================================================
          TOP BANNER: CLASS 3 DSC & STATUTORY CHALLANS (High Contrast Redesign)
      ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white relative overflow-hidden shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[11px] font-mono font-extrabold tracking-widest uppercase shadow-xs flex items-center gap-1.5">
                <Usb className="w-3.5 h-3.5 text-blue-400" />
                CLASS 3 DSC &amp; STATUTORY E-CHALLANS
              </span>
              <span className="px-3 py-1 rounded-full border border-blue-300 dark:border-blue-800 bg-blue-100 dark:bg-blue-950/80 text-[11px] font-mono font-bold text-blue-900 dark:text-blue-200">
                FIPS 140-2 Level 2 USB Tokens
              </span>
              <span className="px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-100 dark:bg-emerald-950/80 text-[11px] font-mono font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                MCA21 • GST PMT-06 • ITNS 280
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
                Cryptographic Signature Tokens &amp; Statutory E-Challans
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 max-w-3xl leading-relaxed font-normal">
              Autonomous cryptographic USB token signing engine compliant with CCA India guidelines, plus real-time MCA21 Table A/B late fee computation, 14-digit GST CPIN generation, and Income Tax OLTAS challan settlement.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs font-mono shrink-0">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Active Crypto Tokens in Rack:</div>
            <div className="font-extrabold text-zinc-950 dark:text-white text-sm">
              {certificates.filter((c) => c.tokenStatus === "plugged_in").length} of {certificates.length} Tokens Plugged
            </div>
            <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
              Challans Paid: {challans.filter((c) => c.paymentStatus === "PAID").length} • Pending: {challans.filter((c) => c.paymentStatus === "GENERATED").length}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODULE NAVIGATION TABS
      ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            {
              id: "dsc-manager",
              label: "Class 3 DSC Token Rack & Digital Signer",
              icon: KeyRound,
              badge: `${certificates.length} Tokens`,
            },
            {
              id: "challan-simulator",
              label: "Statutory E-Challan Engine (MCA / GST / IT)",
              icon: Receipt,
              badge: `${challans.length} Challans`,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md scale-102"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent font-semibold"
                }`}
                style={isActive ? { backgroundColor: "#18181b", color: "#ffffff" } : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={loadData}
          title="Refresh Tokens & Challans"
          className="p-2.5 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-red-600" : ""}`} />
        </button>
      </div>

      {/* =========================================================================
          VIEW 1: CLASS 3 DSC USB TOKEN RACK & DIGITAL SIGNER
      ========================================================================= */}
      {activeTab === "dsc-manager" && (
        <div className="space-y-6">
          
          {/* Hardware Token Shelf / Rack */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Registered Hardware USB Tokens (FIPS 140-2 Level 2 Crypto Modules):
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                Click token to select for document signing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {certificates.map((cert) => {
                const isSelected = cert.id === selectedCertId || cert.certificateId === selectedCertId;
                const isPlugged = cert.tokenStatus === "plugged_in";
                return (
                  <div
                    key={cert.id || cert.certificateId}
                    className={`p-4 rounded-2xl border-2 transition-all space-y-3 relative ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-lg scale-101"
                        : "bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-sm truncate flex items-center gap-1.5">
                          <Usb className={`w-4 h-4 ${isPlugged ? "text-emerald-500" : "text-zinc-400"}`} />
                          <span>{cert.holderName}</span>
                        </div>
                        <div className="text-[10px] font-mono opacity-80 truncate">
                          {cert.membershipNumber || cert.din || "Authorized Signatory"} • {cert.pan}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                          cert.holderRole === "practicing_cs"
                            ? "bg-black text-white dark:bg-zinc-200 dark:text-zinc-900"
                            : cert.holderRole === "practicing_ca"
                            ? "bg-red-700 text-white"
                            : "bg-blue-700 text-white"
                        }`}
                      >
                        {cert.holderRole.replace("_", " ")}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="opacity-70">Hardware:</span>
                        <span className="font-bold truncate">{cert.hardwareModel.split(" ")[0]} {cert.hardwareModel.split(" ")[1]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Serial #:</span>
                        <span className="font-bold truncate">{cert.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Valid Till:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{cert.validTo}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => setSelectedCertId(cert.id || cert.certificateId)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          isSelected
                            ? "bg-amber-400 text-zinc-950 font-black shadow-xs"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300"
                        }`}
                      >
                        {isSelected ? "Active Signer" : "Select Signer"}
                      </button>

                      <button
                        onClick={() => handleTogglePlug(cert.id || cert.certificateId, cert.tokenStatus)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                          isPlugged
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                        title={isPlugged ? "Click to simulate USB token removal" : "Click to simulate USB token insertion"}
                      >
                        {isPlugged ? <Lock className="w-3 h-3 text-emerald-600" /> : <Unlock className="w-3 h-3" />}
                        <span>{isPlugged ? "Plugged In" : "Unplugged"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Document Signing Sandbox Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Document Signing Parameters */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-zinc-900 dark:text-white" />
                  <h4 className="text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200">
                    Cryptographic Document Signer
                  </h4>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  SHA-256 / RSA 2048
                </span>
              </div>

              <div className="space-y-3 text-xs font-sans">
                <div>
                  <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                    Select Target Document to Sign
                  </label>
                  <select
                    value={signingDocType}
                    onChange={(e) => {
                      setSigningDocType(e.target.value);
                      if (e.target.value === "board_resolution") setDocTitle("Board Resolution under Section 186 (Loans & Guarantees)");
                      else if (e.target.value === "form_3cd") setDocTitle("Form 3CD Tax Audit Statement for FY 2025-26");
                      else if (e.target.value === "aoc4_financials") setDocTitle("Form AOC-4 Financial Statements for CyberCorp Technologies");
                      else if (e.target.value === "dir3_kyc") setDocTitle("DIR-3 Director Web KYC Declaration");
                      else setDocTitle("Form GST DRC-06 Statutory Rebuttal");
                    }}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium"
                  >
                    <option value="board_resolution">Board Resolution under Section 186</option>
                    <option value="form_3cd">Form 3CD Tax Audit Statement (AY 2026-27)</option>
                    <option value="aoc4_financials">Form AOC-4 Audited Balance Sheet &amp; P&amp;L</option>
                    <option value="dir3_kyc">DIR-3 Director KYC Declaration</option>
                    <option value="gst_drc06">Form GST DRC-06 SCN Rebuttal</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                    Document Title / Designation
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">Active DSC Hardware Token:</span>
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                      {selectedCertificate?.tokenStatus === "plugged_in" ? "Token Ready" : "Token Unplugged"}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    <div>Signatory: <strong className="text-zinc-900 dark:text-white">{selectedCertificate?.holderName}</strong></div>
                    <div>Serial: {selectedCertificate?.serialNumber}</div>
                    <div>Issuer: {selectedCertificate?.issuerCa}</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-zinc-800 dark:text-zinc-200">
                      USB Token PIN (FIPS 140-2 Level 2)
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">Default PIN: 12345678</span>
                  </div>
                  <input
                    type="password"
                    value={tokenPin}
                    onChange={(e) => setTokenPin(e.target.value)}
                    placeholder="Enter Token PIN (e.g. 12345678)"
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono tracking-widest text-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleSignDocument}
                disabled={isSigning || selectedCertificate?.tokenStatus !== "plugged_in"}
                className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSigning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Affixing Cryptographic Signature...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Affix Class 3 DSC Signature Plaque</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Affixed Visual Signature Plaque Preview */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h4 className="text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Affixed Cryptographic Signature Plaque
                </h4>
                {signedPlaque && (
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Signature Intact
                  </span>
                )}
              </div>

              {signedPlaque ? (
                <div className="space-y-4">
                  {/* Government of India CCA Compliant Visual DSC Plaque */}
                  <div className="p-5 rounded-2xl border-2 border-emerald-500/80 bg-emerald-50/40 dark:bg-emerald-950/20 text-zinc-900 dark:text-zinc-100 space-y-2 relative shadow-xs">
                    <div className="flex items-start justify-between gap-3 border-b border-emerald-300 dark:border-emerald-800/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black">
                          ✓
                        </div>
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                            Digitally Signed by:
                          </div>
                          <div className="text-sm font-black text-zinc-950 dark:text-white">
                            {signedPlaque.digitallySignedBy}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                        CCA Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                      <div>
                        <span className="text-zinc-500 block">Reason:</span>
                        <span className="font-bold truncate block">{signedPlaque.reason}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Date &amp; Time:</span>
                        <span className="font-bold truncate block">{signedPlaque.dateFormatted}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Location:</span>
                        <span className="font-bold block">{signedPlaque.location}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Membership / DIN:</span>
                        <span className="font-bold block">{signedPlaque.membershipNumber}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-300 dark:border-emerald-800/80 text-[10px] font-mono space-y-0.5">
                      <div className="text-zinc-500">SHA-256 Digest:</div>
                      <div className="font-bold truncate text-emerald-800 dark:text-emerald-300">
                        {signedPlaque.sha256Digest}
                      </div>
                    </div>
                  </div>

                  {/* Signature Actions & Trust Verification */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleVerifySignature}
                        className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Validate Certificate Trust Chain &amp; CRL</span>
                      </button>
                      <button
                        onClick={() => handleCopy(JSON.stringify(signedPlaque, null, 2), "dsc-plaque-copy")}
                        className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1 cursor-pointer"
                        title="Copy Plaque Payload"
                      >
                        {copiedId === "dsc-plaque-copy" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {verifyStatus && (
                      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5 font-mono">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{verifyStatus.message}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 space-y-0.5">
                          <div>• Root: {verifyStatus.trustChain.rootCa}</div>
                          <div>• CRL: {verifyStatus.trustChain.crlStatus}</div>
                          <div>• Timestamp: {verifyStatus.trustChain.timestampIntegrity}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[320px] text-center space-y-3 font-sans">
                  <KeyRound className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
                  <div className="space-y-1">
                    <div className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">
                      No Document Signed Yet
                    </div>
                    <p className="text-xs text-zinc-500 max-w-sm">
                      Select your target document and enter the USB token PIN on the left, then click &quot;Affix Class 3 DSC Signature Plaque&quot;.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: STATUTORY E-CHALLAN SIMULATOR (MCA21, GST PMT-06, ITNS 280/281)
      ========================================================================= */}
      {activeTab === "challan-simulator" && (
        <div className="space-y-6">
          
          {/* Real-time MCA21 Late Fee Slabs Calculator */}
          <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-zinc-900 dark:text-white" />
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-950 dark:text-white">
                    MCA21 Statutory Fee &amp; Delay Slabs Calculator (Table A &amp; B Rules 2014)
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    Calculates normal filing fees based on authorized share capital and additional late fees under Section 403.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNewChallanModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Statutory Challan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                  Authorized Share Capital (₹)
                </label>
                <input
                  type="number"
                  value={calcCapital}
                  onChange={(e) => {
                    setCalcCapital(Number(e.target.value));
                    setTimeout(handleCalculateFee, 50);
                  }}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                  Form Type
                </label>
                <select
                  value={calcFormType}
                  onChange={(e) => {
                    setCalcFormType(e.target.value);
                    setTimeout(handleCalculateFee, 50);
                  }}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium"
                >
                  <option value="annual_return">Annual Return (AOC-4 / MGT-7 — ₹100/day)</option>
                  <option value="normal_eform">Normal E-Form (DIR-12, PAS-3, CHG-1)</option>
                  <option value="mgt14">Form MGT-14 (Special Resolution)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                  Days of Delay Beyond Due Date
                </label>
                <input
                  type="number"
                  value={calcDelayDays}
                  onChange={(e) => {
                    setCalcDelayDays(Number(e.target.value));
                    setTimeout(handleCalculateFee, 50);
                  }}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono font-bold"
                />
              </div>
            </div>

            {calcResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Normal Filing Fee</span>
                  <span className="text-base font-black text-zinc-950 dark:text-white">{formatInr(calcResult.normalFee)}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Additional / Late Fee</span>
                  <span className="text-base font-black text-red-600 dark:text-red-400">{formatInr(calcResult.lateFee)}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Statutory Payable</span>
                  <span className="text-base font-black text-blue-700 dark:text-blue-400">{formatInr(calcResult.totalPayable)}</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800">
                  <span className="text-[10px] text-amber-900 dark:text-amber-200 uppercase font-bold block">Delay Surcharge Slab</span>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate block">{calcResult.lateFeeSlab}</span>
                </div>
              </div>
            )}
          </div>

          {/* Statutory Challans Ledger */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                {(["ALL", "MCA21", "GSTN", "CBDT_INCOME_TAX"] as const).map((portal) => (
                  <button
                    key={portal}
                    onClick={() => setPortalFilter(portal)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      portalFilter === portal
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {portal === "ALL"
                      ? "All Portals"
                      : portal === "MCA21"
                      ? "MCA21 (ROC)"
                      : portal === "GSTN"
                      ? "GSTN (PMT-06)"
                      : "CBDT (Income Tax)"}
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono text-zinc-500">
                {filteredChallans.length} Challans Registered
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-3">Portal &amp; Form</th>
                    <th className="py-3 px-3">Reference (SRN/CPIN/CIN)</th>
                    <th className="py-3 px-3">Assessee Entity</th>
                    <th className="py-3 px-2 text-right">Total Fee (₹)</th>
                    <th className="py-3 px-3">Payment Bank</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-sans">
                  {filteredChallans.map((chl) => {
                    const isPaid = chl.paymentStatus === "PAID";
                    return (
                      <tr key={chl.id || chl.challanId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                chl.portal === "MCA21"
                                  ? "bg-black text-white dark:bg-white dark:text-black"
                                  : chl.portal === "GSTN"
                                  ? "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300"
                                  : "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300"
                              }`}
                            >
                              {chl.portal === "CBDT_INCOME_TAX" ? "ITNS 280" : chl.portal}
                            </span>
                            <span className="font-extrabold text-zinc-950 dark:text-white">{chl.filingForm}</span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                            FY {chl.financialYear}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-zinc-950 dark:text-white">
                          <div>{chl.srnOrCpinOrCin}</div>
                          {chl.receiptNumber && (
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                              {chl.receiptNumber}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-zinc-950 dark:text-white truncate max-w-[180px]">{chl.entityName}</div>
                          <div className="text-[10px] font-mono text-zinc-500 truncate">{chl.cinOrPanOrGstin}</div>
                        </td>
                        <td className="py-3.5 px-2 font-mono font-black text-right text-zinc-950 dark:text-white">
                          {formatInr(chl.amountBreakdown?.totalAmount)}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-zinc-600 dark:text-zinc-400 text-[11px]">
                          <div>{chl.tenderedBank}</div>
                          <div className="text-[10px] text-zinc-400">{chl.paymentMode}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold ${
                              isPaid
                                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300"
                                : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300"
                            }`}
                          >
                            {chl.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isPaid ? (
                              <button
                                onClick={() => handlePayChallan(chl.id || chl.challanId)}
                                className="px-3 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs cursor-pointer shadow-xs"
                              >
                                Pay Now
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenReceipt(chl)}
                                className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <Printer className="w-3.5 h-3.5 text-zinc-500" />
                                <span>Receipt</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: OFFICIAL PRINTABLE STATUTORY RECEIPT PACK
      ========================================================================= */}
      {receiptModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 space-y-5 text-zinc-950 dark:text-white">
            
            {/* Receipt Header */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 uppercase">
                    Official Counterfoil
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Payment Verified (Settled)
                  </span>
                </div>
                <h3 className="text-base font-black tracking-tight">{selectedReceipt.portalTitle}</h3>
                <p className="text-xs font-mono text-zinc-500">
                  Electronic Payment Acknowledgement &amp; Treasury Challan
                </p>
              </div>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Core Fields Grid */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Receipt Number</span>
                <span className="font-extrabold text-sm">{selectedReceipt.receiptNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">SRN / CPIN / CIN</span>
                <span className="font-extrabold text-sm">{selectedReceipt.srnOrCpinOrCin}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Filing Form</span>
                <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">{selectedReceipt.filingForm}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Assessee Entity</span>
                <span className="font-bold truncate block">{selectedReceipt.entityName}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">CIN / PAN / GSTIN</span>
                <span className="font-bold block">{selectedReceipt.cinOrPanOrGstin}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Tendered Bank</span>
                <span className="font-bold block">{selectedReceipt.tenderedBank}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Bank BSR Code</span>
                <span className="font-bold block">{selectedReceipt.bsrCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Challan Serial No</span>
                <span className="font-bold block">{selectedReceipt.challanSerialNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Bank Ref / Transaction ID</span>
                <span className="font-bold truncate block">{selectedReceipt.bankReferenceNumber}</span>
              </div>
            </div>

            {/* Amount Breakdown Table */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-bold">
                <span>Fee / Tax Description</span>
                <span>Amount (₹)</span>
              </div>
              <div className="flex justify-between px-3 py-1">
                <span>Base Statutory Filing Fee / Tax:</span>
                <span className="font-bold">{formatInr(selectedReceipt.amountBreakdown?.baseFeeOrTax || selectedReceipt.totalAmount)}</span>
              </div>
              {selectedReceipt.amountBreakdown?.additionalOrLateFee > 0 && (
                <div className="flex justify-between px-3 py-1 text-red-600">
                  <span>Additional Late Surcharge under Sec 403:</span>
                  <span className="font-bold">{formatInr(selectedReceipt.amountBreakdown?.additionalOrLateFee)}</span>
                </div>
              )}
              {selectedReceipt.amountBreakdown?.interest > 0 && (
                <div className="flex justify-between px-3 py-1 text-amber-600">
                  <span>Statutory Interest under Sec 50:</span>
                  <span className="font-bold">{formatInr(selectedReceipt.amountBreakdown?.interest)}</span>
                </div>
              )}
              <div className="flex justify-between p-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-black text-sm">
                <span>TOTAL AMOUNT PAID:</span>
                <span>{formatInr(selectedReceipt.totalAmount)}</span>
              </div>
            </div>

            {/* Bottom Verification & Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                <QrCode className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
                <span>QR Encrypted Pay-Gov India Token</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => {
                    alert(`Receipt pack for ${selectedReceipt.receiptNumber} downloaded.`);
                    setReceiptModalOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE NEW STATUTORY CHALLAN
      ========================================================================= */}
      {newChallanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 text-zinc-950 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-zinc-900 dark:text-white" />
                <h3 className="text-sm font-bold">Generate New Statutory E-Challan</h3>
              </div>
              <button
                onClick={() => setNewChallanModalOpen(false)}
                className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="font-bold block mb-1">Target Portal</label>
                <select
                  value={newChallanPortal}
                  onChange={(e) => {
                    const p = e.target.value as any;
                    setNewChallanPortal(p);
                    if (p === "MCA21") {
                      setNewChallanForm("AOC-4");
                      setNewChallanAmount(600);
                    } else if (p === "GSTN") {
                      setNewChallanForm("GSTR-3B");
                      setNewChallanAmount(485000);
                    } else {
                      setNewChallanForm("ITR-6");
                      setNewChallanAmount(1250000);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium"
                >
                  <option value="MCA21">MCA21 (Registrar of Companies / ROC)</option>
                  <option value="GSTN">GSTN (Goods and Services Tax Portal — Form PMT-06)</option>
                  <option value="CBDT_INCOME_TAX">CBDT (Income Tax Department — ITNS 280 / 281)</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Filing Form</label>
                <input
                  type="text"
                  value={newChallanForm}
                  onChange={(e) => setNewChallanForm(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Total Fee / Tax Amount (₹)</label>
                <input
                  type="number"
                  value={newChallanAmount}
                  onChange={(e) => setNewChallanAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Assessee Entity</label>
                <input
                  type="text"
                  defaultValue={defaultClient.name}
                  disabled
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setNewChallanModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await challanDscApi.createStatutoryChallan({
                      portal: newChallanPortal,
                      filingForm: newChallanForm,
                      amount: newChallanAmount,
                      entityName: defaultClient.name,
                      cinOrPanOrGstin:
                        newChallanPortal === "MCA21"
                          ? defaultClient.cin
                          : newChallanPortal === "GSTN"
                          ? defaultClient.gstin
                          : defaultClient.pan,
                    });
                    if (res && res.challan) {
                      setChallans([res.challan, ...challans]);
                      setNewChallanModalOpen(false);
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                Generate Challan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
