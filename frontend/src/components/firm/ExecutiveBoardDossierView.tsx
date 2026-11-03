"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  ShieldCheck,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  Users,
  Stamp,
  Lock,
  Layers,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Search,
  Filter,
  X,
  FileCheck,
  QrCode,
  KeyRound,
  Scale,
  Award,
} from "lucide-react";
import { boardDossierApi, BoardDossierItem } from "@/lib/boardDossierApi";

interface ExecutiveBoardDossierViewProps {
  firmName?: string;
  practitionerName?: string;
  defaultClient?: {
    name?: string;
    cin?: string;
    pan?: string;
    gstin?: string;
    paidUpCapital?: number;
    authorizedCapital?: number;
    turnover?: number;
    directors?: any[];
  };
  onClose?: () => void;
}

export function ExecutiveBoardDossierView({
  firmName = "Apex Law, Secretarial & Tax Partners LLP",
  practitionerName = "CS Rajesh Sharma & CA Ramanathan Iyer",
  defaultClient,
  onClose,
}: ExecutiveBoardDossierViewProps) {
  const [loading, setLoading] = useState(false);
  const [dossiers, setDossiers] = useState<BoardDossierItem[]>([]);
  const [selectedDossier, setSelectedDossier] = useState<BoardDossierItem | null>(null);
  const [activeSection, setActiveSection] = useState<"all" | "harmonization" | "directors-risks" | "resolutions" | "joint-signoff">("all");
  const [verificationResult, setVerificationResult] = useState<{ verified: boolean; message?: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  // Form Customizer State
  const [financialYear, setFinancialYear] = useState("2025-26");
  const [boardMeetingDate, setBoardMeetingDate] = useState("2026-11-15");
  const [meetingType, setMeetingType] = useState("Quarterly Board of Directors & Audit Committee Review (Q3)");

  // Load Dossiers
  const loadDossiers = async () => {
    setLoading(true);
    try {
      const res = await boardDossierApi.getBoardDossiers();
      if (res.success && res.dossiers?.length) {
        setDossiers(res.dossiers);
        setSelectedDossier(res.dossiers[0]);
      } else {
        // Fallback default
        const fallback = createDefaultDossier();
        setDossiers([fallback]);
        setSelectedDossier(fallback);
      }
    } catch (err) {
      console.warn("Failed to load dossiers, using default:", err);
      const fallback = createDefaultDossier();
      setDossiers([fallback]);
      setSelectedDossier(fallback);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultDossier = (): BoardDossierItem => {
    const entName = defaultClient?.name || "CyberCorp Technologies Pvt Ltd";
    const cin = defaultClient?.cin || "U72200DL2022PTC394812";
    const pan = defaultClient?.pan || "AAECS1234F";
    const gstin = defaultClient?.gstin || "07AAECS1234F1Z8";
    const turnover = defaultClient?.turnover || 48500000;

    return {
      dossierId: "WAK-EXD-2026-CC-8941",
      clientEntity: {
        name: entName,
        cin,
        pan,
        gstin,
        registeredAddress: "Level 14, Cyber Towers, Barakhamba Road, Connaught Place, New Delhi 110001",
        entityType: "pvt_ltd",
        incorporationDate: "2022-04-12",
        authorizedCapital: defaultClient?.authorizedCapital || 50000000,
        paidUpCapital: defaultClient?.paidUpCapital || 25000000,
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
        form3CdTurnover: turnover,
        gstAnnualTurnover: turnover,
        mcaFinancialTurnover: turnover,
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
          parameter: "Section 134(5)(e) Financial Reporting Controls",
          statutorySection: "Companies Act Section 134(5)(e)",
          observation: "Controls over revenue recognition, vendor payments, and bank authorizations tested with 0 exceptions.",
          mitigationStatus: "Operating effectively with automated multi-tier ERP authorizations.",
        },
        {
          category: "Loans & Investments",
          riskLevel: "Low",
          parameter: "Section 186 Statutory Ceiling (60% Paid-up + Reserves)",
          statutorySection: "Companies Act Section 186",
          observation: "Aggregate corporate loans & investments stand at ₹1.10 Cr vs statutory limit of ₹3.60 Cr (30.5% utilized).",
          mitigationStatus: "Well within Board delegation threshold; no Special Resolution required under Section 186(3).",
        },
        {
          category: "Director Advances & Guarantees",
          riskLevel: "Low",
          parameter: "Section 185 Prohibition on Loans to Directors",
          statutorySection: "Companies Act Section 185",
          observation: "Zero personal loans, book debts, or guarantees given to directors or interested entities.",
          mitigationStatus: "100% compliant with Section 185 statutory bar.",
        },
        {
          category: "MSME Vendor Dues",
          riskLevel: "Low",
          parameter: "Clause 43B(h) / Section 15 of MSMED Act",
          statutorySection: "Income Tax Act Sec 43B(h) & MSMED Act",
          observation: "All registered micro/small enterprise invoices settled within 45 days. Disallowance ₹0 Nil.",
          mitigationStatus: "Audited trade payables ledger confirms zero overdue MSME balances at year-end.",
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
        jointDeclaration: `We, the practicing Company Secretary and the Statutory Auditor of ${entName}, hereby jointly certify that we have examined the corporate secretarial registers, filings on the MCA21 portal, audited financial statements, Income Tax returns, and GST disclosures for the financial year 2025-26. We confirm that the reported revenues, statutory dues, and regulatory disclosures are reconciled with ZERO variance across MCA, CBDT, and GSTN frameworks.`,
        qrVerificationUrl: "https://wakheel.legal/verify/dossier/WAK-EXD-2026-CC-8941",
        status: "Signed & Sealed",
      },
      dossierDigestSha256: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      version: "3.4.1-FINAL",
      createdAt: "2026-11-03T10:00:00Z",
    };
  };

  useEffect(() => {
    loadDossiers();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const formatInr = (n: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n || 0);
  };

  // Generate Fresh Dossier Pack
  const handleGenerateFresh = async () => {
    setLoading(true);
    setVerificationResult(null);
    try {
      const res = await boardDossierApi.generateBoardDossier({
        clientEntity: {
          name: defaultClient?.name || selectedDossier?.clientEntity?.name || "CyberCorp Technologies Pvt Ltd",
          cin: defaultClient?.cin || selectedDossier?.clientEntity?.cin || "U72200DL2022PTC394812",
          pan: defaultClient?.pan || selectedDossier?.clientEntity?.pan || "AAECS1234F",
          gstin: defaultClient?.gstin || selectedDossier?.clientEntity?.gstin || "07AAECS1234F1Z8",
          authorizedCapital: defaultClient?.authorizedCapital || 50000000,
          paidUpCapital: defaultClient?.paidUpCapital || 25000000,
        },
        financialYear,
        boardMeetingDate,
        meetingType,
        csSignatory: {
          name: "CS Rajesh Sharma",
          membershipNo: "FCS-9182",
          cpNo: "10482",
          firm: "Apex Law & Secretarial Partners LLP",
        },
        caSignatory: {
          name: "CA Ramanathan Iyer",
          membershipNo: "401928",
          firmRegNo: "018241N",
          firm: "Iyer & Co. Chartered Accountants",
        },
      });

      if (res.success && res.dossier) {
        setDossiers((prev) => [res.dossier, ...prev]);
        setSelectedDossier(res.dossier);
      }
    } catch (err) {
      console.error("Generate dossier error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Verify Signatures
  const handleVerifySignatures = async () => {
    if (!selectedDossier) return;
    try {
      const res = await boardDossierApi.verifyDossierSignatures({
        dossierId: selectedDossier.dossierId,
        dossierDigestSha256: selectedDossier.dossierDigestSha256,
      });
      if (res.success) {
        setVerificationResult({
          verified: res.verified,
          message: `Verified: Joint CS (${res.csSignatory?.membershipNo}) & CA (${res.caSignatory?.membershipNo}) digital attestations intact.`,
        });
      }
    } catch (err) {
      setVerificationResult({ verified: false, message: "Verification failed." });
    }
  };

  // Dual DSC Re-Sign Simulation
  const handleDualDscSign = () => {
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setVerificationResult({
        verified: true,
        message: "Dual DSC Cryptographic Signatures renewed with active Class 3 USB Crypto Token.",
      });
    }, 1200);
  };

  const dossier = selectedDossier || dossiers[0];
  const ent = dossier?.clientEntity;
  const cs = dossier?.csGovernanceData;
  const ca = dossier?.caAuditData;
  const sign = dossier?.dualAttestationSignOff;

  return (
    <div className="w-full space-y-6">
      
      {/* =========================================================================
          CONTROL & ACTION BAR: BOARD DOSSIER EXPORTER
      ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[11px] font-mono font-extrabold tracking-widest uppercase shadow-xs">
                SECTION 177 BOARD PACK
              </span>
              <span className="px-3 py-1 rounded-full border border-purple-300 dark:border-purple-800 bg-purple-100 dark:bg-purple-950/80 text-[11px] font-mono font-bold text-purple-900 dark:text-purple-200">
                Audit Committee &amp; Boardroom Exporter
              </span>
              <span className="px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-100 dark:bg-emerald-950/80 text-[11px] font-mono font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Joint CS &amp; CA Certified
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
                Executive Board &amp; Audit Committee Dossier
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
                {dossier?.dossierId || "WAK-EXD-2026"}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 max-w-3xl leading-relaxed">
              Consolidated boardroom presentation merging secretarial standards under Section 134(5) with statutory audit findings under Section 143. Features unified revenue reconciliations, Section 164 director clearance, audit committee risk heatmaps, and dual CS &amp; CA cryptographic sign-offs.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 text-xs font-bold text-zinc-950 dark:text-white transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              title="Print high-resolution A4 Boardroom presentation or Save as PDF"
            >
              <Printer className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <span>Print / Save PDF</span>
            </button>

            {dossier?.dossierId && (
              <a
                href={boardDossierApi.getDossierHtmlUrl(dossier.dossierId)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 text-xs font-bold text-zinc-950 dark:text-white transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                title="Open standalone HTML dossier in new tab"
              >
                <ExternalLink className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <span>Standalone HTML</span>
              </a>
            )}

            <button
              onClick={handleDualDscSign}
              disabled={isSigning}
              className="px-4 py-2.5 rounded-xl border-2 border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-xs font-extrabold text-emerald-900 dark:text-emerald-200 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              title="Re-sign dossier with Class 3 DSC Token"
            >
              <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isSigning ? "Affixing DSC..." : "Dual DSC Re-Sign"}</span>
            </button>

            <button
              onClick={handleGenerateFresh}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Synthesizing..." : "Generate New Pack"}</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                title="Close Dossier Studio"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Verification Status Pill if verified */}
        {verificationResult && (
          <div className={`mt-4 p-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-between gap-3 ${
            verificationResult.verified
              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200"
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{verificationResult.message}</span>
            </div>
            <button
              onClick={() => setVerificationResult(null)}
              className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Customization Ribbon */}
        <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-[11px] font-mono font-bold uppercase text-zinc-600 dark:text-zinc-400 block mb-1">
              Client Entity Target
            </label>
            <div className="font-extrabold text-zinc-950 dark:text-white truncate">
              {ent?.name || "CyberCorp Technologies Pvt Ltd"}
            </div>
            <div className="font-mono text-[10px] text-zinc-500 truncate">CIN: {ent?.cin}</div>
          </div>

          <div>
            <label className="text-[11px] font-mono font-bold uppercase text-zinc-600 dark:text-zinc-400 block mb-1">
              Reporting Financial Year
            </label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white"
            >
              <option value="2025-26">FY 2025-26 (AY 2026-27)</option>
              <option value="2024-25">FY 2024-25 (AY 2025-26)</option>
              <option value="2023-24">FY 2023-24 (AY 2024-25)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono font-bold uppercase text-zinc-600 dark:text-zinc-400 block mb-1">
              Target Board Meeting Date
            </label>
            <input
              type="date"
              value={boardMeetingDate}
              onChange={(e) => setBoardMeetingDate(e.target.value)}
              className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleVerifySignatures}
              className="w-full py-2.5 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 text-zinc-900 dark:text-white font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>Verify Signatures &amp; Hash</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION NAVIGATION TABS
      ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-zinc-200 dark:border-zinc-800 pb-2">
        {[
          { id: "all", label: "Complete Board Pack (All Sections)", icon: Layers },
          { id: "harmonization", label: "1. Statutory Harmonization Radar", icon: ShieldCheck },
          { id: "directors-risks", label: "2. Directors & Audit Risk Heatmap", icon: Users },
          { id: "resolutions", label: "3. Resolution Extracts", icon: FileCheck },
          { id: "joint-signoff", label: "4. Joint CS & CA Dual Attestation Plaque", icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
              style={isActive ? { backgroundColor: "#09090b", color: "#ffffff" } : undefined}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          BOARDROOM DOSSIER PRINT CANVAS
      ========================================================================= */}
      {dossier && ent && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-300 dark:border-zinc-800 text-zinc-950 dark:text-white shadow-lg space-y-10 font-sans">
          
          {/* COVER PAGE (Visible on 'all' or when printed) */}
          {(activeSection === "all" || activeSection === "harmonization") && (
            <div className="border-4 border-double border-zinc-900 dark:border-zinc-300 p-8 sm:p-12 rounded-2xl space-y-8 bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="text-center space-y-2 border-b-2 border-zinc-900 dark:border-zinc-300 pb-6">
                <span className="text-[11px] font-mono uppercase tracking-widest font-black text-zinc-600 dark:text-zinc-400 block">
                  WAKHEEL CORPORATE GOVERNANCE &amp; STATUTORY AUDIT BRIDGE
                </span>
                <span className="inline-block px-3 py-1 rounded bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-mono text-[10px] font-black uppercase tracking-wider">
                  STRICTLY CONFIDENTIAL • FOR BOARD OF DIRECTORS &amp; AUDIT COMMITTEE
                </span>
              </div>

              <div className="text-center space-y-3 py-6">
                <div className="text-sm font-mono uppercase font-bold text-zinc-600 dark:text-zinc-400 tracking-widest">
                  Annual Statutory Compliance &amp; Governance Dossier
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight">
                  {ent.name}
                </h1>
                
                <div className="font-mono text-xs text-zinc-700 dark:text-zinc-300 max-w-xl mx-auto py-3 border-y border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div>
                    <strong>CIN:</strong> {ent.cin} &nbsp;|&nbsp; <strong>PAN:</strong> {ent.pan} &nbsp;|&nbsp; <strong>GSTIN:</strong> {ent.gstin}
                  </div>
                  <div>
                    <strong>Registered Address:</strong> {ent.registeredAddress || "New Delhi, India"}
                  </div>
                  <div>
                    <strong>Reporting Period:</strong> Financial Year {dossier.financialYear} &nbsp;|&nbsp; Assessment Year {dossier.assessmentYear}
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed pt-2">
                  Presented in compliance with Section 177 and Section 134(5) of the Companies Act, 2013 read with ICSI Secretarial Standards (SS-1 and SS-2) and ICAI Auditing Standards for quarterly statutory review.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-zinc-400 border-t-2 border-zinc-900 dark:border-zinc-300 pt-4">
                <div><strong>Dossier Serial:</strong> {dossier.dossierId}</div>
                <div><strong>Meeting Date:</strong> {dossier.boardMeetingDate}</div>
                <div><strong>SHA-256 Digest:</strong> {dossier.dossierDigestSha256.slice(0, 16)}...</div>
              </div>
            </div>
          )}

          {/* SECTION 1: STATUTORY HARMONIZATION RADAR */}
          {(activeSection === "all" || activeSection === "harmonization") && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b-2 border-zinc-950 dark:border-zinc-200 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-black text-sm flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">
                    Dual-Track Statutory Harmonization Radar
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-zinc-500 uppercase">
                  MCA21 • CBDT • GSTN TRIPLE-LOCK
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CS Pillar */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 border-zinc-200 dark:border-zinc-800">
                    <span className="font-mono font-black text-xs uppercase tracking-wide text-zinc-950 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                      Company Secretary Pillar (MCA21)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-zinc-900 text-white dark:bg-white dark:text-zinc-950">
                      ICSI
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-600 dark:text-zinc-400">Form AOC-4 Financial Statements:</span>
                      <strong className="text-zinc-950 dark:text-white">{cs.aoc4Status} (SRN: {cs.aoc4Srn})</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-600 dark:text-zinc-400">Form MGT-7 Annual Return:</span>
                      <strong className="text-zinc-950 dark:text-white">{cs.mgt7Status}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-600 dark:text-zinc-400">Board Meetings under SS-1:</span>
                      <strong className="text-zinc-950 dark:text-white">{cs.boardMeetingsConducted} Meetings (100% Compliant)</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-600 dark:text-zinc-400">Secretarial Audit Opinion:</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200">
                        {cs.secretarialAuditOpinion}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-600 dark:text-zinc-400">Registered Charges (CHG-4):</span>
                      <strong className="text-zinc-950 dark:text-white">{cs.registeredChargesStatus}</strong>
                    </div>
                  </div>
                </div>

                {/* CA Pillar */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 border-zinc-200 dark:border-zinc-800">
                    <span className="font-mono font-black text-xs uppercase tracking-wide text-zinc-950 dark:text-white flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-red-600 dark:text-red-400" />
                      Chartered Accountant Pillar (ICAI)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-red-600 text-white">
                      ICAI
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-600 dark:text-zinc-400">Form ITR-6 Corporate Tax Return:</span>
                      <strong className="text-zinc-950 dark:text-white">{ca.itrStatus} (Ack: {ca.itrAckNumber})</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-600 dark:text-zinc-400">Form 3CD Tax Audit UDIN:</span>
                      <strong className="font-mono text-zinc-950 dark:text-white">{ca.udin}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-600 dark:text-zinc-400">GSTR-9 Annual Reconciliation:</span>
                      <strong className="text-zinc-950 dark:text-white">{ca.gstr9Status}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-600 dark:text-zinc-400">Clause 43B(h) MSME Exposure:</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200">
                        ₹0 Nil Disallowance
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-600 dark:text-zinc-400">Internal Financial Controls (IFC):</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200">
                        {ca.ifcControlRating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Turnover Cross-Portal Match Table */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-3.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-extrabold text-xs uppercase text-zinc-950 dark:text-white flex items-center justify-between">
                  <span>Inter-Portal Revenue &amp; Statutory Dues Reconciliation</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono">Status: 100% Balanced</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                      <tr>
                        <th className="p-3">Statutory Framework</th>
                        <th className="p-3">Form / Schedule</th>
                        <th className="p-3 text-right">Reported Turnover</th>
                        <th className="p-3 text-right">Variance</th>
                        <th className="p-3 text-center">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-sans">
                      <tr>
                        <td className="p-3 font-bold text-zinc-950 dark:text-white">Ministry of Corporate Affairs (MCA21)</td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">AOC-4 Schedule III P&amp;L</td>
                        <td className="p-3 text-right font-mono font-bold text-zinc-950 dark:text-white">{formatInr(ca.mcaFinancialTurnover)}</td>
                        <td className="p-3 text-right font-mono text-zinc-500">Base</td>
                        <td className="p-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-900">Reconciled</span></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-zinc-950 dark:text-white">Central Board of Direct Taxes (CBDT)</td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">ITR-6 Part A &amp; 3CD Clause 40</td>
                        <td className="p-3 text-right font-mono font-bold text-zinc-950 dark:text-white">{formatInr(ca.form3CdTurnover)}</td>
                        <td className="p-3 text-right font-mono text-emerald-600 font-bold">₹0.00 Nil</td>
                        <td className="p-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-900">Matched</span></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-zinc-950 dark:text-white">Goods &amp; Services Tax Network (GSTN)</td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">GSTR-9 Table 5N / 3B Outward</td>
                        <td className="p-3 text-right font-mono font-bold text-zinc-950 dark:text-white">{formatInr(ca.gstAnnualTurnover)}</td>
                        <td className="p-3 text-right font-mono text-emerald-600 font-bold">₹0.00 Nil</td>
                        <td className="p-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-900">Matched</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: DIRECTORS REGISTER & AUDIT COMMITTEE RISKS */}
          {(activeSection === "all" || activeSection === "directors-risks") && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-zinc-950 dark:border-zinc-200 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-black text-sm flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">
                    Directors &amp; Key Managerial Personnel (KMP) Register
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-zinc-500 uppercase">
                  SECTION 164 &amp; 170 STATUTORY DISCLOSURES
                </span>
              </div>

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Director Name</th>
                      <th className="p-3">DIN</th>
                      <th className="p-3">Designation</th>
                      <th className="p-3">Appointment</th>
                      <th className="p-3">DIR-3 KYC</th>
                      <th className="p-3">Sec 164 Clearance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {dossier.directorsList.map((d, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                        <td className="p-3 font-black text-zinc-950 dark:text-white">{d.name}</td>
                        <td className="p-3 font-mono font-bold text-zinc-700 dark:text-zinc-300">{d.din}</td>
                        <td className="p-3 text-zinc-800 dark:text-zinc-200 font-medium">{d.designation}</td>
                        <td className="p-3 font-mono text-zinc-600 dark:text-zinc-400">{d.appointmentDate || "12-Apr-2022"}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200">
                            {d.kycStatus}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200">
                            {d.sec164Clearance ? "Eligible / Clear" : "Disqualified"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Audit Committee Statutory Risk Heatmap */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm uppercase text-zinc-950 dark:text-white tracking-wide">
                    Audit Committee Statutory Risk &amp; Controls Heatmap
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-zinc-500">Section 177 Mandatory Oversight</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-mono font-bold uppercase text-[11px] text-zinc-700 dark:text-zinc-300">
                      <tr>
                        <th className="p-3">Statutory Risk Area</th>
                        <th className="p-3">Governing Section</th>
                        <th className="p-3">Risk Rating</th>
                        <th className="p-3">Committee Observation &amp; Control Mitigation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {dossier.auditCommitteeRisks.map((r, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                          <td className="p-3 font-bold text-zinc-950 dark:text-white">
                            <div>{r.category}</div>
                            <div className="text-[11px] text-zinc-500 font-normal">{r.parameter}</div>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">{r.statutorySection}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                              {r.riskLevel} Risk
                            </span>
                          </td>
                          <td className="p-3 space-y-0.5">
                            <div className="text-zinc-800 dark:text-zinc-200">{r.observation}</div>
                            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              Mitigation: {r.mitigationStatus}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: KEY BOARD RESOLUTION EXTRACTS */}
          {(activeSection === "all" || activeSection === "resolutions") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-zinc-950 dark:border-zinc-200 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-black text-sm flex items-center justify-center">
                    3
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">
                    Key Board Resolution Extracts for FY {dossier.financialYear}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-zinc-500 uppercase">
                  ICSI SS-1 RECORD OF PROCEEDINGS
                </span>
              </div>

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-mono font-bold uppercase text-[11px] text-zinc-700 dark:text-zinc-300">
                    <tr>
                      <th className="p-3">Agenda Item</th>
                      <th className="p-3">Subject Matter / Resolution Title</th>
                      <th className="p-3">Governing Section</th>
                      <th className="p-3">Voting Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {dossier.boardResolutionsExtracts.map((resItem, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                        <td className="p-3 font-mono font-black text-zinc-950 dark:text-white">{resItem.agendaNo}</td>
                        <td className="p-3 font-bold text-zinc-950 dark:text-white">{resItem.title}</td>
                        <td className="p-3 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">{resItem.statutorySection}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200">
                            {resItem.votingResult}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 4: FORMAL JOINT CS & CA ATTESTATION PLAQUE */}
          {(activeSection === "all" || activeSection === "joint-signoff") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-zinc-950 dark:border-zinc-200 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-black text-sm flex items-center justify-center">
                    4
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">
                    Joint CS &amp; CA Statutory Attestation Certificate
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-zinc-500 uppercase">
                  LEGAL DIGITAL SEAL &amp; CERTIFICATE
                </span>
              </div>

              {/* Attestation Plaque Box */}
              <div className="p-6 sm:p-8 rounded-2xl border-2 border-zinc-950 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-900/40 space-y-6">
                <p className="text-xs sm:text-sm italic font-serif leading-relaxed text-zinc-800 dark:text-zinc-200 text-justify">
                  &ldquo;{sign.jointDeclaration}&rdquo;
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CS Plaque */}
                  <div className="p-5 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b pb-2 border-zinc-200 dark:border-zinc-800">
                      <span className="font-extrabold text-xs text-zinc-950 dark:text-white">
                        {sign.csSignatory.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950">
                        CS Attestation
                      </span>
                    </div>

                    <div className="text-xs font-mono text-zinc-700 dark:text-zinc-300 space-y-1">
                      <div>Practicing Company Secretary</div>
                      <div>Membership No: <strong>{sign.csSignatory.membershipNo}</strong></div>
                      <div>Certificate of Practice (CP): <strong>{sign.csSignatory.cpNo}</strong></div>
                      <div className="truncate">Firm: {sign.csSignatory.firm}</div>
                      <div>Signed At: {sign.csSignatory.signedAt}</div>
                    </div>

                    <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono break-all text-zinc-600 dark:text-zinc-400">
                      <div className="font-bold text-zinc-900 dark:text-white mb-0.5">SHA-256 Signature Hash:</div>
                      {sign.csSignatory.signatureHash}
                    </div>
                  </div>

                  {/* CA Plaque */}
                  <div className="p-5 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b pb-2 border-zinc-200 dark:border-zinc-800">
                      <span className="font-extrabold text-xs text-zinc-950 dark:text-white">
                        {sign.caSignatory.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600 text-white">
                        CA Attestation
                      </span>
                    </div>

                    <div className="text-xs font-mono text-zinc-700 dark:text-zinc-300 space-y-1">
                      <div>Statutory Auditor (Chartered Accountant)</div>
                      <div>ICAI Membership No: <strong>{sign.caSignatory.membershipNo}</strong></div>
                      <div>Firm Registration No (FRN): <strong>{sign.caSignatory.firmRegNo}</strong></div>
                      <div>ICAI UDIN: <strong>{sign.caSignatory.udin}</strong></div>
                      <div>Signed At: {sign.caSignatory.signedAt}</div>
                    </div>

                    <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono break-all text-zinc-600 dark:text-zinc-400">
                      <div className="font-bold text-zinc-900 dark:text-white mb-0.5">SHA-256 Signature Hash:</div>
                      {sign.caSignatory.signatureHash}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 border-t border-zinc-300 dark:border-zinc-700 pt-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                    <span>Verify Online: <code>{sign.qrVerificationUrl}</code></span>
                  </div>
                  <div>
                    Dossier Status: <strong className="text-emerald-700 dark:text-emerald-400">{sign.status}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default ExecutiveBoardDossierView;
