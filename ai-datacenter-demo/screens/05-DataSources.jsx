// screen-05 · 연결 데이터 관리 — 참조 이미지(연결데이터 관리페이지)와 동일 레이아웃·구성요소.
//   제목 + Tab(데이터 소스 | 엣지 디바이스) → 연결 요약(정상 연결 N개 | 연결 없음 N개)
//   → 필터(설치 장소·데이터 소스 유형·연결 상태 + 검색) + 우측 [+ 데이터 소스 등록]
//   → 선택 삭제 | N개 선택 → 테이블(체크 | 연결 상태 | 데이터 소스명 | 데이터 유형 | 소속 디바이스 | 장소 및 설비 정보 | 상세 정보)
//   → 페이지네이션
// 데이터센터 더미 8행 — 냉각 분기 2·GPU 랙 A열·분전반 A 관련 소스만 등록된 상태.
import { useState } from "react";
import { Icon, StateBadge, FillButton, Tab, CheckBox, FilterChip, Pagination } from "@idbrnd/design-system";

const MOCK_SOURCES = [
  { ok: true, name: "GPU 텔레메트리 DCGM", type: ["IT 텔레메트리", "수집기 데이터"], device: "EDGE-GPU-01", place: ["랙 A열", "GPU룸 A"] },
  { ok: true, name: "랙 출구 온도 T-A", type: ["온도 센서", "센서 데이터"], device: "EDGE-GPU-01", place: ["랙 A열", "GPU룸 A"] },
  { ok: true, name: "냉각수 유량계 F-21", type: ["유량 센서", "센서 데이터"], device: "EDGE-CDU-02", place: ["2호 CDU", "GPU룸 A"] },
  { ok: false, name: "제어 밸브 개도 V-21", type: ["밸브 개도 센서", "센서 데이터"], device: "EDGE-CDU-02", place: ["2호 CDU", "GPU룸 A"] },
  { ok: true, name: "순환 펌프 P-2 압력", type: ["압력 센서", "센서 데이터"], device: "EDGE-CDU-02", place: ["순환 펌프 P-2", "GPU룸 A"] },
  { ok: true, name: "전력 멀티미터 PM-A1", type: ["전력 멀티미터 센서", "센서 데이터"], device: "EDGE-PWR-01", place: ["분전반 A-1", "전기실"] },
  { ok: true, name: "BMS 냉각 운전 DB", type: ["InfluxDB", "데이터 베이스"], device: "BMS-DBMS", place: ["-", "통합 EMS"] },
  { ok: true, name: "열화상 카메라 TC-A1", type: ["듀얼 열화상 카메라", "열화상 카메라"], device: "EDGE-GPU-01", place: ["랙 A열", "GPU룸 A"] },
];

const TH = { padding: "12px 12px", textAlign: "left", font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)", whiteSpace: "nowrap", borderBottom: "1px solid var(--semantic-line-default)", background: "var(--semantic-bg-light)" };
const TD = { padding: "12px 12px", font: "var(--text-label-2-regular)", color: "var(--semantic-text-default)", whiteSpace: "nowrap", borderBottom: "1px solid var(--semantic-line-default)", verticalAlign: "middle" };

function TwoLine({ a, b }) {
  return (
    <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ font: "var(--text-label-2-regular)", color: "var(--semantic-text-default)" }}>{a}</span>
      <span style={{ font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>{b}</span>
    </span>
  );
}

