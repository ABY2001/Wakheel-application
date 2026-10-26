"use client";

import React, { useState } from "react";
import {
  Share2,
  Compass,
  Users,
  MessagesSquare,
  Search,
  Plus,
  Send,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Building,
  UserCheck,
} from "lucide-react";

import { FirmProfile } from "@/components/firm/firmTypes";
import dynamic from "next/dynamic";

const MultiPartyCollaborationRoom = dynamic(
  () => import("@/components/advocate/MultiPartyCollaborationRoom"),
  { ssr: false }
);

interface CollabViewProps {
  activeModule?: string;
  onSelectModule?: (mod: string) => void;
  activeFirm?: FirmProfile | null;
  onAddAssociate?: () => void;
}

export function CollabView({
  activeModule = "my-network",
  onSelectModule,
  activeFirm,
  onAddAssociate,
}: CollabViewProps) {
  const [currentTab, setCurrentTab] = useState<string>(activeModule);
  const [collaskQuery, setCollaskQuery] = useState("");
  const [isCollabRoomOpen, setIsCollabRoomOpen] = useState(false);

  const tabs = [
    { id: "my-network", label: "My Network", icon: Share2 },
    { id: "my-hub", label: "My Hub", icon: Compass },
    { id: "my-team", label: "My Team", icon: Users },
    { id: "collask", label: "Collask", icon: MessagesSquare },
  ];

  const handleTabChange = (id: string) => {
    setCurrentTab(id);
    if (onSelectModule) onSelectModule(id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
              Chamber Collaboration
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
              Verified Legal Ecosystem
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mt-1">
            Collab &amp; Advocate Network
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Connect with senior advocates, manage chamber associate teams, and exchange cross-firm queries via Collask.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW: My Network */}
      {currentTab === "my-network" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search verified advocates, designated seniors, and barristers..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
              />
            </div>
            <button className="px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer">
              Invite Counsel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Senior Adv. K. Parasaran", bar: "Supreme Court Bar Association", exp: "38+ Years", specialty: "Constitutional & Civil Law", location: "New Delhi" },
              { name: "Adv. Meenakshi Lekhi", bar: "Delhi High Court Bar Association", exp: "22+ Years", specialty: "Criminal Appeals & Writs", location: "New Delhi" },
              { name: "Adv. Harish Salve KC", bar: "Bar Council of Maharashtra & Goa", exp: "35+ Years", specialty: "Cross-Border Commercial Arbitration", location: "Mumbai / London" },
              { name: "Adv. Fali S. Nariman Chambers", bar: "Supreme Court of India", exp: "40+ Years", specialty: "Public Law & Judicial Review", location: "New Delhi" },
              { name: "Adv. Rohinton Nariman", bar: "Supreme Court Bar Association", exp: "30+ Years", specialty: "Insolvency (IBC) & Arbitration", location: "New Delhi" },
              { name: "Adv. Vrinda Grover", bar: "Delhi High Court Bar Association", exp: "24+ Years", specialty: "Human Rights & Constitutional Tort", location: "New Delhi" },
            ].map((adv, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs hover:border-black dark:hover:border-white transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-black dark:text-white">{adv.name}</h4>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {adv.location}
                    </p>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-black dark:text-white shrink-0" />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-zinc-600 dark:text-zinc-400 font-medium">{adv.specialty}</p>
                  <p className="text-zinc-500 text-[11px] font-mono">{adv.bar} • {adv.exp}</p>
                </div>
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                  <button className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white text-xs font-semibold cursor-pointer">
                    View Chamber
                  </button>
                  <button className="px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer">
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: My Hub */}
      {currentTab === "my-hub" && (
        <div className="space-y-6">
          {/* Milestone 2: Multi-Party Collaboration Room Spotlight */}
          <div className="p-6 rounded-3xl bg-zinc-950 text-white border border-zinc-800 space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    ACTIVE BRIEFING ROOM • SEC. 126 PRIVILEGED
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  WP(C) 19482/2024 — High Court Rejoinder &amp; Precedent Briefing
                </h3>
                <p className="text-xs text-zinc-400">
                  Lead Advocate, Senior Counsel K. Ramachandran Nair, Associate Ananya Kurian, and Litigant Gopakumar Nambiar
                </p>
              </div>

              <button
                onClick={() => setIsCollabRoomOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 cursor-pointer shadow-xs shrink-0 flex items-center gap-2 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Launch Multi-Party Briefing Room</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-400">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 block">PINNED EXHIBIT</span>
                <span className="font-bold text-white">Annexure P-1 Survey Sketch</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 block">REAL-TIME TOOLS</span>
                <span className="font-bold text-white">Laser Pointer &amp; Synchronous Annotations</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 block">ENCRYPTION</span>
                <span className="font-bold text-white">WebSocket Audio/Video Gateway</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Chamber Status</span>
              <div className="text-xl font-bold text-black dark:text-white">Active Session</div>
              <span className="text-[10px] text-zinc-500">Court Hall 4 &amp; 12</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Active Briefs</span>
              <div className="text-xl font-bold text-black dark:text-white">24 Matters</div>
              <span className="text-[10px] text-zinc-500">Assigned across team</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Chamber Conference</span>
              <div className="text-xl font-bold text-black dark:text-white">04:30 PM</div>
              <span className="text-[10px] text-zinc-500">Senior brief strategy</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">e-Filings Pending</span>
              <div className="text-xl font-bold text-black dark:text-white">2 Filings</div>
              <span className="text-[10px] text-zinc-500">Registry clearing</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-black dark:text-white">Live Chamber Activity Stream</h3>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {[
                { time: "11:20 AM", event: "Bail petition draft uploaded for Matter #WP-2026/894 by Adv. Rajiv" },
                { time: "10:45 AM", event: "Court order in Commercial Suit #402 signed and filed into Vault" },
                { time: "09:30 AM", event: "Causelist sync completed: Bench 3 hearing listed item 14" },
                { time: "Yesterday", event: "New corporate retainer executed with CyberCorp Ltd" },
              ].map((act, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                  <span>{act.event}</span>
                  <span className="text-[11px] font-mono text-zinc-500 shrink-0 ml-4">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: My Team */}
      {currentTab === "my-team" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-black dark:text-white">
                  {activeFirm ? `${activeFirm.name} — Counsel & Associate Roster` : "Chamber Counsel & Associate Roster"}
                </h3>
                {activeFirm && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black font-mono">
                    {activeFirm.entityType} • {activeFirm.members.length} Seats
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {activeFirm
                  ? `Firm HQ: ${activeFirm.headquartersCity} • ${activeFirm.jurisdiction}`
                  : "Manage case allocations, court appearance passes, and associate billables."}
              </p>
            </div>
            <button
              type="button"
              onClick={onAddAssociate}
              className="px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shrink-0"
            >
              + Add Counsel / Seat
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(activeFirm && activeFirm.members && activeFirm.members.length > 0
              ? activeFirm.members.map((m) => ({
                  name: m.name,
                  role: m.role,
                  department: m.practiceGroup,
                  cases: "Active practice load",
                  barId: m.barEnrollmentNumber || "Bar Verified",
                }))
              : [
                  { name: "Adv. Rajiv Malhotra", role: "Principal Senior Associate", department: "Dispute Resolution", cases: "8 active matters", barId: "D/1492/2018" },
                  { name: "Adv. Preeti Sharma", role: "Litigation & Writs Specialist", department: "High Court Writs", cases: "6 active matters", barId: "D/3411/2021" },
                  { name: "Kunal Verma", role: "Judicial Research Paralegal", department: "Statutory Research", cases: "10 research briefs", barId: "Student Bar #89" },
                ]
            ).map((member, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold flex items-center justify-center text-xs shrink-0">
                    {member.name.split(" ")[1]?.charAt(0) || member.name.charAt(0) || "M"}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-black dark:text-white truncate">{member.name}</h4>
                    <p className="text-[11px] text-zinc-500 truncate">{member.role}</p>
                    <span className="text-[10px] text-zinc-400 font-mono block truncate">{member.department}</span>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-900">
                  <p>Load: <span className="font-semibold text-black dark:text-white">{member.cases}</span></p>
                  <p className="text-[11px] font-mono text-zinc-500">Bar Enrollment: {member.barId}</p>
                </div>
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
                  <button className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white text-xs font-semibold cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                    Allocate Brief
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: Collask */}
      {currentTab === "collask" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">Collask — Verified Legal Inquiry Exchange</h3>
              <p className="text-xs text-zinc-500">Ask urgent precedent questions to verified High Court &amp; Supreme Court advocates.</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={collaskQuery}
                onChange={(e) => setCollaskQuery(e.target.value)}
                placeholder="Ask Collask: e.g. Has any bench held Section 479 BNSS retrospective for pending under-trials?"
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
              />
              <button className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Send className="w-3.5 h-3.5" /> Post Query
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Recent Chamber Discussions</h4>
            {[
              {
                question: "Whether electronic service of summons via WhatsApp is valid without Section 65B affidavit under BSA 2023?",
                replies: 7,
                author: "Adv. N. Swamy • Madras High Court",
                latestAnswer: "Yes, under Section 63 BSA read with High Court Commercial Division Rules, digital delivery report constitutes valid prima facie service.",
              },
              {
                question: "Delay condonation standards in Section 34 Arbitration petitions after statutory 120 days hard stop.",
                replies: 12,
                author: "Adv. T. Sengupta • Calcutta High Court",
                latestAnswer: "Supreme Court in Simplex Infrastructure reiterated the 120-day outer ceiling cannot be relaxed under Section 5 Limitation Act.",
              },
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-bold text-black dark:text-white">{item.question}</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                    {item.replies} Replies
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
                  <span className="font-bold text-black dark:text-white block mb-1">Top Verified Answer:</span>
                  {item.latestAnswer}
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Posted by: {item.author}</span>
                  <button className="text-black dark:text-white font-bold hover:underline cursor-pointer">
                    Join Thread →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestone 2: Multi-Party Case Collaboration Room Modal */}
      {isCollabRoomOpen && (
        <MultiPartyCollaborationRoom
          roomId="room_wpc_19482"
          matterId="mat_wpc_19482"
          matterTitle="WP(C) 19482/2024 — Gopakumar v. KSEB & Anr."
          subject="WP(C) 19482/2024 — High Court Rejoinder & Precedent Briefing"
          advocateName="Adv. Meera Krishnan"
          barCouncilNumber="K/1429/2016"
          onClose={() => setIsCollabRoomOpen(false)}
        />
      )}
    </div>
  );
}
