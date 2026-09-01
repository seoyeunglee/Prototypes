// screen-08 · 합성용 UI 조각 시트 — 실제 제품 캡처 위에 얹을 신규 버튼·힌트를 디자인 시스템 컴포넌트로 렌더링한다.
//   ?capture=1&screen=assets 로 열어 1배율 캡처 후 각 조각을 잘라 쓴다. 조각은 흰 배경 위에 고정 간격으로 놓는다.
//   1. "AI 시나리오 생성" — 탐지 시나리오 목록의 시나리오 생성 옆에 붙는 보조 생성 버튼 (OutlineButton primary, ai-brain 아이콘)
//   2. "추천값 적용" — 노드 설정 패널 안, 온톨로지 추천값을 입력값에 넣는 소형 버튼 (OutlineButton primary xsmall)
//   3. 추천값 힌트 — 입력값 아래 캡션 (ContentBadge "추천" + 값 + 근거)
import { Icon, OutlineButton, FillButton, ContentBadge } from "@idbrnd/design-system";

const Slot = ({ id, children }) => (
  <div data-asset={id} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: 12, background: "var(--semantic-bg-default)" }}>
    {children}
  </div>
);

export default function AssetSheet() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 24, padding: 24, background: "var(--semantic-bg-default)", minHeight: "100vh" }}>
      {/* 좌우 패딩은 원본 화면의 이웃 버튼("+ 시나리오 생성" 24px, "설정 저장" 16px)과 맞춘다 */}
      <Slot id="ai-create">
        <OutlineButton variant="primary" size="medium" widthType="fixed" customStyle={{ paddingLeft: 24, paddingRight: 24 }}>
          <Icon name="ai-brain" size={18} color="var(--semantic-primary-default)" />
          AI 시나리오 생성
        </OutlineButton>
      </Slot>
      <Slot id="ai-create-fill">
        <FillButton variant="primary" size="medium" widthType="fixed" customStyle={{ paddingLeft: 24, paddingRight: 24 }}>
          <Icon name="ai-brain" size={18} color="var(--semantic-text-on-dark)" />
          AI 시나리오 생성
        </FillButton>
      </Slot>
      <Slot id="apply-reco">
        <OutlineButton variant="primary" size="xsmall" widthType="fixed" customStyle={{ paddingLeft: 16, paddingRight: 16 }}>
          <Icon name="ai-brain" size={14} color="var(--semantic-primary-default)" />
          추천값 적용
        </OutlineButton>
      </Slot>
      {/* 입력 아래 helper text — caption-1 · text-sub. "추천값"을 먼저 두고 근거를 짧게 붙인다 (general-ux-writing: 결정에 필요한 정보만) */}
      <Slot id="hint-threshold">
        <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
          추천값 33.5°C · 랙 출구 온도 운전 상한 기준
        </span>
      </Slot>
      <Slot id="hint-period">
        <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
          추천값 1분 · 냉각 반응 지연 시간 기준
        </span>
      </Slot>
    </div>
  );
}
