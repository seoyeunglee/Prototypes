// screen-06 · 기술 검증 쇼케이스 — 요소기술 7종을 실제 제품 근거 화면과 함께 확인하는 뷰.
// 구성(2026-08-27 개편): 좌측 요소기술 목록(실제 사이드바 활성 패턴) ·
// 우측 = 스냅샷 스텝퍼(동작 프로토타입 화면을 옆으로 넘기며 프로세스 확인) + 하단 정리 설명.
// 신규 항목은 "기존 솔루션에 없지만 연계 시 이렇게 보인다" 방향으로 점선+신규 배지 표기.
import { useState } from "react";
import { Icon, StateBadge, ContentBadge, TextButton, BasicIconButton, showToast } from "@idbrnd/design-system";
import NodeCanvas from "../components/tech/NodeCanvas";
import DetectionPopup from "../components/tech/DetectionPopup";
import EquipGroupAnalysis from "../components/tech/EquipGroupAnalysis";
import DocPipeline from "../components/tech/DocPipeline";
import PredictionEngine from "../components/tech/PredictionEngine";
import OpsManagement from "../components/tech/OpsManagement";
import ActionRecord from "./04-ActionRecord";

const STATUS = {
  direct: { label: "직접 — 현재 제품 동작", variant: "success" },
  mixed: { label: "직접+간접 — 기존 구조 전용", variant: "info" },
  design: { label: "설계 확보 — 구현 단계", variant: "warning" },
};

// T1 — 융합 이벤트 파이프라인 (실제 시나리오 설정 화면의 노드 구성 축약)
const T1_NODES = [
  { id: "d1", col: 0, y: 34, name: "GPU 작업량", sub: "DCGM/Redfish 수집기", planned: true,
    config: "신규 연계 — GPU 텔레메트리 수집기를 데이터 노드로 등록.\n수집 이후 파이프라인은 현재 제품 구성을 그대로 사용합니다." },
  { id: "d2", col: 0, y: 122, name: "냉각 유량·랙 전력", sub: "센서 노드 · 집계 5초",
    config: "센서 데이터 노드 — 냉각 유량계·전력 멀티미터 측정 항목 연결.\n시계열 저장소에 적재된 값을 사용합니다." },
  { id: "d3", col: 0, y: 210, name: "시간 동기화 감시", sub: "소스 간 시각 정합", planned: true,
    config: "신규 연계 — 소스 간 타임스탬프 정합성 검증.\n동일 시간축 분석의 데이터 품질 전제를 감시합니다." },
  { id: "s1", col: 1, y: 34, name: "변화율 탐지", sub: "급상승 구간 판정",
    config: "GPU 사용률의 변화율 탐지 — 절대값이 정상이어도 평소와 다르게 튀는 구간을 판정.\n민감도는 백분위 슬라이더로 조정합니다." },
  { id: "s2", col: 1, y: 122, name: "EWMA 탐지", sub: "추세 이탈 판정",
    config: "냉각 유량·온도의 추세 이탈 판정 — 실시간 값과 추세선의 차이를 누적 평가.\n민감도는 K값 슬라이더로 조정합니다." },
  { id: "e1", col: 2, y: 78, name: "융합 이벤트", sub: "기준 기간 내 동시 충족",
    config: "융합 이벤트 설정 — 기준 기간(30초~60분 선택) 안에 연결된 조건이 모두 충족될 때만 1건 발생.\nGPU 급상승 + 냉각 반응 이탈이 함께 잡혀야 이벤트가 됩니다." },
  { id: "a1", col: 3, y: 78, name: "상황 제안 + SOP", sub: "담당자 자동 배정",
    config: "발생 이벤트를 상황 제안 에이전트가 장소 기준으로 묶어 이상 상황 1건으로 만들고,\n원인 후보·점검 순서·관련 절차와 함께 담당자에게 전달합니다." },
];
const T1_EDGES = [["d1", "s1"], ["d2", "s2"], ["s1", "e1"], ["s2", "e1"], ["e1", "a1"]];

