// screen-09 · 엔진 컨셉 — 대표님이 전달한 AIDC AI 엔진 설계 5종(온톨로지·예측·최적화·재학습·XAI)을
// 데모 안에서 참고할 수 있게 개념 수준으로 정리한 뷰. 상단 보기 전환 "엔진 컨셉" 또는 ?view=engines 로 진입한다.
// 근거: sk-aidc-proposal/AIDC 컨셉/aidc-ontology-main (엔진 1 — Phase 1 RC 런타임 + 운영자 콘솔·온톨로지 스튜디오)
//       sk-aidc-proposal/AIDC 컨셉/aidc-prediction-main (엔진 2 — E2-A1~E1 완료·F1 착수 대기, UI 없음)
//       엔진 3·4·5는 두 저장소 문서에 역할 경계만 정의돼 있고 저장소가 없다 — 컨셉 단계로 표시한다.
// 구성: 좌측 엔진 목록(기술 검증 뷰와 같은 사이드바 패턴) · 우측 = 5엔진 연결 구조 스트립 + 선택 엔진 상세.
// "개념만 먼저 참고"(2026-09-01) — 대표님 저장소 코드는 실행·임베드하지 않고 설계 문서의 정의를 옮긴다.
// 타이포는 font: var(--text-*), 색은 var(--semantic-*)만 쓴다.
import { useState } from "react";
import { Icon, StateBadge, ContentBadge, TextButton } from "@idbrnd/design-system";
import { FlowCard, FlowArrow, FlowRow, FlowFrame } from "../components/tech/FlowKit";

const STATUS = {
  repo: { label: "저장소 전달 — 설계·프로토타입 있음", variant: "success" },
  concept: { label: "컨셉 단계 — 저장소 없음", variant: "warning" },
};

