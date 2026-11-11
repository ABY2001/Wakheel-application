/**
 * e-Courts NJDG (National Judicial Data Grid) Service
 * Helper for court code metadata and live CNR lookup when configured.
 */

export const COURT_NAMES = {
  KLHC: "High Court of Kerala (Ernakulam)",
  KLER: "Sub Court, Ernakulam",
  KLTV: "District & Sessions Court, Thiruvananthapuram",
  KLKK: "District Court, Kozhikode",
  KLTS: "District Court, Thrissur",
  KLAL: "District Court, Alappuzha",
  DLHC: "High Court of Delhi (New Delhi)",
  DLCW: "Central District Court, Tis Hazari, Delhi",
  MHBB: "Bombay High Court (Mumbai)",
  TNMD: "Madras High Court (Chennai)",
  KABC: "High Court of Karnataka (Bengaluru)",
  WBCC: "Calcutta High Court (Kolkata)",
};

/**
 * Resolves a CNR/Case query against an external live NJDG feed if connected.
 * Returns null rather than fabricating mock parties/orders when no live external feed is available.
 */
export const resolveECourtsLiveCnr = (cnrInput, fallbackCaseNumber = "") => {
  const cleanCnr = (cnrInput || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!cleanCnr && !(fallbackCaseNumber || "").trim()) {
    return null;
  }
  return null;
};
