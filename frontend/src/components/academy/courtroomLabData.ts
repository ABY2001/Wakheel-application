import { academyApi } from "@/lib/academyApi";

/**
 * WAKHEEL ACADEMY - 3D COURTROOM LAB & MOOT SIMULATION DATA LAYER
 * 
 * Comprehensive Indian legal procedural framework:
 * - Courtroom Spatial Zones & Decorum (Supreme Court, High Court & Sessions)
 * - Bharatiya Sakshya Adhiniyam 2023 (BSA) & Code of Civil Procedure 1908 (CPC) Objections
 * - Realistic Moot Court Simulation Propositions
 * - In-Browser Web Audio Gavel Synthesizer
 */

export interface CourtroomZoneInfo {
  id: "bench" | "petitioner" | "respondent" | "witness" | "steno" | "gallery";
  name: string;
  hindiName: string;
  courtType: string;
  cameraPerspective: string;
  decorumRules: string[];
  statutoryBasis: string;
  hotspots: {
    title: string;
    description: string;
    citation: string;
  }[];
}

export const COURTROOM_ZONES: Record<string, CourtroomZoneInfo> = {
  bench: {
    id: "bench",
    name: "The Hon'ble Division Bench",
    hindiName: "न्यायाधीश पीठ (Bench)",
    courtType: "High Court / Supreme Court Courtroom No. 1",
    cameraPerspective: "Elevated Dais looking down towards the Bar Table and Lecterns",
    decorumRules: [
      "Rise immediately when the court usher announces the entrance of Their Lordships.",
      "Address presiding judges as 'Your Lordship' / 'Your Ladyship' or 'This Hon'ble Court'.",
      "Maintain respectful silence; never interrupt a presiding judge while they are framing a query.",
      "Bow towards the Bench upon entering the courtroom, when approaching the podium, and before departing."
    ],
    statutoryBasis: "Articles 124, 214 of Constitution of India; Supreme Court Rules 2013 Order IV",
    hotspots: [
      {
        title: "Judicial Seal & Ashoka Emblem",
        description: "Symbolizes sovereign judicial authority and constitutional supremacy under Article 141.",
        citation: "Union of India v. Association for Democratic Reforms (2002)"
      },
      {
        title: "Presiding Chief Justice Chair",
        description: "Directs oral proceedings, allocates time, and issues orders on ad-interim applications.",
        citation: "State of Rajasthan v. Prakash Chand (1998) 1 SCC 1"
      },
      {
        title: "Judicial Gavel & Sound Block",
        description: "Used to restore courtroom order, punctuate rulings, and command immediate silence.",
        citation: "Contempt of Courts Act, 1971 Section 2(c)"
      }
    ]
  },
  petitioner: {
    id: "petitioner",
    name: "Petitioner / Appellant Central Lectern",
    hindiName: "याचिकाकर्ता व्याख्यान मंच (Petitioner Lectern)",
    courtType: "Appellate & Writ Jurisdiction",
    cameraPerspective: "Standing behind the central wooden lectern, gazing directly up at the 3-Judge Bench",
    decorumRules: [
      "Commence oral arguments with: 'May it please Your Lordships, Counsel appears on behalf of the Petitioner/Appellant.'",
      "Reserve 2 to 3 minutes of your allocated 15-minute moot window for Rebuttal during your opening prayer.",
      "Always hand over two copies of the Compendium of Authorities to the Court Master before opening facts.",
      "Never turn your back on the Bench while organizing case files or addressing junior instructing counsel."
    ],
    statutoryBasis: "Bar Council of India Rules, Part VI, Chapter II (Standards of Professional Conduct)",
    hotspots: [
      {
        title: "Oral Argument Lectern",
        description: "Fitted with compendium book-rest and digital clock with warning lights (Green/Amber/Red).",
        citation: "SC Bar Association Guidelines on Time Management (2023)"
      },
      {
        title: "Memorial & Compendium Folder",
        description: "Contains Statement of Facts, Issues Raised, Summary of Arguments, and Landmark Ratios.",
        citation: "Bar Council of India Model Moot Court Rules"
      },
      {
        title: "Instructing Advocate Note-Slips",
        description: "Junior counsel passes discreet factual clarification slips without disturbing speaker.",
        citation: "Advocates Act 1961 Section 30"
      }
    ]
  },
  respondent: {
    id: "respondent",
    name: "Respondent / State Defense Bar Table",
    hindiName: "प्रतिवादी / राज्य पक्ष तालिका (Respondent Bar Table)",
    courtType: "Original & Appellate Defense",
    cameraPerspective: "Right side of courtroom looking across the central aisle towards Petitioner and the Bench",
    decorumRules: [
      "Raise preliminary maintainability objections before arguing on merits (e.g. alternate remedy under Art. 226).",
      "Address Petitioner's submissions point-by-point referencing paragraphs of the counter-affidavit.",
      "Object immediately if opposing counsel introduces facts outside the certified trial record.",
      "Conclude with prayer for dismissal of the petition with exemplary costs if frivolous."
    ],
    statutoryBasis: "Order VIII CPC (Written Statement & Set-off); Section 301 CrPC / BNSS §338",
    hotspots: [
      {
        title: "State Prosecutor / Defense Table",
        description: "Stationed to the right of the Bench, holding original lower court record and case diary.",
        citation: "State of U.P. v. Chandrika (1999) 8 SCC 638"
      },
      {
        title: "Counter-Affidavit File",
        description: "Sworn denial of petitioner's allegations and preliminary objections on locus standi.",
        citation: "Order XIX CPC (Affidavits)"
      },
      {
        title: "Sur-Rebuttal Preparation Pad",
        description: "Used to record novel issues raised in petitioner's rebuttal to seek bench leave.",
        citation: "Supreme Court Practice & Procedure Directive No. 4"
      }
    ]
  },
  witness: {
    id: "witness",
    name: "Witness Box (Katghara) & Deposition Stand",
    hindiName: "गवाह का कठघरा (Witness Box)",
    courtType: "Trial Court & Sessions Criminal Trials",
    cameraPerspective: "Enclosed wooden witness stand looking across at the Cross-Examining Advocate",
    decorumRules: [
      "Witness must take solemn affirmation under the Oaths Act, 1969 before speaking.",
      "Must directly answer the questions without volunteering unsolicited hearsay assertions.",
      "Leading questions are strictly forbidden during Examination-in-Chief without leave of Court.",
      "Hostile witness declaration can be sought by the calling party under Section 154 BSA (IEA S. 154)."
    ],
    statutoryBasis: "Bharatiya Sakshya Adhiniyam 2023 (BSA) Sections 137-166; Indian Oaths Act 1969",
    hotspots: [
      {
        title: "Solemn Oath Pod",
        description: "Place where witness affirms: 'I swear in the name of God / solemnly affirm that I will speak the truth.'",
        citation: "Oaths Act, 1969 Section 4"
      },
      {
        title: "Deposition Microphone",
        description: "Captures verbal evidence directly for transcription by the shorthand steno into record.",
        citation: "BNSS 2023 Section 254 (Recording of Evidence)"
      },
      {
        title: "Exhibit Identification Tray",
        description: "Material evidence and documents are handed to witness for formal identification and signature.",
        citation: "BSA 2023 Section 65 / Section 145"
      }
    ]
  },
  steno: {
    id: "steno",
    name: "Court Master & Steno-Typist Desk",
    hindiName: "कोर्ट मास्टर व आशुलिपिक डेस्क",
    courtType: "All Judicial Benches",
    cameraPerspective: "Directly in front of and beneath the Judges' bench",
    decorumRules: [
      "Records live daily order sheets, dictation, and marks admitted exhibits as Ext. P-1 or Ext. D-1.",
      "Transmits case compendiums and case laws directly to Their Lordships upon request.",
      "Maintains the official court clock and rings warning buzzers for moot time compliance."
    ],
    statutoryBasis: "Civil Manual & High Court Appellate Side Rules",
    hotspots: [
      {
        title: "Daily Order Sheet & Cause List",
        description: "Official log of called cases, appearances, interim stays granted, and next listing dates.",
        citation: "Order XX CPC (Judgment and Decree)"
      },
      {
        title: "Exhibit Marking Stamps",
        description: "Admitted trial evidence is formally marked Ext. P (Prosecution) or Ext. D (Defense).",
        citation: "BSA 2023 Section 60"
      }
    ]
  },
  gallery: {
    id: "gallery",
    name: "Public Bar Gallery & Student Observers",
    hindiName: "दर्शक दीर्घा व विधि छात्र दर्शक",
    courtType: "Open Courtroom Principle",
    cameraPerspective: "Back row viewing the entire judicial theater and advocacy interactions",
    decorumRules: [
      "Mobile phones must be strictly switched off or in airplane mode under risk of confiscation.",
      "No applause, murmuring, or visual reactions to judicial observations or counsel arguments.",
      "Strict open justice principle under Section 327 CrPC / BNSS §366."
    ],
    statutoryBasis: "BNSS 2023 Section 366 (Court to be open); Swapnil Tripathi v. SC of India (2018)",
    hotspots: [
      {
        title: "Open Justice Seating",
        description: "Guarantees public access and transparent scrutiny of judicial proceedings.",
        citation: "Naresh Shridhar Mirajkar v. State of Maharashtra (1966)"
      },
      {
        title: "Press & Media Enclosure",
        description: "Designated zone for accredited legal correspondents and law reporters.",
        citation: "Swapnil Tripathi v. Supreme Court of India (2018) 10 SCC 639"
      }
    ]
  }
};

