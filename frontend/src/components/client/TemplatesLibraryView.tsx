"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Download,
  Copy,
  Check,
  Eye,
  X,
  FileCheck2,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

export interface LegalTemplate {
  id: string;
  title: string;
  category:
    | "all"
    | "notices"
    | "deeds"
    | "civil"
    | "criminal"
    | "arbitration"
    | "writs"
    | "family"
    | "commercial"
    | "affidavits";
  categoryLabel: string;
  particularsCount: number;
  courtOrForum: string;
  actReferred: string;
  format: "DOCX" | "PDF" | "TXT";
  description: string;
  fillableVariables: string[];
  instructions: string[];
  sampleDraft: string;
  isMyTemplate?: boolean;
}

const TEMPLATES_DATA: LegalTemplate[] = [
  {
    id: "tmpl-affidavit-01",
    title: "Affidavit (General / Supporting Affidavit)",
    category: "affidavits",
    categoryLabel: "AFFIDAVITS",
    particularsCount: 30,
    courtOrForum: "Civil & High Court Practice (General Oath)",
    actReferred: "Oaths Act, 1969 • Code of Civil Procedure, Order XIX",
    format: "DOCX",
    description:
      "Use when a person needs to place facts on oath in support of an application, petition, undertaking, or court proceeding before judicial registries.",
    fillableVariables: [
      "[DEPONENT_NAME_AGE_ADDRESS]",
      "[FATHER_SPOUSE_NAME]",
      "[COURT_NAME_OR_PROCEEDING]",
      "[CASE_NUMBER_AND_YEAR]",
      "[VERIFIED_PARAGRAPHS_OF_FACT]",
      "[NOTARY_PUBLIC_ATTESTATION]",
    ],
    instructions: [
      "Must be affirmed before a Notary Public, Oath Commissioner, or Gazetted Attesting Officer.",
      "Ensure court fee or notary adhesive stamp is affixed as per State Stamp Act.",
      "Deponent must declare knowledge as to which paragraphs are true to personal knowledge and which to belief.",
    ],
    sampleDraft: `BEFORE THE HON'BLE COURT / AUTHORITY AT ________________

IN THE MATTER OF:
Case / Application No. ________ OF 2026

BETWEEN:
[DEPONENT_NAME_AGE_ADDRESS], Aged ___ Years, S/o [FATHER_SPOUSE_NAME], Residing at ____________________________________________________.
                                                       ... DEPONENT

AFFIDAVIT

I, the deponent above-named, do hereby solemnly affirm and state on oath as follows:

1. That I am the applicant/petitioner in the above-titled proceeding, fully conversant with the facts of the case, and competent to depose to this affidavit.

2. [VERIFIED_PARAGRAPHS_OF_FACT]

3. That the contents of the accompanying petition/application have been read over and explained to me in my mother tongue, and I state that the averments made therein are true and correct to the best of my personal knowledge.

4. That no part of this affidavit is false, and nothing material has been concealed therefrom.

DEPONENT

VERIFICATION
Verified at ________ on this the _____ day of __________, 2026 that the contents of paragraphs 1 to 3 of this affidavit are true to my personal knowledge and belief.

DEPONENT`,
  },
  {
    id: "tmpl-affidavit-02",
    title: "Counter Affidavit",
    category: "affidavits",
    categoryLabel: "AFFIDAVITS",
    particularsCount: 17,
    courtOrForum: "High Court & Appellate Tribunals",
    actReferred: "High Court Rules • Civil Rules of Practice",
    format: "DOCX",
    description:
      "Use when a respondent needs to answer a petition or application on affidavit, particularly in writ, civil, or statutory tribunal hearings.",
    fillableVariables: [
      "[RESPONDENT_NAME_AND_CAPACITY]",
      "[ORIGINAL_PETITIONER_NAME]",
      "[WRIT_PETITION_NUMBER]",
      "[PARA_WISE_REBUTTAL_POINTS]",
      "[STATUTORY_JUSTIFICATION]",
    ],
    instructions: [
      "Address every paragraph of the original petition specifically; traverse all allegations.",
      "Attach documentary exhibits supporting respondent's statutory compliance marked as Exhibit R-1 to R-n.",
      "File within 4 weeks from date of appearance or court notice service.",
    ],
    sampleDraft: `IN THE HIGH COURT OF KERALA AT ERNAKULAM
(Special Original Jurisdiction)

W.P.(C) No. [WRIT_PETITION_NUMBER] OF 2026

BETWEEN:
[ORIGINAL_PETITIONER_NAME]
                                                       ... PETITIONER
AND
[RESPONDENT_NAME_AND_CAPACITY]
                                                       ... RESPONDENT

COUNTER AFFIDAVIT FILED BY THE RESPONDENT

I, [RESPONDENT_NAME_AND_CAPACITY], do hereby solemnly affirm and state as follows:

1. I am the respondent in the writ petition and am authorized to swear to this counter affidavit.
2. At the outset, I deny each and every allegation, contention, and insinuation raised in the writ petition except those specifically admitted herein.
3. [PARA_WISE_REBUTTAL_POINTS]
4. The petitioner has suppressed material facts and is not entitled to any equitable relief under Article 226 of the Constitution of India.

Wherefore it is prayed that this Hon'ble Court may be pleased to dismiss the writ petition with costs.

DEPONENT / RESPONDENT`,
  },
  {
    id: "tmpl-consultancy",
    title: "Consultancy Agreement",
    category: "commercial",
    categoryLabel: "AGREEMENTS & DEEDS · COMMERCIAL",
    particularsCount: 21,
    courtOrForum: "Commercial Contract Jurisdiction",
    actReferred: "Indian Contract Act, 1872 • Specific Relief Act",
    format: "DOCX",
    description:
      "Use when an independent consultant is engaged to provide defined professional or business services with clear deliverables, milestone fees, and IP retention.",
    fillableVariables: [
      "[CLIENT_COMPANY_NAME]",
      "[CONSULTANT_NAME_AND_PAN]",
      "[SCOPE_OF_SERVICES]",
      "[MONTHLY_RETAINER_FEE_INR]",
      "[TERMINATION_NOTICE_DAYS]",
      "[CONFIDENTIALITY_PERIOD]",
    ],
    instructions: [
      "Clearly delineate consultant as an independent contractor, not an employee or agent.",
      "Specify payment terms, TDS deduction compliance under Section 194J of the Income Tax Act.",
      "Execute on appropriate value stamp paper based on governing state jurisdiction.",
    ],
    sampleDraft: `CONSULTANCY SERVICES AGREEMENT

This CONSULTANCY AGREEMENT is made on this _____ day of __________, 2026 between:

[CLIENT_COMPANY_NAME], having its registered office at ________________________________ (the "Client");
AND
[CONSULTANT_NAME_AND_PAN], residing at / having office at ________________________________ (the "Consultant").

1. SCOPE OF ENGAGEMENT: The Client engages the Consultant to provide [SCOPE_OF_SERVICES].
2. REMUNERATION: The Client agrees to pay the Consultant a monthly retainer of Rs. [MONTHLY_RETAINER_FEE_INR]/- subject to statutory tax deductions.
3. INTELLECTUAL PROPERTY: All work product created specifically for the Client shall vest with the Client upon receipt of full payment.
4. CONFIDENTIALITY: The Consultant shall maintain strict confidentiality during the term and for [CONFIDENTIALITY_PERIOD] years thereafter.
5. TERMINATION: Either party may terminate by giving [TERMINATION_NOTICE_DAYS] days prior written notice.

CLIENT: ________________________
CONSULTANT: ____________________`,
  },
  {
    id: "tmpl-mou",
    title: "Memorandum of Understanding (MoU)",
    category: "commercial",
    categoryLabel: "AGREEMENTS & DEEDS · COMMERCIAL",
    particularsCount: 19,
    courtOrForum: "Corporate Collaboration Framework",
    actReferred: "Indian Contract Act, 1872",
    format: "DOCX",
    description:
      "Use when parties want to record the framework of a proposed collaboration, transaction or business venture prior to formal definitive contracts.",
    fillableVariables: [
      "[PARTY_ONE_NAME_DETAILS]",
      "[PARTY_TWO_NAME_DETAILS]",
      "[PURPOSE_OF_COLLABORATION]",
      "[MUTUAL_OBLIGATIONS]",
      "[VALIDITY_PERIOD_MONTHS]",
      "[EXCLUSIVITY_WINDOW]",
    ],
    instructions: [
      "Specify which clauses are legally binding (e.g., confidentiality, exclusivity, dispute resolution) and which are non-binding expressions of intent.",
      "Detail timeline for due diligence and execution of definitive commercial agreements.",
    ],
    sampleDraft: `MEMORANDUM OF UNDERSTANDING (MoU)

This Memorandum of Understanding is entered into on this _____ day of ________, 2026 by and between:
[PARTY_ONE_NAME_DETAILS] (First Party);
AND
[PARTY_TWO_NAME_DETAILS] (Second Party).

WHEREAS the Parties desire to collaborate for [PURPOSE_OF_COLLABORATION];

NOW THEREFORE the Parties agree as follows:
1. OBJECTIVE & SCOPE: The parties intend to jointly explore [PURPOSE_OF_COLLABORATION].
2. ROLES & RESPONSIBILITIES: [MUTUAL_OBLIGATIONS]
3. DURATION: This MoU shall remain valid for [VALIDITY_PERIOD_MONTHS] months from the date of execution.
4. LEGAL EFFECT: Except for Clauses relating to Confidentiality, Governing Law, and Exclusivity, this MoU represents an expression of mutual intent and is non-binding.

FIRST PARTY: ____________________
SECOND PARTY: ___________________`,
  },
  {
    id: "tmpl-nda",
    title: "Mutual Non-Disclosure Agreement (NDA)",
    category: "commercial",
    categoryLabel: "AGREEMENTS & DEEDS · COMMERCIAL",
    particularsCount: 17,
    courtOrForum: "Commercial & Corporate Jurisdiction",
    actReferred: "Indian Contract Act, 1872 • Information Technology Act, 2000",
    format: "DOCX",
    description:
      "Use when two parties will exchange confidential information for a defined business or transaction...",
    fillableVariables: [
      "[PARTY_A_NAME_AND_ADDRESS]",
      "[PARTY_B_NAME_AND_ADDRESS]",
      "[PURPOSE_OF_DISCLOSURE]",
      "[CONFIDENTIALITY_TERM_YEARS]",
      "[GOVERNING_LAW_AND_COURT]",
    ],
    instructions: [
      "Ensure standard exclusions are included (publicly available information, already known, independently developed).",
      "Include injunctive relief clause to permit approaching court for ex-parte stay against data leakage.",
    ],
    sampleDraft: `MUTUAL NON-DISCLOSURE AGREEMENT

Between: [PARTY_A_NAME_AND_ADDRESS]
And: [PARTY_B_NAME_AND_ADDRESS]

1. PURPOSE: The parties wish to explore [PURPOSE_OF_DISCLOSURE] ("Purpose").
2. CONFIDENTIAL INFORMATION: Includes all non-public technical, proprietary, financial, and operational information disclosed by either party.
3. NON-DISCLOSURE OBLIGATIONS: Each party agrees to protect the Confidential Information of the other with the same degree of care it uses for its own confidential data, and shall not disclose it to third parties without prior written consent.
4. TERM: This Agreement shall remain in effect for [CONFIDENTIALITY_TERM_YEARS] years from the date of disclosure.
5. GOVERNING LAW: Subject to the exclusive jurisdiction of the courts at [GOVERNING_LAW_AND_COURT].

PARTY A: ________________________
PARTY B: ________________________`,
  },
  {
    id: "tmpl-services",
    title: "Services Agreement / Master Services Agreement",
    category: "commercial",
    categoryLabel: "AGREEMENTS & DEEDS · COMMERCIAL",
    particularsCount: 21,
    courtOrForum: "Commercial Court Jurisdiction",
    actReferred: "Indian Contract Act, 1872 • Specific Relief Act, 1963",
    format: "DOCX",
    description:
      "Use when one business engages another to provide recurring or project-based services unde...",
    fillableVariables: [
      "[SERVICE_PROVIDER_NAME]",
      "[RECIPIENT_CLIENT_NAME]",
      "[DETAILED_STATEMENTS_OF_WORK]",
      "[PAYMENT_TERMS_AND_MILESTONES]",
      "[LIMITATION_OF_LIABILITY_CAP]",
      "[ARBITRATION_SEAT_AND_VENUE]",
    ],
    instructions: [
      "Structure Statements of Work (SOWs) as separate schedules governed by the terms of this Master Agreement.",
      "Incorporate robust indemnity, limitation of liability, and arbitration dispute resolution clauses.",
    ],
    sampleDraft: `MASTER SERVICES AGREEMENT (MSA)

This Master Services Agreement is entered into as of _____ day of __________, 2026:
BETWEEN: [SERVICE_PROVIDER_NAME] ("Service Provider")
AND: [RECIPIENT_CLIENT_NAME] ("Client")

1. SERVICES & STATEMENTS OF WORK: Service Provider shall deliver services described in SOWs executed hereunder.
2. WARRANTIES & SLA: Service Provider warrants that services will be performed with professional diligence in compliance with agreed SLA benchmarks.
3. FEES: Client shall pay fees according to [PAYMENT_TERMS_AND_MILESTONES].
4. LIMITATION OF LIABILITY: Neither party shall be liable for indirect damages, and aggregate liability shall not exceed [LIMITATION_OF_LIABILITY_CAP].
5. DISPUTE RESOLUTION: Disputes shall be settled through arbitration under the Arbitration and Conciliation Act, 1996 with seat at [ARBITRATION_SEAT_AND_VENUE].

SERVICE PROVIDER: _______________
CLIENT: _________________________`,
  },
  {
    id: "tmpl-notice-138",
    title: "Statutory Demand Notice under Section 138 NI Act",
    category: "notices",
    categoryLabel: "NOTICES · STATUTORY",
    particularsCount: 18,
    courtOrForum: "Judicial First Class Magistrate (JFCM)",
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
      "Must be dispatched within 30 days from receipt of the bank return memo.",
      "Send via Speed Post with Acknowledgment Due; preserve delivery tracking slip.",
      "A 15-day payment window must be given from date of delivery before filing criminal complaint.",
    ],
    sampleDraft: `REGISTERED POST WITH ACKNOWLEDGMENT DUE / SPEED POST

To,
[DRAWER_NAME_AND_ADDRESS]

LEGAL NOTICE UNDER SECTION 138(b) OF THE NEGOTIABLE INSTRUMENTS ACT, 1881

Sir/Madam,
Under instructions from my client [PAYEE_NAME_AND_ADDRESS], I serve upon you this Statutory Notice:
1. You issued Cheque No. [CHEQUE_NUMBER_AND_DATE] for Rs. [CHEQUE_AMOUNT_IN_INR]/- drawn on [DRAWEE_BANK_AND_BRANCH] towards discharge of lawful debt.
2. The said cheque was returned dishonoured on [RETURN_MEMO_DATE_AND_REASON] for "FUNDS INSUFFICIENT".
3. You are hereby called upon to pay the cheque sum within 15 clear days of receipt of this notice, failing which criminal complaint under Section 138 NI Act will be lodged.

ADVOCATE FOR THE PAYEE`,
  },
  {
    id: "tmpl-writ-226",
    title: "Writ Petition (Civil) under Article 226 — High Court of Kerala",
    category: "writs",
    categoryLabel: "WRITS · CONSTITUTIONAL",
    particularsCount: 35,
    courtOrForum: "High Court of Kerala at Ernakulam",
    actReferred: "Constitution of India, Article 226 • Kerala High Court Rules",
    format: "DOCX",
    description:
      "Standard formal writ petition format for challenging arbitrary administrative orders, illegal overhead line realignment, or violation of natural justice.",
    fillableVariables: [
      "[PETITIONER_NAME_AND_ADDRESS]",
      "[RESPONDENT_1_AUTHORITY]",
      "[PROPERTY_SURVEY_NUMBER_AND_VILLAGE]",
      "[IMPUGNED_ORDER_NUMBER_AND_DATE]",
      "[SPECIFIC_PRAYERS]",
    ],
    instructions: [
      "Verify that all statutory alternative remedies have been exhausted or state urgency grounds.",
      "Ensure an Index, Synopsis, List of Dates & Events, and true copies of marked Exhibits are paginated.",
    ],
    sampleDraft: `IN THE HIGH COURT OF KERALA AT ERNAKULAM
(Special Original Jurisdiction)

W.P.(C) No. ________ OF 2026

BETWEEN: [PETITIONER_NAME_AND_ADDRESS]
AND: [RESPONDENT_1_AUTHORITY] & Others

MEMORANDUM OF WRIT PETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA
1. The petitioner challenges the arbitrary order [IMPUGNED_ORDER_NUMBER_AND_DATE] passed without hearing under Section 16 of Telegraph Act.
2. GROUNDS: Violative of Article 14, 19(1)(e) and Article 300A of Constitution.
3. PRAYER: Issue a writ of certiorari quashing impugned order and mandamus directing fair hearing.

COUNSEL FOR THE PETITIONER`,
  },
  {
    id: "tmpl-bail-bnss",
    title: "Application for Regular / Anticipatory Bail under S.482/483 BNSS",
    category: "criminal",
    categoryLabel: "CRIMINAL · PLEADINGS",
    particularsCount: 22,
    courtOrForum: "Sessions Court / High Court of Kerala",
    actReferred: "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023, Section 482/483",
    format: "DOCX",
    description:
      "Pleading template for pre-arrest or post-arrest bail petitions under the newly enacted BNSS criminal procedural framework with verified medical grounds.",
    fillableVariables: [
      "[ACCUSED_NAME_AND_AGE]",
      "[POLICE_STATION_AND_CRIME_NUMBER]",
      "[OFFENCES_UNDER_BNS]",
      "[GROUNDS_OF_INSUFFICIENT_EVIDENCE]",
    ],
    instructions: [
      "Attach verified identity documents, tax filings, and local domicile proof.",
      "Reference Supreme Court safeguards in Satender Kumar Antil v. CBI.",
    ],
    sampleDraft: `IN THE COURT OF THE SESSIONS JUDGE, ________________
Bail Application No. ________ of 2026

Crime No. [POLICE_STATION_AND_CRIME_NUMBER] of ________________ Police Station
Offences: Sections [OFFENCES_UNDER_BNS] of Bharatiya Nyaya Sanhita, 2023.

APPLICATION UNDER SECTION 482 OF BNSS, 2023
1. Applicant has deep roots in society and has been falsely implicated.
2. Applicant undertakes to cooperate fully with investigation and abide by all conditions.
PRAYER: Grant anticipatory bail to applicant in the event of arrest.

COUNSEL FOR APPLICANT`,
  },
  {
    id: "tmpl-sale-deed",
    title: "Agreement for Sale of Immovable Property (Kerala SRO Format)",
    category: "deeds",
    categoryLabel: "AGREEMENTS & DEEDS · PROPERTY",
    particularsCount: 28,
    courtOrForum: "Sub-Registrar Office / Pre-Conveyance",
    actReferred: "Transfer of Property Act, 1882 • Indian Contract Act, 1872",
    format: "DOCX",
    description:
      "Bilingual-standard sale agreement with earnest money advance, title deed verification covenants, Nil encumbrance clause, and specific performance indemnity.",
    fillableVariables: [
      "[VENDOR_NAME_AND_ADDRESS]",
      "[PURCHASER_NAME_AND_ADDRESS]",
      "[TOTAL_SALE_CONSIDERATION_INR]",
      "[ADVANCE_EARNEST_MONEY_INR]",
      "[SCHEDULE_PROPERTY_DETAILS_SY_NO]",
    ],
    instructions: [
      "Print on required non-judicial stamp paper as prescribed under Kerala Stamp Act, 1959.",
      "Attach 30-year non-encumbrance certificate.",
    ],
    sampleDraft: `AGREEMENT FOR SALE OF IMMOVABLE PROPERTY

BETWEEN: [VENDOR_NAME_AND_ADDRESS] ("Vendor")
AND: [PURCHASER_NAME_AND_ADDRESS] ("Purchaser")

1. CONSIDERATION: Total agreed sale price Rs. [TOTAL_SALE_CONSIDERATION_INR]/-.
2. ADVANCE: Advance payment of Rs. [ADVANCE_EARNEST_MONEY_INR]/- received.
3. SCHEDULE: Land measuring ___ Ares in Sy No. [SCHEDULE_PROPERTY_DETAILS_SY_NO].

VENDOR: ________________________
PURCHASER: ______________________`,
  },
  {
    id: "tmpl-tenancy-106",
    title: "Statutory Tenancy Termination Notice under S.106 T.P. Act",
    category: "notices",
    categoryLabel: "NOTICES · TENANCY",
    particularsCount: 15,
    courtOrForum: "Rent Control / Munsiff Court",
    actReferred: "Transfer of Property Act, 1882, Section 106",
    format: "TXT",
    description:
      "Formal legal notice to tenant terminating monthly lease on grounds of rental default, expiry of tenure, or bona fide personal occupation.",
    fillableVariables: [
      "[TENANT_NAME_AND_DEMISED_PREMISES]",
      "[LANDLORD_NAME_AND_ADDRESS]",
      "[MONTHLY_RENTAL_RATE_INR]",
      "[ARREARS_AMOUNT_AND_MONTHS]",
    ],
    instructions: [
      "Give minimum 15 clear days notice expiring with the end of a tenancy month.",
      "Send via Speed Post with Acknowledgment Due.",
    ],
    sampleDraft: `LEGAL NOTICE OF TERMINATION OF TENANCY (Section 106 T.P. Act)

To: [TENANT_NAME_AND_DEMISED_PREMISES]
Under instructions from my client [LANDLORD_NAME_AND_ADDRESS]:
1. You are a monthly tenant at Rs. [MONTHLY_RENTAL_RATE_INR]/- per month.
2. You are in arrears of Rs. [ARREARS_AMOUNT_AND_MONTHS]/-.
3. My client hereby terminates your tenancy. Deliver vacant possession within 15 days.

ADVOCATE FOR LANDLORD`,
  },
  {
    id: "tmpl-arbitration-23",
    title: "Statement of Claim under Section 23 of Arbitration Act",
    category: "arbitration",
    categoryLabel: "ARBITRATION · COMMERCIAL",
    particularsCount: 31,
    courtOrForum: "Arbitral Tribunal / Sole Arbitrator",
    actReferred: "Arbitration and Conciliation Act, 1996, Section 23",
    format: "DOCX",
    description:
      "Arbitration pleadings template for commercial debt recovery, liquidated damages, and Section 17 interim security claims before sole arbitrator.",
    fillableVariables: [
      "[CLAIMANT_NAME_AND_COUNSEL]",
      "[RESPONDENT_NAME_AND_ADDRESS]",
      "[ARBITRATION_CLAUSE_NUMBER]",
      "[STATEMENT_OF_FACTS_AND_DEFAULT]",
      "[TOTAL_CLAIMED_SUM_INR]",
    ],
    instructions: [
      "Detail contract execution date and quote verbatim arbitration dispute resolution clause.",
      "Quantify principal damages, interest claim @ 18% p.a., and tribunal costs.",
    ],
    sampleDraft: `BEFORE THE SOLE ARBITRATOR, ARBITRAL TRIBUNAL AT ERNAKULAM
In the Arbitration between:
[CLAIMANT_NAME_AND_COUNSEL] ... Claimant
VS
[RESPONDENT_NAME_AND_ADDRESS] ... Respondent

STATEMENT OF CLAIM UNDER SECTION 23 OF THE ARBITRATION ACT, 1996
1. The Claimant claims Rs. [TOTAL_CLAIMED_SUM_INR]/- towards unpaid commercial invoices.
2. Facts: [STATEMENT_OF_FACTS_AND_DEFAULT]
PRAYER: Pass arbitral award directing Respondent to pay principal with interest.

COUNSEL FOR THE CLAIMANT`,
  },
  {
    id: "tmpl-family-13b",
    title: "Mutual Consent Divorce Petition under Section 13B HMA",
    category: "family",
    categoryLabel: "FAMILY · MATRIMONIAL",
    particularsCount: 26,
    courtOrForum: "Family Court",
    actReferred: "Hindu Marriage Act, 1955, Section 13B",
    format: "DOCX",
    description:
      "Joint petition under Section 13B of Hindu Marriage Act, 1955 with mutual settlement deed, permanent alimony settlement, and custody terms.",
    fillableVariables: [
      "[PETITIONER_1_HUSBAND_DETAILS]",
      "[PETITIONER_2_WIFE_DETAILS]",
      "[DATE_AND_PLACE_OF_MARRIAGE]",
      "[SEPARATION_PERIOD_YEARS]",
      "[PERMANENT_ALIMONY_SETTLEMENT]",
    ],
    instructions: [
      "Parties must have lived separately for a period of one year or more.",
      "Ensure all matrimonial jewellery and streedhan return receipts are recorded in settlement.",
    ],
    sampleDraft: `IN THE FAMILY COURT AT ________________
O.P. No. ________ OF 2026

IN THE MATTER OF:
[PETITIONER_1_HUSBAND_DETAILS] ... 1st Petitioner
AND
[PETITIONER_2_WIFE_DETAILS] ... 2nd Petitioner

JOINT PETITION UNDER SECTION 13B OF THE HINDU MARRIAGE ACT, 1955
1. Marriage was solemnized on [DATE_AND_PLACE_OF_MARRIAGE].
2. Parties have lived separately for more than [SEPARATION_PERIOD_YEARS] years.
3. Settlement: [PERMANENT_ALIMONY_SETTLEMENT]
PRAYER: Dissolve marriage by a decree of divorce by mutual consent.

1ST PETITIONER | 2ND PETITIONER`,
  },
  {
    id: "tmpl-consumer-35",
    title: "Consumer Complaint under Section 35 of CPA 2019",
    category: "civil",
    categoryLabel: "CIVIL · CONSUMER",
    particularsCount: 24,
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
      "District Commission handles pecuniary claims up to Rs. 50 Lakhs.",
      "Attach purchase invoice, payment receipt, and proof of legal notice delivery.",
    ],
    sampleDraft: `BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION
Consumer Case (CC) No. ________ OF 2026

[COMPLAINANT_NAME_AND_ADDRESS] ... Complainant
VS
[OPPOSITE_PARTY_COMPANY_NAME] ... Opposite Party

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019
1. Complainant purchased product vide Invoice [TRANSACTION_VALUE_AND_INVOICE_NO].
2. Deficiency: [DEFICIENCY_DESCRIPTION]
PRAYER: Refund invoice value and grant compensation of Rs. [COMPENSATION_CLAIMED_INR]/-.

COMPLAINANT`,
  },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "notices", label: "Notices" },
  { id: "deeds", label: "Agreements & Deeds" },
  { id: "civil", label: "Civil" },
  { id: "criminal", label: "Criminal" },
  { id: "arbitration", label: "Arbitration" },
  { id: "writs", label: "Writs" },
  { id: "family", label: "Family" },
  { id: "more", label: "More", isDropdown: true },
];

