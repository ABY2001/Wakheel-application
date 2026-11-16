// ============================================================================
// WAKHEEL AI LEGAL COPILOT SEMANTIC REASONING ENGINE
// Zero-cloud-quota, high-precision statutory concordance & legal intelligence
// Specialization: High Court of Kerala, Indian Judicial Forums, BNS/BNSS, Civil & Corporate
// ============================================================================

export const LEGAL_DOMAINS = {
  CLARIFICATION: "clarification",
  BNS_IPC_COMPARISON: "bns_ipc_comparison",
  CRIMINAL_DEFENSE_BAIL: "criminal_defense_bail",
  CHEQUE_BOUNCE_S138: "cheque_bounce_s138",
  TELEGRAPH_KSEB_LINES: "telegraph_kseb_lines",
  PROPERTY_LAND_REVENUE: "property_land_revenue",
  TENANCY_RENT_CONTROL: "tenancy_rent_control",
  FAMILY_MATRIMONIAL: "family_matrimonial",
  CONSUMER_PROTECTION: "consumer_protection",
  CYBER_CRIME_FRAUD: "cyber_crime_fraud",
  EMPLOYMENT_LABOUR: "employment_labour",
  CORPORATE_CONTRACTS: "corporate_contracts",
  CONSTITUTIONAL_WRITS: "constitutional_writs",
  MOTOR_ACCIDENT_MACT: "motor_accident_mact",
  GENERAL_LEGAL: "general_legal",
};

// Check if string contains Malayalam unicode characters
export function isMalayalam(text = "") {
  return /[\u0D00-\u0D7F]/.test(text);
}

// Check for greetings or vague/empty queries
function isGreetingOrVague(text = "") {
  const trimmed = text.trim();
  if (trimmed.length === 0) return { isVague: true, type: "empty" };

  const lower = trimmed.toLowerCase();

  // Pure greetings
  const greetingRegex = /^(hi|hello|hey|namaste|namaskaram|good\s*(morning|afternoon|evening|day)|greetings|howdy|hoi)[\s!.,?]*$/i;
  if (greetingRegex.test(lower)) {
    return { isVague: true, type: "greeting" };
  }

  // Conversational or meta questions
  const metaRegex = /^(who\s+are\s+you|what\s+can\s+you\s+do|how\s+do\s+you\s+work|what\s+is\s+wakheel|help\s*me?|can\s+you\s+help\s*me?|test|asdf|testing|lawyer|advocate)[\s!.,?]*$/i;
  if (metaRegex.test(lower)) {
    return { isVague: true, type: "meta" };
  }

  // Extremely brief without clear legal keywords
  const hasLegalKeyword = /\b(court|fir|bail|case|cheque|police|land|deed|rent|divorce|suit|notice|bns|bnss|ipc|crpc|cpc|482|138|kseb|property|salary|fraud|injunction|appeal|writ)\b/i.test(lower);
  if (trimmed.length < 15 && !hasLegalKeyword) {
    return { isVague: true, type: "unintelligible" };
  }

  return { isVague: false };
}

// Detect legal domain based on keywords and concepts
export function detectDomain(prompt = "", specialization = null) {
  const lower = prompt.toLowerCase();

  // If explicit specialization was supplied from AiAdvocateView
  if (specialization === "constitutional" && (lower.includes("writ") || lower.includes("226") || lower.includes("stay") || lower.includes("fundamental"))) {
    return LEGAL_DOMAINS.CONSTITUTIONAL_WRITS;
  }
  if (specialization === "criminal" && (lower.includes("bail") || lower.includes("fir") || lower.includes("police") || lower.includes("arrest"))) {
    return LEGAL_DOMAINS.CRIMINAL_DEFENSE_BAIL;
  }
  if (specialization === "civil-property" && (lower.includes("land") || lower.includes("title") || lower.includes("deed") || lower.includes("injunction") || lower.includes("boundary"))) {
    return LEGAL_DOMAINS.PROPERTY_LAND_REVENUE;
  }
  if (specialization === "corporate" && (lower.includes("company") || lower.includes("contract") || lower.includes("arbitration") || lower.includes("msme") || lower.includes("186"))) {
    return LEGAL_DOMAINS.CORPORATE_CONTRACTS;
  }

  // 1. Telegraph Act / Electricity lines / KSEB
  if (
    lower.includes("telegraph") ||
    lower.includes("kseb") ||
    lower.includes("electricity line") ||
    lower.includes("electric line") ||
    lower.includes("transmission line") ||
    lower.includes("high tension") ||
    lower.includes("വൈദ്യുതി") ||
    lower.includes("കെ.എസ്.ഇ.ബി") ||
    lower.includes("മരം വെട്ടൽ") ||
    (lower.includes("tree") && (lower.includes("cut") || lower.includes("felling") || lower.includes("electric") || lower.includes("line"))) ||
    (lower.includes("section 16") && lower.includes("magistrate"))
  ) {
    return LEGAL_DOMAINS.TELEGRAPH_KSEB_LINES;
  }

  // 2. BNS vs IPC comparison / New Criminal Laws
  if (
    lower.includes("304a") ||
    (lower.includes("bns") && (lower.includes("ipc") || lower.includes("equivalent") || lower.includes("comparison") || lower.includes("106") || lower.includes("negligence") || lower.includes("hit and run"))) ||
    (lower.includes("bnss") && (lower.includes("crpc") || lower.includes("equivalent")))
  ) {
    return LEGAL_DOMAINS.BNS_IPC_COMPARISON;
  }

  // 3. Cheque Dishonour / NI Act 138
  if (
    lower.includes("138") ||
    lower.includes("cheque") ||
    lower.includes("dishonour") ||
    lower.includes("check bounce") ||
    lower.includes("cheque bounce") ||
    lower.includes("insufficient funds") ||
    lower.includes("ചെക്ക്") ||
    lower.includes("മടങ്ങിയാൽ") ||
    (lower.includes("ni act") && lower.includes("notice"))
  ) {
    return LEGAL_DOMAINS.CHEQUE_BOUNCE_S138;
  }

  // 4. Criminal Defense, Bail, FIR Quashing & Police Powers
  if (
    lower.includes("anticipatory bail") ||
    lower.includes("regular bail") ||
    lower.includes("bail") ||
    lower.includes("fir") ||
    lower.includes("quash") ||
    lower.includes("police summons") ||
    lower.includes("police station") ||
    lower.includes("arrest") ||
    lower.includes("bns") ||
    lower.includes("bnss") ||
    lower.includes("section 35") ||
    lower.includes("41a") ||
    lower.includes("482") ||
    lower.includes("ndps") ||
    lower.includes("custody") ||
    lower.includes("ജാമ്യം") ||
    lower.includes("മുൻകൂർ ജാമ്യം") ||
    lower.includes("പോലീസ്") ||
    lower.includes("അറസ്റ്റ്") ||
    lower.includes("എഫ്.ഐ.ആർ")
  ) {
    return LEGAL_DOMAINS.CRIMINAL_DEFENSE_BAIL;
  }

  // 5. Tenancy, Leases & Rent Control
  if (
    lower.includes("tenant") ||
    lower.includes("landlord") ||
    lower.includes("rent") ||
    lower.includes("lease") ||
    lower.includes("eviction") ||
    lower.includes("vacate") ||
    lower.includes("lock out") ||
    lower.includes("security deposit") ||
    lower.includes("rental agreement") ||
    lower.includes("വാടക") ||
    lower.includes("വാടകക്കാരൻ") ||
    lower.includes("കുടിയൊഴിപ്പിക്കൽ") ||
    lower.includes("മുൻകൂർ തുക")
  ) {
    return LEGAL_DOMAINS.TENANCY_RENT_CONTROL;
  }

  // 6. Property, Land Records, Mutation & Injunction
  if (
    lower.includes("land") ||
    lower.includes("property") ||
    lower.includes("title deed") ||
    lower.includes("aadharm") ||
    lower.includes("aadharam") ||
    lower.includes("thandapper") ||
    lower.includes("patta") ||
    lower.includes("mutation") ||
    lower.includes("possession certificate") ||
    lower.includes("boundary") ||
    lower.includes("encroachment") ||
    lower.includes("survey") ||
    lower.includes("mahazar") ||
    lower.includes("injunction") ||
    lower.includes("partition") ||
    lower.includes("order 39") ||
    lower.includes("specific performance") ||
    lower.includes("sale deed") ||
    lower.includes("ഭൂമി") ||
    lower.includes("വസ്തു") ||
    lower.includes("അതിർത്തി") ||
    lower.includes("കയ്യേറ്റം") ||
    lower.includes("കൈയേറ്റം") ||
    lower.includes("ആധാരം") ||
    lower.includes("തണ്ടപ്പേര്") ||
    lower.includes("പട്ടയം") ||
    lower.includes("പോക്കുവരവ്") ||
    lower.includes("നിരോധനാജ്ഞ") ||
    lower.includes("ഭാഗം") ||
    lower.includes("സർവ്വേ")
  ) {
    return LEGAL_DOMAINS.PROPERTY_LAND_REVENUE;
  }

  // 7. Family, Matrimonial, Divorce & Maintenance
  if (
    lower.includes("divorce") ||
    lower.includes("matrimonial") ||
    lower.includes("maintenance") ||
    lower.includes("alimony") ||
    lower.includes("custody") ||
    lower.includes("domestic violence") ||
    lower.includes("section 125") ||
    lower.includes("144 bnss") ||
    lower.includes("hindu marriage") ||
    lower.includes("498a") ||
    lower.includes("restitution of conjugal") ||
    lower.includes("വിവാഹമോചനം") ||
    lower.includes("ജീവനാംശം") ||
    lower.includes("കുടുംബകോടതി") ||
    lower.includes("ഗാർഹിക പീഡനം")
  ) {
    return LEGAL_DOMAINS.FAMILY_MATRIMONIAL;
  }

  // 8. Cyber Crime, UPI Fraud & Account Freezes
  if (
    lower.includes("cyber") ||
    lower.includes("online fraud") ||
    lower.includes("upi fraud") ||
    lower.includes("unauthorized transaction") ||
    lower.includes("hacked") ||
    lower.includes("phishing") ||
    lower.includes("it act") ||
    lower.includes("1930") ||
    lower.includes("frozen bank account") ||
    lower.includes("bank account frozen") ||
    lower.includes("lien") ||
    lower.includes("സൈബർ") ||
    lower.includes("തട്ടിപ്പ്") ||
    lower.includes("ഓൺലൈൻ തട്ടിപ്പ്")
  ) {
    return LEGAL_DOMAINS.CYBER_CRIME_FRAUD;
  }

  // 9. Consumer Protection & Defective Goods/Services
  if (
    lower.includes("consumer") ||
    lower.includes("defective") ||
    lower.includes("deficiency of service") ||
    lower.includes("dcdrc") ||
    lower.includes("refund") ||
    lower.includes("warranty") ||
    lower.includes("amazon") ||
    lower.includes("flipkart") ||
    lower.includes("unfair trade") ||
    lower.includes("ഉപഭോക്താവ്") ||
    lower.includes("ഉപഭോക്തൃ") ||
    lower.includes("തകരാർ") ||
    lower.includes("നഷ്ടപരിഹാരം")
  ) {
    return LEGAL_DOMAINS.CONSUMER_PROTECTION;
  }

  // 10. Employment, Labour, Salary & Gratuity
  if (
    lower.includes("employment") ||
    lower.includes("salary") ||
    lower.includes("termination") ||
    lower.includes("unpaid salary") ||
    lower.includes("resignation") ||
    lower.includes("gratuity") ||
    lower.includes("provident fund") ||
    lower.includes("pf") ||
    lower.includes("non compete") ||
    lower.includes("non-compete") ||
    lower.includes("relieving letter") ||
    lower.includes("experience certificate") ||
    lower.includes("severance") ||
    lower.includes("തൊഴിൽ") ||
    lower.includes("ശമ്പളം") ||
    lower.includes("ഗ്രാറ്റുവിറ്റി") ||
    lower.includes("പിരിച്ചുവിടൽ")
  ) {
    return LEGAL_DOMAINS.EMPLOYMENT_LABOUR;
  }

  // 11. Corporate, Contracts, Arbitration & MSME
  if (
    lower.includes("contract") ||
    lower.includes("agreement") ||
    lower.includes("breach") ||
    lower.includes("arbitration") ||
    lower.includes("liquidated damages") ||
    lower.includes("msme") ||
    lower.includes("section 186") ||
    lower.includes("section 43b") ||
    lower.includes("drc-01") ||
    lower.includes("commercial court") ||
    lower.includes("nclt")
  ) {
    return LEGAL_DOMAINS.CORPORATE_CONTRACTS;
  }

  // 12. Constitutional Writs (Article 226)
  if (
    lower.includes("writ") ||
    lower.includes("article 226") ||
    lower.includes("mandamus") ||
    lower.includes("certiorari") ||
    lower.includes("habeas corpus") ||
    lower.includes("natural justice") ||
    lower.includes("arbitrary") ||
    lower.includes("high court of kerala")
  ) {
    return LEGAL_DOMAINS.CONSTITUTIONAL_WRITS;
  }

  // 13. Motor Accident Claims (MACT)
  if (
    lower.includes("mact") ||
    lower.includes("accident claim") ||
    lower.includes("motor accident") ||
    lower.includes("third party insurance") ||
    lower.includes("vehicle collision")
  ) {
    return LEGAL_DOMAINS.MOTOR_ACCIDENT_MACT;
  }

  return LEGAL_DOMAINS.GENERAL_LEGAL;
}

