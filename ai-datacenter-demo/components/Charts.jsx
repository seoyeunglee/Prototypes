// 대시보드 위젯용 차트. 실제 FE 구현(WidgetNext/contents/charts)을 따른다.
// - SigmaBarChart: 실시간 센서 변동 모니터링(TempBarChart) 재현 — 항목당 막대 1개,
//   값 = 100 + Z×10 (Z-score, σ=0이면 1), y축 0~200 눈금 4개, 기준선 100 점선(평균),
//   120 이상 danger 색, 막대 클릭 시 평균값·평균 범위(평균±2σ) 표시. x축 라벨 숨김.
// - BarSeries/RatioBars: 시간대별 추이·현황 위젯용.
import { useState } from "react";
import { StateBadge } from "@idbrnd/design-system";

export function SigmaBarChart({ items, height = 150 }) {
  const [selected, setSelected] = useState(null);
  const PAD = { t: 8, r: 8, b: 8, l: 28 };
  const width = 520;
  const w = width - PAD.l - PAD.r;
  const h = height - PAD.t - PAD.b;
  const MAX = 200;
  const y = (v) => PAD.t + h - (Math.min(v, MAX) / MAX) * h;
  const barW = Math.min(36, (w / items.length) * 0.55);
  const step = w / items.length;
  const sel = selected != null ? items[selected] : null;

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="센서별 평균 대비 변동">
        {/* 격자선 (점선) + y축 눈금 50/100/150/200 */}
        {[50, 100, 150, 200].map((v) => (
          <g key={v}>
            <line
              x1={PAD.l}
              x2={PAD.l + w}
              y1={y(v)}
              y2={y(v)}
              stroke={v === 100 ? "var(--semantic-natural-heavy)" : "var(--semantic-natural-default)"}
              strokeWidth="1"
              strokeDasharray={v === 100 ? "4 3" : "2 3"}
            />
            <text
              x={PAD.l - 6}
              y={y(v) + 3}
              textAnchor="end"
              style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}
            >
              {v}
            </text>
          </g>
        ))}

        {items.map((it, i) => {
          const cx = PAD.l + step * i + step / 2;
          const stale = !!it.stale;
          // 수집 없음: 값 축에 인코딩되지 않는 하단 고정 플레이스홀더(점선 테두리만)
          const top = stale ? PAD.t + h - 10 : y(it.value);
          const over = !stale && it.value >= 120;
          return (
            <rect
              key={it.name}
              x={cx - barW / 2}
              y={top}
              width={barW}
              height={PAD.t + h - top}
              rx={3}
              fill={
                stale
                  ? "none"
                  : over
                  ? "var(--semantic-content-danger-default)"
                  : "var(--semantic-primary-default)"
              }
              opacity={selected == null || selected === i ? (stale ? 0.5 : 1) : 0.35}
              strokeDasharray={stale ? "4 3" : undefined}
              stroke={stale ? "var(--semantic-natural-heavy)" : undefined}
              strokeWidth={stale ? 1 : undefined}
              style={{ cursor: "pointer" }}
              onClick={() => setSelected(selected === i ? null : i)}
            />
          );
        })}
      </svg>

      {/* 막대 선택 시 정보 — 실제 FE 클릭 툴팁(평균값·평균 범위) 재현 */}
      {sel ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 16px",
            padding: "8px 10px",
            borderRadius: 8,
            background: "var(--semantic-bg-light)",
          }}
        >
          <span style={{ font: "var(--text-label-2-semibold)", color: "var(--semantic-text-default)" }}>
            {sel.name}
          </span>
          {sel.stale && <StateBadge size="compact" variant="warning">수집 없음</StateBadge>}
          <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
            현재값 <b style={{ color: "var(--semantic-text-default)" }}>{sel.stale ? "-" : sel.current}</b>
          </span>
          <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
            평균값 <b style={{ color: "var(--semantic-text-default)" }}>{sel.avg}</b>
          </span>
          <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
            평균 범위 <b style={{ color: "var(--semantic-text-default)" }}>{sel.range}</b>
          </span>
        </div>
      ) : (
        <div style={{ padding: "8px 2px", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
          막대를 선택하면 평균값과 평균 범위가 표시됩니다. 기준선 100 = 365일 평균.
        </div>
      )}
    </div>
  );
}

export function BarSeries({ data, height = 120, color }) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: "100%",
              height: Math.max(4, (d.value / max) * (height - 24)),
              background: color || d.color || "var(--category-003)",
              borderRadius: 4,
            }}
          />
          <span style={{ font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function RatioBars({ data }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d) => (
        <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 96, flexShrink: 0, font: "var(--text-label-2-regular)", color: "var(--semantic-text-default)" }}>
            {d.label}
          </span>
          <span style={{ flex: 1, height: 8, borderRadius: 999, background: "var(--semantic-natural-light)", overflow: "hidden" }}>
            <span
              style={{
                display: "block",
                width: `${(d.value / total) * 100}%`,
                height: "100%",
                background: d.color,
                borderRadius: 999,
              }}
            />
          </span>
          <span
            style={{
              width: 56,
              textAlign: "right",
              font: "var(--text-label-2-regular)",
              color: "var(--semantic-text-sub)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {d.value}건
          </span>
        </div>
      ))}
    </div>
  );
}
