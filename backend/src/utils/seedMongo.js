import { User } from "../models/User.js";
import { AdvocateProfile } from "../models/AdvocateProfile.js";
import { CitizenProfile } from "../models/CitizenProfile.js";
import { Matter } from "../models/Matter.js";
import { CauseList } from "../models/CauseList.js";
import { Invoice } from "../models/Invoice.js";
import { Consultation } from "../models/Consultation.js";
import { Grievance } from "../models/Grievance.js";
import { CalendarEvent } from "../models/CalendarEvent.js";
import { CalendarBacklog } from "../models/CalendarBacklog.js";
import { NetworkContact } from "../models/NetworkContact.js";
import { NetworkActivity } from "../models/NetworkActivity.js";
import { TaskMiteTask } from "../models/TaskMiteTask.js";
import { TaskMiteNote } from "../models/TaskMiteNote.js";
import { BoardMeeting } from "../models/BoardMeeting.js";
import { BoardResolution } from "../models/BoardResolution.js";
import { CorporateEntity } from "../models/CorporateEntity.js";
import { RocFiling } from "../models/RocFiling.js";
import { StatutoryRegister } from "../models/StatutoryRegister.js";
import { CorporateContract } from "../models/CorporateContract.js";
import { RetainerAdvocate } from "../models/RetainerAdvocate.js";
import { CorporateVaultItem } from "../models/CorporateVaultItem.js";
import { SecretarialInvoice } from "../models/SecretarialInvoice.js";
import { IncomeTaxReturn } from "../models/IncomeTaxReturn.js";
import { GstReturn } from "../models/GstReturn.js";
import { TaxAudit3CD } from "../models/TaxAudit3CD.js";
import { BalanceSheetRecon } from "../models/BalanceSheetRecon.js";
import { DscCertificate } from "../models/DscCertificate.js";
import { StatutoryChallan } from "../models/StatutoryChallan.js";
import { BoardDossier } from "../models/BoardDossier.js";
import { DueDiligenceAudit } from "../models/DueDiligenceAudit.js";
import { StatutoryNotice } from "../models/StatutoryNotice.js";

import {
  DEFAULT_CALENDAR_FIXTURES,
  DEFAULT_CALENDAR_BACKLOG,
  DEFAULT_NETWORK_CONTACTS,
  DEFAULT_NETWORK_ACTIVITIES,
  DEFAULT_TASKMITE_TASKS,
  DEFAULT_TASKMITE_NOTES,
  DEFAULT_BOARD_MEETINGS,
  DEFAULT_BOARD_RESOLUTIONS,
  DEFAULT_CORPORATE_ENTITIES,
  DEFAULT_ROC_FILINGS,
  DEFAULT_STATUTORY_REGISTERS,
  DEFAULT_CORPORATE_CONTRACTS,
  DEFAULT_RETAINER_ADVOCATES,
  DEFAULT_CORPORATE_VAULT_ITEMS,
  DEFAULT_SECRETARIAL_INVOICES,
  DEFAULT_INCOME_TAX_RETURNS,
  DEFAULT_GST_RETURNS,
  DEFAULT_TAX_AUDIT_3CD,
  DEFAULT_BALANCE_SHEET_RECONS,
  DEFAULT_DSC_CERTIFICATES,
  DEFAULT_STATUTORY_CHALLANS,
  DEFAULT_BOARD_DOSSIERS,
  DEFAULT_DUE_DILIGENCE_AUDITS,
  DEFAULT_STATUTORY_NOTICES,
} from "./devStore.js";