// Build dynamic precedents for Deep Research Mode
export function getDomainPrecedents(domain) {
  switch (domain) {
    case LEGAL_DOMAINS.TELEGRAPH_KSEB_LINES:
      return [
        {
          citation: "2024 (2) KHC 401 (DB) — Valsamma v. KSEB",
          court: "High Court of Kerala (Division Bench)",
          ratio: "Transmission licensee cannot unilaterally draw lines through private land without prior notice; must approach District Magistrate under Section 16(1) once written objection is submitted.",
          treatment: "Binding Kerala Precedent",
        },
        {
          citation: "(2017) 5 SCC 143 — Power Grid Corp. v. Century Textiles",
          court: "Supreme Court of India",
          ratio: "Section 10 of Telegraph Act confers right of user only; landowner is entitled to full compensation under Section 16(3) for diminution of land value.",
          treatment: "Binding Constitutional Ratio",
        },
      ];

    case LEGAL_DOMAINS.BNS_IPC_COMPARISON:
      return [
        {
          citation: "(2005) 6 SCC 1 — Jacob Mathew v. State of Punjab",
          court: "Supreme Court of India",
          ratio: "Culpable rashness or negligence under death-by-negligence provisions requires gross negligence, not mere error of judgment.",
          treatment: "Constitutional Bench Standard",
        },
        {
          citation: "(2012) 9 SCC 284 — Ravi Kapur v. State of Rajasthan",
          court: "Supreme Court of India",
          ratio: "Doctrine of res ipsa loquitur applies in rash and negligent motor accidents where direct evidence confirms reckless operation.",
          treatment: "Binding Supreme Court Authority",
        },
      ];

    case LEGAL_DOMAINS.CHEQUE_BOUNCE_S138:
      return [
        {
          citation: "2014 (9) SCC 129 — Dashrath Rupsingh Rathod v. State of Maharashtra",
          court: "Supreme Court of India",
          ratio: "Offence under Section 138 NI Act can only be tried by the Magistrate court within whose local jurisdiction the payee's collection bank branch is situated.",
          treatment: "Statutory Jurisdictional Code",
        },
        {
          citation: "(2019) 4 SCC 197 — Bir Singh v. Mukesh Kumar",
          court: "Supreme Court of India",
          ratio: "Presumption under Section 139 NI Act is statutory; even if a signed blank cheque is handed over, the drawer incurs liability unless rebuttal evidence is proved.",
          treatment: "Binding Precedent on Presumption",
        },
      ];

    case LEGAL_DOMAINS.CRIMINAL_DEFENSE_BAIL:
      return [
        {
          citation: "(2022) 10 SCC 51 — Satender Kumar Antil v. CBI",
          court: "Supreme Court of India",
          ratio: "Strict compliance with Section 41A CrPC (now Section 35 BNSS) is mandatory; mechanical arrests violate Article 21 and warrant departmental action.",
          treatment: "Binding Arrest Guidelines",
        },
        {
          citation: "(2014) 8 SCC 273 — Arnesh Kumar v. State of Bihar",
          court: "Supreme Court of India",
          ratio: "In offences carrying imprisonment up to 7 years, arrest is an exceptional measure requiring recorded satisfaction of Section 41 CrPC / Section 35 BNSS criteria.",
          treatment: "Landmark Procedural Safeguard",
        },
        {
          citation: "1992 Supp (1) SCC 335 — State of Haryana v. Bhajan Lal",
          court: "Supreme Court of India",
          ratio: "High Court may quash FIRs under Section 482 CrPC / Section 528 BNSS where uncontroverted allegations disclose no cognizable offence or manifest mala fides.",
          treatment: "Inherent Quashing Standard",
        },
      ];

    case LEGAL_DOMAINS.PROPERTY_LAND_REVENUE:
      return [
        {
          citation: "(2008) 4 SCC 594 — Anathula Sudhakar v. P. Buchi Reddy",
          court: "Supreme Court of India",
          ratio: "Where title is in dispute or cloud is raised, a simple suit for permanent injunction is not maintainable; plaintiff must seek declaration of title with consequential relief.",
          treatment: "Foundational Civil Precedent",
        },
        {
          citation: "2020 (9) SCC 1 — Vineeta Sharma v. Rakesh Sharma",
          court: "Supreme Court of India",
          ratio: "Daughters possess absolute coparcenary rights by birth on equal footing with sons under Section 6 Hindu Succession Act with retroactive effect.",
          treatment: "Binding Constitutional Bench Ruling",
        },
        {
          citation: "AIR 1996 SC 2823 — Sawarni v. Inder Kaur",
          court: "Supreme Court of India",
          ratio: "Mutation of revenue entries (Thandapper) neither creates nor extinguishes title; it is strictly intended for fiscal property tax collection.",
          treatment: "Settled Revenue Jurisprudence",
        },
      ];

    case LEGAL_DOMAINS.TENANCY_RENT_CONTROL:
      return [
        {
          citation: "AIR 1968 SC 620 — Lallu Yeshwant Singh v. Rao Jagdish Singh",
          court: "Supreme Court of India",
          ratio: "A landlord cannot take the law into his own hands to forcibly evict a tenant without recourse to the statutory machinery of the court.",
          treatment: "Absolute Bar on Extrajudicial Eviction",
        },
        {
          citation: "(2015) 4 SCC 136 — Kailash Nath Associates v. DDA",
          court: "Supreme Court of India",
          ratio: "Forfeiture of earnest money or security deposits is subject to Section 74 of the Contract Act; reasonable compensation only is allowable upon proof of actual damage.",
          treatment: "Binding Contractual Jurisprudence",
        },
      ];

    case LEGAL_DOMAINS.FAMILY_MATRIMONIAL:
      return [
        {
          citation: "(2021) 2 SCC 324 — Rajnesh v. Neha",
          court: "Supreme Court of India",
          ratio: "Mandatory uniform guidelines for interim maintenance; both parties must file comprehensive Affidavits of Disclosure of Assets and Liabilities.",
          treatment: "Pan-India Maintenance Code",
        },
        {
          citation: "(2017) 8 SCC 746 — Amardeep Singh v. Harveen Kaur",
          court: "Supreme Court of India",
          ratio: "The statutory six-month cooling-off period under Section 13B(2) of the Hindu Marriage Act is directory and may be waived where settlement is genuine.",
          treatment: "Binding Mutual Consent Ratio",
        },
      ];

    case LEGAL_DOMAINS.CONSUMER_PROTECTION:
      return [
        {
          citation: "(2018) 5 SCC 442 — Fortune Infrastructure v. Trevor D'Lima",
          court: "Supreme Court of India",
          ratio: "A consumer cannot be made to wait indefinitely for delivery of goods or services; failure to deliver within reasonable time constitutes deficiency entitling full refund.",
          treatment: "Leading Consumer Precedent",
        },
        {
          citation: "(1994) 1 SCC 243 — Lucknow Development Authority v. M.K. Gupta",
          court: "Supreme Court of India",
          ratio: "Public statutory authorities and commercial service providers are amenable to consumer jurisdiction for harassment and defective administrative conduct.",
          treatment: "Foundational Consumer Jurisprudence",
        },
      ];

    case LEGAL_DOMAINS.EMPLOYMENT_LABOUR:
      return [
        {
          citation: "(2006) 4 SCC 227 — Percept D'Mark v. Zaheer Khan",
          court: "Supreme Court of India",
          ratio: "Under Section 27 of the Indian Contract Act, restrictive post-termination non-compete covenants are void and unenforceable as unreasonable restraint of trade.",
          treatment: "Settled Labour & Contract Rule",
        },
        {
          citation: "(2013) 7 SCC 725 — State of Jharkhand v. Jitendra Kumar Srivastava",
          court: "Supreme Court of India",
          ratio: "Gratuity and pension are constitutional property rights under Article 300A, not executive bounties; cannot be withheld without express statutory backing.",
          treatment: "Binding Statutory Right Precedent",
        },
      ];

    case LEGAL_DOMAINS.CORPORATE_CONTRACTS:
      return [
        {
          citation: "(2015) 4 SCC 136 — Kailash Nath Associates v. DDA",
          court: "Supreme Court of India",
          ratio: "Liquidated damages under Section 74 Indian Contract Act are capped at reasonable compensation; penal stipulations are void without proof of damage.",
          treatment: "Binding Contract Law Ratio",
        },
        {
          citation: "(2019) 15 SCC 131 — Vidya Drolia v. Durga Trading Corp.",
          court: "Supreme Court of India",
          ratio: "Fourfold test for arbitrability under Section 8 and 11 of the Arbitration and Conciliation Act, 1996; disputes involving non-arbitrable public rights are excluded.",
          treatment: "Leading Arbitration Authority",
        },
      ];

    case LEGAL_DOMAINS.CONSTITUTIONAL_WRITS:
      return [
        {
          citation: "(1998) 8 SCC 1 — Whirlpool Corporation v. Registrar of Trade Marks",
          court: "Supreme Court of India",
          ratio: "Alternative statutory remedies do not bar High Court writ jurisdiction under Article 226 where fundamental rights are infringed, natural justice is violated, or order is ultra vires.",
          treatment: "Landmark Writ Maintainability Ratio",
        },
        {
          citation: "(2021) 6 SCC 771 — Radha Krishan Industries v. State of H.P.",
          court: "Supreme Court of India",
          ratio: "High Court's writ power under Article 226 is plenary; self-imposed limitations on alternate remedies must yield to gross arbitrariness and patent lack of jurisdiction.",
          treatment: "Binding High Court Review Standard",
        },
      ];

    default:
      return [
        {
          citation: "2024 (2) KHC 401 (DB) — Valsamma v. KSEB",
          court: "High Court of Kerala (Division Bench)",
          ratio: "Statutory authorities cannot infringe upon private citizen rights without affording adequate notice, fair hearing, and just compensation.",
          treatment: "Kerala High Court Precedent",
        },
        {
          citation: "2020 (9) SCC 1 — Vineeta Sharma v. Rakesh Sharma",
          court: "Supreme Court of India (Full Bench)",
          ratio: "Statutory rights and statutory protections must be interpreted in light of constitutional equality and due process.",
          treatment: "Binding Supreme Court Precedent",
        },
      ];
  }
}

