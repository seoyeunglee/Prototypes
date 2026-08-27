import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const TourContext = createContext({ active: false });

const TOURS = [
  {
    id: "resource-check",
    title: "디바이스 자원 점검",
    subtitle: "자원 현황을 자원별로 확인하는 흐름",
    steps: [
      { node: "자원 현황 진입", desc: "디바이스 자원 현황 섹션에서 30초마다 갱신되는 CPU·온도·메모리를 본다.", ref: "ResourceSection" },
      { node: "CPU 점유율", desc: "CPU 사용률과 임계(주의 80%·위험 90%)를 확인한다.", ref: "MetricCpu" },
      { node: "온도", desc: "CPU·GPU 중 높은 온도와 thermal throttling 신호를 확인한다.", ref: "MetricTemp" },
      { node: "메모리 사용률", desc: "사용량÷전체로 환산된 메모리 사용률을 확인한다.", ref: "MetricMem" },
    ],
  },
  {
    id: "fault-recovery",
    title: "장애·자동 복구 흐름",
    subtitle: "연결 상태와 자동 복구 트리거",
    steps: [
      { node: "연결 상태 확인", desc: "네트워크·전원 연결 4상태를 확인한다.", ref: "ConnectionStatus" },
      { node: "자동 복구 트리거", desc: "연결 없음으로 판정되면 자동 복구가 발동한다(로직 L-3).", ref: "ConnectionStatus" },
    ],
  },
];

export function TourProvider({ children }) {
  const [tourId, setTourId] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const currentTour = TOURS.find((t) => t.id === tourId) || null;
  const currentStep = currentTour ? currentTour.steps[stepIdx] : null;

  function focusEl(ref) {
    document.querySelectorAll(".tour-highlight").forEach((el) => el.classList.remove("tour-highlight"));
    setTimeout(() => {
      const el = document.querySelector(`[data-comp-id="${ref}"]`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("tour-highlight");
    }, 120);
  }
  function applyStep(tour, idx) { focusEl(tour.steps[idx].ref); }
  function startTour(id) {
    const tour = TOURS.find((t) => t.id === id);
    if (!tour) return;
    setTourId(id); setStepIdx(0); applyStep(tour, 0);
  }
  function endTour() {
    document.querySelectorAll(".tour-highlight").forEach((el) => el.classList.remove("tour-highlight"));
    setTourId(null); setStepIdx(0);
  }
  function nextStep() {
    if (!currentTour) return;
    const next = stepIdx + 1;
    if (next >= currentTour.steps.length) { endTour(); return; }
    setStepIdx(next); applyStep(currentTour, next);
  }
  function prevStep() {
    if (!currentTour || stepIdx === 0) return;
    const prev = stepIdx - 1;
    setStepIdx(prev); applyStep(currentTour, prev);
  }

  return (
    <TourContext.Provider value={{ active: !!tourId, tours: TOURS, currentTour, currentStep, stepIdx, startTour, endTour, nextStep, prevStep }}>
      {children}
    </TourContext.Provider>
  );
}

export const useTour = () => useContext(TourContext);

export function GuideTourButton() {
  const { active, tours, startTour } = useTour();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);
  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button className={`tour-launcher-btn${active ? " active" : ""}`} onClick={() => setMenuOpen((v) => !v)}>▶ 가이드 투어</button>
      {menuOpen && (
        <div className="tour-menu">
          {tours.map((t) => (
            <button key={t.id} className="tour-menu-item" onClick={() => { startTour(t.id); setMenuOpen(false); }}>
              <span className="tour-menu-title">{t.title}</span>
              <span className="tour-menu-sub">{t.subtitle}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TourBar() {
  const { active, currentTour, currentStep, stepIdx, nextStep, prevStep, endTour } = useTour();
  if (!active || !currentStep) return null;
  const total = currentTour.steps.length;
  return (
    <div className="tour-bar">
      <div className="tour-bar-left">
        <span className="tour-bar-title">{currentTour.title}</span>
        <span className="tour-bar-node">{currentStep.node}</span>
        <span className="tour-bar-desc">{currentStep.desc}</span>
      </div>
      <div className="tour-bar-right">
        <div className="tour-bar-dots">
          {currentTour.steps.map((_, i) => (
            <span key={i} className={`tour-dot${i === stepIdx ? " active" : i < stepIdx ? " done" : ""}`} />
          ))}
        </div>
        <span className="tour-bar-progress">{stepIdx + 1} / {total}</span>
        <button className="tour-nav-btn" onClick={prevStep} disabled={stepIdx === 0}>이전</button>
        <button className="tour-nav-btn primary" onClick={nextStep}>{stepIdx === total - 1 ? "완료" : "다음"}</button>
        <button className="tour-close-btn" onClick={endTour}>✕</button>
      </div>
    </div>
  );
}
