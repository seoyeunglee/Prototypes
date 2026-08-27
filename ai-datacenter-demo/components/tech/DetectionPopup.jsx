// 탐지 데이터 상세 팝업 — 실제 제품의 탐지 이벤트 클릭 시 팝업(DetectionDataModal) 형식 재현.
// 발생 시점 추이 + 이벤트 마커 + 센서값/평균, 판정 방식 요약.
import { Icon, StateBadge, BasicIconButton } from "@idbrnd/design-system";
import MiniLine from "./MiniLine";

export default function DetectionPopup({ event, onClose }) {
  if (!event) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.4)", /* FE Modal.module.css overlay 실물 값 */
      }}
      onClick={onClose}
    >
      <div
        data-idb-component
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          maxWidth: "92%",
          borderRadius: 12,
          background: "var(--semantic-bg-default)",
          boxShadow: "var(--shadow-level-3)",
          padding: "20px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <h3 style={{ margin: 0, font: "var(--text-heading-2-semibold)", color: "var(--semantic-text-default)" }}>
            탐지 데이터 상세
          </h3>
          <div style={{ marginLeft: "auto" }}>
            <BasicIconButton onClick={onClose} aria-label="팝업 닫기">
              <Icon name="close" size={22} color="var(--semantic-text-sub)" />
            </BasicIconButton>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <StateBadge size="compact" variant={event.variant}>{event.badge}</StateBadge>
          <span style={{ font: "var(--text-body-2-normal-semibold)", color: "var(--semantic-text-default)" }}>{event.name}</span>
          <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>{event.source}</span>
          <span style={{ marginLeft: "auto", font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>{event.time}</span>
        </div>

        <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
          <MiniLine
            points={event.points}
            avg={event.avg}
            marker={event.marker}
            markerLabel="발생 시점"
            color={event.color}
            yMax={event.yMax}
            yMin={event.yMin}
          />
          <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
              센서값 <b style={{ color: "var(--semantic-text-default)" }}>{event.value}</b>
            </span>
            <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
              평균값 <b style={{ color: "var(--semantic-text-default)" }}>{event.avgLabel}</b>
            </span>
            <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
              판정 <b style={{ color: "var(--semantic-text-default)" }}>{event.rule}</b>
            </span>
          </div>
        </div>

        <p style={{ margin: 0, font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-sub)" }}>
          {event.note}
        </p>
      </div>
    </div>
  );
}
