"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Target,
  Play,
  Pause,
  RefreshCw,
  Terminal,
  Check,
  Info,
  Clock,
  Shield,
  Search,
  ArrowRight,
  Gavel,
  AlertCircle,
  ExternalLink,
  Cpu,
  Activity,
  Sliders,
} from "lucide-react";
import { advocateApi } from "@/lib/api";

interface AutonomousAgentsViewProps {
  initialSubTab?: "workflows" | "chamber-skills";
  advocateName?: string;
  barCouncilNumber?: string;
  token?: string;
}

interface AgentLog {
  timestamp: string;
  level: "info" | "success" | "warn" | "error" | string;
  message: string;
}

interface AgentItem {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  scheduleText: string;
  target: string;
  status: "active" | "paused" | string;
  lastRunAt: string;
  lastStatus: string;
  itemsProcessed: number;
  metrics: {
    totalRuns: number;
    successRate: string;
    itemsDiscovered: number;
  };
  recentLogs: AgentLog[];
  config?: Record<string, any>;
}

export const AutonomousAgentsView: React.FC<AutonomousAgentsViewProps> = ({
  initialSubTab = "workflows",
  advocateName = "Adv. Meera Krishnan",
  barCouncilNumber = "K/1429/2016",
  token = "advocate_token",
}) => {
  const [activeTab, setActiveTab] = useState<"workflows" | "chamber-skills" | "logs">(
    initialSubTab === "chamber-skills" ? "chamber-skills" : "workflows"
  );

  // Agent list & selection
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("agent_causelist");
  const [loading, setLoading] = useState<boolean>(true);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);

  // Live Terminal Logs
  const [terminalLogs, setTerminalLogs] = useState<AgentLog[]>([]);

  // BNS Converter tool state
  const [bnsQuery, setBnsQuery] = useState<string>("420");
  const [bnsResult, setBnsResult] = useState<any>(null);
  const [isConvertingBns, setIsConvertingBns] = useState<boolean>(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch Agents
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await advocateApi.getAdvocateAgents(token);
      if (res && res.success && res.agents) {
        setAgents(res.agents);
        const current = res.agents.find((a: AgentItem) => a.id === selectedAgentId) || res.agents[0];
        if (current) {
          setTerminalLogs(current.recentLogs || []);
        }
      }
    } catch (err) {
      console.warn("Could not load agents from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [token]);

  // Update terminal logs when selected agent changes
  useEffect(() => {
    const ag = agents.find((a) => a.id === selectedAgentId);
    if (ag) {
      setTerminalLogs(ag.recentLogs || []);
    }
  }, [selectedAgentId, agents]);

  // 2. Trigger Agent Pipeline Manually
  const handleTriggerAgent = async (agentId: string) => {
    setRunningAgentId(agentId);
    try {
      const res = await advocateApi.triggerAdvocateAgent(agentId, {}, token);
      if (res && res.success) {
        showToast(res.message);
        // Refresh agent data
        await fetchAgents();
        if (res.logs) {
          setTerminalLogs((prev) => [...res.logs, ...prev]);
        }
      }
    } catch (err: any) {
      console.error("Agent trigger failed:", err);
      showToast("Pipeline run failed: " + (err?.message || "Check connection"));
    } finally {
      setRunningAgentId(null);
    }
  };

  // 3. Toggle Agent Status
  const handleToggleAgent = async (agentId: string) => {
    try {
      const res = await advocateApi.toggleAdvocateAgent(agentId, token);
      if (res && res.success) {
        showToast(res.message);
        await fetchAgents();
      }
    } catch (err: any) {
      console.error("Agent toggle failed:", err);
      showToast("Status change failed: " + (err?.message || "Check connection"));
    }
  };

  // 4. BNS Converter Tool
  const handleConvertBns = async (sectionToLookup = bnsQuery) => {
    setIsConvertingBns(true);
    try {
      const res = await advocateApi.convertBnsSection(sectionToLookup, token);
      if (res && res.success && res.result) {
        setBnsResult(res.result);
      }
    } catch (err: any) {
      console.error("BNS conversion failed:", err);
    } finally {
      setIsConvertingBns(false);
    }
  };

  useEffect(() => {
    handleConvertBns("420");
  }, []);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                Autonomous Chamber Pipelines
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                Kerala Judicial Orchestrator
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white">
              AI Legal Agents &amp; Automated Workflows
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Deploy autonomous background workers for Kerala High Court daily causelist scraping, Section 148A caveat registry monitoring, BNS-BNSS concordance audits, and lead intake screening.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTriggerAgent(selectedAgentId)}
              disabled={runningAgentId !== null}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${runningAgentId === selectedAgentId ? "animate-spin" : ""}`} />
              <span>{runningAgentId === selectedAgentId ? "Executing Pipeline..." : "Run Active Agent Now"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab("workflows")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === "workflows"
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs"
                : "bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Automated Workflows</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {agents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("chamber-skills")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === "chamber-skills"
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs"
                : "bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Chamber Skills &amp; Micro-Tools</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              BNS &amp; Caveats
            </span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === "logs"
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs"
                : "bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Live Execution Terminal</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              Stream
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: AUTOMATED WORKFLOWS & PIPELINES */}
      {activeTab === "workflows" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 Cols): Agent Pipeline Cards */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
              Active Autonomous Agents
            </div>

            <div className="space-y-3">
              {agents.map((agent) => {
                const isSelected = selectedAgentId === agent.id;
                const isRunning = runningAgentId === agent.id;

                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`p-5 rounded-2xl bg-white dark:bg-black transition-all border cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-black dark:ring-white border-transparent shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-black dark:text-white">
                          {agent.name}
                        </h4>
                        <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          {agent.scheduleText}
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                          agent.status === "active"
                            ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-black dark:text-white"
                            : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {agent.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-900 text-[11px]">
                      <span className="text-zinc-400 font-mono">
                        Target: {agent.target.split(" ")[0]}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAgent(agent.id);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors"
                        >
                          {agent.status === "active" ? "Pause" : "Resume"}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTriggerAgent(agent.id);
                          }}
                          disabled={isRunning}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-85 transition-opacity disabled:opacity-50 flex items-center gap-1"
                        >
                          <Play className={`w-3 h-3 ${isRunning ? "animate-spin" : ""}`} />
                          <span>Run</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (7 Cols): Selected Agent Deep Dive & Live Stream */}
          {selectedAgent && (
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
                      Pipeline Inspector
                    </span>
                    <h3 className="text-lg font-bold text-black dark:text-white">
                      {selectedAgent.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTriggerAgent(selectedAgent.id)}
                      disabled={runningAgentId === selectedAgent.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-50"
                    >
                      <Play className={`w-3.5 h-3.5 ${runningAgentId === selectedAgent.id ? "animate-spin" : ""}`} />
                      <span>Execute Immediate Trigger</span>
                    </button>
                  </div>
                </div>

                {/* Pipeline Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 block">Total Runs</span>
                    <span className="text-lg font-bold font-mono text-black dark:text-white">
                      {selectedAgent.metrics?.totalRuns || 0}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 block">Success Rate</span>
                    <span className="text-lg font-bold font-mono text-black dark:text-white">
                      {selectedAgent.metrics?.successRate || "100%"}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 block">Items Yield</span>
                    <span className="text-lg font-bold font-mono text-black dark:text-white">
                      {selectedAgent.metrics?.itemsDiscovered || 0}
                    </span>
                  </div>
                </div>

                {/* Agent Trigger & Schedule Configuration */}
                <div className="space-y-2 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-black dark:text-white block">
                    Execution Schedule &amp; Gateway
                  </span>
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1 font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                    <div>Trigger Mechanism: <span className="font-bold text-black dark:text-white">{selectedAgent.triggerType}</span></div>
                    <div>Target Court Jurisdiction: <span className="font-bold text-black dark:text-white">{selectedAgent.target}</span></div>
                    <div>Advocate Enrolment Filter: <span className="font-bold text-black dark:text-white">{selectedAgent.config?.barRollNumber || barCouncilNumber}</span></div>
                  </div>
                </div>

                {/* Execution Trace Terminal Output */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Recent Execution Trace</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Last Run: {new Date(selectedAgent.lastRunAt).toLocaleTimeString("en-IN")}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-950 text-zinc-100 border border-zinc-800 font-mono text-xs space-y-1.5 max-h-[320px] overflow-y-auto">
                    {terminalLogs.length > 0 ? (
                      terminalLogs.map((log, lIdx) => (
                        <div key={lIdx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-zinc-500 shrink-0 select-none">
                            [{log.timestamp}]
                          </span>
                          <span
                            className={
                              log.level === "success"
                                ? "text-zinc-100 font-bold"
                                : log.level === "warn"
                                ? "text-zinc-300"
                                : "text-zinc-400"
                            }
                          >
                            {log.message}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-zinc-500 py-6 text-center">
                        Zero trace logs. Click &quot;Execute Immediate Trigger&quot; to initiate pipeline.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CHAMBER SKILLS & MICRO-TOOLS */}
      {activeTab === "chamber-skills" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Tool 1: Interactive BNS-BNSS Statutory Concordance Suite */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                    IPC ↔ BNS &amp; CrPC ↔ BNSS Statutory Concordance Skill
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  Criminal Law 2023 Codes
                </span>
              </div>

              <p className="text-xs text-zinc-500">
                Instant translation of legacy penal sections to the Bharatiya Nyaya Sanhita (BNS) 2023 with substantive penalty changes and community service flags.
              </p>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-zinc-400 mr-1">Frequent:</span>
                {["420", "302", "379", "406", "498A", "438"].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      setBnsQuery(sec);
                      handleConvertBns(sec);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-colors border ${
                      bnsQuery === sec
                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                        : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    IPC {sec}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Type IPC / CrPC Section (e.g. 420, 302, 438)..."
                    value={bnsQuery}
                    onChange={(e) => setBnsQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleConvertBns(bnsQuery)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>
                <button
                  onClick={() => handleConvertBns(bnsQuery)}
                  disabled={isConvertingBns}
                  className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isConvertingBns ? "Mapping..." : "Convert Section"}
                </button>
              </div>

              {/* Result Card */}
              {bnsResult && (
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                        Legacy Enactment
                      </span>
                      <span className="text-xs font-bold text-black dark:text-white">
                        {bnsResult.ipc}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-zinc-400" />

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                        Bharatiya Nyaya Sanhita (2023)
                      </span>
                      <span className="text-xs font-bold text-black dark:text-white">
                        {bnsResult.bns}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="font-bold text-black dark:text-white">Offence / Subject: </span>
                      <span className="text-zinc-600 dark:text-zinc-300 font-serif">{bnsResult.bnsTitle}</span>
                    </div>
                    <div>
                      <span className="font-bold text-black dark:text-white">Punishment: </span>
                      <span className="text-zinc-600 dark:text-zinc-300 font-mono text-[11px]">{bnsResult.punishment}</span>
                    </div>
                    <div>
                      <span className="font-bold text-black dark:text-white">Substantive Reform: </span>
                      <span className="text-zinc-600 dark:text-zinc-300 leading-relaxed block text-[11px] mt-0.5">
                        {bnsResult.substantiveChange}
                      </span>
                    </div>
                    <div className="pt-1 text-[11px] font-mono text-zinc-500">
                      Corresponding BNSS Procedure: <span className="font-bold text-black dark:text-white">{bnsResult.correspondingBnss}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tool 2: High Court Caveat Registry Watchdog & Roll Settings */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                    Caveat Registry Watchlist (S.148A CPC)
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-bold">
                  Active Sync
                </span>
              </div>

              <p className="text-xs text-zinc-500">
                The Caveat Monitoring Agent polls the e-Courts Registry to ensure no unexpected caveat is lodged without counsel notice.
              </p>

              <div className="space-y-2">
                {[
                  { client: "Gopakumar Nambiar", status: "Clear (0 Caveats Filed)", lastScan: "Today 10:15 IST", risk: "Safe" },
                  { client: "Malabar Infotech Solutions", status: "Clear (0 Caveats Filed)", lastScan: "Today 10:15 IST", risk: "Safe" },
                  { client: "Sreedharan Pillai & Ors.", status: "Clear (0 Caveats Filed)", lastScan: "Today 10:15 IST", risk: "Safe" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-black dark:text-white block">
                        {item.client}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {item.lastScan}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleTriggerAgent("agent_caveat")}
                className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white text-xs font-bold border border-zinc-200 dark:border-zinc-800 transition-colors"
              >
                Scan Caveat Registry Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE TERMINAL LOGS */}
      {activeTab === "logs" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-xl space-y-4 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Chamber Autonomous Daemon Execution Console
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] text-zinc-400">Daemon Gateway Connected</span>
            </div>
          </div>

          <div className="space-y-2 text-xs leading-relaxed max-h-[500px] overflow-y-auto">
            {terminalLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-zinc-500 select-none">
                  [{log.timestamp}]
                </span>
                <span
                  className={
                    log.level === "success"
                      ? "text-zinc-100 font-bold"
                      : log.level === "warn"
                      ? "text-zinc-300"
                      : "text-zinc-400"
                  }
                >
                  {log.message}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Daemon: wakheel-agent-runtime v1.0.4</span>
            <button
              onClick={() => showToast("Terminal buffer cleared.")}
              className="text-zinc-400 hover:text-white underline cursor-pointer"
            >
              Clear Buffer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
