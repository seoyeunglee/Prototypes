// FN-1 위험 진행 단계 타임라인 + FN-3 개입 여지 배지.
// 진행 트래커 3상태(완료/현재/미도달) + 연결선. 잔여 시간 숫자는 표시하지 않는다.
// 배지는 라이브러리 StateBadge를 쓴다 (실제 FE의 심각도 표기와 동일 컴포넌트).
import { StateBadge } from "@idbrnd/design-system";

const REACH = {
  open: { label: "개입 여지 있음", variant: "success" },
  narrowing: { label: "개입 여지 좁아지는 중", variant: "warning" },
  closed: { label: "개입 여지 없음", variant: "error" },
};

export function ReachBadge({ level, desc }) {
  const r = REACH[level] || REACH.open;
  return (
    <span data-desc={desc} style={{ display: "inline-flex" }}>
      <StateBadge variant={r.variant}>{r.label}</StateBadge>
    </span>
  );
}

export function StageTimeline({ stages, currentIndex, halted, desc, onSelectStage, selectedIndex }) {
  return (
    <div data-desc={desc} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {stages.map((s, i) => {
          const done = i < currentIndex;
          const current = i === currentIndex;
          const selected = selectedIndex === i;
          const reached = done || current;

          const dotColor = current
            ? "var(--semantic-content-warning-default)"
            : done
            ? "var(--semantic-content-informative-default)"
            : "var(--semantic-natural-strong)";

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectStage && onSelectStage(i)}
              disabled={!onSelectStage || !reached}
              style={{
                flex: 1,
                minWidth: 0,
                textAlign: "left",
                border: "none",
                background: selected ? "var(--semantic-primary-extra-light)" : "transparent",
                borderRadius: 8,
                padding: "8px 8px 10px",
                cursor: onSelectStage && reached ? "pointer" : "default",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: dotColor,
                    flexShrink: 0,
                    outline: current ? "3px solid var(--semantic-content-warning-extra-light)" : "none",
                  }}
                />
                {i < stages.length - 1 && (
                  <span
                    style={{
                      flex: 1,
                      height: 2,
                      marginLeft: 6,
                      background: done
                        ? "var(--semantic-content-informative-light)"
                        : "var(--semantic-natural-default)",
                    }}
                  />
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    font: current ? "var(--text-label-1-semibold)" : "var(--text-label-1-regular)",
                    color: reached ? "var(--semantic-text-default)" : "var(--semantic-text-sub)",
                  }}
                >
                  {s.label}
                </div>
                <div style={{ marginTop: 4, font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
                  {current ? "현재 단계" : s.at ? `${s.at} 전이` : "미도달"}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {halted && (
        <div
          data-desc="14"
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            background: "var(--semantic-content-warning-extra-light)",
            color: "var(--semantic-text-default)",
            font: "var(--text-body-2-reading-regular)",
          }}
        >
          냉각 계통 데이터를 수집하지 못해 단계 판정을 중단했습니다. 직전 단계를 표시합니다.
        </div>
      )}
    </div>
  );
}
