// Edge + MLOps 운영 — 실제 제품의 3개 관리 화면(엣지 디바이스 관리 / 모델 관리 / 연결 데이터 관리)을
// 탭으로 축약 재현. 실제 FE는 ds Table(+TanStack) 기반 — 쇼케이스는 의존성 최소화를 위해
// 카드 행으로 축약하되 컬럼·상태 어휘는 실제 화면을 따른다.
// 신규 연계(프로토콜 어댑터)는 점선 카드 + "신규" 배지로 표현.
import { StateBadge, ContentBadge, WeakButton } from "@idbrnd/design-system";

const EDGE = [
  { name: "EDGE-GPU-01", place: "GPU룸 A", status: "정상 연결", variant: "success", cpu: "42%", mem: "58%" },
  { name: "EDGE-GPU-02", place: "GPU룸 B", status: "정상 연결", variant: "success", cpu: "37%", mem: "51%" },
  { name: "EDGE-PWR-01", place: "전기실", status: "연결 진행 중", variant: "info", cpu: "-", mem: "-" },
];

const MODELS = [
  { name: "부하-냉각 반응 판정", ver: "v1.2", status: "배포됨", variant: "success", metric: "오탐 신고 1건 (30일)", fed: "연합학습 참여" },
  { name: "온도 이상 탐지", ver: "v2.0", status: "재학습 중", variant: "info", metric: "재학습 진행 중", fed: "연합학습 참여" },
  { name: "전력 품질 판정", ver: "v1.0", status: "배포됨", variant: "success", metric: "오탐 신고 0건 (30일)", fed: "미참여" },
];

const SOURCES = [
  { name: "냉각 유량계 F-21", type: "센서", status: "정상 연결", variant: "success", last: "5초 전" },
  { name: "전력 멀티미터 101", type: "센서", status: "정상 연결", variant: "success", last: "5초 전" },
  { name: "밸브 개도 V-21", type: "센서", status: "연결 실패", variant: "error", last: "32분 전" },
  { name: "설비 운영 DB", type: "DB", status: "정상 연결", variant: "success", last: "1분 전" },
  { name: "GPU 텔레메트리 (DCGM/Redfish)", type: "수집기", status: "연동 예정", variant: "info", last: "-", planned: true },
];

const ADAPTERS = ["Modbus-TCP", "BACnet/IP", "SNMP", "Redfish/DCGM"];

function Row({ left, mid, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 4px", borderTop: "1px solid var(--semantic-line-default)" }}>
      {left}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {mid}
        {right}
      </div>
    </div>
  );
}

export default function OpsManagement({ desc, section = "edge" }) {
  const tab = section;
  return (
    <div data-desc={desc} style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 12, padding: "16px 20px" }}>
      {tab === "edge" && (
        <div style={{ marginTop: 12 }}>
          {EDGE.map((d) => (
            <Row
              key={d.name}
              left={
                <span style={{ minWidth: 0 }}>
                  <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>{d.name}</span>
                  <span style={{ marginLeft: 8, font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>{d.place}</span>
                </span>
              }
              mid={
                <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)", fontVariantNumeric: "tabular-nums" }}>
                  CPU {d.cpu} · MEM {d.mem}
                </span>
              }
              right={<StateBadge size="compact" variant={d.variant}>{d.status}</StateBadge>}
            />
          ))}
          <p style={{ margin: "10px 0 0", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
            현장 센서 - 엣지 - 서버 구조로 실시간 분석합니다. 디바이스 상태·리소스를 상시 감시합니다.
          </p>
        </div>
      )}

      {tab === "model" && (
        <div style={{ marginTop: 12 }}>
          {MODELS.map((m) => (
            <Row
              key={m.name}
              left={
                <span style={{ minWidth: 0 }}>
                  <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>{m.name}</span>
                  <span style={{ marginLeft: 8, font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>{m.ver} · {m.fed}</span>
                </span>
              }
              mid={<StateBadge size="compact" variant={m.variant}>{m.status}</StateBadge>}
              right={<WeakButton variant="assistive" size="xsmall">재학습</WeakButton>}
            />
          ))}
          <p style={{ margin: "10px 0 0", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
            모델 성능 점검·재학습·배포·연합학습을 이 화면에서 수행합니다.
          </p>
        </div>
      )}

      {tab === "data" && (
        <div style={{ marginTop: 12 }}>
          {SOURCES.map((s) => (
            <Row
              key={s.name}
              left={
                <span style={{ minWidth: 0, display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>{s.name}</span>
                  <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>{s.type}</span>
                  {s.planned && (
                    <ContentBadge size="compact" backgroundColor="var(--semantic-natural-deep)" contentColor="var(--semantic-text-on-dark)">신규</ContentBadge>
                  )}
                </span>
              }
              mid={
                <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>최근 수집 {s.last}</span>
              }
              right={<StateBadge size="compact" variant={s.variant}>{s.status}</StateBadge>}
            />
          ))}
          <p style={{ margin: "10px 0 0", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
            연결 상태 4분류 상시 갱신 · 값 고착(장시간 동일값) 감지 · 이상 소스를 쓰는 탐지는 자동 차단, 복구 시 자동 재개.
          </p>
        </div>
      )}

      {/* 신규 연계 — 프로토콜 어댑터 */}
      {tab === "adapter" && (
      <div style={{ padding: "12px 16px", borderRadius: 8, border: "1px dashed var(--semantic-natural-heavy)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <ContentBadge size="compact" backgroundColor="var(--semantic-natural-deep)" contentColor="var(--semantic-text-on-dark)">신규</ContentBadge>
          <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>데이터센터 표준 프로토콜 어댑터</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
          {ADAPTERS.map((a) => (
            <ContentBadge key={a} size="compact" backgroundColor="var(--semantic-bg-light)" borderColor="var(--semantic-line-default)" contentColor="var(--semantic-text-default)">
              {a}
            </ContentBadge>
          ))}
        </div>
        <p style={{ margin: 0, font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
          설치형 어댑터로 기존 EMS·BMS·GPU 텔레메트리를 연결 데이터 관리에 등록하는 방식 — 수집 이후의 감시·차단·복구 체계는 현재 제품 그대로 적용됩니다.
        </p>
      </div>
      )}
    </div>
  );
}