/**
 * Procedural Objection Reflex Drill Scenarios (BSA 2023 & CPC 1908)
 */
export interface ObjectionDrillItem {
  id: string;
  scenario: string;
  speakingParty: "Prosecutor" | "Defense Counsel" | "Plaintiff Advocate";
  context: "Trial Examination" | "Civil Suit Argument" | "Expert Witness" | "Writ Hearing";
  options: {
    label: string;
    isCorrect: boolean;
    statutoryBasis: string;
  }[];
  verdict: "SUSTAINED" | "OVERRULED";
  judgeRuling: string;
  pedagogicalNote: string;
}

export const OBJECTION_DRILLS: ObjectionDrillItem[] = [
  {
    id: "obj_1",
    scenario: "Counsel during Examination-in-Chief asks the victim: 'When you saw the accused running out of the room at 10 PM, he was clutching the blood-stained butcher knife in his right hand, wasn't he?'",
    speakingParty: "Prosecutor",
    context: "Trial Examination",
    options: [
      {
        label: "Objection: Leading Question during Examination-in-Chief",
        isCorrect: true,
        statutoryBasis: "Section 141 & 142 of Bharatiya Sakshya Adhiniyam 2023 (erstwhile S. 141-142 IEA)"
      },
      {
        label: "Objection: Hearsay Evidence",
        isCorrect: false,
        statutoryBasis: "Section 59 BSA"
      },
      {
        label: "Objection: Beyond the Scope of Pleadings",
        isCorrect: false,
        statutoryBasis: "Order VI Rule 7 CPC"
      },
      {
        label: "Objection: Improper Character of Accused",
        isCorrect: false,
        statutoryBasis: "Section 53 BSA"
      }
    ],
    verdict: "SUSTAINED",
    judgeRuling: "Objection Sustained! Counsel shall not suggest the answer in the question during Chief Examination. Rephrase without leading the witness.",
    pedagogicalNote: "Leading questions cannot be asked in Examination-in-Chief or Re-examination without leave of the Court on introductory or undisputed matters (S. 142 BSA)."
  },
  {
    id: "obj_2",
    scenario: "The witness testifies: 'My landlord told me the next morning that his nephew saw the tenant forcibly breaking open the warehouse lock.' The landlord is alive but has not been summoned.",
    speakingParty: "Plaintiff Advocate",
    context: "Trial Examination",
    options: [
      {
        label: "Objection: Incompetent Witness",
        isCorrect: false,
        statutoryBasis: "Section 118 IEA"
      },
      {
        label: "Objection: Inadmissible Hearsay Evidence",
        isCorrect: true,
        statutoryBasis: "Section 55 & 59 of Bharatiya Sakshya Adhiniyam 2023 (Oral evidence must be direct)"
      },
      {
        label: "Objection: Secondary Evidence without Notice",
        isCorrect: false,
        statutoryBasis: "Section 65 BSA"
      },
      {
        label: "Objection: Privileged Spousal Communication",
        isCorrect: false,
        statutoryBasis: "Section 122 IEA"
      }
    ],
    verdict: "SUSTAINED",
    judgeRuling: "Objection Sustained! The statement is classic hearsay. Oral evidence must be direct: given by the person who personally perceived the act. Strike that sentence from the deposition.",
    pedagogicalNote: "Under Section 59 BSA, oral evidence must in all cases whatever be direct. Secondhand hearsay without falling under Res Gestae or S. 32 Dying Declaration is wholly excluded."
  },
  {
    id: "obj_3",
    scenario: "During oral arguments in a breach of contract suit, the Defendant's counsel raises the defense of Promissory Estoppel and mutual waiver. Neither plea was ever included in their Written Statement or amended pleadings.",
    speakingParty: "Defense Counsel",
    context: "Civil Suit Argument",
    options: [
      {
        label: "Objection: Leading Argument",
        isCorrect: false,
        statutoryBasis: "Not applicable"
      },
      {
        label: "Objection: Beyond the Scope of Pleadings (Departure from Pleadings)",
        isCorrect: true,
        statutoryBasis: "Order VI Rule 7 & Order VIII Rule 2 Code of Civil Procedure 1908"
      },
      {
        label: "Objection: Lack of Pecuniary Jurisdiction",
        isCorrect: false,
        statutoryBasis: "Section 6 CPC"
      },
      {
        label: "Objection: Bar of Res Judicata",
        isCorrect: false,
        statutoryBasis: "Section 11 CPC"
      }
    ],
    verdict: "SUSTAINED",
    judgeRuling: "Objection Sustained! No amount of evidence or argument can be looked into upon a plea never set up in the pleadings. Counsel cannot introduce a new case of waiver at the stage of final hearing.",
    pedagogicalNote: "Supreme Court in Bachhaj Nahar v. Nilima Mandal (2008) ruled that a court cannot make out a case not pleaded by the parties in their plaint or written statement."
  },
  {
    id: "obj_4",
    scenario: "Counsel cross-examines a handwriting expert: 'Isn't it true that you were suspended by the state forensic lab in 2021 for accepting gifts from litigants?'",
    speakingParty: "Defense Counsel",
    context: "Expert Witness",
    options: [
      {
        label: "Objection: Irrelevant and Scandalous Question",
        isCorrect: false,
        statutoryBasis: "Section 151 IEA"
      },
      {
        label: "Permissible: Questions Lawful in Cross-Examination to Impeach Credit",
        isCorrect: true,
        statutoryBasis: "Section 149 of Bharatiya Sakshya Adhiniyam 2023 (Testing veracity and shaking credit)"
      },
      {
        label: "Objection: Hearsay regarding past suspension",
        isCorrect: false,
        statutoryBasis: "Section 59 BSA"
      },
      {
        label: "Objection: Privilege of Expert Witness",
        isCorrect: false,
        statutoryBasis: "Section 126 IEA"
      }
    ],
    verdict: "OVERRULED",
    judgeRuling: "Objection Overruled! In cross-examination, counsel is entitled under Section 149 BSA to test the witness's veracity, detect bias, and impeach personal credibility. Witness will answer.",
    pedagogicalNote: "Cross-examination is not confined to the facts testified in Chief. Questions shaking credit, exposing pecuniary interest or past professional misconduct are lawful under S. 149 BSA."
  },
  {
    id: "obj_5",
    scenario: "The Plaintiff attempts to introduce an unsigned photocopy of a purported unregistered agreement to sell, claiming the original was left at a friend's office who is currently traveling abroad.",
    speakingParty: "Plaintiff Advocate",
    context: "Trial Examination",
    options: [
      {
        label: "Objection: Inadmissible Secondary Evidence without establishing loss of primary document",
        isCorrect: true,
        statutoryBasis: "Sections 58, 60 & 65 of Bharatiya Sakshya Adhiniyam 2023 (Primary evidence rule)"
      },
      {
        label: "Objection: Leading Documentary Evidence",
        isCorrect: false,
        statutoryBasis: "S. 141 BSA"
      },
      {
        label: "Objection: Privileged Document",
        isCorrect: false,
        statutoryBasis: "S. 123 IEA"
      },
      {
        label: "Objection: Bad Character Evidence",
        isCorrect: false,
        statutoryBasis: "S. 53 BSA"
      }
    ],
    verdict: "SUSTAINED",
    judgeRuling: "Objection Sustained! Secondary evidence cannot be tendered casually. Merely stating that an original is with a traveling friend does not satisfy S. 65 BSA conditions for destruction, loss, or adversary possession. Document rejected.",
    pedagogicalNote: "Under Section 65 BSA, primary evidence (original document) must be produced unless foundational predicate proving total loss or destruction is established by sworn affidavit."
  }
];

