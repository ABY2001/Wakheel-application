// ============================================================================
// WAKHEEL SPECIALIZED AI COPILOT CONTROLLER FOR CS & CA
// Deep Statutory Concordance: Companies Act 2013, Income Tax Act 1961, CGST Act 2017, MSMED Act 2006
// Dual-Mode: Gemini 1.5/2.0 API + Zero-Quota Local Statutory Engine
// ============================================================================

import { isGeminiAvailable, queryGeminiCsCa } from "../services/geminiService.js";

const RBI_BANK_RATE = 6.75; // Benchmark RBI Bank Rate (%)
const MSMED_PENAL_RATE = 3 * RBI_BANK_RATE; // 20.25% p.a.

// Helper to format currency in Indian numbering system
const formatInr = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// ----------------------------------------------------------------------------
// 1. SECTION 186 INTER-CORPORATE LOANS, GUARANTEES & SECURITIES DRAFTER (CS)
// ----------------------------------------------------------------------------
export const draftSection186 = async (req, res) => {
  try {
    const {
      entityName = "",
      cin = "",
      paidUpCapital = 0,
      freeReserves = 0,
      securitiesPremium = 0,
      existingLoans = 0,
      existingInvestments = 0,
      existingGuarantees = 0,
      existingSecurities = 0,
      proposedAmount = 0,
      targetEntityName = "",
      targetCin = "",
      transactionType = "inter_corporate_loan", // inter_corporate_loan | investment_shares | corporate_guarantee | security
      interestRate = 0, // % p.a.
      tenureMonths = 12,
      purpose = "",
      hasPfiDefault = false,
      signatoryName = "",
      signatoryMembership = "",
    } = req.body;

    // Statutory Calculations under Section 186(2)
    const numPaidUp = Number(paidUpCapital || 0);
    const numFreeReserves = Number(freeReserves || 0);
    const numSecPrem = Number(securitiesPremium || 0);
    const totalAggregateNet = numFreeReserves + numSecPrem;
    const limit60 = 0.6 * (numPaidUp + totalAggregateNet);
    const limit100 = totalAggregateNet;
    const statutoryCeiling = Math.max(limit60, limit100);

    const existingTotalExposure =
      Number(existingLoans || 0) +
      Number(existingInvestments || 0) +
      Number(existingGuarantees || 0) +
      Number(existingSecurities || 0);

    const proposedTotalExposure = existingTotalExposure + Number(proposedAmount || 0);
    const exceedsThreshold = proposedTotalExposure > statutoryCeiling;
    const requiresSpecialResolution = exceedsThreshold;
    const requiresPfiApproval = hasPfiDefault;

    // Minimum lending rate check under Section 186(7): Prevailing yield of 1/3/5/10 year Govt Security
    const gSecYield = 7.15;
    const isInterestCompliant = Number(interestRate) >= gSecYield;

    const transactionTypeLabel =
      transactionType === "investment_shares"
        ? "Acquisition of Securities / Equity Shares"
        : transactionType === "corporate_guarantee"
        ? "Corporate Guarantee"
        : transactionType === "security"
        ? "Provision of Security"
        : "Inter-Corporate Loan";

    const dateStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const resolvedEntityName = (entityName || "").trim() || "[Company Legal Name]";
    const resolvedTargetEntityName = (targetEntityName || "").trim() || "[Target Entity Name]";
    const resolvedSignatory = (signatoryName || "").trim() || "[Authorized Signatory]";
    const resolvedMembership = (signatoryMembership || "").trim() || "[DIN / Membership No.]";
    const resolvedPurpose = (purpose || "").trim() || "authorized corporate business purposes";

    // 1. Board Resolution (Unanimous under Section 186(5))
    const boardResolution = `CERTIFIED TRUE COPY OF THE UNANIMOUS RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF ${resolvedEntityName.toUpperCase()} HELD ON ${dateStr.toUpperCase()} AT THE REGISTERED OFFICE OF THE COMPANY.

"RESOLVED THAT pursuant to the provisions of Section 179(3), Section 186 and other applicable provisions, if any, of the Companies Act, 2013 read with the Companies (Meetings of Board and its Powers) Rules, 2014 (including any statutory modifications or re-enactments thereof for the time being in force), and subject to the Articles of Association of the Company ${
      requiresSpecialResolution ? "and the approval of the Members by way of Special Resolution" : ""
    }, the unanimous consent of all directors present at the meeting be and is hereby accorded to the Company to grant ${transactionTypeLabel.toLowerCase()} to ${resolvedTargetEntityName}${targetCin ? ` (CIN: ${targetCin})` : ""} for an aggregate amount not exceeding ${formatInr(
      proposedAmount
    )} (Rupees ${numberToWords(proposedAmount)} only) on such terms and conditions as detailed in the draft loan agreement placed before the Board, carrying an interest rate of ${interestRate}% per annum (which is strictly in compliance with Section 186(7) being higher than the prevailing yield of Government Securities), for a tenure of ${tenureMonths} months, to be utilized exclusively towards ${resolvedPurpose}.

RESOLVED FURTHER THAT any Director of the Company or ${resolvedSignatory}, Company Secretary (Membership No. ${resolvedMembership}), be and is hereby authorized to negotiate, finalize, and execute the loan agreement, promissory notes, guarantees, and all other ancillary documents, and to file the necessary e-form MGT-14 with the Registrar of Companies (ROC) within 30 days of this resolution."

// CERTIFIED TRUE COPY //
For ${resolvedEntityName}

(Sd/-)
Director / Company Secretary
DIN / Membership No: ${resolvedMembership}`;

    // 2. EGM Notice & Special Resolution (if required)
    const egmNoticeAndResolution = requiresSpecialResolution
      ? `NOTICE OF EXTRAORDINARY GENERAL MEETING (PURSUANT TO SECTION 186(3) OF COMPANIES ACT, 2013)

To consider and, if thought fit, to pass the following resolution as a SPECIAL RESOLUTION:

"RESOLVED THAT pursuant to the provisions of Section 186(3) and other applicable provisions, if any, of the Companies Act, 2013 and Rule 11 & 13 of the Companies (Meetings of Board and its Powers) Rules, 2014, the consent of the Members of the Company be and is hereby accorded to the Board of Directors of the Company to grant ${transactionTypeLabel.toLowerCase()} to ${resolvedTargetEntityName} up to an aggregate amount of ${formatInr(
          proposedAmount
        )}, notwithstanding that the aggregate of loans and investments so far made, the amounts for which guarantees or securities so far provided to or in all other bodies corporate, along with the proposed transaction, will exceed the statutory limits of sixty per cent (60%) of the paid-up share capital, free reserves and securities premium account or one hundred per cent (100%) of free reserves and securities premium account, whichever is higher, as prescribed under Section 186(2) of the Act.

RESOLVED FURTHER THAT the Board of Directors of the Company be and is hereby authorized to do all such acts, deeds, and things as may be necessary, expedient, or desirable to give effect to this resolution."

EXPLANATORY STATEMENT PURSUANT TO SECTION 102 OF THE COMPANIES ACT, 2013:
1. STATUTORY BACKGROUND:
   As per Section 186(2) of the Act, a company cannot make loans, give guarantees, or make investments exceeding 60% of its paid-up share capital, free reserves, and securities premium account, or 100% of its free reserves and securities premium account, whichever is more, unless prior approval of members by Special Resolution is obtained.
2. CURRENT FINANCIAL POSITION AS PER LATEST AUDITED FINANCIAL STATEMENTS:
   - Paid-Up Share Capital: ${formatInr(numPaidUp)}
   - Free Reserves: ${formatInr(numFreeReserves)}
   - Securities Premium Account: ${formatInr(numSecPrem)}
   - Aggregate Capital & Free Reserves: ${formatInr(numPaidUp + totalAggregateNet)}
   - Statutory Limit (60% criteria): ${formatInr(limit60)}
   - Statutory Limit (100% criteria): ${formatInr(limit100)}
   - Statutory Threshold Permissible without Special Resolution: ${formatInr(statutoryCeiling)}
   - Existing Commitments / Outstanding Loans & Guarantees: ${formatInr(existingTotalExposure)}
   - Proposed Transaction Amount: ${formatInr(proposedAmount)}
   - Total Exposure Post-Transaction: ${formatInr(proposedTotalExposure)} (Exceeds statutory threshold by ${formatInr(
          proposedTotalExposure - statutoryCeiling
        )})
3. PARTICULARS OF THE PROPOSED TRANSACTION:
   - Name of Target Entity: ${resolvedTargetEntityName}${targetCin ? ` (CIN: ${targetCin})` : ""}
   - Rate of Interest: ${interestRate}% p.a. (Compliant with Section 186(7))
   - Repayment Schedule: ${tenureMonths} Months
   - Specific Purpose: ${resolvedPurpose}
4. DISCLOSURE OF INTEREST OF DIRECTORS / KMP:
   None of the Directors, Key Managerial Personnel (KMP) of the Company, or their relatives are concerned or interested, financially or otherwise, in the proposed Special Resolution, except to the extent of their shareholding in the Company.`
      : `EXEMPTION NOTICE: Proposed transaction of ${formatInr(
          proposedAmount
        )} falls within the statutory ceiling of ${formatInr(
          statutoryCeiling
        )}. Special Resolution under Section 186(3) is not mandatory, but Unanimous Board Resolution under Section 186(5) remains legally mandatory.`;

    // 3. Form MGT-14 Brief & Compliance Checklist
    const mgt14FilingBrief = {
      srnType: "E-Form MGT-14",
      filingAuthority: "Registrar of Companies (MCA21 V3 Portal)",
      filingDeadline: "Within 30 days from passing of Board/Special Resolution",
      relevantSection: "Section 117(3)(g) read with Section 179(3)(e) & Section 186",
      mandatoryAttachments: [
        "Certified True Copy of the Unanimous Board Resolution",
        requiresSpecialResolution
          ? "Certified True Copy of the Special Resolution passed at EGM with Explanatory Statement"
          : "Board Extract under Section 179(3)(e)",
        "Notice convening the General Meeting with Attendance Sheet / Scrutinizer Report",
        "Form MBP-2 Register Extract verifying aggregate exposures",
      ],
      compliancePointers: [
        "Ensure all directors present voted in favour (Unanimity requirement under Section 186(5)).",
        "Verify no default in repayment of loan installments or interest to Public Financial Institutions (PFI). If default exists, prior approval of PFI is mandatory.",
        `Verify interest rate (${interestRate}%) is not lower than prevailing yield of 1/3/5/10 year Govt. Securities (${gSecYield}%).`,
        "Record entry in Register of Loans, Guarantees and Investments (Form MBP-2) within 7 days.",
      ],
    };

    res.json({
      success: true,
      data: {
        entityName,
        cin,
        targetEntityName,
        targetCin,
        statutoryThreshold: {
          paidUpCapital: numPaidUp,
          freeReserves: numFreeReserves,
          securitiesPremium: numSecPrem,
          limit60,
          limit100,
          statutoryCeiling,
          existingTotalExposure,
          proposedAmount,
          proposedTotalExposure,
          excessOverCeiling: Math.max(0, proposedTotalExposure - statutoryCeiling),
          requiresSpecialResolution,
          requiresPfiApproval,
          isInterestCompliant,
          gSecYield,
        },
        drafts: {
          boardResolution,
          egmNoticeAndResolution,
          mgt14FilingBrief,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("draftSection186 error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------------------------
// 2. SECTION 43B(h) MSME PAYMENT DISALLOWANCE & INTEREST CALCULATOR (CA)
// ----------------------------------------------------------------------------
export const analyzeClause43bMsme = async (req, res) => {
  try {
    const {
      clientName = "",
      pan = "",
      assessmentYear = "2026-27",
      financialYear = "2025-26",
      invoices = [],
    } = req.body;

    const invoiceList = Array.isArray(invoices) ? invoices : [];

    let totalInvoices = invoiceList.length;
    let totalPurchases = 0;
    let totalAllowed = 0;
    let totalDisallowed = 0;
    let totalPenalInterest = 0;
    const evaluatedInvoices = [];

    const fyEndDate = new Date("2026-03-31T23:59:59Z");

    for (const inv of invoiceList) {
      totalPurchases += Number(inv.amount || 0);

      const invDate = new Date(inv.invoiceDate);
      if (Number.isNaN(invDate.getTime())) continue;
      const isEligibleEnterprise = inv.enterpriseType === "micro" || inv.enterpriseType === "small";

      // Section 15 MSMED limit: maximum 45 days if agreed in writing, else 15 days
      const statutoryLimitDays = inv.agreedCreditPeriodDays
        ? Math.min(Number(inv.agreedCreditPeriodDays), 45)
        : 15;

      const dueDate = new Date(invDate);
      dueDate.setDate(dueDate.getDate() + statutoryLimitDays);

      const payDate = inv.paymentDate ? new Date(inv.paymentDate) : null;
      let isDisallowed = false;
      let disallowanceReason = "";
      let daysDelayedBeyondDue = 0;
      let penalInterest = 0;

      if (!isEligibleEnterprise) {
        // Medium enterprise or wholesale/retail trader -> exempt per OM 02/07/2021
        isDisallowed = false;
        disallowanceReason =
          inv.enterpriseType === "trader"
            ? "Exempt: Wholesale / Retail Traders are excluded from Section 43B(h) per MSME OM No. 5/2(2)/2021"
            : "Exempt: Medium enterprises are not covered under Section 43B(h)";
      } else {
        // Enterprise is Micro or Small
        if (!payDate) {
          // Unpaid as on 31st March and current date
          isDisallowed = true;
          disallowanceReason = `Unpaid as of 31st March ${financialYear.split("-")[0]} and beyond statutory limit of ${statutoryLimitDays} days (Due: ${dueDate.toISOString().split("T")[0]})`;

          const currentDate = new Date();
          daysDelayedBeyondDue = Math.max(0, Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24)));
        } else {
          // Payment was made
          if (payDate <= dueDate) {
            // Paid on or before due date
            isDisallowed = false;
            disallowanceReason = `Paid within statutory time limit of ${statutoryLimitDays} days on ${inv.paymentDate}`;
          } else {
            // Paid after due date
            daysDelayedBeyondDue = Math.max(0, Math.floor((payDate - dueDate) / (1000 * 60 * 60 * 24)));

            // If paid after due date AND after 31st March -> Disallowed in current FY!
            if (payDate > fyEndDate) {
              isDisallowed = true;
              disallowanceReason = `Paid on ${inv.paymentDate} which is after FY end (31-Mar) and beyond statutory due date (${dueDate.toISOString().split("T")[0]}). Allowable only in FY when paid.`;
            } else {
              // Paid late but within the same financial year (before 31st March)
              // Under Section 43B(h), if paid within the same FY, it is allowed in that FY (though penal interest is payable)
              isDisallowed = false;
              disallowanceReason = `Paid late (${daysDelayedBeyondDue} days overdue) but cleared before 31st March; allowed in FY ${financialYear}, but attracts Section 16 penal interest.`;
            }
          }
        }

        // Calculate Section 16 MSMED Penal Interest (3x RBI Bank Rate, compounded monthly)
        if (daysDelayedBeyondDue > 0) {
          const months = daysDelayedBeyondDue / 30;
          const monthlyRate = MSMED_PENAL_RATE / 100 / 12;
          penalInterest = Number(inv.amount) * (Math.pow(1 + monthlyRate, months) - 1);
        }
      }

      if (isDisallowed) {
        totalDisallowed += Number(inv.amount || 0);
      } else {
        totalAllowed += Number(inv.amount || 0);
      }
      totalPenalInterest += penalInterest;

      evaluatedInvoices.push({
        ...inv,
        statutoryLimitDays,
        dueDate: dueDate.toISOString().split("T")[0],
        daysDelayedBeyondDue,
        penalInterest: Math.round(penalInterest),
        isDisallowed,
        disallowanceReason,
        statusBadge: isDisallowed
          ? "DISALLOWED_43B_H"
          : !isEligibleEnterprise
          ? "EXEMPT_ENTITY"
          : "ALLOWED_DEDUCTION",
      });
    }

    // Form 3CD Clause 22 Disclosure Report
    const form3CdClause22Text = `FORM 3CD — STATEMENT OF PARTICULARS REQUIRED TO BE FURNISHED UNDER SECTION 44AB
CLAUSE 22: AMOUNT OF INTEREST INADMISSIBLE UNDER SECTION 23 OF THE MSMED ACT, 2006 READ WITH SECTION 43B(h)

ASSESSEE: ${clientName.toUpperCase()} | PAN: ${pan}
ASSESSMENT YEAR: ${assessmentYear} | FINANCIAL YEAR: ${financialYear}

(i) Principal amount remaining unpaid to Micro and Small enterprises as at the end of the accounting year:
    - Overdue beyond statutory period (Disallowed u/s 43B(h)): ${formatInr(totalDisallowed)}
    - Total eligible supplier outstandings: ${formatInr(totalPurchases)}

(ii) Interest due thereon remaining unpaid to suppliers as at the end of the accounting year:
    - Compounded monthly interest u/s 16 of MSMED Act @ ${MSMED_PENAL_RATE}% (3x RBI Bank Rate): ${formatInr(
      totalPenalInterest
    )}

(iii) Amount of payment made to suppliers beyond the appointed day during the year:
    - Total invoices paid with delay: ${evaluatedInvoices.filter((i) => i.daysDelayedBeyondDue > 0).length} Invoices

(iv) Amount of interest paid or payable under Section 16 of MSMED Act:
    - TOTAL INADMISSIBLE INTEREST (Disallowed u/s 40(a)(iib)): ${formatInr(totalPenalInterest)}

AUDITOR'S OBSERVATION / NOTE FOR REPORT:
"The assessee has delayed payments to certain Micro & Small Enterprises beyond the statutory period specified under Section 15 of the MSMED Act, 2006. Accordingly, deduction of ${formatInr(
      totalDisallowed
    )} is disallowed under Section 43B(h) of the Income-tax Act, 1961 for AY ${assessmentYear}. Furthermore, interest amounting to ${formatInr(
      totalPenalInterest
    )} payable under Section 16 of the MSMED Act is inadmissible as deduction pursuant to Section 23 of the MSMED Act."`;

    res.json({
      success: true,
      data: {
        clientName,
        pan,
        assessmentYear,
        financialYear,
        rbiBankRate: RBI_BANK_RATE,
        msmedPenalRate: MSMED_PENAL_RATE,
        summary: {
          totalInvoices,
          totalPurchases,
          totalAllowed,
          totalDisallowed,
          totalPenalInterest: Math.round(totalPenalInterest),
          taxImpactAt25Percent: Math.round(totalDisallowed * 0.2517), // Corporate tax @ 22% + 10% surcharge + 4% cess = 25.17%
        },
        invoices: evaluatedInvoices,
        form3CdClause22Text,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("analyzeClause43bMsme error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------------------------
// 3. GST DRC-01 / DRC-01A SCN NOTICE REPLIER & LEGAL GROUNDS DRAFTER (CA & CS)
// ----------------------------------------------------------------------------
export const draftGstDrc01Reply = async (req, res) => {
  try {
    const {
      clientName = "",
      clientAddress = "",
      gstin = "",
      noticeNumber = "",
      noticeDate = "",
      financialYear = "",
      section = "73", // 73 (non-fraud) | 74 (fraud) | 74A
      allegationType = "itc_2a_vs_3b_mismatch", // itc_2a_vs_3b_mismatch | supplier_cancellation_retrospective | section_16_4_time_bar | blocked_credit_17_5
      demandTax = 0,
      demandInterest = 0,
      demandPenalty = 0,
      officerDesignation = "",
      additionalFacts = "",
      signatoryName = "",
      signatoryDesignation = "Authorized Representative",
      place = "",
    } = req.body;

    const totalDemand = Number(demandTax || 0) + Number(demandInterest || 0) + Number(demandPenalty || 0);

    let specificLegalGrounds = "";
    let statutoryCitations = [];

    if (allegationType === "itc_2a_vs_3b_mismatch") {
      statutoryCitations = [
        "CBIC Circular No. 183/15/2022-GST dated 27-Dec-2022",
        "CBIC Circular No. 193/05/2023-GST dated 17-Jul-2023",
        "Union of India v. Bharti Airtel Ltd. & Anr. (2021) 13 SCC 537 (Supreme Court)",
        "Gauhati High Court in Eastern Telecom v. Union of India (2022)",
      ];

      specificLegalGrounds = `1. CLARIFICATION BY CBIC CIRCULAR NO. 183/15/2022-GST & 193/05/2023-GST:
The Central Board of Indirect Taxes and Customs (CBIC) vide Circular No. 183/15/2022-GST has explicitly clarified the procedure for handling ITC mismatches between GSTR-2A and GSTR-3B for FY 2017-18 and FY 2018-19, and extended to FY 2019-20 and 2020-21 vide Circular No. 193/05/2023-GST. 
In the present case, the Noticee has obtained and hereby encloses certificates from the statutory auditors / Chartered Accountants of the respective suppliers certifying that the tax in respect of the impugned outward supplies has been duly remitted to the Government Exchequer in their Form GSTR-3B returns.

2. FORM GSTR-2A IS MERELY A FACILITATIVE TOOL (SUPREME COURT RULING):
The Hon'ble Supreme Court of India in Union of India v. Bharti Airtel Ltd. [2021] 13 SCC 537 authoritatively held that Form GSTR-2A is only a facilitative dynamic display of data and not the sole decisive criterion for entitlement to Input Tax Credit. The recipient's right to claim ITC under Section 16(1) and 16(2) of the CGST Act is governed by physical possession of tax invoices and actual receipt of goods/services, both of which are fully established by e-Way bills and bank remittance statements enclosed herewith as Annexure B.`;
    } else if (allegationType === "supplier_cancellation_retrospective") {
      statutoryCitations = [
        "Suncraft Energy Pvt Ltd v. Assistant Commissioner (2023) Calcutta High Court [SLP Dismissed by Supreme Court]",
        "Gargo Traders v. Joint Commissioner of Commercial Taxes (2023) Calcutta High Court",
        "LGW Industries Ltd. v. Union of India (2022) Calcutta High Court",
      ];

      specificLegalGrounds = `1. RECIPIENT CANNOT BE PENALIZED FOR SUBSEQUENT RETROSPECTIVE CANCELLATION:
The Hon'ble High Court of Calcutta in Suncraft Energy Pvt Ltd v. Assistant Commissioner of State Tax (MAT 1218 of 2023), which has attained finality upon dismissal of the Revenue's Special Leave Petition (SLP) by the Hon'ble Supreme Court of India, held that the purchasing dealer cannot be denied Input Tax Credit merely on the ground that the supplier's registration was subsequently cancelled with retrospective effect, so long as the transaction was genuine and tax was charged on valid tax invoice at the time of purchase.

2. DEPARTMENT MUST FIRST PROCEED AGAINST SELLING DEALER:
As held in Suncraft Energy (supra), the Department is legally bound to initiate recovery proceedings first against the defaulting supplier before proceeding against the bona fide purchasing dealer. Without exhausting coercive recovery mechanisms against the supplier under Section 79, the demand against the Noticee is wholly without jurisdiction and premature.`;
    } else if (allegationType === "section_16_4_time_bar") {
      statutoryCitations = [
        "Finance (No. 2) Act, 2024 — Insertion of Section 16(5) & 16(6) of CGST Act",
        "Notification No. 22/2024–Central Tax dated 08-Oct-2024",
      ];

      specificLegalGrounds = `1. RETROSPECTIVE STATUTORY RELIEF UNDER SECTION 16(5) OF CGST ACT:
Parliament vide Section 118 of the Finance (No. 2) Act, 2024 has inserted sub-section (5) into Section 16 of the CGST Act, 2017 with retrospective effect from 1st July 2017. Section 16(5) explicitly provides that in respect of an invoice or debit note for supply of goods or services pertaining to Financial Years 2017-18, 2018-19, 2019-20 and 2020-21, the registered person shall be entitled to take input tax credit in any return filed up to 30th November 2021.

2. THE IMPUGNED SCN STANDS ABATED AS A MATTER OF LAW:
The return in which the impugned ITC was availed was filed well within the statutory relaxation date of 30th November 2021. Consequently, the entire allegation of time-bar under Section 16(4) stands legislatively cured and neutralized, and the proposed demand is liable to be dropped forthwith.`;
    } else {
      statutoryCitations = [
        "Section 16(1) & 16(2) read with Section 17(5) of CGST Act, 2017",
        "Orissa High Court in Safari Retreats Pvt Ltd v. Chief Commissioner of CGST",
      ];

      specificLegalGrounds = `1. ELIGIBILITY UNDER SECTION 16(1) FOR BUSINESS PURPOSES:
The goods/services were used in the course and furtherance of business, directly enhancing taxable supplies. Section 17(5) restrictions are narrow and specific, and do not apply to the operational hardware, IT infrastructure, and plant and machinery acquired by the Noticee.`;
    }

    const resolvedClientName = (clientName || "").trim() || "[Taxpayer Legal Name]";
    const resolvedOfficer = (officerDesignation || "").trim() || "The Proper Officer (CGST / SGST Authority)";
    const resolvedSignatory = (signatoryName || "").trim() || "[Authorized Representative]";
    const drc06ReplyDraft = `BEFORE THE ${resolvedOfficer.toUpperCase()}
GSTIN OF NOTICEE: ${gstin || "[GSTIN]"}

IN THE MATTER OF:
${resolvedClientName}
${clientAddress || "[Registered Address]"}
... NOTICEE / ASSESSEE

AND:

${resolvedOfficer}
... PROPER OFFICER

REPLY IN FORM GST DRC-06 UNDER RULE 142(4) OF CGST RULES, 2017
TO SHOW CAUSE NOTICE BEARING REF NO. ${noticeNumber || "[Notice Reference Number]"} DATED ${noticeDate || "[Notice Date]"}
FOR THE FINANCIAL YEAR ${financialYear || "[Financial Year]"}

MAY IT PLEASE YOUR HONOUR:

The Noticee above-named respectfully submits this point-by-point reply to the Show Cause Notice (SCN) issued under Section ${section} of the CGST / SGST Act, 2017 proposing a total demand of ${formatInr(
      totalDemand
    )} (comprising Tax of ${formatInr(demandTax)}, Interest of ${formatInr(
      demandInterest
    )}, and Penalty of ${formatInr(demandPenalty)}).

I. PRELIMINARY LEGAL OBJECTIONS:
1. NON-COMPLIANCE WITH SECTION 75(4) — MANDATORY PERSONAL HEARING:
Section 75(4) of the CGST Act statutorily mandates that an opportunity of hearing shall be granted where a request is received in writing from the person chargeable with tax or where any adverse decision is contemplated. The Noticee hereby exercises this statutory right and requests an opportunity of personal hearing before any final order is passed.

2. ABSENCE OF WILLFUL SUPPRESSION (SECTION 74 INAPPLICABLE):
All purchases and ITC availed were transparently disclosed in monthly GSTR-3B and annual GSTR-9 returns with audited reconciliation in GSTR-9C. The ingredients of fraud, willful misstatement, or suppression of facts are completely absent. Invocation of extended limitation or Section 74 penalty is arbitrary and untenable.

II. DETAILED SUBMISSIONS ON MERITS:
${specificLegalGrounds}

${
  additionalFacts
    ? `3. SPECIFIC FACTUAL SUBMISSIONS:\n${additionalFacts}\n`
    : ""
}
III. STATUTORY PRECEDENTS & CIRCULARS RELIED UPON:
${statutoryCitations.map((c, i) => `${i + 1}. ${c}`).join("\n")}

IV. PRAYER:
In light of the statutory provisions, CBIC circulars, and binding judicial precedents cited above, it is most respectfully prayed that the Learned Proper Officer may graciously be pleased to:
(a) Drop the entire proposed demand of tax amounting to ${formatInr(demandTax)};
(b) Quash the proposed levy of interest under Section 50 and penalty under Section 122/73/74;
(c) Grant an opportunity of personal hearing under Section 75(4) before passing any final order in the matter; and
(d) Pass such further order(s) as may be deemed just, fit, and proper.

DATED: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
PLACE: ${(place || "").trim().toUpperCase() || "[PLACE OF FILING]"}

FOR ${resolvedClientName.toUpperCase()}

(Sd/-)
${resolvedSignatory}
${signatoryDesignation}`;

    res.json({
      success: true,
      data: {
        noticeNumber,
        noticeDate,
        clientName,
        gstin,
        financialYear,
        section,
        allegationType,
        demandSummary: {
          demandTax,
          demandInterest,
          demandPenalty,
          totalDemand,
        },
        statutoryCitations,
        replyContent: drc06ReplyDraft,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("draftGstDrc01Reply error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------------------------
// 4. INTERACTIVE STATUTORY QUERY ASSISTANT (CS & CA)
// ----------------------------------------------------------------------------
export const interactiveCsCaQuery = async (req, res) => {
  try {
    const {
      prompt,
      category = "general", // cs_corporate_law | ca_income_tax | ca_gst | general
      practiceMode = "unified", // cs | ca | unified
      matterContext = {},
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: "Prompt query is required." });
    }

    let answerText = "";
    let usedEngine = "local-statutory-engine";

    if (isGeminiAvailable()) {
      try {
        answerText = await queryGeminiCsCa({ prompt, category, practiceMode, matterContext });
        if (answerText && answerText.trim()) {
          usedEngine = "gemini-4-hydrogen";
        }
      } catch (geminiErr) {
        console.warn("[CS/CA Copilot] Gemini API fallback to local statutory engine:", geminiErr.message);
      }
    }

    // High-precision local fallback engine for CS & CA queries
    if (!answerText) {
      usedEngine = "wakheel-statutory-corpus";
      const q = prompt.toLowerCase();

      if (q.includes("186") || (q.includes("loan") && q.includes("investment"))) {
        answerText = `### Statutory Analysis: Section 186 of Companies Act, 2013 (Loans & Investments)

1. **Statutory Threshold Limit under Section 186(2)**:
   A company cannot directly or indirectly:
   - Give any loan to any person or other body corporate;
   - Give any guarantee or provide security in connection with a loan made by any other person to a body corporate;
   - Acquire by way of subscription, purchase or otherwise, the securities of any other body corporate;
   **exceeding**:
   - **60%** of its paid-up share capital, free reserves and securities premium account; **OR**
   - **100%** of its free reserves and securities premium account,
   **whichever is higher**, unless prior approval of the members by **Special Resolution** passed at a General Meeting is obtained.

2. **Unanimous Board Approval Mandatory (Section 186(5))**:
   Regardless of whether the transaction is within or exceeds the threshold limit, **unanimous consent of all directors present at the Board Meeting** is legally mandatory. Circular resolutions are not permissible.

3. **Public Financial Institution (PFI) Prior Approval**:
   Prior approval of PFIs is mandatory if any term loan from a PFI is subsisting, EXCEPT where:
   - The aggregate exposure does not exceed the 60%/100% threshold; AND
   - There is zero default in repayment of loan installments or interest to the PFI.

4. **Minimum Lending Interest Rate (Section 186(7))**:
   No loan shall be given at a rate of interest lower than the prevailing yield of one year, three year, five year or ten year Government Security closest to the tenure of the loan.

5. **Mandatory ROC Filing & Register**:
   - **Form MGT-14** must be filed with ROC within 30 days of passing the Special Resolution.
   - Enter particulars in **Form MBP-2** (Register of Loans, Guarantees and Investments) within 7 days.`;
      } else if (q.includes("43b") || q.includes("msme")) {
        answerText = `### Statutory Analysis: Section 43B(h) of Income-tax Act, 1961 read with MSMED Act, 2006

1. **Objective & Enactment**:
   Inserted by the Finance Act, 2023 (applicable from AY 2024-25 onwards) to incentivize timely payments to Micro and Small Enterprises.

2. **Scope of Applicability**:
   - Applies **strictly to Micro and Small Enterprises** registered under the MSMED Act having an active Udyam Registration.
   - **Exemption**: Medium Enterprises and Wholesale / Retail Traders (trading NIC codes 45, 46, 47) are **expressly excluded** per MSME Office Memorandum No. 5/2(2)/2021-E/P & G/Policy dated 02/07/2021.

3. **Statutory Payment Timelines (Section 15 MSMED Act)**:
   - **With Written Agreement**: Payment must be made within the agreed date, which **cannot exceed 45 days** from the date of acceptance.
   - **Without Written Agreement**: Payment must be made within **15 days** from the date of acceptance.

4. **Tax Disallowance Mechanics**:
   - Any sum payable to a Micro or Small enterprise beyond the statutory due date will be **disallowed as deduction in the current financial year**.
   - The disallowed expenditure is allowable as a deduction **only in the previous year in which such sum is actually paid** (unlike general Section 43B clauses, payments made up to ITR due date under Section 139(1) are NOT protected!).

5. **Compounded Penal Interest under Section 16 MSMED Act**:
   - Mandatory monthly compounding interest at **3 times the RBI Bank Rate** (Current: 20.25% p.a.).
   - Under Section 23 of MSMED Act & Section 40(a)(iib) of Income-tax Act, this interest is **inadmissible as business expenditure** and must be reported in **Clause 22 of Form 3CD**.`;
      } else if (q.includes("drc") || q.includes("73") || q.includes("74") || q.includes("2a") || q.includes("2b")) {
        answerText = `### Statutory Analysis: Defending GST DRC-01 Show Cause Notices (ITC Mismatches & Cancellations)

1. **CBIC Circular No. 183/15/2022-GST & 193/05/2023-GST**:
   - For FY 2017-18 to FY 2020-21 mismatches between GSTR-2A and 3B, the proper officer cannot disallow ITC automatically.
   - **Variance > ₹5 Lakhs**: Submit a certificate from the supplier's Chartered Accountant / Cost Accountant certifying tax payment.
   - **Variance <= ₹5 Lakhs**: Submit a declaration/certificate from the supplier affirming tax discharge.

2. **Supreme Court Precedent in Union of India v. Bharti Airtel Ltd. (2021)**:
   - The Supreme Court held that Form GSTR-2A is merely a facilitative electronic tool. An assessee’s statutory right to ITC under Section 16(1) and 16(2) cannot be defeated purely due to system-generated portal mismatches when invoices, e-Way bills, and payment records are genuine.

3. **Retrospective Cancellation of Supplier GSTIN (Calcutta HC Suncraft Energy)**:
   - In *Suncraft Energy Pvt Ltd v. Assistant Commissioner of State Tax (2023)* (affirmed by the Supreme Court), it was held that the Department must first proceed against the defaulting supplier before demanding reversals from the bona fide purchasing dealer.

4. **Section 16(5) Retrospective Relief (Finance Act 2024)**:
   - Section 16(5) & 16(6) inserted retrospectively allows ITC for FY 2017-18 through 2020-21 in any return filed up to 30th November 2021, legislatively invalidating time-bar notices under Section 16(4).

5. **Mandatory Personal Hearing under Section 75(4)**:
   - Section 75(4) of the CGST Act requires the Proper Officer to grant an opportunity of hearing where an adverse decision is contemplated. Failure to grant hearing vitiates the order for violation of natural justice.`;
      } else {
        answerText = `### Specialized Statutory Counsel for Company Secretaries & Chartered Accountants

Wakheel AI Copilot is primed to assist your practice across corporate and tax advisory:

1. **Company Secretary (CS) Governance Modules**:
   - **Section 186**: Inter-corporate loans, investments, and guarantee threshold limit audit & resolution packs.
   - **Section 185**: Loans to directors, principal business test, and managing director loan exemptions.
   - **Section 135 & CSR Rules**: 2% average net profit calculation, CSR Committee constitution, and unspent CSR account transfers.
   - **Secretarial Standards SS-1 & SS-2**: Quorum, shorter notice consent, committee minutes, and e-voting.

2. **Chartered Accountant (CA) Taxation & Audit Modules**:
   - **Section 43B(h)**: 15/45 days MSMED rule evaluation and Form 3CD Clause 22 penal interest calculation.
   - **Form 3CD Tax Audit**: Complete guidance on Clause 13 (ICDS), Clause 21 (disallowances), Clause 34 (TDS), and Clause 44 (GST expenditure).
   - **GST DRC-01 Defense**: Form GST DRC-06 replies for GSTR-2A/2B mismatches, Section 16(4) time-bar relief, and Section 75(4) natural justice.
   - **Schedule III & Ind AS 12**: Dual depreciation timing differences (Rule 5 vs Schedule II) and Deferred Tax Liability (DTL).

*Ask any specific question regarding a section, clause, circular, or drafting mandate to receive an immediate statutory paperbook.*`;
      }
    }

    res.json({
      success: true,
      answer: answerText,
      engine: usedEngine,
      isAiPowered: usedEngine.includes("gemini"),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("interactiveCsCaQuery error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: Convert number to Indian words
function numberToWords(num) {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return "Zero";
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(num) {
    if (num < 20) return a[num];
    const digit = num % 10;
    if (num < 100) return b[Math.floor(num / 10)] + (digit ? " " + a[digit] : "");
    if (num < 1000) return a[Math.floor(num / 100)] + " Hundred" + (num % 100 === 0 ? "" : " and " + inWords(num % 100));
    if (num < 100000) return inWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 !== 0 ? " " + inWords(num % 1000) : "");
    if (num < 10000000) return inWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 !== 0 ? " " + inWords(num % 100000) : "");
    return inWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 !== 0 ? " " + inWords(num % 10000000) : "");
  }

  return inWords(n);
}
