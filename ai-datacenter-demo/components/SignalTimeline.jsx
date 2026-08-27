// 계통 신호 타임라인 — GPU 부하·랙 전력·냉각 유량·랙 출구 온도를 동일 시간축에 정렬해
// 변화 순서와 반응 속도를 보여준다 (요소기술 1 '초연결 시계열 분석'의 화면 근거).
// 냉각 유량 행은 기대 반응(점선)과 실측(실선)을 겹쳐 반응 지연 구간을 음영으로 표시한다.
// 시리즈 색은 차트 데이터 시리즈 규칙에 따라 카테고리 토큰만 사용.

const W = 520;
const ROW_H = 42;
const X0 = 96;
const X1 = 508;

const ROWS = [
  {
    name: "GPU 부하",
    color: "var(--category-001)",
    points: "96,32 200,32 214,16 250,12 508,12",
  },
  {
    name: "랙 전력",
    color: "var(--category-002)",
    points: "96,74 214,74 232,60 268,56 508,56",
  },
  {
    name: "냉각 유량",
    color: "var(--category-003)",
    expected: "96,116 232,116 258,102 300,98 508,98",
    points: "96,116 300,116 330,112 508,111",
  },
  {
    name: "랙 출구 온도",
    color: "var(--category-005)",
    points: "96,158 320,158 360,150 430,142 508,136",
  },
];

const TICKS = [
  { x: 96, label: "13:40" },
  { x: 199, label: "13:50" },
  { x: 302, label: "14:00" },
  { x: 405, label: "14:10" },
  { x: 508, label: "14:20" },
];

export default function SignalTimeline({ desc }) {
  return (
    <div data-desc={desc}>
      <svg
        width="100%"
        viewBox={`0 0 ${W} 196`}
        role="img"
        aria-label="계통 신호 타임라인 — 부하와 전력이 먼저 오르고 냉각 유량이 따라오지 않아 온도가 상승하는 순서"
      >
        {/* 냉각 반응 지연 구간 음영 (유량 행) */}
        <rect x="232" y="96" width="276" height="28" rx="3" fill="var(--semantic-content-warning-extra-light)" />
        <text x="486" y="93" textAnchor="end" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-content-warning-default)" }}>
          기대 반응 대비 지연
        </text>

        {/* 시간축 마커 — 부하 상승 시작 / 지연 판정 */}
        <line x1="214" y1="6" x2="214" y2="168" stroke="var(--semantic-natural-heavy)" strokeWidth="1" strokeDasharray="3 3" />
        <text x="214" y="184" textAnchor="middle" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>
          부하 상승
        </text>
        <line x1="330" y1="6" x2="330" y2="168" stroke="var(--semantic-content-warning-default)" strokeWidth="1" strokeDasharray="3 3" />
        <text x="330" y="184" textAnchor="middle" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-content-warning-default)" }}>
          지연 판정
        </text>

        {ROWS.map((r, i) => {
          const base = 32 + i * ROW_H;
          return (
            <g key={r.name}>
              <line x1={X0} y1={base} x2={X1} y2={base} stroke="var(--semantic-natural-default)" strokeWidth="1" strokeDasharray="2 3" />
              <text x={X0 - 8} y={base + 3} textAnchor="end" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-default)" }}>
                {r.name}
              </text>
              {r.expected && (
                <polyline points={r.expected} fill="none" stroke={r.color} strokeWidth="1.4" strokeDasharray="4 3" opacity="0.55" />
              )}
              <polyline points={r.points} fill="none" stroke={r.color} strokeWidth="2" />
            </g>
          );
        })}

        {/* 시간 눈금 */}
        {TICKS.map((t) => (
          <text key={t.label} x={t.x} y={196} textAnchor="middle" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>
            {t.label}
          </text>
        ))}
      </svg>
      <div style={{ marginTop: 6, font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
        점선(냉각 유량 행)은 부하 상승 시 기대되는 반응. 실측이 따라오지 않는 구간이 지연 판정의 근거입니다.
      </div>
    </div>
  );
}
