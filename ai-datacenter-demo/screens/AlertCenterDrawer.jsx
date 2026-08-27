// 알림 센터 드로어 — 실제 FE AlertCenterDrawer/AlertItem 구조를 따른다.
//   벨 클릭 토글 → 우측 슬라이드(531px, translateX 0.3s). FE와 동일한 비모달(오버레이 없음). 상황 단위로 묶인 알림:
//   카드 1장 = 상황 이벤트 트리거 1건(신규 상황/심각도 상승/처리 지연/담당자 배정/상황 업데이트),
//   카드 클릭 = 읽음 처리 + 해당 상황 상세 이동. 시스템 알림은 읽음 처리만(데모 범위).
//   탭 3개(전체/상황/시스템, 미읽음 numberBadge) + 필터 바(상태·유형) + 정렬 토글(최신순/오래된순).
import { useState } from "react";
import {
  Icon,
  Tab,
  StateBadge,
  ContentBadge,
  TextButton,
  BasicIconButton,
  FilterBar,
  FilterChip,
  CheckIcon,
} from "@idbrnd/design-system";

// 유형 배지 설정 — FE getEventTypeConfig 그대로 (신규 상황만 ContentBadge 다크)
const TYPE_CONFIG = {
  "situation.created": {
    label: "신규 상황",
    backgroundColor: "var(--semantic-natural-deep)",
    contentColor: "var(--semantic-text-on-dark)",
  },
  "situation.severityIncreased": { label: "심각도 상승", variant: "error" },
  "situation.delayed": { label: "처리 지연", variant: "error" },
  "situation.assigned": { label: "담당자 배정", variant: "basic" },
  "situation.updated": { label: "상황 업데이트", variant: "basic" },
  "system.resourceCollectionStopped": { label: "데이터 수집 중단", variant: "warning" },
};

// 상황 단위 번들 — SIT-2481 진행에 따라 쌓인 카드 + 타 상황 + 시스템. 문구는 FE descriptionMap.
export const MOCK_ALERTS = [
  {
    id: "n1", tab: "situation", eventType: "situation.severityIncreased", unread: true, time: "1분 전",
    situationId: "SIT-2481", title: "GPU 랙 A열 냉각 반응 지연",
    desc: "상황의 위험도가 높아졌습니다. 즉시 현장을 확인하고 조치를 진행해 주세요.",
  },
  {
    id: "n2", tab: "situation", eventType: "situation.updated", unread: true, time: "24분 전",
    situationId: "SIT-2481", title: "GPU 랙 A열 냉각 반응 지연",
    desc: "상황이 업데이트되었습니다. 변경된 내용을 확인해 주세요.",
  },
  {
    id: "n3", tab: "situation", eventType: "situation.created", unread: true, time: "3시간 전",
    situationId: "SIT-2481", title: "GPU 랙 A열 냉각 반응 지연",
    desc: "현장을 확인하고 담당자를 배정해 주세요.",
  },
  {
    id: "n4", tab: "situation", eventType: "situation.assigned", unread: false, time: "6시간 전",
    situationId: "SIT-2478", title: "2호 CDU 공급 압력 변동",
    desc: "김도현이(가) 이 상황의 담당자로 배정되었습니다.",
  },
  {
    id: "n5", tab: "system", eventType: "system.resourceCollectionStopped", unread: false, time: "1일 전",
    title: "GPU룸 A에 설치된 밸브 개도 센서의 데이터 수집이 중단되었습니다.",
    desc: "데이터 수집이 중단되어 탐지가 정상적으로 동작하지 않을 수 있습니다. 연결 데이터 관리 페이지에서 센서 연결 상태를 확인해 주세요.",
  },
];

const STATUS_OPTIONS = [
  { value: "unread", label: "읽지 않음" },
  { value: "read", label: "읽음" },
];

const TYPE_OPTIONS = {
  situation: [
    { value: "situation.created", label: "신규 상황" },
    { value: "situation.severityIncreased", label: "심각도 상승" },
    { value: "situation.updated", label: "상황 업데이트" },
    { value: "situation.assigned", label: "담당자 배정" },
  ],
  system: [{ value: "system.resourceCollectionStopped", label: "데이터 수집 중단" }],
};