// 엔진 5종 — 질문·담당·경계는 대표님 문서의 정의를 옮긴 것이고, "우리 데모 대응"만 이쪽 판단이다.
const ENGINES = [
  {
    id: "e1",
    no: 1,
    name: "온톨로지",
    en: "Engine 1 — Ontology & Reasoning",
    status: "repo",
    short: "지금 무슨 일이, 왜",
    question: "지금 무슨 일이 일어나고 있고, 왜인가?",
    focus:
      "GPU 온도 변화가 워크로드·전력 변화로 설명되는가, 아니면 냉각 반응 지연·데이터 품질·랙 로컬·공유 냉각 문제의 증거인가 — 온도 상승 자체를 결함으로 보지 않고 기대값 대비 잔차로 판단한다.",
    source: "aidc-ontology README · docs 00~09 · domain_pack/aidc_dlc_v1 · frontend/",
    chainTitle: "추론 경로 — 원천 관측에서 불변 케이스까지 (README 'Implemented reasoning path')",
    chain: [
      { title: "원천 관측", sub: "태그·원시값·시각·출처" },
      { title: "매핑·출처 보존", sub: "M3" },
      { title: "데이터 품질", sub: "SUSPECT 마킹" },
      { title: "기대 모델", sub: "M4 expected" },
      { title: "잔차", sub: "열·냉각 residual" },
      { title: "상태·상황", sub: "State → Situation" },
      { title: "원인 가설", sub: "CauseHypothesis" },
      { title: "피어 범위", sub: "LOCAL / SHARED" },
      { title: "단계·위험", sub: "Stage 0~4 · Risk" },
      { title: "점검·SOP", sub: "우선순위 · 추천" },
      { title: "불변 케이스", sub: "OperationalCase" },
    ],
    chainNote:
      "ReasoningService.evaluate(...) 하나가 골든 테스트·API 평가·케이스 생성·리플레이에 공통 경계로 쓰인다. 리플레이는 기록된 버전이 정확히 해석될 때만 재실행하고, 아니면 REPLAY_UNAVAILABLE을 돌려준다(현재 설정으로 대체하지 않음).",
    facts: [
      [
        "담당 출력",
        "Situation · CauseHypothesis(확신도) · Peer Scope · Stage · Risk · Inspection Priority · SOP 추천 · Evidence를 분리된 객체로 유지해 각각 설명·역추적할 수 있게 한다. 원인 가설은 확정 원인이 아니고, 위험은 발생한 결과가 아니다.",
      ],
      ["입력", "원천 시스템 · 태그 · 원시값 · 단위 · 이벤트 시각 · 수집 시각 · 출처. 설정된 태그 매핑을 거친 뒤에 추론이 시작된다."],
      ["운영 경계", "L0 알림 / L1 권고만. 밸브·펌프·CDU·GPU·워크로드·설정에 대한 자동 제어 경로가 없다(Shadow)."],
      ["계약", "engine1.v1 — 동결. 엔진 2는 이 계약 페이로드(또는 캡처된 픽스처)만 소비하고 내부 코드를 import하지 않는다."],
      [
        "전달물",
        "Python 3.11 FastAPI 런타임(읽기 전용 API: /cases · /reasoning · /evidence · /topology · /replay · /simulation …) + 도메인 팩 aidc_dlc_v1(상황·원인·위험·진행 정의 + 규칙 YAML 8종) + 골든 케이스 픽스처 + 운영자 콘솔·온톨로지 스튜디오(React, @idbrnd/design-system 1.13).",
      ],
      [
        "상태·한계",
        "Phase 1 M0~M11 완료. 자산·임계·계수·SOP는 전부 MOCK이며 실제 SK 매핑·검증은 미수행. 저장소는 인메모리, 인증·RBAC 없음. UI·LLM 설명·운영 배포·자동 제어는 Phase 1 범위 밖.",
      ],
    ],
    links: [
      { label: "운영 데모: 이상 상황 상세 — AI 분석 결과(원인 가설·근거)", to: ["demo", "detail"] },
      { label: "기술 검증 3. 온톨로지 기반 지식화", to: ["tech", "t3"] },
    ],
  },
  {
    id: "e2",
    no: 2,
    name: "프리딕션",
    en: "Engine 2 — Prediction",
    status: "repo",
    short: "다음에 무슨 일이",
    question: "다음에 무슨 일이, 어느 시점에, 어떤 불확실성으로 일어날 가능성이 있는가?",
    focus: "정확히 어떤 데이터·모델 맥락에서 나온 예측인지(데이터셋·시나리오·윈도·피처·타깃·모델·코드 출처)를 결과와 함께 남긴다.",
    source: "aidc-prediction README · docs/architecture/E2_PROGRAM_BOUNDARIES · docs/handoff/CURRENT_STATUS (2026-08-30)",
    chainTitle: "첫 수직 슬라이스 — Controlled MOCK 예측 체인 · 예측 시점 T+5 / T+10 / T+30분",
    chain: [
      { title: "GPU 워크로드", sub: "C1" },
      { title: "GPU·랙 전력", sub: "D1" },
      { title: "GPU 열", sub: "E1" },
      { title: "필요 냉각량", sub: "F1 · 착수 대기" },
      { title: "임계·한계 도달 시간", sub: "G1 · Time-to-Limit" },
    ],
    chainNote:
      "시간 규칙: observation.eventTime ≤ dataCutoffTime ≤ predictionOriginTime(T0) < targetTime. 미래 값·미래 이벤트 일정·미래 엔진 1 판정이 T0 입력에 들어가면 경고가 아니라 테스트 실패로 본다.",
    facts: [
      [
        "담당 출력",
        "미래 워크로드·전력·열·필요 냉각량, 임계/한계 도달 시간, 불확실성·신뢰도(보정 전엔 null 허용), 그리고 데이터셋/시나리오/원점/윈도/피처/타깃/모델/코드 출처.",
      ],
      ["입력", "정준 관측 시계열(예측 입력 평면) + 동결된 engine1.v1 컨텍스트. 합성 잠재 진실과 시나리오 메타데이터는 평가용으로만 쓰고 T0 피처로 쓰지 않는다(4개 평면 분리)."],
      ["운영 경계", "SHADOW_PREDICTION_ONLY · SYNTHETIC_MOCK · 자동 제어 없음. 계약에 automaticControlActions = [] · optimizationSetpoints = [] 를 항상 유지한다."],
      ["계약", "prediction.v1 — 읽기 전용. 시점 의미·horizon·단위·available/degraded/unavailable 상태를 릴리스 뒤 조용히 바꾸지 않는다."],
      ["전달물", "Python 패키지(contracts · datasets · features · synthetic · backtest · power)와 단위·통합 테스트. 운영자용 UI는 아직 없음 — E2-H1(운영자 예측·리플레이)에서 예정."],
      [
        "상태·한계",
        "A1~E1 완료·동결. C1(워크로드)·D1(전력)·E1(열) Ridge 모델은 실험 근거로만 남고 채택되지 않음(NOT_ACCEPTED) — F1은 B1 persistence 기반 결정론 fallback으로 진행. 실 SK 데이터 검증은 미승인.",
      ],
    ],
    links: [
      { label: "운영 데모: 이상 상황 상세 — 상황 진행 단계·개입 여지", to: ["demo", "detail"] },
      { label: "기술 검증 4. 원인·위험·다음 사건 예측", to: ["tech", "t4"] },
    ],
  },
  {
    id: "e3",
    no: 3,
    name: "최적화",
    en: "Engine 3 — Optimization",
    status: "concept",
    short: "무엇을 얼마나 바꿀지",
    question: "무엇을, 얼마나 바꿔야 하는가?",
    focus: "엔진 1·2가 내놓은 '지금'과 '다음'을 바탕으로 밸브·펌프·냉각수 온도·유량 설정값을 제안하는 자리. 두 저장소 모두 이 역할을 자기 범위에서 명시적으로 제외했다.",
    source: "E2_PROGRAM_BOUNDARIES §2 · E2_F1 아키텍처 확인서 §15 (엔진 1·3 경계) · E2_F1 입력 누설 정책 §18",
    chainTitle: "컨셉 — 수요 예측을 실행 가능한 설정값으로 (경계 정의만 있고 구현·저장소 없음)",
    chain: [
      { title: "prediction.v1", sub: "필요 냉각량 · 도달 시간" },
      { title: "소비자 계약 검토", sub: "별도 리뷰 후 수용" },
      { title: "실행 가능 범위", sub: "용량·안전 여유" },
      { title: "설정값 후보", sub: "밸브·펌프·수온·유량" },
      { title: "엔진 4로", sub: "승인 대기" },
    ],
    chainNote: "F1 문서: 냉각 용량을 유량·밸브·펌프·압력·수온 설정으로 바꾸는 계산은 전부 엔진 3 소관이며, 엔진 2는 읽기 전용 수요 예측만 낸다.",
    facts: [
      ["담당 출력", "밸브 / 펌프 / 냉각수 온도 / 유량 설정값(최적화된 setpoint)."],
      ["입력", "엔진 2 prediction.v1의 필요 냉각량·도달 시간(승인된 값 또는 명시적으로 허용된 fallback). 엔진 2 내부 모델 객체는 쓰지 않는다."],
      ["운영 경계", "엔진 1은 L0/L1, 엔진 2는 Shadow — 어느 쪽도 설정값을 내지 않는다. 엔진 3이 실제 구동 권한(actuation authority)을 가질지, Shadow 해제 조건이 무엇인지는 미정."],
      ["전달물", "없음. 두 저장소의 아키텍처 문서에서 '엔진 3 소관'으로 넘긴 항목만 존재."],
      ["다음 결정", "① 설정값을 '권고'로 둘지 '실행'까지 갈지 ② 엔진 2 수요 예측이 NOT_ACCEPTED 상태일 때 엔진 3이 fallback 값을 써도 되는지 — 대표님·도메인 확인 필요."],
    ],
    links: [],
    linkNote: "우리 데모에는 제어 버튼이 없다(Shadow 전제) — 엔진 3에 대응하는 화면이 아직 없는 것이 정책과 일치한다.",
  },
  {
    id: "e4",
    no: 4,
    name: "재학습",
    en: "Engine 4 — Execution & Learning",
    status: "concept",
    short: "승인·실행·기록·학습",
    question: "누가 승인했고, 무엇을 실행했고, 결과가 어땠고, 거기서 무엇을 배우는가?",
    focus: "대표님 문서에서는 '승인 / 실행 / 결과 기록 / 학습'을 한 엔진으로 묶는다. 재학습은 그 마지막 단계이고, 앞 세 단계의 기록이 학습 입력이 된다.",
    source: "E2_PROGRAM_BOUNDARIES §2 · aidc-ontology README 'Human-in-the-loop and outcome validation' · docs/02 KnowledgeCandidate",
    chainTitle: "컨셉 — 엔진 1의 append-only 라이프사이클을 학습 루프로 잇는다",
    chain: [
      { title: "권고", sub: "엔진 1 SOP · 엔진 3 설정값" },
      { title: "운영자 승인", sub: "ConfirmedCause" },
      { title: "실행 기록", sub: "ExecutedAction" },
      { title: "결과 판정", sub: "PREVENTED · REALIZED · INCONCLUSIVE" },
      { title: "지식 후보", sub: "KnowledgeCandidate" },
      { title: "승인 반영", sub: "규칙·모델 갱신" },
    ],
    chainNote:
      "PREVENTED는 '예측 실패'가 아니다 — 활성 위험 + 기록된 조치 + 조치 후 물리 회복 + 결과 창 완료 + 결과 부재의 확정 증거가 모두 있어야 한다. 증거가 빠지면 INCONCLUSIVE, 스로틀링이 관측되면 REALIZED.",
    facts: [
      ["담당 출력", "승인 기록 · 실행 기록 · 결과 판정 · 학습(재학습) 트리거."],
      ["입력", "엔진 1 불변 케이스 스냅샷 + 운영자 확인·조치 기록·회복/결과 증거. 엔진 1은 이것들을 스냅샷과 분리된 append-only 레코드(ConfirmedCause · ExecutedAction · OperatorFeedback)로 이미 정의해 뒀다."],
      ["운영 경계", "운영자 피드백이 규칙·모델을 스스로 바꾸지 못한다. KnowledgeCandidate는 승인 전까지 활성 규칙을 바꾸지 않는다(엔진 1 설계 원칙)."],
      ["전달물", "없음. 엔진 1 쪽에 입력 채널(라이프사이클 레코드·결과 판정 계약)만 구현돼 있다."],
      ["다음 결정", "① 학습 대상이 규칙(온톨로지)인지 모델(예측)인지 둘 다인지 ② 승인 주체와 버전 관리 ③ 우리 데모의 '예측 적중 판정 3택'을 결과 판정(PREVENTED/REALIZED/INCONCLUSIVE)에 어떻게 대응시킬지."],
    ],
    links: [
      { label: "운영 데모: 조치 이력 기록 — 현상·원인·조치 태그 + 예측 적중 판정", to: ["demo", "record"] },
      { label: "기술 검증 5. SOP 연계 + HITL 학습", to: ["tech", "t5"] },
    ],
  },
  {
    id: "e5",
    no: 5,
    name: "XAI",
    en: "Engine 5 — Explainability",
    status: "concept",
    short: "왜 그렇게 판단했는지",
    question: "왜 그렇게 판단했는지, 무엇을 먼저 봐야 하는지 운영자에게 어떻게 설명하는가?",
    focus: "대표님 목록에는 엔진 5로 올라 있지만 별도 문서는 없다. 엔진 1 설계서의 '설명 가능성 원칙'(docs/01 §43)과 '설명 서비스 계약'(docs/06 §67~68)이 출발점이다.",
    source: "대표님 목록(엔진 5) · aidc-ontology docs/01 §43 Explainability principle · docs/06 §67 Explainability service · §68 LLM runtime placement",
    chainTitle: "설명 서비스 배치 — 구조화 추론 결과가 진실의 원천이고, 설명은 그 위에 얹는다",
    chain: [
      { title: "구조화 추론 결과", sub: "situation · evidence · causes · risk · SOP" },
      { title: "설명 서비스", sub: "generate_explanation()" },
      { title: "운영자용 자연어", sub: "측정 · 파생 · 추론 구분" },
    ],
    chainNote: "설명 생성이 실패해도 구조화 추론은 그대로 제공된다. LLM은 골든 케이스 통과 조건이 아니며, '원시 텔레메트리 → LLM → 원인' 배치는 설계에서 명시적으로 금지.",
    facts: [
      ["담당 출력", "엔진 1·2 결론의 근거·반증·누락 증거를 운영자 언어로. 측정값·파생값·추론값을 구분해서 보여준다."],
      ["입력", "엔진 1 구조화 추론 결과(situation · evidence · causes · risk · SOP) — 향후 엔진 2 prediction.v1의 출처·불확실성 필드."],
      ["운영 경계", "설명은 판단을 바꾸지 않는다. 확률 %를 발명하거나 'X분 내' 같은 숫자를 만들어 붙이지 않는다(엔진 1 D-008과 같은 절제)."],
      ["전달물", "없음. 엔진 1 설계서에 원칙·계약·배치 규칙만 정의."],
      ["다음 결정", "① 설명 대상 범위(엔진 1만 / 1+2) ② LLM·RAG 사용 여부와 배치(설명 계층 한정) ③ 우리 데모의 'AI 분석 결과' 카드 문장 템플릿을 설명 서비스 출력 형식으로 볼지."],
    ],
    links: [{ label: "운영 데모: 이상 상황 상세 — AI 분석 결과 카드(현재 설명 문장 형식)", to: ["demo", "detail"] }],
  },
];

