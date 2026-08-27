import React, { useState } from "react";
import { DetailBody } from "./DetailBody";
import { useInspection } from "./InspectionContext";

export function EditableBody({ scope, num, body, variant = "panel", onLogicClick }) {
  const { saveBody } = useInspection();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const cls = variant === "tooltip" ? "eb eb-tooltip" : "eb eb-panel";

  function startEdit(e) {
    e && e.stopPropagation();
    setDraft(body);
    setMsg("");
    setEditing(true);
  }
  async function save(e) {
    e && e.stopPropagation();
    setSaving(true);
    setMsg("");
    const r = await saveBody(scope, num, draft);
    setSaving(false);
    if (r.ok) {
      setEditing(false);
      setMsg(r.unchanged ? "" : "저장됨 · 재배포 약 1분 후 영구 반영");
    } else setMsg("저장 실패: " + r.error);
  }

  if (editing) {
    return (
      <div className={cls}>
        <textarea
          className="eb-area"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          rows={Math.min(20, Math.max(6, draft.split("\n").length + 1))}
        />
        <div className="eb-actions">
          <button className="eb-btn eb-save" onClick={save} disabled={saving}>{saving ? "저장 중…" : "저장"}</button>
          <button className="eb-btn eb-cancel" onClick={(e) => { e.stopPropagation(); setEditing(false); }} disabled={saving}>취소</button>
        </div>
        {msg && <div className="eb-msg">{msg}</div>}
      </div>
    );
  }
  return (
    <div className={cls}>
      <DetailBody body={body} variant={variant} onLogicClick={onLogicClick} />
      <button className="eb-btn eb-edit" onClick={startEdit}>✎ 편집</button>
      {msg && <div className="eb-msg">{msg}</div>}
    </div>
  );
}
