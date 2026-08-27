// 노드 연결 캔버스 — 실제 시나리오 설정 페이지(Scenario)의 노드 설정을 그대로 재현.
// FE 실물 정합:
//   NodeFrame: 흰 카드 radius 8 + 유형색 테두리, 헤더 = 필형 유형 배지(유형색 border·text) +
//   노드명 + 우측 최소화/닫기 아이콘. 유형색은 실물 색 구분(데이터=회색·탐지=danger·이벤트=success·알림=primary).
//   노드 내부 = 실제 설정 UI 재현: 변화율(탐지 민감도 설정·백분위수 기준 슬라이더 + 적용 대상 항목),
//   EWMA(추세선 평활도 α-value + 탐지 민감도 K-value), 융합 이벤트(발생 기준 기간 Select + 기준/발생 건수),
//   센서 데이터(장소·설비 정보·측정 항목), SOP(담당자 자동 배정·담당자 알림 설정), 대시보드 알림(팝업 알림).
//   캔버스 = 도트 그리드(xyflow) + 곡선 엣지 + 좌우 연결 핸들. 신규 연계 노드 = 점선 + "신규" 다크 배지.
import { Icon, FillButton } from "@idbrnd/design-system";

const TYPE_STYLE = {
  data: { label: "데이터", border: "var(--semantic-natural-strong)", text: "var(--semantic-text-sub)" },
  detect: { label: "탐지 설정", border: "var(--semantic-content-danger-light)", text: "var(--semantic-content-danger-default)" },
  event: { label: "이벤트 설정", border: "var(--semantic-content-positive-light)", text: "var(--semantic-content-positive-default)" },
  alert: { label: "알림 및 제어", border: "var(--semantic-primary-light)", text: "var(--semantic-primary-default)" },
};

const NODE_W = 264;

function Slider({ title, unit, min, max, value, note }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ font: "var(--text-caption-1-semibold)", color: "var(--semantic-text-default)" }}>{title}</span>
        <span style={{ font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{unit}</span>
        <span style={{ marginLeft: "auto", font: "var(--text-caption-1-semibold)", color: "var(--semantic-primary-default)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      </div>
      <div style={{ position: "relative", height: 4, borderRadius: 999, background: "var(--semantic-natural-light)", margin: "8px 0 4px" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, borderRadius: 999, background: "var(--semantic-primary-default)" }} />
        <div style={{ position: "absolute", left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)", width: 12, height: 12, borderRadius: 999, background: "var(--semantic-bg-default)", border: "2px solid var(--semantic-primary-default)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)", fontVariantNumeric: "tabular-nums" }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {note && (
        <p style={{ margin: "4px 0 0", font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{note}</p>
      )}
    </div>
  );
}

function TargetList({ items }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ font: "var(--text-caption-1-semibold)", color: "var(--semantic-text-default)" }}>적용 대상 항목</span>
        <span style={{ marginLeft: "auto", font: "var(--text-caption-2-regular)", color: "var(--semantic-primary-default)" }}>전체 활성화</span>
        <span style={{ font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>전체 연결 해제</span>
      </div>
      {items.map((m) => (
        <div key={m} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 4, background: "var(--semantic-bg-light)", marginBottom: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--semantic-content-positive-default)", flexShrink: 0 }} />
          <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-default)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m}</span>
        </div>
      ))}
    </div>
  );
}

function SelectBox({ value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--semantic-line-default)", background: "var(--semantic-bg-default)" }}>
      <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-default)" }}>{value}</span>
      <span style={{ marginLeft: "auto", display: "inline-flex" }}>
        <Icon name="chevron-down-small" size={14} color="var(--semantic-text-sub)" />
      </span>
    </div>
  );
}

function SaveFooter() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--semantic-line-default)", paddingTop: 8 }}>
      <FillButton variant="primary" size="xsmall" widthType="flexible">설정 저장</FillButton>
    </div>
  );
}

