// 설비 그룹 분석 상세 — 실제 제품의 최신 위젯(설비 그룹 선택 + 측정 항목 트리 +
// 설비별 센서 추이 개별 그래프 + 계통 탐지 이벤트 리스트) 형식을 데모 설비로 재현.
// 상호작용: 그룹 선택 전환 · 측정 항목 체크 토글(전체 선택/해제) · 탐지 이벤트 선택 시 그래프에 발생 시점 마커.
import { useState } from "react";
import { Icon, StateBadge } from "@idbrnd/design-system";
import MiniLine from "./MiniLine";

const GROUPS = [
  { id: "g1", no: "설비 그룹 1", name: "분전반 A (전력 계통)" },
  { id: "g2", no: "설비 그룹 2", name: "냉각 분기 2 (CDU-2 계통)", extra: "+2" },
  { id: "g3", no: "설비 그룹 3", name: "GPU 랙 A열", extra: "+4" },
];

// 그룹별 측정 항목 트리 (카테고리 색 토큰을 순서대로 매핑 — 실제 정책)
const TREE = {
  g1: [
    { device: "RF 온도 센서 (3)", items: [
      { id: "t-r", name: "부스바 온도 R", unit: "°C", points: "0,42 22,44 40,43 55,47 70,72 85,80 100,84", avg: 44, yMax: "31.9", yMin: "28.0", value: "31.98°C", avgLabel: "28.5°C" },
      { id: "t-s", name: "부스바 온도 S", unit: "°C", points: "0,40 25,41 45,42 60,44 75,58 90,66 100,70", avg: 42, yMax: "31.1", yMin: "27.8", value: "30.92°C", avgLabel: "28.2°C" },
      { id: "t-t", name: "부스바 온도 T", unit: "°C", points: "0,45 25,44 50,46 70,48 85,50 100,52", avg: 45, yMax: "29.7", yMin: "29.1", value: "29.40°C", avgLabel: "29.4°C" },
    ]},
    { device: "전력 멀티미터 (4)", items: [
      { id: "p-v1", name: "L1 전압", unit: "V", points: "0,50 20,52 40,49 60,54 80,66 100,70", avg: 51, yMax: "229.6", yMin: "221.1", value: "228.43V", avgLabel: "222.1V" },
      { id: "p-w", name: "유효전력 합계", unit: "kW", points: "0,30 20,32 40,36 55,60 70,74 100,78", avg: 36, yMax: "41.2", yMin: "27.8", value: "41.2kW", avgLabel: "33.4kW" },
      { id: "p-leak", name: "누설전류", unit: "mA", points: "0,40 30,41 60,42 100,43", avg: 41, yMax: "1.9", yMin: "1.4", value: "1.6mA", avgLabel: "1.5mA" },
      { id: "p-pf", name: "역률 평균", unit: "", points: "0,60 30,59 60,61 100,60", avg: 60, yMax: "0.98", yMin: "0.92", value: "0.95", avgLabel: "0.95" },
    ]},
  ],
  g2: [
    { device: "냉각 계측 (3)", items: [
      { id: "c-flow", name: "냉각수 유량", unit: "L/min", points: "0,62 25,61 45,60 60,52 75,40 100,34", avg: 60, yMax: "157", yMin: "118", value: "118L/min", avgLabel: "140L/min" },
      { id: "c-press", name: "공급 압력", unit: "bar", points: "0,55 30,54 60,52 80,50 100,48", avg: 53, yMax: "2.5", yMin: "1.9", value: "2.1bar", avgLabel: "2.2bar" },
      { id: "c-valve", name: "밸브 개도 V-21", unit: "%", points: "0,58 30,58 55,57 75,44 100,40", avg: 56, yMax: "82", yMin: "40", value: "42%", avgLabel: "78%" },
    ]},
  ],
  g3: [
    { device: "랙 계측 (2)", items: [
      { id: "r-gpu", name: "GPU 사용률", unit: "%", points: "0,30 20,32 35,52 50,76 70,82 100,84", avg: 40, yMax: "96", yMin: "38", value: "94%", avgLabel: "62%" },
      { id: "r-temp", name: "랙 출구 온도", unit: "°C", points: "0,40 30,41 55,44 70,56 85,66 100,72", avg: 43, yMax: "34.2", yMin: "26.7", value: "34.2°C", avgLabel: "30.1°C" },
    ]},
  ],
};

const EVENTS = [
  { id: "e1", risk: "위험도 높음", variant: "error", place: "분전반 A", time: "오늘 09:32", status: "미해결", marker: 70 },
  { id: "e2", risk: "위험도 중간", variant: "warning", place: "분전반 A", time: "오늘 09:23", status: "미해결", marker: 55 },
  { id: "e3", risk: "위험도 낮음", variant: "basic", place: "분전반 A", time: "오늘 09:08", status: "확인중", marker: 40 },
];

const CAT = ["var(--category-001)", "var(--category-002)", "var(--category-003)", "var(--category-005)", "var(--category-007)", "var(--category-009)", "var(--category-004)"];

