export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const caApi = {
  // 1. Income Tax & ITR Filing
  async getIncomeTaxReturns(params?: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      const res = await fetch(`${API_BASE_URL}/ca/itr${query}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.getIncomeTaxReturns error:", e);
      return { success: false, returns: [] };
    }
  },

  async createIncomeTaxReturn(data: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/ca/itr`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.createIncomeTaxReturn error:", e);
      return { success: false };
    }
  },

  async updateIncomeTaxReturn(id: string, updates: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/ca/itr/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.updateIncomeTaxReturn error:", e);
      return { success: false };
    }
  },

  async deleteIncomeTaxReturn(id: string, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/ca/itr/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${t}` },
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.deleteIncomeTaxReturn error:", e);
      return { success: false };
    }
  },

  // 2. GST Compliance Hub
  async getGstReturns(params?: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      const res = await fetch(`${API_BASE_URL}/ca/gst${query}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.getGstReturns error:", e);
      return { success: false, returns: [] };
    }
  },

  async createGstReturn(data: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/ca/gst`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.createGstReturn error:", e);
      return { success: false };
    }
  },

  async updateGstReturn(id: string, updates: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/ca/gst/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.updateGstReturn error:", e);
      return { success: false };
    }
  },

  async deleteGstReturn(id: string, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/ca/gst/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${t}` },
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.deleteGstReturn error:", e);
      return { success: false };
    }
  },

  // 3. Statutory & Tax Audit (Form 3CD & UDIN)
  async getTaxAuditReports(params?: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      const res = await fetch(`${API_BASE_URL}/ca/audit${query}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.getTaxAuditReports error:", e);
      return { success: false, reports: [] };
    }
  },

  async createTaxAuditReport(data: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/ca/audit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.createTaxAuditReport error:", e);
      return { success: false };
    }
  },

  async updateTaxAuditReport(id: string, updates: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/ca/audit/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.updateTaxAuditReport error:", e);
      return { success: false };
    }
  },

  async deleteTaxAuditReport(id: string, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/ca/audit/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${t}` },
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.deleteTaxAuditReport error:", e);
      return { success: false };
    }
  },

  async generateUdin(id: string, data?: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/ca/audit/${id}/udin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data || {}),
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.generateUdin error:", e);
      return { success: false };
    }
  },

  // 4. Balance Sheet Reconciliation & Financials
  async getBalanceSheetRecons(params?: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      const res = await fetch(`${API_BASE_URL}/ca/reconciliations${query}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.getBalanceSheetRecons error:", e);
      return { success: false, reconciliations: [] };
    }
  },

  async createBalanceSheetRecon(data: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/ca/reconciliations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.createBalanceSheetRecon error:", e);
      return { success: false };
    }
  },

  async updateBalanceSheetRecon(id: string, updates: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/ca/reconciliations/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.updateBalanceSheetRecon error:", e);
      return { success: false };
    }
  },

  async deleteBalanceSheetRecon(id: string, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/ca/reconciliations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${t}` },
      });
      return await res.json();
    } catch (e) {
      console.warn("caApi.deleteBalanceSheetRecon error:", e);
      return { success: false };
    }
  },
};
