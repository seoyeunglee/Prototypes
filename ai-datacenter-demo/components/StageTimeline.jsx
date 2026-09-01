// FN-1 상황 진행 단계 타임라인.
// 단계 라벨은 도메인 공통 인과 단계(전조·발단·확산·영향·피해)를 쓰고, 단계별 도메인 설명은 부모가 선택 단계 아래에 문장으로 표시한다.
// 진행 트래커 3상태(완료/현재/미도달) + 연결선. 잔여 시간 숫자는 표시하지 않는다.
// (FN-3 배지는 2026-08-31 삭제 — "지금 조치하면 막을 수 있는가"는 상세 원인 가설·조치 이력 리포트의 문장으로만 표시)

export function StageTimeline({ stages, currentIndex, desc, onSelectStage, selectedIndex }) {
  return (
    <div data-desc={desc} style={{ display: "flex", alignItems: "stretch" }}>
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
                    background: done ? "var(--semantic-content-informative-light)" : "var(--semantic-natural-default)",
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
                {current ? "현재" : s.at ? `${s.at} 시작` : "도달 전"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
