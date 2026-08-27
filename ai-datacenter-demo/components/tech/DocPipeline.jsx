// 온톨로지 지식화 파이프라인 — 화면이 없는 기술이므로, 기존 문서 관리 화면(등록 리스트)을
// 미니 재현하고 그 뒤에서 돌아가는 지식화 파이프라인을 도식으로 설명한다.
// 실선 = 현재 제품 동작(문서→임베딩→벡터DB→상황 연결), 점선 = 설계 확보 구간(온톨로지 확장).
import { StateBadge } from "@idbrnd/design-system";

const DOCS = [
  { name: "냉각 계통 운전 절차.pdf", type: "SOP", status: "등록 완료", variant: "success" },
  { name: "CDU 유지보수 매뉴얼.pdf", type: "MOP", status: "등록 완료", variant: "success" },
  { name: "비상 대응 절차 EOP-04.pdf", type: "EOP", status: "진행 중", variant: "info" },
];

function Box({ x, y, w, h = 44, title, sub, planned }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8"
        fill="var(--semantic-bg-default)"
        stroke={planned ? "var(--semantic-natural-heavy)" : "var(--semantic-line-default)"}
        strokeWidth="1.2" strokeDasharray={planned ? "5 4" : undefined} />
      <text x={x + w / 2} y={y + (sub ? 19 : 27)} textAnchor="middle" style={{ font: "var(--text-label-2-semibold)", fill: "var(--semantic-text-default)" }}>{title}</text>
      {sub && (
        <text x={x + w / 2} y={y + 35} textAnchor="middle" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>{sub}</text>
      )}
    </g>
  );
}

export default function DocPipeline({ desc }) {
  return (
    <div data-desc={desc}>
      {/* 문서 관리 미니 재현 */}
      <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, padding: "12px 16px", marginBottom: 12 }}>
        <div style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)", marginBottom: 8 }}>
          문서 관리 — 등록 현황
        </div>
        {DOCS.map((d) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: "1px solid var(--semantic-line-default)" }}>
            <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-default)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
            <span style={{ font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{d.type}</span>
            <div style={{ marginLeft: "auto", flexShrink: 0 }}>
              <StateBadge size="compact" variant={d.variant}>{d.status}</StateBadge>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 6, font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>
          PDF 업로드 → 전처리·임베딩 → 벡터 DB 적재. 상황 화면의 "관련 매뉴얼"이 여기서 연결됩니다.
        </div>
      </div>

      {/* 파이프라인 도식 */}
      <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, background: "var(--semantic-bg-light)", padding: "8px 4px", overflowX: "auto" }}>
        <svg width="100%" viewBox="0 0 720 210" style={{ display: "block", minWidth: 560 }} role="img" aria-label="문서와 조치 이력이 온톨로지 지식으로 구조화되어 상황 판단에 연결되는 파이프라인">
          <defs>
            <marker id="dp-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill="var(--semantic-natural-heavy)" />
            </marker>
          </defs>

          <Box x={10} y={20} w={140} title="문서 관리" sub="EOP·SOP·MOP" />
          <Box x={10} y={120} w={140} title="조치 이력" sub="현상·원인·조치 태그" />
          <Box x={200} y={70} w={140} title="임베딩·벡터 DB" sub="현재 제품 동작" />
          <Box x={390} y={20} w={150} title="온톨로지 지식" sub="설비·상황·원인·위험·SOP" planned />
          <Box x={390} y={120} w={150} title="판정 규칙" sub="상황·원인·리스크 규칙" planned />
          <Box x={590} y={70} w={122} title="상황 화면" sub="근거·점검 순서·매뉴얼" />

          <line x1="150" y1="42" x2="196" y2="82" stroke="var(--semantic-natural-heavy)" strokeWidth="1.3" markerEnd="url(#dp-arrow)" />
          <line x1="150" y1="142" x2="196" y2="102" stroke="var(--semantic-natural-heavy)" strokeWidth="1.3" markerEnd="url(#dp-arrow)" />
          <line x1="340" y1="82" x2="386" y2="50" stroke="var(--semantic-natural-heavy)" strokeWidth="1.3" strokeDasharray="5 4" markerEnd="url(#dp-arrow)" />
          <line x1="540" y1="42" x2="540" y2="116" stroke="var(--semantic-natural-heavy)" strokeWidth="1.3" strokeDasharray="5 4" markerEnd="url(#dp-arrow)" />
          <line x1="540" y1="142" x2="586" y2="98" stroke="var(--semantic-natural-heavy)" strokeWidth="1.3" strokeDasharray="5 4" markerEnd="url(#dp-arrow)" />
          <line x1="340" y1="94" x2="586" y2="90" stroke="var(--semantic-natural-heavy)" strokeWidth="1.3" markerEnd="url(#dp-arrow)" />

          <text x="360" y="200" textAnchor="middle" style={{ font: "var(--text-caption-2-regular)", fill: "var(--semantic-text-sub)" }}>
            실선 = 현재 제품 동작 · 점선 = 설계 확보(온톨로지 도메인 팩 — 클래스·관계·규칙·검증 케이스 정의 완료, 구현 단계)
          </text>
        </svg>
      </div>
    </div>
  );
}
