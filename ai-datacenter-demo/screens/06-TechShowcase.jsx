// screen-06 · 기술 검증 쇼케이스 — 요소기술 7종을 실제 제품 근거 화면과 함께 확인하는 뷰.
// 좌측: 요소기술 목록(실제 사이드바 활성 패턴: primary-extra-light + 4px 바)
// 우측: 기술별 설명(제품 근거·데모 확인·신규 연계) + 근거 화면 재현(동작형).
// 신규 항목은 "기존 솔루션에 없지만 연계 시 이렇게 보인다" 방향으로 점선+신규 배지 표기.
import { useState } from "react";
import { StateBadge, ContentBadge, TextButton, showToast } from "@idbrnd/design-system";
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

const TECHS = [
  { id: "t1", no: 1, name: "초연결 시계열 분석", status: "direct" },
  { id: "t2", no: 2, name: "계통 간 복합 판단", status: "direct" },
  { id: "t3", no: 3, name: "온톨로지 기반 지식화", status: "design" },
  { id: "t4", no: 4, name: "원인·위험·다음 사건 예측", status: "mixed" },
  { id: "t5", no: 5, name: "SOP 연계 + HITL 학습", status: "direct" },
  { id: "t6", no: 6, name: "Edge + MLOps 운영", status: "direct" },
  { id: "t7", no: 7, name: "멀티퓨전 파이프라인", status: "direct" },
];

// T1 — 융합 이벤트 파이프라인 (실제 시나리오 편집 화면의 노드 구성 축약)
const T1_NODES = [
  { id: "d1", col: 0, y: 36, name: "GPU 작업량", sub: "DCGM/Redfish 수집기", planned: true,
    config: "신규 연계 — GPU 텔레메트리 수집기를 데이터 노드로 등록.\n수집 이후 파이프라인은 현재 제품 구성을 그대로 사용합니다." },
  { id: "d2", col: 0, y: 108, name: "냉각 유량·랙 전력", sub: "센서 노드 · 집계 5초",
    config: "센서 데이터 노드 — 냉각 유량계·전력 멀티미터 측정 항목 연결.\n시계열 저장소에 적재된 값을 사용합니다." },
  { id: "d3", col: 0, y: 180, name: "시간 동기화 감시", sub: "소스 간 시각 정합", planned: true,
    config: "신규 연계 — 소스 간 타임스탬프 정합성 검증.\n동일 시간축 분석의 데이터 품질 전제를 감시합니다." },
  { id: "s1", col: 1, y: 36, name: "변화율 탐지", sub: "급상승 구간 판정",
    config: "GPU 사용률의 변화율 탐지 — 절대값이 정상이어도 평소와 다르게 튀는 구간을 판정.\n민감도는 백분위 슬라이더로 조정합니다." },
  { id: "s2", col: 1, y: 108, name: "EWMA 탐지", sub: "추세 이탈 판정",
    config: "냉각 유량·온도의 추세 이탈 판정 — 실시간 값과 추세선의 차이를 누적 평가.\n민감도는 K값 슬라이더로 조정합니다." },
  { id: "e1", col: 2, y: 72, name: "융합 이벤트", sub: "기준 기간 내 동시 충족",
    config: "융합 이벤트 설정 — 기준 기간(30초~60분 선택) 안에 연결된 조건이 모두 충족될 때만 1건 발생.\nGPU 급상승 + 냉각 반응 이탈이 함께 잡혀야 이벤트가 됩니다." },
  { id: "a1", col: 3, y: 72, name: "상황 제안 + SOP", sub: "담당자 자동 배정",
    config: "발생 이벤트를 상황 제안 에이전트가 장소 기준으로 묶어 이상 상황 1건으로 만들고,\n원인 후보·점검 순서·관련 절차와 함께 담당자에게 전달합니다." },
];
const T1_EDGES = [["d1", "s1"], ["d2", "s2"], ["s1", "e1"], ["s2", "e1"], ["e1", "a1"]];

