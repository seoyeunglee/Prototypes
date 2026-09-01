// screen-01 · 메인 대시보드 — 실제 FE 그리드·위젯 형식을 따른다.
//   그리드: 20열 × 12행, 마진 [12, 16] (DashboardGrid.jsx: cols=20, GRID_MAX_ROWS=12)
//   구성(2026-08-27): 이상 탐지 발생 요약 14×2(상단 와이드) · 시간대별 이상 발생 건수 6×4
//   · 배치도 7×5 · 이상 상황 목록 7×10(핵심) · 장소별 이상 발생 건수 6×3
//   · 실시간 이상 탐지 내역 7×5 · 탐지 확인 현황 6×5
//   핵심(목록·배치도) 외 위젯은 dimmed(흐림 + inert)로 주요 기능을 강조한다.
import { Icon, BasicIconButton, StateBadge, ContentBadge, Tab, TextButton, OutlineButton } from "@idbrnd/design-system";
import { useState } from "react";
import { BarSeries } from "../components/Charts";
import FloorPlan from "../components/FloorPlan";

// 그리드 상수 — 실제 FE DashboardGrid와 동일
const GRID_COLS = 20;
const GRID_MARGIN = [12, 16];
const ROW_HEIGHT = 46; // 실제는 컨테이너 높이에서 계산. 데모는 고정값

// 실시간 이상 탐지 내역 — 실제 위젯 카드 형식(탐지명·발생 장소·탐지 데이터·상세 보기)
const MOCK_DETECTIONS = [
  { name: "냉각 유량 저하", time: "1분 전", place: "GPU룸 A", data: "118L/min", threshold: "/123L/min" },
  { name: "온도 센서 임계치", time: "3분 전", place: "GPU 랙 A열", data: "34.2°C", threshold: "/33.5°C" },
  { name: "랙 전력 상승", time: "8분 전", place: "GPU룸 A", data: "41.2kW", threshold: "/39.0kW" },
];

const MOCK_SITUATIONS = [
  {
    id: "SIT-2481",
    isNew: true,
    severity: "HIGH",
    title: "GPU 랙 A열 냉각 반응 지연",
    stage: "확산",
    reach: "narrowing",
    status: "확인 대기",
    recent: "1분 전",
    first: "3시간 전",
    count: 12,
  },
  {
    id: "SIT-2478",
    severity: "MEDIUM",
    title: "2호 CDU 공급 압력 변동",
    stage: "발단",
    reach: "open",
    status: "확인 중",
    recent: "8분 전",
    first: "6시간 전",
    count: 7,
    manager: "김도현",
    managerSelf: true,
  },
  {
    id: "SIT-2470",
    severity: "LOW",
    title: "B열 랙 후면 온도 편차",
    stage: "전조",
    reach: "open",
    status: "확인 대기",
    recent: "45분 전",
    first: "1일 전",
    count: 3,
  },
  {
    id: "SIT-2455",
    severity: "MEDIUM",
    title: "A열 분전반 상 불평형",
    stage: "영향",
    reach: "closed",
    status: "조치 완료",
    recent: "1일 전",
    first: "2일 전",
    count: 9,
    manager: "이수민",
  },
];

const SEVERITY_VARIANT = { HIGH: "error", MEDIUM: "warning", LOW: "basic" };
const SEVERITY_LABEL = { HIGH: "심각도 높음", MEDIUM: "심각도 중간", LOW: "심각도 낮음" };
const STATUS_TABS = ["전체", "확인 대기", "확인 중", "처리 지연", "조치 완료"];

const MOCK_HOURLY = [
  { label: "07", value: 0 }, { label: "08", value: 1 }, { label: "09", value: 0 },
  { label: "10", value: 2 }, { label: "11", value: 3 }, { label: "12", value: 1 },
  { label: "13", value: 0 }, { label: "14", value: 1 }, { label: "15", value: 2 },
];

// 탐지 확인 현황 — 실제 위젯의 3타일(미해결/확인 중/해결) 형식
const MOCK_CHECK = [
  { label: "미해결", count: 2, tone: "var(--semantic-content-danger-default)" },
  { label: "확인 중", count: 1, tone: "var(--semantic-text-default)" },
  { label: "해결", count: 5, tone: "var(--semantic-content-positive-default)" },
];

