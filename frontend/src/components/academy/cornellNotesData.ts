import { academyApi } from "@/lib/academyApi";

export interface CornellNote {
  id: string;
  title: string;
  subject: string;
  topic: string;
  cues: string[];
  content: string;
  summary: string;
  statutoryReferences: string[];
  landmarkCases: string[];
  isBookmarked: boolean;
  isFacultyShared: boolean;
  author: string;
  lastEdited: string;
  tags?: string[];
}

export interface CornellTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  sampleTitle: string;
  initialCues: string[];
  initialContent: string;
  initialSummary: string;
  initialStatutes: string[];
  initialCases: string[];
}

export const CORNELL_TEMPLATES: CornellTemplate[] = [
  {
    id: "tpl_case_brief",
    name: "Supreme Court Case Brief & Ratio Decidendi",
    subject: "Constitutional Law",
    description: "Standard appellate bench synthesis: Facts, Issues, Ratio Decidendi, and Obiter Dicta.",
    sampleTitle: "Case Brief: Kesavananda Bharati v. State of Kerala (1973)",
    initialCues: [
      "13-Judge Constitution Bench",
      "Constituent Power vs Legislative Power",
      "Article 368 Amendment Limits",
      "Basic Structure Test",
      "Implied Limitations Doctrine",
    ],
    initialContent: `1. PROCEDURAL HISTORY & BENCH COMPOSITION:
Heard by a full 13-Judge Constitution Bench of the Hon'ble Supreme Court of India. Overruled Golaknath (1967) regarding fundamental rights amendment, but established landmark constitutional boundary.

2. QUESTIONS OF LAW:
- Whether the power of Parliament to amend the Constitution under Article 368 is unlimited and unfettered?
- Whether Parliament can amend fundamental rights under Part III?
- Validity of 24th, 25th, and 29th Constitutional Amendments.

3. RATIO DECIDENDI (MAJORITY 7:6):
Article 368 enables Parliament to amend any part of the Constitution, including Part III (Fundamental Rights). HOWEVER, this amendatory power does not extend to abrogating, damaging, or emasculating the "Basic Structure" or essential framework of the Constitution. The creature of the Constitution cannot destroy the Constitution itself.

4. ESSENTIAL IDENTIFIED PILLARS OF BASIC STRUCTURE:
- Supremacy of the Constitution
- Republican and Democratic form of Governance
- Secular character of the Republic
- Separation of Powers between Judiciary, Executive, and Legislature
- Federal character of the Constitution
- Judicial Review (Art. 32 and 226)`,
    initialSummary:
      "Parliament possesses plenary amendatory power under Article 368, but cannot alter the identity, core values, or Basic Structure of the Constitution. Any amendment violating this test is ultra vires and void.",
    initialStatutes: ["Article 13(2)", "Article 368", "Article 32", "24th Amendment Act"],
    initialCases: [
      "Kesavananda Bharati v. State of Kerala (1973) 4 SCC 225",
      "Minerva Mills v. Union of India (1980) 3 SCC 625",
      "Indira Nehru Gandhi v. Raj Narain (1975) Supp SCC 1",
    ],
  },
  {
    id: "tpl_bnss_bail",
    name: "BNSS Bail & Section 35 Arrest Jurisprudence",
    subject: "Criminal Jurisprudence (BNS & BNSS)",
    description: "Statutory checklist for Regular Bail under Section 480 BNSS and mandatory Section 35 arrest checks.",
    sampleTitle: "Bail Jurisprudence & Safeguards against Arbitrary Arrest (BNSS 2023)",
    initialCues: [
      "Section 35 BNSS (Old S.41 CrPC)",
      "Section 480 BNSS (Old S.439 CrPC)",
      "Arnesh Kumar 41A Mandate",
      "Triple Test Doctrine",
      "Article 21 Personal Liberty",
    ],
    initialContent: `1. MANDATORY STATUTORY THRESHOLD (SECTION 35 BNSS):
For offenses punishable with imprisonment up to 7 years, arrest is not automatic. The investigating officer must issue a formal Notice of Appearance unless specific statutory parameters are documented in writing:
- Necessity to prevent commission of further offenses;
- Prevention of tampering with evidence or intimidating witnesses;
- Inability to ensure court presence without custody.

2. SESSIONS REGULAR BAIL DOCTRINE (SECTION 480 BNSS):
The discretionary power under Section 480 BNSS must be exercised judicially rather than punitively. Pre-trial detention cannot serve as a mechanism of anticipation punishment.

3. THE CONSTITUTIONAL TRIPLE TEST:
- Flight Risk: Does the accused pose a genuine flight risk? (Evaluated by local roots, family ties, surrender of passport).
- Tampering of Evidence: Can documentary or electronic evidence in police custody be altered?
- Witness Intimidation: Is there substantial material demonstrating attempts to influence prosecution witnesses?

4. HEALTH & JUVENILE SAFEGUARDS:
Proviso to Section 480(1) grants special statutory leaning towards bail for persons under 18 years, women, and sick or infirm applicants.`,
    initialSummary:
      "Bail is the rule, jail is the exception (Satyendra Kumar Antil). Compliance with Section 35 BNSS guidelines is jurisdictional; mechanical arrest infringes Article 21 and warrants immediate bail.",
    initialStatutes: ["Section 35 BNSS 2023", "Section 480 BNSS 2023", "Article 21 Constitution of India"],
    initialCases: [
      "Arnesh Kumar v. State of Bihar (2014) 8 SCC 273",
      "Satender Kumar Antil v. CBI (2022) 10 SCC 51",
      "P. Chidambaram v. CBI (2020) 13 SCC 337",
    ],
  },
  {
    id: "tpl_contracts_remoteness",
    name: "Commercial Damages & Hadley Remoteness Rule",
    subject: "Law of Contracts",
    description: "Section 73 Indian Contract Act framework dissecting general vs consequential losses and mitigation.",
    sampleTitle: "Section 73 Contract Act: Remoteness & Mitigation of Damages",
    initialCues: [
      "Section 73 Indian Contract Act 1872",
      "Hadley v Baxendale Two Limbs",
      "Victoria Laundry Principle",
      "Special Circumstances Communication",
      "Affirmative Duty of Mitigation",
    ],
    initialContent: `1. PRINCIPLE OF RESTITUTIO IN INTEGRUM:
The innocent party is entitled to be placed in the same financial position as if the contract had been performed, so far as money can do it. Damages are strictly compensatory, never punitive or speculative.

2. THE TWO LIMBS OF HADLEY V. BAXENDALE:
- Limb 1 (General Damages): Losses arising naturally, according to the usual course of things, from such breach itself. These are presumed to be in the knowledge of both contracting parties.
- Limb 2 (Special / Consequential Damages): Losses which may reasonably be supposed to have been in the contemplation of both parties at the time they made the contract, as the probable result of the breach. This requires actual prior communication of special circumstances.

3. KNOWLEDGE THRESHOLD (VICTORIA LAUNDRY):
Mere knowledge that delay causes loss of ordinary profits does not make the breaching party liable for extraordinary, lucrative third-party government contracts unless explicitly notified at formation.

4. STATUTORY EXPLANATION: DUTY TO MITIGATE:
The Explanation to Section 73 mandates that in estimating loss or damage, the means which existed of remedying the inconvenience caused by non-performance must be considered. Failure to mitigate bars recovery for avoidable loss.`,
    initialSummary:
      "Damages under Section 73 require proof of direct loss or mutual contemplation of special risks. Remote and indirect damages cannot be awarded, and plaintiffs bear a strict duty to mitigate.",
    initialStatutes: ["Section 73 Indian Contract Act 1872", "Section 74 Liquidated Damages"],
    initialCases: [
      "Hadley v. Baxendale (1854) 9 Exch 341",
      "Victoria Laundry (Windsor) Ltd v. Newman Industries Ltd (1949) 2 KB 528",
      "Karsandas H. Thacker v. Saran Engineering Co. Ltd (AIR 1965 SC 1981)",
    ],
  },
  {
    id: "tpl_torts_liability",
    name: "Absolute Liability & Environmental Public Duty",
    subject: "Law of Torts & Environment",
    description: "Transition from English Strict Liability to Indian Absolute Liability Doctrine (MC Mehta).",
    sampleTitle: "Doctrine of Absolute Liability: The Oleum Gas Leak Jurisprudence",
    initialCues: [
      "Rylands v Fletcher (1868)",
      "Strict vs Absolute Liability",
      "MC Mehta v Union of India (1987)",
      "Non-delegable Enterprise Duty",
      "Polluter Pays Principle",
    ],
    initialContent: `1. GENESIS: RYLANDS V. FLETCHER INADEQUACY:
The 19th-century English doctrine of Strict Liability permitted five broad exceptions: Act of God (Vis Major), consent of plaintiff, default of third party, statutory authority, and plaintiff's own fault. In an industrialized modern economy, these exceptions shielded hazardous corporations from accountability.

2. THE JUDICIAL LEAP IN SHRIRAM FOODS & FERTILIZERS:
Bhagwati CJ held that Indian jurisprudence must not remain tied to English common law. Where an enterprise is engaged in a hazardous or inherently dangerous industry which poses a potential threat to health and safety of persons residing in the vicinity, the enterprise owes an absolute and non-delegable duty to ensure no harm results.

3. COMPLETE EXCLUSION OF DEFENSES:
If any damage results on account of such activity, the enterprise is strictly and absolutely liable to compensate all who are affected. None of the exceptions to Rylands v. Fletcher can be pleaded.

4. CAPACITY-LINKED QUANTUM OF DAMAGES:
The measure of compensation must be correlated to the magnitude and financial capacity of the enterprise, so that the award serves as a deterrent against negligence in industrial operations.`,
    initialSummary:
      "Enterprises operating inherently dangerous activities bear absolute, non-delegable liability for community harm with zero common law exceptions. Compensation is proportional to enterprise wealth.",
    initialStatutes: ["Article 21 & Article 32 Constitution", "Public Liability Insurance Act 1991"],
    initialCases: [
      "MC Mehta v. Union of India (Oleum Gas Leak) AIR 1987 SC 1086",
      "Union Carbide Corp v. Union of India (Bhopal Disaster) (1991) 4 SCC 584",
      "Vellore Citizens Welfare Forum v. Union of India (1996) 5 SCC 647",
    ],
  },
];

