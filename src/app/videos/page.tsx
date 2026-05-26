"use client";

// 강의 영상 페이지 — Claude Design 기반 사이드바 + 카드 그리드

import { useState, useEffect } from "react";
import { VideoLevel } from "@/generated/prisma/enums";

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
  r: 8,
  r2: 12,
  r3: 16,
  fontKo:
    'var(--font-noto-sans-kr), var(--font-inter), "Noto Sans KR", "Inter", system-ui, sans-serif',
  fontEn:
    'var(--font-inter), var(--font-noto-sans-kr), "Inter", "Noto Sans KR", system-ui, sans-serif',
};

interface Video {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  level: VideoLevel;
  thumbnail: string | null;
  orderIndex: number;
  createdAt: string;
}

const LEVEL_LABELS: Record<string, string> = {
  BASIC: "기초",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
  APPLIED: "실전적용",
  전체: "전체",
};

const LEVEL_TABS = [
  { id: "전체", label: "전체" },
  { id: VideoLevel.BASIC, label: "기초" },
  { id: VideoLevel.INTERMEDIATE, label: "중급" },
  { id: VideoLevel.ADVANCED, label: "고급" },
  { id: VideoLevel.APPLIED, label: "실전적용" },
];

const LEVEL_TONES: Record<string, "primary" | "secondary" | "info"> = {
  BASIC: "primary",
  INTERMEDIATE: "secondary",
  ADVANCED: "info",
  APPLIED: "primary",
};

const BADGE_STYLES: Record<string, { bg: string; fg: string }> = {
  primary: { bg: T.primaryLight, fg: T.primary },
  secondary: { bg: T.secondaryLight, fg: T.secondaryDark },
  info: { bg: "#E8EEFB", fg: "#2563EB" },
};

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

const THUMB_PALETTES = [
  { bg: "#E6EEF7", fg: "#004A99" },
  { bg: "#FFF1E6", fg: "#C2581F" },
  { bg: "#E6F6EE", fg: "#1E9E6A" },
  { bg: "#F0E6F7", fg: "#6940C9" },
  { bg: "#FCE6EA", fg: "#D8364C" },
  { bg: "#FFF6DB", fg: "#9C7100" },
];

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("전체");
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState<Video | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/videos");
        if (res.ok) {
          const data = await res.json();
          setVideos(data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = videos.filter((v) => {
    const levelMatch = level === "전체" || v.level === level;
    const queryMatch =
      !query ||
      v.title.toLowerCase().includes(query.toLowerCase()) ||
      (v.description?.toLowerCase().includes(query.toLowerCase()) ?? false);
    return levelMatch && queryMatch;
  });

  const levelCounts: Record<string, number> = { 전체: videos.length };
  for (const v of videos) {
    levelCounts[v.level] = (levelCounts[v.level] || 0) + 1;
  }

  return (
    <main
      style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 64px" }}
    >
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: T.textMuted,
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            홈 › 강의 영상
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 700,
              color: T.text,
              fontFamily: T.fontKo,
              letterSpacing: "-0.02em",
            }}
          >
            강의 영상
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 14,
              color: T.textMuted,
              fontFamily: T.fontKo,
            }}
          >
            레벨에 맞춰 골라보세요. 모든 영상은 무료입니다.
          </p>
        </div>
      </div>

      {/* Sidebar + Grid layout */}
      <div
        className="lect-grid"
        style={{
          display: "grid",
          gap: 24,
          gridTemplateColumns: "minmax(0, 240px) minmax(0, 1fr)",
        }}
      >
        {/* Sidebar */}
        <aside style={{ minWidth: 0 }}>
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: T.r2,
              padding: 16,
              position: "sticky",
              top: 88,
              boxShadow: "0 1px 2px rgba(15,30,51,0.04)",
            }}
          >
            {/* Search */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: T.textMuted,
                  pointerEvents: "none",
                }}
              >
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
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="M16 16l4.5 4.5" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="강의 검색..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 12px 0 36px",
                  border: `1px solid ${T.border}`,
                  borderRadius: T.r,
                  background: T.surface,
                  fontSize: 14,
                  fontFamily: T.fontKo,
                  color: T.text,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Level filter */}
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: T.textMuted,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginBottom: 10,
                fontFamily: T.fontEn,
              }}
            >
              레벨
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {LEVEL_TABS.map((tab) => {
                const on = level === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setLevel(tab.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: T.r,
                      background: on ? T.primaryLight : "transparent",
                      color: on ? T.primary : T.textBody,
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 14,
                      fontWeight: on ? 600 : 500,
                      fontFamily: T.fontKo,
                      letterSpacing: "-0.01em",
                      transition: "background .12s",
                    }}
                  >
                    <span>{tab.label}</span>
                    <span
                      style={{
                        fontSize: 12,
                        color: on ? T.primary : T.textFaint,
                        fontWeight: 600,
                        fontFamily: T.fontEn,
                      }}
                    >
                      {levelCounts[tab.id] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Learning tip */}
            <div
              style={{
                marginTop: 20,
                padding: 14,
                borderRadius: T.r,
                background: T.secondaryLight,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={T.secondaryDark}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
                </svg>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.secondaryDark,
                  }}
                >
                  학습 팁
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: T.secondaryDark,
                  lineHeight: 1.5,
                }}
              >
                기초부터 차근차근! 강의 시청 후 게시판에서 모르는 부분을
                질문해 보세요.
              </p>
            </div>
          </div>
        </aside>

        {/* Video grid */}
        <div style={{ minWidth: 0 }}>
          {/* Results count */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: T.textBody,
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              총{" "}
              <strong style={{ color: T.primary }}>{filtered.length}</strong>
              편의 강의
            </div>
          </div>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: T.textMuted,
              }}
            >
              강의를 불러오는 중...
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: T.r2,
                padding: 48,
                textAlign: "center",
                boxShadow: "0 1px 2px rgba(15,30,51,0.04)",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: T.text,
                  marginBottom: 4,
                  fontFamily: T.fontKo,
                }}
              >
                {videos.length === 0
                  ? "등록된 강의가 없습니다"
                  : "검색 결과가 없습니다"}
              </div>
              <p
                style={{ margin: 0, fontSize: 13, color: T.textMuted }}
              >
                {videos.length === 0
                  ? "관리자가 강의를 등록하면 여기에 표시됩니다."
                  : "다른 키워드로 검색하거나 필터를 조정해보세요."}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              }}
            >
              {filtered.map((video, idx) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  palette={idx % THUMB_PALETTES.length}
                  onClick={() => setPlaying(video)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video modal */}
      {playing && (
        <VideoModal video={playing} onClose={() => setPlaying(null)} />
      )}
    </main>
  );
}