// 이상 탐지 발생 요약 — 실제 위젯의 탐지 유형별 건수 칩 스트립 형식
const MOCK_SUMMARY = [
  { label: "냉각 반응 지연", count: 4 },
  { label: "온도 센서 임계치", count: 2 },
  { label: "전력 임계치", count: 2 },
  { label: "진동 이상치 탐지", count: 0 },
  { label: "EWMA 탐지", count: 0 },
  { label: "소음도 이상 탐지", count: 0 },
];

// 장소별 이상 발생 건수 — 발생 장소 · 분포 바 · 발생 건수
const MOCK_PLACES = [
  { label: "GPU룸 A", ratio: 62, count: 8 },
  { label: "GPU룸 B", ratio: 23, count: 3 },
  { label: "전기실", ratio: 15, count: 2 },
];

// 배치도 비콘 — FloorPlan SVG 위 상대 좌표(%). 랙 A열=danger, 2호 CDU=warning
const MOCK_BEACONS = [
  { id: "rack-a", label: "GPU 랙 A열", x: 32, y: 18, tone: "var(--semantic-content-danger-default)" },
  { id: "cdu-2", label: "2호 CDU", x: 85, y: 62, tone: "var(--semantic-content-warning-default)" },
  { id: "rack-b", label: "GPU 랙 B열", x: 32, y: 56, tone: "var(--semantic-content-positive-default)" },
  { id: "pump-2", label: "순환 펌프 P-2", x: 85, y: 85, tone: "var(--semantic-content-positive-default)" },
];

