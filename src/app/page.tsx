"use client";

// 사내 AI 교육 플랫폼 메인 페이지
// Claude Design 기반 UI: 히어로 배너 + 통계 스트립 + 서비스 카드 그리드

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserInfoDialog } from "@/components/landing/user-info-dialog";
import { getStoredUser, type StoredUser } from "@/lib/user-session";
import { trackEvent } from "@/lib/analytics";

const T = {
  primary: "#004A99",
  primaryDark: "#003A78",
  primaryLight: "#E6EEF7",
  primarySoft: "#F0F5FB",
  secondary: "#FF914D",
  secondaryDark: "#E67835",
  secondaryLight: "#FFF1E6",
  bg: "#F5F7FA",
  surface: "#FFFFFF",
  surfaceAlt: "#FAFBFD",
  text: "#0F1E33",
  textBody: "#3B4A63",
  textMuted: "#6B7A91",
  textFaint: "#9BA7BC",
  border: "#E5EAF1",
  borderStrong: "#D4DBE6",
  success: "#1E9E6A",
  successBg: "#E6F6EE",
  r: 8,
  r2: 12,
  r3: 16,
  fontKo:
    'var(--font-noto-sans-kr), var(--font-inter), "Noto Sans KR", "Inter", system-ui, sans-serif',
  fontEn:
    'var(--font-inter), var(--font-noto-sans-kr), "Inter", "Noto Sans KR", system-ui, sans-serif',
};

const SERVICE_CARDS = [
  {
    id: "videos",
    href: "/videos",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="14" height="12" rx="2"/>
        <path d="M17 10l4-2v8l-4-2"/>
      </svg>
    ),
    title: "강의 영상 시청",
    desc: "기초·중급·고급으로 구성된 AI 강의를\n레벨에 맞춰 학습할 수 있습니다.",
    tone: { bg: "#E6EEF7", fg: "#004A99", accent: "#004A99" },
    stat: "수준별 강의",
  },
  {
    id: "board",
    href: "/board",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="5" width="16" height="14" rx="2"/>
        <path d="M8 10h8M8 14h5"/>
      </svg>
    ),
    title: "익명 게시판",
    desc: "익명으로 자유롭게 질문하고\n다른 사람의 의견도 살펴보세요.",
    tone: { bg: "#FFF1E6", fg: "#E67835", accent: "#FF914D" },
    stat: "익명 소통",
  },
  {
    id: "meeting",
    href: "/meeting",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="16" height="14" rx="2"/>
        <path d="M4 10h16M9 4v4M15 4v4"/>
      </svg>
    ),
    title: "미팅 요청",
    desc: "평일 08:00–17:00 사이 30분 단위로\n원하는 시간에 미팅을 예약합니다.",
    tone: { bg: "#E6F6EE", fg: "#1E9E6A", accent: "#1E9E6A" },
    stat: "이번 주 가능",
  },
  {
    id: "chatroom",
    href: "/api/chatroom",
    external: true,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2h-7l-5 4v-4H5a2 2 0 01-2-2V7a2 2 0 012-2z"/>
      </svg>
    ),
    title: "오픈채팅방 입장",
    desc: "실시간 소통이 가능한\n카카오톡 오픈채팅방으로 이동합니다.",
    tone: { bg: "#FFF6DB", fg: "#9C7100", accent: "#E0A100" },
    stat: "새 탭에서 열림",
  },
  {
    id: "share",
    href: "/share",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="12" r="2.5"/>
        <circle cx="18" cy="6" r="2.5"/>
        <circle cx="18" cy="18" r="2.5"/>
        <path d="M8.2 11l7.6-4M8.2 13l7.6 4"/>
      </svg>
    ),
    title: "내 서비스 공유",
    desc: "내가 만든 AI 서비스를 등록하고\n다른 사람의 피드백을 받아보세요.",
    tone: { bg: "#F0E6F7", fg: "#6940C9", accent: "#6940C9" },
    stat: "서비스 공유",
  },
];

const STAT_ITEMS = [
  {
    label: "강의 영상",
    value: "24",
    unit: "편",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 4h7c2 0 4 1 4 3v13c0-1.5-2-2.5-4-2.5H5V4z"/>
        <path d="M19 4h-3c-1 0-3 .5-3 3v13"/>
      </svg>
    ),
    tone: "#004A99",
  },
  {
    label: "주간 미팅 슬롯",
    value: "18",
    unit: "개",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 2"/>
      </svg>
    ),
    tone: "#1E9E6A",
  },
  {
    label: "게시판 글",
    value: "12",
    unit: "개",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="5" width="16" height="14" rx="2"/>
        <path d="M8 10h8M8 14h5"/>
      </svg>
    ),
    tone: "#FF914D",
  },
  {
    label: "공유 서비스",
    value: "8",
    unit: "개",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="12" r="2.5"/>
        <circle cx="18" cy="6" r="2.5"/>
        <circle cx="18" cy="18" r="2.5"/>
        <path d="M8.2 11l7.6-4M8.2 13l7.6 4"/>
      </svg>
    ),
    tone: "#6940C9",
  },
];

