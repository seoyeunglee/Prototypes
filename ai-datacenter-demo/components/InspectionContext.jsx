import React, { createContext, useContext, useState } from "react";
import descData from "../descs/data.json";

export const POLICY_FOCUS_LOGIC = "policy:focus-logic";
export const SIM_ACTION = "sim:action";

const InspectionContext = createContext({
  active: false,
  toggle: () => {},
  priorityActive: false,
  setPriorityActive: () => {},
  screenPolicies: [],
  logicPolicies: [],
  priorityPolicies: [],
  prioritySummary: { body: "" },
  getScreenPolicy: () => null,
  getLogicPolicy: () => null,
  getPriority: () => null,
  focusLogic: () => {},
  runSim: () => {},
  saveBody: async () => ({ ok: false }),
  panelWidth: 320,
  setPanelWidth: () => {},
});

export function InspectionProvider({ children }) {
  const [active, setActive] = useState(false);
  const [priorityActive, setPriorityActive] = useState(false);
  const [data, setData] = useState(descData);
  const [panelWidth, setPanelWidth] = useState(320);

  const getScreenPolicy = (num) => data.screenPolicies.find((p) => p.num === num) || null;
  const getLogicPolicy = (num) => data.logicPolicies.find((p) => p.num === num) || null;
  const getPriority = (componentId) => (data.priorityPolicies || []).find((p) => p.componentId === componentId) || null;
  const focusLogic = (num) => window.dispatchEvent(new CustomEvent(POLICY_FOCUS_LOGIC, { detail: num }));
  const runSim = (action) => window.dispatchEvent(new CustomEvent(SIM_ACTION, { detail: action }));

  const saveBody = async (scope, num, body) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (scope === "prioritySummary") {
        if (!next.prioritySummary) next.prioritySummary = { body: "" };
        next.prioritySummary.body = body;
      } else {
        const key = scope === "logic" ? "logicPolicies" : scope === "priority" ? "priorityPolicies" : "screenPolicies";
        const t = (next[key] || []).find((p) => p.num === num);
        if (t) t.body = body;
      }
      return next;
    });
    try {
      const r = await fetch("/api/save-desc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, num, body }),
      });
      const j = await r.json().catch(() => ({}));
      return r.ok ? { ok: true, ...j } : { ok: false, error: j.error || `HTTP ${r.status}` };
    } catch (e) {
      return { ok: false, error: String((e && e.message) || e) };
    }
  };

  return (
    <InspectionContext.Provider
      value={{
        active,
        toggle: () => setActive((p) => !p),
        priorityActive,
        setPriorityActive,
        screenPolicies: data.screenPolicies,
        logicPolicies: data.logicPolicies,
        priorityPolicies: data.priorityPolicies || [],
        prioritySummary: data.prioritySummary || { body: "" },
        getScreenPolicy,
        getLogicPolicy,
        getPriority,
        focusLogic,
        runSim,
        saveBody,
        panelWidth,
        setPanelWidth,
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
}

export const useInspection = () => useContext(InspectionContext);
