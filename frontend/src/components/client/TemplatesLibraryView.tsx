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
  Sparkles,
  FileText,
  Printer,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
  Bookmark,
  Share2,
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
    categoryLabel: "Affidavits",
    particularsCount: 30,
    courtOrForum: "Civil, Criminal & High Court Practice (General Oath)",
    actReferred: "Oaths Act, 1969 • Code of Civil Procedure, Order XIX",
    format: "DOCX",
    description:
      "Use when a person needs to place facts on oath in support of an application, petition, undertaking, declaration or other proceeding. Intended for general sworn statements, not examination-in-chief, counter affidavits or rejoinders.",
    fillableVariables: [
      "Forum or authority name",
      "Case type and number or reference if any",
      "Year or blank",
      "Cause title or matter description",
      "DEPONENT NAME",
      "PURPOSE OF AFFIDAVIT TITLE",
      "Deponent name",
      "Son Daughter Wife Of",
      "Parent or spouse name",
      "Age",
      "Occupation",
      "Address",
      "Deponent capacity",
      "Source Of Authority If Representative",
      "Purpose of affidavit",
      "Fact 1",
      "Fact 2",
      "Fact 3",
      "Fact 4",
      "Purpose specific averments paragraph 1",
      "Purpose specific averments paragraph 2",
      "Numbered paragraphs",
      "Place of affirmation",
      "Day",
      "Month",
      "Year",
    ],
    instructions: [
      "Must be affirmed before a Notary Public, Oath Commissioner, or Gazetted Attesting Officer.",
      "Ensure court fee or notary adhesive stamp is affixed as per State Stamp Act.",
      "Deponent must declare knowledge as to which paragraphs are true to personal knowledge and which to belief.",
    ],
    sampleDraft: `Affidavit
BEFORE THE [Forum or authority name]
[Case type and number or reference if any] of [Year or blank]

IN THE MATTER OF

[Cause title or matter description]

AFFIDAVIT OF [DEPONENT NAME] [PURPOSE OF AFFIDAVIT TITLE]

I, [Deponent name], [Son Daughter Wife Of] [Parent or spouse name], aged about [Age] years, [Occupation], resident of [Address], do hereby solemnly affirm and state on oath as under:

That I am the [Deponent capacity] in the above matter and am fully conversant with the facts and circumstances of the case, and am competent and authorised to swear this affidavit [Source Of Authority If Representative].

That this affidavit is sworn [Purpose of affidavit].

That [Fact 1].

That [Fact 2].

That [Fact 3].

That [Fact 4].

That the documents referred to above are annexed hereto and are true copies of their respective originals, as listed in the table below.

PURPOSE-SPECIFIC AVERMENTS

[Purpose specific averments paragraph 1]

[Purpose specific averments paragraph 2]

VERIFICATION

I, the deponent above named, do hereby verify that the contents of paragraphs 1 to [Numbered paragraphs] of this affidavit are true and correct to my personal knowledge, belief, and information, and nothing material has been concealed therefrom.

Verified at [Place of affirmation] on this [Day] day of [Month], [Year].

DEPONENT`,
  },
  {
    id: "tmpl-affidavit-02",
    title: "Counter Affidavit",
    category: "affidavits",
    categoryLabel: "Affidavits",
    particularsCount: 17,
    courtOrForum: "High Court & Appellate Tribunals",
    actReferred: "High Court Rules • Civil Rules of Practice",
    format: "DOCX",
    description:
      "Use when a respondent needs to answer a petition or application on affidavit, particularly in writ, civil, or statutory tribunal hearings.",
    fillableVariables: [
      "High Court or Judicial Forum",
      "Writ petition number",
      "Year",
      "Original petitioner name",
      "Respondent name and capacity",
      "Authority designation of deponent",
      "Preliminary objection points",
      "Para wise rebuttal points",
      "Statutory justification",
      "Place of verification",
      "Day",
      "Month",
    ],
    instructions: [
      "Address every paragraph of the original petition specifically; traverse all allegations.",
      "Attach documentary exhibits supporting respondent's statutory compliance marked as Exhibit R-1 to R-n.",
      "File within 4 weeks from date of appearance or court notice service.",
    ],
    sampleDraft: `IN THE [High Court or Judicial Forum]
(Special Original Jurisdiction)

W.P.(C) No. [Writ petition number] OF [Year]

BETWEEN:
[Original petitioner name]
                                                       ... PETITIONER
AND:
[Respondent name and capacity]
                                                       ... RESPONDENT

COUNTER AFFIDAVIT FILED BY THE RESPONDENT

I, [Respondent name and capacity], [Authority designation of deponent], do hereby solemnly affirm and state as follows:

1. I am the respondent in the writ petition and am authorized to swear to this counter affidavit on behalf of the respondents.

2. PRELIMINARY OBJECTIONS: [Preliminary objection points]

3. PARA-WISE TRAVERSE: At the outset, I deny each and every allegation, contention, and insinuation raised in the writ petition except those specifically admitted herein.

4. [Para wise rebuttal points]

5. [Statutory justification]

6. The petitioner has suppressed material facts and is not entitled to any equitable relief under Article 226 of the Constitution of India.

Wherefore it is prayed that this Hon'ble Court may be pleased to dismiss the writ petition with exemplary costs.

VERIFICATION
Verified at [Place of verification] on this the [Day] day of [Month], [Year] that the contents of the above counter affidavit are true to official records and personal belief.

DEPONENT / RESPONDENT`,
  },
  {
    id: "tmpl-affidavit-urgent",
    title: "Affidavit for Urgent Hearing / Early Listing",
    category: "affidavits",
    categoryLabel: "Affidavits",
    particularsCount: 14,
    courtOrForum: "High Court & Principal Civil Courts",
    actReferred: "High Court Rules of Practice • CPC Section 151",
    format: "DOCX",
    description:
      "Sworn affidavit stating imminent urgency, grave irreparable injury, auction notice, or interim stay necessity praying for out-of-turn hearing before the Court.",
    fillableVariables: [
      "Court Name",
      "Case Reference Number",
      "Year",
      "Applicant Name",
      "Deponent name and age",
      "Ground of extreme urgency",
      "Impugned event date or deadline",
      "Irreparable injury description",
      "Place",
      "Date",
    ],
    instructions: [
      "Highlight irreversible administrative or demolition actions scheduled on imminent dates.",
      "Attach copy of the notice or tender auction scheduling the prejudicial action.",
    ],
    sampleDraft: `BEFORE THE [Court Name]
In [Case Reference Number] OF [Year]

IN THE MATTER OF:
[Applicant Name] ... Applicant / Petitioner

AFFIDAVIT IN SUPPORT OF URGENT HEARING APPLICATION

I, [Deponent name and age], do hereby solemnly affirm and state as follows:

1. I am the petitioner in the captioned proceeding and fully conversant with the facts.

2. That the matter was last listed on registry board and could not be reached due to shortage of time.

3. URGENCY GROUNDS: [Ground of extreme urgency]. The opposite party has scheduled [Impugned event date or deadline] to take coercive physical steps.

4. If the matter is not taken up on an urgent motion bench, [Irreparable injury description].

Wherefore it is prayed that this Hon'ble Court may be pleased to list the petition for out-of-turn urgent hearing in the interest of justice.

VERIFICATION
Verified at [Place] on [Date] that the grounds of urgency are true and bona fide.

DEPONENT`,
  },
  {
    id: "tmpl-consultancy",
    title: "Consultancy Agreement",
    category: "deeds",
    categoryLabel: "Agreements & Deeds",
    particularsCount: 21,
    courtOrForum: "Commercial Contract Jurisdiction",
    actReferred: "Indian Contract Act, 1872 • Specific Relief Act, 1963",
    format: "DOCX",
    description:
      "Use when an independent consultant is engaged to provide defined professional or business services with clear deliverables, milestone fees, and IP retention.",
    fillableVariables: [
      "Effective date",
      "Client company name",
      "Client registered address",
      "Consultant name and PAN",
      "Consultant residential or office address",
      "Scope of services",
      "Monthly retainer fee in INR",
      "Milestone payment schedule",
      "Termination notice days",
      "Confidentiality period",
      "Governing jurisdiction city",
    ],
    instructions: [
      "Clearly delineate consultant as an independent contractor, not an employee or agent.",
      "Specify payment terms, TDS deduction compliance under Section 194J of the Income Tax Act.",
      "Execute on appropriate value stamp paper based on governing state jurisdiction.",
    ],
    sampleDraft: `CONSULTANCY SERVICES AGREEMENT

This CONSULTANCY AGREEMENT is made on this [Effective date] between:

[Client company name], having its registered office at [Client registered address] (the "Client");
AND
[Consultant name and PAN], residing at / having office at [Consultant residential or office address] (the "Consultant").

1. SCOPE OF ENGAGEMENT: The Client engages the Consultant to provide [Scope of services].

2. REMUNERATION: The Client agrees to pay the Consultant a monthly retainer fee of Rs. [Monthly retainer fee in INR]/- subject to statutory tax deductions and [Milestone payment schedule].

3. INTELLECTUAL PROPERTY: All work product created specifically for the Client shall vest with the Client upon receipt of full payment.

4. CONFIDENTIALITY: The Consultant shall maintain strict confidentiality during the term and for [Confidentiality period] years thereafter.

5. TERMINATION: Either party may terminate by giving [Termination notice days] days prior written notice.

6. DISPUTE RESOLUTION: Subject to the exclusive jurisdiction of the competent courts in [Governing jurisdiction city].

IN WITNESS WHEREOF the parties have set their hands:

CLIENT: ________________________
CONSULTANT: ____________________`,
  },
  {
    id: "tmpl-mou",
    title: "Memorandum of Understanding (MoU)",
    category: "deeds",
    categoryLabel: "Agreements & Deeds",
    particularsCount: 19,
    courtOrForum: "Corporate Collaboration Framework",
    actReferred: "Indian Contract Act, 1872",
    format: "DOCX",
    description:
      "Use when parties want to record the framework of a proposed collaboration, transaction or business venture prior to formal definitive contracts.",
    fillableVariables: [
      "Execution Date",
      "First Party Name and Details",
      "Second Party Name and Details",
      "Purpose of collaboration",
      "Mutual obligations",
      "Validity period months",
      "Exclusivity window",
      "Governing City",
    ],
    instructions: [
      "Specify which clauses are legally binding (e.g., confidentiality, exclusivity, dispute resolution) and which are non-binding expressions of intent.",
      "Detail timeline for due diligence and execution of definitive commercial agreements.",
    ],
    sampleDraft: `MEMORANDUM OF UNDERSTANDING (MoU)

This Memorandum of Understanding is entered into on this [Execution Date] by and between:
[First Party Name and Details] ("First Party");
AND
[Second Party Name and Details] ("Second Party").

WHEREAS the Parties desire to collaborate for [Purpose of collaboration];

NOW THEREFORE the Parties agree as follows:
1. OBJECTIVE & SCOPE: The parties intend to jointly explore [Purpose of collaboration].
2. ROLES & RESPONSIBILITIES: [Mutual obligations].
3. DURATION: This MoU shall remain valid for [Validity period months] months from execution.
4. EXCLUSIVITY: Neither party shall negotiate with third parties during [Exclusivity window].
5. LEGAL EFFECT: Except for Clauses relating to Confidentiality, Governing Law, and Exclusivity, this MoU represents an expression of mutual intent.
6. GOVERNING LAW: Courts in [Governing City] shall have exclusive jurisdiction.

FIRST PARTY: ____________________
SECOND PARTY: ___________________`,
  },
  {
    id: "tmpl-nda",
    title: "Mutual Non-Disclosure Agreement (NDA)",
    category: "commercial",
    categoryLabel: "Commercial",
    particularsCount: 17,
    courtOrForum: "Commercial & Corporate Jurisdiction",
    actReferred: "Indian Contract Act, 1872 • Information Technology Act, 2000",
    format: "DOCX",
    description:
      "Use when two parties will exchange confidential proprietary information for a defined business venture or evaluation purpose.",
    fillableVariables: [
      "Party A name and address",
      "Party B name and address",
      "Purpose of disclosure",
      "Confidentiality term years",
      "Governing law and court",
    ],
    instructions: [
      "Ensure standard exclusions are included (publicly available information, already known, independently developed).",
      "Include injunctive relief clause to permit approaching court for ex-parte stay against data leakage.",
    ],
    sampleDraft: `MUTUAL NON-DISCLOSURE AGREEMENT

Between: [Party A name and address] ("Disclosing / Receiving Party")
And: [Party B name and address] ("Disclosing / Receiving Party")

1. PURPOSE: The parties wish to explore [Purpose of disclosure] ("Purpose").
2. CONFIDENTIAL INFORMATION: Includes all non-public technical, proprietary, financial, algorithmic, and operational information disclosed by either party.
3. NON-DISCLOSURE OBLIGATIONS: Each party agrees to protect the Confidential Information with the same degree of care it uses for its own confidential data, and shall not disclose it without prior written consent.
4. TERM: This Agreement shall remain in effect for [Confidentiality term years] years from disclosure.
5. GOVERNING LAW: Subject to the exclusive jurisdiction of the courts at [Governing law and court].

PARTY A: ________________________
PARTY B: ________________________`,
  },
  {
    id: "tmpl-services",
    title: "Master Services Agreement (MSA)",
    category: "commercial",
    categoryLabel: "Commercial",
    particularsCount: 21,
    courtOrForum: "Commercial Court Jurisdiction",
    actReferred: "Indian Contract Act, 1872 • Specific Relief Act, 1963",
    format: "DOCX",
    description:
      "Comprehensive B2B master framework governing recurring service deliverables, SLA benchmarks, payment terms, and limitation of liability.",
    fillableVariables: [
      "Service provider name",
      "Recipient client name",
      "Detailed statements of work",
      "Payment terms and milestones",
      "Limitation of liability cap",
      "Arbitration seat and venue",
    ],
    instructions: [
      "Structure Statements of Work (SOWs) as separate schedules governed by the terms of this Master Agreement.",
      "Incorporate robust indemnity, limitation of liability, and arbitration dispute resolution clauses.",
    ],
    sampleDraft: `MASTER SERVICES AGREEMENT (MSA)

BETWEEN: [Service provider name] ("Service Provider")
AND: [Recipient client name] ("Client")

1. SERVICES: Service Provider shall deliver the services described in [Detailed statements of work].
2. WARRANTIES & SLA: Service Provider warrants that services will be performed with professional diligence in compliance with agreed benchmarks.
3. FEES & INVOICING: Client shall pay fees according to [Payment terms and milestones].
4. LIMITATION OF LIABILITY: Neither party shall be liable for indirect damages, and aggregate liability shall not exceed [Limitation of liability cap].
5. DISPUTE RESOLUTION: Disputes shall be settled through arbitration under the Arbitration and Conciliation Act, 1996 with seat at [Arbitration seat and venue].

SERVICE PROVIDER: _______________
CLIENT: _________________________`,
  },
  {
    id: "tmpl-notice-138",
    title: "Statutory Demand Notice under Section 138 NI Act",
    category: "notices",
    categoryLabel: "Notices",
    particularsCount: 18,
    courtOrForum: "Judicial First Class Magistrate (JFCM)",
    actReferred: "Negotiable Instruments Act, 1881, Section 138 & 142",
    format: "DOCX",
    description:
      "Mandatory 15-day statutory notice issued through legal counsel upon receipt of bank cheque return memo for 'Funds Insufficient' or 'Account Closed'.",
    fillableVariables: [
      "Drawer name and address",
      "Payee name and address",
      "Cheque number and date",
      "Cheque amount in INR",
      "Drawee bank and branch",
      "Return memo date and reason",
      "Advocate name and office address",
    ],
    instructions: [
      "Must be dispatched within 30 days from receipt of the bank return memo.",
      "Send via Speed Post with Acknowledgment Due; preserve delivery tracking slip.",
      "A 15-day payment window must be given from date of delivery before filing criminal complaint.",
    ],
    sampleDraft: `REGISTERED POST WITH ACKNOWLEDGMENT DUE / SPEED POST

To:
[Drawer name and address]

LEGAL NOTICE UNDER SECTION 138(b) OF THE NEGOTIABLE INSTRUMENTS ACT, 1881

Sir/Madam,
Under instructions from my client [Payee name and address], I serve upon you this Statutory Notice:

1. You issued [Cheque number and date] for Rs. [Cheque amount in INR]/- drawn on [Drawee bank and branch] towards discharge of legally enforceable liability.

2. The said cheque was presented for clearance but returned dishonoured on [Return memo date and reason].

3. You are hereby called upon to pay the cheque sum within 15 clear days of receipt of this notice, failing which criminal complaint under Section 138 NI Act will be lodged against you at your sole cost and consequence.

[Advocate name and office address]
ADVOCATE FOR THE PAYEE`,
  },
  {
    id: "tmpl-tenancy-106",
    title: "Statutory Tenancy Termination Notice under S.106 T.P. Act",
    category: "notices",
    categoryLabel: "Notices",
    particularsCount: 15,
    courtOrForum: "Rent Control / Munsiff Court",
    actReferred: "Transfer of Property Act, 1882, Section 106",
    format: "TXT",
    description:
      "Formal legal notice to tenant terminating monthly lease on grounds of rental default, expiry of tenure, or bona fide personal occupation.",
    fillableVariables: [
      "Tenant name and demised premises",
      "Landlord name and address",
      "Monthly rental rate INR",
      "Arrears amount and months",
      "Notice expiry date",
    ],
    instructions: [
      "Give minimum 15 clear days notice expiring with the end of a tenancy month.",
      "Send via Speed Post with Acknowledgment Due.",
    ],
    sampleDraft: `LEGAL NOTICE OF TERMINATION OF TENANCY (Section 106 T.P. Act)

To: [Tenant name and demised premises]

Under instructions from my client [Landlord name and address]:

1. You are a monthly tenant in occupation of the scheduled premises at a monthly rent of Rs. [Monthly rental rate INR]/-.

2. You have committed default in remitting rent of Rs. [Arrears amount and months]/-.

3. My client hereby terminates your tenancy. Deliver vacant, peaceful possession of demised premises on or before [Notice expiry date], failing which eviction suit with mesne profits will be initiated.

ADVOCATE FOR LANDLORD`,
  },
  {
    id: "tmpl-writ-226",
    title: "Writ Petition (Civil) under Article 226 — High Court of Kerala",
    category: "writs",
    categoryLabel: "Writs",
    particularsCount: 35,
    courtOrForum: "High Court of Kerala at Ernakulam",
    actReferred: "Constitution of India, Article 226 • Kerala High Court Rules",
    format: "DOCX",
    description:
      "Standard formal writ petition format for challenging arbitrary administrative orders, illegal overhead line realignment, or violation of natural justice.",
    fillableVariables: [
      "Petitioner name and address",
      "Respondent 1 authority",
      "Property survey number and village",
      "Impugned order number and date",
      "Specific prayers",
      "Grounds of violation",
      "Counsel Name",
    ],
    instructions: [
      "Verify that all statutory alternative remedies have been exhausted or state urgency grounds.",
      "Ensure an Index, Synopsis, List of Dates & Events, and true copies of marked Exhibits are paginated.",
    ],
    sampleDraft: `IN THE HIGH COURT OF KERALA AT ERNAKULAM
(Special Original Jurisdiction)

W.P.(C) No. ________ OF 2026

BETWEEN:
[Petitioner name and address]
                                                       ... PETITIONER
AND:
[Respondent 1 authority] & Others
                                                       ... RESPONDENTS

MEMORANDUM OF WRIT PETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA

1. The petitioner challenges the arbitrary [Impugned order number and date] passed without statutory hearing concerning property in [Property survey number and village].

2. GROUNDS: [Grounds of violation]. The action violates Article 14, 19(1)(g) and Article 300A of the Constitution of India.

3. PRAYERS: [Specific prayers].

DATED THIS THE _____ DAY OF ___________, 2026

[Counsel Name]
COUNSEL FOR THE PETITIONER`,
  },
  {
    id: "tmpl-bail-bnss",
    title: "Application for Regular / Anticipatory Bail under S.482/483 BNSS",
    category: "criminal",
    categoryLabel: "Criminal",
    particularsCount: 22,
    courtOrForum: "Sessions Court / High Court of Kerala",
    actReferred: "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023, Section 482/483",
    format: "DOCX",
    description:
      "Pleading template for pre-arrest or post-arrest bail petitions under the newly enacted BNSS criminal procedural framework with verified medical grounds.",
    fillableVariables: [
      "Court of Sessions or High Court",
      "Accused name and age",
      "Police station and crime number",
      "Offences under BNS",
      "Grounds of insufficient evidence",
      "Cooperation undertaking",
    ],
    instructions: [
      "Attach verified identity documents, tax filings, and local domicile proof.",
      "Reference Supreme Court safeguards in Satender Kumar Antil v. CBI.",
    ],
    sampleDraft: `IN THE [Court of Sessions or High Court]
Bail Application No. ________ of 2026

Crime No. [Police station and crime number]
Offences: Sections [Offences under BNS]

APPLICATION UNDER SECTION 482 OF BNSS, 2023 FOR ANTICIPATORY BAIL

I, [Accused name and age], do hereby state:
1. The applicant is an innocent citizen with permanent roots in society, falsely implicated due to commercial rivalry.
2. GROUNDS: [Grounds of insufficient evidence]. Custodial interrogation is unwarranted.
3. UNDERTAKING: [Cooperation undertaking].

PRAYER: Grant anticipatory bail to applicant in the event of arrest.

COUNSEL FOR APPLICANT`,
  },
  {
    id: "tmpl-sale-deed",
    title: "Agreement for Sale of Immovable Property (Kerala SRO Format)",
    category: "deeds",
    categoryLabel: "Agreements & Deeds",
    particularsCount: 28,
    courtOrForum: "Sub-Registrar Office / Pre-Conveyance",
    actReferred: "Transfer of Property Act, 1882 • Indian Contract Act, 1872",
    format: "DOCX",
    description:
      "Bilingual-standard sale agreement with earnest money advance, title deed verification covenants, Nil encumbrance clause, and specific performance indemnity.",
    fillableVariables: [
      "Vendor name and address",
      "Purchaser name and address",
      "Total sale consideration INR",
      "Advance earnest money INR",
      "Schedule property details sy no",
      "Conveyance closing period months",
    ],
    instructions: [
      "Print on required non-judicial stamp paper as prescribed under Kerala Stamp Act, 1959.",
      "Attach 30-year non-encumbrance certificate.",
    ],
    sampleDraft: `AGREEMENT FOR SALE OF IMMOVABLE PROPERTY

BETWEEN: [Vendor name and address] ("Vendor")
AND: [Purchaser name and address] ("Purchaser")

1. CONSIDERATION: Total agreed sale price Rs. [Total sale consideration INR]/-.
2. ADVANCE: Advance payment of Rs. [Advance earnest money INR]/- received by Vendor.
3. CLOSING: Sale deed shall be executed within [Conveyance closing period months] months upon clearance of title.
4. SCHEDULE: Land measuring ___ Ares in [Schedule property details sy no].

VENDOR: ________________________
PURCHASER: ______________________`,
  },
  {
    id: "tmpl-arbitration-23",
    title: "Statement of Claim under Section 23 of Arbitration Act",
    category: "arbitration",
    categoryLabel: "Arbitration",
    particularsCount: 31,
    courtOrForum: "Arbitral Tribunal / Sole Arbitrator",
    actReferred: "Arbitration and Conciliation Act, 1996, Section 23",
    format: "DOCX",
    description:
      "Arbitration pleadings template for commercial debt recovery, liquidated damages, and Section 17 interim security claims before sole arbitrator.",
    fillableVariables: [
      "Claimant name and counsel",
      "Respondent name and address",
      "Arbitration clause number",
      "Statement of facts and default",
      "Total claimed sum in INR",
      "Interest rate percent",
    ],
    instructions: [
      "Detail contract execution date and quote verbatim arbitration dispute resolution clause.",
      "Quantify principal damages, interest claim @ 18% p.a., and tribunal costs.",
    ],
    sampleDraft: `BEFORE THE ARBITRAL TRIBUNAL AT ERNAKULAM
In the Arbitration between:
[Claimant name and counsel] ... Claimant
VS
[Respondent name and address] ... Respondent

STATEMENT OF CLAIM UNDER SECTION 23 OF THE ARBITRATION ACT, 1996

1. In terms of [Arbitration clause number], the Arbitral Tribunal is seized of the disputes.
2. FACTS: [Statement of facts and default].
3. CLAIMS: Claimant is entitled to recover Rs. [Total claimed sum in INR]/- with interest at [Interest rate percent]% p.a.

PRAYER: Pass arbitral award directing Respondent to remit claimed sum with costs.

COUNSEL FOR THE CLAIMANT`,
  },
  {
    id: "tmpl-family-13b",
    title: "Mutual Consent Divorce Petition under Section 13B HMA",
    category: "family",
    categoryLabel: "Family",
    particularsCount: 26,
    courtOrForum: "Family Court",
    actReferred: "Hindu Marriage Act, 1955, Section 13B",
    format: "DOCX",
    description:
      "Joint petition under Section 13B of Hindu Marriage Act, 1955 with mutual settlement deed, permanent alimony settlement, and custody terms.",
    fillableVariables: [
      "Petitioner 1 husband details",
      "Petitioner 2 wife details",
      "Date and place of marriage",
      "Separation period years",
      "Permanent alimony settlement",
      "Child custody terms",
    ],
    instructions: [
      "Parties must have lived separately for a period of one year or more.",
      "Ensure all matrimonial jewellery and streedhan return receipts are recorded in settlement.",
    ],
    sampleDraft: `IN THE FAMILY COURT AT ________________
O.P. No. ________ OF 2026

IN THE MATTER OF:
[Petitioner 1 husband details] ... 1st Petitioner
AND
[Petitioner 2 wife details] ... 2nd Petitioner

JOINT PETITION UNDER SECTION 13B OF THE HINDU MARRIAGE ACT, 1955

1. Marriage was solemnized on [Date and place of marriage].
2. Parties have lived separately for [Separation period years] years due to irreconcilable temperamental differences.
3. SETTLEMENT: [Permanent alimony settlement]. Custody: [Child custody terms].

PRAYER: Dissolve marriage by decree of mutual consent divorce.

1ST PETITIONER | 2ND PETITIONER`,
  },
  {
    id: "tmpl-consumer-35",
    title: "Consumer Complaint under Section 35 of CPA 2019",
    category: "civil",
    categoryLabel: "Civil",
    particularsCount: 24,
    courtOrForum: "District Consumer Disputes Redressal Commission (DCDRC)",
    actReferred: "Consumer Protection Act, 2019, Section 35",
    format: "DOCX",
    description:
      "Standard complaint filing template against defective goods, deficient service, e-commerce non-delivery, or builder delay with compensation computation.",
    fillableVariables: [
      "Complainant name and address",
      "Opposite party company name",
      "Transaction value and invoice no",
      "Deficiency description",
      "Compensation claimed INR",
    ],
    instructions: [
      "District Commission handles pecuniary claims up to Rs. 50 Lakhs.",
      "Attach purchase invoice, payment receipt, and proof of legal notice delivery.",
    ],
    sampleDraft: `BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION
Consumer Case (CC) No. ________ OF 2026

[Complainant name and address] ... Complainant
VS
[Opposite party company name] ... Opposite Party

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019

1. Complainant purchased product vide [Transaction value and invoice no].
2. DEFICIENCY: [Deficiency description].
3. PRAYER: Direct opposite party to refund transaction value and pay Rs. [Compensation claimed INR]/- towards compensation and costs.

COMPLAINANT`,
  },
  {
    id: "tmpl-caveat-148a",
    title: "Caveat Petition under Section 148A of CPC",
    category: "civil",
    categoryLabel: "Civil",
    particularsCount: 16,
    courtOrForum: "High Court of Kerala / District Court",
    actReferred: "Code of Civil Procedure, 1908, Section 148A",
    format: "DOCX",
    description:
      "Pre-emptive caveat petition lodged to ensure no ex-parte injunction or stay order is passed against the caveator without prior formal notice.",
    fillableVariables: [
      "Court Name",
      "Caveator Name and Address",
      "Expected Opposite Party Name",
      "Subject Matter and Property Description",
      "Apprehension of Ex-Parte Motion",
      "Counsel for Caveator",
    ],
    instructions: [
      "Caveat remains in force for 90 days from the date of lodging.",
      "Copy of Caveat must be served on expected opposite party via Registered Post.",
    ],
    sampleDraft: `BEFORE THE [Court Name]
Caveat Petition No. ________ OF 2026

[Caveator Name and Address] ... Caveator
VS
[Expected Opposite Party Name] ... Expected Petitioner / Plaintiff

CAVEAT PETITION UNDER SECTION 148A OF THE CODE OF CIVIL PROCEDURE, 1908

1. The Caveator expects that the opposite party may institute an application or petition regarding [Subject Matter and Property Description].
2. APPREHENSION: [Apprehension of Ex-Parte Motion].
3. PRAYER: Let no ex-parte ad-interim order or injunction be passed without prior notice to the Caveator.

[Counsel for Caveator]
COUNSEL FOR CAVEATOR`,
  },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "affidavits", label: "Affidavits" },
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
  { id: "commercial", label: "Commercial" },
];

