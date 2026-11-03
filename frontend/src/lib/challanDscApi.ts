// ============================================================================
// WAKHEEL CLASS 3 DSC & STATUTORY E-CHALLAN API CLIENT
// Type-safe endpoints for USB token signing, MCA21/GST/Income Tax challans
// ============================================================================

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface DscCertificateItem {
  id?: string;
  certificateId: string;
  holderName: string;
  holderRole: "practicing_cs" | "practicing_ca" | "company_director" | "authorized_signatory";
  pan: string;
  din?: string;
  membershipNumber?: string;
  tokenProvider: string;
  hardwareModel: string;
  serialNumber: string;
  issuerCa: string;
  validFrom: string;
  validTo: string;
  keyAlgorithm?: string;
  keyUsage?: string[];
  tokenStatus: "plugged_in" | "unplugged" | "locked" | "expired";
  totalSignaturesAffixed?: number;
  lastUsedAt?: string;
}

export interface StatutoryChallanItem {
  id?: string;
  challanId: string;
  portal: "MCA21" | "GSTN" | "CBDT_INCOME_TAX";
  challanType: string;
  entityName: string;
  cinOrPanOrGstin: string;
  financialYear: string;
  assessmentYear?: string;
  filingForm: string;
  srnOrCpinOrCin: string;
  bsrCode?: string;
  challanSerialNumber?: string;
  tenderedBank: string;
  paymentMode: string;
  amountBreakdown: {
    baseFeeOrTax: number;
    additionalOrLateFee?: number;
    interest?: number;
    penalty?: number;
    totalAmount: number;
  };
  paymentStatus: "GENERATED" | "PAID" | "EXPIRED" | "FAILED";
  paidAt?: string | null;
  receiptNumber?: string | null;
  dscSignatory?: string;
  clientBilled?: boolean;
  createdAt?: string;
}

export interface SignDocumentPayload {
  certificateId: string;
  pin: string;
  documentTitle: string;
  documentType: string;
  documentPayload?: string;
  entityName?: string;
}

export const challanDscApi = {
  // 1. Get all DSC tokens
  async getDscCertificates(params?: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      const res = await fetch(`${API_BASE_URL}/dsc-challan/certificates${q}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      return await res.json();
    } catch (e) {
      console.warn("challanDscApi.getDscCertificates error:", e);
      return { success: false, certificates: [] };
    }
  },

  // 2. Plug in or unplug token
  async toggleDscToken(certificateId: string, isPlugged: boolean, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/dsc-challan/tokens/plug`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ certificateId, isPlugged }),
      });
      return await res.json();
    } catch (e) {
      console.warn("challanDscApi.toggleDscToken error:", e);
      return { success: false };
    }
  },

  // 3. Verify Token PIN
  async verifyDscPin(certificateId: string, pin: string, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/dsc-challan/tokens/verify-pin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ certificateId, pin }),
      });
      return await res.json();
    } catch (e) {
      console.warn("challanDscApi.verifyDscPin error:", e);
      return { success: false, message: "Network error verifying PIN" };
    }
  },

  // 4. Sign document with Class 3 DSC
  async signDocumentWithDsc(payload: SignDocumentPayload, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/dsc-challan/sign-document`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      console.warn("challanDscApi.signDocumentWithDsc error:", e);
      return { success: false, message: "Network error during signing" };
    }
  },

  // 5. Validate Signature Hash
  async validateSignature(sha256Digest: string, documentTitle?: string, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/dsc-challan/validate-signature`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sha256Digest, documentTitle }),
      });
      return await res.json();
    } catch (e) {
      console.warn("challanDscApi.validateSignature error:", e);
      return { success: false };
    }
  },

  // 6. Calculate MCA21 late fee
  async calculateMcaFee(authorizedCapital: number, formType: string, daysOfDelay: number, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/dsc-challan/calculate-mca-fee`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ authorizedCapital, formType, daysOfDelay }),
      });
      return await res.json();
    } catch (e) {
      console.warn("challanDscApi.calculateMcaFee error:", e);
      return { success: false };
    }
  },

  // 7. Get Statutory Challans
  async getStatutoryChallans(params?: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      const res = await fetch(`${API_BASE_URL}/dsc-challan/challans${q}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      return await res.json();
    } catch (e) {
      console.warn("challanDscApi.getStatutoryChallans error:", e);
      return { success: false, challans: [] };
    }
  },

  // 8. Create new Statutory Challan
  async createStatutoryChallan(data: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/dsc-challan/challans`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.warn("challanDscApi.createStatutoryChallan error:", e);
      return { success: false };
    }
  },

  // 9. Pay Challan
  async payStatutoryChallan(id: string, paymentData?: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/dsc-challan/challans/${id}/pay`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData || {}),
      });
      return await res.json();
    } catch (e) {
      console.warn("challanDscApi.payStatutoryChallan error:", e);
      return { success: false };
    }
  },

  // 10. Get Official Printable Receipt Pack
  async getChallanReceipt(id: string, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/dsc-challan/challans/${id}/receipt`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      return await res.json();
    } catch (e) {
      console.warn("challanDscApi.getChallanReceipt error:", e);
      return { success: false };
    }
  },
};
