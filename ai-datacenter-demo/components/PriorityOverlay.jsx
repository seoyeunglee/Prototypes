import React from "react";
import { useInspection } from "./InspectionContext";
import { DetailBody } from "./DetailBody";

export const IMPORTANCE_LABEL = { 1: "중요도 1순위", 2: "중요도 2순위", 3: "중요도 3순위" };

// 요소 래퍼 — 우선순위 모드(정책 인덱스 우선순위 탭) ON 시 등급 테두리 + 뱃지(중요도 + 근거·비고).
// 데이터는 data.json priorityPolicies(SoT). 편집은 정책 인덱스 우선순위 탭에서.
export function PriorityMark({ id, children }) {
  const { priorityActive, getPriority } = useInspection();
  const p = priorityActive ? getPriority(id) : null;
  if (!p) return children;
  return (
    <div className={`prio-mark prio-${p.importance}`}>
      {children}
      <div className="prio-badge">
        <div className="prio-badge-head">
          <span className={`prio-grade prio-grade-${p.importance}`}>{IMPORTANCE_LABEL[p.importance]}</span>
        </div>
        <DetailBody body={p.body} variant="tooltip" />
      </div>
    </div>
  );
}
