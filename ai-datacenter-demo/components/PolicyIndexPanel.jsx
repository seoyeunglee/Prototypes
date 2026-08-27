import React, { useState, useEffect } from "react";
import { useInspection, POLICY_FOCUS_LOGIC } from "./InspectionContext";
import { EditableBody } from "./EditableBody";
import { IMPORTANCE_LABEL } from "./PriorityOverlay";

export function PolicyIndexPanel() {
  const { active, screenPolicies, logicPolicies, priorityPolicies, prioritySummary, panelWidth, setPanelWidth, setPriorityActive } = useInspection();
  const [tab, setTab] = useState("screen");
  const [openKey, setOpenKey] = useState(null);

  // 우선순위 탭이 활성일 때만 화면 오버레이 ON (별도 토글 없음)
  useEffect(() => {
    setPriorityActive(active && tab === "priority");
  }, [active, tab, setPriorityActive]);

  function focusComp(componentId) {
    setTimeout(() => {
      const el = document.querySelector(`[data-comp-id="${componentId}"]`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("pol-pulse", "dt-wrap--selected");
      setTimeout(() => el.classList.remove("pol-pulse", "dt-wrap--selected"), 1300);
    }, 80);
  }

  function handleLogicRefChip(logicNum) {
    const lg = logicPolicies.find((l) => l.num === logicNum);
    if (!lg) return;
    setTab("logic");
    setOpenKey(lg.num);
    if (lg.refId) focusComp(lg.refId);
  }

  useEffect(() => {
    const handler = (e) => handleLogicRefChip(e.detail);
    window.addEventListener(POLICY_FOCUS_LOGIC, handler);
    return () => window.removeEventListener(POLICY_FOCUS_LOGIC, handler);
  }, [logicPolicies]);

  if (!active) return null;

  function handleScreenClick(policy) {
    setOpenKey(openKey === policy.componentId ? null : policy.componentId);
    focusComp(policy.componentId);
  }
  function handleLogicClick(policy) {
    setOpenKey(openKey === policy.num ? null : policy.num);
    if (policy.refId) focusComp(policy.refId);
  }
  function startResize(e) {
    e.preventDefault();
    const startX = e.clientX, startW = panelWidth;
    const move = (ev) => setPanelWidth(Math.min(640, Math.max(260, startW + (startX - ev.clientX))));
    const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  }

  const isSub = (num) => /[a-z]$/.test(num);
  const GROUPS = [...new Set(screenPolicies.map((p) => p.group))];
  const count = tab === "screen" ? screenPolicies.length : tab === "logic" ? logicPolicies.length : priorityPolicies.length;

  return (
    <div className="insp-panel" style={{ width: panelWidth }}>
      <div className="insp-resize" onMouseDown={startResize} title="드래그하여 너비 조절" />
      <div className="ip-head">
        <span className="ip-title">정책 인덱스</span>
        <span className="ip-count">{count}개</span>
      </div>
      <div className="ip-tabs">
        <button className={`ip-tab${tab === "screen" ? " is-active" : ""}`} onClick={() => { setTab("screen"); setOpenKey(null); }}>화면</button>
        <button className={`ip-tab${tab === "logic" ? " is-active" : ""}`} onClick={() => { setTab("logic"); setOpenKey(null); }}>로직·계산식</button>
        <button className={`ip-tab${tab === "priority" ? " is-active" : ""}`} onClick={() => { setTab("priority"); setOpenKey(null); }}>배경</button>
      </div>

      {tab === "screen" && GROUPS.map((group) => (
        <div key={group}>
          <div className="ip-group">{group}</div>
          {screenPolicies.filter((p) => p.group === group).map((policy) => (
            <div key={policy.componentId} className={`ip-row${isSub(policy.num) ? " ip-row--sub" : ""}${openKey === policy.componentId ? " open" : ""}`}>
              <button className="ip-item" onClick={() => handleScreenClick(policy)}>
                <span className="ip-num">{policy.num}</span>
                <span className="ip-label">{policy.title}</span>
                <span className="ip-chev">›</span>
              </button>
              <div className="ip-detail">
                <EditableBody scope="screen" num={policy.num} body={policy.body} variant="panel" onLogicClick={handleLogicRefChip} />
              </div>
            </div>
          ))}
        </div>
      ))}

      {tab === "logic" && (
        <div>
          <div className="ip-group">로직·계산식 (cross-cutting)</div>
          {logicPolicies.map((policy) => (
            <div key={policy.num} className={`ip-row${openKey === policy.num ? " open" : ""}`}>
              <button className="ip-item" onClick={() => handleLogicClick(policy)}>
                <span className="ip-num">{policy.num}</span>
                <span className="ip-label">{policy.title}</span>
                <span className="ip-chev">›</span>
              </button>
              <div className="ip-detail">
                <EditableBody scope="logic" num={policy.num} body={policy.body} variant="panel" onLogicClick={handleLogicRefChip} />
                {policy.refId && (
                  <button className="insp-ref-btn" onClick={() => focusComp(policy.refId)}>화면에서 확인 →</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "priority" && (
        <div>
          <div className="ip-prio-summary">
            <EditableBody scope="prioritySummary" num="summary" body={prioritySummary.body} variant="panel" />
          </div>
          <div className="ip-group">요소별 정보 우선순위</div>
          {priorityPolicies.map((p) => (
            <div key={p.num} className={`ip-row${openKey === p.num ? " open" : ""}`}>
              <button className="ip-item" onClick={() => { setOpenKey(openKey === p.num ? null : p.num); focusComp(p.componentId); }}>
                <span className={`ip-num ip-num-prio-${p.importance}`}>{IMPORTANCE_LABEL[p.importance].replace("중요도 ", "")}</span>
                <span className="ip-label">{p.title}</span>
                <span className="ip-chev">›</span>
              </button>
              <div className="ip-detail">
                <EditableBody scope="priority" num={p.num} body={p.body} variant="panel" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