export const INITIAL_CORNELL_NOTES: CornellNote[] = [
  {
    id: "note_const_severability",
    title: "Doctrine of Severability & Basic Structure Inviolability",
    subject: "Constitutional Law",
    topic: "Article 13(2) & Judicial Review",
    cues: [
      "Article 13(2) Void Ab Initio",
      "Test of Inextricability",
      "RMDC v. Union of India (1957)",
      "AK Gopalan v. State of Madras (1950)",
      "Minerva Mills Harmonious Balance",
    ],
    content: `1. CORE STATUTORY DOCTRINE:
Article 13(2) mandates: 'The State shall not make any law which takes away or abridges the rights conferred by this Part and any law made in contravention of this clause shall, to the extent of the contravention, be void.'

2. THE SEVERABILITY FORMULATION (RMDC TEST):
- The doctrine of severability determines whether the valid portions of an enactment can stand independently when unconstitutional clauses are excised.
- If the valid and invalid parts are so inextricably interwoven that the legislature would not have enacted the valid part alone, the entire statute must fall.
- In AK Gopalan (1950), Section 14 of Preventive Detention Act 1950 was severed, preserving the remainder of the enactment.

3. INTERACTION WITH BASIC STRUCTURE (ART. 368):
- While ordinary statutes are tested on legislative competence and Part III conformity, constitutional amendments are evaluated against the immutable basic features of the Constitution.
- In Minerva Mills (1980), Clauses (4) and (5) of Article 368 inserted by 42nd Amendment were struck down as they sought to eliminate judicial review and establish unlimited parliamentary sovereignty.`,
    summary:
      "Severability preserves statutory intent by excising invalid clauses, provided the remainder forms a complete, workable scheme. Constitutional amendments cannot extinguish basic features.",
    statutoryReferences: ["Article 13(2)", "Article 368", "Article 21"],
    landmarkCases: [
      "RMDC v. Union of India (1957) SCR 930",
      "AK Gopalan v. State of Madras (1950) SCR 88",
      "Minerva Mills v. Union of India (1980) 3 SCC 625",
    ],
    isBookmarked: true,
    isFacultyShared: true,
    author: "Prof. Dr. Rajesh Varma (Faculty Chair)",
    lastEdited: "Today, 11:40 AM",
    tags: ["High-Yield", "Appellate Review", "CLAT-PG"],
  },
  {
    id: "note_bnss_bail_sec35",
    title: "Arrest Threshold under BNSS §35 & Regular Bail Mechanics under §480",
    subject: "Criminal Jurisprudence (BNS & BNSS)",
    topic: "Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)",
    cues: [
      "Section 35 BNSS Notice Protocol",
      "Section 480 Regular Bail",
      "Arnesh Kumar Compliance",
      "Triple Test Protocol",
      "Magisterial Scrutiny on Remand",
    ],
    content: `1. STATUTORY SHIFT FROM CrPC TO BNSS:
BNSS 2023 Section 35 elevates the guidelines in Arnesh Kumar into explicit statutory commands. For offenses punishable with <= 7 years imprisonment:
- Police officer shall not arrest automatically;
- Must serve a notice of appearance directing the accused to join the probe;
- Arrest requires detailed written reasoning demonstrating flight risk or witness intimidation.

2. SECTION 480 BNSS: SESSIONS COURT POWERS:
Section 480 confers plenary jurisdiction on High Courts and Sessions Courts to release an accused on bail with or without conditions.

3. JUDICIAL SCRUTINY IN SATENDER KUMAR ANTIL:
- The Supreme Court categorized criminal offenses into four distinct brackets (A, B, C, D) to ensure standardized bail outcomes.
- Default to pre-trial incarceration without judicial reason is violative of Article 21.`,
    summary:
      "Section 35 BNSS mandates notice of appearance for offenses <= 7 years. Arrest without written necessity is illegal; Section 480 regular bail prioritizes liberty over punitive detention.",
    statutoryReferences: ["Section 35 BNSS", "Section 480 BNSS", "Article 21 Constitution"],
    landmarkCases: [
      "Arnesh Kumar v. State of Bihar (2014) 8 SCC 273",
      "Satender Kumar Antil v. CBI (2022) 10 SCC 51",
      "Babu Singh v. State of U.P. (1978) 1 SCC 579",
    ],
    isBookmarked: true,
    isFacultyShared: false,
    author: "Advithya Sharma (Student)",
    lastEdited: "Nov 21, 2026, 4:15 PM",
    tags: ["Criminal Procedure", "Bail", "Bar Exam"],
  },
  {
    id: "note_contracts_remoteness",
    title: "Remoteness of Damages under Section 73 Indian Contract Act",
    subject: "Law of Contracts",
    topic: "Commercial Obligations & Breach",
    cues: [
      "Section 73 ICA 1872",
      "Hadley v Baxendale Rule",
      "Victoria Laundry Principle",
      "Special Circumstances Communication",
      "Duty of Mitigation (Explanation)",
    ],
    content: `1. STATUTORY CODE ANALYSIS:
Section 73 provides: When a contract has been broken, the party who suffers by such breach is entitled to receive compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things, or which the parties knew, when they made the contract, to be likely to result from the breach.

2. THE EXCLUSION CLAUSE:
'Such compensation is not to be given for any remote and indirect loss or damage sustained by reason of the breach.'

3. PRACTICAL APPLICATION (HADLEY V. BAXENDALE):
- Mill shaft sent for repair; carrier delayed delivery; mill remained idle.
- Mill owner sued for lost profits.
- Held: Carrier did not know mill was stopped solely for want of the shaft. Consequential loss was too remote to be recovered.`,
    summary:
      "Damages under Section 73 require natural causal sequence or explicit prior notice of special business risks. Indirect and speculative losses are strictly non-recoverable.",
    statutoryReferences: ["Section 73 Indian Contract Act 1872", "Section 74 Liquidated Damages"],
    landmarkCases: [
      "Hadley v. Baxendale (1854) 9 Exch 341",
      "Victoria Laundry Ltd v. Newman Industries Ltd (1949) 2 KB 528",
      "Karsandas H. Thacker v. Saran Engineering Co. Ltd (AIR 1965 SC 1981)",
    ],
    isBookmarked: false,
    isFacultyShared: true,
    author: "Adv. Sunita Deshmukh (Faculty)",
    lastEdited: "Nov 19, 2026, 2:30 PM",
    tags: ["Contracts", "Damages", "Commercial Law"],
  },
  {
    id: "note_torts_absolute_liability",
    title: "Strict vs. Absolute Liability: Enterprise Accountability in Torts",
    subject: "Law of Torts & Environment",
    topic: "Industrial Hazards & Tortious Liability",
    cues: [
      "Rylands v Fletcher 5 Exceptions",
      "Oleum Gas Leak Ruling (1987)",
      "Non-delegable Enterprise Obligation",
      "Capacity-Linked Compensation",
      "Article 32 Public Law Remedy",
    ],
    content: `1. COMMON LAW LIMITATIONS:
English strict liability in Rylands v. Fletcher (1868) contained loopholes: Act of God, sabotage by stranger, statutory authority, consent. These allowed hazardous factories to evade compensation.

2. DOCTRINE OF ABSOLUTE LIABILITY (MC MEHTA 1987):
Bhagwati CJ ruled that where an enterprise engages in hazardous activities, it owes an absolute, non-delegable duty to the community. If toxic gas escapes, liability is absolute without exception.

3. MEASURE OF COMPENSATION:
The financial penalty must correlate with the scale and capacity of the enterprise to ensure true deterrence against cutting industrial safety costs.`,
    summary:
      "Absolute liability eliminates all traditional common law defenses for hazardous enterprises. Financial compensation scales directly with corporate capacity.",
    statutoryReferences: ["Article 21 & 32 Constitution", "Public Liability Insurance Act 1991"],
    landmarkCases: [
      "MC Mehta v. Union of India AIR 1987 SC 1086",
      "Union Carbide Corp v. Union of India (1991) 4 SCC 584",
      "Charan Lal Sahu v. Union of India (1990) 1 SCC 613",
    ],
    isBookmarked: false,
    isFacultyShared: false,
    author: "Advithya Sharma (Student)",
    lastEdited: "Nov 17, 2026, 9:20 AM",
    tags: ["Torts", "Environmental Jurisprudence", "CLAT-UG"],
  },
];

