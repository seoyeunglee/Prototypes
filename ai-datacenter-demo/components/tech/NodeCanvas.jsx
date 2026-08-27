// 노드 연결 캔버스 — 실제 시나리오 설정 화면(Scenario/NodeFrame) 형태를 축약 재현.
// FE 실물 정합: 도트 그리드 캔버스(xyflow), 노드=흰 카드 radius 8 + 필형 유형 배지(radius 16)
// + 노드명, 좌우 연결 포트, 선택 시 노드 색 테두리 강조. 신규 연계 노드는 점선 + "신규" 다크 배지.
// 노드 클릭 시 하단에 설정 요약 표시. 열 구성: 데이터 → 탐지 설정 → 이벤트 설정 → 알림 및 제어.
import { useState } from "react";

const COL_X = [14, 200, 386, 566];
const COL_LABEL = ["데이터", "탐지 설정", "이벤트 설정", "알림 및 제어"];
const NODE_W = 164;
const NODE_H = 66;

export default function NodeCanvas({ nodes, edges, height = 280, desc }) {
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
          overflowX: "auto",
        }}
      >
        <svg width="100%" viewBox={`0 0 744 ${height}`} style={{ display: "block", minWidth: 600 }} role="img" aria-label="탐지 시나리오 노드 파이프라인">
          <defs>
            <marker id="nc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill="var(--semantic-natural-heavy)" />
            </marker>
            {/* 실제 캔버스의 도트 그리드 */}
            <pattern id="nc-dots" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="var(--semantic-natural-default)" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="744" height={height} fill="url(#nc-dots)" />

          {COL_LABEL.map((c, i) => (
            <text key={c} x={COL_X[i] + NODE_W / 2} y="20" textAnchor="middle" style={{ font: "var(--text-caption-2-semibold)", fill: "var(--semantic-text-sub)" }}>
              {c}
            </text>
          ))}

          {edges.map(([a, b], i) => {
            const A = pos[a];
            const B = pos[b];
            const ay = A.y + NODE_H / 2;
            const by = B.y + NODE_H / 2;
            return (
              <path
                key={i}
                d={`M ${A.x + NODE_W + 3} ${ay} C ${A.x + NODE_W + 34} ${ay}, ${B.x - 34} ${by}, ${B.x - 7} ${by}`}
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
                {/* 노드 카드 — 실제 NodeFrame: 흰 배경 · radius 8 · 선택 시 강조 테두리 */}
                <rect
                  x={p.x} y={p.y} width={NODE_W} height={NODE_H} rx="8"
                  fill="var(--semantic-bg-default)"
                  stroke={active ? "var(--semantic-primary-default)" : n.planned ? "var(--semantic-natural-heavy)" : "var(--semantic-line-default)"}
                  strokeWidth={active ? 2 : 1.2}
                  strokeDasharray={n.planned ? "5 4" : undefined}
                />
                {/* 유형 배지 — 실제 node_badge: 필형 아웃라인 */}
                <rect x={p.x + 10} y={p.y + 8} width={COL_LABEL[n.col].length * 9.5 + 14} height="16" rx="8"
                  fill="var(--semantic-bg-default)" stroke="var(--semantic-natural-strong)" strokeWidth="1" />
                <text x={p.x + 17} y={p.y + 20} style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>
                  {COL_LABEL[n.col]}
                </text>
                {/* 노드명 + 설정 요약 1줄 */}
                <text x={p.x + 10} y={p.y + 41} style={{ font: "var(--text-label-2-semibold)", fill: "var(--semantic-text-default)" }}>
                  {n.name}
                </text>
                <text x={p.x + 10} y={p.y + 57} style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>
                  {n.sub}
                </text>
                {/* 연결 포트 (좌 입력 · 우 출력) */}
                {n.col > 0 && (
                  <circle cx={p.x - 1} cy={p.y + NODE_H / 2} r="4" fill="var(--semantic-bg-default)" stroke="var(--semantic-natural-heavy)" strokeWidth="1.2" />
                )}
                {n.col < 3 && (
                  <circle cx={p.x + NODE_W + 1} cy={p.y + NODE_H / 2} r="4" fill="var(--semantic-bg-default)" stroke="var(--semantic-natural-heavy)" strokeWidth="1.2" />
                )}
                {n.planned && (
                  <g>
                    <rect x={p.x + NODE_W - 42} y={p.y - 9} width="38" height="18" rx="4" fill="var(--semantic-natural-deep)" />
                    <text x={p.x + NODE_W - 23} y={p.y + 4} textAnchor="middle" style={{ font: "var(--text-caption-2-semibold)", fill: "var(--semantic-text-on-dark)" }}>
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
            padding: "10px 16px",
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
