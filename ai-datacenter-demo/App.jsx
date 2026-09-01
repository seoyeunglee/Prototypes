// AI 데이터센터 데모 — GPU 부하와 냉각 반응 시나리오 와이어프레임.
// 실제 PG 레이아웃(AppHeader + Sidebar + 흰 배경 콘텐츠)을 따른다.
// 라우팅: 대시보드(이상 상황 목록 위젯) → 이상 상황 상세 → 조치 이력 기록.
//         연결 데이터 관리 / 설비 그룹 분석 상세는 캡처 모드 URL로 진입한다.
// 보기 전환(상단 SegmentedControl): 운영 데모 | 기술 검증 | 엔진 컨셉(대표님 전달 AI 엔진 설계 5종 — 개념 참고용, 2026-09-01).
//         엔진 컨셉 → 운영 데모 상세/기록, 기술 검증 특정 항목으로 건너뛸 수 있다(initialTech).
//
// 캡처 모드(제안서 이미지용) — URL 쿼리로 상태를 고정한다. 예) ?capture=1&screen=detail&low=1
//   capture=1            뷰 전환 컨트롤 숨김, 바깥 여백 제거 (w=1440 등으로 폭 고정 가능)
//   screen=dashboard|detail|record|data|equip
//   view=demo|tech|engines
//   engine=e1..e5         엔진 컨셉 초기 선택 (view=engines 일 때)
//   assigned=1           확인 중(담당자 지정) 상태
//   done=1               조치 완료 상태 (상세)
//   low=1                확신도 미달 → 심각도 낮음·현장 확인 안내
//   lost=1               냉각 신호 단절 → 판정 중단·수집 없음
//   hideNew=1            신규 요소 숨김 (기존 화면 그대로 캡처)
//   step=0..3            조치 이력 기록 시작 단계 (현상/원인/조치/추가 설명)
//
// 설명 모드·시뮬레이터·가이드 투어는 정책·방향성 확정 후 재도입 예정으로 제거 상태(2026-08-27).
// 타이포는 `font: var(--text-*)` 토큰만, 색상은 var(--semantic-*)/var(--category-*)만 쓴다.
// 토큰은 data-idb-component 스코프 안에서만 정의된다 — 루트 속성 유지.
import { useState } from "react";
import "@idbrnd/design-system/style.css";
import { showToast, SegmentedControl } from "@idbrnd/design-system";
import { AppShell } from "./components/AppShell";
import Dashboard from "./screens/01-Dashboard";
import SituationDetail from "./screens/03-SituationDetail";
import ActionRecord from "./screens/04-ActionRecord";
import DataSources from "./screens/05-DataSources";
import EquipGroupDetail from "./screens/07-EquipGroupDetail";
import AssetSheet from "./screens/08-AssetSheet";
import AlertCenterDrawer, { MOCK_ALERTS } from "./screens/AlertCenterDrawer";
import TechShowcase from "./screens/06-TechShowcase";
import EngineConcept from "./screens/09-EngineConcept";

const PARAMS = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
const flag = (k) => PARAMS.get(k) === "1";
const CAPTURE = flag("capture");
const SCREENS = ["dashboard", "detail", "record", "data", "equip", "assets"];
const SIDEBAR_CURRENT = { data: "data-management" };

export default function App() {
  const [view, setView] = useState(["tech", "engines"].includes(PARAMS.get("view")) ? PARAMS.get("view") : "demo");
  // 엔진 컨셉 → 기술 검증 특정 항목으로 진입할 때 초기 선택. key로 리마운트해 목록 상태를 초기화한다.
  const [techInitial, setTechInitial] = useState("t1");
  const [screen, setScreen] = useState(SCREENS.includes(PARAMS.get("screen")) ? PARAMS.get("screen") : "dashboard");
  const [selectedStage, setSelectedStage] = useState(2);
  const [assigned, setAssigned] = useState(flag("assigned") || flag("done"));
  const [completed, setCompleted] = useState(flag("done"));
  const initialStep = Number(PARAMS.get("step") || 0);
  const captureWidth = Number(PARAMS.get("w") || 0);

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
        width: captureWidth || undefined,
      }}
    >
      <div style={{ flex: 1, padding: CAPTURE ? 0 : "16px 24px 40px" }}>
        {!CAPTURE && (
          <div style={{ marginBottom: 16 }}>
            <SegmentedControl
              size="small"
              layout="hug"
              label="보기 전환"
              items={[
                { value: "demo", label: "운영 데모" },
                { value: "tech", label: "기술 검증" },
                { value: "engines", label: "엔진 컨셉" },
              ]}
              value={view}
              onChange={setView}
            />
          </div>
        )}

        {view === "engines" && (
          <EngineConcept
            initialEngine={PARAMS.get("engine") || "e1"}
            onOpenDemo={(target) => {
              setView("demo");
              setScreen(target === "record" ? "record" : "detail");
              setSelectedStage(2);
            }}
            onOpenTech={(techId) => {
              setTechInitial(techId);
              setView("tech");
            }}
          />
        )}

        {view === "tech" && (
          <TechShowcase
            key={techInitial}
            initialTech={techInitial}
            onOpenDemoDetail={() => {
              setView("demo");
              setScreen("detail");
              setSelectedStage(2);
            }}
          />
        )}

        {view === "demo" && screen === "assets" && <AssetSheet />}

        {view === "demo" && screen !== "assets" && (
          <AppShell
            current={SIDEBAR_CURRENT[screen] || "dashboard"}
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
                completed={completed}
                lowConfidence={flag("low")}
                coolingSignalLost={flag("lost")}
                hideNew={flag("hideNew")}
                onAssign={() => {
                  setAssigned(true);
                  showToast({ message: "확인을 시작하여 담당자로 지정되었습니다." });
                }}
              />
            )}

            {screen === "record" && (
              <ActionRecord
                initialStep={initialStep}
                hideNew={flag("hideNew")}
                onBack={() => setScreen("detail")}
                onSubmit={() => {
                  setCompleted(true);
                  setScreen("detail");
                  showToast({ message: "조치 이력이 저장됐습니다.", variant: "positive" });
                }}
              />
            )}

            {screen === "data" && <DataSources />}

            {screen === "equip" && <EquipGroupDetail onBack={() => setScreen("dashboard")} />}
          </AppShell>
        )}
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
