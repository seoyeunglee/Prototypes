import React from "react";
import { useInspection } from "./InspectionContext";

// [헤더]→소제목, 빈 줄→간격, {L-n}→로직 칩, {run:key:label}→시뮬 버튼.
// variant: 'panel'(라이트) | 'tooltip'(다크)
export function DetailBody({ body, onLogicClick, variant = "panel" }) {
  const { runSim } = useInspection();
  if (!body) return null;
  const cls =
    variant === "tooltip"
      ? { h: "dtd-h", l: "dtd-l", sp: "dtd-sp" }
      : { h: "ipd-h", l: "ipd-l", sp: "ipd-sp" };

  return (
    <div>
      {body.split("\n").map((line, i) => {
        const t = line.trim();
        if (t === "") return <div key={i} className={cls.sp} />;
        if (t.charAt(0) === "[") return <div key={i} className={cls.h}>{t}</div>;
        const parts = t.split(/(\{L-\d+\}|\{run:[^}]+\})/g);
        if (parts.length > 1) {
          return (
            <div key={i} className={cls.l}>
              {parts.map((p, j) => {
                const lm = p.match(/^\{(L-\d+)\}$/);
                if (lm) return <button key={j} className="ipd-ref" onClick={() => onLogicClick && onLogicClick(lm[1])}>{lm[1]}</button>;
                const rm = p.match(/^\{run:([^:]+):([^}]+)\}$/);
                if (rm) return <button key={j} className="sim-btn" onClick={() => runSim(rm[1])}>▶ {rm[2]}</button>;
                return p;
              })}
            </div>
          );
        }
        return <div key={i} className={cls.l}>{line}</div>;
      })}
    </div>
  );
}