const STORAGE_KEY = "wakheel_cornell_notes_v1";

export function getStoredCornellNotes(): CornellNote[] {
  if (typeof window === "undefined") return INITIAL_CORNELL_NOTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CORNELL_NOTES));
      return INITIAL_CORNELL_NOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CORNELL_NOTES;
  } catch (err) {
    console.error("Failed to read Cornell notes from storage:", err);
    return INITIAL_CORNELL_NOTES;
  }
}

export async function syncNotesWithServer(): Promise<CornellNote[]> {
  if (typeof window === "undefined") return INITIAL_CORNELL_NOTES;
  try {
    const res = await academyApi.getNotes();
    if (res.success && Array.isArray(res.notes) && res.notes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.notes));
      window.dispatchEvent(new Event("storage"));
      return res.notes;
    }
  } catch (err) {
    console.warn("syncNotesWithServer offline fallback:", err);
  }
  return getStoredCornellNotes();
}

export function saveCornellNote(note: CornellNote): CornellNote[] {
  if (typeof window === "undefined") return [note];
  try {
    const notes = getStoredCornellNotes();
    const existingIndex = notes.findIndex((n) => n.id === note.id);
    let updated: CornellNote[];
    if (existingIndex >= 0) {
      updated = [...notes];
      updated[existingIndex] = { ...note, lastEdited: "Just now" };
    } else {
      updated = [{ ...note, lastEdited: "Just now" }, ...notes];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    academyApi.saveNote(note).catch((err) => console.warn("saveCornellNote remote sync:", err));
    return updated;
  } catch (err) {
    console.error("Failed to save Cornell note:", err);
    return [note];
  }
}

export function deleteCornellNote(id: string): CornellNote[] {
  if (typeof window === "undefined") return [];
  try {
    const notes = getStoredCornellNotes();
    const updated = notes.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    academyApi.deleteNote(id).catch((err) => console.warn("deleteCornellNote remote sync:", err));
    return updated;
  } catch (err) {
    console.error("Failed to delete Cornell note:", err);
    return [];
  }
}

export function toggleBookmarkCornellNote(id: string): CornellNote[] {
  if (typeof window === "undefined") return [];
  try {
    const notes = getStoredCornellNotes();
    const updated = notes.map((n) => (n.id === id ? { ...n, isBookmarked: !n.isBookmarked } : n));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    academyApi.toggleBookmarkNote(id).catch((err) => console.warn("toggleBookmarkNote remote sync:", err));
    return updated;
  } catch (err) {
    console.error("Failed to toggle bookmark:", err);
    return [];
  }
}

export function exportCornellNoteAsTxt(note: CornellNote): void {
  if (typeof window === "undefined") return;
  const content = `================================================================================
WAKHEEL ACADEMY - CORNELL LAW REVISION SYSTEM
================================================================================
TOPIC: ${note.title}
SUBJECT: ${note.subject} | TOPIC CODE: ${note.topic || "General"}
AUTHOR: ${note.author} | LAST REVISED: ${note.lastEdited}
================================================================================

[QUADRANT 1: RECALL CUES, QUESTIONS & STATUTORY LANDMARKS]
${note.cues.map((c, i) => `  ${i + 1}. [CUE] ${c}`).join("\n")}

Statutory References:
${note.statutoryReferences.map((s) => `  * ${s}`).join("\n") || "  (None explicitly listed)"}

Landmark Cases & Citations:
${note.landmarkCases.map((cs) => `  * ${cs}`).join("\n") || "  (None explicitly listed)"}

--------------------------------------------------------------------------------
[QUADRANT 2: CORE LEGAL FORMULATION & STATUTORY ANALYSIS]
--------------------------------------------------------------------------------
${note.content}

================================================================================
[QUADRANT 3: EXECUTIVE SUMMARY & RATIO DECIDENDI]
================================================================================
"${note.summary}"

================================================================================
Certified by Wakheel Law Chambers & Academic Repository
Exported on: ${new Date().toLocaleString()}
================================================================================`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Cornell_Note_${note.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCornellNoteAsHtml(note: CornellNote): void {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate printable Cornell sheets.");
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Wakheel Cornell Sheet - ${note.title}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif;
      color: #111827;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #000000;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #000000;
    }
    .brand span {
      color: #f59e0b;
    }
    .meta {
      font-size: 11px;
      color: #6b7280;
      font-family: monospace;
    }
    .title-box {
      background: #fefce8;
      border: 1px solid #fde047;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .title-box h1 {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      color: #78350f;
    }
    .title-box p {
      margin: 4px 0 0;
      font-size: 12px;
      color: #92400e;
    }
    .cornell-grid {
      display: grid;
      grid-template-columns: 240px 1fr;
      border: 1.5px solid #d1d5db;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .cue-col {
      background: #f9fafb;
      border-right: 1.5px solid #d1d5db;
      padding: 16px;
    }
    .cue-col h3 {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #b45309;
      margin-top: 0;
      margin-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
    }
    .cue-list {
      list-style: none;
      padding: 0;
      margin: 0 0 16px;
      font-size: 12px;
    }
    .cue-list li {
      margin-bottom: 8px;
      padding-left: 12px;
      position: relative;
      font-weight: 600;
      color: #1f2937;
    }
    .cue-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #f59e0b;
      font-weight: bold;
    }
    .content-col {
      padding: 18px;
      font-size: 13px;
      color: #1f2937;
      white-space: pre-line;
      line-height: 1.6;
    }
    .content-col h3 {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #4b5563;
      margin-top: 0;
      margin-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
    }
    .summary-box {
      border: 1.5px solid #000000;
      border-radius: 8px;
      padding: 14px 18px;
      background: #fafafa;
    }
    .summary-box h3 {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 900;
      letter-spacing: 0.5px;
      color: #000000;
      margin: 0 0 6px;
    }
    .summary-box p {
      font-size: 12.5px;
      font-style: italic;
      color: #1f2937;
      margin: 0;
    }
    .footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
      font-size: 10px;
      color: #9ca3af;
      display: flex;
      justify-content: space-between;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      background: #e5e7eb;
      color: #374151;
      margin-right: 4px;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">WAKHEEL <span>ACADEMY</span></div>
    <div class="meta">CORNELL LAW REVISION SYSTEM • PRINT CERTIFIED</div>
  </div>

  <div class="title-box">
    <h1>${note.title}</h1>
    <p><strong>${note.subject}</strong> • Topic: ${note.topic || "Core Jurisprudence"} • Author: ${note.author} • Last Edited: ${note.lastEdited}</p>
  </div>

  <div class="cornell-grid">
    <div class="cue-col">
      <h3>Recall Cues & Queries</h3>
      <ul class="cue-list">
        ${note.cues.map((c) => `<li>${c}</li>`).join("")}
      </ul>

      <h3>Statutes & Acts</h3>
      <div style="margin-bottom: 14px;">
        ${note.statutoryReferences.map((s) => `<span class="badge" style="background:#fef3c7; color:#92400e;">${s}</span>`).join("")}
      </div>

      <h3>Precedents & Citations</h3>
      <div>
        ${note.landmarkCases.map((cs) => `<div style="font-size:11px; font-weight:600; margin-bottom:6px; color:#374151;">⚖ ${cs}</div>`).join("")}
      </div>
    </div>

    <div class="content-col">
      <h3>Core Legal Formulation & Statutory Analysis</h3>
      ${note.content}
    </div>
  </div>

  <div class="summary-box">
    <h3>Executive Summary & Ratio Decidendi</h3>
    <p>&ldquo;${note.summary}&rdquo;</p>
  </div>

  <div class="footer">
    <div>Wakheel Legal Research Repository • Confidential Academic Memorial</div>
    <div>Document ID: ${note.id} • Printed: ${new Date().toLocaleDateString()}</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
