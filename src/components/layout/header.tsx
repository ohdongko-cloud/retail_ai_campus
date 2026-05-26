"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Design tokens (inline for use in style props)
const T = {
  primary: "#004A99",
  primaryDark: "#003A78",
  primaryLight: "#E6EEF7",
  secondary: "#FF914D",
  bg: "#F5F7FA",
  surface: "#FFFFFF",
  text: "#0F1E33",
  textBody: "#3B4A63",
  textMuted: "#6B7A91",
  border: "#E5EAF1",
  r: 8,
  fontKo:
    'var(--font-noto-sans-kr), var(--font-inter), "Noto Sans KR", "Inter", system-ui, sans-serif',
  fontEn:
    'var(--font-inter), var(--font-noto-sans-kr), "Inter", "Noto Sans KR", system-ui, sans-serif',
};

const ROUTES = [
  { href: "/", label: "홈" },
  { href: "/videos", label: "강의 영상" },
  { href: "/board", label: "익명 게시판" },
  { href: "/meeting", label: "미팅 요청" },
  { href: "/share", label: "서비스 공유" },
];

export function AppHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(12px) saturate(180%)",
        WebkitBackdropFilter: "blur(12px) saturate(180%)",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: T.r,
              background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 2px rgba(15,30,51,0.06)",
              flexShrink: 0,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
              <path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8L16.5 18.5l1.8-.7L19 16z" />
            </svg>
          </div>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: T.text,
                fontFamily: T.fontKo,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              AI 서비스 포털
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: T.textMuted,
                fontWeight: 500,
                fontFamily: T.fontEn,
                letterSpacing: "0.06em",
                marginTop: 2,
              }}
            >
              AI SERVICE HUB
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav
          className="main-nav"
          style={{ display: "flex", alignItems: "center", gap: 2 }}
        >
          {ROUTES.map((r) => {
            const on = isActive(r.href);
            return (
              <Link
                key={r.href}
                href={r.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 14px",
                  borderRadius: T.r,
                  background: on ? T.primaryLight : "transparent",
                  color: on ? T.primary : T.textBody,
                  textDecoration: "none",
                  fontSize: 13.5,
                  fontWeight: on ? 600 : 500,
                  fontFamily: T.fontKo,
                  letterSpacing: "-0.01em",
                  transition: "background .12s",
                  whiteSpace: "nowrap",
                }}
              >
                {r.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side: notification bell + mobile toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* Notification bell (decorative) */}
          <button
            style={{
              width: 38,
              height: 38,
              borderRadius: T.r,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              position: "relative",
              color: T.textBody,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => {}}
            aria-label="알림"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 17h12l-1.5-2V11a4.5 4.5 0 00-9 0v4L6 17z" />
              <path d="M10 20a2 2 0 004 0" />
            </svg>
            <span
              style={{
                position: "absolute",
                top: 8,
                right: 9,
                width: 7,
                height: 7,
                borderRadius: 4,
                background: T.secondary,
                border: "2px solid #fff",
              }}
            />
          </button>

          {/* Mobile menu toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              width: 38,
              height: 38,
              borderRadius: T.r,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: T.text,
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 4,
            }}
            aria-label="메뉴"
          >
            {mobileOpen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div
          className="mobile-nav"
          style={{
            borderTop: `1px solid ${T.border}`,
            background: T.surface,
            padding: "8px 16px 16px",
          }}
        >
          {ROUTES.map((r) => {
            const on = isActive(r.href);
            return (
              <Link
                key={r.href}
                href={r.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: T.r,
                  background: on ? T.primaryLight : "transparent",
                  color: on ? T.primary : T.textBody,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: on ? 600 : 500,
                  fontFamily: T.fontKo,
                  marginBottom: 2,
                }}
              >
                {r.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