const ACTIVE_CASE_AUTOFILL_DATA: Record<string, string> = {
  "Forum or authority name": "HIGH COURT OF KERALA AT ERNAKULAM",
  "Case type and number or reference if any": "W.P.(C) No. 19482",
  "Year or blank": "2024",
  "Cause title or matter description": "K. Gopakumar Nambiar v. Kerala State Electricity Board Ltd. & Others",
  "DEPONENT NAME": "K. GOPAKUMAR NAMBIAR",
  "PURPOSE OF AFFIDAVIT TITLE": "IN SUPPORT OF WRIT PETITION",
  "Deponent name": "K. Gopakumar Nambiar",
  "Son Daughter Wife Of": "Son of",
  "Parent or spouse name": "Late K. Raghavan Nambiar",
  "Age": "48",
  "Occupation": "Industrialist & Exporter",
  "Address": "TC 14/1922, 'Sreevalsam', Panampilly Nagar, Kochi, Kerala 682036",
  "Deponent capacity": "Petitioner",
  "Source Of Authority If Representative": "as Managing Director authorized vide Board Resolution dated 12.01.2024",
  "Purpose of affidavit": "to place on record material facts and documentary exhibits in support of the prayer for stay of overhead line drawing across petitioner's industrial premises",
  "Fact 1": "The petitioner is the absolute title-holder in possession of 1.42 Acres of registered commercial property in Sy. No. 412/1-B of Elamkulam Village, Kanayannur Taluk.",
  "Fact 2": "On 14.10.2024, respondent officials attempted unlawful entry into petitioner's premises without prior statutory notice under Section 16(1) of the Indian Telegraph Act, 1885.",
  "Fact 3": "The alternative realignment proposed by the Petitioner through the public road boundary is technically feasible and incurs zero commercial damage.",
  "Fact 4": "Unless this Hon'ble Court grants an interim order of status quo, grave and irreparable injury will be caused to the petitioner's export manufacturing unit.",
  "Purpose specific averments paragraph 1": "The impugned alignment arbitrarily traverses right across the petitioner's heavy machinery testing bay, creating acute safety hazards.",
  "Purpose specific averments paragraph 2": "The District Magistrate has failed to exercise statutory jurisdiction under Section 16(1) to adjudicate the petitioner's written objection dated 18.10.2024.",
  "Numbered paragraphs": "1 to 8",
  "Place of affirmation": "Ernakulam",
  "Day": "29th",
  "Month": "October",
  "Year": "2024",

  // Common cross-template mocks
  "High Court or Judicial Forum": "HIGH COURT OF KERALA AT ERNAKULAM",
  "Writ petition number": "19482",
  "Original petitioner name": "K. Gopakumar Nambiar",
  "Respondent name and capacity": "Kerala State Electricity Board Ltd., Rep. by Secretary",
  "Authority designation of deponent": "Executive Engineer, Transmission Division, Kalamassery",
  "Preliminary objection points": "Alternative statutory remedy exists before the District Magistrate under Section 16(1) of the Indian Telegraph Act, 1885.",
  "Para wise rebuttal points": "The 110kV line route was finalized following aerial survey and technical clearance by the Chief Electrical Inspectorate.",
  "Statutory justification": "Actions taken strictly conform to Section 67 & 68 of the Electricity Act, 2003.",
  "Place of verification": "Ernakulam",
  "Court Name": "HIGH COURT OF KERALA AT ERNAKULAM",
  "Applicant Name": "K. Gopakumar Nambiar",
  "Ground of extreme urgency": "Physical tower installation work is scheduled to commence on 01.11.2024.",
  "Impugned event date or deadline": "01.11.2024",
  "Irreparable injury description": "Irreversible damage will be caused to export operations.",
  "Place": "Kochi",
  "Date": "29.10.2024",
  "Client company name": "Apex Logistics & Infotech Solutions Ltd.",
  "Client registered address": "Infopark Phase II, Kakkanad, Kochi, Kerala 682042",
  "Consultant name and PAN": "Adv. Rajesh V. Kurup, PAN: ABCPK1234F",
  "Consultant residential or office address": "Chamber 412, High Court Lawyers Chamber Complex, Ernakulam",
  "Scope of services": "Regulatory statutory compliance advisory, corporate dispute resolution, and contractual drafting",
  "Monthly retainer fee in INR": "1,25,000",
  "Milestone payment schedule": "payable by 5th day of every calendar month",
  "Termination notice days": "30",
  "Confidentiality period": "3",
  "Governing jurisdiction city": "Kochi / Ernakulam",
  "Execution Date": "29th October 2024",
  "First Party Name and Details": "Apex Logistics Ltd. represented by MD K. Gopakumar",
  "Second Party Name and Details": "Malabar Maritime Supply Chain LLP",
  "Purpose of collaboration": "Joint logistics warehousing and customs clearing automation",
  "Mutual obligations": "Parties shall share facility space and ERP software infrastructure",
  "Validity period months": "12",
  "Exclusivity window": "90 days",
  "Governing City": "Ernakulam",
  "Drawer name and address": "M/s Greenfield Agri Ventures, MG Road, Ernakulam",
  "Payee name and address": "Highland Spices & Exports Pvt. Ltd., Willingdon Island, Kochi",
  "Cheque number and date": "Cheque No. 492019 dated 15.09.2024",
  "Cheque amount in INR": "14,50,000",
  "Drawee bank and branch": "HDFC Bank Ltd., Ravipuram Branch, Kochi",
  "Return memo date and reason": "22.09.2024 with memo 'FUNDS INSUFFICIENT'",
  "Advocate name and office address": "Adv. S. Venugopal, Chamber 314, HC Road, Ernakulam",
  "Tenant name and demised premises": "M/s Oceanic Traders, Door No. 44/129, Marine Drive, Kochi",
  "Landlord name and address": "Sri. K. Gopakumar Nambiar, Panampilly Nagar, Kochi",
  "Monthly rental rate INR": "45,000",
  "Arrears amount and months": "1,35,000 (3 months default)",
  "Notice expiry date": "15th November 2024",
  "Petitioner name and address": "K. Gopakumar Nambiar, Panampilly Nagar, Kochi",
  "Respondent 1 authority": "Kerala State Electricity Board Ltd., Rep. by Secretary, Vydyuthi Bhavanam, Thiruvananthapuram",
  "Property survey number and village": "Sy. No. 412/1-B, Elamkulam Village, Kanayannur Taluk",
  "Impugned order number and date": "Order No. KSEB/CE/TRANS/2024-912 dated 03.10.2024",
  "Specific prayers": "Issue a Writ of Certiorari quashing impugned order and mandamus directing fair consideration of alternative route alignment",
  "Grounds of violation": "Arbitrary overhead drawing without Section 16(1) hearing",
  "Counsel Name": "Adv. S. Venugopal & Associates",
  "Accused name and age": "Arjun Menon, Aged 32 years",
  "Police station and crime number": "Infopark Police Station, Crime No. 412/2024",
  "Offences under BNS": "Sections 316(2), 318(4) of Bharatiya Nyaya Sanhita, 2023",
  "Grounds of insufficient evidence": "The alleged transaction is purely of a civil contractual nature; no custodial interrogation is warranted.",
  "Cooperation undertaking": "Applicant undertakes to appear before the Investigating Officer as and when directed and surrender passport.",
  "Vendor name and address": "Sri. K. Gopakumar Nambiar, Panampilly Nagar, Kochi",
  "Purchaser name and address": "M/s Skyline Realty Developers LLP, MG Road, Ernakulam",
  "Total sale consideration INR": "2,85,00,000",
  "Advance earnest money INR": "50,00,000",
  "Schedule property details sy no": "Sy. No. 412/1-B, Elamkulam Village, measuring 1.42 Acres",
  "Conveyance closing period months": "3",
  "Claimant name and counsel": "M/s Malabar Marine Exports, represented by Adv. S. Venugopal",
  "Respondent name and address": "Oceanic Cold Storage Logistics Pvt. Ltd., Port Road, Kochi",
  "Arbitration clause number": "Clause 18 (Dispute Resolution by Sole Arbitrator)",
  "Statement of facts and default": "Failure to remit cold storage freight charges despite issuance of reconciled account statements",
  "Total claimed sum in INR": "48,75,000",
  "Interest rate percent": "18",
};

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

  // Drafting Mode States
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [particularsValues, setParticularsValues] = useState<Record<string, string>>({});
  const [highlightFilled, setHighlightFilled] = useState<boolean>(true);
  const [isAiFilling, setIsAiFilling] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredTemplates = useMemo(() => {
    return TEMPLATES_DATA.filter((tmpl) => {
      if (activeMainTab === "my" && !tmpl.isMyTemplate) {
        return false;
      }
      const matchCat =
        selectedCategory === "all" ||
        tmpl.category === selectedCategory ||
        (selectedCategory === "deeds" && tmpl.category === "commercial");

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

  const handleOpenPreview = (tmpl: LegalTemplate) => {
    setPreviewTemplate(tmpl);
    setIsDrafting(false);
    setParticularsValues({});
  };

  const handleCloseModal = () => {
    setPreviewTemplate(null);
    setIsDrafting(false);
    setParticularsValues({});
  };

  const handleStartDrafting = (tmpl: LegalTemplate) => {
    setPreviewTemplate(tmpl);
    setIsDrafting(true);
  };

  const handleAiAutoFill = () => {
    if (!previewTemplate) return;
    setIsAiFilling(true);
    setTimeout(() => {
      const newVals: Record<string, string> = { ...particularsValues };
      previewTemplate.fillableVariables.forEach((variable) => {
        if (ACTIVE_CASE_AUTOFILL_DATA[variable]) {
          newVals[variable] = ACTIVE_CASE_AUTOFILL_DATA[variable];
        } else {
          newVals[variable] = `[${variable} - Auto-generated from active matter records]`;
        }
      });
      setParticularsValues(newVals);
      setIsAiFilling(false);
      showToast("✨ Auto-filled particulars from active case WP(C) 19482/2024");
    }, 400);
  };

  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("✓ Copied draft to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const getComputedDraft = (tmpl: LegalTemplate): string => {
    let result = tmpl.sampleDraft;
    Object.entries(particularsValues).forEach(([k, v]) => {
      if (v && v.trim()) {
        result = result.split(`[${k}]`).join(v.trim());
      }
    });
    return result;
  };

  const handleDownloadDraft = (tmpl: LegalTemplate, format: "txt" | "docx") => {
    const draftText = getComputedDraft(tmpl);
    if (format === "txt") {
      const element = document.createElement("a");
      const file = new Blob([draftText], { type: "text/plain;charset=utf-8" });
      element.href = URL.createObjectURL(file);
      element.download = `${tmpl.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast("Downloaded .txt draft");
    } else {
      const htmlContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${tmpl.title}</title>
  <style>
    @page { size: A4; margin: 1in; }
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #000; }
    p { margin: 0 0 10pt 0; text-align: justify; }
    .center { text-align: center; font-weight: bold; margin-bottom: 8pt; }
    .title { text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 14pt; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="WordSection1">
    <div class="title">${tmpl.title}</div>
    ${draftText
      .split("\n")
      .map((l) => `<p>${l || "&nbsp;"}</p>`)
      .join("")}
  </div>
</body>
</html>`;
      const blob = new Blob(["\ufeff", htmlContent], {
        type: "application/msword;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tmpl.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Downloaded .docx document");
    }
  };

  const handlePrint = (tmpl: LegalTemplate) => {
    const draftText = getComputedDraft(tmpl);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${tmpl.title}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #000; padding: 20px; }
            .title { text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 16pt; text-transform: uppercase; }
            p { margin: 0 0 10pt 0; text-align: justify; }
          </style>
        </head>
        <body>
          <div class="title">${tmpl.title}</div>
          ${draftText
            .split("\n")
            .map((l) => `<p>${l || "&nbsp;"}</p>`)
            .join("")}
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Helper to render lines with LawgicHub variable pills
  const renderDocumentWithPills = (
    rawText: string,
    values: Record<string, string>,
    isHighlighted: boolean
  ) => {
    const lines = rawText.split("\n");
    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={lineIdx} className="h-3" />;
      }

      const isCenteredHeading =
        trimmed === "Affidavit" ||
        trimmed.startsWith("BEFORE THE") ||
        trimmed.includes("of [Year") ||
        trimmed === "IN THE MATTER OF" ||
        trimmed.startsWith("[Cause title") ||
        trimmed.startsWith("AFFIDAVIT OF") ||
        trimmed.startsWith("IN THE HIGH COURT") ||
        trimmed.startsWith("IN THE [High Court") ||
        trimmed.startsWith("IN THE COURT OF") ||
        trimmed.startsWith("BEFORE THE HON'BLE") ||
        trimmed === "VERIFICATION" ||
        trimmed.startsWith("MEMORANDUM OF") ||
        trimmed.startsWith("CONSULTANCY SERVICES") ||
        trimmed.startsWith("MUTUAL NON-DISCLOSURE") ||
        trimmed.startsWith("MASTER SERVICES") ||
        trimmed.startsWith("AGREEMENT FOR SALE") ||
        trimmed.startsWith("STATEMENT OF CLAIM") ||
        trimmed.startsWith("LEGAL NOTICE UNDER") ||
        trimmed.startsWith("APPLICATION UNDER") ||
        trimmed.startsWith("JOINT PETITION UNDER") ||
        trimmed.startsWith("CAVEAT PETITION UNDER") ||
        trimmed.startsWith("COMPLAINT UNDER");

      const isRightAlignedSignoff =
        trimmed === "DEPONENT" ||
        trimmed.startsWith("DEPONENT /") ||
        trimmed.startsWith("COUNSEL FOR") ||
        trimmed.startsWith("ADVOCATE FOR") ||
        trimmed.startsWith("CLIENT:") ||
        trimmed.startsWith("VENDOR:") ||
        trimmed.startsWith("1ST PETITIONER |");

      const isSubHeading =
        trimmed === "PURPOSE-SPECIFIC AVERMENTS" ||
        trimmed.startsWith("PRELIMINARY OBJECTIONS:") ||
        trimmed.startsWith("PARA-WISE TRAVERSE:");

      const parts = line.split(/(\[[^\]]+\])/g);
      const renderedTokens = parts.map((part, pIdx) => {
        if (part.startsWith("[") && part.endsWith("]")) {
          const varKey = part.slice(1, -1);
          const filledVal = values[varKey] || values[part];
          if (filledVal && filledVal.trim().length > 0) {
            if (isHighlighted) {
              return (
                <span
                  key={pIdx}
                  className="inline-block px-1.5 py-0.5 mx-0.5 rounded font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700 underline decoration-[#6B1728] decoration-2 underline-offset-2"
                  title={`Filled Variable: ${varKey}`}
                >
                  {filledVal}
                </span>
              );
            }
            return (
              <span
                key={pIdx}
                className="font-semibold text-zinc-950 dark:text-zinc-50 underline decoration-zinc-400 decoration-dotted underline-offset-2"
              >
                {filledVal}
              </span>
            );
          }
          return (
            <span
              key={pIdx}
              className="inline-block px-1.5 py-0.5 mx-0.5 rounded font-sans text-xs font-medium bg-[#f0edfd] dark:bg-[#2c2250] text-[#5233a0] dark:text-[#c4b5fd] border border-[#dcd3f8] dark:border-[#413170] select-none shadow-2xs"
            >
              {part}
            </span>
          );
        }
        return <span key={pIdx}>{part}</span>;
      });

      if (isCenteredHeading) {
        return (
          <div
            key={lineIdx}
            className="text-center font-bold tracking-wide my-1 text-zinc-900 dark:text-zinc-100"
          >
            {renderedTokens}
          </div>
        );
      }

      if (isRightAlignedSignoff) {
        return (
          <div
            key={lineIdx}
            className="text-right font-bold mt-4 pr-3 text-zinc-900 dark:text-zinc-100"
          >
            {renderedTokens}
          </div>
        );
      }

      if (isSubHeading) {
        return (
          <div
            key={lineIdx}
            className="font-bold tracking-wider mt-4 mb-1 text-zinc-950 dark:text-zinc-100 uppercase text-xs sm:text-sm"
          >
            {renderedTokens}
          </div>
        );
      }

      return (
        <p key={lineIdx} className="leading-relaxed my-1.5 text-justify">
          {renderedTokens}
        </p>
      );
    });
  };

  const filledCount = previewTemplate
    ? previewTemplate.fillableVariables.filter(
        (v) => particularsValues[v] && particularsValues[v].trim().length > 0
      ).length
    : 0;

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 px-4 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 dark:text-purple-600" />
          <span>{toastMessage}</span>
        </div>
      )}

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

      {/* Full-width Search Bar matching LawgicHub */}
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

      {/* Grid of Template Cards (3 Columns matching LawgicHub) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            onClick={() => handleOpenPreview(tmpl)}
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

      {/* Template Preview and Interactive Drafting Modal (LawgicHub Replica) */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div
            className={`w-full ${
              isDrafting ? "max-w-6xl" : "max-w-3xl sm:max-w-4xl"
            } max-h-[92vh] bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
          >
            {/* Top Navigation Bar */}
            <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-4 shrink-0 bg-white dark:bg-zinc-950">
              <div className="space-y-2">
                {isDrafting && (
                  <button
                    type="button"
                    onClick={() => setIsDrafting(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer mb-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Template Preview</span>
                  </button>
                )}

                <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight leading-snug">
                  {previewTemplate.title}
                </h2>

                {/* Subtitle Tags: Particulars and Category */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                    {previewTemplate.particularsCount} particulars
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                    {previewTemplate.categoryLabel}
                  </span>
                  {isDrafting && (
                    <span className="px-3 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-medium border border-purple-200 dark:border-purple-800">
                      {filledCount} of {previewTemplate.fillableVariables.length} particulars filled
                    </span>
                  )}
                </div>

                {!isDrafting && (
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl pt-1">
                    {previewTemplate.description}
                  </p>
                )}
              </div>

              {/* Close Button X */}
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Preview Mode vs Interactive Drafting Mode */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {!isDrafting ? (
                /* === LAWGICHUB PREVIEW VIEW === */
                <div className="space-y-3">
                  {/* PREVIEW Label */}
                  <div className="text-[11px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                    PREVIEW
                  </div>

                  {/* Document Paper Card */}
                  <div className="relative rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-[#ffffff] dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xs overflow-hidden">
                    {/* Rendered Judicial Document */}
                    <div className="font-serif text-[13.5px] sm:text-[14.5px] leading-relaxed text-zinc-800 dark:text-zinc-200 max-h-[440px] overflow-y-auto pr-3 scrollbar-thin">
                      {renderDocumentWithPills(previewTemplate.sampleDraft, particularsValues, false)}
                    </div>

                    {/* Floating LawgicHub AI Emblem at bottom right */}
                    <div
                      onClick={() => handleStartDrafting(previewTemplate)}
                      title="AI Drafting Assistant Available • Click to Use Template"
                      className="absolute bottom-5 right-6 z-10 flex items-center gap-2 p-1.5 pr-3.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-700/80 shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 p-[1.5px] flex items-center justify-center shadow-xs">
                        <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform" />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-sans hidden sm:inline">
                        AI Draft
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* === INTERACTIVE DRAFTING & PARTICULARS EDITOR === */
                <div className="space-y-4">
                  {/* AI Auto-Fill & Particulars Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAiAutoFill}
                        disabled={isAiFilling}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 animate-spin-reverse" />
                        <span>{isAiFilling ? "Syncing Case Records..." : "✨ AI Auto-Fill (Active Case)"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setParticularsValues({})}
                        className="px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={highlightFilled}
                          onChange={(e) => setHighlightFilled(e.target.checked)}
                          className="rounded text-black dark:text-white focus:ring-0 cursor-pointer"
                        />
                        <span>Highlight filled particulars</span>
                      </label>
                    </div>
                  </div>

                  {/* Split Screen: Left (Inputs) | Right (Live Document Paper) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left Form: Particulars Inputs */}
                    <div className="lg:col-span-5 space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                      <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-400 uppercase block">
                        PARTICULARS FORM ({previewTemplate.fillableVariables.length} FIELDS)
                      </span>

                      <div className="space-y-3">
                        {previewTemplate.fillableVariables.map((variable) => {
                          const isLongText =
                            variable.toLowerCase().includes("fact") ||
                            variable.toLowerCase().includes("averment") ||
                            variable.toLowerCase().includes("purpose") ||
                            variable.toLowerCase().includes("points") ||
                            variable.toLowerCase().includes("statement");

                          return (
                            <div
                              key={variable}
                              className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5 focus-within:border-black dark:focus-within:border-white transition-colors"
                            >
                              <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                <span>{variable}</span>
                                {particularsValues[variable] && (
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Filled
                                  </span>
                                )}
                              </div>

                              {isLongText ? (
                                <textarea
                                  rows={2}
                                  value={particularsValues[variable] || ""}
                                  onChange={(e) =>
                                    setParticularsValues((prev) => ({
                                      ...prev,
                                      [variable]: e.target.value,
                                    }))
                                  }
                                  placeholder={`Enter ${variable.toLowerCase()}...`}
                                  className="w-full p-2 text-xs rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={particularsValues[variable] || ""}
                                  onChange={(e) =>
                                    setParticularsValues((prev) => ({
                                      ...prev,
                                      [variable]: e.target.value,
                                    }))
                                  }
                                  placeholder={`Enter ${variable.toLowerCase()}...`}
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Paper: Dynamic Live Judicial Draft */}
                    <div className="lg:col-span-7 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                          LIVE DOCUMENT PREVIEW
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                          <span>Real-time sync</span>
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#ffffff] dark:bg-zinc-900/60 shadow-xs max-h-[500px] overflow-y-auto font-serif text-[13.5px] leading-relaxed text-zinc-800 dark:text-zinc-200 scrollbar-thin">
                        {renderDocumentWithPills(
                          previewTemplate.sampleDraft,
                          particularsValues,
                          highlightFilled
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {!isDrafting ? (
                <>
                  {/* Left Pill Button: "Use this template" exactly as in screenshot */}
                  <button
                    type="button"
                    onClick={() => handleStartDrafting(previewTemplate)}
                    className="px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs sm:text-sm hover:opacity-90 transition cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    <span>Use this template</span>
                  </button>

                  {/* Secondary Quick Export Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyDraft(previewTemplate.sampleDraft)}
                      className="px-3.5 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black font-semibold text-xs text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy Draft"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadDraft(previewTemplate, "docx")}
                      className="px-3.5 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black font-semibold text-xs text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .docx</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Drafting Mode Export & Filing Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyDraft(getComputedDraft(previewTemplate))}
                      className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black font-semibold text-xs text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy Filled Draft"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadDraft(previewTemplate, "docx")}
                      className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export as .docx</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadDraft(previewTemplate, "txt")}
                      className="px-3.5 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black font-semibold text-xs text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>.txt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePrint(previewTemplate)}
                      className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                      title="Print / Export PDF"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                  {onSelectTemplateForFiling && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTemplateForFiling(previewTemplate);
                        handleCloseModal();
                      }}
                      className="px-5 py-2 rounded-full bg-[#6B1728] text-white font-bold text-xs hover:bg-[#52111e] transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Proceed to Filing &amp; E-Sign</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
