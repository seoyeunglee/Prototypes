// screen-03 · 이상 상황 상세 — 실제 FE AbnormalSituationDetail 구조를 따른다.
//   topBar(뒤로 가기) + header(제목·부제) + layout grid [1fr 460px]
//   main: AI 분석 결과 + 구성 이벤트 → 위험 진행 단계 (설비 그룹 분석은 기술 검증 뷰 전용 — 2026-08-27 상세에서 제거)
//   side: 이상 상황 처리 패널(메타 목록 + 확인 시작 + 배너)
// Shadow Mode — 제어 버튼 없음.
import { Icon, StateBadge, ContentBadge, FillButton } from "@idbrnd/design-system";
import { Card, CardHeader } from "../components/AppShell";
import { StageTimeline, ReachBadge } from "../components/StageTimeline";
import TopologyPath from "../components/TopologyPath";

const MOCK_STAGES = [
  { id: "observe", label: "관찰 구간", at: "10:42" },
  { id: "load", label: "부하·전력 상승", at: "10:58" },
  { id: "lag", label: "냉각 반응 지연", at: "11:05" },
  { id: "temp", label: "랙 온도 상승", at: null },
  { id: "throttle", label: "성능 저하", at: null },
];

// 구성 이벤트 — FE EventListCard 형식: 탐지유형명 + 메타 / 우측 관측값·기준·증감
const MOCK_EVENTS = {
  observe: [
    { name: "GPU 사용률 변화율 탐지", meta: ["IT 텔레메트리", "10:42"], value: "68", unit: "%", threshold: "직전 30분 평균 44%", delta: "up" },
  ],
  load: [
    { name: "GPU 사용률 변화율 탐지", meta: ["IT 텔레메트리", "10:58"], value: "91", unit: "%", threshold: "직전 30분 평균 52%", delta: "up" },
    { name: "랙 전력 임계치 탐지", meta: ["분전반 A-1", "10:59"], value: "40.1", unit: "kW", threshold: "38 kW", delta: "up" },
  ],
  lag: [
    { name: "냉각 유량 추세 이탈 탐지", meta: ["2호 CDU", "11:05"], value: "118", unit: "L/min", threshold: "140 L/min", delta: "down" },
    { name: "밸브 개도 이상 탐지", meta: ["2호 CDU 제어 밸브", "11:05"], value: "62", unit: "%", threshold: "85%", delta: "down", stale: true },
    { name: "랙 출구 온도 임계치 탐지", meta: ["GPU 랙 A열", "11:07"], value: "34.2", unit: "℃", threshold: "32℃", delta: "up" },
  ],
};

const MOCK_GUIDES = [
  { text: "2호 CDU 제어 밸브 개도 상태 확인", reason: "냉각수 공급 경로에서 랙보다 앞에 있습니다. 개도가 기준에 못 미칩니다." },
  { text: "순환 펌프 P-2 토출 압력·유량 확인", reason: "2호 CDU에 유량을 공급합니다. 밸브가 정상이면 다음으로 확인합니다." },
  { text: "GPU 랙 A열 후면 온도 센서 상태 확인", reason: "앞의 두 설비가 정상이면 측정 자체를 확인합니다." },
];

const MOCK_CASES = [
  { date: "2026-06-18", title: "A열 CDU 밸브 개도 부족으로 인한 랙 온도 상승", result: "밸브 액추에이터 교체 후 정상 복귀" },
  { date: "2026-04-02", title: "순환 펌프 P-1 유량 저하", result: "임펠러 이물질 제거 후 정상 복귀" },
  { date: "2026-01-27", title: "B열 냉각 반응 지연", result: "현장 확인 결과 이상 없음" },
];

