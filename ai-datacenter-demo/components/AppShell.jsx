// PG 메인 셸 — 실제 FE(ProtectGO-ENT-FE) 구조를 따른다.
//   AppHeader: 높이 54px, [사이드바 토글 + 로고 | 프로젝트명 드롭다운 | 벨 + 아바타]
//   Sidebar:  255px, 흰 배경, 항목 44px, 활성 = primary-extra-light 배경 + 좌측 4px primary 바 + fill 아이콘
//   Content:  흰 배경(semantic-bg-default), 페이지 패딩 20px 24px
// 참조: src/components/Header/AppHeader/AppHeader.jsx · src/components/Sidebar/Sidebar.jsx · 01-main-layout.png
import { useState } from "react";
import { Icon, BasicIconButton, Avatar, PushBadge, FillButton } from "@idbrnd/design-system";

const MENU_LIST = [
  { name: "대시보드", id: "dashboard", icon: "template", iconActive: "template-fill" },
  { name: "탐지 설정", id: "detection-setting", icon: "radio", iconActive: "radio-fill" },
  { name: "통계", id: "statistics", icon: "barchart", iconActive: "barchart-fill" },
  { name: "연결 데이터 관리", id: "data-management", icon: "share", iconActive: "share-fill" },
  { name: "프로젝트 설정", id: "project-setting", icon: "setting", iconActive: "setting-fill" },
  { name: "문서 관리", id: "document-management", icon: "document-text", iconActive: "document-text-fill" },
  { name: "모델 관리", id: "model-manager", icon: "ai-brain", iconActive: "ai-brain-fill" },
  { name: "계정 관리", id: "account-management", icon: "person-content", iconActive: "person-content-fill" },
];

function AppHeader({ onToggleSidebar, unreadCount, onOpenAlerts }) {
  return (
    <header
      style={{
        height: 54,
        flexShrink: 0,
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        padding: "0 16px",
        background: "var(--semantic-bg-default)",
        borderBottom: "1px solid var(--semantic-line-default)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <BasicIconButton onClick={onToggleSidebar} aria-label="사이드바 접기">
          <Icon name="collapse-sidebar" size={24} />
        </BasicIconButton>
        <span style={{ font: "var(--text-heading-2-semibold)", color: "var(--semantic-text-strong)" }}>
          Protect Go AI
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            font: "var(--text-body-2-normal-semibold)",
            color: "var(--semantic-text-default)",
          }}
        >
          AI 데이터센터 A
          <Icon name="chevron-down-small" size={16} color="var(--semantic-text-sub)" />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <BasicIconButton aria-label="알림 센터" onClick={onOpenAlerts}>
          <span style={{ position: "relative", display: "inline-flex" }}>
            <Icon name="bell-fill" size={24} color="var(--semantic-text-sub)" />
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: -4, right: -6 }}>
                <PushBadge variant="number" count={unreadCount} maxCount={99} />
              </span>
            )}
          </span>
        </BasicIconButton>
        <Avatar size="small" />
      </div>
    </header>
  );
}

function Sidebar({ current, onNavigate, collapsed }) {
  return (
    <nav
      data-desc="90"
      style={{
        width: collapsed ? 64 : 255,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--semantic-bg-default)",
        borderRight: "1px solid var(--semantic-line-default)",
        paddingTop: 20,
        transition: "width .25s ease",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {MENU_LIST.map((item) => {
          const active = item.id === current;
          const clickable = !!onNavigate && (item.id === "dashboard");
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => clickable && onNavigate(item.id)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 12,
                height: 44,
                margin: "0 12px",
                padding: collapsed ? "10px" : "10px 10px 10px 16px",
                justifyContent: collapsed ? "center" : "flex-start",
                border: "none",
                borderRadius: 8,
                cursor: clickable ? "pointer" : "default",
                background: active ? "var(--semantic-primary-extra-light)" : "transparent",
                color: "var(--semantic-text-default)",
                font: "var(--text-body-2-normal-regular)",
                whiteSpace: "nowrap",
              }}
            >
              {active && (
                <span
                  style={{
                    position: "absolute",
                    left: -12,
                    width: 4,
                    height: 24,
                    borderRadius: "0 4px 4px 0",
                    background: "var(--semantic-primary-default)",
                  }}
                />
              )}
              <Icon
                name={active ? item.iconActive : item.icon}
                size={24}
                color={active ? "var(--semantic-primary-default)" : "var(--semantic-text-sub)"}
              />
              {!collapsed && item.name}
            </button>
          );
        })}
      </div>

      {!collapsed && (
        <div style={{ padding: "0 12px 20px" }}>
          <FillButton variant="assistive" size="medium" widthType="fixed">
            문의하기
          </FillButton>
        </div>
      )}
    </nav>
  );
}

export function AppShell({ current, onNavigate, alertCount, onOpenAlerts, children }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: 780,
        background: "var(--semantic-bg-default)",
        border: "1px solid var(--semantic-line-default)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <AppHeader onToggleSidebar={() => setCollapsed((v) => !v)} unreadCount={alertCount} onOpenAlerts={onOpenAlerts} />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Sidebar current={current} onNavigate={onNavigate} collapsed={collapsed} />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            background: "var(--semantic-bg-default)",
            padding: "20px 24px 128px",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

// 상세·기록 페이지 공통 카드 — 실제 FE .card: 흰 배경 + border, 그림자 없음, radius 12, padding 20/24
export function Card({ desc, children, padding = "20px 24px", style }) {
  return (
    <div
      data-desc={desc}
      style={{
        background: "var(--semantic-bg-default)",
        border: "1px solid var(--semantic-line-default)",
        borderRadius: 12,
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// 카드 헤더 — FE cardHeader: 32px 아이콘 박스 + 타이틀
export function CardHeader({ icon, title, right, desc }) {
  return (
    <div data-desc={desc} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      {icon && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--semantic-bg-light)",
          }}
        >
          <Icon name={icon} size={20} color="var(--semantic-text-sub)" />
        </span>
      )}
      <h2 style={{ margin: 0, font: "var(--text-heading-2-semibold)", color: "var(--semantic-text-default)" }}>
        {title}
      </h2>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>{right}</div>
    </div>
  );
}
