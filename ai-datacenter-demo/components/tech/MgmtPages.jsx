// 관리 페이지 재현 — 실제 FE 페이지 레이아웃을 그대로 축약 표시 (사용자 지시: 실물 레이아웃).
//   연결 데이터 관리(DataSourceManagement): 필터(설치 장소·데이터 소스 유형·연결 상태·검색·초기화) +
//     테이블(연결 상태|데이터 소스명|데이터 유형|소속 디바이스|장소 및 설비 정보|상세 정보)
//   엣지 디바이스 관리(EdgeDeviceManagement): 테이블(연결 상태|디바이스 명|디바이스 모델명|IP 주소|설치 장소 · 설비 정보)
//   모델 관리(ModelManagement): 좌 "모델 리스트" 사이드바 + 우 상세(성능·재학습·배포·연합학습)
//   문서 관리(DocumentManagementV2): 헤더(새 문서 등록·문서 유형 관리) + 폴더 트리 +
//     테이블(등록 상태|문서 명|문서 유형|폴더 위치|파일 크기|업로드 날짜)
// 실제 화면은 ds Table(TanStack) 기반 — 재현은 동일 컬럼·시각의 정적 테이블로 표시한다.
import { Icon, StateBadge, ContentBadge, TextButton, FillButton, WeakButton, FilterBar, FilterChip } from "@idbrnd/design-system";

function PageFrame({ title, actions, children }) {
  return (
    <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 12, padding: "16px 20px", background: "var(--semantic-bg-default)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <h3 style={{ margin: 0, font: "var(--text-heading-2-semibold)", color: "var(--semantic-text-strong)" }}>{title}</h3>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>{actions}</div>
      </div>
      {children}
    </div>
  );
}

function FilterBarLook({ chips }) {
  // 실제 페이지의 필터 바 — ds FilterBar/FilterChip 사용 (FE 패턴: 원형 초기화 + 칩 + 검색)
  return (
    <div style={{ marginBottom: 12 }}>
      <FilterBar
        size="medium"
        leadingElementSlot={
          <span
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 999, border: "1px solid var(--semantic-line-default)" }}
            aria-label="필터 초기화"
          >
            <Icon name="reset" size={16} color="var(--semantic-text-sub)" />
          </span>
        }
        trailingElementSlot={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--semantic-line-default)", font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)", minWidth: 180 }}>
            <Icon name="search" size={16} color="var(--semantic-text-sub)" />
            검색어를 입력해 주세요.
          </span>
        }
      >
        {chips.map((c) => (
          <FilterChip key={c} size="medium" options={[]} onSelect={() => {}}>
            {c}
          </FilterChip>
        ))}
      </FilterBar>
    </div>
  );
}