export default function EquipGroupAnalysis({ desc }) {
  const [group, setGroup] = useState("g1");
  const allIds = TREE[group].flatMap((d) => d.items.map((i) => i.id));
  const [checked, setChecked] = useState(() => new Set(TREE.g1.flatMap((d) => d.items.map((i) => i.id)).slice(0, 5)));
  const [selEvent, setSelEvent] = useState("e1");

  function switchGroup(g) {
    setGroup(g);
    setChecked(new Set(TREE[g].flatMap((d) => d.items.map((i) => i.id))));
  }
  function toggle(id) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  const allOn = allIds.every((id) => checked.has(id));
  const visible = TREE[group].flatMap((d) => d.items).filter((i) => checked.has(i.id));
  const marker = EVENTS.find((e) => e.id === selEvent)?.marker;
  let colorIdx = -1;

  return (
    <div data-desc={desc} style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 10, padding: "16px 20px" }}>
      {/* 설비 그룹 선택 */}
      <div style={{ marginBottom: 4, font: "var(--text-body-1-normal-semibold)", color: "var(--semantic-text-default)" }}>
        설비 그룹 선택
      </div>
      <div style={{ marginBottom: 10, font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
        설비 그룹을 고르면 이벤트·센서 추이가 해당 그룹 기준으로 변경됩니다.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {GROUPS.map((g) => {
          const on = group === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => switchGroup(g.id)}
              style={{
                textAlign: "left",
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
                border: on ? "1.5px solid var(--semantic-primary-default)" : "1px solid var(--semantic-line-default)",
                background: on ? "var(--semantic-primary-extra-light)" : "var(--semantic-bg-default)",
              }}
            >
              <span style={{ display: "block", font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{g.no}</span>
              <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>
                {g.name} {g.extra && <span style={{ color: "var(--semantic-text-sub)", font: "var(--text-caption-1-regular)" }}>{g.extra}</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 200px", gap: 14, alignItems: "start" }}>
        {/* 측정 항목 트리 */}
        <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>측정 항목</span>
            <button
              type="button"
              onClick={() => setChecked(allOn ? new Set() : new Set(allIds))}
              style={{ marginLeft: "auto", border: "none", background: "transparent", cursor: "pointer", font: "var(--text-caption-1-regular)", color: "var(--semantic-primary-default)", padding: 0 }}
            >
              {allOn ? "전체 해제" : "전체 선택"}
            </button>
          </div>
          {TREE[group].map((d) => (
            <div key={d.device} style={{ marginBottom: 8 }}>
              <div style={{ font: "var(--text-caption-1-semibold)", color: "var(--semantic-text-sub)", margin: "6px 0 4px" }}>{d.device}</div>
              {d.items.map((it) => {
                const on = checked.has(it.id);
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => toggle(it.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      width: "100%",
                      textAlign: "left",
                      padding: "3px 4px",
                      border: "none",
                      borderRadius: 4,
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <Icon name={on ? "circle-check-fill" : "circle-check"} size={14} color={on ? "var(--semantic-primary-default)" : "var(--semantic-natural-strong)"} />
                    <span style={{ font: "var(--text-caption-1-regular)", color: on ? "var(--semantic-text-default)" : "var(--semantic-text-sub)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {it.name}
                    </span>
                    <span style={{ marginLeft: "auto", font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{it.unit}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* 설비별 센서 추이 */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
            <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>설비별 센서 추이</span>
            <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>총 {visible.length}개 · 집계 단위 5초</span>
          </div>
          {visible.length === 0 ? (
            <div style={{ padding: "36px 0", textAlign: "center", font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-sub)", border: "1px dashed var(--semantic-line-default)", borderRadius: 8 }}>
              선택된 측정 항목이 없습니다. 측정 항목을 선택하면 그래프가 표시됩니다.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {visible.map((it) => {
                colorIdx += 1;
                return (
                  <div key={it.id} style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ font: "var(--text-label-2-semibold)", color: "var(--semantic-text-default)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</span>
                      <span style={{ marginLeft: "auto", font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)", flexShrink: 0 }}>{it.value}</span>
                    </div>
                    <MiniLine points={it.points} avg={it.avg} marker={marker} color={CAT[colorIdx % CAT.length]} yMax={it.yMax} yMin={it.yMin} />
                    <div style={{ display: "flex", gap: 10, font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>
                      <span>평균 {it.avgLabel}</span>
                      <span style={{ marginLeft: "auto" }}>정상 · 연결 끊김</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 탐지 이벤트 */}
        <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>탐지 이벤트 {EVENTS.length}건</span>
            <span style={{ marginLeft: "auto", font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>조회 기간 1일</span>
          </div>
          {EVENTS.map((e) => {
            const on = selEvent === e.id;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelEvent(on ? null : e.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  marginBottom: 6,
                  borderRadius: 8,
                  cursor: "pointer",
                  border: on ? "1.5px solid var(--semantic-primary-default)" : "1px solid var(--semantic-line-default)",
                  background: on ? "var(--semantic-primary-extra-light)" : "var(--semantic-bg-default)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <StateBadge size="compact" variant={e.variant}>{e.risk}</StateBadge>
                  <span style={{ marginLeft: "auto", font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{e.status}</span>
                </span>
                <span style={{ font: "var(--text-caption-1-semibold)", color: "var(--semantic-text-default)" }}>계통 이상 탐지</span>
                <span style={{ font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{e.place} · {e.time}</span>
              </button>
            );
          })}
          <div style={{ font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>
            이벤트를 선택하면 그래프에 발생 시점이 표시됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}