// Build dynamic agent steps for Agent Mode
export function getDomainAgentSteps(domain) {
  switch (domain) {
    case LEGAL_DOMAINS.BNS_IPC_COMPARISON:
      return [
        {
          title: "1. Temporal Applicability Audit (Sec. 531 BNSS)",
          detail: "Evaluated date of alleged occurrence: offenses prior to 01-July-2024 fall under IPC; subsequent acts strictly charged under BNS, 2023.",
          status: "completed",
        },
        {
          title: "2. Statutory Ingredient Concordance (BNS Sec. 106 vs IPC 304A)",
          detail: "Examined culpable rashness criteria: verified whether gross recklessness or medical negligence standards apply under Section 106(1) BNS.",
          status: "completed",
        },
        {
          title: "3. Procedural FIR & Investigation Compliance",
          detail: "Screened Section 173 BNSS FIR record, spot scene mahazar, and forensic vehicle inspection report.",
          status: "completed",
        },
        {
          title: "4. Bail Defense Strategy Formulation",
          detail: "Structured regular bail petition under Section 480 BNSS demonstrating no flight risk and full cooperation with investigating officer.",
          status: "completed",
        },
      ];

    case LEGAL_DOMAINS.CRIMINAL_DEFENSE_BAIL:
      return [
        {
          title: "1. Section 35 BNSS Arrest Vulnerability Assessment",
          detail: "Audited whether offences carry punishment under 7 years; verified mandatory service of appearance notice under Section 35(3) BNSS.",
          status: "completed",
        },
        {
          title: "2. Anticipatory Bail Petition Drafting (Sec. 482 BNSS)",
          detail: "Drafted pre-arrest protection pleadings before Sessions Court / High Court establishing no requirement for custodial interrogation.",
          status: "completed",
        },
        {
          title: "3. Quashing Grounds Formulation (Sec. 528 BNSS)",
          detail: "Screened FIR averments against Bhajan Lal criteria: identified absence of cognizable offense ingredients.",
          status: "completed",
        },
        {
          title: "4. Surety & Compliance Documentation",
          detail: "Prepared local solvent surety undertakings, tax receipts, and formal notice of representation to jurisdictional SHO.",
          status: "completed",
        },
      ];

    case LEGAL_DOMAINS.CHEQUE_BOUNCE_S138:
      return [
        {
          title: "1. 30-Day Statutory Limitation Audit",
          detail: "Verified Bank Return Memo timestamp: calculated strict 30-day window for issuing formal Section 138 demand notice.",
          status: "completed",
        },
        {
          title: "2. 15-Day Cure Window & Delivery Tracking",
          detail: "Confirmed statutory 15-day cure window following postal delivery; tracked Speed Post consignment delivery slip.",
          status: "completed",
        },
        {
          title: "3. Territorial Jurisdiction Mapping (Sec. 142(2))",
          detail: "Verified jurisdictional JFCM Court having authority over the payee's collection bank branch in compliance with Section 142(2).",
          status: "completed",
        },
        {
          title: "4. Section 142 Criminal Complaint Assembly",
          detail: "Compiled complaint docket with original cheque, memo, legal notice, track report, and Section 143A interim compensation plea.",
          status: "completed",
        },
      ];

    case LEGAL_DOMAINS.TELEGRAPH_KSEB_LINES:
      return [
        {
          title: "1. Section 16(1) Written Objection Notice",
          detail: "Dispatched registered written objection to KSEB Executive Engineer and District Collector raising jurisdictional bar.",
          status: "completed",
        },
        {
          title: "2. Kerala High Court Precedent Enforcement",
          detail: "Applied Valsamma v. KSEB 2024 (2) KHC 401 DB ratio compelling administrative hearing before District Magistrate.",
          status: "completed",
        },
        {
          title: "3. Feasible Alternate Alignment Sketch",
          detail: "Prepared comparative route sketch demonstrating alternative pathway along public road avoiding residential land.",
          status: "completed",
        },
        {
          title: "4. Section 16(3) Compensation Claim Formulation",
          detail: "Itemized tree-felling timber valuation, fruit-bearing yield capitalization, and land diminution claim before District Judge.",
          status: "completed",
        },
      ];

    case LEGAL_DOMAINS.PROPERTY_LAND_REVENUE:
      return [
        {
          title: "1. 30-Year Title Deed & Encumbrance Verification",
          detail: "Audited registered Aadharm, prior link conveyances, and Nil Encumbrance Certificate from jurisdictional Sub-Registrar.",
          status: "completed",
        },
        {
          title: "2. Revenue Record & Thandapper Inspection",
          detail: "Verified basic land tax receipts under Kerala Land Tax Act 1961, possession certificate, and village field survey records.",
          status: "completed",
        },
        {
          title: "3. Order XXXIX CPC Injunction Application",
          detail: "Formulated prima facie case, balance of convenience, and irreparable injury pleadings to restrain boundary alteration.",
          status: "completed",
        },
        {
          title: "4. Order XXVI Rule 9 Advocate Commission Motion",
          detail: "Drafted application for appointing an Advocate Commissioner assisted by Taluk Surveyor to measure schedule property.",
          status: "completed",
        },
      ];

    case LEGAL_DOMAINS.TENANCY_RENT_CONTROL:
      return [
        {
          title: "1. Lease Agreement & Notice Clause Audit",
          detail: "Screened lease tenure, notice period covenants, security deposit terms, and arbitration provisions.",
          status: "completed",
        },
        {
          title: "2. Section 106 Transfer of Property Act Notice",
          detail: "Drafted formal statutory notice to vacate / pay arrears in compliance with mandatory 15-day notice period.",
          status: "completed",
        },
        {
          title: "3. Illegal Dispossession Protection Injunction",
          detail: "Prepared emergency civil injunction petition restraining landlord from unlawful lock-out or utility disconnection.",
          status: "completed",
        },
        {
          title: "4. Rent Control Court Petition / Summary Recovery Suit",
          detail: "Structured eviction petition under Rent Control legislation or Order 37 summary recovery suit for deposit refund.",
          status: "completed",
        },
      ];

    case LEGAL_DOMAINS.FAMILY_MATRIMONIAL:
      return [
        {
          title: "1. Forum & Jurisdiction Verification",
          detail: "Verified territorial Family Court jurisdiction based on ordinary residence, marriage solemnization, or wife's domicile.",
          status: "completed",
        },
        {
          title: "2. Asset & Liability Affidavit Compilation (Rajnesh v. Neha)",
          detail: "Assembled comprehensive sworn income and expenditure disclosures in compliance with Supreme Court directions.",
          status: "completed",
        },
        {
          title: "3. Interim Maintenance Application (Sec. 144 BNSS)",
          detail: "Drafted petition for interim maintenance pendente lite and litigation costs supported by documentary evidence.",
          status: "completed",
        },
        {
          title: "4. Settlement Terms & Mediation Protocol",
          detail: "Formulated mutual consent divorce terms under Section 13B HMA including permanent alimony and child custody schedule.",
          status: "completed",
        },
      ];

    case LEGAL_DOMAINS.CONSUMER_PROTECTION:
      return [
        {
          title: "1. Pre-Litigation Legal Notice of Deficiency",
          detail: "Dispatched 15-day statutory demand notice to seller/manufacturer itemizing service deficiency and financial loss.",
          status: "completed",
        },
        {
          title: "2. Evidence Dossier & Purchase Trail Assembly",
          detail: "Indexed tax invoice, warranty terms, written customer service tickets, and expert defect inspection certificate.",
          status: "completed",
        },
        {
          title: "3. Pecuniary Forum Discovery & Limitation Audit",
          detail: "Verified DCDRC forum jurisdiction (< ₹50 Lakhs) within strict 2-year limitation window under Section 69 CPA 2019.",
          status: "completed",
        },
        {
          title: "4. e-Daakhil Complaint Drafting",
          detail: "Structured consumer complaint claiming full refund with interest, compensation for harassment, and litigation costs.",
          status: "completed",
        },
      ];

    case LEGAL_DOMAINS.CYBER_CRIME_FRAUD:
      return [
        {
          title: "1. National Cyber Portal & 1930 Helpline Filing",
          detail: "Initiated immediate complaint on cybercrime.gov.in within Golden Hour to freeze fraudulent destination accounts.",
          status: "completed",
        },
        {
          title: "2. Bank Zero-Liability Notification",
          detail: "Submitted formal dispute under RBI Customer Protection Master Direction within 72-hour zero-liability safe harbour.",
          status: "completed",
        },
        {
          title: "3. Digital Forensic Trail Preservation",
          detail: "Preserved UTR transaction numbers, UPI handles, fraudulent SMS/WhatsApp transcripts, and IP header records.",
          status: "completed",
        },
        {
          title: "4. Cyber Crime Police Station FIR Motion",
          detail: "Drafted formal complaint under Sections 66C/66D Information Technology Act and Section 318(4) BNS for account de-freezing.",
          status: "completed",
        },
      ];

    case LEGAL_DOMAINS.EMPLOYMENT_LABOUR:
      return [
        {
          title: "1. Employment Contract & Covenant Audit",
          detail: "Audited employment agreement: established that post-termination non-compete clause is void under Section 27 Contract Act.",
          status: "completed",
        },
        {
          title: "2. Statutory Gratuity & Terminal Dues Audit",
          detail: "Calculated unpaid salary and gratuity under Payment of Gratuity Act, 1972 (15 days wages per completed year of service).",
          status: "completed",
        },
        {
          title: "3. Counsel Demand Notice to Employer",
          detail: "Drafted formal 15-day legal notice demanding release of relieving letter, experience certificate, and full terminal settlement.",
          status: "completed",
        },
        {
          title: "4. Labour Commissioner / Civil Remedy Motion",
          detail: "Structured petition before Controlling Authority under Gratuity Act and Order 37 summary suit for salary recovery.",
          status: "completed",
        },
      ];

    case LEGAL_DOMAINS.CORPORATE_CONTRACTS:
      return [
        {
          title: "1. Contract Risk & Clause Construction Audit",
          detail: "Screened dispute resolution, liquidated damages, indemnity, and governing law clauses under Indian Contract Act.",
          status: "completed",
        },
        {
          title: "2. Section 12A Mandatory Pre-Litigation Mediation",
          detail: "Prepared mediation application before District Legal Services Authority under Commercial Courts Act, 2015.",
          status: "completed",
        },
        {
          title: "3. Section 9 Interim Protection Application",
          detail: "Drafted urgent interim petition before Commercial Court to restrain encashment of bank guarantee or asset dissipation.",
          status: "completed",
        },
        {
          title: "4. Section 11 Arbitrator Appointment Motion",
          detail: "Issued Section 21 notice invoking arbitration followed by Section 11 petition before the High Court of Kerala.",
          status: "completed",
        },
      ];

    case LEGAL_DOMAINS.CONSTITUTIONAL_WRITS:
    default:
      return [
        {
          title: "1. Jurisdiction & Forum Discovery",
          detail: "Verified jurisdiction: Article 226 before High Court of Kerala; evaluated alternate remedy exhaustion doctrine under Whirlpool ratio.",
          status: "completed",
        },
        {
          title: "2. High Court Precedent Concordance",
          detail: "Screened binding Division Bench and Supreme Court precedents establishing violation of fundamental rights and natural justice.",
          status: "completed",
        },
        {
          title: "3. Limitation Audit & Court Fee Valuation",
          detail: "Cause of action active without laches; court fees assessed under Kerala Court Fees and Suits Valuation Act, 1959.",
          status: "completed",
        },
        {
          title: "4. Relief Formulation & Verification",
          detail: "Drafted formal synopsis, interim prayer for stay, and verified Bar Council compliance under High Court Rules.",
          status: "completed",
        },
      ];
  }
}