function MetaRow({ label, value, strong }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <span style={{ font: "var(--text-label-1-regular)", color: "var(--semantic-text-sub)" }}>{label}</span>
      <span
        style={{
          font: strong ? "var(--text-body-2-normal-semibold)" : "var(--text-body-2-normal-regular)",
          color: "var(--semantic-text-default)",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function SituationDetail({
  onBack,
  onOpenRecord,
  selectedStage,
  onSelectStage,
  lowConfidence,
  coolingSignalLost,
  topologyMissing,
  assigned,
  onAssign,
}) {
  const currentIndex = coolingSignalLost ? 1 : 2;
  const stageId = MOCK_STAGES[selectedStage]?.id || "lag";
  const events = MOCK_EVENTS[stageId] || MOCK_EVENTS.lag;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* topBar — FE: 뒤로 가기 텍스트 버튼 */}
      <div>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 0,
            font: "var(--text-body-2-normal-regular)",
            color: "var(--semantic-text-sub)",
          }}
        >
          <Icon name="chevron-left" size={18} color="var(--semantic-text-sub)" />
          뒤로 가기
        </button>
      </div>

      {/* header — 제목 + 안내 부제 (FE 원문 문구) */}
      <header style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
        <h1 style={{ margin: 0, font: "var(--text-title-2-semibold)", color: "var(--semantic-text-strong)" }}>
          GPU 랙 A열 냉각 반응 지연
        </h1>
        <p style={{ margin: 0, font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-sub)" }}>
          이상 상황의 원인을 파악하기 위한 정밀 분석 데이터입니다. 검토 후 우측 패널에서 조치 상태를 업데이트해 주세요.
        </p>
      </header>

      {/* layout — [1fr 460px] gap 20 */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 460px", gap: 20 }}>
        {/* ── main ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40, minWidth: 0 }}>


          {/* AI 분석 결과 (FE AnalysisCard) */}
          <section data-desc="17">
            <Card>
              <CardHeader icon="ai-brain" title="AI 분석 결과" />
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* 원인 가설 + 확신도 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-sub)" }}>
                      원인 가설
                    </span>
                    {!lowConfidence && (
                      <span data-desc="19" style={{ display: "inline-flex" }}>
                        <ContentBadge variant="primary" size="compact">확신도 87%</ContentBadge>
                      </span>
                    )}
                  </div>
                  <p data-desc="18" style={{ margin: 0, font: "var(--text-body-2-reading-regular)", color: "var(--semantic-text-default)" }}>
                    GPU 부하가 오른 뒤 냉각 유량이 따라오지 않는 패턴이 냉각 반응 지연과 일치합니다. 2호 CDU 제어
                    밸브 개도 부족이 원인으로 추정됩니다.
                  </p>
                  {lowConfidence && (
                    <div
                      data-desc="26"
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: "var(--semantic-content-warning-extra-light)",
                        color: "var(--semantic-text-default)",
                        font: "var(--text-body-2-reading-regular)",
                      }}
                    >
                      확신도가 낮아 개입 여지를 표시하지 않습니다. 현장 확인이 필요합니다.
                    </div>
                  )}
                </div>

                {/* 조치 가이드 — 번호 단계 + 순서 근거(FN-4) */}
                <div data-desc="22" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-sub)" }}>
                    조치 가이드
                  </span>
                  {topologyMissing ? (
                    <div data-desc="23" style={{ font: "var(--text-body-2-reading-regular)", color: "var(--semantic-text-sub)" }}>
                      이 구역은 계통 연결이 등록되지 않아 점검 순서를 제시할 수 없습니다. 기본 조치 가이드를 확인해
                      주세요.
                    </div>
                  ) : (
                    <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                      {MOCK_GUIDES.map((g, i) => (
                        <li key={g.text} style={{ display: "flex", gap: 8 }}>
                          <span
                            style={{
                              flexShrink: 0,
                              width: 20,
                              height: 20,
                              borderRadius: 999,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "var(--semantic-bg-light)",
                              color: "var(--semantic-text-default)",
                              font: "var(--text-label-2-semibold)",
                            }}
                          >
                            {i + 1}
                          </span>
                          <span style={{ minWidth: 0 }}>
                            <span style={{ font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-default)" }}>
                              {g.text}
                            </span>
                            <span
                              data-desc="24"
                              style={{ display: "block", marginTop: 2, font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-sub)" }}
                            >
                              {g.reason}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {!topologyMissing && <TopologyPath desc="67" />}
                </div>

                {/* 관련 매뉴얼 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-sub)" }}>
                    관련 매뉴얼
                  </span>
                  <div>
                    <button
                      data-desc="25"
                      type="button"
                      style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
                    >
                      <ContentBadge
                        size="default"
                        backgroundColor="var(--semantic-bg-default)"
                        borderColor="var(--semantic-line-default)"
                        contentColor="var(--semantic-text-default)"
                      >
                        <Icon name="document-text" size={16} color="var(--semantic-text-sub)" />
                        냉각 계통 운전 절차 — 4.2 CDU 밸브 점검
                      </ContentBadge>
                    </button>
                  </div>
                </div>

                {/* 유사 사례 */}
                <div data-desc="27" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-sub)" }}>
                    유사 사례
                  </span>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {MOCK_CASES.map((c, i) => (
                      <div
                        key={c.date}
                        style={{
                          padding: "10px 0",
                          borderTop: i === 0 ? "none" : "1px solid var(--semantic-line-default)",
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                          <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)", whiteSpace: "nowrap" }}>
                            {c.date}
                          </span>
                          <span style={{ font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-default)" }}>
                            {c.title}
                          </span>
                        </div>
                        <div style={{ marginTop: 2, font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
                          결과 · {c.result}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* 구성 이벤트 (FE EventListCard) — 판단 근거(FN-2)를 이 형식으로 제시 */}
          <section data-desc="20">
            <h2 style={{ margin: "0 0 12px", font: "var(--text-heading-2-semibold)", color: "var(--semantic-text-default)" }}>
              구성 이벤트
            </h2>
            <Card padding="12px 24px">
              {events.map((e, i) => (
                <div
                  key={e.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 0",
                    borderTop: i === 0 ? "none" : "1px solid var(--semantic-line-default)",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ font: "var(--text-body-2-normal-semibold)", color: "var(--semantic-text-default)" }}>
                        {e.name}
                      </span>
                      {e.stale && (
                        <span data-desc="21" style={{ display: "inline-flex" }}>
                          <StateBadge size="compact" variant="warning">수집 없음</StateBadge>
                        </span>
                      )}
                    </span>
                    <span style={{ display: "flex", gap: 8 }}>
                      {e.meta.map((m) => (
                        <span key={m} style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
                          {m}
                        </span>
                      ))}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, whiteSpace: "nowrap" }}>
                    <span style={{ font: "var(--text-body-1-normal-semibold)", color: "var(--semantic-text-default)", fontVariantNumeric: "tabular-nums" }}>
                      {e.stale ? "-" : `${e.value}${e.unit}`}
                    </span>
                    <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
                      / {e.threshold}
                    </span>
                    {!e.stale && (
                      <Icon
                        name={e.delta === "up" ? "arrow-up" : "arrow-down"}
                        size={14}
                        color={
                          e.delta === "up"
                            ? "var(--semantic-content-danger-default)"
                            : "var(--semantic-content-informative-default)"
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
            </Card>
          </section>

          {/* 위험 진행 단계 (FN-1 신규 카드) */}
          <section data-desc="13">
            <Card>
              <CardHeader
                icon="dashboard-square-chart-gantt"
                title="위험 진행 단계"
                right={!coolingSignalLost && !lowConfidence ? <ReachBadge level="narrowing" desc="16" /> : null}
              />
              <StageTimeline
                stages={MOCK_STAGES}
                currentIndex={currentIndex}
                halted={coolingSignalLost}
                selectedIndex={selectedStage}
                onSelectStage={onSelectStage}
                desc="15"
              />
              <div style={{ marginTop: 8, font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
                단계를 선택하면 위 구성 이벤트가 해당 단계 기준으로 표시됩니다.
              </div>
            </Card>
          </section>

        </div>

        {/* ── side 460px — 이상 상황 처리 패널 (FE ProcessingPanel) ── */}
        <aside>
          <Card desc="30" style={{ position: "sticky", top: 0 }}>
            <h2 style={{ margin: "0 0 16px", font: "var(--text-heading-2-semibold)", color: "var(--semantic-text-default)" }}>
              이상 상황 처리
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <MetaRow label="장소" value="GPU룸 A" />
              <MetaRow
                label="심각도"
                value={<StateBadge variant="error" size="compact">심각도 높음</StateBadge>}
              />
              <MetaRow label="상태" value={assigned ? "확인 중" : "확인 대기"} strong />
              <MetaRow label="진행 단계" value={MOCK_STAGES[currentIndex].label} strong />
              <MetaRow
                label="개입 여지"
                value={
                  coolingSignalLost ? (
                    <span style={{ font: "var(--text-label-1-regular)", color: "var(--semantic-text-sub)" }}>
                      판정 중단
                    </span>
                  ) : lowConfidence ? (
                    <span style={{ font: "var(--text-label-1-regular)", color: "var(--semantic-text-sub)" }}>
                      현장 확인 필요
                    </span>
                  ) : (
                    <ReachBadge level="narrowing" />
                  )
                }
              />
              <MetaRow label="구성 이벤트" value="12건" />
              <MetaRow label="발생 경과" value="3시간 10분" />
              {assigned && <MetaRow label="담당자" value="김도현 (나)" strong />}
            </div>

            {!assigned ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 8,
                    background: "var(--semantic-bg-light)",
                    font: "var(--text-body-2-reading-regular)",
                    color: "var(--semantic-text-default)",
                  }}
                >
                  AI 분석 결과를 검토한 후 현장으로 출동하세요. 확인 시작 시 담당자로 지정됩니다.
                </div>
                <FillButton variant="primary" size="medium" widthType="fixed" onClick={onAssign}>
                  확인 시작
                </FillButton>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 8,
                    background: "var(--semantic-primary-extra-light)",
                    font: "var(--text-body-2-reading-regular)",
                    color: "var(--semantic-text-default)",
                  }}
                >
                  <b>김도현</b>(이)가 담당자로 지정되어 확인 중입니다.
                </div>
                <FillButton variant="primary" size="medium" widthType="fixed" onClick={onOpenRecord}>
                  지금 조치 기록하기
                </FillButton>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
