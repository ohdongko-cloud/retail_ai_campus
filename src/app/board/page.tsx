"use client";

// 익명 게시판 페이지 — Claude Design 기반 테이블 레이아웃 + 글쓰기 모달

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

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

interface Post {
  id: string;
  title: string;
  viewCount: number;
  commentCount: number;
  createdAt: string;
}


export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?page=${p}`);
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setPosts(data.posts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("게시글을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  async function handleSubmit() {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "게시 실패");
        return;
      }
      setWriting(false);
      setDone(true);
      setForm({ title: "", content: "" });
      fetchPosts(1);
      setPage(1);
    } catch {
      toast.error("오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    Math.min(totalPages, page + 2)
  );

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
            홈 › 익명 게시판
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
            익명 게시판
          </h1>
          <p
            style={{ margin: "6px 0 0", fontSize: 14, color: T.textMuted }}
          >
            익명으로 자유롭게 질문하고 의견을 나눠보세요. 작성자는 식별되지
            않습니다.
          </p>
        </div>
        <button
          onClick={() => setWriting(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 40,
            padding: "0 16px",
            borderRadius: T.r,
            background: T.primary,
            color: "#fff",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: T.fontKo,
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(15,30,51,0.08)",
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
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          글쓰기
        </button>
      </div>

      {/* Posts table card */}
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: T.r2,
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(15,30,51,0.04)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 520,
              fontFamily: T.fontKo,
            }}
          >
            <thead>
              <tr>
                <th style={thStyle(60)}>번호</th>
                <th
                  style={{
                    ...thStyle(),
                    textAlign: "left",
                    paddingLeft: 20,
                  }}
                >
                  제목
                </th>
                <th style={thStyle(120)}>작성일</th>
                <th style={thStyle(80)}>조회수</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: "48px 0",
                      textAlign: "center",
                      color: T.textMuted,
                      fontSize: 14,
                    }}
                  >
                    불러오는 중...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: "48px 0",
                      textAlign: "center",
                      color: T.textMuted,
                      fontSize: 14,
                    }}
                  >
                    아직 게시글이 없습니다. 첫 번째 글을 작성해 보세요!
                  </td>
                </tr>
              ) : (
                posts.map((post, i) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    index={total - (page - 1) * 10 - i}
                    formatDate={formatDate}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: "16px 20px",
              borderTop: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <PageBtn
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              icon="prev"
            />
            {pageNums.map((n) => (
              <PageBtn
                key={n}
                active={n === page}
                onClick={() => setPage(n)}
              >
                {n}
              </PageBtn>
            ))}
            <PageBtn
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              icon="next"
            />
          </div>
        )}
      </div>

      {/* Write modal */}
      {writing && (
        <WriteModal
          title="익명 글쓰기"
          subtitle="글은 익명으로 작성되며, 작성자 정보는 저장되지 않습니다."
          form={form}
          setForm={setForm}
          onClose={() => {
            setWriting(false);
            setForm({ title: "", content: "" });
          }}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {/* Success modal */}
      {done && (
        <SuccessModal
          message="게시판에서 작성한 글을 확인해보세요."
          onClose={() => setDone(false)}
        />
      )}
    </main>
  );
}

function PostRow({
  post,
  index,
  formatDate,
}: {
  post: Post;
  index: number;
  formatDate: (iso: string) => string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderTop: `1px solid ${T.border}`,
        background: hovered ? T.primarySoft : "transparent",
        transition: "background .12s",
        cursor: "pointer",
      }}
    >
      <td style={tdStyle()}>{index}</td>
      <td style={{ ...tdStyle(), textAlign: "left", paddingLeft: 20 }}>
        <span
          style={{
            fontSize: 14,
            color: T.text,
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          {post.title}
        </span>
        {post.commentCount > 0 && (
          <span
            style={{
              marginLeft: 6,
              fontSize: 12,
              color: T.primary,
              fontWeight: 600,
              fontFamily: T.fontEn,
            }}
          >
            [{post.commentCount}]
          </span>
        )}
      </td>
      <td
        style={{
          ...tdStyle(),
          color: T.textMuted,
          fontSize: 13,
          fontFamily: T.fontEn,
        }}
      >
        {formatDate(post.createdAt)}
      </td>
      <td
        style={{
          ...tdStyle(),
          color: T.textMuted,
          fontSize: 13,
          fontFamily: T.fontEn,
        }}
      >
        {post.viewCount.toLocaleString()}
      </td>
    </tr>
  );
}

const thStyle = (w?: number) =>
  ({
    padding: "14px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: T.textMuted,
    textAlign: "center" as const,
    borderBottom: `1px solid ${T.border}`,
    background: T.surfaceAlt,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    width: w,
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties);

const tdStyle = () =>
  ({
    padding: "14px 12px",
    textAlign: "center" as const,
    fontSize: 14,
    color: T.text,
    verticalAlign: "middle",
  } as React.CSSProperties);

function PageBtn({
  children,
  icon,
  active,
  disabled,
  onClick,
}: {
  children?: React.ReactNode;
  icon?: "prev" | "next";
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        border: "none",
        background: active ? T.primary : "transparent",
        color: active ? "#fff" : disabled ? T.textFaint : T.textBody,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: T.fontEn,
      }}
    >
      {icon === "prev" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      ) : icon === "next" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}

function WriteModal({
  title,
  subtitle,
  form,
  setForm,
  onClose,
  onSubmit,
  submitting,
  extraFields,
}: {
  title: string;
  subtitle: string;
  form: { title: string; content: string };
  setForm: (f: { title: string; content: string }) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
  extraFields?: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const canSubmit = form.title?.trim() && form.content?.trim();

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
          maxWidth: 640,
          maxHeight: "calc(100vh - 32px)",
          boxShadow: "0 4px 12px rgba(15,30,51,0.06), 0 16px 40px rgba(15,30,51,0.10)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "modalIn .2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px",
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: T.text,
              fontFamily: T.fontKo,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textMuted }}>
            {subtitle}
          </p>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 28px",
            display: "grid",
            gap: 16,
            overflowY: "auto",
          }}
        >
          <ModalField
            label="제목"
            required
            placeholder="제목을 입력하세요"
            value={form.title ?? ""}
            onChange={(v) => setForm({ ...form, title: v })}
          />
          {extraFields}
          <ModalField
            label="내용"
            required
            placeholder="자유롭게 작성해 주세요"
            value={form.content ?? ""}
            onChange={(v) => setForm({ ...form, content: v })}
            rows={6}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 28px 24px",
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
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
            취소
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting || !canSubmit}
            style={{
              height: 40,
              padding: "0 20px",
              borderRadius: T.r,
              background: submitting || !canSubmit ? T.textFaint : T.primary,
              color: "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: T.fontKo,
              cursor: submitting || !canSubmit ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "게시 중..." : "게시하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalField({
  label,
  required,
  placeholder,
  value,
  onChange,
  type = "text",
  rows,
  hint,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  rows?: number;
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  const inputStyle: React.CSSProperties = {
    width: "100%",
    minHeight: rows ? rows * 22 + 16 : 40,
    padding: rows ? "10px 12px" : "0 12px",
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
    resize: rows ? "vertical" : undefined,
  };

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
      {rows ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={inputStyle}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={inputStyle}
        />
      )}
      {hint && (
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function SuccessModal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
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
          maxWidth: 360,
          boxShadow: "0 4px 12px rgba(15,30,51,0.06), 0 16px 40px rgba(15,30,51,0.10)",
          overflow: "hidden",
          animation: "modalIn .2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div style={{ padding: "32px 28px", textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: T.successBg,
              color: T.success,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12.5l4 4L19 7" />
            </svg>
          </div>
          <h3
            style={{
              margin: "0 0 6px",
              fontSize: 17,
              fontWeight: 700,
              color: T.text,
              fontFamily: T.fontKo,
            }}
          >
            게시되었습니다
          </h3>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: T.textMuted }}>
            {message}
          </p>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              height: 40,
              borderRadius: T.r,
              background: T.primary,
              color: "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: T.fontKo,
              cursor: "pointer",
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

// Export shared components for use in share page
export { WriteModal, ModalField, SuccessModal, PageBtn, thStyle, tdStyle };
