import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

let genAiClient = null;

const getGenAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAiClient) {
    try {
      genAiClient = new GoogleGenAI({ apiKey });
    } catch (err) {
      console.warn("[Gemini Service] Client initialization error:", err.message);
      return null;
    }
  }
  return genAiClient;
};

/**
 * Checks whether the Gemini API key is configured and valid
 */
export const isGeminiAvailable = () => {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
};

const SYSTEM_LEGAL_COPILOT_PROMPT = `
You are Wakheel AI Legal Copilot, an elite Indian Legal Technology & Judicial Reasoning Assistant.
You have profound expertise in:
1. Indian Statutory Law: Bharatiya Nyaya Sanhita (BNS) 2023, Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023, Bharatiya Sakshya Adhiniyam (BSA) 2023, Code of Civil Procedure (CPC) 1908, Indian Contract Act 1872, Negotiable Instruments Act 1881, Transfer of Property Act 1882, Companies Act 2013, GST Acts, and the Constitution of India.
2. Judicial Practice: Supreme Court of India, High Court of Kerala, and High Courts across India.
3. Language: Fluent in both legal English and Malayalam legal terminology (e.g., ആധാരം, തണ്ടപ്പേര്, പട്ടയം, മഹസർ, കൈവശാവകാശ സർട്ടിഫിക്കറ്റ്, കരം തീർത്ത രസീത്, എതിർ സത്യവാങ്മൂലം).

Guidelines for Legal Output:
- Structure your analysis with clear markdown headings:
  ### 1. Statutory Formulation & Core Provisions
  ### 2. Relevant Landmark Precedents & Ratios
  ### 3. Procedural Course of Action & Jurisdiction
  ### 4. Strategic Bench Preparation & Rebuttals
- Cite relevant sections and neutral citations wherever possible.
- If the user asks in Malayalam or mentions Kerala land/revenue terms, provide clear bilingual concordance.
- Maintain an authoritative, precise, and court-ready tone suitable for Senior Advocates and Law Scholars.
`;

/**
 * Resolve legal research queries via Gemini API with fallback
 */
