import { academyApi } from "@/lib/academyApi";

export interface LectureAudio {
  id: string;
  title: string;
  subject: string;
  targetBatch: string;
  facultyName: string;
  duration: string;
  durationSeconds: number;
  date: string;
  audioUrl?: string;
  statutoryNotes: string;
  keyCitations: string[];
  listensCount: number;
  category: "Faculty Masterclass" | "Oral Argument Drill" | "Rapid Doctrine Revision";
  isFeatured?: boolean;
}

export interface RecordingTemplate {
  id: string;
  title: string;
  subject: string;
  targetBatch: string;
  category: "Faculty Masterclass" | "Oral Argument Drill" | "Rapid Doctrine Revision";
  statutoryNotes: string;
  keyCitations: string[];
}

export const RECORDING_TEMPLATES: RecordingTemplate[] = [
  {
    id: "rec_tpl_bnss",
    title: "BNSS 2023 Section 480 Regular Bail & Section 35 Safeguards",
    subject: "Criminal Procedure (BNSS 2023)",
    targetBatch: "CLAT 2027 Super-30 & Distance LL.B",
    category: "Faculty Masterclass",
    statutoryNotes:
      "Statutory threshold under BNSS §35 prohibiting mechanical arrests for offenses <= 7 years. Citing Arnesh Kumar notice requirements, triple test satisfaction before Court of Sessions under §480, and personal liberty under Article 21.",
    keyCitations: [
      "Arnesh Kumar v. State of Bihar (2014) 8 SCC 273",
      "Satender Kumar Antil v. CBI (2022) 10 SCC 51",
      "P. Chidambaram v. CBI (2020) 13 SCC 337",
    ],
  },
  {
    id: "rec_tpl_const",
    title: "Basic Structure Doctrine & Article 368 Limits: The Kesavananda Synthesis",
    subject: "Constitutional Law",
    targetBatch: "KLEE 2027 & NLU Foundation",
    category: "Faculty Masterclass",
    statutoryNotes:
      "Analysis of 13-Judge Constitution Bench ruling. Parliament has wide amendatory power under Article 368, but cannot alter the basic framework or identity of the Constitution. Ratio Decidendi extraction and subsequent tests in Minerva Mills.",
    keyCitations: [
      "Kesavananda Bharati v. State of Kerala (1973) 4 SCC 225",
      "Minerva Mills v. Union of India (1980) 3 SCC 625",
      "Indira Nehru Gandhi v. Raj Narain (1975) Supp SCC 1",
    ],
  },
  {
    id: "rec_tpl_contracts",
    title: "Remoteness of Damages & Mitigation Rule under Section 73 Contract Act",
    subject: "Law of Contracts",
    targetBatch: "Bar Examination & 1st Year LL.B",
    category: "Rapid Doctrine Revision",
    statutoryNotes:
      "Two limbs of Hadley v. Baxendale: natural course losses vs special contemplated losses. Statutory duty of mitigation under the Explanation to Section 73 Indian Contract Act 1872. Dissecting Victoria Laundry and Karsandas Thacker.",
    keyCitations: [
      "Hadley v. Baxendale (1854) 9 Exch 341",
      "Victoria Laundry Ltd v. Newman Industries Ltd (1949) 2 KB 528",
      "Karsandas H. Thacker v. Saran Engineering Co. Ltd (AIR 1965 SC 1981)",
    ],
  },
  {
    id: "rec_tpl_bns",
    title: "BNS 2023 Culpable Homicide vs Murder: S.103 vs S.105",
    subject: "Bharatiya Nyaya Sanhita (BNS 2023)",
    targetBatch: "Judicial Services & CLAT PG",
    category: "Oral Argument Drill",
    statutoryNotes:
      "Degree of intention and bodily injury likely to cause death. Concentric circles doctrine from Rayavarapu Punnayya (1976). Transition from IPC 299/300 to BNS 103/105 and magisterial framing of charges.",
    keyCitations: [
      "State of A.P. v. Rayavarapu Punnayya (1976) 4 SCC 382",
      "KM Nanavati v. State of Maharashtra (AIR 1962 SC 605)",
      "Virsa Singh v. State of Punjab (AIR 1958 SC 465)",
    ],
  },
];

