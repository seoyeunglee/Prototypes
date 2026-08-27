// 배치도 위젯용 더미 도면 — GPU룸 평면도(상면). 실제 위젯은 업로드된 도면 이미지 위에
// 비콘을 얹는다(LayoutView). 여기서는 도면을 인라인 SVG로 그려 더미 데이터로 쓴다.
// 구성: GPU 랙 2열(각 6대) · CDU 2대 · 순환 펌프 · 냉각수 배관 · 출입구.

function Rack({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width={34} height={18} rx={2} fill="var(--semantic-natural-default)" stroke="var(--semantic-natural-strong)" strokeWidth="1" />
      {[6, 12, 18, 24, 28].map((dx) => (
        <line key={dx} x1={x + dx} y1={y + 3} x2={x + dx} y2={y + 15} stroke="var(--semantic-natural-strong)" strokeWidth="0.6" />
      ))}
    </g>
  );
}

export default function FloorPlan({ beacons = [] }) {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        width="100%"
        viewBox="0 0 420 240"
        role="img"
        aria-label="GPU룸 A 배치도"
        style={{ display: "block", borderRadius: 8, background: "var(--semantic-bg-light)" }}
      >
        {/* 방 외곽 */}
        <rect x="10" y="10" width="400" height="220" rx="4" fill="var(--semantic-bg-default)" stroke="var(--semantic-natural-strong)" strokeWidth="1.5" />
        {/* 출입구 */}
        <line x1="10" y1="180" x2="10" y2="212" stroke="var(--semantic-bg-default)" strokeWidth="3" />
        <path d="M 10 180 A 32 32 0 0 1 42 212" fill="none" stroke="var(--semantic-natural-strong)" strokeWidth="0.8" strokeDasharray="3 2" />

        {/* 냉각수 배관 (CDU → 랙 열) */}
        <path d="M 330 60 H 250 V 52 M 330 150 H 250 V 142" fill="none" stroke="var(--semantic-natural-strong)" strokeWidth="2" strokeDasharray="6 3" opacity="0.6" />
        <path d="M 250 52 H 70 M 250 142 H 70" fill="none" stroke="var(--semantic-natural-strong)" strokeWidth="2" strokeDasharray="6 3" opacity="0.6" />

        {/* GPU 랙 A열 (상단) */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Rack key={`a${i}`} x={40 + i * 40} y={34} />
        ))}
        <text x="40" y="28" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>
          GPU 랙 A열 (A-01 ~ A-06)
        </text>

        {/* GPU 랙 B열 (하단) */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Rack key={`b${i}`} x={40 + i * 40} y={124} />
        ))}
        <text x="40" y="118" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>
          GPU 랙 B열 (B-01 ~ B-06)
        </text>

        {/* CDU 2대 (우측) */}
        <rect x="330" y="40" width="52" height="40" rx="3" fill="var(--semantic-natural-light)" stroke="var(--semantic-natural-strong)" strokeWidth="1" />
        <text x="356" y="63" textAnchor="middle" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-default)" }}>
          1호 CDU
        </text>
        <rect x="330" y="130" width="52" height="40" rx="3" fill="var(--semantic-natural-light)" stroke="var(--semantic-natural-strong)" strokeWidth="1" />
        <text x="356" y="153" textAnchor="middle" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-default)" }}>
          2호 CDU
        </text>

        {/* 순환 펌프 (우하단) */}
        <circle cx="356" cy="205" r="14" fill="var(--semantic-natural-light)" stroke="var(--semantic-natural-strong)" strokeWidth="1" />
        <circle cx="356" cy="205" r="5" fill="none" stroke="var(--semantic-natural-strong)" strokeWidth="1" />
        <text x="356" y="228" textAnchor="middle" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>
          P-2
        </text>

        {/* 분전반 (좌상단) */}
        <rect x="18" y="60" width="14" height="40" rx="2" fill="var(--semantic-natural-light)" stroke="var(--semantic-natural-strong)" strokeWidth="1" />
        <text x="25" y="112" textAnchor="middle" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>
          PDU
        </text>
      </svg>

      {/* 비콘 오버레이 — 실제 LayoutView처럼 도면 위 상대 좌표에 상태 점 표시 */}
      {beacons.map((b) => (
        <div
          key={b.id}
          title={b.label}
          style={{
            position: "absolute",
            left: `${b.x}%`,
            top: `${b.y}%`,
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: b.tone,
              border: "2px solid var(--semantic-natural-white)",
              boxShadow: "var(--shadow-level-1)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