// 노드 내부 — 실제 노드별 설정 UI 재현
function NodeBody({ n }) {
  if (n.kind === "sensor") {
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 4 }}>
          {["장소", "설비 정보", "측정 항목"].map((h) => (
            <span key={h} style={{ font: "var(--text-caption-2-semibold)", color: "var(--semantic-text-sub)" }}>{h}</span>
          ))}
          {n.rows.map((r) => r.map((c, i) => (
            <span key={r[0] + i} style={{ font: "var(--text-caption-2-regular)", color: "var(--semantic-text-default)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c}</span>
          )))}
        </div>
        <SelectBox value="측정 항목 선택" />
        <div style={{ marginTop: 8 }}><SaveFooter /></div>
      </div>
    );
  }
  if (n.kind === "delta") {
    return (
      <div>
        <Slider title="탐지 민감도 설정" unit="백분위수 기준" min={90} max={100} value={94}
          note="최근 7일간 변화율의 백분위를 기준으로 설정하신 임계치를 초과할 때 탐지합니다." />
        <TargetList items={n.targets} />
        <SaveFooter />
      </div>
    );
  }
  if (n.kind === "ewma") {
    return (
      <div>
        <Slider title="추세선 평활도 설정" unit="α-value 기준" min={0.2} max={1.0} value={0.2}
          note="추세선이 최신값을 얼마나 크게 반영할지 설정합니다." />
        <Slider title="탐지 민감도 설정" unit="K-value 기준" min={1} max={5} value={3}
          note="추세선에서 평소 변동폭(σ) 대비 설정하신 임계치의 배수만큼 초과할 때 탐지합니다." />
        <TargetList items={n.targets} />
        <SaveFooter />
      </div>
    );
  }
  if (n.kind === "fusion") {
    return (
      <div>
        <p style={{ margin: "0 0 6px", font: "var(--text-caption-1-semibold)", color: "var(--semantic-text-default)" }}>융합 이벤트 설정</p>
        <p style={{ margin: "0 0 4px", font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>융합 이벤트 발생 기준 기간 설정</p>
        <SelectBox value="1분" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, margin: "8px 0 10px" }}>
          <div>
            <p style={{ margin: "0 0 2px", font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>기준 설정값</p>
            <div style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid var(--semantic-line-default)", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-default)", fontVariantNumeric: "tabular-nums" }}>1</div>
          </div>
          <div>
            <p style={{ margin: "0 0 2px", font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>발생 건수</p>
            <div style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid var(--semantic-line-default)", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-default)", fontVariantNumeric: "tabular-nums" }}>1</div>
          </div>
        </div>
        <SaveFooter />
      </div>
    );
  }
  if (n.kind === "sop") {
    return (
      <div>
        <p style={{ margin: "0 0 6px", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-default)" }}>담당자 자동 배정 및 대응 절차 안내</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, background: "var(--semantic-bg-light)" }}>
          <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-default)" }}>담당자 알림 설정</span>
          <span style={{ marginLeft: "auto", width: 28, height: 16, borderRadius: 999, background: "var(--semantic-primary-default)", position: "relative", flexShrink: 0 }}>
            <span style={{ position: "absolute", right: 2, top: 2, width: 12, height: 12, borderRadius: 999, background: "var(--semantic-natural-white)" }} />
          </span>
        </div>
      </div>
    );
  }
  if (n.kind === "dashpush") {
    return (
      <div>
        <p style={{ margin: "0 0 6px", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-default)" }}>이상 탐지 발생시 알림</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, background: "var(--semantic-bg-light)" }}>
          <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-default)" }}>팝업 알림</span>
          <span style={{ marginLeft: "auto", width: 28, height: 16, borderRadius: 999, background: "var(--semantic-primary-default)", position: "relative", flexShrink: 0 }}>
            <span style={{ position: "absolute", right: 2, top: 2, width: 12, height: 12, borderRadius: 999, background: "var(--semantic-natural-white)" }} />
          </span>
        </div>
      </div>
    );
  }
  // plain — 신규 연계 등 설명형 노드
  return (
    <p style={{ margin: 0, font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)", whiteSpace: "pre-line" }}>{n.body}</p>
  );
}

