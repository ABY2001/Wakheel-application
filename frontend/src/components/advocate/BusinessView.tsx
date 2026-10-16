"use client";

import React, { useState, useEffect } from "react";
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
  HelpCircle,
  Globe,
  Award,
} from "lucide-react";

interface BusinessViewProps {
  activeModule?: string;
  onSelectModule?: (mod: string) => void;
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
  const [activeDocketSuccess, setActiveDocketSuccess] = useState<string | null>(null);

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

  // Helper to get active list of service items based on current tab
  const getActiveServices = (): ServiceItem[] => {
    switch (currentTab) {
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

  const handleInitiateDocket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    const generatedDocket = `SRN-WAK-${Math.floor(100000 + Math.random() * 900000)}`;
    setActiveDocketSuccess(
      `Service Docket #${generatedDocket} successfully opened for ${
        docketClientName || "Direct Matter Representation"
      } under ${selectedService.name}. Priority verification initiated.`
    );
    setSelectedService(null);
    setDocketClientName("");
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
            const isActive = currentTab === tab.id;
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

      {/* Success Notification Banner */}
      {activeDocketSuccess && (
        <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex items-center justify-between text-xs text-black dark:text-white">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-black dark:text-white shrink-0" />
            <span>{activeDocketSuccess}</span>
          </div>
          <button
            onClick={() => setActiveDocketSuccess(null)}
            className="text-zinc-400 hover:text-black dark:hover:text-white text-xs font-bold p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View 1 to 5: Tab Content with Sub-Category Pills and Service Cards */}
      {currentTab !== "auditor-ca" && (
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

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900">
                  <button
                    onClick={() => setSelectedService(service)}
                    className="w-full py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
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
      {currentTab === "auditor-ca" && (
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE DOCKET INITIATION MODAL
      ========================================================================= */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
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
                onClick={() => setSelectedService(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-black dark:text-white mb-1">Scope &amp; Description</h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {selectedService.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-black dark:text-white mb-1">Key Documents / Input Required</h4>
                <ul className="list-disc pl-4 space-y-1 text-zinc-600 dark:text-zinc-400">
                  {selectedService.documents.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-black dark:text-white mb-1">Deliverables Included</h4>
                <ul className="list-disc pl-4 space-y-1 text-zinc-600 dark:text-zinc-400">
                  {selectedService.deliverables.map((deliv, i) => (
                    <li key={i}>{deliv}</li>
                  ))}
                </ul>
              </div>

              <form onSubmit={handleInitiateDocket} className="pt-2 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Client / Business Entity Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={docketClientName}
                    onChange={(e) => setDocketClientName(e.target.value)}
                    placeholder="e.g. Inworth LegalTech Pvt Ltd or Gopakumar Nambiar"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white shadow-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer shadow-xs"
                  >
                    Create Service Docket
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