export default function DataSources() {
  const [tab, setTab] = useState("source");
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState(() => new Set());
  const okCount = MOCK_SOURCES.filter((s) => s.ok).length;
  const allOn = checked.size === MOCK_SOURCES.length;

  function toggle(i) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <h1 style={{ margin: 0, font: "var(--text-title-2-semibold)", color: "var(--semantic-text-strong)" }}>연결 데이터 관리</h1>
        <Tab size="medium" resize="hug" items={[{ value: "source", label: "데이터 소스" }, { value: "edge", label: "엣지 디바이스" }]} value={tab} onChange={(v) => setTab(v)} />
      </div>

      {/* 연결 요약 */}
      <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", border: "1px solid var(--semantic-line-default)", borderRadius: 8, padding: "10px 16px", gap: 16 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", width: 28, height: 28, borderRadius: 999, background: "var(--semantic-primary-extra-light)", alignItems: "center", justifyContent: "center" }}>
            <Icon name="circle-check" size={16} color="var(--semantic-primary-default)" />
          </span>
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>정상 연결</span>
            <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-primary-default)" }}>{okCount}개</span>
          </span>
        </span>
        <span style={{ width: 1, height: 24, background: "var(--semantic-line-default)" }} />
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", width: 28, height: 28, borderRadius: 999, background: "var(--semantic-content-danger-extra-light)", alignItems: "center", justifyContent: "center" }}>
            <Icon name="circle-close" size={16} color="var(--semantic-content-danger-default)" />
          </span>
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ font: "var(--text-caption-2-regular)", color: "var(--semantic-text-sub)" }}>연결 없음</span>
            <span style={{ font: "var(--text-label-1-semibold)", color: "var(--semantic-content-danger-default)" }}>{MOCK_SOURCES.length - okCount}개</span>
          </span>
        </span>
      </div>

      {/* 필터 + 등록 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {["설치 장소", "데이터 소스 유형", "연결 상태"].map((c) => (
          <FilterChip key={c} size="medium" options={[]} onSelect={() => {}}>{c}</FilterChip>
        ))}
        {/* 검색 — 실제 페이지는 테두리형 입력(FE Input). ds SearchBar는 밑줄형이라 형태를 맞춘 정적 표현을 쓴다 */}
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, width: 300, height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--semantic-line-default)", background: "var(--semantic-bg-default)" }}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="검색어를 입력해 주세요."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-default)" }} />
          <Icon name="search" size={18} color="var(--semantic-text-sub)" />
        </label>
        <div style={{ marginLeft: "auto" }}>
          <FillButton variant="primary" size="medium" widthType="fixed" customStyle={{ paddingLeft: 24, paddingRight: 24 }}>
            <Icon name="plus" size={16} color="var(--semantic-text-on-dark)" />
            데이터 소스 등록
          </FillButton>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, font: "var(--text-caption-1-regular)", color: "var(--semantic-text-sub)" }}>
          <span style={{ color: checked.size ? "var(--semantic-text-default)" : "var(--semantic-text-disabled)" }}>선택 삭제</span>
          <span style={{ width: 1, height: 12, background: "var(--semantic-line-default)" }} />
          <span>{checked.size}개 선택</span>
        </div>

        <div style={{ border: "1px solid var(--semantic-line-default)", borderRadius: 8, overflow: "hidden", background: "var(--semantic-bg-default)" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ ...TH, width: 44 }}>
                  <CheckBox size="small" density="compact" checked={allOn} onChange={() => setChecked(allOn ? new Set() : new Set(MOCK_SOURCES.map((_, i) => i)))} />
                </th>
                <th style={TH}>연결 상태</th>
                <th style={TH}>데이터 소스명</th>
                <th style={TH}>데이터 유형</th>
                <th style={TH}>소속 디바이스</th>
                <th style={TH}>장소 및 설비 정보</th>
                <th style={{ ...TH, width: 120 }} />
              </tr>
            </thead>
            <tbody>
              {MOCK_SOURCES.map((s, i) => (
                <tr key={s.name}>
                  <td style={TD}><CheckBox size="small" density="compact" checked={checked.has(i)} onChange={() => toggle(i)} /></td>
                  <td style={TD}>
                    <StateBadge size="compact" variant={s.ok ? "info" : "error"} stateIcon>{s.ok ? "정상 연결" : "연결 없음"}</StateBadge>
                  </td>
                  <td style={TD}>{s.name}</td>
                  <td style={TD}><TwoLine a={s.type[0]} b={s.type[1]} /></td>
                  <td style={TD}>{s.device}</td>
                  <td style={TD}><TwoLine a={s.place[0]} b={s.place[1]} /></td>
                  <td style={{ ...TD, textAlign: "right" }}>
                    {/* 실제 페이지의 "상세 정보 >" — 테두리형 소형 버튼(진한 글자). ds OutlineButton assistive는 글자색이 달라 형태를 맞춘 표현 */}
                    <button type="button" style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 28, padding: "0 10px 0 12px", borderRadius: 6, border: "1px solid var(--semantic-line-default)", background: "var(--semantic-bg-default)", cursor: "pointer", font: "var(--text-caption-1-semibold)", color: "var(--semantic-text-default)" }}>
                      상세 정보
                      <Icon name="chevron-right" size={12} color="var(--semantic-text-default)" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
            <Pagination pageIndex={0} pageCount={1} onPageChange={() => {}} canPreviousPage={false} canNextPage={false} onPreviousPage={() => {}} onNextPage={() => {}} prevLabel="이전" nextLabel="다음" />
          </div>
        </div>
      </div>
    </div>
  );
}