const MORE_CATEGORIES = [
  { id: "affidavits", label: "Affidavits" },
  { id: "commercial", label: "Commercial" },
];

export default function TemplatesLibraryView({
  onSelectTemplateForFiling,
}: {
  onSelectTemplateForFiling?: (tmpl: LegalTemplate) => void;
}) {
  const [activeMainTab, setActiveMainTab] = useState<"lawgichub" | "my">("lawgichub");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [moreDropdownOpen, setMoreDropdownOpen] = useState<boolean>(false);
  const [previewTemplate, setPreviewTemplate] = useState<LegalTemplate | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const filteredTemplates = useMemo(() => {
    return TEMPLATES_DATA.filter((tmpl) => {
      // Filter by LawgicHub vs My Templates
      if (activeMainTab === "my" && !tmpl.isMyTemplate) {
        return false;
      }

      // Filter by Category
      const matchCat =
        selectedCategory === "all" ||
        tmpl.category === selectedCategory ||
        (selectedCategory === "deeds" && tmpl.category === "commercial");

      // Filter by Search Query
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        tmpl.title.toLowerCase().includes(q) ||
        tmpl.categoryLabel.toLowerCase().includes(q) ||
        tmpl.description.toLowerCase().includes(q) ||
        tmpl.courtOrForum.toLowerCase().includes(q) ||
        tmpl.actReferred.toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [activeMainTab, selectedCategory, searchQuery]);

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
      {/* Page Title */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
          Templates
        </h1>
      </div>

      {/* Switcher Pill Tabs: LawgicHub Templates (132) | My Templates */}
      <div className="inline-flex items-center p-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveMainTab("lawgichub")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeMainTab === "lawgichub"
              ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-2xs"
              : "text-zinc-500 hover:text-black dark:hover:text-white"
          }`}
        >
          <span>LawgicHub Templates</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
            132
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("my")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeMainTab === "my"
              ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-2xs"
              : "text-zinc-500 hover:text-black dark:hover:text-white"
          }`}
        >
          My Templates
        </button>
      </div>

      {/* Full-width Search Bar matching reference */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates by document, proceeding or purpose..."
          className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-full bg-zinc-100/80 dark:bg-zinc-900/90 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 text-black dark:text-white placeholder-zinc-400 focus:outline-none transition-colors"
        />
      </div>

      {/* Category Filter Pills Toolbar */}
      <div className="relative flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          if (cat.isDropdown) {
            return (
              <div key={cat.id} className="relative">
                <button
                  type="button"
                  onClick={() => setMoreDropdownOpen((prev) => !prev)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    MORE_CATEGORIES.some((m) => m.id === selectedCategory)
                      ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <span>
                    {MORE_CATEGORIES.find((m) => m.id === selectedCategory)?.label || "More"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 z-20 w-44 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl p-1.5 space-y-1">
                    {MORE_CATEGORIES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(m.id);
                          setMoreDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                          selectedCategory === m.id
                            ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setMoreDropdownOpen(false);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold shadow-2xs"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Clean Divider */}
      <div className="border-b border-zinc-100 dark:border-zinc-800/80 my-2" />

      {/* Grid of Template Cards (3 Columns matching reference) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            onClick={() => setPreviewTemplate(tmpl)}
            className="group rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
          >
            <div>
              {/* Category Subtitle in uppercase */}
              <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase block">
                {tmpl.categoryLabel}
              </span>

              {/* Title */}
              <h3 className="font-bold text-base text-black dark:text-white group-hover:underline mt-2.5 leading-snug">
                {tmpl.title}
              </h3>

              {/* Description Snippet */}
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                {tmpl.description}
              </p>
            </div>

            {/* Bottom Row: Particulars pill & Arrow */}
            <div className="pt-6 mt-4 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                {tmpl.particularsCount} particulars
              </span>

              <div className="p-1.5 rounded-full text-zinc-400 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
          No templates match your search or category filter. Try clearing the search or choosing &quot;All&quot;.
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