export const seedMongoIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("🌱 Seeding MongoDB initial Users & Profiles...");
      const advocateUser = await User.create({
        fullName: "Adv. Meera Krishnan",
        email: "advocate@inworth.legal",
        password: "$2a$10$wI5f6uT8rN9yB1p8.3uT2.xO3J7uL9f4bT2i8y7uT6rN5yB4p3uT2", // demo hash
        role: "advocate",
        barEnrollmentNumber: "K/001429/2012",
        phone: "+91 94471 28910",
        isVerified: true,
      });

      const citizenUser = await User.create({
        fullName: "Sri. Gopakumar Nambiar",
        email: "citizen@inworth.legal",
        password: "$2a$10$wI5f6uT8rN9yB1p8.3uT2.xO3J7uL9f4bT2i8y7uT6rN5yB4p3uT2",
        role: "citizen",
        phone: "+91 98470 12345",
        isVerified: true,
      });

      await AdvocateProfile.create({
        userId: advocateUser._id,
        barCouncilId: "K/001429/2012",
        chamberName: "Krishnan & Chambers Legal",
        primaryCourt: "High Court of Kerala",
        specializations: ["Constitutional Writs", "Commercial Arbitration", "Civil Injunctions"],
        experienceYears: 14,
        officeAddress: "Chamber #412, Marine Drive, Kochi, Kerala - 682031",
      });

      await CitizenProfile.create({
        userId: citizenUser._id,
        aadhaarVerified: true,
        address: "Nambiar Heritage, Kakkanad, Ernakulam, Kerala - 682030",
      });
    }

    const matterCount = await Matter.countDocuments();
    if (matterCount === 0) {
      console.log("🌱 Seeding MongoDB initial Matters & Hearings...");
      await Matter.create([
        {
          citizenId: "cit_1",
          assignedAdvocateId: "adv_1",
          advocateName: "Adv. Meera Krishnan",
          matterTitle: "Writ Petition challenging 110kV KSEB Transmission Line realignment across private orchard",
          caseTitle: "Gopakumar Nambiar v. Kerala State Electricity Board & Ors.",
          matterType: "Writ Petition (Civil)",
          caseNumber: "WP(C) 19482/2024",
          cnrNumber: "KLHC01-019482-2024",
          courtForum: "High Court of Kerala (Ernakulam)",
          courtHall: "Court Hall 3A (Item #14)",
          bench: "Division Bench",
          petitioner: "Gopakumar Nambiar",
          respondent: "Kerala State Electricity Board Ltd.",
          status: "Admitted & Stay Granted",
          filingDate: new Date("2024-10-18"),
          nextHearingDate: new Date("2026-10-30"),
        },
        {
          citizenId: "cit_2",
          assignedAdvocateId: "adv_1",
          advocateName: "Adv. Meera Krishnan",
          matterTitle: "Civil Original Suit for Perpetual Prohibitory Injunction regarding Kanayannur boundary easement",
          caseTitle: "Devika Menon v. K. R. Madhavan & Ors.",
          matterType: "Original Petition (Civil)",
          caseNumber: "OP 412/2026",
          cnrNumber: "KLHC01-000412-2026",
          courtForum: "Sub-Court, Ernakulam",
          courtHall: "Court Hall 2",
          bench: "Single Bench",
          petitioner: "Devika Menon",
          respondent: "K. R. Madhavan",
          status: "Pre-Trial Scrutiny",
          filingDate: new Date("2026-03-12"),
          nextHearingDate: new Date("2026-10-30"),
        },
      ]);
    }

    // Seed Calendar Fixtures
    const calCount = await CalendarEvent.countDocuments();
    if (calCount === 0) {
      console.log("🌱 Seeding MongoDB Calendar Fixtures...");
      const calDocs = DEFAULT_CALENDAR_FIXTURES.map((item) => ({
        eventId: item.id,
        userId: "adv_1",
        title: item.title,
        category: item.category,
        date: item.date,
        time: item.time,
        duration: item.duration,
        caseNumber: item.caseNumber,
        forum: item.forum,
        clientName: item.clientName,
        notes: item.notes,
        status: item.status,
      }));
      await CalendarEvent.insertMany(calDocs);
    }

    // Seed Calendar Backlog
    const backlogCount = await CalendarBacklog.countDocuments();
    if (backlogCount === 0) {
      console.log("🌱 Seeding MongoDB Calendar Backlog...");
      const bDocs = DEFAULT_CALENDAR_BACKLOG.map((item) => ({
        taskId: item.id,
        userId: "adv_1",
        title: item.title,
        category: item.category,
        priority: item.priority,
        estimatedTime: item.estimatedTime,
        caseRef: item.caseRef,
      }));
      await CalendarBacklog.insertMany(bDocs);
    }

    // Seed Network Contacts
    const netCount = await NetworkContact.countDocuments();
    if (netCount === 0) {
      console.log("🌱 Seeding MongoDB Professional Network Contacts...");
      const nDocs = DEFAULT_NETWORK_CONTACTS.map((item) => ({
        contactId: item.id,
        userId: "adv_1",
        name: item.name,
        degree: item.degree || "1st",
        role: item.role,
        chamber: item.chamber,
        bench: item.bench,
        court: item.court || item.bench,
        location: item.location,
        stage: item.stage,
        practiceArea: item.practiceArea,
        source: item.source,
        mutualsCount: item.mutualsCount || 0,
        statusQuote: item.statusQuote,
        lastActive: item.lastActive,
        isOnline: Boolean(item.isOnline),
        barEnrollment: item.barEnrollment,
        phone: item.phone,
        email: item.email,
        rating: item.rating || 4.8,
        feeText: item.feeText,
        assignedMatterNo: item.assignedMatterNo,
        assignedMatterTitle: item.assignedMatterTitle,
        nextHearingDate: item.nextHearingDate,
        briefsCount: item.briefsCount || 0,
      }));
      await NetworkContact.insertMany(nDocs);
    }

    // Seed Task Mite Tasks
    const taskCount = await TaskMiteTask.countDocuments();
    if (taskCount === 0) {
      console.log("🌱 Seeding MongoDB Task Mite Tasks...");
      const tDocs = DEFAULT_TASKMITE_TASKS.map((item) => ({
        taskId: item.id,
        userId: "adv_1",
        title: item.title,
        caseMatter: item.caseMatter,
        status: item.status,
        type: item.type,
        dueDate: item.dueDate,
        dueTime: item.dueTime,
        isDueUrgent: Boolean(item.isDueUrgent),
        priority: item.priority,
        assignee: item.assignee,
        notes: item.notes,
        completedAt: item.completedAt,
      }));
      await TaskMiteTask.insertMany(tDocs);
    }

    // Seed Task Mite Notes
    const noteCount = await TaskMiteNote.countDocuments();
    if (noteCount === 0) {
      console.log("🌱 Seeding MongoDB Task Mite Notes...");
      const noteDocs = DEFAULT_TASKMITE_NOTES.map((item) => ({
        noteId: item.id,
        userId: "adv_1",
        title: item.title,
        category: item.category,
        categoryLabel: item.categoryLabel,
        content: item.content,
        tags: item.tags,
        updatedAt: item.updatedAt,
        isPinned: Boolean(item.isPinned),
      }));
      await TaskMiteNote.insertMany(noteDocs);
    }

    // Seed Board Meetings
    const meetingCount = await BoardMeeting.countDocuments();
    if (meetingCount === 0) {
      console.log("🌱 Seeding MongoDB CS Board Meetings (SS-1)...");
      const mDocs = DEFAULT_BOARD_MEETINGS.map((item) => ({
        meetingId: item.id,
        userId: "cs_1",
        companyName: item.companyName,
        cin: item.cin,
        meetingNumber: item.meetingNumber,
        meetingType: item.meetingType,
        date: item.date,
        time: item.time,
        venue: item.venue,
        isVideoConference: item.isVideoConference,
        chairperson: item.chairperson,
        directors: item.directors,
        isShorterNotice: item.isShorterNotice,
        shorterNoticeReason: item.shorterNoticeReason,
        status: item.status,
        agendaItems: item.agendaItems,
        minutes: item.minutes,
      }));
      await BoardMeeting.insertMany(mDocs);
    }

    // Seed Board Resolutions
    const resCount = await BoardResolution.countDocuments();
    if (resCount === 0) {
      console.log("🌱 Seeding MongoDB CS Board Resolutions & CTCs...");
      const rDocs = DEFAULT_BOARD_RESOLUTIONS.map((item) => ({
        resolutionId: item.id,
        userId: "cs_1",
        meetingId: item.meetingId,
        companyName: item.companyName,
        cin: item.cin,
        resolutionNumber: item.resolutionNumber,
        type: item.type,
        category: item.category,
        title: item.title,
        actSection: item.actSection,
        preambleText: item.preambleText,
        resolutionText: item.resolutionText,
        furtherResolutionText: item.furtherResolutionText,
        authorizedSignatories: item.authorizedSignatories,
        status: item.status,
        isCtcGenerated: item.isCtcGenerated,
        ctcCertifiedBy: item.ctcCertifiedBy,
        ctcCertifiedAt: item.ctcCertifiedAt,
      }));
      await BoardResolution.insertMany(rDocs);
    }

    // Seed Corporate Entities
    const entCount = await CorporateEntity.countDocuments();
    if (entCount === 0) {
      console.log("🌱 Seeding MongoDB CS Corporate Entities...");
      const entDocs = DEFAULT_CORPORATE_ENTITIES.map((item) => ({
        entityId: item.id,
        userId: "cs_1",
        companyName: item.companyName,
        cin: item.cin,
        rocJurisdiction: item.rocJurisdiction,
        entityType: item.entityType,
        incorporationDate: item.incorporationDate,
        authorizedCapital: item.authorizedCapital,
        paidUpCapital: item.paidUpCapital,
        registeredAddress: item.registeredAddress,
        email: item.email,
        pan: item.pan,
        gstin: item.gstin,
        directors: item.directors,
        financialYearEnd: item.financialYearEnd,
        complianceHealthScore: item.complianceHealthScore,
        status: item.status,
      }));
      await CorporateEntity.insertMany(entDocs);
    }

    // Seed ROC Filings
    const rocCount = await RocFiling.countDocuments();
    if (rocCount === 0) {
      console.log("🌱 Seeding MongoDB CS MCA21 & ROC Statutory Filings...");
      const rocDocs = DEFAULT_ROC_FILINGS.map((item) => ({
        filingId: item.id,
        userId: "cs_1",
        companyName: item.companyName,
        cin: item.cin,
        formName: item.formName,
        formDescription: item.formDescription,
        financialYear: item.financialYear,
        statutorySection: item.statutorySection,
        dueDate: item.dueDate,
        filingDate: item.filingDate,
        status: item.status,
        srn: item.srn,
        challanAmount: item.challanAmount,
        lateFeeAmount: item.lateFeeAmount,
        paymentStatus: item.paymentStatus,
        signatoryDin: item.signatoryDin,
        signatoryName: item.signatoryName,
        pcsCertificateNumber: item.pcsCertificateNumber,
        attachmentCount: item.attachmentCount,
        notes: item.notes,
      }));
      await RocFiling.insertMany(rocDocs);
    }

    // Seed Statutory Registers
    const regCount = await StatutoryRegister.countDocuments();
    if (regCount === 0) {
      console.log("🌱 Seeding MongoDB CS Statutory Registers...");
      const regDocs = DEFAULT_STATUTORY_REGISTERS.map((item) => ({
        registerEntryId: item.id,
        userId: "cs_1",
        companyName: item.companyName,
        cin: item.cin,
        registerType: item.registerType,
        statutoryForm: item.statutoryForm,
        folioOrRefNumber: item.folioOrRefNumber,
        primaryHolderName: item.primaryHolderName,
        identificationNumber: item.identificationNumber,
        entryDate: item.entryDate,
        particulars: item.particulars,
        quantityOrAmount: item.quantityOrAmount,
        distinctiveFrom: item.distinctiveFrom,
        distinctiveTo: item.distinctiveTo,
        certificateNumber: item.certificateNumber,
        status: item.status,
        certifiedBy: item.certifiedBy,
        certifiedAt: item.certifiedAt,
      }));
      await StatutoryRegister.insertMany(regDocs);
    }

    // Seed Corporate Contracts
    const contCount = await CorporateContract.countDocuments();
    if (contCount === 0) {
      console.log("🌱 Seeding MongoDB CS Commercial Contracts & SHAs...");
      const contDocs = DEFAULT_CORPORATE_CONTRACTS.map((item) => ({
        contractId: item.id,
        userId: "cs_1",
        companyName: item.companyName,
        title: item.title,
        contractType: item.contractType,
        parties: item.parties,
        effectiveDate: item.effectiveDate,
        expiryDate: item.expiryDate,
        contractValue: item.contractValue,
        stampDutyPaid: item.stampDutyPaid,
        eStampCertificateNumber: item.eStampCertificateNumber,
        governingLaw: item.governingLaw,
        keyClauses: item.keyClauses,
        status: item.status,
        notes: item.notes,
      }));
      await CorporateContract.insertMany(contDocs);
    }

    // Seed Retainer Advocates
    const advCount = await RetainerAdvocate.countDocuments();
    if (advCount === 0) {
      console.log("🌱 Seeding MongoDB CS Retainer Advocates...");
      const advDocs = DEFAULT_RETAINER_ADVOCATES.map((item) => ({
        advocateId: item.id,
        userId: "cs_1",
        fullName: item.fullName,
        barEnrollmentNumber: item.barEnrollmentNumber,
        primaryJurisdiction: item.primaryJurisdiction,
        specialization: item.specialization,
        email: item.email,
        phone: item.phone,
        retainerFee: item.retainerFee,
        appearanceRatePerHearing: item.appearanceRatePerHearing,
        activeBriefsCount: item.activeBriefsCount,
        status: item.status,
      }));
      await RetainerAdvocate.insertMany(advDocs);
    }

    // Seed Corporate Vault Items
    const vltCount = await CorporateVaultItem.countDocuments();
    if (vltCount === 0) {
      console.log("🌱 Seeding MongoDB CS Corporate Vault Charters & DSC...");
      const vltDocs = DEFAULT_CORPORATE_VAULT_ITEMS.map((item) => ({
        vaultId: item.id,
        userId: "cs_1",
        companyName: item.companyName,
        docType: item.docType,
        title: item.title,
        fileSize: item.fileSize,
        uploadedAt: item.uploadedAt,
        validUntil: item.validUntil,
        holderName: item.holderName,
        issuingAuthority: item.issuingAuthority,
        status: item.status,
      }));
      await CorporateVaultItem.insertMany(vltDocs);
    }

    // Seed Secretarial Invoices
    const invCount = await SecretarialInvoice.countDocuments();
    if (invCount === 0) {
      console.log("🌱 Seeding MongoDB CS Fee Notes & Retainer Invoices...");
      const invDocs = DEFAULT_SECRETARIAL_INVOICES.map((item) => ({
        invoiceId: item.id,
        userId: "cs_1",
        invoiceNumber: item.invoiceNumber,
        clientCompanyName: item.clientCompanyName,
        clientGstin: item.clientGstin,
        sacCode: item.sacCode,
        billingType: item.billingType,
        items: item.items,
        subtotal: item.subtotal,
        gstRate: item.gstRate,
        gstAmount: item.gstAmount,
        totalAmount: item.totalAmount,
        dueDate: item.dueDate,
        status: item.status,
      }));
      await SecretarialInvoice.insertMany(invDocs);
    }

    // Seed CA Income Tax Returns
    const itrCount = await IncomeTaxReturn.countDocuments();
    if (itrCount === 0) {
      console.log("🌱 Seeding MongoDB CA Income Tax Returns & ITRs...");
      const itrDocs = DEFAULT_INCOME_TAX_RETURNS.map((item) => ({
        itrId: item.id,
        userId: "ca_1",
        clientName: item.clientName,
        pan: item.pan,
        assessmentYear: item.assessmentYear,
        financialYear: item.financialYear,
        itrForm: item.itrForm,
        grossTotalIncome: item.grossTotalIncome,
        deductionsChapterVIA: item.deductionsChapterVIA,
        taxableIncome: item.taxableIncome,
        taxPayable: item.taxPayable,
        tdsTcsCredit: item.tdsTcsCredit,
        advanceTaxPaid: item.advanceTaxPaid,
        selfAssessmentTax: item.selfAssessmentTax,
        refundDueOrPayable: item.refundDueOrPayable,
        aisReconciliationStatus: item.aisReconciliationStatus,
        filingDueDate: item.filingDueDate,
        filingDate: item.filingDate,
        acknowledgementNumber: item.acknowledgementNumber,
        status: item.status,
        notes: item.notes,
      }));
      await IncomeTaxReturn.insertMany(itrDocs);
    }

    // Seed CA GST Returns
    const gstCount = await GstReturn.countDocuments();
    if (gstCount === 0) {
      console.log("🌱 Seeding MongoDB CA GST Returns...");
      const gstDocs = DEFAULT_GST_RETURNS.map((item) => ({
        gstReturnId: item.id,
        userId: "ca_1",
        clientName: item.clientName,
        gstin: item.gstin,
        returnType: item.returnType,
        returnPeriod: item.returnPeriod,
        dueDate: item.dueDate,
        filingDate: item.filingDate,
        taxableTurnover: item.taxableTurnover,
        igstAmount: item.igstAmount,
        cgstAmount: item.cgstAmount,
        sgstAmount: item.sgstAmount,
        totalTaxLiability: item.totalTaxLiability,
        itcClaimed: item.itcClaimed,
        itcAvailable2B: item.itcAvailable2B,
        itcDifference: item.itcDifference,
        arn: item.arn,
        status: item.status,
        notes: item.notes,
      }));
      await GstReturn.insertMany(gstDocs);
    }

    // Seed CA Tax Audit 3CD Reports
    const audCount = await TaxAudit3CD.countDocuments();
    if (audCount === 0) {
      console.log("🌱 Seeding MongoDB CA Tax Audit 3CD & UDIN Reports...");
      const audDocs = DEFAULT_TAX_AUDIT_3CD.map((item) => ({
        auditId: item.id,
        userId: "ca_1",
        clientName: item.clientName,
        pan: item.pan,
        financialYear: item.financialYear,
        assessmentYear: item.assessmentYear,
        auditType: item.auditType,
        turnover: item.turnover,
        grossProfitRatio: item.grossProfitRatio,
        netProfitRatio: item.netProfitRatio,
        disallowanceSec43B: item.disallowanceSec43B,
        disallowanceSec40A3: item.disallowanceSec40A3,
        disallowanceSec40aia: item.disallowanceSec40aia,
        totalDisallowances: item.totalDisallowances,
        udin: item.udin,
        caFirmName: item.caFirmName,
        caPartnerName: item.caPartnerName,
        caMembershipNumber: item.caMembershipNumber,
        caFirmRegistrationNumber: item.caFirmRegistrationNumber,
        auditOpinion: item.auditOpinion,
        status: item.status,
        notes: item.notes,
      }));
      await TaxAudit3CD.insertMany(audDocs);
    }

    // Seed CA Balance Sheet Reconciliations
    const bsCount = await BalanceSheetRecon.countDocuments();
    if (bsCount === 0) {
      console.log("🌱 Seeding MongoDB CA Balance Sheet Reconciliations...");
      const bsDocs = DEFAULT_BALANCE_SHEET_RECONS.map((item) => ({
        reconId: item.id,
        userId: "ca_1",
        clientName: item.clientName,
        financialYear: item.financialYear,
        accountingStandard: item.accountingStandard,
        totalAssets: item.totalAssets,
        totalLiabilities: item.totalLiabilities,
        shareCapital: item.shareCapital,
        reservesAndSurplus: item.reservesAndSurplus,
        longTermBorrowings: item.longTermBorrowings,
        tradePayables: item.tradePayables,
        tangibleFixedAssets: item.tangibleFixedAssets,
        cashAndBank: item.cashAndBank,
        bookDepreciationScheduleII: item.bookDepreciationScheduleII,
        taxDepreciationRule5: item.taxDepreciationRule5,
        depreciationDifference: item.depreciationDifference,
        deferredTaxAssetLiability: item.deferredTaxAssetLiability,
        reconciliationNotes: item.reconciliationNotes,
        status: item.status,
      }));
      await BalanceSheetRecon.insertMany(bsDocs);
    }

    // Seed Class 3 DSC Certificates
    const dscCount = await DscCertificate.countDocuments();
    if (dscCount === 0) {
      console.log("🌱 Seeding MongoDB Class 3 DSC Certificates...");
      const dscDocs = DEFAULT_DSC_CERTIFICATES.map((item) => ({
        certificateId: item.certificateId,
        userId: item.userId,
        holderName: item.holderName,
        holderRole: item.holderRole,
        pan: item.pan,
        membershipNumber: item.membershipNumber,
        din: item.din,
        tokenProvider: item.tokenProvider,
        hardwareModel: item.hardwareModel,
        serialNumber: item.serialNumber,
        issuerCa: item.issuerCa,
        validFrom: item.validFrom,
        validTo: item.validTo,
        keyAlgorithm: item.keyAlgorithm,
        keyUsage: item.keyUsage,
        tokenStatus: item.tokenStatus,
        totalSignaturesAffixed: item.totalSignaturesAffixed,
        lastUsedAt: item.lastUsedAt,
      }));
      await DscCertificate.insertMany(dscDocs);
    }

    // Seed Statutory E-Challans
    const chlCount = await StatutoryChallan.countDocuments();
    if (chlCount === 0) {
      console.log("🌱 Seeding MongoDB Statutory E-Challans...");
      const chlDocs = DEFAULT_STATUTORY_CHALLANS.map((item) => ({
        challanId: item.challanId,
        userId: item.userId,
        portal: item.portal,
        challanType: item.challanType,
        entityName: item.entityName,
        cinOrPanOrGstin: item.cinOrPanOrGstin,
        financialYear: item.financialYear,
        assessmentYear: item.assessmentYear,
        filingForm: item.filingForm,
        srnOrCpinOrCin: item.srnOrCpinOrCin,
        bsrCode: item.bsrCode,
        challanSerialNumber: item.challanSerialNumber,
        tenderedBank: item.tenderedBank,
        paymentMode: item.paymentMode,
        amountBreakdown: item.amountBreakdown,
        paymentStatus: item.paymentStatus,
        paidAt: item.paidAt,
        receiptNumber: item.receiptNumber,
        dscSignatory: item.dscSignatory,
        clientBilled: item.clientBilled,
      }));
      await StatutoryChallan.insertMany(chlDocs);
    }

    // Seed Executive Board Dossiers
    const dosCount = await BoardDossier.countDocuments();
    if (dosCount === 0) {
      console.log("🌱 Seeding MongoDB Executive Board Dossiers...");
      const dosDocs = DEFAULT_BOARD_DOSSIERS.map((item) => ({
        dossierId: item.dossierId,
        userId: item.userId,
        clientEntity: item.clientEntity,
        financialYear: item.financialYear,
        assessmentYear: item.assessmentYear,
        boardMeetingDate: item.boardMeetingDate,
        meetingType: item.meetingType,
        governanceStandard: item.governanceStandard,
        directorsList: item.directorsList,
        csGovernanceData: item.csGovernanceData,
        caAuditData: item.caAuditData,
        auditCommitteeRisks: item.auditCommitteeRisks,
        boardResolutionsExtracts: item.boardResolutionsExtracts,
        dualAttestationSignOff: item.dualAttestationSignOff,
        dossierDigestSha256: item.dossierDigestSha256,
        version: item.version,
      }));
      await BoardDossier.insertMany(dosDocs);
    }

    // Seed Statutory Due Diligence Audits
    const ddCount = await DueDiligenceAudit.countDocuments();
    if (ddCount === 0) {
      console.log("🌱 Seeding MongoDB Statutory Due Diligence Audits...");
      const ddDocs = DEFAULT_DUE_DILIGENCE_AUDITS.map((item) => ({
        auditId: item.auditId,
        userId: item.userId,
        clientEntity: item.clientEntity,
        auditScope: item.auditScope,
        transactionContext: item.transactionContext,
        overallScore: item.overallScore,
        grade: item.grade,
        riskCategory: item.riskCategory,
        checkpoints: item.checkpoints,
        totalCheckpoints: item.totalCheckpoints,
        passedCheckpoints: item.passedCheckpoints,
        failedCheckpoints: item.failedCheckpoints,
        penaltyExposure: item.penaltyExposure,
        compoundingRoadmap: item.compoundingRoadmap,
        redFlags: item.redFlags,
        attestation: item.attestation,
        status: item.status,
      }));
      await DueDiligenceAudit.insertMany(ddDocs);
    }

    // Seed Statutory Notices & Show Cause Notices
    const noticeCount = await StatutoryNotice.countDocuments();
    if (noticeCount === 0) {
      console.log("🌱 Seeding MongoDB Statutory Notices & SCN Mailroom...");
      await StatutoryNotice.insertMany(DEFAULT_STATUTORY_NOTICES);
    }

    console.log("✅ MongoDB Schema & Seed verification completed successfully!");
  } catch (error) {
    console.warn("⚠️ seedMongoIfEmpty warning:", error.message);
  }
};
