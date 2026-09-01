// screen-04 · 조치 이력 기록 — 참조 이미지(상세페이지 2~5)와 동일 레이아웃·구성요소.
//   topBar "← 이상 상황 상세 페이지로" + header(제목·부제)
//   main: 이상 상황 요약 · 이벤트 구성 차트(탐지 유형 구성 파이 / 시간대별 발생 건수 누적 막대) · 유사 사례 참고
//   side: 기록 입력 — 진행 바 + 단계 N/4 · 조치 요약 제목(편집) · 단계 태그(AI 추천) · 직접 태그 추가
//         · 에이전트 종합 분석 리포트(아코디언, 단계별 내용) · 이전/다음·처리 완료 · 이상 없음으로 상황 종료
//   신규(hideNew로 숨김 가능): 4/4 하단 "예측 결과 확인" 섹션(Radio 3택), 리포트 내 조치 시점 판단 문구
import { useState } from "react";
import { Icon, StateBadge, ContentBadge, FillButton, OutlineButton, WeakButton, TextButton, Chip, ChipGroup, Radio } from "@idbrnd/design-system";
import { Card } from "../components/AppShell";

const STEPS = ["현상", "원인", "조치", "추가 설명"];

// 단계별 AI 추천 태그(첫 항목이 AI 추천) — 데이터센터 문안(예시)
const MOCK_TAGS = {
  현상: [{ t: "냉각 반응 지연", ai: true }, { t: "랙 온도 상승" }, { t: "유량 저하" }],
  원인: [{ t: "제어 밸브 개도 부족", ai: true }, { t: "펌프 토출 압력 저하" }, { t: "유량계 오지시" }],
  조치: [{ t: "밸브 개도 수동 조정", ai: true }, { t: "펌프 점검" }, { t: "온도 센서 점검" }],
};

const SUMMARY = { place: "GPU룸 A", severity: "높음", elapsed: "3시간 22분", title: "GPU룸 A 랙 A열 냉각 반응 지연" };

// 탐지 유형 구성 — 구성 이벤트 12건의 유형 분포. 상세 화면 구성 이벤트 목록의 5개 탐지 유형과 일치시킨다
const TYPE_MIX = [
  { label: "GPU 사용률 변화율 탐지", count: 4, color: "var(--category-001)" },
  { label: "냉각 유량 EWMA 탐지", count: 3, color: "var(--category-003)" },
  { label: "랙 출구 온도 임계치", count: 2, color: "var(--category-005)" },
  { label: "랙 전력 임계치", count: 2, color: "var(--category-007)" },
  { label: "밸브 개도 이상 탐지", count: 1, color: "var(--category-009)" },
];
const HOURLY = [
  { label: "13:00", parts: [2, 0, 0, 1, 0] },
  { label: "14:00", parts: [1, 2, 1, 1, 1] },
  { label: "15:00", parts: [1, 1, 1, 0, 0] },
];

const SIMILAR = [
  { date: "2026-06-18", title: "GPU룸 A 랙 A열 냉각 반응 지연", result: "밸브 액추에이터를 교체한 뒤 정상으로 복귀했습니다. 개도 지시값과 실제 개도 차이가 30% 이상이면 액추에이터를 먼저 점검합니다." },
  { date: "2026-04-02", title: "GPU룸 A 순환 펌프 P-1 유량 저하", result: "임펠러 이물질을 제거한 뒤 정상으로 복귀했습니다. 밸브가 정상인데 유량이 떨어지면 펌프 흡입 측을 점검합니다." },
  { date: "2026-01-27", title: "GPU룸 B 랙 B열 냉각 반응 지연", result: "현장 확인 결과 이상이 없었습니다. 유량계 순간 오지시로 판정해 센서를 재교정한 뒤 종료했습니다." },
];