/**
 * Interactive Moot Simulation Cases with Step-by-Step Multi-Turn Queries
 */
export interface MootStepChoice {
  text: string;
  quality: "Distinguished" | "Acceptable" | "Flawed";
  scoreDelta: number;
  judgeResponse: string;
  feedback: string;
}

export interface MootStep {
  stepNumber: number;
  phaseTitle: string;
  judgeName: string;
  judgeDemeanor: "Inquisitive" | "Skeptical" | "Demanding" | "Neutral";
  benchQuery: string;
  choices: MootStepChoice[];
}

export interface MootCourtCase {
  id: string;
  title: string;
  shortTitle: string;
  forum: string;
  benchStrength: string;
  subject: string;
  timeLimitMin: number;
  memorialPointers: string[];
  factsSummary: string;
  steps: MootStep[];
}

export const MOOT_CASES: MootCourtCase[] = [
  {
    id: "moot_case_1",
    title: "Ananya Sen v. State of Maharashtra & Anr.",
    shortTitle: "Digital Privacy & Regular Bail under BNSS §480",
    forum: "Hon'ble High Court of Judicature at Bombay (Criminal Appellate Bench)",
    benchStrength: "Division Bench (2 Judges)",
    subject: "Constitutional Law & Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)",
    timeLimitMin: 15,
    memorialPointers: [
      "Whether seizure of an encrypted personal smartphone without judicial warrant violates Article 21 privacy (Puttaswamy).",
      "Application of Triple Test for bail under Section 480 BNSS (Flight risk, evidence tampering, witness influence).",
      "Whether custodial interrogation is necessary when data mirror image has already been cloned by Cyber Cell."
    ],
    factsSummary: "The petitioner, a 23-year-old investigative tech journalist, was arrested on suspicion of assisting a data leak from a state healthcare portal. Police seized her encrypted laptop and phone without a Section 94 BNSS warrant and refused bail claiming she is 'uncooperative' because she refuses to disclose her private decryption biometric password.",
    steps: [
      {
        stepNumber: 1,
        phaseTitle: "Opening Submission & Decorum Protocol",
        judgeName: "Hon'ble Justice S. K. Deshmukh",
        judgeDemeanor: "Demanding",
        benchQuery: "Counsel, before you jump to fundamental rights, this bail application was rejected by the Sessions Court barely 48 hours ago. What material change of circumstances entitles you to approach this High Court without filing a revision?",
        choices: [
          {
            text: "May it please Your Lordships. Under Section 480 BNSS, this Court exercises concurrent, original statutory jurisdiction in bail matters, distinct from revisional scrutiny. Furthermore, the State completed forensic data cloning yesterday, extinguishing all grounds of custodial necessity.",
            quality: "Distinguished",
            scoreDelta: 25,
            judgeResponse: "Well articulated on the concurrent nature of Section 480, Counsel. The Bench notes the completed forensic mirror image. Proceed to your constitutional ground on biometric decryption.",
            feedback: "Flawless distinction between concurrent bail jurisdiction under S. 480 BNSS (erstwhile 439 CrPC) and revisional bars."
          },
          {
            text: "Your Lordship, the Sessions Judge was biased and acted under police influence. We came here because the High Court has unlimited constitutional powers to correct inferior judges.",
            quality: "Flawed",
            scoreDelta: 5,
            judgeResponse: "Counsel, restrain yourself! Making uncorroborated allegations of bias against a judicial officer violates Bar Council decorum. State your legal proposition cleanly.",
            feedback: "Violates Bar Council Rule 1: Never disparage lower judicial officers in oral appellate argument."
          },
          {
            text: "We are approaching primarily under Article 226 for personal liberty, so Section 480 limitations do not bind us.",
            quality: "Acceptable",
            scoreDelta: 15,
            judgeResponse: "While this Bench has writ powers, this is titled a regular bail petition under Section 480. We shall treat it under statutory bail principles. Continue.",
            feedback: "Technically acceptable, but confounding statutory bail under BNSS with plenary Article 226 writ causes unnecessary bench friction."
          }
        ]
      },
      {
        stepNumber: 2,
        phaseTitle: "Constitutional Challenge: Coerced Smartphone Passwords",
        judgeName: "Hon'ble Justice Mrs. R. Narayanan",
        judgeDemeanor: "Inquisitive",
        benchQuery: "Counsel, the State Prosecutor argues that providing a device password is like providing a physical house key or a handwriting exemplar under Selvi v. State of Karnataka. Why isn't a digital passcode merely physical evidence?",
        choices: [
          {
            text: "Most respectfully, Ladyship, a digital password is pure testimonial cognition, directly protected by Article 20(3). In Selvi (2010), a 3-Judge Bench held that compelling mental knowledge violates the right against self-incrimination. A modern smartphone is not a locked trunk; as held in Riley v. California and Puttaswamy (2017), it holds the entirety of one's private life and intellectual intimacies.",
            quality: "Distinguished",
            scoreDelta: 25,
            judgeResponse: "Compelling argument on the cognitive threshold of Article 20(3). The Bench is inclined to agree that biometric compulsion cannot be a prerequisite for bail.",
            feedback: "Masterful citation of Selvi and Puttaswamy distinguishing testimonial cognition from physical identification."
          },
          {
            text: "Because phones are private property protected under Article 300A and police cannot take away private property without giving compensation.",
            quality: "Flawed",
            scoreDelta: 0,
            judgeResponse: "Article 300A is eminent domain property law, Counsel! This is a criminal bail matter touching Article 20(3) and Article 21. Ground yourself in the proper constitutional provision.",
            feedback: "Grave error: Applying eminent domain Article 300A to self-incrimination under Article 20(3)."
          },
          {
            text: "The phone does not belong to the accused anyway, it was bought by her media employer, so she does not even have the right to share the password.",
            quality: "Acceptable",
            scoreDelta: 12,
            judgeResponse: "That may be a factual defence at trial, but the petitioner was in exclusive possession. Address the self-incrimination doctrine directly.",
            feedback: "Evading the constitutional legal question by resorting to collateral factual deflection."
          }
        ]
      },
      {
        stepNumber: 3,
        phaseTitle: "Satisfaction of Triple Test under BNSS §480",
        judgeName: "Hon'ble Justice S. K. Deshmukh",
        judgeDemeanor: "Skeptical",
        benchQuery: "The cyber crime department states the petitioner holds dual passport status and could easily flee to London. How does the petitioner satisfy the flight risk limb of the Triple Test?",
        choices: [
          {
            text: "Your Lordship, the petitioner is a permanent resident of Mumbai with deep roots in society and an ailing mother under her sole care. To eliminate any flight risk, the petitioner voluntarily undertakes to deposit her original passport with the trial registry, report to the investigating officer every Monday at 10 AM, and provide two local solvent sureties of ₹1,00,000 each.",
            quality: "Distinguished",
            scoreDelta: 25,
            judgeResponse: "Fair and structured safeguards. That adequately quells our apprehension regarding flight risk.",
            feedback: "Exemplary advocacy: Pre-emptively proposing stringent conditionality under Section 480(3) BNSS."
          },
          {
            text: "Police are just lying, My Lord. London tickets are very expensive right now and she doesn't have money to fly anywhere.",
            quality: "Flawed",
            scoreDelta: 5,
            judgeResponse: "Counsel, we deal in judicial undertakings and statutory conditions, not ticket price speculations. Present concrete surety terms.",
            feedback: "Unprofessional colloquial phrasing lacking statutory conditioning."
          },
          {
            text: "Under Arnesh Kumar and Satender Kumar Antil, bail is the rule and jail is the exception. The court must grant bail unconditionally.",
            quality: "Acceptable",
            scoreDelta: 15,
            judgeResponse: "Antil is well-settled law, but flight risk still requires reasonable imposition of conditions under Section 480(3). We will record passport surrender.",
            feedback: "Correct precedent citation, but ignoring the necessity of mitigating flight risk through sureties."
          }
        ]
      },
      {
        stepNumber: 4,
        phaseTitle: "Prayer & Reservation of Rebuttal",
        judgeName: "Hon'ble Justice Mrs. R. Narayanan",
        judgeDemeanor: "Neutral",
        benchQuery: "Counsel, your 13 minutes have elapsed. Conclude your oral submissions and formulate your precise prayer.",
        choices: [
          {
            text: "May it please this Hon'ble Court. In light of the completed forensic mirror image, absence of flight risk, and constitutional protection under Articles 20(3) and 21, the Petitioner prays for an order of Regular Bail under Section 480 BNSS subject to reasonable conditions. Furthermore, Counsel reserves the remaining 2 minutes for Rebuttal following Respondent's arguments.",
            quality: "Distinguished",
            scoreDelta: 25,
            judgeResponse: "Well timed, Counsel. Rebuttal time of 2 minutes is noted and reserved. We now call upon the Learned Public Prosecutor.",
            feedback: "Perfect prayer formulation with accurate statutory relief and crisp reservation of rebuttal."
          },
          {
            text: "Yes, we want the court to immediately quash all FIRs against her and arrest the investigating officer for illegal detention.",
            quality: "Flawed",
            scoreDelta: 0,
            judgeResponse: "Counsel! This is a Section 480 Regular Bail Bench, not a Section 528 BNSS (erstwhile 482 CrPC) quashing proceeding! Know your roster and pray only for what this Bench can grant.",
            feedback: "Catastrophic error: Praying for FIR quashing in a Section 480 Regular Bail petition."
          },
          {
            text: "We pray for bail and release today. Thank you.",
            quality: "Acceptable",
            scoreDelta: 14,
            judgeResponse: "Brief prayer noted. You did not mention rebuttal reservation, so we proceed to judgment directly.",
            feedback: "Too abrupt; failed to state statutory grounds or reserve rebuttal."
          }
        ]
      }
    ]
  },
  {
    id: "moot_case_2",
    title: "Bharat Infrastructure Ltd. v. Union of India",
    shortTitle: "Doctrine of Frustration & Force Majeure (ICA §56)",
    forum: "Supreme Court of India (Commercial Appellate Division)",
    benchStrength: "3-Judge Bench",
    subject: "Contract Law & Commercial Arbitration",
    timeLimitMin: 15,
    memorialPointers: [
      "Whether sudden geopolitical trade embargoes constitute frustration under Section 56 ICA or mere commercial hardship.",
      "The test laid down in Satyabrata Ghose v. Mugneeram Bangur & Co. (1954).",
      "Notice requirements under contractual Force Majeure clauses versus common law statutory frustration."
    ],
    factsSummary: "A private infrastructure concessionaire entered into a 15-year highway construction concession with NHAI. Unforeseen international sanctions halted the import of patented soil stabilization bitumen polymers, causing prices to surge by 400%. The concessionaire declared frustration of contract.",
    steps: [
      {
        stepNumber: 1,
        phaseTitle: "Distinction: Frustration vs Commercial Difficulty",
        judgeName: "Hon'ble Presiding Senior Judge",
        judgeDemeanor: "Demanding",
        benchQuery: "Counsel, Energy Watchdog v. CERC (2017) has settled beyond dispute that a mere escalation of prices or economic unviability does not amount to frustration under Section 56. Why shouldn't your client bear the commercial risk of price fluctuation?",
        choices: [
          {
            text: "Most respectfully, My Lord, Energy Watchdog dealt with alternative coal supply markets where fuel was commercially available at higher cost. Here, the embargo did not merely hike prices—the patented bitumen polymer was exclusively produced in the sanctioned territory, rendering performance fundamentally and legally impossible, destroying the underlying substratum of the contract as contemplated in Satyabrata Ghose.",
            quality: "Distinguished",
            scoreDelta: 25,
            judgeResponse: "An astute distinction of Energy Watchdog on market exclusivity. Counsel has successfully isolated the impossibility of supply.",
            feedback: "Superb handling of adverse Supreme Court precedent by factually distinguishing alternative sourcing."
          },
          {
            text: "Because 400% price rise is unfair and the government must be socialist under the Preamble of the Constitution.",
            quality: "Flawed",
            scoreDelta: 2,
            judgeResponse: "Preamble socialism cannot rewrite commercial risk allocation in a BOT highway contract, Counsel! Confine your arguments to Section 56 jurisprudence.",
            feedback: "Inappropriate invocation of constitutional ideals in a private commercial contract dispute."
          },
          {
            text: "Energy Watchdog was wrongly decided by a 2-judge bench and this 3-judge bench should overrule it today.",
            quality: "Flawed",
            scoreDelta: 5,
            judgeResponse: "Energy Watchdog correctly synthesized six decades of Section 56 jurisprudence. We will not entertain casual invitations to overrule settled precedent.",
            feedback: "Reckless stance: Asking a bench to overrule precedent without demonstrating doctrinal contradiction."
          }
        ]
      }
    ]
  }
];

