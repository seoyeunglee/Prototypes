// screen-07 · 설비 그룹 분석 상세 — 참조 이미지(설비그룹분석상세)와 동일 레이아웃·구성요소.
//   topBar(뒤로가기 + 제목) → 설비 그룹 선택(그룹 카드 3개: 상태 아이콘 + 그룹명 + 장소·설비 칩)
//   → 3열 [측정 항목 트리 | 설비별 센서 추이 | 탐지 이벤트]
//     측정 항목: 전체 선택 · 검색 · 장소 > 디바이스(체크·건수·접기) > 항목(색 점·이름·단위)
//     센서 추이: 실시간/기간 설정 · 기간 · 집계 단위 · 적용 · 총 N개 · 기본 ▾ · 항목별 그래프(평균 점선·이벤트 마커·툴팁·범례)
//     탐지 이벤트: N건 · 조회 기간 · 기준일 · 목록(위험도·계통 이상 탐지·칩·미해결·시각)
// 데이터센터 더미 — 냉각 분기 2(2호 CDU) 그룹 선택 상태. 시리즈 색은 카테고리 토큰(차트 데이터 시리즈 전용).
import { useState } from "react";
import { Icon, CheckBox, SegmentedControl, FillButton, SearchBar, TextButton } from "@idbrnd/design-system";

const GROUPS = [
  { id: "cdu2", name: "냉각 분기 2 (2호 CDU)", chips: ["GPU룸 A", "2호 CDU"], alert: true },
  { id: "rackA", name: "GPU 랙 A열", chips: ["GPU룸 A", "랙 A열"] },
  { id: "pnlA", name: "분전반 A", chips: ["전기실", "분전반 A-1"] },
];

const CAT = ["var(--category-001)", "var(--category-003)", "var(--category-005)", "var(--category-002)", "var(--category-007)", "var(--category-009)", "var(--category-004)", "var(--category-006)", "var(--category-008)", "var(--category-010)"];

// 장소 > 디바이스 > 측정 항목 (그룹 cdu2)
const TREE = [
  { place: "GPU룸 A", devices: [
    { id: "EDGE-CDU-02", items: [
      { id: "flow", name: "냉각수 유량", unit: "L/min", meta: "GPU룸 A · EDGE-CDU-02", value: "118 L/min", avgLabel: "평균 123.4 L/min", yMax: "131.2", yMin: "112.8", base: 0.62, drift: -0.3, noise: 0.05, markerValue: "118 L/min" },
      { id: "press", name: "공급 압력", unit: "bar", meta: "GPU룸 A · EDGE-CDU-02", value: "2.1 bar", avgLabel: "평균 2.2 bar", yMax: "2.5", yMin: "1.9", base: 0.55, drift: -0.1, noise: 0.04, markerValue: "2.1 bar" },
      { id: "valve", name: "밸브 개도 V-21", unit: "%", meta: "GPU룸 A · EDGE-CDU-02", value: "42 %", avgLabel: "평균 78 %", yMax: "82", yMin: "40", base: 0.8, drift: -0.5, noise: 0.02, markerValue: "42 %", step: true },
    ] },
    { id: "EDGE-GPU-01", items: [
      { id: "gpu", name: "GPU 사용률", unit: "%", meta: "GPU룸 A · EDGE-GPU-01", value: "94 %", avgLabel: "평균 62 %", yMax: "96", yMin: "38", base: 0.35, drift: 0.5, noise: 0.06, markerValue: "94 %" },
      { id: "power", name: "랙 전력", unit: "kW", meta: "GPU룸 A · EDGE-GPU-01", value: "41.2 kW", avgLabel: "평균 33.4 kW", yMax: "41.2", yMin: "27.8", base: 0.35, drift: 0.45, noise: 0.05, markerValue: "41.2 kW" },
      { id: "tout", name: "랙 출구 온도", unit: "°C", meta: "GPU룸 A · EDGE-GPU-01", value: "34.2 °C", avgLabel: "평균 30.1 °C", yMax: "34.2", yMin: "26.7", base: 0.4, drift: 0.35, noise: 0.03, markerValue: "34.2 °C" },
      { id: "tin", name: "랙 입구 온도", unit: "°C", meta: "GPU룸 A · EDGE-GPU-01", value: "24.6 °C", avgLabel: "평균 24.4 °C", yMax: "25.1", yMin: "23.9", base: 0.5, drift: 0.02, noise: 0.06, markerValue: "24.6 °C" },
    ] },
  ] },
  { place: "전기실", devices: [
    { id: "EDGE-PWR-01", items: [
      { id: "v1", name: "L1 전압", unit: "V", meta: "전기실 · EDGE-PWR-01", value: "228.4 V", avgLabel: "평균 222.1 V", yMax: "229.6", yMin: "221.1", base: 0.5, drift: 0.1, noise: 0.05, markerValue: "228.4 V" },
      { id: "kw", name: "유효전력 합계", unit: "kW", meta: "전기실 · EDGE-PWR-01", value: "41.2 kW", avgLabel: "평균 33.4 kW", yMax: "41.2", yMin: "27.8", base: 0.35, drift: 0.45, noise: 0.05, markerValue: "41.2 kW" },
      { id: "leak", name: "누설전류", unit: "mA", meta: "전기실 · EDGE-PWR-01", value: "1.6 mA", avgLabel: "평균 1.5 mA", yMax: "1.9", yMin: "1.4", base: 0.5, drift: 0.0, noise: 0.05, markerValue: "1.6 mA" },
    ] },
  ] },
];

