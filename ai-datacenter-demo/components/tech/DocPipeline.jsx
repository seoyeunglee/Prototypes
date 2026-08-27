// 온톨로지 지식화 — 문서 관리 화면 미니 재현 + 지식화 파이프라인(HTML 카드, FlowKit 양식).
// 실선 카드 = 현재 제품 동작, 점선 카드 = 설계 확보 구간(온톨로지 도메인 팩).
// part: "docs" | "pipeline" | undefined(둘 다)
import { StateBadge } from "@idbrnd/design-system";
import { FlowCard, FlowArrow, FlowFrame } from "./FlowKit";

const DOCS = [
  { name: "냉각 계통 운전 절차.pdf", type: "SOP", status: "등록 완료", variant: "success" },
  { name: "CDU 유지보수 매뉴얼.pdf", type: "MOP", status: "등록 완료", variant: "success" },
  { name: "비상 대응 절차 EOP-04.pdf", type: "EOP", status: "진행 중", variant: "info" },
];

function Col({ children }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>;
}

export default function DocPipeline({ desc, part }) {
  return (
    <div data-desc={desc}>
      {part !== "pipeline" && (
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
          <div style={{ marginTop: 6, font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
            PDF 업로드 → 전처리·임베딩 → 벡터 DB 적재. 상황 화면의 "관련 매뉴얼"이 여기서 연결됩니다.
          </div>
        </div>
      )}

      {part !== "docs" && (
        <FlowFrame
          title="지식화 파이프라인"
          note="실선 = 현재 제품 동작 · 점선 = 설계 확보(온톨로지 도메인 팩 — 클래스·관계·규칙·검증 케이스 정의 완료, 구현 단계)"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Col>
              <FlowCard title="문서 관리" sub="EOP·SOP·MOP" />
              <FlowCard title="조치 이력" sub="현상·원인·조치 태그" />
            </Col>
            <FlowArrow />
            <FlowCard title="임베딩·벡터 DB" sub="현재 제품 동작" />
            <FlowArrow planned />
            <Col>
              <FlowCard planned title="온톨로지 지식" sub="설비·상황·원인·위험·SOP" />
              <FlowCard planned title="판정 규칙" sub="상황·원인·리스크 규칙" />
            </Col>
            <FlowArrow planned />
            <FlowCard title="상황 화면" sub="근거·점검 순서·관련 매뉴얼" />
          </div>
        </FlowFrame>
      )}
    </div>
  );
}