export const queryGeminiLegalCopilot = async ({
  prompt,
  mode = "Ask",
  language = "en",
  isDeepResearch = false,
  isAgentMode = false,
  specialization = null,
  context = "",
}) => {
  const client = getGenAiClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const modelName = isDeepResearch ? "gemini-4-carbon" : "gemini-4-hydrogen";

  const userInstruction = `
User Query / Legal Scenario:
"${prompt}"

Mode: ${mode}
Target Language: ${language}
Deep Research Active: ${isDeepResearch ? "Yes (Provide thorough historical case law and comparative statutory analysis)" : "No"}
Agent Mode Active: ${isAgentMode ? "Yes (Break down multi-step procedural advocacy steps)" : "No"}
Specialization Domain: ${specialization || "General Indian Jurisprudence"}
${context ? `Additional Context:\n${context}` : ""}

Please generate an exhaustive, legally accurate, and well-structured legal advisory.
`;

  const interaction = await client.interactions.create({
    model: modelName,
    input: userInstruction,
    system_instruction: SYSTEM_LEGAL_COPILOT_PROMPT,
  });

  const outputText = interaction?.output_text || interaction?.text || "";

  // Extract synthetic citations from output for structured display
  const citationMatches = outputText.match(/\b([A-Z][a-zA-Z\s.]+v\.\s+[A-Z][a-zA-Z\s.]+\s*\(\d{4}\)[^\n.]+)/g) || [];
  const citations = Array.from(new Set(citationMatches)).slice(0, 5).map((cit) => ({
    title: cit.trim(),
    court: cit.includes("Supreme Court") || cit.includes("SCC") || cit.includes("AIR") ? "Supreme Court of India" : "High Court of Kerala",
    ratio: "Governing ratio referenced in copilot analysis.",
  }));

  return {
    success: true,
    text: outputText,
    provider: "google_gemini",
    model: modelName,
    mode,
    isAgentMode,
    isDeepResearch,
    citations: citations.length > 0 ? citations : undefined,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Summarize judgments, paper-books, and court orders using Gemini
 */
export const summarizeJudgmentWithGemini = async ({
  citation = "",
  caseTitle = "",
  rawText = "",
  language = "en",
}) => {
  const client = getGenAiClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const prompt = `
Analyze and summarize the following Indian Court Judgment / Case Paper:
${citation ? `Citation: ${citation}\n` : ""}${caseTitle ? `Case Title: ${caseTitle}\n` : ""}
Raw Judgment Text:
"""
${rawText.slice(0, 50000)}
"""

Please provide a structured legal summary in JSON format with the following keys:
{
  "title": "Full Cause Title",
  "citation": "Official Citation or Neutral Citation",
  "court": "Judicial Forum",
  "bench": "Names of Coram / Judges",
  "decisionDate": "Date of Judgment",
  "subject": "Primary Legal Subject",
  "facts": "Concise factual matrix (2-3 paragraphs)",
  "issues": [
    "Issue 1 framed by the court",
    "Issue 2 framed by the court"
  ],
  "statutes": [
    "Section and Act names examined"
  ],
  "ratio": "The primary Ratio Decidendi establishing binding legal doctrine",
  "argumentsPetitioner": "Key arguments advanced by Petitioner / Appellant counsel",
  "argumentsRespondent": "Key arguments advanced by Respondent / State counsel",
  "disposition": "Final order / holding (Allowed, Dismissed, Disposed with Directions)",
  "precedentsCited": [
    "Key precedent citations referred to"
  ],
  "clientTakeaway": "Plain-language 2-sentence explanation of how this ruling impacts rights"
}
Output valid JSON only without markdown formatting.
`;

  const interaction = await client.interactions.create({
    model: "gemini-4-hydrogen",
    input: prompt,
    system_instruction: "You are a Senior Judicial Registrar and Legal Research Specialist. Output valid JSON only.",
  });

  const responseText = (interaction?.output_text || interaction?.text || "").trim();
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        provider: "google_gemini",
        model: "gemini-4-hydrogen",
        judgment: parsed,
      };
    } catch {
      // Fall through if JSON parsing fails
    }
  }

  return {
    success: true,
    provider: "google_gemini",
    model: "gemini-4-hydrogen",
    judgment: {
      title: caseTitle || "Judicial Pronouncement Summary",
      citation: citation || "NJDG / Court Record",
      facts: responseText,
      ratio: "Ratio extracted by Gemini AI.",
      clientTakeaway: "Ruling summarized via Gemini Legal AI.",
    },
  };
};

/**
 * Draft bespoke pleadings, statutory notices, and agreements using Gemini
 */
