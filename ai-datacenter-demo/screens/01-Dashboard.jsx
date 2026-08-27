// screen-01 · 대시보드 — 실제 FE 그리드·위젯 규격을 따른다.
//   그리드: 20열 × 12행, 마진 [12, 16] (DashboardGrid.jsx: cols=20, GRID_MAX_ROWS=12)
//   배치는 기존 화면 구성(12행을 채우는 대시보드)을 참고해 에디터가 리사이즈한 상태를 가정:
//   목록 6×12(좌측 세로 패널) · 센서 7×4 · 추이 7×4 · 배치도 7×8 · 요약 7×3 · 확인 현황 7×5
//   기본 규격(widgetSize.js): abnormalSituationList 5×4 · sensorAvgComparison 5×4 · timeTrend 5×4
//   · detectionStatusCard 5×4 · anomalySummary 6×2 · layout 5×5 — 데모 가독성을 위해 확장
//   실시간 센서 변동 모니터링은 실제 TempBarChart 형태(σ 막대, 기준선 100, 120↑ danger)를 재현한다.
import { Icon, BasicIconButton, StateBadge, Tab } from "@idbrnd/design-system";
import { useState } from "react";
import { ReachBadge } from "../components/StageTimeline";
import { SigmaBarChart, BarSeries, RatioBars } from "../components/Charts";
import FloorPlan from "../components/FloorPlan";

// 그리드 상수 — 실제 FE DashboardGrid와 동일
const GRID_COLS = 20;
const GRID_MARGIN = [12, 16];
const ROW_HEIGHT = 46; // 실제는 컨테이너 높이에서 계산. 데모는 고정값

const MOCK_SIGMA_ITEMS = [
  // value = 100 + Z×10 (σ=0이면 1로 계산). 120 이상은 danger 색으로 표시된다
  { name: "GPU 사용률", value: 138, current: "94%", avg: "62%", range: "38% ~ 86%" },
  { name: "랙 전력", value: 128, current: "41.2kW", avg: "33.4kW", range: "27.8kW ~ 39.0kW" },
  { name: "냉각 유량", value: 74, current: "118L/min", avg: "140L/min", range: "123L/min ~ 157L/min" },
  { name: "공급 압력", value: 96, current: "2.1bar", avg: "2.2bar", range: "1.9bar ~ 2.5bar" },
  { name: "랙 출구 온도", value: 124, current: "34.2도", avg: "30.1도", range: "26.7도 ~ 33.5도" },
];

