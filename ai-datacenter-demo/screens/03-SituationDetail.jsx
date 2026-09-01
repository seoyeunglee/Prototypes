// screen-03 · 이상 상황 상세 — 참조 이미지(확인 대기 상황 이벤트 상세페이지 1·6)와 동일 레이아웃·구성요소.
//   topBar(뒤로 가기) + header(제목·부제) + grid [1fr 400px]
//   main: AI 분석 결과(원인 가설+확신도 / 조치 가이드 — 회색 박스) · 관련 매뉴얼 · 유사 사례 요약(최대 3건)
//         → 상황 진행 단계(신규 카드, hideNew로 숨김) → 구성 이벤트(선택 단계 기준, 더보기)
//   side: 이상 상황 처리(장소·심각도·상태·진행 단계·구성 이벤트·발생 경과·담당자 + 안내·확인 시작 / 조치 완료 배너)
//   신규 요소(hideNew로 숨김): 진행 단계 행, 조치 가이드 순서 근거·계통 경로, 상황 진행 단계 카드, 원인 가설 아래 조치 시점 문장
//   "지금 조치하면 다음 단계를 막을 수 있는가"는 배지·용어 없이 원인 가설 아래 LLM 판단 문장으로만 표시한다 (2026-08-31 결정).
// Shadow Mode — 제어 버튼 없음.
import { Icon, StateBadge, ContentBadge, FillButton, TextButton } from "@idbrnd/design-system";
import { Card, CardHeader } from "../components/AppShell";
import { StageTimeline } from "../components/StageTimeline";
import TopologyPath from "../components/TopologyPath";

// 상황 진행 단계 — 라벨은 도메인 공통 인과 단계(전조·발단·확산·영향·피해), name·desc는 온톨로지(계통 지식) 기반 도메인 설명. 선택한 단계의 desc를 타임라인 아래에 표시한다.
const MOCK_STAGES = [
  { id: "observe", label: "전조", name: "관찰", at: "13:40", desc: "GPU 사용률이 13:40부터 오르기 시작했습니다. 냉각 유량과 랙 온도는 기준 범위 안에 있어 지켜보는 단계입니다." },
  { id: "load", label: "발단", name: "부하·전력 상승", at: "13:52", desc: "13:52 GPU 사용률 94%, 13:55 랙 전력 41.2kW로 기준을 넘었습니다. 냉각 유량이 부하를 따라 늘어나야 하는 시점입니다." },
  { id: "lag", label: "확산", name: "냉각 반응 지연", at: "14:07", desc: "14:07 냉각 유량이 118L/min으로 기준 123L/min을 회복하지 못했습니다. 밸브 개도 부족이 원인으로 추정되며, 지금 밸브 개도를 복구하면 랙 온도 상승을 막을 수 있습니다." },
  { id: "temp", label: "영향", name: "랙 온도 상승", at: null, desc: "랙 출구 온도가 기준 33.5°C를 넘어 계속 오르는 단계입니다. 아직 도달하지 않았습니다." },
  { id: "throttle", label: "피해", name: "성능 저하", at: null, desc: "GPU가 온도 보호로 성능을 낮추는 단계입니다. 아직 도달하지 않았습니다." },
];
const LOST_STAGE_DESC = "밸브 개도 데이터가 들어오지 않아 냉각이 반응하는지 알 수 없습니다. 마지막으로 확인된 단계(발단)까지만 표시하며, 밸브 상태는 현장 확인이 필요합니다.";