const EVENTS = [
  { id: "e1", risk: "위험도 중간", tone: "warning", time: "2026.08.31 14:07", x: 0.66 },
  { id: "e2", risk: "위험도 중간", tone: "warning", time: "2026.08.31 13:55", x: 0.6 },
  { id: "e3", risk: "위험도 중간", tone: "warning", time: "2026.08.30 22:41", x: 0.3 },
  { id: "e4", risk: "위험도 낮음", tone: "basic", time: "2026.08.30 09:52", x: 0.2 },
  { id: "e5", risk: "위험도 낮음", tone: "basic", time: "2026.08.29 08:04", x: 0.15 },
  { id: "e6", risk: "위험도 낮음", tone: "basic", time: "2026.08.28 08:36", x: 0.1 },
  { id: "e7", risk: "위험도 낮음", tone: "basic", time: "2026.08.27 08:26", x: 0.05 },
];

// 결정적 의사난수 — 캡처 때마다 같은 곡선
function series(seed, base, drift, noise, n = 120, step = false) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 - 0.5; };
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    let y = base + (t > 0.55 ? drift * Math.min(1, (t - 0.55) / 0.25) : 0);
    if (step) y = t > 0.6 ? base + drift : base;
    y += rnd() * noise * 2;
    out.push(Math.max(0.04, Math.min(0.96, y)));
  }
  return out;
}