const MOCK_SITUATIONS = [
  {
    id: "SIT-2481",
    isNew: true,
    severity: "HIGH",
    title: "GPU 랙 A열 냉각 반응 지연",
    stage: "냉각 반응 지연",
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
    stage: "부하·전력 상승",
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
    stage: "관찰 구간",
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
    stage: "랙 온도 상승",
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
const STATUS_TABS = ["전체", "확인 대기", "확인 중", "조치 완료"];

const MOCK_HOURLY = [
  { label: "07", value: 0 }, { label: "08", value: 1 }, { label: "09", value: 0 },
  { label: "10", value: 2 }, { label: "11", value: 3 }, { label: "12", value: 1 },
  { label: "13", value: 0 }, { label: "14", value: 1 }, { label: "15", value: 2 },
];

const MOCK_CHECK = [
  { label: "확인 대기", value: 2, color: "var(--category-001)" },
  { label: "확인 중", value: 1, color: "var(--category-002)" },
  { label: "조치 완료", value: 5, color: "var(--category-003)" },
];

const MOCK_SUMMARY = [
  { label: "냉각 반응 지연", value: 4, color: "var(--category-005)" },
  { label: "전력 임계치", value: 2, color: "var(--category-009)" },
  { label: "온도 임계치", value: 2, color: "var(--category-001)" },
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
        <Icon name={icon} size={20} color="var(--semantic-text-default)" />
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

// 이상 상황 목록 항목 — FE SituationListItem 구조 + 진행 단계·개입 여지(신규)
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
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 6px",
                borderRadius: 4,
                background: "var(--semantic-text-default)",
                color: "var(--semantic-natural-white)",
                font: "var(--text-caption-1-semibold)",
              }}
            >
              New
            </span>
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
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: 4,
              background: "var(--semantic-bg-light)",
              border: "1px solid var(--semantic-line-default)",
              font: "var(--text-label-2-regular)",
              color: "var(--semantic-text-default)",
            }}
          >
            {s.stage}
          </span>
          {coolingSignalLost && s.id === "SIT-2481" ? (
            <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
              판정 중단
            </span>
          ) : lowConfidence && s.status !== "조치 완료" ? (
            <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
              현장 확인 필요
            </span>
          ) : (
            <ReachBadge level={s.reach} />
          )}
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

  // 시뮬레이터 반영 — 냉각 신호 단절: 대상 상황은 직전 단계 유지, 냉각 유량 신호는 수집 없음
  const situations = MOCK_SITUATIONS.map((s) =>
    s.id === "SIT-2481" && coolingSignalLost ? { ...s, stage: "부하·전력 상승" } : s
  );
  const sigmaItems = MOCK_SIGMA_ITEMS.map((it) =>
    it.name === "냉각 유량" && coolingSignalLost ? { ...it, stale: true } : it
  );
  const filtered = situations.filter((s) => statusTab === "전체" || s.status === statusTab);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ margin: 0, font: "var(--text-title-1-semibold)", color: "var(--semantic-text-strong)" }}>
        대시보드
      </h1>

      {/* 실제 FE 그리드: 20열, 마진 [12,16], 위젯은 widgetSize.js 기본 규격으로 스팬 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
          gridAutoRows: ROW_HEIGHT,
          columnGap: GRID_MARGIN[0],
          rowGap: GRID_MARGIN[1],
        }}
      >
        {/* 이상 상황 목록 — 기본 5×4를 데모 가독성 위해 6×12 세로 패널로 확장 */}
        <Widget icon="dashboard-detection" title="이상 상황 목록" meta="2026-08-27 기준" desc="7" x={0} y={0} w={6} h={12}>
          <div data-desc="60" style={{ marginBottom: 4, position: "sticky", top: 0, background: "var(--semantic-bg-default)", zIndex: 1 }}>
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
          {filtered.map((s) => (
            <SituationItem
              key={s.id}
              s={s}
              onOpen={onOpenSituation}
              lowConfidence={lowConfidence}
              coolingSignalLost={coolingSignalLost}
            />
          ))}
        </Widget>

        {/* 실시간 센서 변동 모니터링 — sensorAvgComparison 5×4, 실제 σ 막대 차트 형태 */}
        <Widget
          icon="dashboard-square-activity"
          title="실시간 센서 변동 모니터링"
          desc="4"
          x={6}
          y={0}
          w={7}
          h={4}
          right={
            <span data-desc="5" style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)", whiteSpace: "nowrap" }}>
              5초마다 갱신
            </span>
          }
        >
          <SigmaBarChart items={sigmaItems} height={132} />
        </Widget>

        {/* 시간대별 이상 발생 추이 — timeTrend 5×4 */}
        <Widget dimmed icon="dashboard-history" title="시간대별 이상 발생 추이" desc="11" x={13} y={0} w={7} h={4}>
          <div style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)", marginBottom: 4 }}>
            (발생 건수)
          </div>
          <BarSeries data={MOCK_HOURLY} height={110} color="var(--semantic-natural-deep)" />
        </Widget>

        {/* 이상 탐지 발생 요약 — anomalySummary 6×2 */}
        <Widget dimmed icon="dashboard-graph" title="이상 탐지 발생 요약" desc="9" x={13} y={4} w={7} h={3}>
          <RatioBars data={MOCK_SUMMARY} />
        </Widget>

        {/* 탐지 확인 현황 — detectionStatusCard 5×4 */}
        <Widget dimmed icon="dashboard-book-check" title="탐지 확인 현황" desc="10" x={13} y={7} w={7} h={5}>
          <RatioBars data={MOCK_CHECK} />
        </Widget>

        {/* 배치도 — layout 5×5, 더미 도면 SVG + 비콘 */}
        <Widget dimmed icon="dashboard-map" title="배치도" meta="GPU룸 A" desc="12" x={6} y={4} w={7} h={8}>
          <FloorPlan beacons={MOCK_BEACONS} />
        </Widget>
      </div>
    </div>
  );
}
