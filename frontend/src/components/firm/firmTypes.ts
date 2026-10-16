export interface FirmMember {
  id: string;
  name: string;
  email: string;
  role: "Managing Partner" | "Partner" | "Senior Associate" | "Associate" | "Paralegal" | "Court Clerk";
  practiceGroup: string;
  barEnrollmentNumber?: string;
  joinedAt: string;
}

export interface FirmProfile {
  id: string;
  name: string;
  entityType: "LLP" | "Partnership" | "Chambers Group" | "Private Legal Corp";
  registrationNumber: string; // e.g. LLPIN or State Bar Registration
  headquartersCity: string;
  jurisdiction: string; // e.g. "High Court of Delhi • New Delhi"
  managingPartnerName: string;
  managingPartnerEmail: string;
  userRoleInFirm: "Managing Partner" | "Partner" | "Senior Associate" | "Associate" | "Paralegal";
  practiceGroups: string[];
  inviteCode: string; // e.g. SOOD-2026
  billingDefaults: {
    currency: string;
    partnerRate: number;
    associateRate: number;
    gstNumber?: string;
  };
  members: FirmMember[];
  createdAt: string;
}

export type WorkspaceType = "chamber" | "firm";

export interface ActiveWorkspace {
  type: WorkspaceType;
  firmId?: string;
}

// Initial demo firm so advocates can immediately experience firm mode
export const DEFAULT_DEMO_FIRM: FirmProfile = {
  id: "firm-sood-partners",
  name: "Sood & Partners LLP",
  entityType: "LLP",
  registrationNumber: "LLPIN-AAR-4192",
  headquartersCity: "New Delhi",
  jurisdiction: "High Court of Delhi & Supreme Court of India",
  managingPartnerName: "Adv. Rajesh Sood",
  managingPartnerEmail: "rajesh.sood@soodlaw.in",
  userRoleInFirm: "Partner",
  practiceGroups: [
    "Commercial Disputes & Arbitration",
    "Corporate & M&A",
    "Insolvency & Bankruptcy (NCLT)",
    "Intellectual Property & Trademarks",
  ],
  inviteCode: "SOOD-2026",
  billingDefaults: {
    currency: "INR",
    partnerRate: 15000,
    associateRate: 5000,
    gstNumber: "07AAACS1234F1Z8",
  },
  members: [
    {
      id: "mem-1",
      name: "Adv. Rajesh Sood",
      email: "rajesh.sood@soodlaw.in",
      role: "Managing Partner",
      practiceGroup: "Corporate & M&A",
      barEnrollmentNumber: "D/1024/1998",
      joinedAt: "2018-04-01",
    },
    {
      id: "mem-2",
      name: "Adv. Sarah Jenkins",
      email: "sarah.jenkins@soodlaw.in",
      role: "Partner",
      practiceGroup: "Commercial Disputes & Arbitration",
      barEnrollmentNumber: "D/2048/2012",
      joinedAt: "2020-01-15",
    },
    {
      id: "mem-3",
      name: "Adv. Rajiv Malhotra",
      email: "rajiv.m@soodlaw.in",
      role: "Senior Associate",
      practiceGroup: "Commercial Disputes & Arbitration",
      barEnrollmentNumber: "D/1492/2018",
      joinedAt: "2022-06-10",
    },
    {
      id: "mem-4",
      name: "Adv. Preeti Sharma",
      email: "preeti.s@soodlaw.in",
      role: "Associate",
      practiceGroup: "Insolvency & Bankruptcy (NCLT)",
      barEnrollmentNumber: "D/3411/2021",
      joinedAt: "2023-09-01",
    },
  ],
  createdAt: "2018-04-01",
};
