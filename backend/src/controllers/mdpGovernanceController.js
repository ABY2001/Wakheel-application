import { MdpFirmGovernance } from "../models/MdpFirmGovernance.js";
import { devStore } from "../utils/devStore.js";
import mongoose from "mongoose";

const isMongoConnected = () => mongoose.connection.readyState === 1;

export const mdpGovernanceController = {
  // 1. Get entire MDP Firm Governance Profile (Roster, Rules, Delegated Tasks, Dual Gates)
  async getFirmGovernance(req, res) {
    try {
      if (isMongoConnected()) {
        const gov = await MdpFirmGovernance.findOne();
        if (gov) {
          return res.status(200).json({ success: true, source: "mongodb", governance: gov });
        }
      }
      const devGov = devStore.getMdpFirmGovernance();
      return res.status(200).json({ success: true, source: "devStore", governance: devGov });
    } catch (error) {
      console.error("Error in getFirmGovernance:", error);
      const devGov = devStore.getMdpFirmGovernance();
      return res.status(200).json({ success: true, source: "devStore_fallback", governance: devGov });
    }
  },

  // 2. Validate Statutory Authorization & Regulatory Lock
  async checkActionAuthorization(req, res) {
    try {
      const { statutoryAction, memberInstitute, memberRole } = req.body;

      let governance;
      if (isMongoConnected()) {
        governance = await MdpFirmGovernance.findOne();
      }
      if (!governance) {
        governance = devStore.getMdpFirmGovernance();
      }

      const rule = governance.regulatoryRules.find(
        (r) => r.statutoryAction === statutoryAction || r.ruleId === statutoryAction
      );

      if (!rule) {
        return res.status(404).json({ success: false, message: "Regulatory rule not found for action" });
      }

      // Check trainee DSC lock (Four-Eyes Principle)
      const isTrainee = [
        "article_assistant_cs",
        "article_assistant_ca",
        "paralegal",
      ].includes(memberRole);

      if (isTrainee) {
        return res.status(200).json({
          success: true,
          authorized: false,
          statutoryAction: rule.statutoryAction,
          actionName: rule.actionName,
          governingAct: rule.governingAct,
          isTraineeLocked: true,
          warningMessage:
            "FOUR-EYES PRINCIPLE VIOLATION: Trainees/Article Assistants are strictly prohibited from affixing Digital Signatures (DSC) or certifying statutory documents. All workpapers must be submitted to a Practicing Partner for mandatory review.",
          penaltyCitation: "Rule 12 of ICSI Regulations / Regulation 43 of ICAI Chartered Accountants Regulations",
          penaltyForBreach: "Disciplinary action for professional misconduct against Principal & Article cancellation",
          requiresDualSignOff: rule.requiresDualSignOff,
        });
      }

      // Check institute authorization
      const isInstituteAuthorized = rule.authorizedInstitutes.includes(memberInstitute);
      const isProhibited = rule.prohibitedInstitutes.includes(memberInstitute);

      if (isProhibited || !isInstituteAuthorized) {
        return res.status(200).json({
          success: true,
          authorized: false,
          statutoryAction: rule.statutoryAction,
          actionName: rule.actionName,
          governingAct: rule.governingAct,
          isTraineeLocked: false,
          warningMessage: `STATUTORY CODE LOCK ACTIVATED: ${memberInstitute} professionals are legally prohibited from executing ${rule.actionName}. ${rule.prohibitionCitation}`,
          penaltyCitation: rule.prohibitionCitation,
          penaltyForBreach: rule.penaltyForBreach,
          requiresDualSignOff: rule.requiresDualSignOff,
        });
      }

      // If authorized
      return res.status(200).json({
        success: true,
        authorized: true,
        statutoryAction: rule.statutoryAction,
        actionName: rule.actionName,
        governingAct: rule.governingAct,
        isTraineeLocked: false,
        warningMessage: null,
        penaltyCitation: null,
        penaltyForBreach: null,
        requiresDualSignOff: rule.requiresDualSignOff,
      });
    } catch (error) {
      console.error("Error in checkActionAuthorization:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // 3. Get Delegated Tasks
  async getDelegatedTasks(req, res) {
    try {
      if (isMongoConnected()) {
        const gov = await MdpFirmGovernance.findOne();
        if (gov) {
          return res.status(200).json({ success: true, tasks: gov.delegatedTasks || [] });
        }
      }
      const tasks = devStore.getDelegatedTasks();
      return res.status(200).json({ success: true, tasks });
    } catch (error) {
      console.error("Error in getDelegatedTasks:", error);
      const tasks = devStore.getDelegatedTasks();
      return res.status(200).json({ success: true, tasks });
    }
  },

  // 4. Create Delegated Task (Allocate to Trainee)
  async createDelegatedTask(req, res) {
    try {
      const taskData = req.body;
      if (isMongoConnected()) {
        const gov = await MdpFirmGovernance.findOne();
        if (gov) {
          const newTask = {
            taskId: `TASK-DEL-${Date.now()}`,
            title: taskData.title,
            clientName: taskData.clientName || "CyberCorp Technologies Pvt Ltd",
            module: taskData.module || "ROC_FILING",
            assignedTrainee: taskData.assignedTrainee,
            reviewingPartner: taskData.reviewingPartner,
            workpaperReference: taskData.workpaperReference || `WP-2026-${Math.floor(100 + Math.random() * 900)}`,
            traineeNotes: taskData.traineeNotes || "",
            status: "DRAFTING_BY_TRAINEE",
            fourEyesVerified: false,
            statutoryLockPreventedDsc: true,
            submittedAt: new Date().toISOString(),
          };
          gov.delegatedTasks.unshift(newTask);
          await gov.save();
          return res.status(201).json({ success: true, task: newTask });
        }
      }

      const task = devStore.createDelegatedTask(taskData);
      return res.status(201).json({ success: true, task });
    } catch (error) {
      console.error("Error in createDelegatedTask:", error);
      const task = devStore.createDelegatedTask(req.body);
      return res.status(201).json({ success: true, task });
    }
  },

  // 5. Review Delegated Task (Partner Four-Eyes Approval or Revision Request)
  async reviewDelegatedTask(req, res) {
    try {
      const { taskId } = req.params;
      const { partnerReviewNotes, status, reviewingPartner } = req.body;

      if (isMongoConnected()) {
        const gov = await MdpFirmGovernance.findOne();
        if (gov) {
          const task = gov.delegatedTasks.find((t) => t.taskId === taskId);
          if (task) {
            if (partnerReviewNotes !== undefined) task.partnerReviewNotes = partnerReviewNotes;
            if (status) task.status = status;
            if (status === "PARTNER_APPROVED") {
              task.fourEyesVerified = true;
              task.statutoryLockPreventedDsc = false;
              task.reviewedAt = new Date().toISOString();
            }
            if (reviewingPartner) task.reviewingPartner = reviewingPartner;
            await gov.save();
            return res.status(200).json({ success: true, task });
          }
        }
      }

      const task = devStore.reviewDelegatedTask(taskId, { partnerReviewNotes, status, reviewingPartner });
      if (!task) {
        return res.status(404).json({ success: false, message: "Delegated task not found" });
      }
      return res.status(200).json({ success: true, task });
    } catch (error) {
      console.error("Error in reviewDelegatedTask:", error);
      const task = devStore.reviewDelegatedTask(req.params.taskId, req.body);
      return res.status(200).json({ success: true, task });
    }
  },

  // 6. Get Dual Sign-Off Gates
  async getDualSignOffGates(req, res) {
    try {
      if (isMongoConnected()) {
        const gov = await MdpFirmGovernance.findOne();
        if (gov) {
          return res.status(200).json({ success: true, gates: gov.dualSignOffGates || [] });
        }
      }
      const gates = devStore.getDualSignOffGates();
      return res.status(200).json({ success: true, gates });
    } catch (error) {
      console.error("Error in getDualSignOffGates:", error);
      const gates = devStore.getDualSignOffGates();
      return res.status(200).json({ success: true, gates });
    }
  },

  // 7. Execute Dual Sign-Off (CS or CA Gate)
  async signDualSignOffGate(req, res) {
    try {
      const { gateId } = req.params;
      const { role, signatoryName, membershipNumber, udin } = req.body;

      if (isMongoConnected()) {
        const gov = await MdpFirmGovernance.findOne();
        if (gov) {
          const gate = gov.dualSignOffGates.find((g) => g.gateId === gateId);
          if (gate) {
            if (role === "CS" || role === "practicing_cs" || role === "managing_partner") {
              gate.csGate.status = "SIGNED";
              gate.csGate.signedBy = signatoryName || "CS Rajesh Sharma";
              gate.csGate.membershipNumber = membershipNumber || "FCS-8921";
              gate.csGate.signedAt = new Date().toISOString();
            } else if (role === "CA" || role === "practicing_ca" || role === "senior_partner") {
              gate.caGate.status = "SIGNED";
              gate.caGate.signedBy = signatoryName || "CA Ramanathan Iyer";
              gate.caGate.membershipNumber = membershipNumber || "FCA-054921";
              gate.caGate.udin = udin || `26054921${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
              gate.caGate.signedAt = new Date().toISOString();
            }

            if (gate.csGate.status === "SIGNED" && gate.caGate.status === "SIGNED") {
              gate.overallStatus = "FULLY_CERTIFIED_RELEASED";
              gate.releaseCertificateHash = `SHA256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}94812a0f`;
            } else if (gate.csGate.status === "SIGNED" || gate.caGate.status === "SIGNED") {
              gate.overallStatus = "PARTIALLY_SIGNED";
            }

            await gov.save();
            return res.status(200).json({ success: true, gate });
          }
        }
      }

      const gate = devStore.signDualSignOffGate(gateId, { role, signatoryName, membershipNumber, udin });
      if (!gate) {
        return res.status(404).json({ success: false, message: "Dual sign-off gate not found" });
      }
      return res.status(200).json({ success: true, gate });
    } catch (error) {
      console.error("Error in signDualSignOffGate:", error);
      const gate = devStore.signDualSignOffGate(req.params.gateId, req.body);
      return res.status(200).json({ success: true, gate });
    }
  },
};