const T7_NODES = [
  { id: "v", col: 0, y: 34, name: "영상 (CCTV)", sub: "화재·연기 모델 입력", config: "영상 데이터 노드 — AI 모델 노드와 연결해 화재·연기 탐지에 사용합니다." },
  { id: "sn", col: 0, y: 122, name: "센서·설비 계측", sub: "온도·유량·전력", config: "센서 데이터 노드 — 측정 항목 단위로 연결합니다." },
  { id: "db", col: 0, y: 210, name: "운영 DB", sub: "EMS·BMS 시계열", config: "데이터베이스 노드 — 운영 시스템의 시계열 컬럼을 연결합니다." },
  { id: "ai", col: 1, y: 34, name: "AI 모델 탐지", sub: "영상·이상치 모델", config: "AI 패키지 노드 — 배포된 모델로 판정합니다. 모델 관리에서 재학습·배포를 관리합니다." },
  { id: "th", col: 1, y: 122, name: "임계·EWMA 탐지", sub: "규칙 기반 판정", config: "탐지 설정 노드 — 임계치·변화율·추세 이탈 판정." },
  { id: "on", col: 1, y: 210, name: "온톨로지 추론", sub: "원인·위험·경로", planned: true, config: "신규 연계 — 계통 관계 기반 원인 후보·위험 진행·점검 경로 추론. 설계 확보 상태입니다." },
  { id: "fu", col: 2, y: 66, name: "융합 이벤트", sub: "복합 조건 1건", config: "융합 이벤트 설정 — 기준 기간 내 복수 조건 동시 충족 시 1건." },
  { id: "sp", col: 2, y: 178, name: "SOP 선택", sub: "상황별 절차 연결", planned: true, config: "신규 연계 — 판정 결과에 맞는 절차 문서를 선택해 상황에 붙입니다." },
  { id: "out", col: 3, y: 122, name: "상황 제안·알림", sub: "운영 데모 화면", config: "상황 제안 에이전트가 묶은 상황이 대시보드·알림 센터·상세 화면으로 전달됩니다." },
];
const T7_EDGES = [["v", "ai"], ["sn", "th"], ["db", "th"], ["ai", "fu"], ["th", "fu"], ["on", "sp"], ["fu", "out"], ["sp", "out"]];

// T1 — 융합 이벤트로 추출된 탐지 이벤트 (클릭 → 상세 팝업)
const T1_EVENTS = [
  { id: "ev1", name: "GPU 사용률 급상승", badge: "변화율 탐지", variant: "warning", source: "GPU 랙 A열", time: "오늘 13:52", planned: true,
    points: "0,30 20,32 35,52 50,76 70,82 100,84", avg: 40, marker: 50, color: "var(--category-001)",
    yMax: "96%", yMin: "38%", value: "94%", avgLabel: "62%", rule: "변화율 급상승 구간",
    note: "절대값이 임계 안이어도 평소 대비 상승 속도가 판정 기준을 넘으면 이벤트가 됩니다." },
  { id: "ev2", name: "냉각 유량 추세 이탈", badge: "EWMA 탐지", variant: "error", source: "냉각 분기 2", time: "오늘 14:07",
    points: "0,62 25,61 45,60 60,52 75,40 100,34", avg: 60, marker: 75, color: "var(--category-003)",
    yMax: "157L/min", yMin: "118L/min", value: "118L/min", avgLabel: "140L/min", rule: "추세 이탈 누적",
    note: "부하 상승 시 기대되는 유량 증가가 나타나지 않아 추세 이탈로 판정됐습니다." },
];

function InfoRow({ label, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 10, alignItems: "start" }}>
      <span style={{ font: "var(--text-label-2-semibold)", color: "var(--semantic-text-sub)" }}>{label}</span>
      <span style={{ font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-default)" }}>{children}</span>
    </div>
  );
}