// 위젯 프레임 — 그리드 스팬(w×h)을 받아 실제 규격으로 배치. 본문은 위젯 안에서 스크롤
// dimmed: 데모 핵심 기능 외 위젯은 레이아웃만 유지한 채 흐리게 두고 조작을 막는다
function Widget({ icon, title, meta, right, desc, x, y, w, h, dimmed, children }) {
  return (
    <div
      data-desc={desc}
      aria-disabled={dimmed || undefined}
      inert={dimmed ? "" : undefined}
      style={{
        gridColumn: x != null ? `${x + 1} / span ${w}` : `span ${w}`,
        gridRow: y != null ? `${y + 1} / span ${h}` : `span ${h}`,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        minHeight: 0,
        background: "var(--semantic-bg-default)",
        border: "1px solid var(--semantic-line-default)",
        borderRadius: 12,
        padding: "12px 16px",
        opacity: dimmed ? 0.35 : 1,
        pointerEvents: dimmed ? "none" : "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexShrink: 0 }}>
        <Icon name={icon} size={20} />
        <h2 style={{ margin: 0, font: "var(--text-heading-2-semibold)", color: "var(--semantic-text-default)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {title}
        </h2>
        {meta && (
          <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)", whiteSpace: "nowrap" }}>{meta}</span>
        )}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {right}
          <BasicIconButton aria-label="위젯 더보기">
            <Icon name="more-horizontal" size={20} color="var(--semantic-text-sub)" />
          </BasicIconButton>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>{children}</div>
    </div>
  );
}

// 이상 상황 목록 항목 — FE SituationListItem 구조 + 진행 단계(신규)
function SituationItem({ s, onOpen, lowConfidence, coolingSignalLost }) {
  // FE SituationListItem: UNPROCESSED(미처리)만 danger — 워크플로 상태는 중립색
  const statusColor =
    s.status === "조치 완료" ? "var(--semantic-text-sub)" : "var(--semantic-text-default)";
  return (
    <button
      type="button"
      onClick={() => onOpen(s.id)}
      data-desc="61"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "flex-start",
        gap: 12,
        width: "100%",
        textAlign: "left",
        padding: "16px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        borderBottom: "1px solid var(--semantic-line-default)",
      }}
    >
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {s.isNew && (
            <ContentBadge size="compact" backgroundColor="var(--semantic-natural-deep)" contentColor="var(--semantic-text-on-dark)">
              New
            </ContentBadge>
          )}
          <StateBadge variant={SEVERITY_VARIANT[s.severity]} size="compact">
            {SEVERITY_LABEL[s.severity]}
          </StateBadge>
          <span style={{ font: "var(--text-body-2-normal-semibold)", color: "var(--semantic-text-default)" }}>
            {s.title}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
            최근 <b style={{ color: "var(--semantic-text-default)" }}>{s.recent}</b>
          </span>
          <span style={{ width: 1, height: 10, background: "var(--semantic-line-default)" }} />
          <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
            최초 <b style={{ color: "var(--semantic-text-default)" }}>{s.first}</b>
          </span>
          <span style={{ width: 1, height: 10, background: "var(--semantic-line-default)" }} />
          <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
            누적 <b style={{ color: "var(--semantic-text-default)" }}>{s.count}건</b>
          </span>
        </div>

        <div data-desc="62" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <ContentBadge
            size="compact"
            backgroundColor="var(--semantic-bg-light)"
            borderColor="var(--semantic-line-default)"
            contentColor="var(--semantic-text-default)"
          >
            {s.stage}
          </ContentBadge>
        </div>

        {s.manager && (
          <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
            담당 {s.manager}
            {s.managerSelf && " (나)"}
          </span>
        )}
      </div>

      <span style={{ font: "var(--text-body-2-normal-semibold)", color: statusColor, whiteSpace: "nowrap" }}>
        {s.status}
      </span>
    </button>
  );
}

export default function Dashboard({ onOpenSituation, lowConfidence, coolingSignalLost }) {
  const [statusTab, setStatusTab] = useState("전체");

  const situations = MOCK_SITUATIONS.map((s) =>
    s.id === "SIT-2481" && coolingSignalLost ? { ...s, stage: "발단" } : s
  );
  const filtered = situations.filter((s) => statusTab === "전체" || s.status === statusTab);
  const newCount = situations.filter((s) => s.isNew).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ margin: 0, font: "var(--text-title-2-semibold)", color: "var(--semantic-text-strong)" }}>
        메인 대시보드
      </h1>

      {/* 실제 FE 그리드: 20열, 마진 [12,16]. 구성(2026-08-27): 요약 상단 와이드 + 7위젯 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
          gridAutoRows: ROW_HEIGHT,
          columnGap: GRID_MARGIN[0],
          rowGap: GRID_MARGIN[1],
        }}
      >
        {/* 이상 탐지 발생 요약 — 상단 와이드 스트립, 탐지 유형별 건수 칩 */}
        <Widget dimmed icon="dashboard-graph" title="이상 탐지 발생 요약" meta="2026-08-27 기준" desc="9" x={0} y={0} w={14} h={2}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            {MOCK_SUMMARY.map((c) => (
              <div
                key={c.label}
                style={{
                  flexShrink: 0,
                  minWidth: 128,
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--semantic-line-default)",
                  background: "var(--semantic-bg-light)",
                }}
              >
                <div style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)", whiteSpace: "nowrap" }}>
                  {c.label}
                </div>
                <div style={{ font: "var(--text-body-1-normal-semibold)", color: "var(--semantic-text-default)" }}>
                  {c.count}
                  <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>건</span>
                </div>
              </div>
            ))}
          </div>
        </Widget>

        {/* 시간대별 이상 발생 건수 */}
        <Widget dimmed icon="dashboard-history" title="시간대별 이상 발생 건수" desc="11" x={14} y={0} w={6} h={4}>
          <div style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)", marginBottom: 4 }}>
            (발생 건수)
          </div>
          <BarSeries data={MOCK_HOURLY} height={110} color="var(--semantic-natural-deep)" />
        </Widget>

        {/* 배치도 — 더미 도면 SVG + 비콘 (시나리오 위치 표시) */}
        <Widget icon="dashboard-map" title="배치도" meta="GPU룸 A" desc="12" x={0} y={2} w={7} h={5}>
          <FloorPlan beacons={MOCK_BEACONS} />
        </Widget>

        {/* 이상 상황 목록 — 데모 핵심. 실제 위젯 형식(부제·상태 탭·새 상황 배너·푸터) */}
        <Widget
          icon="dashboard-detection"
          title="이상 상황 목록"
          meta="2026-08-14 ~ 2026-08-27 기준"
          desc="7"
          x={7}
          y={2}
          w={7}
          h={10}
        >
          <p style={{ margin: "0 0 8px", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
            전체 구역의 상황이 표시됩니다.
          </p>
          <div data-desc="60" style={{ marginBottom: 8, position: "sticky", top: 0, background: "var(--semantic-bg-default)", zIndex: 1 }}>
            <Tab
              size="small"
              resize="hug"
              items={STATUS_TABS.map((tab) => ({
                value: tab,
                label: tab,
                numberBadge:
                  tab === "전체" ? undefined : situations.filter((s) => s.status === tab).length || undefined,
              }))}
              value={statusTab}
              onChange={(v) => setStatusTab(v)}
            />
          </div>
          {newCount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 8,
                background: "var(--semantic-bg-light)",
                marginBottom: 4,
              }}
            >
              <span style={{ font: "var(--text-label-1-regular)", color: "var(--semantic-text-default)" }}>
                확인하지 않은 새 상황 {newCount}건이 있습니다
              </span>
              <div style={{ marginLeft: "auto" }}>
                <TextButton variant="assistive" size="small" onClick={() => onOpenSituation("SIT-2481")}>
                  바로 이동
                </TextButton>
              </div>
            </div>
          )}
          {filtered.map((s) => (
            <SituationItem
              key={s.id}
              s={s}
              onOpen={onOpenSituation}
              lowConfidence={lowConfidence}
              coolingSignalLost={coolingSignalLost}
            />
          ))}
          {filtered.length === 0 && (
            <p style={{ margin: "32px 0", textAlign: "center", font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-sub)" }}>
              표시할 상황이 없습니다.
            </p>
          )}
          <p style={{ margin: "10px 0 0", textAlign: "center", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
            {statusTab} {filtered.length}건
          </p>
        </Widget>

        {/* 장소별 이상 발생 건수 — 발생 장소 · 분포 · 발생 건수 */}
        <Widget dimmed icon="dashboard-map" title="장소별 이상 발생 건수" desc="63" x={14} y={4} w={6} h={3}>
          <div style={{ display: "grid", gridTemplateColumns: "72px 1fr 48px", gap: "6px 10px", alignItems: "center" }}>
            <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>발생 장소</span>
            <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>분포</span>
            <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)", textAlign: "right" }}>발생 건수</span>
            {MOCK_PLACES.map((pl) => (
              [
                <span key={pl.label + "-n"} style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-default)" }}>
                  {pl.label}
                </span>,
                <span key={pl.label + "-b"} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ flex: 1, height: 8, borderRadius: 999, background: "var(--semantic-natural-light)", overflow: "hidden" }}>
                    <span style={{ display: "block", width: `${pl.ratio}%`, height: "100%", background: "var(--semantic-natural-deep)", borderRadius: 999 }} />
                  </span>
                  <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)", fontVariantNumeric: "tabular-nums" }}>
                    {pl.ratio}%
                  </span>
                </span>,
                <span key={pl.label + "-c"} style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-default)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {pl.count}건
                </span>,
              ]
            ))}
          </div>
        </Widget>

        {/* 실시간 이상 탐지 내역 — 탐지 카드 가로 스트립 */}
        <Widget dimmed icon="dashboard-square-activity" title="실시간 이상 탐지 내역" meta="2026-08-27 기준" desc="64" x={0} y={7} w={7} h={5}>
          <div style={{ display: "flex", gap: 10, height: "100%" }}>
            {MOCK_DETECTIONS.map((d) => (
              <div
                key={d.name}
                style={{
                  flex: "1 1 0",
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "12px",
                  borderRadius: 8,
                  border: "1px solid var(--semantic-line-default)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="dashboard-detection" size={16} />
                  <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {d.name}
                  </span>
                  <span style={{ marginLeft: "auto", font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)", whiteSpace: "nowrap" }}>
                    {d.time}
                  </span>
                </div>
                <div>
                  <div style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>발생 장소</div>
                  <div style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>{d.place}</div>
                </div>
                <div>
                  <div style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>탐지 데이터</div>
                  <div style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>
                    {d.data}
                    <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}> {d.threshold}</span>
                  </div>
                </div>
                <div style={{ marginTop: "auto", borderTop: "1px solid var(--semantic-line-default)", paddingTop: 6, textAlign: "center" }}>
                  <TextButton variant="assistive" size="small">상세 보기</TextButton>
                </div>
              </div>
            ))}
          </div>
        </Widget>

        {/* 탐지 확인 현황 — 미해결/확인 중/해결 3타일 + 상세 보기 */}
        <Widget dimmed icon="dashboard-book-check" title="탐지 확인 현황" meta="2026-08-27 기준" desc="10" x={14} y={7} w={6} h={5}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, flex: 1 }}>
              {MOCK_CHECK.map((c) => (
                <div
                  key={c.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    borderRadius: 8,
                    background: "var(--semantic-bg-light)",
                    padding: "12px 8px",
                  }}
                >
                  <span style={{ font: "var(--text-heading-2-semibold)", color: c.tone }}>
                    {c.count}
                    <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>건</span>
                  </span>
                  <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>{c.label}</span>
                </div>
              ))}
            </div>
            <OutlineButton variant="assistive" size="small" widthType="fixed">
              상세 보기
            </OutlineButton>
          </div>
        </Widget>
      </div>
    </div>
  );
}