/**
 * In-Browser Web Audio API Gavel Synthesizer
 * Generates an authentic double-tap wooden gavel sound without external audio files
 */
export function playGavelSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;
    const ctx = new AudioCtxClass();

    const triggerStrike = (delaySec: number, pitch = 140) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(pitch, ctx.currentTime + delaySec);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + delaySec + 0.12);

      gain.gain.setValueAtTime(0.7, ctx.currentTime + delaySec);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delaySec + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delaySec);
      osc.stop(ctx.currentTime + delaySec + 0.15);
    };

    // Realistic double gavel strike: strike 1, pause 0.16s, strike 2
    triggerStrike(0, 160);
    triggerStrike(0.16, 140);
  } catch (err) {
    console.warn("Web Audio Gavel sound failed to trigger:", err);
  }
}

/**
 * Storage helpers for Moot Sessions & Drill Scores
 */
export interface MootHistoryRecord {
  id: string;
  caseId: string;
  caseTitle: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  verdict: "Bench Unanimously Concurs" | "Split 2:1 In Favor" | "Dismissed with Reprimand";
  completedDate: string;
}

export interface DrillScoreStats {
  totalAttempts: number;
  correctAnswers: number;
  accuracyRate: number;
  lastUpdated: string;
}

const MOOT_HISTORY_KEY = "wakheel_moot_history_v1";
const DRILL_STATS_KEY = "wakheel_drill_stats_v1";

