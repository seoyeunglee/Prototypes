// 원인·위험·다음 사건 예측 — 내부 구조 도식 2종 (HTML 카드 + 타이포 토큰, FlowKit 양식).
// ① EWMA 오차 추세 판정: 기존 효율 저하 탐지 구조에서 예측 모델 자리만 교체(신규 배지)
// ② 진행 단계 판정 엔진: 5단계 상태 전이 + 판정 안정성(뒤집힘 시 직전 단계 유지)
import { FlowCard, FlowArrow, FlowRow, FlowFrame } from "./FlowKit";

export default function PredictionEngine({ desc, part }) {
  return (
    <div data-desc={desc} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {part !== "stages" && (
        <FlowFrame
          title="EWMA 오차 추세 판정 — 기존 구조 재사용, 모델 자리만 교체"
          note="기존 효율 저하 탐지가 이미 이 구조로 운영 중 — 예측 모델 자리만 바꾸면 판정 로직이 그대로 성립합니다."
        >
          <FlowRow>
            <FlowCard planned title="부하→필요 냉각량 예측" sub="모델 자리 교체" />
            <FlowArrow />
            <FlowCard title="오차 = 예측 − 실측" sub="실측: 냉각 유량·온도" />
            <FlowArrow />
            <FlowCard title="오차 추세 (EWMA)" sub="평활 누적" />
            <FlowArrow />
            <FlowCard title="임계 초과 시 이벤트" sub="임계 = 오차 편차 기반" />
          </FlowRow>
        </FlowFrame>
      )}

      {part !== "ewma" && (
        <FlowFrame
          title="진행 단계 판정 엔진 — 설계 확보 (단계 진입 조건은 도메인 승인 대기)"
          note="판정 안정성: 같은 입력에 판정이 반복해서 뒤집히면 단계를 확정하지 않고 직전 단계를 유지합니다. 신호 단절 시 판정 중단으로 표시합니다."
        >
          <FlowRow>
            <FlowCard title="관찰 구간" minWidth={0} />
            <FlowArrow />
            <FlowCard title="부하·전력 상승 확인" minWidth={0} />
            <FlowArrow />
            <FlowCard active title="냉각 반응 지연" minWidth={0} />
            <FlowArrow />
            <FlowCard title="랙 온도 상승" minWidth={0} />
            <FlowArrow />
            <FlowCard title="성능 저하" minWidth={0} />
          </FlowRow>
        </FlowFrame>
      )}
    </div>
  );
}
