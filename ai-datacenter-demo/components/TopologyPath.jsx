// 점검 경로 — 계통 연결(온톨로지 관계) 기반으로 점검 순서가 나온 근거를 보여준다.
// HTML 카드 + 타이포 토큰(FlowKit 양식) — 경로 위 번호가 조치 가이드의 점검 순서와 1:1 대응한다.
import { Icon } from "@idbrnd/design-system";

function PathChip({ label, order }) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid var(--semantic-natural-strong)",
        background: "var(--semantic-bg-light)",
        font: "var(--text-caption-1-regular)",
        color: "var(--semantic-text-default)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      {order && (
        <span
          style={{
            position: "absolute",
            right: -7,
            top: -7,
            width: 16,
            height: 16,
            borderRadius: 999,
            background: "var(--semantic-primary-default)",
            color: "var(--semantic-natural-white)",
            font: "var(--text-caption-2-semibold)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {order}
        </span>
      )}
    </span>
  );
}

function PathArrow() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
      <Icon name="chevron-right" size={14} color="var(--semantic-natural-heavy)" />
    </span>
  );
}

export default function TopologyPath({ desc }) {
  return (
    <div data-desc={desc} style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ width: 92, flexShrink: 0, font: "var(--text-caption-1-semibold)", color: "var(--semantic-text-sub)" }}>
          냉각 공급 경로
        </span>
        <PathChip label="밸브 V-21" order="1" />
        <PathArrow />
        <PathChip label="펌프 P-2" order="2" />
        <PathArrow />
        <PathChip label="2호 CDU" />
        <PathArrow />
        <PathChip label="GPU 랙 A열" order="3" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", opacity: 0.55 }}>
        <span style={{ width: 92, flexShrink: 0, font: "var(--text-caption-1-semibold)", color: "var(--semantic-text-sub)" }}>
          전력 공급 경로
        </span>
        <PathChip label="분전반 PDU-A" />
        <PathArrow />
        <PathChip label="GPU 랙 A열" />
      </div>
      <p style={{ margin: 0, font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
        번호는 위 조치 가이드의 점검 순서입니다. 냉각수 공급 경로에서 랙보다 앞에 있는 설비부터 확인합니다.
      </p>
    </div>
  );
}