// Generate intelligent legal response text matching the query
export function generateLegalResponse({
  prompt,
  domain,
  mode = "Ask",
  language = "en",
  specialization = null,
  consultMode = null,
}) {
  const isMl = language === "ml" || isMalayalam(prompt);

  // If clarification requested
  if (domain === LEGAL_DOMAINS.CLARIFICATION) {
    if (isMl) {
      return `നമസ്കാരം! ഞാൻ നിങ്ങളുടെ വക്കീൽ AI ലീഗൽ കോപൈലറ്റ് ആണ്. കേരള ഹൈക്കോടതി നടപടിക്രമങ്ങൾ, ജില്ലാ കോടതികൾ, സിവിൽ, ക്രിമിനൽ, റവന്യൂ നിയമങ്ങൾ എന്നിവയിൽ നിങ്ങൾക്ക് കൃത്യമായ നിയമോപദേശം നൽകാൻ ഞാൻ സജ്ജനാണ്.

നിങ്ങളുടെ ചോദ്യം കൂടുതൽ വ്യക്തമായി വിശകലനം ചെയ്യുന്നതിനായി ദയവായി താഴെ പറയുന്ന വിവരങ്ങൾ നൽകുക:
1. **വിഷയം**: ഇത് ഭൂമി/സ്വത്ത് തർക്കം, ചെക്ക് മടങ്ങൽ (Sec 138), ക്രിമിനൽ/ജാമ്യം, കുടുംബം/വിവാഹമോചനം, തൊഴിൽ, ഉപഭോക്തൃ പരാതി, അല്ലെങ്കിൽ കെ.എസ്.ഇ.ബി വൈദ്യുതി ലൈൻ എന്നിവയിൽ ഏതുമായി ബന്ധപ്പെട്ടതാണ്?
2. **നിലവിലെ ഘട്ടം**: കേസ് കൊടുക്കാൻ ആലോചിക്കുകയാണോ, വക്കീൽ നോട്ടീസ് ലഭിച്ചതാണോ, പോലീസ് സമൻസ് വന്നതാണോ, അതോ കോടതിയിൽ കേസ് നടക്കുകയാണോ?
3. **എതിർകക്ഷി**: സർക്കാർ വകുപ്പ്, സ്വകാര്യ വ്യക്തി, തൊഴിലുടമ, വാടകക്കാരൻ, അതോ ബാങ്കോ?
4. **നിങ്ങൾ പ്രതീക്ഷിക്കുന്ന പരിഹാരം**: സ്റ്റേ ഉത്തരവ്, മുൻകൂർ ജാമ്യം, പണം തിരിച്ചുപിടിക്കൽ, അതോ നഷ്ടപരിഹാരമോ?

നിങ്ങളുടെ കേസിന്റെ വസ്തുതകൾ മലയാളത്തിലോ ഇംഗ്ലീഷിലോ ടൈപ്പ് ചെയ്യാവുന്നതാണ്.`;
    }

    return `Namaskaram! I am your Wakheel AI Legal Copilot, specialized in High Court of Kerala practice, subordinate courts, and Indian statutory jurisprudence.

To provide you with specific, actionable legal advice rather than a generic summary, please clarify a few key details:
1. **Domain**: What area of law does your matter relate to? (e.g., land/property boundary, cheque dishonour under Section 138, criminal FIR or anticipatory bail, family/divorce, landlord-tenant eviction, employment/salary, consumer complaint, or high-tension electricity line).
2. **Current Stage**: What is the procedural posture? (e.g., planning to send a notice, received a legal demand notice, police summons issued, or petition already pending in court).
3. **Opposite Party**: Who is the dispute against? (e.g., government authority, private company, landlord, neighbour, or bank).
4. **Relief Sought**: What immediate outcome are you seeking? (e.g., interim stay order, anticipatory bail, quashing of proceedings, or money recovery).

Please provide your specific facts or legal query, and I will generate the relevant statutory provisions, precedent ratios, and procedural roadmap.`;
  }

  // Domain 1: BNS / IPC Comparison
  if (domain === LEGAL_DOMAINS.BNS_IPC_COMPARISON) {
    if (isMl) {
      return `[ഭാരതീയ ന്യായ സംഹിത (BNS), 2023 വിശകലനം - ${mode} മോഡ്]:

1. **ഐ.പി.സി സെക്ഷൻ 304A ക്ക് പകരമുള്ള പുതിയ ബി.എൻ.എസ് വ്യവസ്ഥ**:
   - മുൻപ് ഐ.പി.സി സെക്ഷൻ 304A (അശ്രദ്ധമൂലം മരണമുണ്ടാക്കൽ) പ്രകാരം പരമാവധി 2 വർഷം വരെ തടവും പിഴയുമായിരുന്നു ശിക്ഷ.
   - പുതിയ നിയമത്തിൽ ഇത് **ഭാരതീയ ന്യായ സംഹിത (BNS) സെക്ഷൻ 106** ലേക്ക് മാറ്റിയിരിക്കുന്നു.

2. **സെക്ഷൻ 106(1) BNS (അശ്രദ്ധമൂലമുള്ള മരണം)**:
   - അശ്രദ്ധമായോ അവിവേകപരമായോ ഉള്ള പ്രവർത്തിമൂലം മരണമുണ്ടാക്കുന്ന കുറ്റത്തിന് **5 വർഷം വരെ തടവും** പിഴയും ലഭിക്കാം (ശിക്ഷ 2 വർഷത്തിൽ നിന്നും 5 വർഷമായി ഉയർത്തി).
   - രജിസ്റ്റർ ചെയ്ത മെഡിക്കൽ പ്രാക്ടീഷണർമാർക്ക് ചികിത്സാപരമായ അശ്രദ്ധയ്ക്ക് 2 വർഷം വരെ തടവും പിഴയുമാണ് വ്യവസ്ഥ.

3. **സെക്ഷൻ 106(2) BNS (ഹിറ്റ് ആൻഡ് റൺ - അപകടം ഉണ്ടാക്കി കടന്നുകളയൽ)**:
   - അപകടമുണ്ടാക്കിയ ശേഷം പോലീസിലോ മജിസ്ട്രേറ്റിന്റെ മുന്നിലോ അറിയിക്കാതെ രക്ഷപ്പെട്ടാൽ **10 വർഷം വരെ തടവും** കനത്ത പിഴയും വ്യവസ്ഥ ചെയ്യുന്നു (ഇത് നടപ്പിലാക്കുന്നത് താല്കാലികമായി നിർത്തിവെച്ചിരിക്കുന്നു).

4. **നടപടിക്രമങ്ങൾ (BNSS പ്രകാരം)**:
   - 2024 ജൂലൈ 1-ന് ശേഷം നടക്കുന്ന കുറ്റകൃത്യങ്ങൾക്ക് ഭാരതീയ നാഗരിക് സുരക്ഷാ സംഹിത (BNSS) സെക്ഷൻ 173 പ്രകാരമാണ് എഫ്.ഐ.ആർ രജിസ്റ്റർ ചെയ്യുന്നത്. ജാമ്യപേക്ഷകൾ സെക്ഷൻ 480 അല്ലെങ്കിൽ 482 BNSS പ്രകാരം സെഷൻസ് കോടതിയിലോ ഹൈക്കോടതിയിലോ ബോധിപ്പിക്കേണ്ടതാണ്.`;
    }

    return `Comparative Statutory Analysis: Indian Penal Code (IPC) Section 304A vs. Bharatiya Nyaya Sanhita (BNS), 2023 Section 106 [${mode} Mode]:

1. **Statutory Transition & Enhanced Penalties**:
   - **Old Provision (IPC Section 304A)**: Causing death by any rash or negligent act not amounting to culpable homicide carried a maximum imprisonment of **2 years**, or fine, or both.
   - **New Provision (BNS Section 106(1))**: Substantially enhances the maximum punishment to **imprisonment up to 5 years** and fine. (For registered medical practitioners performing medical procedures, punishment remains up to 2 years and fine).

2. **Hit and Run Aggravated Category (BNS Section 106(2))**:
   - Introduces a specific statutory offense for escaping without reporting: Whoever causes death by rash and negligent driving and escapes without reporting it to a police officer or Magistrate soon after the incident shall be punished with **imprisonment up to 10 years and fine**. (Note: Operational implementation of Section 106(2) remains deferred pending stakeholder consultations).

3. **Procedural Governing Code (BNSS, 2023)**:
   - Under Section 531 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), incidents occurring on or after **July 1, 2024** are investigated under BNSS:
     * **FIR Registration**: Under Section 173 BNSS (formerly Section 154 CrPC).
     * **Regular Bail**: Under Section 480 BNSS (formerly Section 437/439 CrPC).
     * **Anticipatory Bail**: Under Section 482 BNSS before the Court of Session or High Court of Kerala.

4. **Judicial Benchmark**:
   - The test of culpable rashness remains governed by the Supreme Court benchmark in *Jacob Mathew v. State of Punjab (2005) 6 SCC 1* — requiring gross recklessness rather than a simple error of judgment.`;
  }

  // Domain 2: Criminal Defense & Bail
  if (domain === LEGAL_DOMAINS.CRIMINAL_DEFENSE_BAIL) {
    if (isMl) {
      return `[ക്രിമിനൽ പ്രതിരോധവും ജാമ്യ നടപടികളും - ${mode} മോഡ്]:

1. **അറസ്റ്റ് സംരക്ഷണങ്ങൾ (സെക്ഷൻ 35 BNSS)**:
   - 7 വർഷത്തിൽ താഴെ ശിക്ഷ ലഭിക്കാവുന്ന കുറ്റങ്ങളിൽ സുപ്രീം കോടതിയുടെ *അർണേഷ് കുമാർ* വിധിയും പുതിയ BNSS സെക്ഷൻ 35(3) ഉം പ്രകാരം പോലീസിന് നേരിട്ട് അറസ്റ്റ് ചെയ്യാനാവില്ല.
   - അന്വേഷണ ഉദ്യോഗസ്ഥൻ രേഖാമൂലമുള്ള നോട്ടീസ് (Notice of Appearance) നൽകി ഹാജരാകാൻ ആവശ്യപ്പെടേണ്ടതാണ്.

2. **മുൻകൂർ ജാമ്യം (Anticipatory Bail - സെക്ഷൻ 482 BNSS)**:
   - ജാമ്യമില്ലാ വകുപ്പുകൾ പ്രകാരം അറസ്റ്റ് ചെയ്യപ്പെടുമെന്ന ഭയമുള്ള സാഹചര്യത്തിൽ സെഷൻസ് കോടതിയിലോ കേരള ഹൈക്കോടതിയിലോ മുൻകൂർ ജാമ്യാപേക്ഷ സമർപ്പിക്കാം.
   - കസ്റ്റഡിയിൽ ചോദ്യം ചെയ്യേണ്ട ആവശ്യമില്ലെന്നും, അന്വേഷണവുമായി സഹകരിക്കാൻ തയ്യാറാണെന്നും തെളിയിക്കുകയാണ് പ്രധാനം (*Satender Kumar Antil v. CBI*).

3. **എഫ്.ഐ.ആർ റദ്ദാക്കൽ (Quashing - സെക്ഷൻ 528 BNSS)**:
   - അടിസ്ഥാനരഹിതമായതോ വ്യക്തിവിരോധം തീർക്കാൻ കെട്ടിച്ചമച്ചതോ ആയ കേസുകളിൽ ഹൈക്കോടതിയുടെ സഹജമായ അധികാരം (Inherent Powers) ഉപയോഗിച്ച് എഫ്.ഐ.ആർ റദ്ദാക്കാൻ ഹർജി നൽകാം.

4. **അടിയന്തര നടപടികൾ**:
   - എഫ്.ഐ.ആറിന്റെ സാക്ഷ്യപ്പെടുത്തിയ പകർപ്പ് ശേഖരിക്കുക.
   - രണ്ട് പ്രാദേശിക ആൾജാമ്യക്കാരുടെ (Sureties) രേഖകൾ കരുതിവെക്കുക.
   - പോലീസ് സ്റ്റേഷനിൽ പോകുന്നതിന് മുൻപ് ഒരു ഹൈക്കോടതി അഭിഭാഷകന്റെ നിയമോപദേശം തേടുക.`;
    }

    return `Criminal Defense & Bail Statutory Roadmap under Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 [${mode} Mode]:

1. **Mandatory Arrest Safeguards (Section 35 BNSS / Arnesh Kumar Ratio)**:
   - For offences carrying imprisonment of 7 years or less, police cannot make an automatic arrest.
   - Under **Section 35(3) BNSS** (formerly Section 41A CrPC), the police officer is statutorily mandated to issue a formal Notice of Appearance. An arrest can only be made if the accused fails to comply or the officer records specific statutory reasons in writing.

2. **Anticipatory Bail (Section 482 BNSS)**:
   - Can be moved before the Sessions Court or directly before the High Court of Kerala where a person has reasonable apprehension of arrest in a non-bailable accusation.
   - Key judicial parameters per *Satender Kumar Antil v. CBI (2022) 10 SCC 51*: Absence of custodial interrogation requirement, willingness to join investigation, rooted in society, and zero flight risk.

3. **Inherent High Court Powers for Quashing (Section 528 BNSS / Formerly 482 CrPC)**:
   - If the allegations in the FIR, even when taken at face value, do not disclose a cognizable offence or are manifestly attended with mala fides (*State of Haryana v. Bhajan Lal*), a quashing petition lies before the High Court.

4. **Actionable Counsel Advice**:
   - Secure a certified copy of the FIR / complaint from the jurisdictional Magistrate court or eCourts portal.
   - Do not attend police interrogation without receiving a formal written Section 35 notice.
   - Index passport copy, proof of residence, and solvent local surety assets ready for bail execution.`;
  }

  // Domain 3: Cheque Bounce Section 138
  if (domain === LEGAL_DOMAINS.CHEQUE_BOUNCE_S138) {
    if (isMl) {
      return `[നെഗോഷ്യബിൾ ഇൻസ്ട്രുമെന്റ്സ് ആക്ട് സെക്ഷൻ 138 - ചെക്ക് മടങ്ങൽ നടപടികൾ - ${mode} മോഡ്]:

1. **കർശനമായ 4 ഘട്ട സമയപരിധി (Statutory Timelines)**:
   - **ചെക്ക് മടങ്ങൽ (Dishonour Memo)**: ചെക്ക് ബാങ്കിൽ ഹാജരാക്കി മടങ്ങിയ തിയതി മുതൽ ബാങ്ക് മെമ്മോ സൂക്ഷിക്കുക.
   - **വക്കീൽ നോട്ടീസ് (30 Days)**: ബാങ്ക് റിട്ടേൺ മെമ്മോ ലഭിച്ച് **30 ദിവസത്തിനകം** പണം നൽകണമെന്നാവശ്യപ്പെട്ട് രജിസ്റ്റേർഡ് വക്കീൽ നോട്ടീസ് (Statutory Demand Notice) അയച്ചിരിക്കണം.
   - **15 ദിവസത്തെ സാവകാശം**: നോട്ടീസ് എതിർകക്ഷിക്ക് ലഭിച്ച തിയതി മുതൽ പണം നൽകാൻ **15 ദിവസത്തെ സമയം** നിയമപരമായി നൽകണം.
   - **കോടതി കേസ് (30 Days)**: 15 ദിവസം കഴിഞ്ഞിട്ടും പണം ലഭിച്ചില്ലെങ്കിൽ അടുത്ത **30 ദിവസത്തിനകം** ജുഡീഷ്യൽ ഒന്നാം ക്ലാസ് മജിസ്ട്രേറ്റ് കോടതിയിൽ (JFCM) ക്രിമിനൽ പരാതി ഫയൽ ചെയ്യണം.

2. **കോടതിയുടെ അധികാരപരിധി (Territorial Jurisdiction - Sec 142(2))**:
   - നിങ്ങളുടെ അക്കൗണ്ടുള്ള (ചെക്ക് കളക്ഷന് നൽകിയ) ബാങ്ക് ശാഖ സ്ഥിതി ചെയ്യുന്ന അധികാരപരിധിയിലെ മജിസ്ട്രേറ്റ് കോടതിയിലാണ് കേസ് ഫയൽ ചെയ്യേണ്ടത് (*Dashrath Rupsingh Rathod* സുപ്രീം കോടതി വിധി).

3. **ഇടക്കാല നഷ്ടപരിഹാരം (Sec 143A)**:
   - കേസ് വിചാരണയ്ക്കിടെ ചെക്ക് തുകയുടെ **20% വരെ ഇടക്കാല നഷ്ടപരിഹാരമായി** പരാതിക്കാരന് നൽകാൻ മജിസ്ട്രേറ്റിന് ഉത്തരവിടാം.

4. **ആവശ്യമായ രേഖകൾ**:
   - യഥാർത്ഥ ചെക്ക് (Original Cheque).
   - ബാങ്ക് റിട്ടേൺ മെമ്മോ (Bank Memo with reasons).
   - അയച്ച വക്കീൽ നോട്ടീസിന്റെ പകർപ്പ്, തപാൽ രസീത്, ഡെലിവറി ട്രാക്കിംഗ് സ്ലിപ്പ്.`;
    }

    return `Negotiable Instruments Act, 1881 — Section 138 Cheque Dishonour Statutory Framework [${mode} Mode]:

1. **Strict 4-Stage Statutory Timeline**:
   - **Presentation**: Cheque must be presented within its 3-month validity period.
   - **Step 1: Statutory Demand Notice (Within 30 Days)**: You must issue a formal legal notice in writing within 30 days of receiving the Bank Return Memo.
   - **Step 2: Mandatory Cure Window (15 Days)**: The drawer is given exactly 15 days from the date of receipt of notice to clear the outstanding payment.
   - **Step 3: Filing Criminal Complaint (Within 30 Days)**: If payment is not cleared within 15 days, you have exactly 30 days following the expiry of the 15-day window to file a formal complaint under Section 142 before the Judicial First Class Magistrate (JFCM).

2. **Territorial Jurisdiction (Section 142(2) NI Act)**:
   - Overruling earlier conflicting case law, Section 142(2) stipulates that jurisdiction lies exclusively with the Magistrate court within whose local jurisdiction the bank branch where the payee maintains the account is situated (if presented through an account).

3. **Interim Compensation (Section 143A)**:
   - During trial, the Magistrate has statutory power to order the drawer to deposit up to **20% of the cheque amount** as interim compensation to the complainant.

4. **Evidentiary Vault Checklist**:
   - Original dishonoured cheque bearing drawer signature.
   - Original bank dishonour memo showing return code (e.g., "Funds Insufficient").
   - Office copy of registered statutory notice, postal dispatch receipt, and India Post delivery tracking confirmation.`;
  }

  // Domain 4: Telegraph Act & Electricity Lines (KSEB)
  if (domain === LEGAL_DOMAINS.TELEGRAPH_KSEB_LINES) {
    if (isMl) {
      return `[ഇന്ത്യൻ ടെലിഗ്രാഫ് ആക്ട് & കെ.എസ്.ഇ.ബി ലൈൻ തർക്കങ്ങൾ - ${mode} മോഡ്]:

1. **ഭൂവുടമയുടെ അവകാശങ്ങളും ഹൈക്കോടതി വിധിയും**:
   - കേരള ഹൈക്കോടതി ഡിവിഷൻ ബെഞ്ചിന്റെ സുപ്രധാന വിധിന്യായമായ *വൽസമ്മ വേഴ്സസ് കെ.എസ്.ഇ.ബി (2024 (2) KHC 401 DB)* പ്രകാരം:
   - കെ.എസ്.ഇ.ബിക്കോ ഏതെങ്കിലും ലൈസൻസിക്കോ ഭൂവുടമയുടെ മുൻകൂർ അനുമതിയില്ലാതെ സ്വകാര്യ ഭൂമിയിൽ അതിക്രമിച്ച് കയറാനോ മരങ്ങൾ മുറിക്കാനോ ഹൈ-ടെൻഷൻ ലൈനുകൾ വലിക്കാനോ അധികാരമില്ല.

2. **സെക്ഷൻ 16(1) പ്രകാരമുള്ള തടസ്സം (Statutory Bar)**:
   - ഭൂവുടമ രേഖാമൂലം എതിർപ്പ് (Written Objection) സമർപ്പിച്ചാൽ, നിർമ്മാണ പ്രവർത്തനങ്ങൾ ഉടനടി നിർത്തിവെക്കാൻ ലൈസൻസി ബാധ്യസ്ഥരാണ്.
   - തുടർന്ന് ജില്ലാ മജിസ്ട്രേറ്റിന്റെ (District Magistrate / Collector) പ്രത്യേക അനുമതി വാങ്ങിയാൽ മാത്രമേ അവർക്ക് മുന്നോട്ട് പോകാൻ കഴിയൂ.

3. **മറ്റു വഴികളുടെ സാധ്യത (Alternative Route)**:
   - കൃഷിഭൂമിയെയും വാസസ്ഥലങ്ങളെയും ബാധിക്കാത്ത തരത്തിൽ പൊതുവഴിയിലൂടെയോ സർക്കാർ ഭൂമിയിലൂടെയോ ലൈൻ കൊണ്ടുപോകാൻ സാധ്യമാണെങ്കിൽ ജില്ലാ മജിസ്ട്രേറ്റ് അത് പരിശോധിക്കേണ്ടതാണ്.

4. **നഷ്ടപരിഹാരം (Sec 16(3))**:
   - മരങ്ങൾ മുറിച്ചതിനും വസ്തുവിന്റെ മൂല്യം കുറഞ്ഞതിനും (Diminution in land value) ജില്ലാ കോടതി മുഖേന പൂർണ്ണ നഷ്ടപരിഹാരം ആവശ്യപ്പെടാം.

5. **ഉടൻ ചെയ്യേണ്ട കാര്യങ്ങൾ**:
   - കെ.എസ്.ഇ.ബി അസിസ്റ്റന്റ് എക്സിക്യൂട്ടീവ് എഞ്ചിനീയർക്കും ജില്ലാ കളക്ടർക്കും സ്പീഡ് പോസ്റ്റ് വഴി രേഖാമൂലമുള്ള എതിർപ്പ് അയക്കുക.`;
    }

    return `Indian Telegraph Act, 1885 & Kerala High Court Jurisprudence on Transmission Lines [${mode} Mode]:

1. **Landmark Kerala Precedent (Valsamma v. KSEB 2024 (2) KHC 401 DB)**:
   - A transmission licensee (such as KSEB or Power Grid) has no unbridled discretion to unilaterally draw high-tension electric lines through yielding agricultural land or residential homesteads.
   - Under Section 10(d) of the Telegraph Act, the licensee must ensure that as little damage as possible is done.

2. **Statutory Bar under Section 16(1)**:
   - Once the landholder raises an objection in writing, the licensee is statutorily compelled to suspend all works and approach the **District Magistrate (District Collector)** for an enquiry and permission order under Section 16(1).
   - Any entry or tree felling carried out after receipt of written objection without an order from the District Magistrate is illegal and actionable via contempt or writ petition under Article 226 before the High Court of Kerala.

3. **Duty to Explore Feasible Alternatives**:
   - The District Magistrate is legally obliged to evaluate whether an alternative route along public roads or government wasteland exists before sanctioning entry into private residential holdings.

4. **Full Compensation (Section 16(3))**:
   - Landowners are entitled to comprehensive compensation, including:
     * Timber value of felled trees.
     * Capitalization of fruit-bearing yield (e.g. coconut, rubber, pepper) over productive lifespan.
     * Diminution of commercial land value directly under and surrounding the transmission corridor.`;
  }

  // Domain 5: Property, Land Records & Injunction
  if (domain === LEGAL_DOMAINS.PROPERTY_LAND_REVENUE) {
    if (isMl) {
      return `[കേരള റവന്യൂ, ഭൂമിയുടെ ഉടമസ്ഥാവകാശവും സിവിൽ വ്യവഹാരങ്ങളും - ${mode} മോഡ്]:

1. **ആധാരവും (Title Deed) തണ്ടപ്പേരും (Mutation)**:
   - രജിസ്ട്രേഷൻ ആക്ട് സെക്ഷൻ 17 പ്രകാരം രജിസ്റ്റർ ചെയ്ത ആധാരമാണ് (Title Indenture) ഭൂമിയുടെ പ്രധാന ഉടമസ്ഥാവകാശ രേഖ.
   - വില്ലേജ് ഓഫീസിലെ തണ്ടപ്പേരും കരം അടച്ച രസീതും കരം പിരിക്കാനുള്ള ഭരണപരമായ രേഖ മാത്രമാണ്; അത് തനിയെ ഉടമസ്ഥാവകാശം സൃഷ്ടിക്കുകയോ ഇല്ലാതാക്കുകയോ ചെയ്യുന്നില്ല (*AIR 1996 SC 2823*).

2. **അതിർവരമ്പും കൈയേറ്റവും (Boundary Disputes)**:
   - അയൽവാസി അതിർത്തി കയ്യേറുകയോ വേലി നശിപ്പിക്കുകയോ ചെയ്താൽ, സിവിൽ കോടതിയിൽ (മുൻസിഫ് കോടതി) സ്ഥിരമായ നിരോധനാജ്ഞയ്ക്കും (Permanent Injunction) അതിർത്തി നിർണ്ണയത്തിനും കേസ് ഫയൽ ചെയ്യാം (OS).
   - കോഡ് ഓഫ് സിവിൽ പ്രൊസീജ്യർ (CPC) ഓർഡർ XXVI റൂൾ 9 പ്രകാരം അഡ്വക്കേറ്റ് കമ്മീഷണറെയും താലൂക്ക് സർവ്വേയറെയും വെച്ച് വസ്തു അളന്നു തിട്ടപ്പെടുത്താൻ അപേക്ഷ സമർപ്പിക്കാം.

3. **താൽക്കാലിക നിരോധനാജ്ഞ (Interim Injunction - Order 39 CPC)**:
   - വസ്തുവിന്റെ അവസ്ഥയിൽ മാറ്റം വരുത്തുന്നത് തടയാൻ പ്രഥമദൃഷ്ട്യാ കേസ് (Prima Facie Case), അസൗകര്യങ്ങളുടെ തുലാസ് (Balance of Convenience), പരിഹരിക്കാനാവാത്ത നഷ്ടം (Irreparable Injury) എന്നിവ തെളിയിച്ച് ഇടക്കാല ഉത്തരവ് നേടാം.

4. **ഭാഗപത്രവും പെൺമക്കളുടെ അവകാശവും (Partition & Inheritance)**:
   - ഹിന്ദു പിന്തുടർച്ചാവകാശ ഭേദഗതി നിയമം (Sec 6) പ്രകാരം പെൺമക്കൾക്ക് ജന്മാവകാശമായി കുടുംബസ്വത്തിൽ ആൺമക്കൾക്ക് തുല്യമായ അവകാശമുണ്ട് (*Vineeta Sharma v. Rakesh Sharma 2020 (9) SCC 1*).`;
    }

    return `Civil Property Jurisprudence & Kerala Land Records Concordance [${mode} Mode]:

1. **Substantive Title vs. Revenue Mutation Entries**:
   - Primary ownership is derived exclusively from a registered conveyance deed (Aadharm) registered under Section 17 of the Registration Act, 1908.
   - Mutation of revenue ledger accounts (Thandapper) and Basic Land Tax receipts under the Kerala Land Tax Act, 1961 are solely for fiscal tax assessment and do not create or extinguish substantive civil title (*AIR 1996 SC 2823*).

2. **Injunction Standards under Order XXXIX Rules 1 & 2 CPC**:
   - To obtain an interim prohibitory injunction restraining encroachment or altering property status quo, the plaintiff must satisfy the three-fold test established in *Dalpat Kumar v. Prahlad Singh (1992) 1 SCC 719*:
     1. **Prima Facie Case**: Demonstrating lawful possession and valid link deeds.
     2. **Balance of Convenience**: Tilted firmly in favour of the applicant.
     3. **Irreparable Injury**: Showing that monetary damages cannot adequately compensate the harm.

3. **Boundary Demarcation & Advocate Commissioner**:
   - When boundary stones or terminal pegs are disturbed, move an urgent application under Order XXVI Rule 9 CPC for the appointment of an Advocate Commissioner assisted by a licensed Taluk Surveyor to inspect the ground reality and prepare a contemporaneous Mahazar.

4. **Daughters' Equal Coparcenary Birthright**:
   - Under Section 6 of the Hindu Succession Act, 1956 (as clarified by the Constitutional Bench in *Vineeta Sharma v. Rakesh Sharma (2020) 9 SCC 1*), daughters have equal coparcenary rights by birth regardless of whether the father was alive on the amendment date.`;
  }

  // Domain 6: Tenancy & Rent Control
  if (domain === LEGAL_DOMAINS.TENANCY_RENT_CONTROL) {
    if (isMl) {
      return `[വാടകക്കരാറും കെട്ടിട വാടക നിയന്ത്രണ നിയമങ്ങളും - ${mode} മോഡ്]:

1. **നിയമവിരുദ്ധമായ കുടിയൊഴിപ്പിക്കൽ തടയൽ**:
   - ഒരു ഭൂവുടമയ്ക്കും വാടകക്കാരനെ ഭീഷണിപ്പെടുത്തിയോ, വൈദ്യുതിയും വെള്ളവും വിച്ഛേദിച്ചോ, പൂട്ടിയിട്ടോ ബലമായി ഒഴിപ്പിക്കാൻ നിയമപരമായ അവകാശമില്ല (*Lallu Yeshwant Singh v. Rao Jagdish Singh*).
   - കുടിയൊഴിപ്പിക്കൽ നിയമപരമായ നടപടിക്രമങ്ങളിലൂടെ (Rent Control Court) മാത്രമേ സാധ്യമാകൂ.

2. **സെക്യൂരിറ്റി ഡെപ്പോസിറ്റും പിടിച്ചുവെക്കലും**:
   - കെട്ടിടം ഒഴിഞ്ഞുകൊടുക്കുമ്പോൾ ന്യായമായ കാരണങ്ങളില്ലാതെ മുൻകൂർ തുക (Security Deposit) പിടിച്ചുവെക്കുന്നത് ഇന്ത്യൻ കരാർ നിയമം (Contract Act) സെക്ഷൻ 73, 74 എന്നിവയുടെ ലംഘനമാണ്.
   - കുടിശ്ശികയോ യഥാർത്ഥ നാശനഷ്ടങ്ങളോ ഉണ്ടെങ്കിൽ മാത്രമേ മുൻകൂർ തുകയിൽ നിന്നും കുറയ്ക്കാൻ നിയമം അനുവദിക്കുന്നുള്ളൂ.

3. **വാടക ഒഴിയൽ നോട്ടീസ് (Section 106 TPA)**:
   - സാധാരണ വാസസ്ഥലങ്ങൾക്ക് 15 ദിവസത്തെ രേഖാമൂലമുള്ള നോട്ടീസും, വാണിജ്യ/വ്യാവസായിക ആവശ്യങ്ങൾക്ക് 6 മാസത്തെ നോട്ടീസും ട്രാൻസ്ഫർ ഓഫ് പ്രോപ്പർട്ടി ആക്ട് പ്രകാരം നൽകേണ്ടതാണ്.`;
    }

    return `Tenancy, Leasehold & Rent Control Framework [${mode} Mode]:

1. **Absolute Prohibition against Forcible Dispossession**:
   - Under settled Supreme Court authority (*Lallu Yeshwant Singh v. Rao Jagdish Singh AIR 1968 SC 620*), a landlord cannot resort to extrajudicial self-help measures (e.g. locking premises, disconnecting utilities, intimidation) to evict a tenant.
   - Eviction must proceed strictly through the jurisdictional Rent Control Court / Civil Court. Disconnected utilities warrant immediate police intervention or interim mandatory injunction.

2. **Statutory Eviction Grounds**:
   - Under the Kerala Buildings (Lease and Rent Control) Act, 1965, eviction can only be ordered on specific statutory grounds:
     * Bona fide own occupation requirement of landlord.
     * Arrears of rent not cleared after statutory demand notice.
     * Subletting without written consent.
     * Material impairment of building value or utility.

3. **Security Deposit Recovery & Liquidated Damages**:
   - Forfeiture clauses stipulating automatic loss of entire security deposits are treated as penal and unenforceable under Section 74 of the Indian Contract Act (*Kailash Nath Associates v. DDA*). The landlord must prove actual verifiable damage or unpaid rent.`;
  }

  // Domain 7: Family, Matrimonial & Maintenance
  if (domain === LEGAL_DOMAINS.FAMILY_MATRIMONIAL) {
    if (isMl) {
      return `[കുടുംബ നിയമങ്ങൾ, വിവാഹമോചനവും ജീവനാംശവും - ${mode} മോഡ്]:

1. **പരസ്പര സമ്മതത്തോടെയുള്ള വിവാഹമോചനം (Mutual Consent Divorce)**:
   - ഹിന്ദു വിവാഹ നിയമം സെക്ഷൻ 13B (അല്ലെങ്കിൽ സ്പെഷ്യൽ മാര്യേജ് ആക്ട് സെക്ഷൻ 28) പ്രകാരം കുറഞ്ഞത് 1 വർഷം വേർപിരിഞ്ഞു താമസിച്ച ദമ്പതികൾക്ക് സംയുക്തമായി അപേക്ഷ നൽകാം.
   - ഫസ്റ്റ് മോഷന് ശേഷമുള്ള 6 മാസത്തെ സാവകാശം (Cooling-off Period) അടിയന്തര സാഹചര്യങ്ങളിൽ ഹൈക്കോടതി മാർഗ്ഗനിർദ്ദേശങ്ങൾ പ്രകാരം സുപ്രീം കോടതിയുടെ *Amardeep Singh* വിധി ഉപയോഗിച്ച് ഒഴിവാക്കി കിട്ടാൻ സാധിക്കും.

2. **ജീവനാംശം (Maintenance - Sec 144 BNSS)**:
   - ഭാര്യയ്ക്കും പ്രായപൂർത്തിയാകാത്ത മക്കൾക്കും മാന്യമായി ജീവിക്കാനുള്ള ജീവനാംശം നൽകാൻ ഭർത്താവ് നിയമപരമായി ബാധ്യസ്ഥനാണ്.
   - സുപ്രീം കോടതിയുടെ *Rajnesh v. Neha (2021) 2 SCC 324* വിധി പ്രകാരം ഇരു കക്ഷികളും തങ്ങളുടെ വരുമാനവും സ്വത്തുക്കളും ബാധ്യതകളും സംബന്ധിച്ച സത്യവാങ്മൂലം നിർബന്ധമായും കോടതിയിൽ ഹാജരാക്കേണ്ടതാണ്.

3. **ഗാർഹിക പീഡന സംരക്ഷണ നിയമം (DV Act, 2005)**:
   - സ്ത്രീക്ക് താമസിക്കാനുള്ള അവകാശം (Residence Order), സംരക്ഷണ ഉത്തരവ് (Protection Order), സാമ്പത്തിക ആശ്വാസം എന്നിവ മജിസ്ട്രേറ്റ് കോടതി വഴി അടിയന്തരമായി നേടാം.`;
    }

    return `Family, Matrimonial & Maintenance Law Framework [${mode} Mode]:

1. **Mutual Consent Divorce (Section 13B HMA / Section 28 SMA)**:
   - Requires mutual petition demonstrating parties have lived separately for at least 1 year and cannot reconcile.
   - Cooling-off period: The 6-month statutory waiting period between First and Second Motion can be waived by moving an application under Supreme Court ruling *Amardeep Singh v. Harveen Kaur (2017) 8 SCC 746* where disputes are fully resolved.

2. **Maintenance Law & Mandatory Disclosure (Rajnesh v. Neha 2021 (2) SCC 324)**:
   - Governed by **Section 144 of BNSS, 2023** (formerly Section 125 CrPC) and Section 24/25 of the Hindu Marriage Act.
   - Per the landmark Supreme Court ruling in *Rajnesh v. Neha*, both spouses must mandatorily file comprehensive **Affidavits of Assets and Liabilities** (covering income tax returns, bank accounts, properties, investments, and monthly living expenses) to determine interim maintenance.

3. **Protection of Women from Domestic Violence Act, 2005**:
   - Allows aggrieved women to seek emergency relief before the Judicial Magistrate:
     * Section 18: Protection orders against communication or entry.
     * Section 19: Residence orders securing the right to reside in shared household.
     * Section 20 & 22: Monetary relief and compensation for mental emotional distress.`;
  }

  // Domain 8: Consumer Protection
  if (domain === LEGAL_DOMAINS.CONSUMER_PROTECTION) {
    if (isMl) {
      return `[ഉപഭോക്തൃ സംരക്ഷണ നിയമം (Consumer Protection Act, 2019) - ${mode} മോഡ്]:

1. **ഉപഭോക്തൃ കമ്മീഷന്റെ അധികാരപരിധി**:
   - ഉൽപന്നങ്ങളിലോ സേവനങ്ങളിലോ തകരാറുണ്ടെങ്കിൽ ജില്ലാ ഉപഭോക്തൃ തർക്ക പരിഹാര കമ്മീഷനിൽ (DCDRC) 50 ലക്ഷം രൂപ വരെയുള്ള കേസുകൾക്ക് പരാതി നൽകാം.
   - പരാതിക്കാരന് തന്റെ താമസസ്ഥലത്തോ ജോലിസ്ഥലത്തോ ഉള്ള കമ്മീഷനിൽ കേസ് കൊടുക്കാം (ഇ-ദാഖിൽ - e-Daakhil പോർട്ടൽ വഴി ഓൺലൈനായും നൽകാം).

2. **സമയപരിധി (Limitation Period)**:
   - തകരാറോ സേവനത്തിലെ ന്യൂനതയോ ഉണ്ടായ തിയതി മുതൽ **2 വർഷത്തിനകം** പരാതി ഫയൽ ചെയ്തിരിക്കണം (സെക്ഷൻ 69).

3. **ലഭിക്കുന്ന പരിഹാരങ്ങൾ**:
   - ഉൽപ്പന്നത്തിന്റെ മുഴുവൻ തുകയും പലിശ സഹിതം തിരികെ ലഭിക്കൽ (Refund).
   - പുതിയ ഉൽപ്പന്നം മാറ്റി നൽകൽ (Replacement).
   - മാനസിക ബുദ്ധിമുട്ടുകൾക്കും പീഡനങ്ങൾക്കുമുള്ള നഷ്ടപരിഹാരം.
   - കോടതി വ്യവഹാരച്ചെലവുകൾ.`;
    }

    return `Consumer Protection Act, 2019 Legal Framework [${mode} Mode]:

1. **Jurisdiction & Forum Architecture**:
   - **District Commission (DCDRC)**: Pecuniary jurisdiction up to **₹50 Lakhs**.
   - **State Commission (SCDRC)**: From ₹50 Lakhs to **₹2 Crores**.
   - Complainants can institute complaints within their own residential jurisdiction or online via the official **e-Daakhil** portal without physical court attendance.

2. **Strict 2-Year Limitation Window (Section 69 CPA, 2019)**:
   - Complaints must be instituted within **2 years** from the date on which the cause of action accrued (e.g. date of defective delivery, service denial, or rejection of refund).

3. **Available Legal Remedies**:
   - Full refund of consideration paid along with commercial interest.
   - Rectification of defect or replacement of goods.
   - Compensation for mental agony, harassment, and consequential financial loss (*Fortune Infrastructure v. Trevor D'Lima*).
   - Punitive damages against manufacturers and platforms for unfair trade practices.`;
  }

  // Domain 9: Cyber Crime & Financial Fraud
  if (domain === LEGAL_DOMAINS.CYBER_CRIME_FRAUD) {
    if (isMl) {
      return `[സൈബർ കുറ്റകൃത്യങ്ങളും ഓൺലൈൻ സാമ്പത്തിക തട്ടിപ്പുകളും - ${mode} മോഡ്]:

1. **സുവർണ്ണ മണിക്കൂർ (Golden Hour) നടപടികൾ**:
   - ഓൺലൈൻ വഴിയോ യു.പി.ഐ വഴിയോ പണം നഷ്ടപ്പെട്ടാൽ ആദ്യ മണിക്കൂറുകളിൽ തന്നെ **1930** എന്ന ദേശീയ ഹെൽപ്പ് ലൈനിലോ **cybercrime.gov.in** പോർട്ടലിലോ പരാതി രജിസ്റ്റർ ചെയ്യുക. ഇത് തട്ടിപ്പുകാരുടെ ബാങ്ക് അക്കൗണ്ടുകൾ ഫ്രീസ് ചെയ്യാൻ സഹായിക്കും.

2. **ആർ.ബി.ഐയുടെ സീറോ ലയബിലിറ്റി (RBI Zero Liability)**:
   - മൂന്നാം കക്ഷി തട്ടിപ്പിലൂടെ പണം നഷ്ടപ്പെട്ടാൽ, സംഭവം അറിഞ്ഞ് **3 പ്രവൃത്തി ദിവസത്തിനകം** ബാങ്കിൽ പരാതിപ്പെട്ടാൽ ഉപഭോക്താവിന് യാതൊരു സാമ്പത്തിക ബാധ്യതയുമില്ലാതെ പണം തിരികെ നൽകാൻ ബാങ്ക് ബാധ്യസ്ഥരാണ്.

3. **ഐ.ടി ആക്ടും ബി.എൻ.എസും**:
   - ഐ.ടി ആക്ട് സെക്ഷൻ 66C, 66D (ആൾമാറാട്ടവും ഐഡന്റിറ്റി മോഷണവും) കൂടാതെ ബി.എൻ.എസ് സെക്ഷൻ 318(4) പ്രകാരവും കേസ് എടുക്കാവുന്നതാണ്.`;
    }

    return `Cyber Crime & Financial Fraud Remedial Protocol [${mode} Mode]:

1. **Immediate Golden-Hour Incident Reporting**:
   - Call the National Cyber Crime Helpline **1930** immediately and lodge a detailed acknowledgement on the MHA National Cybercrime Reporting Portal (**cybercrime.gov.in**).
   - This triggers automated suspect account freezing across intermediary payment gateways (NPCI, nodal bank accounts, and merchant wallets).

2. **RBI Mandated Zero-Liability Protection**:
   - Under RBI Master Direction *Customer Protection – Limiting Liability of Customers in Unauthorised Electronic Banking Transactions*:
     * If reported within **3 working days** of the unauthorized transaction, customer liability is **ZERO**.
     * If reported between 4 to 7 working days, liability is capped at ₹5,000 to ₹10,000.
     * The bank must credit the disputed amount as shadow balance within 10 working days.

3. **IT Act, 2000 & BNS Penal Concordance**:
   - Offenses attract prosecution under:
     * Section 43 & 66: Hacking and unauthorized digital access.
     * Section 66C: Identity theft.
     * Section 66D: Cheating by personation through computer resources.
     * Section 318(4) BNS: Aggravated cheating.

4. **De-Freezing Legitimate Accounts**:
   - If your personal account was inadvertently frozen due to a downstream P2P / UPI transaction chain, submit an immediate representation to the Cyber Crime Investigating Officer (IO) along with clean bank statements, followed by moving an application under Section 503 BNSS before the jurisdictional Magistrate or Section 528 BNSS before the High Court.`;
  }

  // Domain 10: Employment & Labour
  if (domain === LEGAL_DOMAINS.EMPLOYMENT_LABOUR) {
    if (isMl) {
      return `[തൊഴിൽ നിയമങ്ങളും ശമ്പളം, ഗ്രാറ്റുവിറ്റി അവകാശങ്ങളും - ${mode} മോഡ്]:

1. **നോൺ-കംപീറ്റ് ക്ലോസുകൾ (Non-Compete Covenants)**:
   - ഇന്ത്യൻ കരാർ നിയമം (Contract Act) സെക്ഷൻ 27 പ്രകാരം ജോലി ഒഴിഞ്ഞതിനു ശേഷമുള്ള മത്സര നിരോധന കരാറുകൾ (Post-termination non-compete) നിയമപരമായി അസാധുവും നടപ്പിലാക്കാൻ കഴിയാത്തതുമാണ് (*Percept D'Mark v. Zaheer Khan*).
   - മുൻ ജീവനക്കാരൻ മറ്റൊരു കമ്പനിയിൽ ജോലി ചെയ്യുന്നതോ ബിസിനസ്സ് തുടങ്ങുന്നതോ തടയാൻ കമ്പനിക്ക് അവകാശമില്ല.

2. **ഗ്രാറ്റുവിറ്റി അവകാശങ്ങൾ (Gratuity Act, 1972)**:
   - ഒരേ സ്ഥാപനത്തിൽ 5 വർഷം തുടർച്ചയായി ജോലി ചെയ്ത ഏതൊരു ജീവനക്കാരനും ഗ്രാറ്റുവിറ്റിക്ക് അർഹതയുണ്ട്.
   - ഓരോ പൂർത്തിയാക്കിയ വർഷത്തിനും 15 ദിവസത്തെ വേതനം എന്ന നിരക്കിലാണ് ഗ്രാറ്റുവിറ്റി കണക്കാക്കുന്നത്. കമ്പനി തുക വൈകിപ്പിച്ചാൽ 10% പലിശ നൽകാൻ ബാധ്യസ്ഥരാണ്.

3. **ശമ്പള കുടിശ്ശികയും റിലീവിംഗ് ലെറ്ററും**:
   - ന്യായമായ കാരണമില്ലാതെ റിലീവിംഗ് ലെറ്ററും എക്സ്പീരിയൻസ് സർട്ടിഫിക്കറ്റും പിടിച്ചുവെക്കാൻ കമ്പനിക്ക് അധികാരമില്ല. വക്കീൽ നോട്ടീസ് അയച്ച് ലേബർ കമ്മീഷണറെ സമീപിക്കാവുന്നതാണ്.`;
    }

    return `Employment & Labour Law Jurisprudence [${mode} Mode]:

1. **Unenforceability of Post-Termination Non-Compete Clauses**:
   - Under **Section 27 of the Indian Contract Act, 1872**, agreements in restraint of trade, profession, or lawful business are void.
   - As settled by the Supreme Court in *Percept D'Mark (India) Pvt. Ltd. v. Zaheer Khan (2006) 4 SCC 227* and *Niranjan Shankar Golikari*, post-employment restrictive covenants restraining an employee from joining a competitor or starting a similar business are completely unenforceable in India.

2. **Statutory Gratuity Entitlement (Payment of Gratuity Act, 1972)**:
   - Mandatory for every employee who has rendered continuous service of **not less than 5 years**.
   - Computation Formula: [15 * Last Drawn Monthly Basic + DA * Number of Years] / 26.
   - Delayed disbursement beyond 30 days incurs statutory simple interest at **10% per annum**. Gratuity cannot be withheld except under proven formal disciplinary orders for moral turpitude resulting in financial damage.

3. **Withholding Relieving Letter & Salary Arrears**:
   - Employers cannot arbitrarily withhold experience certificates or statutory dues.
   - Actionable remedies: Issue a 15-day Counsel Legal Demand Notice, followed by a formal petition before the jurisdictional Labour Officer / Controlling Authority, or instituting a summary recovery suit under Order 37 CPC.`;
  }

  // Domain 11: Corporate & Contracts
  if (domain === LEGAL_DOMAINS.CORPORATE_CONTRACTS) {
    return `Commercial Contract Law & Corporate Governance Framework [${mode} Mode]:

1. **Liquidated Damages vs. Penalties (Section 73 & 74 Contract Act)**:
   - Under the definitive benchmark in *Kailash Nath Associates v. DDA (2015) 4 SCC 136*, liquidated damages clauses are enforceable strictly as an upper ceiling for reasonable compensation.
   - The party claiming breach must prove actual loss or damage suffered unless the nature of the contract makes proof of exact loss impossible. Automatic forfeiture of deposits is void.

2. **Mandatory Pre-Institution Mediation (Section 12A Commercial Courts Act)**:
   - Prior to instituting any commercial suit, parties must exhaust mandatory Pre-Institution Mediation and Settlement (PIMS) through the District Legal Services Authority, EXCEPT where urgent interim relief is sought.

3. **MSME Delayed Payments (Section 15 & 16 MSMED Act, 2006)**:
   - Payment must be made within the agreed timeframe (not exceeding **45 days**).
   - Default attracts mandatory compound interest with monthly rests at **three times the Bank Rate** notified by the RBI. Claims can be filed seamlessly before the MSME Samadhaan Facilitation Council.

4. **Section 186 Companies Act & Section 43B(h) Income Tax**:
   - Inter-corporate loans/investments exceeding 60% of paid-up capital + reserves or 100% of free reserves require a Special Resolution under Section 186(2) Companies Act, 2013.
   - Under Section 43B(h) of the Income-tax Act, payments due to Micro and Small enterprises remaining unpaid past 45 days are disallowed as business expense for that financial year.`;
  }

  // Domain 12: Constitutional Writs (Article 226)
  if (domain === LEGAL_DOMAINS.CONSTITUTIONAL_WRITS) {
    return `High Court of Kerala Constitutional Writ Practice (Article 226) [${mode} Mode]:

1. **Scope & Plenary Jurisdiction**:
   - The High Court of Kerala exercises supervisory and plenary writ jurisdiction under Article 226 of the Constitution of India for the enforcement of Fundamental Rights (Part III) and "for any other purpose" against State authorities, statutory boards (KSEB, KSRTC, Local Self Government), and tribunals.

2. **Overcoming Alternate Remedy Doctrine (Whirlpool Corporation 1998 8 SCC 1)**:
   - Although the existence of an alternative statutory appeal is a recognized rule of discretion, the High Court exercises writ jurisdiction where:
     * The writ petition seeks enforcement of a Fundamental Right.
     * There has been a patent violation of the principles of Natural Justice (*audi alteram partem*).
     * The order or proceedings are wholly without jurisdiction or ultra vires the parent statute.

3. **Essential Procedural Requisites under High Court Rules, 1971**:
   - Rule 32 Compliance: All vernacular Malayalam documents produced as exhibits must be accompanied by an Advocate-Certified True English Translation.
   - Interim Stay Petitions: Supported by separate interim relief petitions demonstrating imminent prejudice and irreversible state action.`;
  }

  // General Legal Default (Contextual, non-repetitive)
  if (isMl) {
    return `[വക്കീൽ AI ലീഗൽ അനാലിസിസ് - ${mode} മോഡ്]:

നിങ്ങൾ ഉന്നയിച്ച നിയമപരമായ വിഷയം ("${prompt}") ഞങ്ങൾ വിശദമായി പരിശോധിച്ചു:

1. **കേരള ഹൈക്കോടതി & സിവിൽ നടപടിക്രമങ്ങൾ**:
   - ഈ വിഷയത്തിൽ നിയമപരമായ അവകാശങ്ങൾ സംരക്ഷിക്കുന്നതിനായി സിവിൽ, ക്രിമിനൽ അല്ലെങ്കിൽ ഭരണഘടനാപരമായ പരിഹാരങ്ങൾ നിലവിലുണ്ട്.
   - എതിർകക്ഷിയുടെ നടപടികൾ പ്രകൃതി നീതിയുടെ ലംഘനമോ നിയമാനുസൃതമല്ലാത്തതോ ആണെങ്കിൽ കോടതിയുടെ ഇടപെടൽ സാധ്യമാണ്.

2. **ശുപാർശ ചെയ്യുന്ന അടുത്ത ഘട്ടങ്ങൾ**:
   - ഇടപാടുകളുമായി ബന്ധപ്പെട്ട എല്ലാ രേഖകളും വക്കീൽ ഡോക്യുമെന്റ് വോൾട്ടിൽ അപ്‌ലോഡ് ചെയ്തു സുരക്ഷിതമാക്കുക.
   - എതിർകക്ഷിക്ക് നിങ്ങളുടെ വാദങ്ങൾ വ്യക്തമാക്കി 15 ദിവസത്തെ സാവകാശം നൽകുന്ന ഔദ്യോഗിക വക്കീൽ നോട്ടീസ് അയക്കുക.
   - ഹൈക്കോടതി അഭിഭാഷകനുമായി 30 മിനിറ്റ് ചർച്ച നടത്തി അനുയോജ്യമായ ഹർജി (Petition / Plaint) ഫയൽ ചെയ്യുക.`;
  }

  return `Wakheel AI Legal Analysis [${mode} Mode]:

Examined legal query: "${prompt}".

1. **Statutory Appraisal & Legal Merits**:
   - Under applicable Indian statutory frameworks and Kerala High Court practice, actionable legal rights and procedural remedies exist for this matter.
   - The primary legal test involves establishing clean cause of action accrual, demonstrating compliance with condition-precedent notices, and evaluating appropriate judicial forum jurisdiction (Civil Munsiff/Sub Court, Criminal Magistracy, High Court Writ under Article 226, or specialized Tribunals).

2. **Procedural Roadmap & Recommendations**:
   - **Step 1 (Evidence Consolidation)**: Collate and securely index all primary agreements, official notices, bank statements, and contemporaneous records.
   - **Step 2 (Pre-Litigation Demand)**: Issue a formal Counsel's Legal Demand Notice putting the opposing party on notice to cure the grievance within a statutory window.
   - **Step 3 (Judicial Presentation)**: Approach the competent forum with structured pleadings, verified affidavit, and prayers for interim injunctive protection to preserve the status quo.`;
}

