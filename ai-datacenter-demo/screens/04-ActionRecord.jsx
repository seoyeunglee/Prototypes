// screen-04 · 조치 이력 기록 — 실제 FE AbnormalSituationActionHistory 구조를 따른다.
//   topBar(뒤로) + header("조치 이력 기록" + 부제) + layout [main | side 기록 입력 패널]
//   기록 입력: 진행 바 + 단계명 N/4, AI 추천 태그 칩, 추가 설명, 이전/다음/처리 완료,
//   하단 "현장 확인 결과 이상이 없었나요?" + 이상 없음으로 상황 종료.
//   4단계 예측 판정(FN-5)이 이 흐름의 마지막 단계로 추가된다.
import { useState } from "react";
import { Icon, StateBadge, FillButton, OutlineButton, TextButton, Chip, ChipGroup } from "@idbrnd/design-system";
import { Card, CardHeader } from "../components/AppShell";

const STEPS = [
  { key: "현상", label: "현상" },
  { key: "원인", label: "원인" },
  { key: "조치", label: "조치" },
  { key: "예측 판정", label: "예측 판정" },
];

const MOCK_TAGS = {
  현상: ["랙 출구 온도 상승", "냉각 유량 저하", "GPU 사용률 급증", "공급 압력 변동"],
  원인: ["밸브 개도 부족", "순환 펌프 유량 저하", "냉각 반응 지연", "센서 측정 오류"],
  조치: ["밸브 개도 조정 요청", "펌프 점검 의뢰", "센서 재교정", "경과 관찰"],
};

const VERDICTS = [
  { id: "prevented", label: "예측대로 진행했고 조치로 막았다" },
  { id: "missed", label: "예측이 빗나갔다" },
  { id: "self", label: "조치 없이 정상으로 돌아왔다" },
];