export function getMootHistory(): MootHistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MOOT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function syncMootHistoryWithServer(): Promise<MootHistoryRecord[]> {
  if (typeof window === "undefined") return [];
  try {
    const res = await academyApi.getMootRecords();
    if (res.success && Array.isArray(res.records) && res.records.length > 0) {
      localStorage.setItem(MOOT_HISTORY_KEY, JSON.stringify(res.records));
      window.dispatchEvent(new Event("storage"));
      return res.records;
    }
  } catch (err) {
    console.warn("syncMootHistoryWithServer offline fallback:", err);
  }
  return getMootHistory();
}

export function saveMootRecord(record: MootHistoryRecord): MootHistoryRecord[] {
  if (typeof window === "undefined") return [record];
  try {
    const existing = getMootHistory();
    const updated = [record, ...existing];
    localStorage.setItem(MOOT_HISTORY_KEY, JSON.stringify(updated));
    academyApi.saveMootRecord(record).catch((err) => console.warn("saveMootRecord remote sync:", err));
    return updated;
  } catch {
    return [record];
  }
}

export function getDrillStats(): DrillScoreStats {
  if (typeof window === "undefined") {
    return { totalAttempts: 12, correctAnswers: 10, accuracyRate: 83, lastUpdated: "Nov 23, 2026" };
  }
  try {
    const raw = localStorage.getItem(DRILL_STATS_KEY);
    if (!raw) {
      const initial = { totalAttempts: 12, correctAnswers: 10, accuracyRate: 83, lastUpdated: "Nov 23, 2026" };
      localStorage.setItem(DRILL_STATS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return { totalAttempts: 0, correctAnswers: 0, accuracyRate: 0, lastUpdated: "Today" };
  }
}

export function updateDrillStats(isCorrect: boolean): DrillScoreStats {
  const current = getDrillStats();
  const totalAttempts = current.totalAttempts + 1;
  const correctAnswers = current.correctAnswers + (isCorrect ? 1 : 0);
  const accuracyRate = Math.round((correctAnswers / totalAttempts) * 100);
  const updated: DrillScoreStats = {
    totalAttempts,
    correctAnswers,
    accuracyRate,
    lastUpdated: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DRILL_STATS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save drill stats", e);
    }
  }
  return updated;
}