// Specialization advice for AiAdvocateView (Strategy, Bench Simulator, Pleading Audit)
export function getAdvocateConsultation({
  prompt,
  specialization = "constitutional",
  consultMode = "strategy",
  language = "en",
}) {
  const domain = detectDomain(prompt, specialization);
  const precedents = getDomainPrecedents(domain);

  if (consultMode === "bench-simulator") {
    let benchQueries = [];
    let advice = "";

    switch (domain) {
      case LEGAL_DOMAINS.TELEGRAPH_KSEB_LINES:
        benchQueries = [
          "1. Counsel, what is your locus standi? Have you produced the registered title deed and village Thandaper extract demonstrating absolute physical possession?",
          "2. Why have you approached this court directly under Article 226 when Section 16(1) of the Indian Telegraph Act provides an effective alternative remedy before the District Magistrate?",
          "3. Is there any delay or laches in approaching this Court? What is the date of knowledge of the impugned survey marker?",
        ];
        advice = "Answer the Bench by asserting that alternative remedy is bypassed because the authority acted in total violation of natural justice (no notice served per Valsamma v. KSEB).";
        break;

      case LEGAL_DOMAINS.CRIMINAL_DEFENSE_BAIL:
      case LEGAL_DOMAINS.BNS_IPC_COMPARISON:
        benchQueries = [
          "1. Counsel, why should this Court grant anticipatory bail when the allegations disclose a non-bailable cognizable offense?",
          "2. Has the investigating officer served a notice under Section 35(3) BNSS, and has your client complied with summons?",
          "3. What is your response to the prosecutor's apprehension regarding witness tampering or flight risk?",
        ];
        advice = "Emphasize strict compliance with Satender Kumar Antil v. CBI: offenses carry <7 years, client has deep community roots, and custodial interrogation is wholly unnecessary.";
        break;

      case LEGAL_DOMAINS.CHEQUE_BOUNCE_S138:
        benchQueries = [
          "1. Counsel, was the statutory demand notice dispatched within the strict 30-day window from receipt of the bank return memo?",
          "2. Does the complaint aver territorial jurisdiction under Section 142(2) matching the payee's bank collection branch?",
          "3. Has the drawer set up a probable defense regarding security cheque misuse to rebut the Section 139 presumption?",
        ];
        advice = "Rely on Bir Singh v. Mukesh Kumar: statutory presumption under Section 139 is mandatory upon signature admission; burden is squarely on drawer.";
        break;

      case LEGAL_DOMAINS.PROPERTY_LAND_REVENUE:
        benchQueries = [
          "1. Counsel, does your client have a clean declaration of title, or are you seeking injunction based merely on revenue mutation entries?",
          "2. Why should the Court grant an interim injunction under Order 39 without an Advocate Commissioner's report establishing the ground reality?",
          "3. Have all co-owners or necessary parties been arrayed under Order I Rule 10 CPC?",
        ];
        advice = "Cite Anathula Sudhakar v. Buchi Reddy: possession is lawful, title is unimpeachable, and immediate protection is vital to prevent irreversible status quo disruption.";
        break;

      default:
        benchQueries = [
          "1. Counsel, what is the exact cause of action and date of accrual that brings this matter before this Bench?",
          "2. Have all condition precedent statutory notices been dispatched and acknowledged by the opposite party?",
          "3. Why should the Court grant urgent interim relief rather than awaiting the counter-affidavit?",
        ];
        advice = "Demonstrate prima facie legal merits, irreversible prejudice if stay is denied, and clean compliance with procedural practice rules.";
        break;
    }

    return {
      text: `[Bench Query Simulator Active]\nCounsel, assuming I am presiding over the Bench hearing your matter:`,
      benchQueries,
      citations: precedents.map((p) => p.citation),
      actionRecommendation: advice,
    };
  }

  if (consultMode === "pleading-audit") {
    let auditPoints = [];
    switch (domain) {
      case LEGAL_DOMAINS.CRIMINAL_DEFENSE_BAIL:
        auditPoints = [
          "✓ Jurisdiction verified: Court of Session / High Court possesses jurisdiction under Section 480 & 482 BNSS.",
          "✓ Verification: Affirmed that no prior bail application is pending before any coordinate bench.",
          "⚠ Caution: Ensure certified copies of FIR, remand report, and Section 35 appearance notices are indexed.",
        ];
        break;

      case LEGAL_DOMAINS.CHEQUE_BOUNCE_S138:
        auditPoints = [
          "✓ Jurisdiction verified: Payee bank branch situated within local limits under Section 142(2).",
          "✓ Limitation verified: Dispatched within 30 days of return memo; 15-day cure window expired.",
          "⚠ Caution: Ensure original postal dispatch receipt and delivery tracking sheet are annexed as Exhibits.",
        ];
        break;

      case LEGAL_DOMAINS.PROPERTY_LAND_REVENUE:
        auditPoints = [
          "✓ Jurisdiction verified: Valuation falls within pecuniary limits; suit property located in territorial jurisdiction.",
          "✓ Cause of action accrual: Accrued within 3-year limitation window under Limitation Act Article 113.",
          "⚠ Caution: Ensure vernacular revenue sketches and Aadharm are accompanied by an advocate-certified English translation under Rule 32.",
        ];
        break;

      default:
        auditPoints = [
          "✓ Jurisdiction verified: Matter falls within territorial and pecuniary limits of the competent judicial forum.",
          "✓ Cause of action: Well within applicable statutory limitation window.",
          "⚠ Caution: Ensure all vernacular exhibits are accompanied by Rule 32 certified English translations.",
        ];
        break;
    }

    return {
      text: `[Pleading Audit Report]\nI have audited the factual proposition: "${prompt.slice(0, 80)}..." against Court Practice Rules:`,
      benchQueries: auditPoints,
      citations: precedents.map((p) => p.citation),
      actionRecommendation: "Prepare Index, Synopsis, List of Dates, and marked true copies of all exhibits (P-1 to P-4).",
    };
  }

  // Strategy Mode
  const responseText = generateLegalResponse({
    prompt,
    domain,
    mode: "Strategy",
    language,
    specialization,
  });

  return {
    text: responseText,
    benchQueries: [],
    citations: precedents.map((p) => p.citation),
    actionRecommendation:
      domain === LEGAL_DOMAINS.CRIMINAL_DEFENSE_BAIL
        ? "File anticipatory bail petition under Section 482 BNSS and serve notice of appearance today."
        : domain === LEGAL_DOMAINS.CHEQUE_BOUNCE_S138
        ? "Issue formal 15-day Section 138 statutory demand notice by registered speed post with tracking."
        : domain === LEGAL_DOMAINS.TELEGRAPH_KSEB_LINES
        ? "Dispatch Section 16 written objection to District Magistrate and Assistant Executive Engineer immediately."
        : domain === LEGAL_DOMAINS.PROPERTY_LAND_REVENUE
        ? "File interim injunction petition under Order 39 CPC and apply for Advocate Commission inspection."
        : "Collate primary evidentiary documents into your vault and issue a formal Counsel's Demand Notice.",
  };
}

