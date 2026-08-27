/* data-prototype-only */
// 프로토타입 시뮬레이터. 정상 흐름에서는 보기 어려운 조건부 UI를 검토자가 직접 트리거한다.
// production build에서는 이 파일과 사용처를 제거한다 (VITE 환경변수 또는 수동 제거).
import { useState } from "react";

const S = {
  wrap: {
    background: "var(--semantic-bg-default)",
    border: "1px dashed var(--semantic-line-default)",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  toggle: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "var(--semantic-text-sub)",
    font: "var(--text-label-1-semibold)",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderTop: "1px solid var(--semantic-line-default)",
  },
  btn: (on) => ({
    flexShrink: 0,
    border: "1px solid var(--semantic-line-default)",
    borderRadius: 6,
    padding: "5px 12px",
    cursor: "pointer",
    background: on ? "var(--semantic-primary-light)" : "var(--semantic-bg-default)",
    color: on ? "var(--semantic-primary-default)" : "var(--semantic-text-default)",
    font: "var(--text-label-2-regular)",
  }),
};

export default function DemoPanel({ items }) {
  const [open, setOpen] = useState(false);

  return (
    <div data-prototype-only="true" style={S.wrap}>
      <button style={S.toggle} onClick={() => setOpen((v) => !v)}>
        <span>프로토타입 시뮬레이터</span>
        {!open && items.some((it) => it.active) && (
          <span
            style={{
              padding: "1px 8px",
              borderRadius: 999,
              background: "var(--semantic-primary-light)",
              color: "var(--semantic-primary-default)",
              font: "var(--text-caption-1-semibold)",
            }}
          >
            {items.filter((it) => it.active).length}개 활성
          </span>
        )}
        <span style={{ marginLeft: "auto" }}>{open ? "접기" : "펼치기"}</span>
      </button>
      {open && (
        <div>
          {items.map((it) => (
            <div key={it.id} style={S.item}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>
                  {it.name}
                </div>
                <div style={{ marginTop: 2, font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
                  {it.desc}
                </div>
              </div>
              <button style={S.btn(it.active)} onClick={it.onToggle}>
                {it.active ? "해제" : "실행"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
