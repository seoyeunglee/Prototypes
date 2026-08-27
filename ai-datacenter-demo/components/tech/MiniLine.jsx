// 기술 검증 쇼케이스 공용 미니 라인 차트 — 설비별 센서 추이 카드·탐지 팝업에서 사용.
// 실제 설비 그룹 분석 상세의 개별 그래프 형식: 추이선 + 평균 점선 + 이벤트 마커 + 범례(정상/연결 끊김).
export default function MiniLine({
  points,            // "x,y ..." polyline (0~100 좌표계)
  avg,               // 평균선 y (0~100)
  marker,            // 이벤트 마커 x (0~100) — 없으면 미표시
  markerLabel,
  color = "var(--category-001)",
  yMax,              // 좌상단 최대값 라벨
  yMin,              // 좌하단 최소값 라벨
}) {
  const H = 60;
  const toPath = points
    .split(" ")
    .map((p) => {
      const [x, y] = p.split(",").map(Number);
      return `${8 + x * 2.84},${6 + (100 - y) * (H / 100)}`;
    })
    .join(" ");
  return (
    <svg width="100%" viewBox={`0 0 300 ${H + 14}`} style={{ display: "block" }} role="img" aria-label="센서 추이">
      {yMax && (
        <text x="6" y="12" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>{yMax}</text>
      )}
      {yMin && (
        <text x="6" y={H + 4} style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>{yMin}</text>
      )}
      {avg != null && (
        <line
          x1="8" x2="292"
          y1={6 + (100 - avg) * (H / 100)} y2={6 + (100 - avg) * (H / 100)}
          stroke="var(--semantic-natural-heavy)" strokeWidth="1" strokeDasharray="4 3"
        />
      )}
      {marker != null && (
        <g>
          <line
            x1={8 + marker * 2.84} x2={8 + marker * 2.84} y1="4" y2={H + 2}
            stroke="var(--semantic-content-danger-default)" strokeWidth="1.2" strokeDasharray="3 2"
          />
          {markerLabel && (
            <text
              x={Math.min(8 + marker * 2.84 + 4, 230)} y="14"
              style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-content-danger-default)" }}
            >
              {markerLabel}
            </text>
          )}
        </g>
      )}
      <polyline points={toPath} fill="none" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}