// 구성 이벤트 — 실제 FE 형식: 탐지유형명 / 장소 · 데이터 · 항목 · 시각 / 우측 관측값 · 기준 · ▲증감
const MOCK_EVENTS = {
  observe: [
    { name: "GPU 사용률 변화율 탐지", meta: ["GPU룸 A", "IT 텔레메트리", "gpu_util", "13:40"], value: "68", unit: "%", threshold: "44%", delta: "▲ 24%", dir: "up" },
  ],
  load: [
    { name: "GPU 사용률 변화율 탐지", meta: ["GPU룸 A", "IT 텔레메트리", "gpu_util", "13:52"], value: "94", unit: "%", threshold: "86%", delta: "▲ 8%", dir: "up" },
    { name: "랙 전력 임계치", meta: ["전기실", "전력 데이터", "active_power", "13:55"], value: "41.2", unit: "kW", threshold: "39.0kW", delta: "▲ 2.2kW", dir: "up" },
  ],
  lag: [
    { name: "냉각 유량 EWMA 탐지", meta: ["GPU룸 A", "유량 데이터", "flow", "14:07"], value: "118", unit: "L/min", threshold: "123L/min", delta: "▼ 5L/min", dir: "down" },
    { name: "밸브 개도 이상 탐지", meta: ["GPU룸 A", "밸브 데이터", "valve_pos", "14:07"], value: "42", unit: "%", threshold: "78%", delta: "▼ 36%", dir: "down", staleWhenLost: true },
    { name: "랙 출구 온도 임계치", meta: ["GPU룸 A", "온도 데이터", "temperature", "14:12"], value: "34.2", unit: "°C", threshold: "33.5°C", delta: "▲ 0.7°C", dir: "up" },
  ],
};

// 원인 가설 (LLM 판단 문구) — 상태별
const HYPOTHESIS = {
  normal:
    "13:52부터 GPU 사용률이 94%로 올랐고 랙 전력도 41.2kW까지 상승했습니다. 그러나 냉각 분기 2의 유량은 118L/min으로 기준 123L/min을 회복하지 못했습니다. 부하가 오르는데 냉각이 반응하지 않는 이 패턴은 냉각 반응 지연과 일치합니다. 원인은 2호 CDU 제어 밸브 개도 부족(42%, 기준 78%)으로 추정됩니다.",
  low:
    "GPU 사용률이 94%로 오른 뒤 냉각 유량이 118L/min으로 기준 123L/min에 못 미쳤습니다. 다만 유량 저하 폭이 기준 대비 4%에 그쳐 냉각 반응 지연 패턴과의 일치도가 낮습니다. 원인을 특정하기 어려우므로 현장 확인이 필요합니다.",
};

// 지금 조치하면 다음 단계를 막을 수 있는지 — 원인 가설 아래에 붙는 판단 문장 (텍스트 템플릿, 별도 용어·배지 없음)
const REACH_TEXT = {
  normal: "지금 밸브 개도를 복구하면 랙 온도 상승을 막을 수 있습니다. 시간이 갈수록 여유가 줄어듭니다.",
  low: "확신도가 낮아 지금 조치로 막을 수 있는지는 판단하지 않습니다.",
  lost: "냉각 계통 데이터가 끊겨 지금 조치로 막을 수 있는지 판단할 수 없습니다.",
};

const MOCK_GUIDES = [
  { text: "2호 CDU 제어 밸브(V-21) 개도 상태 확인", reason: "냉각수 공급 경로에서 랙보다 앞에 있는 설비입니다. 개도 42%가 기준 78%에 못 미칩니다." },
  { text: "순환 펌프 P-2 토출 압력·유량 확인", reason: "2호 CDU에 유량을 공급하는 설비입니다. 밸브가 정상이면 다음으로 확인합니다." },
  { text: "GPU 랙 A열 후면 온도 센서 상태 확인", reason: "앞의 두 설비가 정상이면 온도 측정값 자체를 확인합니다." },
];

const MOCK_CASES = [
  { date: "2026-06-18", title: "GPU룸 A 랙 A열 냉각 반응 지연", result: "밸브 액추에이터를 교체한 뒤 정상으로 복귀했습니다. 개도 지시값과 실제 개도 차이가 30% 이상이면 액추에이터를 먼저 점검합니다." },
  { date: "2026-04-02", title: "GPU룸 A 순환 펌프 P-1 유량 저하", result: "임펠러 이물질을 제거한 뒤 정상으로 복귀했습니다. 밸브가 정상인데 유량이 떨어지면 펌프 흡입 측을 점검합니다." },
  { date: "2026-01-27", title: "GPU룸 B 랙 B열 냉각 반응 지연", result: "현장 확인 결과 이상이 없었습니다. 유량계 순간 오지시로 판정해 센서를 재교정한 뒤 종료했습니다." },
];