// 에이전트 종합 분석 리포트 — LLM 판단 문구 (editorial 검토 반영 2026-08-31)
const REPORT = {
  pattern: "13:52부터 GPU 사용률이 94%로 올랐고 랙 전력도 41.2kW까지 상승했습니다. 그러나 냉각 분기 2의 유량은 118L/min으로 기준 123L/min을 회복하지 못했습니다. 부하가 오르는데 냉각이 반응하지 않는 이 패턴은 냉각 반응 지연과 87% 일치합니다.",
  reach: "확인 시작 시점(14:10) 기준으로 지금 밸브 개도를 복구하면 랙 온도 상승을 막을 수 있습니다. 시간이 갈수록 여유가 줄어듭니다.",
  cause: "2호 CDU 제어 밸브 개도가 42%로 기준 78%에 못 미쳐 유량이 회복되지 않았습니다. 펌프 토출 압력은 정상 범위입니다. 원인은 밸브 개도 부족으로 추정됩니다.",
  actions: [
    { text: "2호 CDU 제어 밸브(V-21) 개도 상태를 확인합니다.", reason: "냉각수 공급 경로에서 랙보다 앞에 있는 설비이며 개도 42%가 기준 78%에 못 미칩니다." },
    { text: "순환 펌프 P-2 토출 압력과 유량을 확인합니다.", reason: "2호 CDU에 유량을 공급하는 설비이며 밸브가 정상이면 다음으로 확인합니다." },
    { text: "GPU 랙 A열 후면 온도 센서 상태를 확인합니다.", reason: "앞의 두 설비가 정상이면 온도 측정값 자체를 확인합니다." },
  ],
};

const EVENTS = [
  { time: "13:52", name: "GPU 사용률 변화율 탐지", value: "94%", base: "기준 86%", delta: "▲ 8%" },
  { time: "13:55", name: "랙 전력 임계치", value: "41.2kW", base: "기준 39.0kW", delta: "▲ 2.2kW" },
  { time: "14:07", name: "냉각 유량 EWMA 탐지", value: "118L/min", base: "기준 123L/min", delta: "▼ 5L/min" },
  { time: "14:12", name: "랙 출구 온도 임계치", value: "34.2°C", base: "기준 33.5°C", delta: "▲ 0.7°C" },
];

const VERDICTS = [
  { id: "prevented", label: "예측대로 진행했고 조치로 막았다" },
  { id: "missed", label: "예측이 빗나갔다" },
  { id: "self", label: "조치 없이 정상화됐다" },
];

function LabelRow({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <span style={{ width: 64, flexShrink: 0, font: "var(--text-label-1-regular)", color: "var(--semantic-text-sub)" }}>{label}</span>
      <span style={{ font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-default)" }}>{children}</span>
    </div>
  );
}

// 탐지 유형 구성 — 도넛 파이 (카테고리 토큰, 차트 데이터 시리즈)
function TypePie({ data }) {
  const total = data.reduce((a, d) => a + d.count, 0);
  const R = 56, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
      <svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="탐지 유형 구성 비율">
        {data.map((d) => {
          const len = (d.count / total) * C;
          const el = (
            <circle key={d.label} cx="75" cy="75" r={R} fill="none" stroke={d.color} strokeWidth="38"
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} transform="rotate(-90 75 75)" />
          );
          acc += len;
          return el;
        })}
      </svg>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-default)" }}>{d.label}</span>
            <span style={{ marginLeft: "auto", font: "var(--text-label-2-regular)", color: "var(--semantic-text-default)", fontVariantNumeric: "tabular-nums" }}>{d.count}건</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 시간대별 발생 건수 — 누적 막대