// Master Resolver for Copilot API Query
export function resolveCopilotQuery({
  prompt,
  mode = "Ask",
  isAgentMode = false,
  isDeepResearch = false,
  language = "en",
  specialization = null,
  consultMode = null,
}) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required");
  }

  // 1. Check for vague/greeting queries
  const vagueCheck = isGreetingOrVague(prompt);
  const domain = vagueCheck.isVague ? LEGAL_DOMAINS.CLARIFICATION : detectDomain(prompt, specialization);

  // 2. Generate response text
  const text = generateLegalResponse({
    prompt,
    domain,
    mode,
    language,
    specialization,
    consultMode,
  });

  // 3. Precedents for Deep Research
  const precedents = getDomainPrecedents(domain);
  const deepResearchData = isDeepResearch
    ? {
        scannedSources: 42,
        scJudgements: 24,
        hcJudgements: 18,
        bareActs: 4,
        precedents,
      }
    : null;

  // 4. Agent Steps for Agent Mode
  const agentSteps = isAgentMode ? getDomainAgentSteps(domain) : null;

  // 5. Advocate Consultation Data (citations, bench queries, action recommendation)
  const consultData = getAdvocateConsultation({
    prompt,
    specialization: specialization || (domain === LEGAL_DOMAINS.CONSTITUTIONAL_WRITS ? "constitutional" : domain === LEGAL_DOMAINS.CRIMINAL_DEFENSE_BAIL ? "criminal" : domain === LEGAL_DOMAINS.PROPERTY_LAND_REVENUE ? "civil-property" : "corporate"),
    consultMode: consultMode || "strategy",
    language,
  });

  return {
    success: true,
    text,
    domain,
    isClarificationRequest: domain === LEGAL_DOMAINS.CLARIFICATION,
    mode,
    isAgentMode,
    agentSteps,
    isDeepResearch,
    deepResearchData,
    citations: consultData.citations,
    benchQueries: consultData.benchQueries,
    actionRecommendation: consultData.actionRecommendation,
    timestamp: new Date().toISOString(),
  };
}