export default function ActionRecord({ onBack, onSubmit, hasDraft }) {
  const [step, setStep] = useState(0);
  const [tags, setTags] = useState({ 현상: [], 원인: [], 조치: [] });
  const [verdict, setVerdict] = useState(null);
  const [error, setError] = useState(false);

  const stepName = STEPS[step].key;
  const isVerdictStep = step === 3;
  const progressPercent = ((step + 1) / STEPS.length) * 100;

  function toggleTag(t) {
    setTags((prev) => {
      const cur = prev[stepName] || [];
      return { ...prev, [stepName]: cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t] };
    });
  }

  function handleComplete() {
    if (!verdict) {
      setError(true);
      return;
    }
    setError(false);
    onSubmit && onSubmit({ tags, verdict });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* topBar */}
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
          이상 상황 상세 페이지로
        </button>
      </div>

      {/* header — FE 원문 부제 */}
      <header style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
        <h1 style={{ margin: 0, font: "var(--text-title-1-semibold)", color: "var(--semantic-text-strong)" }}>
          조치 이력 기록
        </h1>
        <p style={{ margin: 0, font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-sub)" }}>
          AI 추천 태그를 활용해 현장 처리 내용을 기록해 주세요.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 460px", gap: 20 }}>
        {/* ── main: 상황 요약 + 유사 사례 ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40, minWidth: 0 }}>
          <Card desc="50">
            <CardHeader icon="dashboard-detection" title="상황 요약" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <StateBadge variant="error" size="compact">심각도 높음</StateBadge>
                <span style={{ font: "var(--text-body-2-normal-semibold)", color: "var(--semantic-text-default)" }}>
                  GPU 랙 A열 냉각 반응 지연
                </span>
              </div>
              <p style={{ margin: 0, font: "var(--text-body-2-reading-regular)", color: "var(--semantic-text-default)" }}>
                GPU 부하가 오른 뒤 냉각 유량이 따라오지 않는 패턴이 냉각 반응 지연과 일치합니다. 2호 CDU 제어 밸브
                개도 부족이 원인으로 추정됩니다.
              </p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
                  장소 GPU룸 A
                </span>
                <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
                  진행 단계 냉각 반응 지연
                </span>
                <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
                  구성 이벤트 12건
                </span>
                <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
                  발생 경과 3시간 10분
                </span>
              </div>
            </div>
          </Card>

          <Card desc="51">
            <CardHeader icon="dashboard-history" title="유사 사례" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { date: "2026-06-18", title: "A열 CDU 밸브 개도 부족으로 인한 랙 온도 상승", result: "밸브 액추에이터 교체 후 정상 복귀" },
                { date: "2026-04-02", title: "순환 펌프 P-1 유량 저하", result: "임펠러 이물질 제거 후 정상 복귀" },
              ].map((c, i) => (
                <div key={c.date} style={{ padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--semantic-line-default)" }}>
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
          </Card>
        </div>

        {/* ── side: 기록 입력 패널 (FE RecordPanel) ── */}
        <aside>
          <Card desc="40" style={{ position: "sticky", top: 0 }}>
            {/* recordHeader — 타이틀 + 진행 바 + 단계명 N/4 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <h2 style={{ margin: 0, font: "var(--text-heading-2-semibold)", color: "var(--semantic-text-default)" }}>
                기록 입력
              </h2>
              <div data-desc="41" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 6, borderRadius: 999, background: "var(--semantic-natural-light)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: "var(--semantic-primary-default)",
                      transition: "width .15s ease",
                    }}
                  />
                </div>
                <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)", whiteSpace: "nowrap" }}>
                  {STEPS[step].label}{" "}
                  <span style={{ color: "var(--semantic-text-sub)", font: "var(--text-label-1-regular)" }}>
                    {step + 1} / {STEPS.length}
                  </span>
                </span>
              </div>
            </div>

            {hasDraft && (
              <div
                data-desc="49"
                style={{
                  marginBottom: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "var(--semantic-bg-light)",
                  color: "var(--semantic-text-sub)",
                  font: "var(--text-label-1-regular)",
                }}
              >
                작성 중인 조치 이력이 있어요.
              </div>
            )}

            {/* 본문 */}
            {!isVerdictStep ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span data-desc="42" style={{ font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-sub)" }}>
                    90일간의 장소 이력과 유사 사례를 분석한 AI 추천 태그입니다. 현장 상황과 일치하는 항목을 선택해
                    주세요.
                  </span>
                  <div data-desc="43" style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                    <ChipGroup type="selection" size="small">
                      {MOCK_TAGS[stepName].map((t) => {
                        const on = (tags[stepName] || []).includes(t);
                        return (
                          <Chip
                            key={t}
                            variant="outline"
                            size="small"
                            selected={on}
                            onClick={() => toggleTag(t)}
                            trailingSlot={
                              <span
                                style={{
                                  padding: "1px 4px",
                                  borderRadius: 4,
                                  background: "var(--semantic-bg-light)",
                                  color: "var(--semantic-text-sub)",
                                  font: "var(--text-caption-2-regular)",
                                }}
                              >
                                AI 추천
                              </span>
                            }
                          >
                            {t}
                          </Chip>
                        );
                      })}
                    </ChipGroup>
                    <TextButton variant="assistive" size="small">직접 추가</TextButton>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ font: "var(--text-label-1-regular)", color: "var(--semantic-text-sub)" }}>
                    추가 설명 (선택)
                  </span>
                  <textarea
                    rows={3}
                    placeholder="현장에서 확인한 추가 상황이나 특이사항을 입력해 주세요."
                    style={{
                      resize: "vertical",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--semantic-line-default)",
                      background: "var(--semantic-bg-default)",
                      font: "var(--text-body-2-normal-regular)",
                      color: "var(--semantic-text-default)",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <span data-desc="44" style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-sub)" }}>
                  예측 판정
                </span>
                <span data-desc="46" style={{ font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-sub)" }}>
                  탐지 자체가 잘못된 경우에는 이상 없음으로 종료해 주세요.
                </span>
                <div data-desc="45" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {VERDICTS.map((v) => {
                    const on = verdict === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setVerdict(v.id);
                          setError(false);
                        }}
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          borderRadius: 8,
                          cursor: "pointer",
                          border: on
                            ? "1px solid var(--semantic-primary-default)"
                            : "1px solid var(--semantic-line-default)",
                          background: on ? "var(--semantic-primary-extra-light)" : "var(--semantic-bg-default)",
                          color: "var(--semantic-text-default)",
                          font: "var(--text-body-2-normal-regular)",
                        }}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
                {error && (
                  <div data-desc="47" style={{ font: "var(--text-label-1-regular)", color: "var(--semantic-content-danger-default)" }}>
                    예측 판정을 선택해 주세요.
                  </div>
                )}
              </div>
            )}

            {/* footer — 이전 / 다음·처리 완료 (Main Action 우측) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid var(--semantic-line-default)",
              }}
            >
              <OutlineButton
                variant="assistive"
                size="small"
                onClick={() => (step === 0 ? onBack() : setStep(step - 1))}
              >
                {step === 0 ? "취소" : "이전"}
              </OutlineButton>
              <div style={{ marginLeft: "auto" }}>
                {isVerdictStep ? (
                  <FillButton variant="primary" size="small" onClick={handleComplete} data-desc="48">
                    처리 완료
                  </FillButton>
                ) : (
                  <FillButton variant="primary" size="small" onClick={() => setStep(step + 1)}>
                    다음
                  </FillButton>
                )}
              </div>
            </div>

            {/* 이상 없음 종료 — FE 원문 문구 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                marginTop: 12,
              }}
            >
              <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>
                현장 확인 결과 이상이 없었나요?
              </span>
              <TextButton variant="assistive" size="small">
                이상 없음으로 상황 종료
              </TextButton>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