function MetaRow({ label, value, strong }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <span style={{ width: 64, flexShrink: 0, font: "var(--text-label-1-regular)", color: "var(--semantic-text-sub)" }}>{label}</span>
      <span style={{ font: strong ? "var(--text-body-2-normal-semibold)" : "var(--text-body-2-normal-regular)", color: "var(--semantic-text-default)" }}>
        {value}
      </span>
    </div>
  );
}

const labelStyle = { font: "var(--text-label-1-regular)", color: "var(--semantic-text-sub)" };

export default function SituationDetail({
  onBack,
  onOpenRecord,
  selectedStage,
  onSelectStage,
  lowConfidence = false,
  coolingSignalLost = false,
  topologyMissing = false,
  assigned = false,
  completed = false,
  hideNew = false,
  onAssign,
}) {
  const currentIndex = coolingSignalLost ? 1 : 2;
  // 신호 단절 시 미도달 단계는 선택할 수 없으므로 마지막 확인 단계로 고정
  const effectiveStage = coolingSignalLost ? Math.min(selectedStage ?? currentIndex, currentIndex) : selectedStage;
  const stage = MOCK_STAGES[effectiveStage] || MOCK_STAGES[2];
  // 구성 이벤트는 관측된 이벤트를 그대로 보여 준다 — 신호 단절 시에도 "수집 없음" 이벤트가 목록에 남아야 감시 공백이 드러난다
  const stageId = (MOCK_STAGES[selectedStage] || MOCK_STAGES[2]).id;
  const events = MOCK_EVENTS[stageId] || MOCK_EVENTS.lag;
  const confidence = lowConfidence ? 52 : 87;
  const severity = lowConfidence ? { label: "낮음", variant: "basic" } : { label: "높음", variant: "error" };
  const status = completed ? "조치 완료" : assigned ? "확인 중" : "확인 대기";
  const reachText = coolingSignalLost ? REACH_TEXT.lost : lowConfidence ? REACH_TEXT.low : REACH_TEXT.normal;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div>
        <button type="button" onClick={onBack}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "transparent", cursor: "pointer", padding: 0, font: "var(--text-label-1-regular)", color: "var(--semantic-text-sub)" }}>
          <Icon name="chevron-left" size={16} color="var(--semantic-text-sub)" />
          뒤로 가기
        </button>
      </div>

      <header style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
        <h1 style={{ margin: 0, font: "var(--text-title-2-semibold)", color: "var(--semantic-text-strong)" }}>GPU룸 A 랙 A열 냉각 반응 지연</h1>
        <p style={{ margin: 0, font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-sub)" }}>
          이상 상황의 원인을 파악하기 위한 정밀 분석 데이터입니다. 검토 후 우측 패널에서 조치 상태를 업데이트해 주세요.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 400px", gap: 20 }}>
        {/* ── main ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40, minWidth: 0 }}>
          {/* AI 분석 결과 */}
          <section data-desc="17">
            <Card>
              <CardHeader icon="ai-brain" title="AI 분석 결과" />
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* 원인 가설 + 조치 가이드 — 회색 박스 */}
                <div style={{ background: "var(--semantic-bg-light)", borderRadius: 8, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={labelStyle}>원인 가설</span>
                      <span data-desc="19" style={{ display: "inline-flex" }}>
                        {lowConfidence ? (
                          <ContentBadge size="compact" backgroundColor="var(--semantic-content-warning-extra-light)" contentColor="var(--semantic-content-warning-default)">확신도 {confidence}%</ContentBadge>
                        ) : (
                          <ContentBadge variant="primary" size="compact">확신도 {confidence}%</ContentBadge>
                        )}
                      </span>
                    </div>
                    <p data-desc="18" style={{ margin: 0, font: "var(--text-body-2-reading-regular)", color: "var(--semantic-text-default)" }}>
                      {lowConfidence ? HYPOTHESIS.low : HYPOTHESIS.normal}
                    </p>
                    {!hideNew && (
                      <p data-desc="16" style={{ margin: 0, font: "var(--text-body-2-reading-regular)", color: "var(--semantic-text-default)" }}>
                        {reachText}
                      </p>
                    )}
                    {lowConfidence && (
                      <div data-desc="26" style={{ padding: "10px 12px", borderRadius: 8, background: "var(--semantic-content-warning-extra-light)", color: "var(--semantic-text-default)", font: "var(--text-label-2-reading-regular)" }}>
                        확신도가 낮아 심각도를 낮음으로 판정했습니다. 현장 확인이 필요합니다.
                      </div>
                    )}
                  </div>

                  <div data-desc="22" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <span style={labelStyle}>조치 가이드</span>
                    {topologyMissing ? (
                      <div data-desc="23" style={{ font: "var(--text-body-2-reading-regular)", color: "var(--semantic-text-sub)" }}>
                        이 구역은 계통 연결이 등록되지 않아 점검 순서를 제시할 수 없습니다. 기본 조치 가이드를 확인해 주세요.
                      </div>
                    ) : (
                      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                        {MOCK_GUIDES.map((g, i) => (
                          <li key={g.text} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--semantic-natural-deep)", color: "var(--semantic-text-on-dark)", font: "var(--text-caption-2-semibold)" }}>
                              {i + 1}
                            </span>
                            <span style={{ minWidth: 0 }}>
                              <span style={{ font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-default)" }}>{g.text}</span>
                              {!hideNew && (
                                <span data-desc="24" style={{ display: "block", marginTop: 2, font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-sub)" }}>{g.reason}</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                    {!topologyMissing && !hideNew && <TopologyPath desc="67" />}
                  </div>
                </div>

                {/* 관련 매뉴얼 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={labelStyle}>관련 매뉴얼</span>
                  <div>
                    <button data-desc="25" type="button" style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer" }}>
                      <ContentBadge size="default" backgroundColor="var(--semantic-bg-default)" borderColor="var(--semantic-line-default)" contentColor="var(--semantic-text-default)">
                        냉각_계통_운전_절차_SOP.pdf
                      </ContentBadge>
                    </button>
                  </div>
                </div>

                {/* 유사 사례 요약 */}
                <div data-desc="27" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={labelStyle}>유사 사례 요약 (최대 3건)</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {MOCK_CASES.map((c) => (
                      <div key={c.date} style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 12 }}>
                        <span style={{ font: "var(--text-label-1-regular)", color: "var(--semantic-text-sub)" }}>{c.date}</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{ font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-default)" }}>{c.title}</span>
                          <span style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <StateBadge size="compact" variant="success">결과</StateBadge>
                            <span style={{ font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-default)" }}>{c.result}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* 상황 진행 단계 — 신규 카드 (구성 이벤트 위에 둔다: 단계 선택이 아래 목록을 바꾼다) */}
          {!hideNew && (
            <section data-desc="13">
              <Card>
                <CardHeader icon="dashboard-square-chart-gantt" title="상황 진행 단계" />
                <StageTimeline stages={MOCK_STAGES} currentIndex={currentIndex} selectedIndex={effectiveStage} onSelectStage={onSelectStage} desc="15" />
                {/* 선택 단계 설명 — 온톨로지(계통 지식) 기반 문장. 신호 단절 시 판정 불가 안내로 대체 */}
                <div data-desc="14" style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: coolingSignalLost ? "var(--semantic-content-warning-extra-light)" : "var(--semantic-bg-light)", font: "var(--text-body-2-reading-regular)", color: "var(--semantic-text-default)" }}>
                  {coolingSignalLost ? (
                    LOST_STAGE_DESC
                  ) : (
                    <>
                      <b>{stage.label} · {stage.name}</b>
                      <span style={{ display: "block", marginTop: 4 }}>{stage.desc}</span>
                    </>
                  )}
                </div>
                <div style={{ marginTop: 8, font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
                  단계를 누르면 그 단계의 설명과 구성 이벤트를 볼 수 있습니다.
                </div>
              </Card>
            </section>
          )}

          {/* 구성 이벤트 */}
          <section data-desc="20">
            <h2 style={{ margin: "0 0 12px", font: "var(--text-heading-2-semibold)", color: "var(--semantic-text-default)" }}>구성 이벤트</h2>
            <Card padding="4px 24px 12px">
              {events.map((e, i) => {
                const stale = coolingSignalLost && e.staleWhenLost;
                return (
                  <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderTop: i === 0 ? "none" : "1px solid var(--semantic-line-default)" }}>
                    <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-default)" }}>{e.name}</span>
                        {stale && (
                          <span data-desc="21" style={{ display: "inline-flex" }}>
                            <StateBadge size="compact" variant="warning">수집 없음</StateBadge>
                          </span>
                        )}
                      </span>
                      <span style={{ display: "flex", gap: 10 }}>
                        {e.meta.map((m) => (
                          <span key={m} style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>{m}</span>
                        ))}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, whiteSpace: "nowrap" }}>
                      <span style={{ font: "var(--text-body-2-normal-semibold)", color: "var(--semantic-text-default)", fontVariantNumeric: "tabular-nums" }}>
                        {stale ? "-" : `${e.value}`}
                        <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}> / {e.threshold}</span>
                      </span>
                      {!stale && (
                        <span style={{ font: "var(--text-label-2-regular)", color: e.dir === "up" ? "var(--semantic-content-danger-default)" : "var(--semantic-content-informative-default)" }}>{e.delta}</span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 8, borderTop: "1px solid var(--semantic-line-default)" }}>
                <TextButton variant="assistive" size="small">
                  더보기
                  <Icon name="chevron-down" size={14} color="var(--semantic-text-sub)" />
                </TextButton>
              </div>
            </Card>
          </section>
        </div>

        {/* ── side — 이상 상황 처리 패널 ── */}
        <aside>
          <Card desc="30" style={{ position: "sticky", top: 0 }}>
            <h2 style={{ margin: "0 0 20px", font: "var(--text-heading-2-semibold)", color: "var(--semantic-text-default)" }}>이상 상황 처리</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              <MetaRow label="장소" value="GPU룸 A" />
              <MetaRow label="심각도" value={<StateBadge variant={severity.variant} size="compact">{severity.label}</StateBadge>} />
              <MetaRow label="상태" value={status} />
              {!hideNew && <MetaRow label="진행 단계" value={`${MOCK_STAGES[currentIndex].label} (${MOCK_STAGES[currentIndex].name})`} strong />}
              <MetaRow label="구성 이벤트" value="12건" />
              <MetaRow label="발생 경과" value={completed ? "3시간 46분" : "3시간 22분"} />
              {(assigned || completed) && <MetaRow label="담당자" value="김도현" strong />}
            </div>

            {completed ? (
              <div style={{ padding: "12px 16px", borderRadius: 8, background: "var(--semantic-content-success-extra-light)", border: "1px solid var(--semantic-content-success-light)", font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-default)" }}>
                조치 이력이 완료됐습니다. 처리 결과가 기록됩니다.
              </div>
            ) : !assigned ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ padding: "12px 16px", borderRadius: 8, background: coolingSignalLost ? "var(--semantic-content-warning-extra-light)" : "var(--semantic-bg-light)", border: coolingSignalLost ? "none" : "1px solid var(--semantic-line-default)", font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-default)" }}>
                  {coolingSignalLost
                    ? "밸브 개도 데이터가 끊겨 냉각 상태를 확인할 수 없습니다. 현장에서 밸브 상태를 먼저 확인해 주세요. 확인 시작 시 담당자로 지정됩니다."
                    : "AI 분석 결과를 검토한 후 현장으로 출동하세요. 확인 시작 시 담당자로 지정됩니다."}
                </div>
                <FillButton variant="primary" size="large" widthType="flexible" onClick={onAssign}>확인 시작</FillButton>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ padding: "12px 16px", borderRadius: 8, background: "var(--semantic-primary-extra-light)", font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-default)" }}>
                  <b>김도현</b>(이)가 담당자로 지정되어 확인 중입니다.
                </div>
                <FillButton variant="primary" size="large" widthType="flexible" onClick={onOpenRecord}>지금 조치 기록하기</FillButton>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