/**
 * Creates a valid, playable PCM 8-bit mono WAV Data URI
 * for audio playback in browsers without external assets.
 */
export function generateSyntheticWavDataUri(durationSeconds: number = 6, freq: number = 440): string {
  const sampleRate = 8000;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Helper to write ASCII strings
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF Chunk
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");

  // "fmt " Subchunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 1, true); // BlockAlign
  view.setUint16(34, 8, true); // BitsPerSample (8 bits)

  // "data" Subchunk
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Generate pleasant harmonic chime/speech-like oscillation
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Layered gentle harmonics simulating speech rhythm
    const wave =
      Math.sin(2 * Math.PI * freq * t) * 0.5 +
      Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.25 +
      Math.sin(2 * Math.PI * (freq * 0.75) * t) * 0.25;
    // Fade out towards ends of syllables
    const envelope = Math.sin(Math.PI * (i / numSamples));
    const sample = Math.floor(128 + wave * envelope * 115);
    view.setUint8(44 + i, Math.min(255, Math.max(0, sample)));
  }

  // Convert buffer to base64
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return "data:audio/wav;base64," + btoa(binary);
}

export const INITIAL_LECTURES: LectureAudio[] = [];

const STORAGE_KEY = "wakheel_lecture_audio_v1";

export function getStoredLectures(): LectureAudio[] {
  if (typeof window === "undefined") return INITIAL_LECTURES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LECTURES));
      return INITIAL_LECTURES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_LECTURES;
  } catch (err) {
    console.error("Failed to read lecture audio from storage:", err);
    return INITIAL_LECTURES;
  }
}

export async function syncLecturesWithServer(): Promise<LectureAudio[]> {
  if (typeof window === "undefined") return INITIAL_LECTURES;
  try {
    const res = await academyApi.getLectures();
    if (res.success && Array.isArray(res.lectures)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.lectures));
      window.dispatchEvent(new Event("storage"));
      return res.lectures;
    }
  } catch (err) {
    console.warn("syncLecturesWithServer offline fallback:", err);
  }
  return getStoredLectures();
}

export function saveLecture(lecture: LectureAudio): LectureAudio[] {
  if (typeof window === "undefined") return [lecture];
  try {
    const lectures = getStoredLectures();
    const existingIdx = lectures.findIndex((l) => l.id === lecture.id);
    let updated: LectureAudio[];
    if (existingIdx >= 0) {
      updated = [...lectures];
      updated[existingIdx] = lecture;
    } else {
      updated = [lecture, ...lectures];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    academyApi.createLecture(lecture).catch((err) => console.warn("saveLecture remote sync:", err));
    return updated;
  } catch (err) {
    console.error("Failed to save lecture audio:", err);
    return [lecture];
  }
}

export function deleteLecture(id: string): LectureAudio[] {
  if (typeof window === "undefined") return [];
  try {
    const lectures = getStoredLectures();
    const updated = lectures.filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    academyApi.deleteLecture(id).catch((err) => console.warn("deleteLecture remote sync:", err));
    return updated;
  } catch (err) {
    console.error("Failed to delete lecture audio:", err);
    return [];
  }
}

export function incrementListenCount(id: string): LectureAudio[] {
  if (typeof window === "undefined") return [];
  try {
    const lectures = getStoredLectures();
    const updated = lectures.map((l) =>
      l.id === id ? { ...l, listensCount: l.listensCount + 1 } : l
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    academyApi.incrementLectureListens(id).catch((err) => console.warn("incrementListenCount remote sync:", err));
    return updated;
  } catch (err) {
    console.error("Failed to increment listen count:", err);
    return [];
  }
}

export function downloadLectureAudio(lecture: LectureAudio): void {
  if (typeof window === "undefined") return;
  const audioData = lecture.audioUrl || generateSyntheticWavDataUri(8, 440);
  const a = document.createElement("a");
  a.href = audioData;
  a.download = `${lecture.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 35)}_Lecture.wav`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