// 엔진 1 — 골든 케이스 5종 (README 'Golden semantic contract')
const GOLDEN = [
  ["Golden #1", "밸브·냉각 경로 물리 결함", "Cooling_Response_Delay · Valve_Response_Abnormality HIGH · Stage 2 · ATTENTION · 밸브 SOP"],
  ["Golden #2", "정상 워크로드 전환", "온도가 올라도 열·냉각 잔차 NORMAL · 결함 원인 없음 · Stage 0"],
  ["Golden #3", "유량 원시값 0(센서·데이터)", "물리 결함이 아니라 Cooling_Data_Abnormality · Cooling_Sensor_Data_Abnormality HIGH"],
  ["Golden #4A", "대상 랙만 잔차 LARGE, 피어 정상", "LOCAL_PATTERN · Local_Rack_Cooling_Abnormality HIGH"],
  ["Golden #4B", "피어 여럿 잔차 LARGE + 공용 냉각 이상", "SHARED_PATTERN · Pump_Response_Abnormality HIGH"],
];

// 엔진 1 — 용어 대응(우리 데모). 07_온톨로지설계안_대조의 충돌 항목이 정리되기 전이라 '후보'로 둔다.
const TERM_MAP = [
  ["Situation", "이상 상황(상황 묶음)"],
  ["CauseHypothesis · confidence", "AI 분석 결과 — 원인 가설(확신도 미달 시 심각도 낮음)"],
  ["Stage 0~4 (NORMAL → THROTTLING_OBSERVED)", "상황 진행 단계 — 전조 · 발단 · 확산 · 영향 · 피해"],
  ["Risk · Inspection Priority", "위험 · 점검 순서"],
  ["SOP recommendation", "조치 가이드 · 관련 매뉴얼"],
  ["OperationalCase (불변 스냅샷)", "상황 리포트 · 조치 이력"],
];

