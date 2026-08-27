// AI 데이터센터 데모 — GPU 부하와 냉각 반응 시나리오 와이어프레임.
// 실제 PG 레이아웃(AppHeader + Sidebar + 흰 배경 콘텐츠)을 따른다.
// 라우팅: 대시보드(이상 상황 목록 위젯) → 이상 상황 상세 → 조치 이력 기록.
// 이상 상황 목록은 실제 PG처럼 대시보드 위젯이며 별도 페이지가 아니다.
//
// 설명 모드·시뮬레이터·가이드 투어는 정책·방향성 확정 후 재도입 예정으로 제거 상태(2026-08-27).
// 타이포는 `font: var(--text-*)` 토큰만, 색상은 var(--semantic-*)/var(--category-*)만 쓴다.
// 토큰은 data-idb-component 스코프 안에서만 정의된다 — 루트 속성 유지.
import { useState } from "react";
import "@idbrnd/design-system/style.css";
import { showToast } from "@idbrnd/design-system";
import { AppShell } from "./components/AppShell";
import Dashboard from "./screens/01-Dashboard";
import SituationDetail from "./screens/03-SituationDetail";
import ActionRecord from "./screens/04-ActionRecord";
import AlertCenterDrawer, { MOCK_ALERTS } from "./screens/AlertCenterDrawer";

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedStage, setSelectedStage] = useState(2);
  const [assigned, setAssigned] = useState(false);

  // 알림 센터 — 읽음 상태를 상위에서 관리해 헤더 벨 배지와 동기화
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertReadIds, setAlertReadIds] = useState([]);
  const alertUnread = MOCK_ALERTS.filter((a) => a.unread && !alertReadIds.includes(a.id)).length;

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
      <div style={{ flex: 1, padding: "16px 24px 40px" }}>
        <AppShell
          current="dashboard"
          onNavigate={() => setScreen("dashboard")}
          alertCount={alertUnread}
          onOpenAlerts={() => setAlertOpen((v) => !v)}
        >
          {screen === "dashboard" && (
            <Dashboard
              onOpenSituation={() => {
                setScreen("detail");
                setSelectedStage(2);
              }}
            />
          )}

          {screen === "detail" && (
            <SituationDetail
              onBack={() => setScreen("dashboard")}
              onOpenRecord={() => setScreen("record")}
              selectedStage={selectedStage}
              onSelectStage={setSelectedStage}
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
              onSubmit={() => {
                setScreen("detail");
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
          setSelectedStage(2);
        }}
      />
    </div>
  );
}