function MgmtTable({ cols, rows }) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--semantic-line-default)", borderRadius: 8 }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 560 }}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} style={{ background: "var(--semantic-bg-light)", padding: "10px 12px", textAlign: "left", font: "var(--text-caption-1-semibold)", color: "var(--semantic-text-sub)", whiteSpace: "nowrap", borderBottom: "1px solid var(--semantic-line-default)" }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((cell, ci) => (
                <td key={ci} style={{ padding: "10px 12px", font: "var(--text-label-2-regular)", color: "var(--semantic-text-default)", whiteSpace: "nowrap", borderBottom: ri < rows.length - 1 ? "1px solid var(--semantic-line-default)" : "none" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Detail = () => <TextButton variant="assistive" size="small">상세 정보</TextButton>;

// ── 연결 데이터 관리 ──
export function DataSourcePage({ desc }) {
  return (
    <div data-desc={desc}>
      <PageFrame title="연결 데이터 관리">
        <FilterBarLook chips={["설치 장소", "데이터 소스 유형", "연결 상태"]} />
        <MgmtTable
          cols={["연결 상태", "데이터 소스명", "데이터 유형", "소속 디바이스", "장소 및 설비 정보", ""]}
          rows={[
            [<StateBadge key="s" size="compact" variant="success" stateIcon>정상 연결</StateBadge>, "냉각 유량계 F-21", "센서", "EDGE-GPU-01", "GPU룸 A · 냉각 분기 2", <Detail key="d" />],
            [<StateBadge key="s" size="compact" variant="success" stateIcon>정상 연결</StateBadge>, "전력 멀티미터 101", "센서", "EDGE-PWR-01", "전기실 · 분전반 A", <Detail key="d" />],
            [<StateBadge key="s" size="compact" variant="error" stateIcon>연결 실패</StateBadge>, "밸브 개도 V-21", "센서", "EDGE-GPU-01", "GPU룸 A · 2호 CDU", <Detail key="d" />],
            [<StateBadge key="s" size="compact" variant="success" stateIcon>정상 연결</StateBadge>, "설비 운영 DB", "데이터베이스", "-", "통합 EMS", <Detail key="d" />],
            [
              <StateBadge key="s" size="compact" variant="info" stateIcon>연동 예정</StateBadge>,
              <span key="n" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                GPU 텔레메트리 (DCGM/Redfish)
                <ContentBadge size="compact" backgroundColor="var(--semantic-natural-deep)" contentColor="var(--semantic-text-on-dark)">신규</ContentBadge>
              </span>,
              "수집기", "EDGE-GPU-01", "GPU룸 A · 랙 A열", <Detail key="d" />,
            ],
          ]}
        />
        <p style={{ margin: "10px 0 0", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
          수집 상태 4분류 상시 갱신 · 값 고착(장시간 동일값) 감지 · 이상 소스를 쓰는 탐지는 자동 차단, 복구 시 자동 재개.
        </p>
      </PageFrame>
    </div>
  );
}

// ── 엣지 디바이스 관리 ──
export function EdgeDevicePage({ desc }) {
  return (
    <div data-desc={desc}>
      <PageFrame title="엣지 디바이스 관리">
        <FilterBarLook chips={["설치 위치", "연결 상태"]} />
        <MgmtTable
          cols={["연결 상태", "디바이스 명", "디바이스 모델명", "IP 주소", "설치 장소 · 설비 정보", ""]}
          rows={[
            [<StateBadge key="s" size="compact" variant="success" stateIcon>정상 연결</StateBadge>, "EDGE-GPU-01", "IDB-EN100", "10.20.1.11", "GPU룸 A", <Detail key="d" />],
            [<StateBadge key="s" size="compact" variant="success" stateIcon>정상 연결</StateBadge>, "EDGE-GPU-02", "IDB-EN100", "10.20.1.12", "GPU룸 B", <Detail key="d" />],
            [<StateBadge key="s" size="compact" variant="basic" stateIcon>등록 대기</StateBadge>, "EDGE-PWR-01", "IDB-EN50", "10.20.2.21", "전기실", <TextButton key="d" variant="assistive" size="small">정보 입력</TextButton>],
          ]}
        />
        <p style={{ margin: "10px 0 0", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
          현장 센서 - 엣지 - 서버 구조로 실시간 분석합니다. 디바이스 상태·리소스를 상시 감시합니다.
        </p>
      </PageFrame>
    </div>
  );
}

// ── 모델 관리 (좌 모델 리스트 + 우 상세) ──
const MODELS = [
  { name: "부하-냉각 반응 판정", ver: "v1.2", active: true, isNew: true },
  { name: "온도 이상 탐지", ver: "v2.0" },
  { name: "전력 품질 판정", ver: "v1.0" },
];

export function ModelMgmtPage({ desc }) {
  return (
    <div data-desc={desc}>
      <PageFrame title="모델 관리">
        <div style={{ display: "grid", gridTemplateColumns: "184px minmax(0, 1fr)", gap: 16 }}>
          {/* 모델 리스트 사이드바 */}
          <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, padding: "10px 0" }}>
            <div style={{ padding: "0 12px 8px", font: "var(--text-label-1-semibold)", color: "var(--semantic-text-default)", borderBottom: "1px solid var(--semantic-line-default)" }}>
              모델 리스트
            </div>
            {MODELS.map((m) => (
              <div
                key={m.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  borderLeft: m.active ? "3px solid var(--semantic-primary-default)" : "3px solid transparent",
                  background: m.active ? "var(--semantic-primary-extra-light)" : "transparent",
                }}
              >
                <span style={{ font: m.active ? "var(--text-label-2-semibold)" : "var(--text-label-2-regular)", color: m.active ? "var(--semantic-primary-default)" : "var(--semantic-text-default)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {m.name}
                </span>
                {m.isNew && (
                  <ContentBadge size="compact" backgroundColor="var(--semantic-natural-deep)" contentColor="var(--semantic-text-on-dark)">신규</ContentBadge>
                )}
              </div>
            ))}
          </div>
          {/* 상세 */}
          <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ font: "var(--text-body-1-normal-semibold)", color: "var(--semantic-text-default)" }}>부하-냉각 반응 판정</span>
              <StateBadge size="compact" variant="success">배포됨</StateBadge>
              <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-sub)" }}>v1.2 · 연합학습 참여</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <WeakButton variant="assistive" size="xsmall">재학습</WeakButton>
                <FillButton variant="primary" size="xsmall" widthType="flexible">배포</FillButton>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
              {[
                ["최근 배포", "2026-08-20"],
                ["오탐 신고 (30일)", "1건"],
                ["재학습 주기", "성능 점검 기준"],
                ["학습 데이터", "현장별 수집"],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: "8px 10px", borderRadius: 8, background: "var(--semantic-bg-light)" }}>
                  <div style={{ font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>{k}</div>
                  <div style={{ font: "var(--text-label-2-semibold)", color: "var(--semantic-text-default)" }}>{v}</div>
                </div>
              ))}
            </div>
            <p style={{ margin: "10px 0 0", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
              모델 성능 점검·재학습·배포·연합학습을 이 화면에서 수행합니다.
            </p>
          </div>
        </div>
      </PageFrame>
    </div>
  );
}

// ── 문서 관리 (폴더 트리 + 문서 테이블) ──
export function DocMgmtPage({ desc }) {
  return (
    <div data-desc={desc}>
      <PageFrame
        title="문서 관리"
        actions={
          <>
            <WeakButton variant="assistive" size="xsmall">문서 유형 관리</WeakButton>
            <FillButton variant="primary" size="xsmall" widthType="flexible">새 문서 등록</FillButton>
          </>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "160px minmax(0, 1fr)", gap: 16 }}>
          <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, padding: "10px 12px" }}>
            {["전체 문서", "EOP", "SOP", "MOP"].map((f, i) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 4px", font: i === 2 ? "var(--text-label-2-semibold)" : "var(--text-label-2-regular)", color: i === 2 ? "var(--semantic-primary-default)" : "var(--semantic-text-default)" }}>
                <Icon name="document-text" size={14} color={i === 2 ? "var(--semantic-primary-default)" : "var(--semantic-text-sub)"} />
                {f}
              </div>
            ))}
          </div>
          <MgmtTable
            cols={["등록 상태", "문서 명", "문서 유형", "폴더 위치", "파일 크기", "업로드 날짜"]}
            rows={[
              [<StateBadge key="s" size="compact" variant="success" stateIcon>등록 완료</StateBadge>, "냉각 계통 운전 절차.pdf", "SOP", "SOP", "2.1MB", "2026-08-12"],
              [<StateBadge key="s" size="compact" variant="success" stateIcon>등록 완료</StateBadge>, "CDU 유지보수 매뉴얼.pdf", "MOP", "MOP", "4.8MB", "2026-08-12"],
              [<StateBadge key="s" size="compact" variant="info" stateIcon>진행 중</StateBadge>, "비상 대응 절차 EOP-04.pdf", "EOP", "EOP", "1.2MB", "2026-08-27"],
            ]}
          />
        </div>
        <p style={{ margin: "10px 0 0", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
          PDF 업로드 → 전처리·임베딩 → 벡터 DB 적재. 상황 화면의 "관련 매뉴얼"이 여기서 연결됩니다.
        </p>
      </PageFrame>
    </div>
  );
}
