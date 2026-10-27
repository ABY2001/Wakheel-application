"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Search,
  Download,
  Copy,
  Check,
  Eye,
  X,
  FileCheck2,
  FolderOpen,
  ArrowRight,
  Shield,
  Scale,
  Sparkles,
} from "lucide-react";

export interface LegalTemplate {
  id: string;
  title: string;
  category: "all" | "writs" | "notices" | "deeds" | "consumer";
  categoryLabel: string;
  courtOrForum: string;
  actReferred: string;
  format: "DOCX" | "PDF" | "TXT";
  description: string;
  fillableVariables: string[];
  instructions: string[];
  sampleDraft: string;
}

const TEMPLATES_DATA: LegalTemplate[] = [
  {
    id: "tmpl-01",
    title: "Writ Petition (Civil) under Article 226 — High Court of Kerala",
    category: "writs",
    categoryLabel: "Court Writs & Pleadings",
    courtOrForum: "High Court of Kerala at Ernakulam",
    actReferred: "Constitution of India, Article 226 • Kerala High Court Rules",
    format: "DOCX",
    description:
      "Standard formal writ petition format for challenging arbitrary administrative orders, illegal overhead line realignment, or violation of natural justice by statutory authorities.",
    fillableVariables: [
      "[PETITIONER_NAME_AND_ADDRESS]",
      "[RESPONDENT_1_AUTHORITY]",
      "[RESPONDENT_2_EXECUTIVE_ENGINEER]",
      "[DISTRICT_MAGISTRATE]",
      "[PROPERTY_SURVEY_NUMBER_AND_VILLAGE]",
      "[IMPUGNED_ORDER_NUMBER_AND_DATE]",
      "[SPECIFIC_PRAYERS]",
    ],
    instructions: [
      "Verify that all statutory alternative remedies (e.g. Sec. 16 representation to District Magistrate) have been exhausted or prove urgency.",
      "Ensure an Index, Synopsis, List of Dates & Events, and true copies of all marked Exhibits (P-1 to P-n) are serially paginated.",
      "Affidavit must be attested by an Advocate or Notary Public with appropriate court fee stamp affixed.",
    ],
    sampleDraft: `IN THE HIGH COURT OF KERALA AT ERNAKULAM
(Special Original Jurisdiction)

W.P.(C) No. ________ OF 2026

BETWEEN:
[PETITIONER_NAME_AND_ADDRESS], Aged ___ Years, Residing at ________________________________.
                                                     ... PETITIONER

AND

1. STATE OF KERALA, represented by its Principal Secretary, Department of Power, Government Secretariat, Thiruvananthapuram - 695 001.
2. [RESPONDENT_AUTHORITY], represented by its Secretary/Chief Engineer, _____________________.
3. THE DISTRICT MAGISTRATE / DISTRICT COLLECTOR, Collectorate, ____________ District.
                                                     ... RESPONDENTS

MEMORANDUM OF WRIT PETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA

1. PARTICULARS OF THE PETITIONER:
The petitioner is an Indian citizen, absolute owner in lawful possession and enjoyment of property comprising ___ Ares in Survey No. [PROPERTY_SURVEY_NUMBER_AND_VILLAGE].

2. PARTICULARS OF THE IMPUGNED ACTION:
The petitioner is aggrieved by the arbitrary, unilateral decision of the 2nd respondent to erect transmission structures across the petitioner's residential holding vide Order No. [IMPUGNED_ORDER_NUMBER_AND_DATE] without serving mandatory statutory notice under Section 10/16 of the Indian Telegraph Act, 1885.

3. GROUNDS:
A. Because the action of the 2nd respondent is violative of Article 14, 19(1)(e) and Article 300A of the Constitution of India.
B. Because it is settled law by this Hon'ble Court in 2024 (2) KHC 401 that prior notice and hearing is a mandatory condition precedent before entering private land.
C. Because feasible alternative alignment through adjoining government puramboke land is available and ignored without recording reasons.

4. PRAYER:
For the reasons stated in the accompanying affidavit, it is respectfully prayed that this Hon'ble Court may be pleased to:
i) Issue a writ of certiorari or other appropriate writ, order or direction quashing [IMPUGNED_ORDER_NUMBER_AND_DATE];
ii) Issue a writ of mandamus commanding the 3rd respondent to hear the petitioner's Section 16(1) objection within a timeframe fixed by this Hon'ble Court;
iii) Grant such other reliefs as this Hon'ble Court deems fit in the interest of justice.

DATED THIS THE _____ DAY OF ___________, 2026.

COUNSEL FOR THE PETITIONER`,
  },
  {
    id: "tmpl-02",
    title: "Statutory Demand Notice under Section 138 of Negotiable Instruments Act",
    category: "notices",
    categoryLabel: "Statutory Notices",
    courtOrForum: "Pre-Litigation Statutory Demand (JFCM Jurisdiction)",
    actReferred: "Negotiable Instruments Act, 1881, Section 138 & 142",
    format: "DOCX",
    description:
      "Mandatory 15-day statutory notice issued through legal counsel upon receipt of bank cheque return memo for 'Funds Insufficient' or 'Account Closed'.",
    fillableVariables: [
      "[DRAWER_NAME_AND_ADDRESS]",
      "[PAYEE_NAME_AND_ADDRESS]",
      "[CHEQUE_NUMBER_AND_DATE]",
      "[CHEQUE_AMOUNT_IN_INR]",
      "[DRAWEE_BANK_AND_BRANCH]",
      "[RETURN_MEMO_DATE_AND_REASON]",
    ],
    instructions: [
      "Must be dispatched within 30 days from the date of receipt of the bank return memo.",
      "Send via Registered Post with Acknowledgment Due (RPAD) or Speed Post; retain receipt & track delivery.",
      "A 15-day payment window must be given from date of delivery before filing criminal complaint.",
    ],
    sampleDraft: `REGISTERED POST WITH ACKNOWLEDGMENT DUE / SPEED POST

To,
[DRAWER_NAME_AND_ADDRESS]

LEGAL NOTICE UNDER SECTION 138(b) OF THE NEGOTIABLE INSTRUMENTS ACT, 1881

Sir/Madam,

Under instructions from and on behalf of my client [PAYEE_NAME_AND_ADDRESS], I do hereby serve upon you the following Statutory Notice:

1. That you, the Noticee, for discharging your lawful debt/liability towards my client, issued Cheque Bearing No. [CHEQUE_NUMBER_AND_DATE] for an amount of Rs. [CHEQUE_AMOUNT_IN_INR]/- drawn on [DRAWEE_BANK_AND_BRANCH].

2. That my client presented the said cheque for encashment through their banker. However, the said cheque was returned dishonoured and unpaid on [RETURN_MEMO_DATE_AND_REASON] with the official bank return memo endorsed "FUNDS INSUFFICIENT".

3. My client received the said return memo from their banker on ______________, and this notice is strictly issued within the prescribed statutory period of 30 days.

4. I therefore call upon you, the Noticee, to remit and pay the said amount of Rs. [CHEQUE_AMOUNT_IN_INR]/- to my client within 15 (fifteen) clear days from the date of receipt of this notice, failing which my client will institute criminal proceedings against you under Section 138 of the Negotiable Instruments Act, 1881 read with Section 420 of BNS before the competent Judicial First Class Magistrate Court at your sole risk, cost, and consequences.

Place: ________________
Date:  ________________

ADVOCATE FOR THE PAYEE`,
  },
  {
    id: "tmpl-03",
    title: "Application for Regular / Anticipatory Bail under Section 482 / 483 BNSS, 2023",
    category: "writs",
    categoryLabel: "Court Writs & Pleadings",
    courtOrForum: "Sessions Court / High Court of Kerala",
    actReferred: "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023, Section 482/483",
    format: "DOCX",
    description:
      "Pleading template for pre-arrest or post-arrest bail petitions under the newly enacted BNSS criminal procedural framework with verified medical & deep roots grounds.",
    fillableVariables: [
      "[ACCUSED_NAME_AND_AGE]",
      "[POLICE_STATION_AND_CRIME_NUMBER]",
      "[OFFENCES_UNDER_BNS]",
      "[DATE_OF_ALLEGED_OCCURRENCE]",
      "[GROUNDS_OF_INSUFFICIENT_EVIDENCE]",
      "[SURETIES_OFFERED]",
    ],
    instructions: [
      "In anticipatory bail, state clearly that applicant is willing to surrender their passport and join investigation.",
      "Reference landmark Supreme Court ruling in Satender Kumar Antil v. CBI regarding arrest safeguards.",
      "Attach verified identity documents, tax filings, and local domicile proof demonstrating applicant is not a flight risk.",
    ],
    sampleDraft: `IN THE COURT OF THE SESSIONS JUDGE, ________________ DISTRICT
AT ________________
Bail Application No. ________ of 2026

IN THE MATTER OF:
Crime No. [POLICE_STATION_AND_CRIME_NUMBER] of ________________ Police Station
Offences Alleged: Sections [OFFENCES_UNDER_BNS] of Bharatiya Nyaya Sanhita, 2023.

[ACCUSED_NAME_AND_AGE], Residing at _____________________________________.
                                                     ... APPLICANT / ACCUSED

VERSUS

STATE OF KERALA, represented by Public Prosecutor, Sessions Court.
                                                     ... RESPONDENT

APPLICATION UNDER SECTION 482 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023

The applicant respectfully submits as follows:

1. The applicant is an innocent person falsely implicated in Crime No. [POLICE_STATION_AND_CRIME_NUMBER] registered at ________________ Police Station on the basis of a concocted complaint.

2. The offences alleged against the applicant are non-bailable, but no recovery is pending from the applicant. The primary ingredients of the alleged offence under BNS are completely lacking.

3. The applicant is a permanent resident of the locality with deep roots in society, possessing immovable property and family dependents. There is zero likelihood of the applicant absconding or tampering with evidence.

4. The applicant is willing to abide by any stringent condition that may be imposed by this Hon'ble Court and undertakes to report before the Investigating Officer as and when directed.

PRAYER:
It is therefore respectfully prayed that this Hon'ble Court may be pleased to enlarge the applicant on bail in the event of arrest in Crime No. [POLICE_STATION_AND_CRIME_NUMBER] on such conditions as this Hon'ble Court deems fit.

Date: ___________
Applicant / Counsel for Applicant`,
  },
  {
    id: "tmpl-04",
    title: "Agreement for Sale of Immovable Property (Kerala SRO Format)",
    category: "deeds",
    categoryLabel: "Civil & Property Deeds",
    courtOrForum: "Sub-Registrar Office / Pre-Conveyance Deed",
    actReferred: "Transfer of Property Act, 1882 • Indian Contract Act, 1872",
    format: "DOCX",
    description:
      "Bilingual-standard sale agreement with earnest money advance, title deed verification covenants, Nil encumbrance clause, and specific performance indemnity.",
    fillableVariables: [
      "[VENDOR_NAME_AND_ADDRESS]",
      "[PURCHASER_NAME_AND_ADDRESS]",
      "[TOTAL_SALE_CONSIDERATION_INR]",
      "[ADVANCE_EARNEST_MONEY_INR]",
      "[BALANCE_PAYMENT_TIMEFRAME_MONTHS]",
      "[SCHEDULE_PROPERTY_DETAILS_SY_NO]",
    ],
    instructions: [
      "Print on required non-judicial stamp paper as prescribed under Kerala Stamp Act, 1959.",
      "Ensure two independent witnesses sign along with their Aadhaar / Voter ID details.",
      "Check that encumbrance certificate for the prior 30 years is annexed before executing.",
    ],
    sampleDraft: `AGREEMENT FOR SALE OF IMMOVABLE PROPERTY

This AGREEMENT FOR SALE is executed on this the _____ day of __________, 2026 at _______________;

BY AND BETWEEN:
[VENDOR_NAME_AND_ADDRESS], (hereinafter called the "VENDOR" which expression shall mean and include his legal heirs, executors, and assigns) of the ONE PART;

AND

[PURCHASER_NAME_AND_ADDRESS], (hereinafter called the "PURCHASER" which expression shall mean and include his legal heirs, administrators, and assigns) of the OTHER PART.

WHEREAS the Vendor is the absolute owner and in continuous possession of immovable property more particularly described in the SCHEDULE hereunder, having acquired title vide Registered Title Deed No. ________ of SRO _____________;

NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:
1. TOTAL CONSIDERATION: The total sale consideration mutually agreed upon between both parties is Rs. [TOTAL_SALE_CONSIDERATION_INR]/- (Rupees _______________________________________ only).
2. ADVANCE PAYMENT: The Purchaser has paid to the Vendor a sum of Rs. [ADVANCE_EARNEST_MONEY_INR]/- as earnest advance via RTGS/Cheque No. ____________ dated __________, receipt of which the Vendor hereby acknowledges.
3. COMPLETION PERIOD: Both parties agree that the sale deed shall be registered within a period of [BALANCE_PAYMENT_TIMEFRAME_MONTHS] months from the date of this agreement upon payment of balance consideration.
4. TITLE & CLEARANCE: The Vendor covenants that the schedule property is free from all mortgages, charges, court attachments, revenue dues, and lis pendens.

SCHEDULE OF PROPERTY
All that piece and parcel of land having an extent of ___ Ares in Re-Survey No. [SCHEDULE_PROPERTY_DETAILS_SY_NO], Village: _________, Taluk: __________, District: ____________.

IN WITNESS WHEREOF the parties have set their hands on the day and year first above written.

VENDOR: ________________________
PURCHASER: ______________________

WITNESSES:
1. ______________________
2. ______________________`,
  },
  {
    id: "tmpl-05",
    title: "Statutory Tenancy Eviction & Termination Notice under S.106 T.P. Act",
    category: "notices",
    categoryLabel: "Statutory Notices",
    courtOrForum: "Rent Control Court / Munsiff Court Jurisdiction",
    actReferred: "Transfer of Property Act, 1882, Section 106 • Kerala Buildings Act",
    format: "TXT",
    description:
      "Formal legal notice to tenant terminating monthly lease on grounds of rental default, expiry of tenure, or bona fide personal occupation.",
    fillableVariables: [
      "[TENANT_NAME_AND_DEMISED_PREMISES]",
      "[LANDLORD_NAME_AND_ADDRESS]",
      "[MONTHLY_RENTAL_RATE_INR]",
      "[ARREARS_AMOUNT_AND_MONTHS]",
      "[VACATION_DEADLINE_DAYS]",
    ],
    instructions: [
      "Section 106 requires a minimum 15-day notice expiring with the end of a month of the tenancy.",
      "Specify exact rental arrears and demand surrender of vacant peaceful possession.",
      "Send via Speed Post with Acknowledgment Due.",
    ],
    sampleDraft: `LEGAL NOTICE OF TERMINATION OF TENANCY
(Under Section 106 of the Transfer of Property Act, 1882)

To,
[TENANT_NAME_AND_DEMISED_PREMISES]

Sir/Madam,

Under instructions from my client, [LANDLORD_NAME_AND_ADDRESS], I hereby give you this statutory notice of termination of tenancy:

1. That you were inducted as a monthly tenant in respect of the premises bearing Door No. ________ situated at ____________________ at an agreed monthly rent of Rs. [MONTHLY_RENTAL_RATE_INR]/-.

2. That you have fallen into willful default and neglected to pay rent for the past ____ months amounting to an outstanding arrear of Rs. [ARREARS_AMOUNT_AND_MONTHS]/- despite oral reminders.

3. My client furthermore requires the demised premises bona fide for his own personal commercial use and occupation.

4. My client hereby terminates your monthly tenancy with effect from the expiry of [VACATION_DEADLINE_DAYS] days from receipt of this notice.

5. You are hereby called upon to quit, vacate, and deliver vacant and peaceful possession of the premises to my client on or before ____________, and clear all arrears, failing which an eviction suit will be instituted against you with mesne profits.

ADVOCATE FOR THE LANDLORD`,
  },
  {
    id: "tmpl-06",
    title: "Consumer Complaint under Section 35 of Consumer Protection Act, 2019",
    category: "consumer",
    categoryLabel: "Consumer & Applications",
    courtOrForum: "District Consumer Disputes Redressal Commission (DCDRC)",
    actReferred: "Consumer Protection Act, 2019, Section 35",
    format: "DOCX",
    description:
      "Standard complaint filing template against defective goods, deficient service, e-commerce non-delivery, or builder delay with compensation computation.",
    fillableVariables: [
      "[COMPLAINANT_NAME_AND_ADDRESS]",
      "[OPPOSITE_PARTY_COMPANY_NAME]",
      "[TRANSACTION_VALUE_AND_INVOICE_NO]",
      "[DEFICIENCY_DESCRIPTION]",
      "[COMPENSATION_CLAIMED_INR]",
    ],
    instructions: [
      "Check pecuniary jurisdiction: District Commission handles claims up to Rs. 50 Lakhs.",
      "Affix prescribed nominal consumer court fee via demand draft or Bharatkosh challan.",
      "Include all purchase receipts, email correspondence, and warranty cards as Annexures C-1 to C-n.",
    ],
    sampleDraft: `BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION AT ________________

Consumer Case (CC) No. ________ OF 2026

[COMPLAINANT_NAME_AND_ADDRESS]
                                                      ... COMPLAINANT
VERSUS

[OPPOSITE_PARTY_COMPANY_NAME], through its Managing Director/Branch Manager.
                                                      ... OPPOSITE PARTY

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019

The Complainant above-named respectfully states:

1. The Complainant is a 'Consumer' within the meaning of Section 2(7) of the Consumer Protection Act, 2019, having purchased [DEFICIENCY_DESCRIPTION] vide Invoice No. [TRANSACTION_VALUE_AND_INVOICE_NO] on payment of valuable consideration.

2. That the Opposite Party committed severe deficiency of service and unfair trade practice by supplying defective product/failing to honor guaranteed service deliverables despite receipt of consideration.

3. The Complainant caused legal notice dated ________ to be served upon the Opposite Party, but the Opposite Party neither rectified the defect nor refunded the amount.

PRAYER:
The Complainant prays that this Hon'ble Commission may be pleased to direct the Opposite Party to:
a) Refund the full invoice value of Rs. [TRANSACTION_VALUE_AND_INVOICE_NO] with 12% interest p.a.;
b) Pay a sum of Rs. [COMPENSATION_CLAIMED_INR]/- as compensation towards mental agony and harassment;
c) Award Rs. 25,000/- towards litigation costs.

COMPLAINANT`,
  },
];

const CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "writs", label: "Court Writs & Pleadings" },
  { id: "notices", label: "Statutory Notices" },
  { id: "deeds", label: "Civil & Property Deeds" },
  { id: "consumer", label: "Consumer & Applications" },
];

export default function TemplatesLibraryView({
  onSelectTemplateForFiling,
}: {
  onSelectTemplateForFiling?: (tmpl: LegalTemplate) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewTemplate, setPreviewTemplate] = useState<LegalTemplate | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const filteredTemplates = useMemo(() => {
    return TEMPLATES_DATA.filter((tmpl) => {
      const matchCat =
        selectedCategory === "all" || tmpl.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.courtOrForum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.actReferred.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDraft = (tmpl: LegalTemplate) => {
    const element = document.createElement("a");
    const file = new Blob([tmpl.sampleDraft], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${tmpl.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white tracking-tight">
              Legal Templates Vault
            </h1>
            <p className="text-xs text-zinc-500 font-medium">
              Verified court petitions, statutory demand notices, and registry deeds ready for customization
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
            {TEMPLATES_DATA.length} Standard Drafts
          </span>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by act, court, notice type (e.g., Section 138, Writ, Bail, Tenancy)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="p-5 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all flex flex-col justify-between group shadow-2xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                  {tmpl.categoryLabel}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {tmpl.format}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-black dark:text-white group-hover:underline line-clamp-2 leading-snug">
                  {tmpl.title}
                </h3>
                <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">
                  {tmpl.description}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-900 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                <div className="flex items-start gap-1.5">
                  <Scale className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-400" />
                  <span className="truncate">{tmpl.courtOrForum}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-400" />
                  <span className="truncate">{tmpl.actReferred}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setPreviewTemplate(tmpl)}
                className="flex-1 py-2 px-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview &amp; Draft</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadDraft(tmpl)}
                title="Download draft file"
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
          No templates match your search criteria. Try searching for &quot;Writ&quot;, &quot;Section 138&quot;, or &quot;Bail&quot;.
        </div>
      )}

      {/* Template Preview and Interactive Drafting Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-3 bg-zinc-50 dark:bg-zinc-950 shrink-0">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                  {previewTemplate.categoryLabel}
                </span>
                <h2 className="text-base sm:text-lg font-black text-black dark:text-white mt-1">
                  {previewTemplate.title}
                </h2>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  {previewTemplate.courtOrForum} • {previewTemplate.actReferred}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Guidelines / Checklist */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-black dark:text-white flex items-center gap-1.5 text-xs">
                  <FileCheck2 className="w-4 h-4" />
                  Filing &amp; Execution Checklist
                </span>
                <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                  {previewTemplate.instructions.map((inst, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="font-bold text-black dark:text-white shrink-0">•</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Variables Checklist */}
              <div className="space-y-1.5">
                <span className="font-bold text-black dark:text-white text-xs block">
                  Fillable Placeholders to Replace:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {previewTemplate.fillableVariables.map((v, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-[10px] text-black dark:text-white"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample Draft Text Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black dark:text-white text-xs">
                    Draft Language (Certified Text):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyText(previewTemplate.sampleDraft)}
                      className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black font-bold text-[11px] text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy Draft"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadDraft(previewTemplate)}
                      className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black font-bold text-[11px] text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .txt</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] text-black dark:text-zinc-200 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
                  {previewTemplate.sampleDraft}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-zinc-500 font-mono">
                Complies with High Court &amp; Central Court Civil Rules of Practice
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
                {onSelectTemplateForFiling && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTemplateForFiling(previewTemplate);
                      setPreviewTemplate(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer hover:opacity-90 flex items-center gap-1.5"
                  >
                    <span>Use for Document Filing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
