// 파이프라인·판정 구조 다이어그램 공용 프리미티브 — SVG 텍스트 스케일 문제를 피하기 위해
// HTML 카드 + 타이포 토큰으로 그린다(노드 캔버스와 동일 양식). 점선 = 신규/설계 구간.
import { Icon, ContentBadge } from "@idbrnd/design-system";

export function FlowCard({ title, sub, planned, active, minWidth = 132 }) {
  return (
    <div
      style={{
        position: "relative",
        minWidth,
        padding: "8px 12px",
        borderRadius: 8,
        background: active ? "var(--semantic-primary-extra-light)" : "var(--semantic-bg-default)",
        border: `1px ${planned ? "dashed" : "solid"} ${
          active ? "var(--semantic-primary-default)" : planned ? "var(--semantic-natural-heavy)" : "var(--semantic-line-default)"
        }`,
      }}
    >
      {planned && (
        <span style={{ position: "absolute", right: 8, top: -9 }}>
          <ContentBadge size="compact" backgroundColor="var(--semantic-natural-deep)" contentColor="var(--semantic-text-on-dark)">
            신규
          </ContentBadge>
        </span>
      )}
      <div style={{ font: "var(--text-label-2-semibold)", color: active ? "var(--semantic-primary-default)" : "var(--semantic-text-default)", whiteSpace: "nowrap" }}>
        {title}
      </div>
      {sub && (
        <div style={{ marginTop: 2, font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)", whiteSpace: "nowrap" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function FlowArrow({ planned }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0, opacity: planned ? 0.55 : 1 }}>
      <Icon name="chevron-right" size={16} color="var(--semantic-natural-heavy)" />
    </span>
  );
}

export function FlowRow({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {children}
    </div>
  );
}

export function FlowFrame({ title, children, note }) {
  return (
    <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, background: "var(--semantic-bg-light)", padding: "12px 16px" }}>
      {title && (
        <div style={{ marginBottom: 10, font: "var(--text-caption-1-semibold)", color: "var(--semantic-text-sub)" }}>{title}</div>
      )}
      {children}
      {note && (
        <p style={{ margin: "10px 0 0", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>{note}</p>
      )}
    </div>
  );
}
