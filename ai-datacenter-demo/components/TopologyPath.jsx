// 점검 경로 — 계통 연결(온톨로지 관계) 기반으로 점검 순서가 나온 근거를 보여준다
// (요소기술 3 '온톨로지 기반 지식화'의 화면 근거). 냉각 공급 경로 위 번호가
// 조치 가이드의 점검 순서(①밸브 ②펌프 ③랙 센서)와 1:1 대응한다.

function Node({ x, y, w, label, order }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={34} rx={6} fill="var(--semantic-bg-light)" stroke="var(--semantic-natural-strong)" strokeWidth="1" />
      <text x={x + w / 2} y={y + 21} textAnchor="middle" style={{ font: "var(--text-caption-1-regular)", fill: "var(--semantic-text-default)" }}>
        {label}
      </text>
      {order && (
        <g>
          <circle cx={x + w - 2} cy={y + 2} r="9" fill="var(--semantic-primary-default)" />
          <text x={x + w - 2} y={y + 5.5} textAnchor="middle" style={{ font: "var(--text-caption-2-semibold)", fill: "var(--semantic-natural-white)" }}>
            {order}
          </text>
        </g>
      )}
    </g>
  );
}

export default function TopologyPath({ desc }) {
  return (
    <div data-desc={desc}>
      <svg
        width="100%"
        viewBox="0 0 520 120"
        role="img"
        aria-label="계통 연결 경로 — 밸브, 펌프, CDU를 거쳐 GPU 랙 A열로 이어지는 냉각 공급 경로와 PDU의 전력 공급 경로. 점검 순서 번호가 경로 위에 표시된다"
      >
        <defs>
          <marker id="tp-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--semantic-natural-heavy)" />
          </marker>
        </defs>

        {/* 냉각 공급 경로 (점검 대상) */}
        <text x="8" y="20" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>
          냉각 공급 경로
        </text>
        <Node x={8} y={30} w={104} label="밸브 V-21" order="1" />
        <Node x={144} y={30} w={104} label="펌프 P-2" order="2" />
        <Node x={280} y={30} w={96} label="2호 CDU" />
        <Node x={408} y={30} w={104} label="GPU 랙 A열" order="3" />
        <line x1="112" y1="47" x2="140" y2="47" stroke="var(--semantic-natural-heavy)" strokeWidth="1.4" markerEnd="url(#tp-arrow)" />
        <line x1="248" y1="47" x2="276" y2="47" stroke="var(--semantic-natural-heavy)" strokeWidth="1.4" markerEnd="url(#tp-arrow)" />
        <line x1="376" y1="47" x2="404" y2="47" stroke="var(--semantic-natural-heavy)" strokeWidth="1.4" markerEnd="url(#tp-arrow)" />

        {/* 전력 공급 경로 (참조) */}
        <text x="8" y="92" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>
          전력 공급 경로
        </text>
        <g opacity="0.55">
          <Node x={144} y={78} w={104} label="분전반 PDU-A" />
          <line x1="248" y1="95" x2="452" y2="95" stroke="var(--semantic-natural-heavy)" strokeWidth="1.4" strokeDasharray="5 4" markerEnd="url(#tp-arrow)" />
          <line x1="460" y1="64" x2="460" y2="95" stroke="var(--semantic-natural-heavy)" strokeWidth="1.4" strokeDasharray="5 4" />
        </g>
      </svg>
      <div style={{ marginTop: 6, font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
        번호는 위 조치 가이드의 점검 순서와 같습니다 — 냉각수 공급 경로에서 랙보다 앞에 있는 설비부터 확인합니다.
      </div>
    </div>
  );
}