// 엔진 2 — 슬라이스 진행 (E2_PROGRAM_BOUNDARIES §5 + CURRENT_STATUS 2026-08-30)
const SLICES = [
  ["E2-A1", "계약 + 시간 의미", "완료 · 동결"],
  ["E2-A2", "합성 생성기 + 매니페스트 검증", "완료 · 동결"],
  ["E2-A3", "윈도 / 피처 기반", "완료 · 동결"],
  ["E2-B1", "Persistence 베이스라인 + 백테스트", "완료 · 동결"],
  ["E2-C1", "워크로드 예측", "완료 · 모델 미채택"],
  ["E2-D1", "전력 예측", "완료 · 모델 미채택"],
  ["E2-E1", "열 예측", "완료 · 모델 미채택"],
  ["E2-F1", "MOCK 필요 냉각량", "승인 · 착수 대기"],
  ["E2-G1", "임계 / 도달 시간 + 불확실성", "미승인"],
  ["E2-H1", "운영자 예측 · 리플레이 UI", "미승인"],
  ["E2-I1", "Controlled MOCK V1 릴리스 동결", "미승인"],
];
const SLICE_VARIANT = (s) => (s.startsWith("완료 · 동결") ? "success" : s.startsWith("완료") ? "info" : s.startsWith("승인") ? "warning" : "neutral");