function TrendChart({ item, color, marker, markerX }) {
  const W = 1000, H = 150, L = 60, R = 24, T = 14, B = 28;
  const ys = series(item.id.length * 97 + 13, item.base, item.drift, item.noise, 120, item.step);
  const px = (i) => L + (i / (ys.length - 1)) * (W - L - R);
  const py = (v) => T + (1 - v) * (H - T - B);
  const path = ys.map((v, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const area = `${path} L${px(ys.length - 1)},${py(0)} L${px(0)},${py(0)} Z`;
  const avgY = py(item.base);
  const mx = L + markerX * (W - L - R);
  const mi = Math.round(markerX * (ys.length - 1));
  return (
    <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, padding: "14px 16px 10px", background: "var(--semantic-bg-default)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
            <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>{item.name}</span>
          </span>
          <span style={{ font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)", paddingLeft: 12 }}>{item.meta}</span>
        </span>
        <span style={{ marginLeft: "auto", font: "var(--text-heading-2-semibold)", color: "var(--semantic-text-default)", fontVariantNumeric: "tabular-nums" }}>{item.value}</span>
      </div>
      <div style={{ position: "relative", marginTop: 22 }}>
        <span style={{ position: "absolute", left: 4, top: -14, font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>({item.unit})</span>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img" aria-label={`${item.name} 추이`}>
          <text x={L - 8} y={T + 4} textAnchor="end" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>{item.yMax}</text>
          <text x={L - 8} y={py(0) + 4} textAnchor="end" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>{item.yMin}</text>
          <path d={area} fill={color} opacity="0.12" />
          <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
          <line x1={L} x2={W - R} y1={avgY} y2={avgY} stroke="var(--semantic-natural-deep)" strokeWidth="1" strokeDasharray="4 4" />
          {marker && (
            <>
              <line x1={mx} x2={mx} y1={T} y2={py(0)} stroke="var(--semantic-content-danger-default)" strokeWidth="1.5" />
              <circle cx={mx} cy={py(ys[mi])} r="4" fill="var(--semantic-content-danger-default)" />
            </>
          )}
          <text x={L} y={H - 8} style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>13:26</text>
          <text x={W - R} y={H - 8} textAnchor="end" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>15:26</text>
        </svg>
        <span style={{ position: "absolute", right: 24, top: `${(avgY / H) * 100}%`, transform: "translateY(-50%)", padding: "2px 6px", borderRadius: 4, background: "var(--semantic-natural-deep)", color: "var(--semantic-text-on-dark)", font: "var(--text-caption-2-semibold)", whiteSpace: "nowrap" }}>
          {item.avgLabel}
        </span>
        {marker && (
          <div style={{ position: "absolute", ...(markerX > 0.55 ? { right: `${100 - (mx / W) * 100}%`, marginRight: 10 } : { left: `${(mx / W) * 100}%`, marginLeft: 10 }), top: 2, padding: "8px 10px", borderRadius: 6, background: "var(--semantic-natural-deep)", color: "var(--semantic-text-on-dark)", display: "flex", flexDirection: "column", gap: 4, whiteSpace: "nowrap" }}>
            <span style={{ font: "var(--text-caption-1-semibold)", color: "var(--semantic-content-danger-light)" }}>계통 이상 탐지</span>
            <span style={{ font: "var(--text-caption-2-regular)" }}>{marker.time}</span>
            <span style={{ font: "var(--text-caption-2-regular)" }}>센서값 <b>{item.markerValue}</b></span>
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 4 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>
          <span style={{ width: 14, height: 0, borderTop: "2px solid var(--semantic-text-default)" }} />정상
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>
          <span style={{ width: 14, height: 0, borderTop: "2px dotted var(--semantic-text-sub)" }} />연결 끊김
        </span>
      </div>
    </div>
  );
}

function SelectLook({ value, width = 120 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "space-between", width, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--semantic-line-default)", font: "var(--text-label-2-regular)", color: "var(--semantic-text-default)", background: "var(--semantic-bg-default)" }}>
      {value}
      <Icon name="chevron-down" size={14} color="var(--semantic-text-sub)" />
    </span>
  );
}

const ALL_ITEMS = TREE.flatMap((p) => p.devices.flatMap((d) => d.items));
const DEFAULT_ON = ["flow", "press", "valve", "gpu", "power", "tout"];

export default function EquipGroupDetail({ onBack }) {
  const [group, setGroup] = useState("cdu2");
  const [mode, setMode] = useState("range");
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState(() => new Set(DEFAULT_ON));
  const [selEvent, setSelEvent] = useState("e1");
  const colorOf = {};
  ALL_ITEMS.forEach((it, i) => { colorOf[it.id] = CAT[i % CAT.length]; });
  const visible = ALL_ITEMS.filter((it) => checked.has(it.id));
  const allOn = checked.size === ALL_ITEMS.length;
  const marker = EVENTS.find((e) => e.id === selEvent);

  function toggle(id) {
    setChecked((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function toggleDevice(d) {
    const ids = d.items.map((i) => i.id);
    const on = ids.every((id) => checked.has(id));
    setChecked((prev) => { const n = new Set(prev); ids.forEach((id) => (on ? n.delete(id) : n.add(id))); return n; });
  }

  const sectionTitle = { font: "var(--text-body-1-normal-semibold)", color: "var(--semantic-text-default)" };
  const sub = { font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="button" onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "transparent", cursor: "pointer", padding: 0, font: "var(--text-label-1-regular)", color: "var(--semantic-text-sub)" }}>
          <Icon name="chevron-left" size={16} color="var(--semantic-text-sub)" />
          뒤로가기
        </button>
        <span style={{ width: 1, height: 16, background: "var(--semantic-line-default)" }} />
        <h1 style={{ margin: 0, font: "var(--text-title-2-semibold)", color: "var(--semantic-text-strong)" }}>설비 그룹 분석 상세</h1>
      </div>

      {/* 설비 그룹 선택 */}
      <div>
        <div style={sectionTitle}>설비 그룹 선택</div>
        <div style={{ ...sub, marginBottom: 12 }}>설비 그룹을 고르면 이벤트·센서 추이가 해당 그룹 기준으로 변경됩니다.</div>
        <div style={{ display: "flex", gap: 12 }}>
          {GROUPS.map((g) => {
            const on = group === g.id;
            return (
              <button key={g.id} type="button" onClick={() => setGroup(g.id)}
                style={{ textAlign: "left", width: 160, padding: "12px 14px", borderRadius: 8, cursor: "pointer", border: on ? "1.5px solid var(--semantic-primary-default)" : "1px solid var(--semantic-line-default)", background: "var(--semantic-bg-default)", display: "flex", flexDirection: "column", gap: 8 }}>
                {g.alert
                  ? <Icon name="circle-exclamation-fill" size={18} color="var(--semantic-content-danger-default)" />
                  : <span style={{ width: 18, height: 18, borderRadius: 999, background: "var(--semantic-natural-light)" }} />}
                <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>{g.name}</span>
                <span style={{ display: "flex", gap: 4 }}>
                  {g.chips.map((c) => (
                    <span key={c} style={{ padding: "1px 6px", borderRadius: 4, border: "1px solid var(--semantic-line-default)", font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{c}</span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "264px minmax(0, 1fr) 360px", gap: 24, alignItems: "start" }}>
        {/* 측정 항목 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={sectionTitle}>측정 항목</span>
            <button type="button" onClick={() => setChecked(allOn ? new Set() : new Set(ALL_ITEMS.map((i) => i.id)))} style={{ marginLeft: "auto", border: "none", background: "transparent", cursor: "pointer", padding: 0, font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
              {allOn ? "전체 해제" : "전체 선택"}
            </button>
          </div>
          <SearchBar size="medium" value={query} onChange={(e) => setQuery(e.target.value)} onSearch={() => {}} onClear={() => setQuery("")} placeholder="검색어를 입력해 주세요." />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {TREE.map((p) => (
              <div key={p.place} style={{ marginBottom: 12 }}>
                <div style={{ ...sub, padding: "6px 0" }}>{p.place}</div>
                {p.devices.map((d) => {
                  const devOn = d.items.every((i) => checked.has(i.id));
                  return (
                    <div key={d.id} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 4px" }}>
                        <CheckBox size="small" density="compact" checked={devOn} onChange={() => toggleDevice(d)}>
                          <span style={{ font: "var(--text-label-2-semibold)", color: "var(--semantic-text-default)" }}>{d.id} <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>({d.items.length})</span></span>
                        </CheckBox>
                        <span style={{ marginLeft: "auto", display: "inline-flex" }}><Icon name="chevron-up" size={14} color="var(--semantic-text-sub)" /></span>
                      </div>
                      {d.items.map((it) => (
                        <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 4px 5px 28px" }}>
                          <CheckBox size="small" density="compact" checked={checked.has(it.id)} onChange={() => toggle(it.id)}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                              <span style={{ width: 6, height: 6, borderRadius: 999, background: colorOf[it.id] }} />
                              <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-default)" }}>{it.name}</span>
                              <span style={{ font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{it.unit}</span>
                            </span>
                          </CheckBox>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 설비별 센서 추이 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div>
              <div style={sectionTitle}>설비별 센서 추이</div>
              <div style={sub}>선택한 측정 항목을 개별 그래프로 분리하여 한 화면에서 비교할 수 있습니다.</div>
            </div>
            <span style={{ marginLeft: "auto", display: "inline-flex", width: 28, height: 28, borderRadius: 6, border: "1px solid var(--semantic-line-default)", alignItems: "center", justifyContent: "center" }}>
              <Icon name="chevron-double-right" size={14} color="var(--semantic-text-sub)" />
            </span>
          </div>
          <SegmentedControl size="small" layout="hug" items={[{ value: "live", label: "실시간" }, { value: "range", label: "기간 설정" }]} value={mode} onChange={setMode} />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "space-between", width: 380, whiteSpace: "nowrap", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--semantic-line-default)", font: "var(--text-label-2-regular)", color: "var(--semantic-text-default)" }}>
              2026-08-31 오후 01:26 ~ 2026-08-31 오후 03:26
              <Icon name="clock-fill" size={14} color="var(--semantic-text-sub)" />
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-default)" }}>집계 단위</span>
              <SelectLook value="5초" width={92} />
            </span>
            <FillButton variant="primary" size="medium" widthType="fixed">적용</FillButton>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>총 <span style={{ color: "var(--semantic-primary-default)" }}>{visible.length}</span>개</span>
            <span style={{ marginLeft: "auto" }}>
              <TextButton variant="assistive" size="small">
                <Icon name="line-horizontal" size={14} color="var(--semantic-text-sub)" />
                기본
                <Icon name="chevron-down" size={14} color="var(--semantic-text-sub)" />
              </TextButton>
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visible.map((it) => (
              <TrendChart key={it.id} item={it} color={colorOf[it.id]} marker={marker} markerX={marker ? marker.x : 0} />
            ))}
          </div>
        </div>

        {/* 탐지 이벤트 */}
        <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 12, padding: "20px 0 0", background: "var(--semantic-bg-default)" }}>
          <div style={{ padding: "0 20px", display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ font: "var(--text-heading-2-semibold)", color: "var(--semantic-text-default)" }}>탐지 이벤트</span>
            <span style={sub}>11건</span>
          </div>
          <div style={{ padding: "16px 20px 8px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>조회 기간</span>
            <SelectLook value="14일" width={100} />
          </div>
          <div style={{ padding: "0 20px 12px", ...sub }}>2026.08.18 ~ 2026.08.31 기준</div>
          <div>
            {EVENTS.map((e) => {
              const on = selEvent === e.id;
              return (
                <button key={e.id} type="button" onClick={() => setSelEvent(on ? null : e.id)}
                  style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "14px 16px 14px 20px", border: "none", borderTop: "1px solid var(--semantic-line-default)", background: on ? "var(--semantic-bg-light)" : "transparent", cursor: "pointer" }}>
                  <span style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                    <span style={{ font: "var(--text-caption-1-semibold)", color: e.tone === "warning" ? "var(--semantic-content-warning-default)" : "var(--semantic-text-sub)" }}>{e.risk}</span>
                    <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)" }}>계통 이상 탐지</span>
                    <span style={{ display: "flex", gap: 4 }}>
                      {["GPU룸 A", "2호 CDU"].map((c) => (
                        <span key={c} style={{ padding: "1px 6px", borderRadius: 4, border: "1px solid var(--semantic-line-default)", font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{c}</span>
                      ))}
                    </span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, font: "var(--text-caption-1-regular)", color: "var(--semantic-text-default)" }}>
                      <Icon name="circle-exclamation-fill" size={12} color="var(--semantic-content-danger-default)" />미해결
                    </span>
                    <span style={{ font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{e.time}</span>
                  </span>
                  <Icon name="chevron-right" size={16} color="var(--semantic-text-sub)" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