export default function HomePage() {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    const startedAt = Date.now();
    trackEvent({ type: "PAGE_VIEW", target: "/" });
    return () => {
      const durationMs = Date.now() - startedAt;
      trackEvent({ type: "PAGE_VIEW", target: "/", durationMs });
    };
  }, []);

  function handleCardClick(id: string) {
    trackEvent({
      type: id === "chatroom" ? "CHATROOM_OPEN" : "BUTTON_CLICK",
      target: id,
    });
  }

  return (
    <main
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "32px 24px 64px",
      }}
    >
      {/* Hero gradient banner */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: T.r3,
          padding: "36px 32px",
          background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
          color: "#fff",
          marginBottom: 32,
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${T.secondary}66 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: 80,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative" }}>
          {/* Label badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(6px)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 14,
              whiteSpace: "nowrap",
              fontFamily: T.fontEn,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
            </svg>
            AI Service Hub
          </div>

          {/* Greeting */}
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(22px, 3.5vw, 30px)",
              fontFamily: T.fontKo,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.35,
            }}
          >
            안녕하세요{user?.name ? `, ${user.name}님` : ""} 👋
            <br />
            <span
              style={{ opacity: 0.85, fontWeight: 500, fontSize: "0.85em" }}
            >
              오늘도 함께 더 나은 서비스를 만들어가요.
            </span>
          </h1>

          {/* CTA buttons */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/videos"
              onClick={() => handleCardClick("videos")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 40,
                padding: "0 16px",
                borderRadius: T.r,
                background: T.secondary,
                color: "#fff",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: T.fontKo,
                boxShadow: "0 1px 2px rgba(15,30,51,0.08)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="6" width="14" height="12" rx="2"/>
                <path d="M17 10l4-2v8l-4-2"/>
              </svg>
              강의 보러가기
            </Link>
            <Link
              href="/meeting"
              onClick={() => handleCardClick("meeting")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 40,
                padding: "0 16px",
                borderRadius: T.r,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "#fff",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: T.fontKo,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="6" width="16" height="14" rx="2"/>
                <path d="M4 10h16M9 4v4M15 4v4"/>
              </svg>
              미팅 예약하기
            </Link>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 32,
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        }}
      >
        {STAT_ITEMS.map((s) => (
          <div
            key={s.label}
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: T.r2,
              padding: 16,
              boxShadow: "0 1px 2px rgba(15,30,51,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: T.r,
                  background: s.tone + "18",
                  color: s.tone,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: T.textMuted,
                    fontWeight: 500,
                    marginBottom: 2,
                    fontFamily: T.fontKo,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 3,
                  }}
                >
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: T.text,
                      fontFamily: T.fontEn,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {s.value}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: T.textMuted,
                      fontWeight: 500,
                    }}
                  >
                    {s.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section header */}
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            margin: 0,
            fontFamily: T.fontKo,
            fontSize: 18,
            fontWeight: 700,
            color: T.text,
            letterSpacing: "-0.02em",
          }}
        >
          주요 서비스
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textMuted }}>
          원하는 메뉴를 선택해 시작하세요.
        </p>
      </div>

      {/* Service cards grid */}
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        {SERVICE_CARDS.map((c) => (
          <ServiceCard key={c.id} card={c} onCardClick={handleCardClick} />
        ))}
      </div>

      {/* Welcome overlay */}
      <UserInfoDialog />
    </main>
  );
}

function ServiceCard({
  card,
  onCardClick,
}: {
  card: (typeof SERVICE_CARDS)[0];
  onCardClick: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const linkProps = card.external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={card.href}
      onClick={() => onCardClick(card.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ textDecoration: "none" }}
      {...linkProps}
    >
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: T.r2,
          overflow: "hidden",
          boxShadow: hovered
            ? "0 2px 6px rgba(15,30,51,0.04), 0 8px 24px rgba(15,30,51,0.06)"
            : "0 1px 2px rgba(15,30,51,0.04)",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
          transition: "all .18s",
          height: "100%",
        }}
      >
        <div style={{ padding: 24, position: "relative" }}>
          {/* Accent top bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: card.tone.accent,
            }}
          />

          {/* Icon + stat row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: T.r2,
                background: card.tone.bg,
                color: card.tone.fg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {card.icon}
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 24,
                padding: "0 10px",
                fontSize: 12,
                background: "#EEF1F6",
                color: T.textBody,
                borderRadius: 9999,
                fontWeight: 600,
                fontFamily: T.fontKo,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}
            >
              {card.stat}
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: T.text,
              fontFamily: T.fontKo,
              marginBottom: 6,
              letterSpacing: "-0.02em",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {card.title}
            {card.external && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={T.textMuted}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 14a4 4 0 010-6l3-3a4 4 0 016 6l-1.5 1.5" />
                <path d="M14 10a4 4 0 010 6l-3 3a4 4 0 01-6-6l1.5-1.5" />
              </svg>
            )}
          </div>

          {/* Description */}
          <p
            style={{
              margin: 0,
              fontSize: 13.5,
              color: T.textBody,
              lineHeight: 1.55,
              fontFamily: T.fontKo,
              whiteSpace: "pre-line",
            }}
          >
            {card.desc}
          </p>

          {/* Footer link */}
          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: `1px dashed ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 13,
              fontWeight: 600,
              color: card.tone.accent,
            }}
          >
            <span>바로가기</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
