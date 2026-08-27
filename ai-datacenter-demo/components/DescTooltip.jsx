import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useInspection } from "./InspectionContext";
import { EditableBody } from "./EditableBody";

const DT_CLOSE_ALL = "dt:close-all";

export function DescTooltip({ num, children }) {
  const { active, getScreenPolicy, focusLogic } = useInspection();
  const policy = num ? getScreenPolicy(num) : null;
  const body = (policy && policy.body) || "";
  const label = policy && policy.title;
  const componentId = policy && policy.componentId;

  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const cursor = useRef({ x: 0, y: 0 });
  const tooltipRef = useRef(null);

  useEffect(() => { if (!active) setShow(false); }, [active]);
  useEffect(() => {
    const handler = () => setShow(false);
    window.addEventListener(DT_CLOSE_ALL, handler);
    return () => window.removeEventListener(DT_CLOSE_ALL, handler);
  }, []);
  useEffect(() => {
    if (!show) return;
    const onOutside = (e) => { if (tooltipRef.current && !tooltipRef.current.contains(e.target)) setShow(false); };
    document.addEventListener("mousedown", onOutside, true);
    return () => document.removeEventListener("mousedown", onOutside, true);
  }, [show]);
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => { if (e.key === "Escape") setShow(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show]);

  useLayoutEffect(() => {
    if (!show || !tooltipRef.current) return;
    const { x: cx, y: cy } = cursor.current;
    const w = tooltipRef.current.offsetWidth;
    const h = tooltipRef.current.offsetHeight;
    const m = 8;
    const x = cx + w + m > window.innerWidth ? Math.max(m, cx - w - 4) : cx + 4;
    const y = cy + h + m > window.innerHeight ? Math.max(m, cy - h - m) : cy + m;
    setPos({ x, y });
  }, [show]);

  function handleContextMenu(e) {
    if (!active) return;
    e.preventDefault();
    e.stopPropagation();
    const wasShown = show;
    window.dispatchEvent(new CustomEvent(DT_CLOSE_ALL));
    if (!wasShown && body) {
      cursor.current = { x: e.clientX, y: e.clientY };
      setPos({ x: e.clientX + 4, y: e.clientY + 8 });
      setShow(true);
    }
  }

  return (
    <div
      className={active ? `dt-wrap${show ? " dt-wrap--selected" : ""}` : undefined}
      data-comp-id={componentId}
      data-num={active ? num || undefined : undefined}
      onContextMenu={handleContextMenu}
    >
      {children}
      {active && show && policy && createPortal(
        <div ref={tooltipRef} className="dt-box" style={{ left: pos.x, top: pos.y }} onClick={(e) => e.stopPropagation()}>
          {label && <div className="dt-label">[{num}] {label}</div>}
          <EditableBody scope="screen" num={num} body={body} variant="tooltip" onLogicClick={focusLogic} />
        </div>,
        document.body
      )}
    </div>
  );
}