export default function NodeCanvas({ nodes, edges, height = 620, desc }) {
  const pos = {};
  nodes.forEach((n) => { pos[n.id] = { x: n.x, y: n.y }; });
  const width = Math.max(...nodes.map((n) => n.x)) + NODE_W + 24;

  return (
    <div data-desc={desc}>
      <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, overflowX: "auto", background: "var(--semantic-bg-light)" }}>
        <div style={{ position: "relative", width, height }}>
          {/* 도트 그리드 + 엣지 (xyflow 캔버스) */}
          <svg width={width} height={height} style={{ position: "absolute", inset: 0 }} role="img" aria-label="탐지 시나리오 노드 연결선">
            <defs>
              <pattern id="nc-dots" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="var(--semantic-natural-default)" />
              </pattern>
            </defs>
            <rect x="0" y="0" width={width} height={height} fill="url(#nc-dots)" />
            {edges.map(([a, b], i) => {
              const A = pos[a];
              const B = pos[b];
              const ax = A.x + NODE_W + 5;
              const ay = A.y + 36;
              const bx = B.x - 5;
              const by = B.y + 36;
              return (
                <path
                  key={i}
                  d={`M ${ax} ${ay} C ${ax + 40} ${ay}, ${bx - 40} ${by}, ${bx} ${by}`}
                  fill="none"
                  stroke="var(--semantic-natural-heavy)"
                  strokeWidth="1.4"
                />
              );
            })}
          </svg>

          {/* 노드 카드 — 실제 NodeFrame 재현 */}
          {nodes.map((n) => {
            const t = TYPE_STYLE[n.type];
            return (
              <div
                key={n.id}
                style={{
                  position: "absolute",
                  left: n.x,
                  top: n.y,
                  width: NODE_W,
                  background: "var(--semantic-bg-default)",
                  border: `1px ${n.planned ? "dashed" : "solid"} ${n.planned ? "var(--semantic-natural-heavy)" : t.border}`,
                  borderRadius: 8,
                  padding: "10px 12px 12px",
                  boxShadow: "var(--shadow-level-1)",
                }}
              >
                {/* 좌우 연결 핸들 */}
                {n.hasInput !== false && (
                  <span style={{ position: "absolute", left: -5, top: 31, width: 10, height: 10, borderRadius: 999, background: "var(--semantic-natural-heavy)" }} />
                )}
                {n.hasOutput !== false && (
                  <span style={{ position: "absolute", right: -5, top: 31, width: 10, height: 10, borderRadius: 999, background: "var(--semantic-natural-heavy)" }} />
                )}
                {n.planned && (
                  <span style={{ position: "absolute", right: 10, top: -9, padding: "1px 8px", borderRadius: 4, background: "var(--semantic-natural-deep)", color: "var(--semantic-text-on-dark)", font: "var(--text-caption-2-semibold)" }}>
                    신규
                  </span>
                )}
                {/* 헤더 — 유형 배지 + 노드명 + 최소화/닫기 */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ flexShrink: 0, padding: "2px 10px", borderRadius: 16, border: `1px solid ${n.planned ? "var(--semantic-natural-heavy)" : t.border}`, color: n.planned ? "var(--semantic-text-sub)" : t.text, font: "var(--text-caption-2-regular)", whiteSpace: "nowrap" }}>
                    {t.label}
                  </span>
                  <span style={{ font: "var(--text-caption-1-semibold)", color: "var(--semantic-text-default)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {n.name}
                  </span>
                  <span style={{ marginLeft: "auto", display: "inline-flex", gap: 4, flexShrink: 0 }}>
                    <Icon name="minus" size={14} color="var(--semantic-text-sub)" />
                    <Icon name="close" size={14} color="var(--semantic-text-sub)" />
                  </span>
                </div>
                <NodeBody n={n} />
              </div>
            );
          })}
        </div>
      </div>
      <p style={{ margin: "8px 0 0", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
        좌우로 스크롤해 전체 파이프라인을 확인하세요. 점선 노드는 신규 연계 시 추가되는 구성입니다.
      </p>
    </div>
  );
}
