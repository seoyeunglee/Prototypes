// 노드 연결 캔버스 — 실제 탐지 시나리오 설정(노드 캔버스)의 파이프라인을 재현.
// 노드 클릭 시 하단에 해당 노드의 설정 요약이 표시된다. 신규 연계 노드는 점선 + "신규" 배지.
// 컬럼: 데이터 → 탐지 설정 → 이벤트 설정 → 알림 및 제어 (실제 캔버스 열 구성)
import { useState } from "react";
import { ContentBadge } from "@idbrnd/design-system";

const COL_X = [10, 190, 370, 550];
const COL_LABEL = ["데이터", "탐지 설정", "이벤트 설정", "알림 및 제어"];

export default function NodeCanvas({ nodes, edges, height = 260, desc }) {
  const [sel, setSel] = useState(null);
  const selected = sel != null ? nodes.find((n) => n.id === sel) : null;

  const pos = {};
  nodes.forEach((n) => {
    pos[n.id] = { x: COL_X[n.col], y: n.y };
  });

  return (
    <div data-desc={desc}>
      <div
        style={{
          border: "1px solid var(--semantic-line-default)",
          borderRadius: 8,
          background: "var(--semantic-bg-light)",
          padding: "8px 4px 4px",
          overflowX: "auto",
        }}
      >
        <svg width="100%" viewBox={`0 0 720 ${height}`} style={{ display: "block", minWidth: 560 }} role="img" aria-label="탐지 시나리오 노드 파이프라인">
          <defs>
            <marker id="nc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill="var(--semantic-natural-heavy)" />
            </marker>
          </defs>
          {COL_LABEL.map((c, i) => (
            <text key={c} x={COL_X[i] + 80} y="16" textAnchor="middle" style={{ font: "var(--text-caption-2-semibold)", fill: "var(--semantic-text-sub)" }}>
              {c}
            </text>
          ))}
          {edges.map(([a, b], i) => {
            const A = pos[a];
            const B = pos[b];
            return (
              <path
                key={i}
                d={`M ${A.x + 160} ${A.y + 24} C ${A.x + 190} ${A.y + 24}, ${B.x - 30} ${B.y + 24}, ${B.x - 4} ${B.y + 24}`}
                fill="none"
                stroke="var(--semantic-natural-heavy)"
                strokeWidth="1.3"
                markerEnd="url(#nc-arrow)"
              />
            );
          })}
          {nodes.map((n) => {
            const p = pos[n.id];
            const active = sel === n.id;
            return (
              <g key={n.id} onClick={() => setSel(active ? null : n.id)} style={{ cursor: "pointer" }}>
                <rect
                  x={p.x} y={p.y} width="160" height="48" rx="8"
                  fill="var(--semantic-bg-default)"
                  stroke={active ? "var(--semantic-primary-default)" : n.planned ? "var(--semantic-natural-heavy)" : "var(--semantic-line-default)"}
                  strokeWidth={active ? 2 : 1.2}
                  strokeDasharray={n.planned ? "5 4" : undefined}
                />
                <text x={p.x + 12} y={p.y + 20} style={{ font: "var(--text-label-2-semibold)", fill: "var(--semantic-text-default)" }}>
                  {n.name}
                </text>
                <text x={p.x + 12} y={p.y + 38} style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>
                  {n.sub}
                </text>
                {n.planned && (
                  <g>
                    <rect x={p.x + 118} y={p.y - 9} width="38" height="18" rx="4" fill="var(--semantic-natural-deep)" />
                    <text x={p.x + 137} y={p.y + 4} textAnchor="middle" style={{ font: "var(--text-caption-2-semibold)", fill: "var(--semantic-text-on-dark)" }}>
                      신규
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {selected ? (
        <div
          style={{
            marginTop: 8,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid var(--semantic-line-default)",
            background: "var(--semantic-bg-default)",
          }}
        >
          <div style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)", marginBottom: 4 }}>
            {selected.name} — 설정
          </div>
          <div style={{ font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-sub)", whiteSpace: "pre-line" }}>
            {selected.config}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 8, font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
          노드를 선택하면 해당 노드의 설정이 표시됩니다. 점선 노드는 신규 연계 시 추가되는 구성입니다.
        </div>
      )}
    </div>
  );
}