export default function AlertCenterDrawer({ open, onClose, readIds, onChangeReadIds, onOpenSituation }) {
  const [tab, setTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [typeFilter, setTypeFilter] = useState(undefined);
  const [sortOrder, setSortOrder] = useState("latest");

  const isRead = (a) => !a.unread || readIds.includes(a.id);

  let list = MOCK_ALERTS.filter((a) => tab === "all" || a.tab === tab);
  if (statusFilter) list = list.filter((a) => (statusFilter === "unread" ? !isRead(a) : isRead(a)));
  if (typeFilter) list = list.filter((a) => a.eventType === typeFilter);
  if (sortOrder === "oldest") list = [...list].reverse();

  const unreadCount = (t) =>
    MOCK_ALERTS.filter((a) => (t === "all" || a.tab === t) && !isRead(a)).length;
  const totalUnread = unreadCount("all");

  const TAB_ITEMS = [
    { value: "all", label: "전체", numberBadge: unreadCount("all") || undefined },
    { value: "situation", label: "상황", numberBadge: unreadCount("situation") || undefined },
    { value: "system", label: "시스템", numberBadge: unreadCount("system") || undefined },
  ];

  const typeOptions =
    tab === "situation" ? TYPE_OPTIONS.situation
    : tab === "system" ? TYPE_OPTIONS.system
    : [...TYPE_OPTIONS.situation, ...TYPE_OPTIONS.system];

  function handleReset() {
    setStatusFilter(undefined);
    setTypeFilter(undefined);
    setSortOrder("latest");
  }

  function handleTabChange(next) {
    setTab(next);
    setTypeFilter(undefined);
  }

  function markRead(a) {
    if (!readIds.includes(a.id)) onChangeReadIds([...readIds, a.id]);
  }

  function handleCardClick(a) {
    markRead(a);
    if (a.tab === "situation" && a.situationId) {
      onClose();
      onOpenSituation(a.situationId);
    }
  }

  return (
    <>
      <aside
        data-desc="70"
        aria-hidden={!open}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 531,
          maxWidth: "100%",
          zIndex: 41,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "var(--semantic-bg-default)",
          borderLeft: "1px solid var(--semantic-line-default)",
          boxShadow: open ? "var(--shadow-level-3)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
        }}
      >
        {/* 헤더 — 제목 + 닫기, 미읽음 안내, 탭 3개 */}
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              height: 56,
              padding: "0 16px 0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2 style={{ margin: 0, font: "var(--text-heading-1-semibold)", color: "var(--semantic-text-default)" }}>
              알림 센터
            </h2>
            <BasicIconButton onClick={onClose} aria-label="알림 센터 닫기">
              <Icon name="close" size={24} color="var(--semantic-text-sub)" />
            </BasicIconButton>
          </div>
          <p data-desc="71" style={{ margin: "0 0 8px", paddingLeft: 24, font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-default)" }}>
            {totalUnread > 0 ? (
              <>
                <span style={{ color: "var(--semantic-primary-default)", font: "var(--text-body-2-normal-semibold)" }}>
                  {totalUnread}개의 새로운 알림
                </span>
                이 있습니다.
              </>
            ) : (
              "모든 알림을 확인했습니다."
            )}
          </p>
          <Tab items={TAB_ITEMS} value={tab} onChange={handleTabChange} resize="fill" size="medium" />
        </div>

        {/* 필터 바 — 초기화 · 상태 · 유형 · 모두 읽음 */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--semantic-line-default)", flexShrink: 0 }}>
          <FilterBar
            size="medium"
            leadingElementSlot={
              <button
                type="button"
                onClick={handleReset}
                aria-label="필터 초기화"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  border: "1px solid var(--semantic-line-default)",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <Icon name="reset" size={18} color="var(--semantic-text-sub)" />
              </button>
            }
            trailingElementSlot={
              <TextButton variant="assistive" onClick={() => onChangeReadIds(MOCK_ALERTS.map((a) => a.id))}>
                <CheckIcon size={18} color="var(--semantic-text-sub)" />
                모두 읽음
              </TextButton>
            }
          >
            <FilterChip
              size="medium"
              options={STATUS_OPTIONS}
              selectedValue={statusFilter}
              onSelect={(opt) => setStatusFilter(opt?.value)}
              selected={!!statusFilter}
              showSelectedLabel
            >
              상태
            </FilterChip>
            <FilterChip
              size="medium"
              options={typeOptions}
              selectedValue={typeFilter}
              onSelect={(opt) => setTypeFilter(opt?.value)}
              selected={!!typeFilter}
              showSelectedLabel
            >
              유형
            </FilterChip>
          </FilterBar>
        </div>

        {/* 정렬 · 총 건수 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            borderBottom: "1px solid var(--semantic-line-default)",
            marginBottom: 16,
            flexShrink: 0,
          }}
        >
          <TextButton
            variant="assistive"
            onClick={() => setSortOrder((prev) => (prev === "latest" ? "oldest" : "latest"))}
          >
            {sortOrder === "latest" ? "최신순" : "오래된순"}
            <Icon name="change" size={16} color="var(--semantic-text-sub)" />
          </TextButton>
          <span style={{ font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-sub)" }}>
            총 {list.length}건
          </span>
        </div>

        {/* 알림 목록 — 카드 1장 = 상황 이벤트 트리거 1건 */}
        <div data-desc="72" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", padding: "0 8px 24px" }}>
          {list.length === 0 && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
              <p style={{ margin: 0, font: "var(--text-body-2-normal-regular)", color: "var(--semantic-text-sub)", textAlign: "center" }}>
                현재 표시할 알림이 없습니다.
              </p>
            </div>
          )}
          {list.map((a) => {
            const cfg = TYPE_CONFIG[a.eventType];
            const read = isRead(a);
            return (
              <div
                key={a.id}
                data-desc="73"
                role="button"
                tabIndex={0}
                onClick={() => handleCardClick(a)}
                onKeyDown={(e) => e.key === "Enter" && handleCardClick(a)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "16px 16px",
                  marginBottom: 4,
                  borderRadius: 8,
                  cursor: "pointer",
                  background: read ? "transparent" : "var(--semantic-primary-extra-light)",
                  border: read ? "1px solid var(--semantic-line-default)" : "1px solid transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  {cfg.variant ? (
                    <StateBadge size="compact" variant={cfg.variant}>
                      {cfg.label}
                    </StateBadge>
                  ) : (
                    <ContentBadge size="compact" backgroundColor={cfg.backgroundColor} contentColor={cfg.contentColor}>
                      {cfg.label}
                    </ContentBadge>
                  )}
                  <span style={{ font: "var(--text-label-1-regular)", color: "var(--semantic-text-sub)", flexShrink: 0 }}>
                    {a.time}
                  </span>
                </div>
                <p style={{ margin: 0, font: "var(--text-body-1-reading-semibold)", color: "var(--semantic-text-default)" }}>
                  {a.title}
                </p>
                <p style={{ margin: 0, font: "var(--text-body-2-reading-regular)", color: "var(--semantic-text-sub)" }}>
                  {a.desc}
                </p>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