// T1 — 융합 이벤트로 추출된 탐지 이벤트 (클릭 → 상세 팝업)
const T1_EVENTS = [
  { id: "ev1", name: "GPU 사용률 급상승", badge: "변화율 탐지", variant: "warning", source: "GPU 랙 A열", time: "오늘 13:52",
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

function SectionTitle({ children }) {
  return (
    <h3 style={{ margin: "24px 0 12px", font: "var(--text-body-1-normal-semibold)", color: "var(--semantic-text-default)" }}>
      {children}
    </h3>
  );
}

export default function TechShowcase({ onOpenDemoDetail }) {
  const [tech, setTech] = useState("t1");
  const [popup, setPopup] = useState(null);
  const cur = TECHS.find((t) => t.id === tech);

  return (
    <div
      style={{
        display: "flex",
        minHeight: 720,
        background: "var(--semantic-bg-default)",
        border: "1px solid var(--semantic-line-default)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* 좌측 — 요소기술 목록 (실제 사이드바 활성 패턴) */}
      <nav data-desc="80" style={{ width: 248, flexShrink: 0, borderRight: "1px solid var(--semantic-line-default)", padding: "20px 0" }}>
        <div style={{ padding: "0 20px 12px", font: "var(--text-heading-2-semibold)", color: "var(--semantic-text-default)" }}>
          기술 검증
        </div>
        <div style={{ padding: "0 20px 14px", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
          기술을 선택하면 실제 제품 근거 화면과 설명이 표시됩니다.
        </div>
        {TECHS.map((t) => {
          const active = tech === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTech(t.id)}
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
              <span style={{ font: active ? "var(--text-label-1-semibold)" : "var(--text-label-1-regular)", color: active ? "var(--semantic-primary-default)" : "var(--semantic-text-default)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {t.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 우측 — 기술별 근거 화면 + 설명 */}
      <main style={{ flex: 1, minWidth: 0, padding: "24px 32px 48px", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, font: "var(--text-heading-1-semibold)", color: "var(--semantic-text-strong)" }}>
            {cur.no}. {cur.name}
          </h2>
          <StateBadge size="compact" variant={STATUS[cur.status].variant}>{STATUS[cur.status].label}</StateBadge>
        </div>

        {/* ── T1 초연결 시계열 분석 ── */}
        {tech === "t1" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "14px 0 0" }}>
              <InfoRow label="제품 근거">융합 이벤트 노드(기준 기간 내 복수 조건 동시 충족 시 1건) · 변화율/EWMA/Z-Score 탐지 · 시계열 수집</InfoRow>
              <InfoRow label="신규 연계">GPU 텔레메트리 수집기 · 시간 동기화 감시 — 점선 노드가 추가 위치입니다. 수집 이후 판정·묶음·알림은 현재 제품 그대로 동작합니다.</InfoRow>
            </div>

            <SectionTitle>노드 연결 — 탐지 시나리오 구성</SectionTitle>
            <NodeCanvas nodes={T1_NODES} edges={T1_EDGES} height={250} desc="81" />

            <SectionTitle>이 구성으로 추출된 탐지 이벤트</SectionTitle>
            <div data-desc="82" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--semantic-line-default)",
                    background: "var(--semantic-bg-default)",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <StateBadge size="compact" variant={e.variant}>{e.badge}</StateBadge>
                    <span style={{ marginLeft: "auto", font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{e.time}</span>
                  </span>
                  <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>{e.name}</span>
                  <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>{e.source} · 클릭하면 탐지 데이터 상세가 열립니다</span>
                </button>
              ))}
            </div>

            <SectionTitle>상황 이벤트로 묶임 — 상황 제안 에이전트</SectionTitle>
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
          </div>
        )}

        {/* ── T2 계통 간 복합 판단 ── */}
        {tech === "t2" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "14px 0 0" }}>
              <InfoRow label="제품 근거">설비 그룹 분석 — 계통(설비 그룹) 단위로 여러 설비·센서의 추이를 한 화면에서 비교하고, 계통 이상 탐지 이벤트와 함께 봅니다.</InfoRow>
              <InfoRow label="확인 방법">그룹 전환·측정 항목 선택·탐지 이벤트 선택이 동작합니다. 이벤트를 선택하면 모든 그래프에 발생 시점이 표시되어 "무엇이 함께 움직였나"를 확인합니다.</InfoRow>
            </div>
            <SectionTitle>설비 그룹 분석 상세</SectionTitle>
            <EquipGroupAnalysis desc="84" />
          </div>
        )}

        {/* ── T3 온톨로지 기반 지식화 ── */}
        {tech === "t3" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "14px 0 0" }}>
              <InfoRow label="현재 제품">문서 관리(PDF 업로드 → 임베딩 → 벡터 DB)가 상황 화면의 "관련 매뉴얼"로 연결되어 있습니다.</InfoRow>
              <InfoRow label="설계 확보">설비·상황·원인·위험·SOP를 클래스와 관계로 구조화하는 온톨로지 도메인 팩이 설계 완료 상태입니다 — 아래 점선 구간이 확장 지점입니다.</InfoRow>
            </div>
            <SectionTitle>문서 관리에서 파생되는 지식화 파이프라인</SectionTitle>
            <DocPipeline desc="85" />
          </div>
        )}

        {/* ── T4 원인·위험·다음 사건 예측 ── */}
        {tech === "t4" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "14px 0 0" }}>
              <InfoRow label="제품 근거">원인 가설 + 유사 사례 제공. "냉각 반응 지연 → 랙 온도 상승 → 성능 저하" 연쇄가 데모 진행 단계 구성 그대로입니다.</InfoRow>
              <InfoRow label="재활용">기존 효율 저하 탐지의 EWMA 오차 추세 판정 구조에서 예측 모델 자리만 교체합니다 — 판정 로직 재사용.</InfoRow>
              <InfoRow label="노드 구성">데이터 수집·탐지·융합 노드 구성은 기술 1의 노드 연결 화면과 동일 계열입니다.</InfoRow>
            </div>
            <SectionTitle>내부 구조 — 예측 판정과 진행 단계 엔진</SectionTitle>
            <PredictionEngine desc="86" />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <TextButton variant="assistive" size="small" onClick={onOpenDemoDetail}>운영 데모: 진행 단계 타임라인·개입 여지 보기</TextButton>
              <TextButton variant="assistive" size="small" onClick={() => setTech("t1")}>기술 1: 노드 연결 화면 보기</TextButton>
            </div>
          </div>
        )}

        {/* ── T5 SOP + HITL ── */}
        {tech === "t5" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "14px 0 0" }}>
              <InfoRow label="제품 근거">상황별 관련 매뉴얼 자동 연결 · 조치 이력 태그(현상→원인→조치) · 24시간 후 팀 지식 적립 · 이의제기 · 오탐 되먹임 — 전부 현재 제품 프로세스입니다.</InfoRow>
              <InfoRow label="확인 방법">아래는 실제 조치 이력 기록 화면 그대로입니다. 태그 선택부터 예측 판정, 처리 완료까지 흐름이 동작합니다.</InfoRow>
            </div>
            <SectionTitle>조치 이력 기록 — 실제 프로세스 화면</SectionTitle>
            <div data-desc="87" style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 10, padding: "16px 20px" }}>
              <ActionRecord
                onBack={() => {}}
                onSubmit={() => showToast({ message: "조치 이력이 저장됐습니다.", variant: "positive" })}
              />
            </div>
          </div>
        )}

        {/* ── T6 Edge + MLOps ── */}
        {tech === "t6" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "14px 0 0" }}>
              <InfoRow label="제품 근거">엣지 디바이스 관리 · 모델 관리(재학습·배포·연합학습) · 연결 데이터 관리(수집 상태 4분류·값 고착 감지·자동 차단/복구)</InfoRow>
              <InfoRow label="신규 연계">데이터센터 표준 프로토콜 어댑터는 설치·연동 방식으로 추가됩니다 — 아래 점선 카드.</InfoRow>
            </div>
            <SectionTitle>운영 관리 화면</SectionTitle>
            <OpsManagement desc="88" />
          </div>
        )}

        {/* ── T7 멀티퓨전 파이프라인 ── */}
        {tech === "t7" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "14px 0 0" }}>
              <InfoRow label="제품 근거">노드 캔버스에서 영상·센서·운영 DB·AI 모델을 조합해 탐지부터 상황·SOP까지 하나의 시나리오로 구성합니다 — 개발 없이 설정으로.</InfoRow>
              <InfoRow label="신규 연계">온톨로지 추론·SOP 선택 노드가 추가 지점입니다(점선). 이 시나리오의 출력이 운영 데모 화면입니다.</InfoRow>
            </div>
            <SectionTitle>시나리오 설정 — 전체 플로우</SectionTitle>
            <NodeCanvas
              desc="89"
              height={300}
              nodes={[
                { id: "v", col: 0, y: 36, name: "영상 (CCTV)", sub: "화재·연기 모델 입력", config: "영상 데이터 노드 — AI 모델 노드와 연결해 화재·연기 탐지에 사용합니다." },
                { id: "sn", col: 0, y: 108, name: "센서·설비 계측", sub: "온도·유량·전력", config: "센서 데이터 노드 — 측정 항목 단위로 연결합니다." },
                { id: "db", col: 0, y: 180, name: "운영 DB", sub: "EMS·BMS 시계열", config: "데이터베이스 노드 — 운영 시스템의 시계열 컬럼을 연결합니다." },
                { id: "ai", col: 1, y: 36, name: "AI 모델 탐지", sub: "영상·이상치 모델", config: "AI 패키지 노드 — 배포된 모델로 판정합니다. 모델 관리에서 재학습·배포를 관리합니다." },
                { id: "th", col: 1, y: 108, name: "임계·EWMA 탐지", sub: "규칙 기반 판정", config: "탐지 설정 노드 — 임계치·변화율·추세 이탈 판정." },
                { id: "on", col: 1, y: 180, name: "온톨로지 추론", sub: "원인·위험·경로", planned: true, config: "신규 연계 — 계통 관계 기반 원인 후보·위험 진행·점검 경로 추론. 설계 확보 상태입니다." },
                { id: "fu", col: 2, y: 72, name: "융합 이벤트", sub: "복합 조건 1건", config: "융합 이벤트 설정 — 기준 기간 내 복수 조건 동시 충족 시 1건." },
                { id: "sp", col: 2, y: 160, name: "SOP 선택", sub: "상황별 절차 연결", planned: true, config: "신규 연계 — 판정 결과에 맞는 절차 문서를 선택해 상황에 붙입니다." },
                { id: "out", col: 3, y: 110, name: "상황 제안·알림", sub: "운영 데모 화면", config: "상황 제안 에이전트가 묶은 상황이 대시보드·알림 센터·상세 화면으로 전달됩니다." },
              ]}
              edges={[["v", "ai"], ["sn", "th"], ["db", "th"], ["ai", "fu"], ["th", "fu"], ["on", "sp"], ["fu", "out"], ["sp", "out"]]}
            />
            <div style={{ marginTop: 12 }}>
              <TextButton variant="assistive" size="small" onClick={onOpenDemoDetail}>이 파이프라인의 출력 — 운영 데모에서 보기</TextButton>
            </div>
          </div>
        )}
      </main>

      <DetectionPopup event={popup} onClose={() => setPopup(null)} />
    </div>
  );
}