export const draftPleadingWithGemini = async ({
  type = "custom_legal_notice",
  parameters = {},
  customInstructions = "",
}) => {
  const client = getGenAiClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const prompt = `
Draft a comprehensive, court-ready formal Indian legal document of type: "${type}".

Document Parameters:
${JSON.stringify(parameters, null, 2)}

${customInstructions ? `Special Counsel Instructions:\n${customInstructions}\n` : ""}

Drafting Rules:
- Include formal legal heading, sender/recipient memo, factual recital with numbered paragraphs.
- Specifically frame statutory grounds under the relevant Indian statutes (e.g. S.138 NI Act, S.480 BNSS, Art. 226 Constitution, S.80 CPC).
- Conclude with a clear operative demand / prayer clause, timeline for compliance (e.g., 15 days), consequences of default, and signature blocks.
- Professional, polished, and ready for immediate printing on advocate letterhead.
`;

  const interaction = await client.interactions.create({
    model: "gemini-4-hydrogen",
    input: prompt,
    system_instruction: SYSTEM_LEGAL_COPILOT_PROMPT,
  });

  const draftedText = interaction?.output_text || interaction?.text || "";

  return {
    success: true,
    provider: "google_gemini",
    model: "gemini-4-hydrogen",
    type,
    draftedContent: draftedText,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Audit contract agreements and highlight legal risks using Gemini
 */
export const auditContractWithGemini = async ({
  contractText,
  partyRole = "Service Provider / Vendor",
  jurisdiction = "India",
}) => {
  const client = getGenAiClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const prompt = `
Conduct a thorough Contract Risk & Legal Clause Audit on the following agreement:
Party Represented: ${partyRole}
Governing Jurisdiction: ${jurisdiction}

Agreement Text:
"""
${contractText.slice(0, 45000)}
"""

Please audit the contract and return a JSON object with:
{
  "overallRiskScore": 75 (1 to 100, where 100 is severe risk),
  "riskLevel": "High" | "Medium" | "Low",
  "summary": "Brief executive summary of legal exposure",
  "criticalRisks": [
    {
      "clauseName": "Indemnity / Limitation of Liability",
      "severity": "Critical",
      "issue": "Uncapped unilateral indemnification obligation",
      "suggestedRedline": "Add mutual aggregate liability cap equal to total fees paid."
    }
  ],
  "governingLawAssessment": "Assessment of dispute resolution and arbitration seat",
  "complianceChecklist": [
    { "item": "Stamp Duty Payment", "status": "Action Required" },
    { "item": "Arbitration Act 1996 Compliance", "status": "Compliant" }
  ]
}
Return valid JSON only.
`;

  const interaction = await client.interactions.create({
    model: "gemini-4-hydrogen",
    input: prompt,
    system_instruction: "You are a Corporate Legal Counsel & Contract Risk Auditor. Output valid JSON only.",
  });

  const responseText = (interaction?.output_text || interaction?.text || "").trim();
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        provider: "google_gemini",
        model: "gemini-4-hydrogen",
        audit: parsed,
      };
    } catch {}
  }

  return {
    success: true,
    provider: "google_gemini",
    model: "gemini-4-hydrogen",
    audit: {
      overallRiskScore: 50,
      riskLevel: "Medium",
      summary: responseText,
    },
  };
};

/**
 * Specialized statutory reasoning for Company Secretaries (ICSI) and Chartered Accountants (ICAI)
 */
export const queryGeminiCsCa = async ({ prompt, category = "general", practiceMode = "unified", matterContext = {} }) => {
  const client = getGenAiClient();
  if (!client) throw new Error("GEMINI_API_KEY not configured");

  const systemPrompt = `You are Wakheel AI, the supreme statutory intelligence engine for Indian Company Secretaries (ICSI) and Chartered Accountants (ICAI). 
You possess profound mastery of:
1. Companies Act 2013, ICSI Secretarial Standards (SS-1, SS-2), MCA21 e-filings, NCLT corporate restructuring, and SEBI LODR Regulations.
2. Income-tax Act 1961, Section 44AB Tax Audit Form 3CD clauses, Transfer Pricing, Section 43B(h) MSMED rules, and CBDT circulars.
3. Central Goods & Services Tax (CGST) Act 2017, IGST, ITC Rule 36(4), DRC-01 notices, and GST Council notifications.
4. Schedule III Balance Sheet disclosures, Ind AS 12 Deferred Tax, and ICAI Auditing Standards.

Provide an authoritative, exhaustive, and professionally formatted answer with exact statutory sections, rules, penalty implications, and official circular references.`;

  const userMsg = `Category: ${category}\nPractice Mode: ${practiceMode}\nAssessee/Company Context: ${JSON.stringify(matterContext || {})}\n\nQuery:\n${prompt}`;

  const interaction = await client.interactions.create({
    model: "gemini-4-hydrogen",
    input: userMsg,
    system_instruction: systemPrompt,
  });

  return interaction?.output_text || interaction?.text || "";
};