export default function TechShowcase({ onOpenDemoDetail }) {
  const [tech, setTech] = useState("t1");
  const [stepIdx, setStepIdx] = useState(0);
  const [popup, setPopup] = useState(null);

  function goTech(id) {
    setTech(id);
    setStepIdx(0);
  }

  // T1 스텝 콘텐츠
  const t1Events = (
    <div data-desc="82">
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {T1_EVENTS.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setPopup(e)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              minWidth: 220,
              textAlign: "left",
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid var(--semantic-line-default)",
              background: "var(--semantic-bg-default)",
              cursor: "pointer",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <StateBadge size="compact" variant={e.variant}>{e.badge}</StateBadge>
              {e.planned && (
                <ContentBadge size="compact" backgroundColor="var(--semantic-natural-deep)" contentColor="var(--semantic-text-on-dark)">
                  연계 후 예시
                </ContentBadge>
              )}
              <span style={{ marginLeft: "auto", font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{e.time}</span>
            </span>
            <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>{e.name}</span>
            <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>{e.source} · 클릭하면 탐지 데이터 상세가 열립니다</span>
          </button>
        ))}
      </div>
    </div>
  );

  const t1Situation = (
    <div data-desc="83" style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, padding: "12px 16px", maxWidth: 560 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        <ContentBadge size="compact" backgroundColor="var(--semantic-natural-deep)" contentColor="var(--semantic-text-on-dark)">New</ContentBadge>
        <StateBadge size="compact" variant="error">심각도 높음</StateBadge>
        <span style={{ font: "var(--text-body-2-normal-semibold)", color: "var(--semantic-text-default)" }}>GPU 랙 A열 냉각 반응 지연</span>
      </div>
      <p style={{ margin: "0 0 8px", font: "var(--text-label-2-reading-regular)", color: "var(--semantic-text-sub)" }}>
        위 탐지 이벤트 2건이 같은 장소 기준으로 이상 상황 1건으로 묶였습니다. 운영자는 알람 목록이 아니라 상황 1건을 받습니다.
      </p>
      <TextButton variant="assistive" size="small" onClick={onOpenDemoDetail}>운영 데모 상세에서 보기</TextButton>
    </div>
  );

  // 기술별 정의: 상태 · 스텝(스냅샷) · 하단 정리
  const TECHS = [
    {
      id: "t1", no: 1, name: "초연결 시계열 분석", status: "direct",
      steps: [
        { title: "노드 연결 — 탐지 시나리오 구성", caption: "실제 시나리오 설정 화면의 노드 파이프라인입니다. 노드를 선택하면 설정이 표시됩니다.",
          render: () => <NodeCanvas nodes={T1_NODES} edges={T1_EDGES} height={288} desc="81" /> },
        { title: "추출된 탐지 이벤트", caption: "점선(신규) 노드를 거치는 이벤트는 연계 후 동작 예시입니다. 나머지는 현재 제품 판정 그대로입니다.",
          render: () => t1Events },
        { title: "상황 이벤트로 묶임", caption: "상황 제안 에이전트가 장소 기준으로 묶은 결과입니다.",
          render: () => t1Situation },
      ],
      summary: [
        ["제품 근거", "융합 이벤트 노드(기준 기간 내 복수 조건 동시 충족 시 1건) · 변화율/EWMA/Z-Score 탐지 · 시계열 수집"],
        ["신규 연계", "GPU 텔레메트리 수집기 · 시간 동기화 감시 — 수집 이후 판정·묶음·알림은 현재 제품 그대로 동작합니다."],
      ],
    },
    {
      id: "t2", no: 2, name: "계통 간 복합 판단", status: "direct",
      steps: [
        { title: "설비 그룹 분석 상세", caption: "그룹 전환·측정 항목 선택이 동작합니다. 탐지 이벤트를 선택하면 모든 그래프에 발생 시점이 표시됩니다.",
          render: () => <EquipGroupAnalysis desc="84" /> },
      ],
      summary: [
        ["제품 근거", "설비 그룹 분석 — 계통(설비 그룹) 단위로 여러 설비·센서의 추이를 한 화면에서 비교하고, 계통 이상 탐지 이벤트와 함께 봅니다."],
        ["확인 포인트", "이벤트 선택 시 전 그래프에 발생 시점 마커 — \"무엇이 함께 움직였나\"를 계통 단위로 확인합니다."],
      ],
    },
    {
      id: "t3", no: 3, name: "온톨로지 기반 지식화", status: "design",
      steps: [
        { title: "문서 관리 — 등록 현황", caption: "현재 제품 동작 — PDF 업로드부터 벡터 DB 적재까지. 상황 화면의 관련 매뉴얼이 여기서 연결됩니다.",
          render: () => <DocPipeline part="docs" desc="85" /> },
        { title: "지식화 파이프라인", caption: "실선은 현재 제품 동작, 점선은 설계 확보 구간(온톨로지 도메인 팩)입니다.",
          render: () => <DocPipeline part="pipeline" desc="85" /> },
      ],
      summary: [
        ["제품 근거", "문서 관리(PDF → 임베딩 → 벡터 DB)가 상황 화면의 관련 매뉴얼로 연결되어 있습니다."],
        ["설계 확보", "설비·상황·원인·위험·SOP를 클래스와 관계로 구조화하는 온톨로지 도메인 팩 — 클래스·관계·규칙·검증 케이스 정의 완료, 구현 단계."],
      ],
    },
    {
      id: "t4", no: 4, name: "원인·위험·다음 사건 예측", status: "mixed",
      steps: [
        { title: "EWMA 오차 추세 판정", caption: "기존 효율 저하 탐지 구조에서 예측 모델 자리만 교체합니다 — 판정 로직 재사용.",
          render: () => <PredictionEngine part="ewma" desc="86" /> },
        { title: "진행 단계 판정 엔진", caption: "5단계 전이와 판정 안정성 규칙 — 단계 진입 조건은 도메인 승인 대기입니다.",
          render: () => <PredictionEngine part="stages" desc="86" /> },
      ],
      summary: [
        ["제품 근거", "원인 가설 + 유사 사례 제공. \"냉각 반응 지연 → 랙 온도 상승 → 성능 저하\" 연쇄가 데모 진행 단계 구성 그대로입니다."],
        ["노드 구성", "데이터 수집·탐지·융합 노드 구성은 기술 1의 노드 연결 화면과 동일 계열입니다."],
      ],
      links: [
        { label: "운영 데모: 진행 단계 타임라인·개입 여지 보기", onClick: onOpenDemoDetail },
        { label: "기술 1: 노드 연결 화면 보기", onClick: () => goTech("t1") },
      ],
    },
    {
      id: "t5", no: 5, name: "SOP 연계 + HITL 학습", status: "direct",
      steps: [
        { title: "조치 이력 기록 — 실제 프로세스 화면", caption: "실제 조치 이력 기록 화면 그대로입니다. 태그 선택부터 예측 판정, 처리 완료까지 흐름이 동작합니다.",
          render: () => (
            <div data-desc="87" style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 12, padding: "16px 20px" }}>
              <ActionRecord
                onBack={() => showToast({ message: "기술 검증 미리보기 화면입니다. 흐름은 이 안에서 이어집니다." })}
                onSubmit={() => showToast({ message: "조치 이력이 저장됐습니다.", variant: "positive" })}
              />
            </div>
          ) },
      ],
      summary: [
        ["제품 근거", "상황별 관련 매뉴얼 자동 연결 · 조치 이력 태그(현상→원인→조치) · 24시간 후 팀 지식 적립 · 이의제기 · 오탐 되먹임 — 전부 현재 제품 프로세스입니다."],
      ],
    },
    {
      id: "t6", no: 6, name: "Edge + MLOps 운영", status: "direct",
      steps: [
        { title: "엣지 디바이스 관리", caption: "현장 센서 - 엣지 - 서버 구조. 디바이스 상태·리소스를 상시 감시합니다.",
          render: () => <OpsManagement section="edge" desc="88" /> },
        { title: "모델 관리", caption: "성능 점검·재학습·배포·연합학습을 이 화면에서 수행합니다.",
          render: () => <OpsManagement section="model" desc="88" /> },
        { title: "연결 데이터 관리", caption: "수집 상태 4분류 · 값 고착 감지 · 이상 소스를 쓰는 탐지 자동 차단, 복구 시 자동 재개.",
          render: () => <OpsManagement section="data" desc="88" /> },
        { title: "신규 연계 — 프로토콜 어댑터", caption: "설치형 어댑터로 기존 EMS·BMS·GPU 텔레메트리를 연결하는 방식입니다.",
          render: () => <OpsManagement section="adapter" desc="88" /> },
      ],
      summary: [
        ["제품 근거", "엣지 디바이스 관리 · 모델 관리(재학습·배포·연합학습) · 연결 데이터 관리 — 제품 기존 화면입니다."],
        ["신규 연계", "Modbus-TCP · BACnet/IP · SNMP · Redfish/DCGM 어댑터 — 수집 이후 감시·차단·복구 체계는 현재 제품 그대로."],
      ],
    },
    {
      id: "t7", no: 7, name: "멀티퓨전 파이프라인", status: "direct",
      steps: [
        { title: "시나리오 설정 — 전체 플로우", caption: "영상·센서·운영 DB·AI 모델·규칙 판정을 한 시나리오로 연결합니다. 온톨로지 추론·SOP 선택은 신규 연계(점선)입니다.",
          render: () => <NodeCanvas nodes={T7_NODES} edges={T7_EDGES} height={306} desc="89" /> },
      ],
      summary: [
        ["제품 근거", "노드 캔버스에서 탐지부터 상황·SOP까지 하나의 시나리오로 구성합니다 — 개발 없이 설정으로."],
        ["출력", "이 시나리오의 출력이 운영 데모 화면(대시보드·상세·알림)입니다."],
      ],
      links: [{ label: "이 파이프라인의 출력 — 운영 데모에서 보기", onClick: onOpenDemoDetail }],
    },
  ];

  const cur = TECHS.find((t) => t.id === tech);
  const si = Math.min(stepIdx, cur.steps.length - 1);
  const step = cur.steps[si];

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
      {/* 좌측 — 요소기술 목록 (실제 사이드바 활성 패턴) */}
      <nav data-desc="80" style={{ width: 232, flexShrink: 0, borderRight: "1px solid var(--semantic-line-default)", padding: "20px 0" }}>
        <div style={{ padding: "0 20px 8px", font: "var(--text-body-1-normal-semibold)", color: "var(--semantic-text-default)" }}>
          기술 검증
        </div>
        <div style={{ padding: "0 20px 12px", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
          기술을 선택하면 근거 화면과 설명이 표시됩니다.
        </div>
        {TECHS.map((t) => {
          const active = tech === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => goTech(t.id)}
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
              <span style={{ font: "var(--text-caption-1-semibold)", color: active ? "var(--semantic-primary-default)" : "var(--semantic-text-sub)", width: 14, flexShrink: 0 }}>
                {t.no}
              </span>
              <span style={{ font: active ? "var(--text-label-2-semibold)" : "var(--text-label-2-regular)", color: active ? "var(--semantic-primary-default)" : "var(--semantic-text-default)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {t.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 우측 — 스냅샷 스텝퍼 + 하단 정리 */}
      <main style={{ flex: 1, minWidth: 0, padding: "20px 32px 40px", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <h2 style={{ margin: 0, font: "var(--text-title-2-semibold)", color: "var(--semantic-text-strong)" }}>
            {cur.no}. {cur.name}
          </h2>
          <StateBadge size="compact" variant={STATUS[cur.status].variant}>{STATUS[cur.status].label}</StateBadge>
        </div>

        {/* 스냅샷 헤더 — 이전/다음 + 단계 표시 */}
        <div data-desc="91" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <BasicIconButton onClick={() => setStepIdx(Math.max(0, si - 1))} disabled={si === 0} aria-label="이전 단계">
            <Icon name="chevron-left" size={20} color={si === 0 ? "var(--semantic-natural-strong)" : "var(--semantic-text-default)"} />
          </BasicIconButton>
          <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>
            {step.title}
          </span>
          <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)", fontVariantNumeric: "tabular-nums" }}>
            {si + 1} / {cur.steps.length}
          </span>
          <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
            {cur.steps.map((s, i) => (
              <span
                key={s.title}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: i === si ? "var(--semantic-primary-default)" : "var(--semantic-natural-strong)",
                }}
              />
            ))}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <BasicIconButton onClick={() => setStepIdx(Math.min(cur.steps.length - 1, si + 1))} disabled={si === cur.steps.length - 1} aria-label="다음 단계">
              <Icon name="chevron-right" size={20} color={si === cur.steps.length - 1 ? "var(--semantic-natural-strong)" : "var(--semantic-text-default)"} />
            </BasicIconButton>
          </div>
        </div>

        {/* 스냅샷 프레임 */}
        <div data-desc="92" style={{ minHeight: 320 }}>
          {step.render()}
          <p style={{ margin: "8px 0 0", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
            {step.caption}
          </p>
        </div>

        {/* 하단 정리 */}
        <div
          data-desc="93"
          style={{
            marginTop: 24,
            padding: "16px 20px",
            borderRadius: 8,
            background: "var(--semantic-bg-light)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>정리</span>
          {cur.summary.map(([label, text]) => (
            <InfoRow key={label} label={label}>{text}</InfoRow>
          ))}
          {cur.links && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {cur.links.map((l) => (
                <TextButton key={l.label} variant="assistive" size="small" onClick={l.onClick}>
                  {l.label}
                </TextButton>
              ))}
            </div>
          )}
        </div>
      </main>

      <DetectionPopup event={popup} onClose={() => setPopup(null)} />
    </div>
  );
}