function HourlyStack({ data, series }) {
  const max = Math.max(...data.map((d) => d.parts.reduce((a, b) => a + b, 0)));
  const H = 120;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 0, height: H + 20, position: "relative" }}>
        {[0, 1, 2, 3].map((g) => (
          <div key={g} style={{ position: "absolute", left: 24, right: 0, bottom: 20 + (H / 3) * g, borderTop: "1px dashed var(--semantic-line-default)" }}>
            <span style={{ position: "absolute", left: -24, top: -8, font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{Math.round((max / 3) * g)}</span>
          </div>
        ))}
        {data.map((d) => (
          <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: H + 20, position: "relative", zIndex: 1 }}>
            <div style={{ width: 88, display: "flex", flexDirection: "column-reverse" }}>
              {d.parts.map((v, i) => (
                <div key={i} style={{ height: (v / max) * H, background: series[i].color }} />
              ))}
            </div>
            <span style={{ marginTop: 6, font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{d.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {series.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-default)" }}>{s.label}</span>
            <span style={{ marginLeft: "auto", font: "var(--text-label-2-regular)", color: "var(--semantic-text-default)", fontVariantNumeric: "tabular-nums" }}>{s.count}건</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportBox({ children }) {
  return (
    <div style={{ background: "var(--semantic-bg-light)", borderRadius: 8, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      {children}
    </div>
  );
}

export default function ActionRecord({ onBack, onSubmit, hasDraft, initialStep = 0, hideNew = false }) {
  const [step, setStep] = useState(Math.min(Math.max(initialStep, 0), 3));
  const [tags, setTags] = useState({ 현상: ["냉각 반응 지연"], 원인: ["제어 밸브 개도 부족"], 조치: ["밸브 개도 수동 조정"] });
  const [verdict, setVerdict] = useState(null);
  const [reportOpen, setReportOpen] = useState(true);
  const stepName = STEPS[step];
  const isLast = step === 3;
  const progressPercent = ((step + 1) / STEPS.length) * 100;

  function toggleTag(t) {
    setTags((prev) => {
      const cur = prev[stepName] || [];
      return { ...prev, [stepName]: cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t] };
    });
  }

  const sectionTitle = { font: "var(--text-body-1-normal-semibold)", color: "var(--semantic-text-default)", margin: "0 0 12px" };
  const label = { font: "var(--text-label-1-regular)", color: "var(--semantic-text-sub)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div>
        <button type="button" onClick={onBack}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "transparent", cursor: "pointer", padding: 0, font: "var(--text-label-1-regular)", color: "var(--semantic-text-sub)" }}>
          <Icon name="arrow-turn-down-right" size={14} color="var(--semantic-text-sub)" />
          이상 상황 상세 페이지로
        </button>
      </div>

      <header style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
        <h1 style={{ margin: 0, font: "var(--text-title-2-semibold)", color: "var(--semantic-text-strong)" }}>조치 이력 기록</h1>
        <p style={{ margin: 0, font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-sub)" }}>
          AI 추천 태그를 활용해 현장 처리 내용을 기록해 주세요.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 20 }}>
        {/* ── main ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32, minWidth: 0 }}>
          {/* 이상 상황 요약 */}
          <Card desc="50">
            <h2 style={sectionTitle}>이상 상황 요약</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <LabelRow label="장소">{SUMMARY.place}</LabelRow>
              <LabelRow label="심각도"><StateBadge size="compact" variant="error">{SUMMARY.severity}</StateBadge></LabelRow>
              <LabelRow label="발생 경과">{SUMMARY.elapsed}</LabelRow>
            </div>
          </Card>

          {/* 이벤트 구성 차트 */}
          <section data-desc="52">
            <h2 style={sectionTitle}>이벤트 구성 차트</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <div style={{ ...label, marginBottom: 12 }}>탐지 유형 구성</div>
                <TypePie data={TYPE_MIX} />
              </Card>
              <Card>
                <div style={{ ...label, marginBottom: 12 }}>시간대별 발생 건수</div>
                <HourlyStack data={HOURLY} series={TYPE_MIX} />
              </Card>
            </div>
          </section>

          {/* 유사 사례 참고 */}
          <section data-desc="51">
            <h2 style={sectionTitle}>유사 사례 참고</h2>
            <Card padding="12px 24px" style={{ background: "var(--semantic-bg-light)" }}>
              {SIMILAR.map((c) => (
                <div key={c.date} style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 12, padding: "10px 0" }}>
                  <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>{c.date}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>{c.title}</span>
                    <span style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <StateBadge size="compact" variant="success">결과</StateBadge>
                      <span style={{ font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-default)" }}>{c.result}</span>
                    </span>
                  </div>
                </div>
              ))}
            </Card>
          </section>
        </div>

        {/* ── side: 기록 입력 ── */}
        <aside>
          <Card desc="40" style={{ position: "sticky", top: 0 }}>
            <h2 style={{ margin: "0 0 14px", font: "var(--text-heading-2-semibold)", color: "var(--semantic-text-default)" }}>기록 입력</h2>
            <div data-desc="41" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 4, borderRadius: 999, background: "var(--semantic-natural-light)", overflow: "hidden" }}>
                <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--semantic-primary-default)", transition: "width .15s ease" }} />
              </div>
              <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)", whiteSpace: "nowrap" }}>
                {stepName} <span style={{ color: "var(--semantic-text-default)", fontVariantNumeric: "tabular-nums" }}>{step + 1} / {STEPS.length}</span>
              </span>
            </div>

            {hasDraft && (
              <div data-desc="49" style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 8, background: "var(--semantic-bg-light)", color: "var(--semantic-text-sub)", font: "var(--text-label-1-regular)" }}>
                작성 중인 조치 이력이 있어요.
              </div>
            )}

            {/* 조치 요약 제목 */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <span style={label}>조치 요약 제목</span>
              <div style={{ marginLeft: "auto" }}>
                <TextButton variant="assistive" size="small">
                  <Icon name="write" size={14} color="var(--semantic-text-sub)" />
                  편집
                </TextButton>
              </div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--semantic-bg-light)", font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)", marginBottom: 20 }}>
              {SUMMARY.title}
            </div>

            {/* 단계 본문 */}
            {!isLast ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>{stepName}</span>
                  <Icon name="circle-info" size={14} color="var(--semantic-text-sub)" />
                </div>
                <div data-desc="43" style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                  <ChipGroup type="selection" size="small">
                    {MOCK_TAGS[stepName].map(({ t, ai }) => {
                      const on = (tags[stepName] || []).includes(t);
                      return (
                        <Chip key={t} variant="outline" size="small" selected={on} onClick={() => toggleTag(t)}
                          trailingSlot={ai ? <ContentBadge size="compact" variant="primary">AI 추천</ContentBadge> : undefined}>
                          {t}
                        </Chip>
                      );
                    })}
                  </ChipGroup>
                  <TextButton variant="assistive" size="small">
                    <Icon name="circle-plus" size={14} color="var(--semantic-text-sub)" />
                    직접 태그 추가
                  </TextButton>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={label}>추가 설명 (선택)</span>
                  <textarea rows={6} placeholder="현장에서 확인한 추가 상황이나 특이사항을 입력해 주세요."
                    style={{ resize: "vertical", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--semantic-line-default)", background: "var(--semantic-bg-default)", font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-default)" }} />
                </div>
                {/* 신규 — 예측 결과 확인 (4/4 하단 섹션) */}
                {!hideNew && (
                  <div data-desc="44" style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 16, borderTop: "1px solid var(--semantic-line-default)" }}>
                    <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>예측 결과 확인</span>
                    <span data-desc="46" style={{ font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-sub)" }}>
                      탐지 자체가 잘못된 경우에는 이상 없음으로 종료해 주세요.
                    </span>
                    <div data-desc="45" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {VERDICTS.map((v) => (
                        <Radio key={v.id} size="small" checked={verdict === v.id} onChange={() => setVerdict(v.id)}>
                          <span style={{ font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-default)" }}>{v.label}</span>
                        </Radio>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 에이전트 종합 분석 리포트 */}
            {!isLast && (
              <div style={{ marginBottom: 20 }}>
                <button type="button" onClick={() => setReportOpen((v) => !v)}
                  style={{ display: "flex", alignItems: "center", width: "100%", border: "none", background: "transparent", padding: "0 0 10px", cursor: "pointer" }}>
                  <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>에이전트 종합 분석 리포트</span>
                  <span style={{ marginLeft: "auto", display: "inline-flex" }}>
                    <Icon name={reportOpen ? "chevron-up" : "chevron-down"} size={16} color="var(--semantic-text-sub)" />
                  </span>
                </button>
                {reportOpen && (
                  <ReportBox>
                    {step === 0 && (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>에이전트 감지 패턴 분석</span>
                          <span><ContentBadge size="compact" variant="primary">확신도 87%</ContentBadge></span>
                          <p style={{ margin: 0, font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-default)" }}>{REPORT.pattern}</p>
                        </div>
                        {!hideNew && (
                          <p data-desc="53" style={{ margin: 0, font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-default)" }}>{REPORT.reach}</p>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>구성 이벤트 (12건)</span>
                          {EVENTS.map((e) => (
                            <div key={e.time + e.name} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 8 }}>
                              <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)", fontVariantNumeric: "tabular-nums" }}>{e.time}</span>
                              <span style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ font: "var(--text-label-2-semibold)", color: "var(--semantic-text-default)" }}>{e.name}</span>
                                <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
                                  {e.value} · {e.base} <span style={{ color: e.delta.startsWith("▲") ? "var(--semantic-content-danger-default)" : "var(--semantic-content-informative-default)" }}>{e.delta}</span>
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {step === 1 && (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>현재 상황 분석</span>
                          <span><ContentBadge size="compact" variant="primary">확신도 87%</ContentBadge></span>
                          <p style={{ margin: 0, font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-default)" }}>{REPORT.cause}</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>유사 사례 비교</span>
                          {SIMILAR.map((c) => (
                            <div key={c.date} style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 8 }}>
                              <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>{c.date}</span>
                              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ font: "var(--text-label-2-semibold)", color: "var(--semantic-text-default)" }}>{c.title}</span>
                                <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>{c.result}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {step === 2 && (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>권장 대응 방법</span>
                          {REPORT.actions.map((g, i) => (
                            <div key={g.text} style={{ display: "flex", gap: 8 }}>
                              <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--semantic-natural-deep)", color: "var(--semantic-text-on-dark)", font: "var(--text-caption-2-semibold)" }}>{i + 1}</span>
                              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ font: "var(--text-label-2-semibold)", color: "var(--semantic-text-default)" }}>{g.text}</span>
                                <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>{g.reason}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>관련 매뉴얼</span>
                          <span style={{ font: "var(--text-label-2-semibold)", color: "var(--semantic-text-default)" }}>냉각_계통_운전_절차_SOP.pdf</span>
                        </div>
                      </>
                    )}
                  </ReportBox>
                )}
              </div>
            )}

            {/* footer */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <OutlineButton variant="assistive" size="medium" widthType="fixed" disabled={step === 0} onClick={() => setStep(step - 1)}>
                이전
              </OutlineButton>
              {isLast ? (
                <FillButton variant="primary" size="medium" widthType="fixed" onClick={() => onSubmit && onSubmit({ tags, verdict })} data-desc="48">
                  처리 완료
                </FillButton>
              ) : (
                <FillButton variant="primary" size="medium" widthType="fixed" onClick={() => setStep(step + 1)}>
                  다음
                </FillButton>
              )}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--semantic-line-default)", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
              <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>현장 확인 결과 이상이 없었나요?</span>
              <WeakButton variant="assistive" size="small">이상 없음으로 상황 종료</WeakButton>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