function VideoCard({
  video,
  palette,
  onClick,
}: {
  video: Video;
  palette: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const videoId = extractYouTubeId(video.youtubeUrl);
  const thumbnail =
    video.thumbnail ||
    (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);
  const pal = THUMB_PALETTES[palette];
  const levelLabel = LEVEL_LABELS[video.level] ?? video.level;
  const toneName = LEVEL_TONES[video.level] ?? "primary";
  const badgeStyle = BADGE_STYLES[toneName];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: T.r2,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hovered
          ? "0 2px 6px rgba(15,30,51,0.04), 0 8px 24px rgba(15,30,51,0.06)"
          : "0 1px 2px rgba(15,30,51,0.04)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all .18s",
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={video.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform .3s",
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: pal.bg,
              backgroundImage: `repeating-linear-gradient(135deg, transparent 0 12px, ${pal.fg}11 12px 13px)`,
            }}
          />
        )}
        {/* Play button overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M9 7l9 5-9 5V7z" fill={T.primary} />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 20,
              padding: "0 8px",
              fontSize: 11,
              background: badgeStyle.bg,
              color: badgeStyle.fg,
              borderRadius: 9999,
              fontWeight: 600,
              fontFamily: T.fontKo,
            }}
          >
            {levelLabel}
          </span>
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: T.text,
            letterSpacing: "-0.02em",
            marginBottom: 4,
            fontFamily: T.fontKo,
            lineHeight: 1.4,
          }}
        >
          {video.title}
        </div>
        {video.description && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: T.textMuted,
              lineHeight: 1.5,
              fontFamily: T.fontKo,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
}

function VideoModal({
  video,
  onClose,
}: {
  video: Video;
  onClose: () => void;
}) {
  const videoId = extractYouTubeId(video.youtubeUrl);
  const levelLabel = LEVEL_LABELS[video.level] ?? video.level;
  const toneName = LEVEL_TONES[video.level] ?? "primary";
  const badgeStyle = BADGE_STYLES[toneName];

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,30,51,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeIn .15s ease",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface,
          borderRadius: T.r3,
          width: "100%",
          maxWidth: 840,
          maxHeight: "calc(100vh - 32px)",
          boxShadow:
            "0 4px 12px rgba(15,30,51,0.06), 0 16px 40px rgba(15,30,51,0.10)",
          overflow: "hidden",
          animation: "modalIn .2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: T.r,
            border: "none",
            background: "rgba(255,255,255,0.9)",
            cursor: "pointer",
            color: T.textMuted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
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
        </button>

        {/* Video player */}
        {videoId ? (
          <div style={{ aspectRatio: "16/9", background: "#000" }}>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ display: "block", border: "none" }}
            />
          </div>
        ) : (
          <div
            style={{
              aspectRatio: "16/9",
              background: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            영상을 불러올 수 없습니다.
          </div>
        )}

        {/* Video info */}
        <div style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 20,
                padding: "0 8px",
                fontSize: 11,
                background: badgeStyle.bg,
                color: badgeStyle.fg,
                borderRadius: 9999,
                fontWeight: 600,
                fontFamily: T.fontKo,
              }}
            >
              {levelLabel}
            </span>
          </div>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: 20,
              fontWeight: 700,
              color: T.text,
              fontFamily: T.fontKo,
              letterSpacing: "-0.02em",
            }}
          >
            {video.title}
          </h3>
          {video.description && (
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: T.textBody,
                lineHeight: 1.6,
              }}
            >
              {video.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
