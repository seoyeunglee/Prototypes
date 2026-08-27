// 원인·위험·다음 사건 예측 — 내부 구조 도식 2종.
// ① EWMA 오차 추세 판정: 기존 발전 효율 저하 탐지 구조에서 예측 모델 자리만 교체(신규 배지)
// ② 진행 단계 판정 엔진: 5단계 상태 전이 + 판정 안정성(뒤집힘 시 직전 단계 유지)
export default function PredictionEngine({ desc }) {
  return (
    <div data-desc={desc} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* EWMA 판정 구조 */}
      <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, background: "var(--semantic-bg-light)", padding: "8px 4px", overflowX: "auto" }}>
        <svg width="100%" viewBox="0 0 720 150" style={{ display: "block", minWidth: 560 }} role="img" aria-label="부하를 입력받아 필요 냉각량을 예측하고 실측과의 오차 추세가 임계를 넘으면 이벤트를 내는 판정 구조">
          <defs>
            <marker id="pe-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill="var(--semantic-natural-heavy)" />
            </marker>
          </defs>
          <text x="10" y="18" style={{ font: "var(--text-caption-2-semibold)", fill: "var(--semantic-text-sub)" }}>
            EWMA 오차 추세 판정 — 기존 구조 재사용, 모델 자리만 교체
          </text>

          <g>
            <rect x="10" y="34" width="150" height="48" rx="8" fill="var(--semantic-bg-default)" stroke="var(--semantic-natural-heavy)" strokeWidth="1.2" strokeDasharray="5 4" />
            <text x="85" y="54" textAnchor="middle" style={{ font: "var(--text-label-2-semibold)", fill: "var(--semantic-text-default)" }}>부하→필요 냉각량 예측</text>
            <text x="85" y="72" textAnchor="middle" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>모델 자리 교체</text>
            <rect x="118" y="25" width="38" height="18" rx="4" fill="var(--semantic-natural-deep)" />
            <text x="137" y="38" textAnchor="middle" style={{ font: "var(--text-caption-2-semibold)", fill: "var(--semantic-text-on-dark)" }}>신규</text>
          </g>
          <rect x="205" y="34" width="130" height="48" rx="8" fill="var(--semantic-bg-default)" stroke="var(--semantic-line-default)" strokeWidth="1.2" />
          <text x="270" y="54" textAnchor="middle" style={{ font: "var(--text-label-2-semibold)", fill: "var(--semantic-text-default)" }}>오차 = 예측 − 실측</text>
          <text x="270" y="72" textAnchor="middle" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>실측: 냉각 유량·온도</text>

          <rect x="380" y="34" width="140" height="48" rx="8" fill="var(--semantic-bg-default)" stroke="var(--semantic-line-default)" strokeWidth="1.2" />
          <text x="450" y="54" textAnchor="middle" style={{ font: "var(--text-label-2-semibold)", fill: "var(--semantic-text-default)" }}>오차 추세 (EWMA)</text>
          <text x="450" y="72" textAnchor="middle" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>평활 누적</text>

          <rect x="565" y="34" width="145" height="48" rx="8" fill="var(--semantic-bg-default)" stroke="var(--semantic-line-default)" strokeWidth="1.2" />
          <text x="637" y="54" textAnchor="middle" style={{ font: "var(--text-label-2-semibold)", fill: "var(--semantic-text-default)" }}>임계 초과 시 이벤트</text>
          <text x="637" y="72" textAnchor="middle" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>임계 = 오차 편차 기반</text>

          <line x1="160" y1="58" x2="201" y2="58" stroke="var(--semantic-natural-heavy)" strokeWidth="1.3" markerEnd="url(#pe-arrow)" />
          <line x1="335" y1="58" x2="376" y2="58" stroke="var(--semantic-natural-heavy)" strokeWidth="1.3" markerEnd="url(#pe-arrow)" />
          <line x1="520" y1="58" x2="561" y2="58" stroke="var(--semantic-natural-heavy)" strokeWidth="1.3" markerEnd="url(#pe-arrow)" />

          <text x="360" y="122" textAnchor="middle" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>
            기존 발전 효율 저하 탐지가 이미 이 구조로 운영 중 — 예측 모델 자리만 바꾸면 판정 로직이 그대로 성립합니다.
          </text>
        </svg>
      </div>

      {/* 진행 단계 판정 엔진 */}
      <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, background: "var(--semantic-bg-light)", padding: "8px 4px", overflowX: "auto" }}>
        <svg width="100%" viewBox="0 0 720 130" style={{ display: "block", minWidth: 560 }} role="img" aria-label="관찰 구간부터 성능 저하까지 다섯 단계의 상태 전이와 판정 안정성 규칙">
          <text x="10" y="18" style={{ font: "var(--text-caption-2-semibold)", fill: "var(--semantic-text-sub)" }}>
            진행 단계 판정 엔진 — 설계 확보 (단계 진입 조건은 도메인 승인 대기)
          </text>
          {["관찰 구간", "부하·전력 상승 확인", "냉각 반응 지연", "랙 온도 상승", "성능 저하"].map((s, i) => {
            const x = 10 + i * 143;
            const active = i === 2;
            return (
              <g key={s}>
                <rect x={x} y={40} width={128} height={40} rx={8}
                  fill={active ? "var(--semantic-primary-extra-light)" : "var(--semantic-bg-default)"}
                  stroke={active ? "var(--semantic-primary-default)" : "var(--semantic-line-default)"} strokeWidth={active ? 1.6 : 1.2} />
                <text x={x + 64} y={64} textAnchor="middle" style={{ font: "var(--text-caption-1-semibold)", fill: active ? "var(--semantic-primary-default)" : "var(--semantic-text-default)" }}>{s}</text>
                {i < 4 && (
                  <line x1={x + 128} y1={60} x2={x + 141} y2={60} stroke="var(--semantic-natural-heavy)" strokeWidth="1.3" markerEnd="url(#pe-arrow)" />
                )}
              </g>
            );
          })}
          <text x="360" y="108" textAnchor="middle" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>
            판정 안정성: 같은 입력에 판정이 반복해서 뒤집히면 단계를 확정하지 않고 직전 단계를 유지 · 신호 단절 시 판정 중단 표시
          </text>
        </svg>
      </div>
    </div>
  );
}
