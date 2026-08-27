// AI 데이터센터 데모 — GPU 부하와 냉각 반응 시나리오 와이어프레임.
// 실제 PG 레이아웃(AppHeader + Sidebar + 흰 배경 콘텐츠)을 따른다.
// 라우팅: 대시보드(이상 상황 목록 위젯) → 이상 상황 상세 → 조치 이력 기록.
// 이상 상황 목록은 실제 PG처럼 대시보드 위젯이며 별도 페이지가 아니다.
//
// 타이포는 `font: var(--text-*)` 토큰만, 색상은 var(--semantic-*)/var(--category-*)만 쓴다.
// 토큰은 data-idb-component 스코프 안에서만 정의된다 — 루트 속성 유지.
import { useState } from "react";
import "@idbrnd/design-system/style.css";
import { showToast } from "@idbrnd/design-system";
import "./inspection.css";
import { AppShell } from "./components/AppShell";
import Dashboard from "./screens/01-Dashboard";
import SituationDetail from "./screens/03-SituationDetail";
import ActionRecord from "./screens/04-ActionRecord";
import AlertCenterDrawer, { MOCK_ALERTS } from "./screens/AlertCenterDrawer";
import DemoPanel from "./components/DemoPanel";
import { InspectionProvider, useInspection } from "./components/InspectionContext";
import { PolicyIndexPanel } from "./components/PolicyIndexPanel";
import { TourProvider, GuideTourButton, TourBar } from "./components/GuideTour";

function InspectionToggle() {
  const { active, toggle } = useInspection();
  return (
    <button className={`insp-toggle${active ? " active" : ""}`} onClick={toggle}>
      <span className="insp-toggle-dot" />
      {active ? "설명 모드 ON" : "설명 모드"}
    </button>
  );
}

function AppInner() {
  const { active, panelWidth } = useInspection();

  const [screen, setScreen] = useState("dashboard");
  const [selectedStage, setSelectedStage] = useState(2);
  const [assigned, setAssigned] = useState(false);

  // 알림 센터 — 읽음 상태를 상위에서 관리해 헤더 벨 배지와 동기화
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertReadIds, setAlertReadIds] = useState([]);
  const alertUnread = MOCK_ALERTS.filter((a) => a.unread && !alertReadIds.includes(a.id)).length;

  // 프로토타입 시뮬레이터 상태
  const [lowConfidence, setLowConfidence] = useState(false);
  const [coolingSignalLost, setCoolingSignalLost] = useState(false);
  const [topologyMissing, setTopologyMissing] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const demoItems = [
    {
      id: "low-confidence",
      name: "확신도 미달",
      desc: "확신도가 기준 아래로 내려간 상태 · 개입 여지 표시가 사라지고 현장 확인 안내로 바뀐다",
      active: lowConfidence,
      onToggle: () => setLowConfidence((v) => !v),
    },
    {
      id: "cooling-lost",
      name: "냉각 계통 신호 단절",
      desc: "냉각 데이터를 수집하지 못하는 상태 · 단계 판정이 중단되고 직전 단계를 유지한다",
      active: coolingSignalLost,
      onToggle: () => {
        const next = !coolingSignalLost;
        setCoolingSignalLost(next);
        // ON: 현재 단계(1)를 넘는 선택만 클램프. OFF: 사용자가 골라둔 단계 유지
        if (next) setSelectedStage((v) => Math.min(v, 1));
      },
    },
    {
      id: "topology-missing",
      name: "계통 미등록 구역",
      desc: "계통 연결이 등록되지 않은 구역 · 점검 순서 대신 안내 문구가 표시된다",
      active: topologyMissing,
      onToggle: () => setTopologyMissing((v) => !v),
    },
    {
      id: "draft",
      name: "작성 중인 조치 이력",
      desc: "자동 저장된 초안이 있는 상태 · 기록 입력 패널에 안내가 표시된다",
      active: hasDraft,
      onToggle: () => setHasDraft((v) => !v),
    },
  ];

  return (
    <div
      data-idb-component
      style={{
        minHeight: "100vh",
        background: "var(--semantic-bg-light)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", flexShrink: 0 }}>
        <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-sub)" }}>
          AI 데이터센터 데모 — 와이어프레임
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <InspectionToggle />
          <GuideTourButton />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: "8px 24px 40px",
          paddingRight: active ? panelWidth + 56 : 24,
          transition: "padding-right .12s ease",
        }}
      >
        <DemoPanel items={demoItems} />

        <AppShell
          current="dashboard"
          onNavigate={() => setScreen("dashboard")}
          alertCount={alertUnread}
          onOpenAlerts={() => setAlertOpen((v) => !v)}
        >
          {screen === "dashboard" && (
            <Dashboard
              lowConfidence={lowConfidence}
              coolingSignalLost={coolingSignalLost}
              onOpenSituation={() => {
                setScreen("detail");
                setSelectedStage(coolingSignalLost ? 1 : 2);
              }}
            />
          )}

          {screen === "detail" && (
            <SituationDetail
              onBack={() => setScreen("dashboard")}
              onOpenRecord={() => setScreen("record")}
              selectedStage={selectedStage}
              onSelectStage={setSelectedStage}
              lowConfidence={lowConfidence}
              coolingSignalLost={coolingSignalLost}
              topologyMissing={topologyMissing}
              assigned={assigned}
              onAssign={() => {
                setAssigned(true);
                showToast({ message: "확인을 시작하여 담당자로 지정되었습니다." });
              }}
            />
          )}

          {screen === "record" && (
            <ActionRecord
              onBack={() => setScreen("detail")}
              hasDraft={hasDraft}
              onSubmit={() => {
                setScreen("detail");
                setHasDraft(false);
                showToast({ message: "조치 이력이 저장됐습니다.", variant: "positive" });
              }}
            />
          )}
        </AppShell>
      </div>

      <AlertCenterDrawer
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        readIds={alertReadIds}
        onChangeReadIds={setAlertReadIds}
        onOpenSituation={() => {
          setScreen("detail");
          setSelectedStage(coolingSignalLost ? 1 : 2);
        }}
      />

      <PolicyIndexPanel />
      <TourBar />
    </div>
  );
}

export default function App() {
  return (
    <InspectionProvider>
      <TourProvider>
        <AppInner />
      </TourProvider>
    </InspectionProvider>
  );
}
