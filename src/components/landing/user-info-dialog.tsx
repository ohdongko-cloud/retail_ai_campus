"use client";

// 최초 접속 시 직원 정보 입력 오버레이
// Claude Design welcome.jsx 기반 그라디언트 히어로 + 폼 디자인

import { useEffect, useState } from "react";
import {
  getStoredUser,
  setStoredUser,
  hasBeenPrompted,
  markPrompted,
  type StoredUser,
} from "@/lib/user-session";

const T = {
  primary: "#004A99",
  primaryDark: "#003A78",
  primaryLight: "#E6EEF7",
  secondary: "#FF914D",
  secondaryDark: "#E67835",
  secondaryLight: "#FFF1E6",
  surface: "#FFFFFF",
  text: "#0F1E33",
  textBody: "#3B4A63",
  textMuted: "#6B7A91",
  border: "#E5EAF1",
  r: 8,
  r2: 12,
  r3: 16,
  fontKo:
    'var(--font-noto-sans-kr), var(--font-inter), "Noto Sans KR", "Inter", system-ui, sans-serif',
  fontEn:
    'var(--font-inter), var(--font-noto-sans-kr), "Inter", "Noto Sans KR", system-ui, sans-serif',
};

export function UserInfoDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StoredUser>({
    name: "",
    organization: "",
    jobTitle: "",
    email: "",
  });

  useEffect(() => {
    const stored = getStoredUser();
    const shouldOpen = !hasBeenPrompted();
    if (stored) {
      setForm({
        name: stored.name ?? "",
        organization: stored.organization ?? "",
        jobTitle: stored.jobTitle ?? "",
        email: stored.email ?? "",
      });
    }
    if (shouldOpen) setOpen(true);
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStoredUser(form);
    markPrompted();
    setOpen(false);
  }

  function handleSkip() {
    markPrompted();
    setOpen(false);
  }

  // Lock scroll while open
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(15,30,51,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeIn .15s ease",
      }}
    >
      <div
        style={{
          background: T.surface,
          borderRadius: T.r3,
          width: "100%",
          maxWidth: 520,
          maxHeight: "calc(100vh - 32px)",
          boxShadow:
            "0 4px 12px rgba(15,30,51,0.06), 0 16px 40px rgba(15,30,51,0.12)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "modalIn .22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero band */}
        <div
          style={{
            background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
            padding: "32px 32px 24px",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* Decorative glow */}
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,145,77,0.35) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Welcome badge */}
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
              marginBottom: 16,
              position: "relative",
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
            Welcome
          </div>

          <h2
            style={{
              margin: 0,
              fontFamily: T.fontKo,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              position: "relative",
              lineHeight: 1.3,
            }}
          >
            AI 서비스 포털에 오신 것을 환영합니다
          </h2>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 14,
              opacity: 0.85,
              fontFamily: T.fontKo,
              position: "relative",
              lineHeight: 1.5,
            }}
          >
            더 나은 경험을 위해 몇 가지 정보를 알려주세요.
            <br />
            입력하신 정보는 안전하게 보관되며 서비스 개선에만 사용됩니다.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSave}
          style={{
            padding: "24px 32px 28px",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "grid", gap: 16 }}>
            {/* Name + Org row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              <WelcomeField
                label="이름"
                required
                placeholder="홍길동"
                value={form.name ?? ""}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              />
              <WelcomeField
                label="소속"
                required
                placeholder="회사·팀 이름"
                value={form.organization ?? ""}
                onChange={(v) => setForm((f) => ({ ...f, organization: v }))}
              />
            </div>

            <WelcomeField
              label="직무"
              required
              placeholder="예: AI 엔지니어, 기획자, 마케터"
              value={form.jobTitle ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, jobTitle: v }))}
            />

            <WelcomeField
              label="이메일"
              required
              type="email"
              placeholder="you@example.com"
              value={form.email ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            />
          </div>

          {/* Notice */}
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: T.r,
              background: T.secondaryLight,
              display: "flex",
              alignItems: "center",
              gap: 8,
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
              <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
            </svg>
            <span
              style={{
                fontSize: 12,
                color: T.secondaryDark,
                fontWeight: 500,
                fontFamily: T.fontKo,
              }}
            >
              <strong style={{ fontWeight: 700 }}>*</strong> 표시 항목은 정확한
              서비스 매칭을 위해 권장됩니다.
            </span>
          </div>

          {/* Actions */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={handleSkip}
              style={{
                height: 40,
                padding: "0 16px",
                borderRadius: T.r,
                border: "none",
                background: "transparent",
                color: T.textBody,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: T.fontKo,
                cursor: "pointer",
              }}
            >
              나중에 입력
            </button>
            <button
              type="submit"
              style={{
                height: 40,
                padding: "0 20px",
                borderRadius: T.r,
                background: T.primary,
                color: "#fff",
                border: "none",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: T.fontKo,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 1px 2px rgba(15,30,51,0.08)",
              }}
            >
              시작하기
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
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WelcomeField({
  label,
  required,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: T.text,
          marginBottom: 6,
          fontFamily: T.fontKo,
        }}
      >
        {label}
        {required && (
          <span style={{ color: T.secondary, marginLeft: 4 }}>*</span>
        )}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-required={required ? "true" : undefined}
        style={{
          width: "100%",
          height: 40,
          padding: "0 12px",
          border: `1px solid ${focused ? T.primary : T.border}`,
          borderRadius: T.r,
          background: T.surface,
          fontSize: 14,
          fontFamily: T.fontKo,
          color: T.text,
          outline: "none",
          boxShadow: focused ? `0 0 0 3px ${T.primaryLight}` : "none",
          transition: "all .15s",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