// 엔진 2 — 리뷰된 릴리스 뒤에도 말하면 안 되는 것 (E2_PROGRAM_BOUNDARIES §3)
const FORBIDDEN = ["실제 SK·사이트 정확도", "운영 배포 준비 완료", "검증된 에너지 절감", "사이트 보정된 냉각 수요", "현장 검증된 도달 시간", "자동 최적화·제어 능력"];

// 엔진 5 — 운영자 대상 결론이 답해야 하는 10문 (docs/01 §43)
const XAI_QUESTIONS = [
  "무슨 일이 일어나고 있는가?",
  "워크로드가 온도 상승을 설명하는가?",
  "왜 이것을 비정상(또는 정상)으로 보는가?",
  "가장 가능성 높은 원인은?",
  "어떤 증거가 뒷받침하는가?",
  "어떤 증거가 반박하는가?",
  "어떤 증거가 빠져 있는가?",
  "영향 범위는 어디까지인가?",
  "다음에 무슨 일이 생길 수 있는가?",
  "무엇을 먼저 점검해야 하는가?",
];

function SectionTitle({ children, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "20px 0 8px" }}>
      <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>{children}</span>
      {sub && <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>{sub}</span>}
    </div>
  );
}

function Facts({ rows }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", rowGap: 10, columnGap: 12, alignItems: "start" }}>
      {rows.map(([label, text]) => (
        <FactRow key={label} label={label} text={text} />
      ))}
    </div>
  );
}
function FactRow({ label, text }) {
  return (
    <>
      <span style={{ font: "var(--text-label-2-semibold)", color: "var(--semantic-text-sub)", paddingTop: 1 }}>{label}</span>
      <span style={{ font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-default)" }}>{text}</span>
    </>
  );
}

// 정적 테이블 재현 표준 — thead bg-light · caption-1-semibold · 행 border (사례 051)
function SimpleTable({ cols, rows, widths = [] }) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--semantic-line-default)", borderRadius: 8 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--semantic-bg-light)" }}>
            {cols.map((c, i) => (
              <th key={c} style={{ textAlign: "left", padding: "8px 12px", font: "var(--text-caption-1-semibold)", color: "var(--semantic-text-sub)", width: widths[i], whiteSpace: "nowrap" }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} style={{ borderTop: "1px solid var(--semantic-line-default)" }}>
              {r.map((cell, ci) => (
                <td key={ci} style={{ padding: "8px 12px", font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-default)", verticalAlign: "top" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 엔진 연결 구조 스트립의 칩 — 컨셉 단계는 점선, 선택 엔진은 primary 강조
function EngineChip({ engine, active, onClick, wide }) {
  const concept = engine.status === "concept";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: wide ? 0 : 148,
        width: wide ? "100%" : undefined,
        padding: "8px 12px",
        borderRadius: 8,
        textAlign: "left",
        cursor: "pointer",
        background: active ? "var(--semantic-primary-extra-light)" : "var(--semantic-bg-default)",
        border: `1px ${concept ? "dashed" : "solid"} ${active ? "var(--semantic-primary-default)" : concept ? "var(--semantic-natural-heavy)" : "var(--semantic-line-default)"}`,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ font: "var(--text-caption-1-semibold)", color: active ? "var(--semantic-primary-default)" : "var(--semantic-text-sub)" }}>엔진 {engine.no}</span>
        <span style={{ font: "var(--text-label-2-semibold)", color: active ? "var(--semantic-primary-default)" : "var(--semantic-text-default)" }}>{engine.name}</span>
        {concept && (
          <ContentBadge size="compact" backgroundColor="var(--semantic-natural-deep)" contentColor="var(--semantic-text-on-dark)">
            컨셉
          </ContentBadge>
        )}
      </span>
      <span style={{ font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)", whiteSpace: "nowrap" }}>{engine.short}</span>
    </button>
  );
}

function Bullets({ items, columns = 1 }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, columnGap: 24, rowGap: 4 }}>
      {items.map((it) => (
        <li key={it} style={{ font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-default)" }}>
          {it}
        </li>
      ))}
    </ul>
  );
}

function EngineExtras({ engine }) {
  if (engine.id === "e1") {
    return (
      <>
        <SectionTitle sub="판정 검증 기준 — 케이스별 기대 결과가 곧 의미 계약">골든 케이스 5종</SectionTitle>
        <SimpleTable cols={["케이스", "상황", "기대 판정"]} rows={GOLDEN} widths={[96, 220]} />

        <SectionTitle sub="frontend/ — Vite + React, 우리와 같은 디자인 시스템(1.13)">대표님 프로토타입 구성</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
          <FlowFrame title="운영자 콘솔 — SHADOW MODE · L0 INFORM · L1 RECOMMEND" note="진행 단계 표시: NORMAL → COOLING DEGRADATION → THERMAL DEGRADATION → THROTTLING RISK → THROTTLING OBSERVED">
            <FlowRow>
              <FlowCard title="Operational Console" sub="현재 상황·원인·증거" minWidth={0} />
              <FlowCard title="Stored Cases" sub="불변 케이스 5건 · 리플레이" minWidth={0} />
              <FlowCard title="Live Simulation" sub="?mode=live · 시나리오 배치" minWidth={0} />
            </FlowRow>
          </FlowFrame>
          <FlowFrame title="온톨로지 스튜디오 — 7단계" note="문제 정의부터 발행·버전까지 한 흐름. 태그 매핑·위상은 site_config(MOCK)에서 읽는다.">
            <FlowRow>
              {["Problem / Project", "Import / Sources", "Semantic Map", "Topology", "Validation", "Test & Replay", "Publish / Version"].map((s, i, arr) => (
                <span key={s} style={{ display: "contents" }}>
                  <FlowCard title={s} minWidth={0} />
                  {i < arr.length - 1 && <FlowArrow />}
                </span>
              ))}
            </FlowRow>
          </FlowFrame>
        </div>

        <SectionTitle sub="스냅샷은 바뀌지 않고, 사람의 사실은 append-only 레코드로 붙는다">Human-in-the-loop · 결과 검증</SectionTitle>
        <FlowFrame>
          <FlowRow>
            <FlowCard title="불변 AI 케이스" minWidth={0} />
            <FlowArrow />
            <FlowCard title="운영자 확인" sub="ConfirmedCause" minWidth={0} />
            <FlowArrow />
            <FlowCard title="조치 기록" sub="ExecutedAction" minWidth={0} />
            <FlowArrow />
            <FlowCard title="회복·결과 증거" minWidth={0} />
            <FlowArrow />
            <FlowCard active title="PREVENTED | REALIZED | INCONCLUSIVE" minWidth={0} />
          </FlowRow>
        </FlowFrame>

        <SectionTitle sub="대응 후보 — 07_온톨로지설계안_대조의 충돌 항목 정리 전">용어 대응 (우리 데모)</SectionTitle>
        <SimpleTable cols={["엔진 1 객체", "데모 화면"]} rows={TERM_MAP} widths={[280]} />
      </>
    );
  }
  if (engine.id === "e2") {
    return (
      <>
        <SectionTitle sub="한 번에 한 슬라이스 · 매 슬라이스 끝은 아키텍처 리뷰 · 다음 슬라이스 자동 착수 없음">슬라이스 진행 (2026-08-30 기준)</SectionTitle>
        <SimpleTable
          cols={["슬라이스", "범위", "상태"]}
          widths={[88, 260]}
          rows={SLICES.map(([id, scope, st]) => [
            id,
            scope,
            <StateBadge key={id} size="compact" stateIcon variant={SLICE_VARIANT(st)}>
              {st}
            </StateBadge>,
          ])}
        />
        <SectionTitle sub="합성 MOCK 결과로는 아키텍처·결정론 시나리오·계약·리플레이만 보일 수 있다">리뷰된 릴리스 뒤에도 주장하면 안 되는 것</SectionTitle>
        <Bullets items={FORBIDDEN} columns={2} />
      </>
    );
  }
  if (engine.id === "e5") {
    return (
      <>
        <SectionTitle sub="docs/01 §43 — 운영자 대상 결론이 답해야 하는 것">설명이 답해야 하는 10문</SectionTitle>
        <Bullets items={XAI_QUESTIONS} columns={2} />
        <SectionTitle sub="docs/06 §68 — 맞는 배치와 틀린 배치">LLM 배치 규칙</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
          <FlowFrame title="맞음">
            <FlowRow>
              <FlowCard title="구조화 추론" minWidth={0} />
              <FlowArrow />
              <FlowCard title="설명 서비스" minWidth={0} />
              <FlowArrow />
              <FlowCard active title="운영자용 텍스트" minWidth={0} />
            </FlowRow>
          </FlowFrame>
          <FlowFrame title="틀림 — 설계에서 금지">
            <FlowRow>
              <FlowCard title="원시 텔레메트리" minWidth={0} />
              <FlowArrow />
              <FlowCard title="LLM" minWidth={0} />
              <FlowArrow />
              <FlowCard title="근본 원인" minWidth={0} />
            </FlowRow>
          </FlowFrame>
        </div>
      </>
    );
  }
  return null;
}

export default function EngineConcept({ onOpenDemo, onOpenTech, initialEngine = "e1" }) {
  const [engineId, setEngineId] = useState(ENGINES.some((e) => e.id === initialEngine) ? initialEngine : "e1");
  const cur = ENGINES.find((e) => e.id === engineId);

  function go(link) {
    const [kind, target] = link.to;
    if (kind === "demo") onOpenDemo?.(target);
    else onOpenTech?.(target);
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: 680,
        background: "var(--semantic-bg-default)",
        border: "1px solid var(--semantic-line-default)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* 좌측 — 엔진 목록 (기술 검증 뷰와 같은 사이드바 활성 패턴) */}
      <nav style={{ width: 232, flexShrink: 0, borderRight: "1px solid var(--semantic-line-default)", padding: "20px 0" }}>
        <div style={{ padding: "0 20px 8px", font: "var(--text-body-1-normal-semibold)", color: "var(--semantic-text-default)" }}>엔진 컨셉</div>
        <div style={{ padding: "0 20px 12px", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
          대표님이 전달한 AI 엔진 설계 5종. 엔진을 선택하면 역할·경계·전달물과 우리 데모의 대응 화면이 표시됩니다.
        </div>
        {ENGINES.map((e) => {
          const active = e.id === engineId;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => setEngineId(e.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                height: 44,
                padding: "0 16px 0 20px",
                border: "none",
                borderLeft: active ? "4px solid var(--semantic-primary-default)" : "4px solid transparent",
                background: active ? "var(--semantic-primary-extra-light)" : "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ font: "var(--text-caption-1-semibold)", color: active ? "var(--semantic-primary-default)" : "var(--semantic-text-sub)", width: 14, flexShrink: 0 }}>{e.no}</span>
              <span style={{ font: active ? "var(--text-label-2-semibold)" : "var(--text-label-2-regular)", color: active ? "var(--semantic-primary-default)" : "var(--semantic-text-default)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {e.name}
              </span>
              {e.status === "concept" && (
                <span style={{ marginLeft: "auto", font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>컨셉</span>
              )}
            </button>
          );
        })}
        <div style={{ margin: "16px 20px 0", padding: "10px 12px", borderRadius: 8, background: "var(--semantic-bg-light)", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
          출처: <code style={{ font: "var(--text-caption-1-regular)" }}>sk-aidc-proposal/AIDC 컨셉/</code>
          <br />aidc-ontology-main · aidc-prediction-main (2026-08-18 · 08-30 스냅샷). 코드는 실행하지 않고 설계 문서의 정의만 옮겼습니다.
        </div>
      </nav>

      {/* 우측 — 연결 구조 스트립 + 선택 엔진 상세 */}
      <main style={{ flex: 1, minWidth: 0, padding: "20px 32px 40px", overflowY: "auto" }}>
        <FlowFrame title="엔진 연결 구조 — 지금(1) → 다음(2) → 바꿀 것(3) → 승인·실행·학습(4), 설명(5)은 전 출력에 걸친다">
          <FlowRow>
            {ENGINES.filter((e) => e.no <= 4).map((e, i) => (
              <span key={e.id} style={{ display: "contents" }}>
                <EngineChip engine={e} active={e.id === engineId} onClick={() => setEngineId(e.id)} />
                {i < 3 && <FlowArrow planned={e.no >= 2} />}
              </span>
            ))}
          </FlowRow>
          <div style={{ marginTop: 8 }}>
            <EngineChip engine={ENGINES[4]} active={engineId === "e5"} onClick={() => setEngineId("e5")} wide />
          </div>
        </FlowFrame>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", margin: "20px 0 2px" }}>
          <h2 style={{ margin: 0, font: "var(--text-title-2-semibold)", color: "var(--semantic-text-strong)" }}>
            엔진 {cur.no} — {cur.name}
          </h2>
          <StateBadge size="compact" variant={STATUS[cur.status].variant}>{STATUS[cur.status].label}</StateBadge>
        </div>
        <div style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)", marginBottom: 12 }}>
          {cur.en} · 출처: {cur.source}
        </div>

        <div style={{ padding: "12px 16px", borderRadius: 8, background: "var(--semantic-primary-extra-light)", marginBottom: 12 }}>
          <div style={{ font: "var(--text-caption-1-semibold)", color: "var(--semantic-primary-default)", marginBottom: 4 }}>엔진이 답하는 질문</div>
          <div style={{ font: "var(--text-body-1-normal-semibold)", color: "var(--semantic-text-default)" }}>{cur.question}</div>
          {cur.focus && <p style={{ margin: "6px 0 0", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>{cur.focus}</p>}
        </div>

        <FlowFrame title={cur.chainTitle} note={cur.chainNote}>
          <FlowRow>
            {cur.chain.map((c, i) => (
              <span key={c.title} style={{ display: "contents" }}>
                <FlowCard title={c.title} sub={c.sub} minWidth={0} />
                {i < cur.chain.length - 1 && <FlowArrow />}
              </span>
            ))}
          </FlowRow>
        </FlowFrame>

        <SectionTitle>역할 · 경계 · 전달물</SectionTitle>
        <Facts rows={cur.facts} />

        <EngineExtras engine={cur} />

        <SectionTitle sub="이 엔진의 출력이 우리 데모 어디에 놓이는지">우리 데모에서 대응</SectionTitle>
        {cur.links.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
            {cur.links.map((l) => (
              <TextButton key={l.label} variant="assistive" size="small" onClick={() => go(l)}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {l.label}
                  <Icon name="chevron-right-small" size={16} color="var(--semantic-text-sub)" />
                </span>
              </TextButton>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-sub)" }}>{cur.linkNote}</p>
        )}
      </main>
    </div>
  );
}
