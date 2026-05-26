"use client";

// 미팅 예약 페이지 — Claude Design 기반 주간 캘린더 + 인라인 폼

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

interface Slot {
  datetime: string;
  available: boolean;
}

interface BookingForm {
  name: string;
  jobTitle: string;
  currentWork: string;
  requestDetail: string;
  email: string;
  phone: string;
}

const INITIAL_FORM: BookingForm = {
  name: "",
  jobTitle: "",
  currentWork: "",
  requestDetail: "",
  email: "",
  phone: "",
};

const DAY_KR = ["월", "화", "수", "목", "금"];
const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Generate time labels 08:00–16:30 in 30-min increments (18 slots)
const TIME_SLOTS: string[] = [];
for (let slot = 0; slot < 18; slot++) {
  const h = 8 + Math.floor(slot / 2);
  const m = (slot % 2) * 30;
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
}

export default function MeetingPage() {
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() =>
    getMonday(new Date())
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [form, setForm] = useState<BookingForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Build lookup map: ISO datetime string → Slot
  const slotMap: Record<string, Slot> = {};
  for (const s of slots) {
    slotMap[s.datetime] = s;
  }

  const fetchSlots = useCallback(async (monday: Date) => {
    setLoadingSlots(true);
    try {
      const y = monday.getFullYear();
      const m = String(monday.getMonth() + 1).padStart(2, "0");
      const d = String(monday.getDate()).padStart(2, "0");
      const weekStr = `${y}-${m}-${d}`;
      const res = await fetch(`/api/meetings/slots?week=${weekStr}`);
      if (!res.ok) throw new Error("failed");
      setSlots(await res.json());
    } catch {
      toast.error("슬롯 정보를 불러오지 못했습니다.");
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots(currentWeekMonday);
  }, [currentWeekMonday, fetchSlots]);

  function getSlotDatetime(dayOffset: number, slotIndex: number): string {
    const y = currentWeekMonday.getFullYear();
    const mo = String(currentWeekMonday.getMonth() + 1).padStart(2, "0");
    const d = String(currentWeekMonday.getDate()).padStart(2, "0");
    const utcBase = new Date(`${y}-${mo}-${d}T00:00:00.000Z`);
    utcBase.setUTCDate(utcBase.getUTCDate() + dayOffset);
    const hours = 8 + Math.floor(slotIndex / 2);
    const minutes = (slotIndex % 2) * 30;
    utcBase.setUTCHours(hours - 9, minutes, 0, 0); // KST → UTC
    return utcBase.toISOString();
  }

  function getDays() {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(currentWeekMonday);
      d.setDate(currentWeekMonday.getDate() + i);
      return d;
    });
  }

  const days = getDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = selectedSlot ? new Date(selectedSlot) : null;
  const selectedLabel = selectedDate
    ? selectedDate.toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        month: "long",
        day: "numeric",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    const { name, jobTitle, currentWork, requestDetail, email, phone } = form;
    if (!name || !jobTitle || !currentWork || !requestDetail || !email || !phone) {
      toast.error("모든 항목을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          jobTitle,
          currentWork,
          requestDetail,
          email,
          phone,
          startAt: selectedSlot,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "예약에 실패했습니다.");
        return;
      }
      setDone(true);
      setSelectedSlot(null);
      setForm(INITIAL_FORM);
      fetchSlots(currentWeekMonday);
    } catch {
      toast.error("예약 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  function goToPrevWeek() {
    const prev = new Date(currentWeekMonday);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekMonday(prev);
  }

  function goToNextWeek() {
    const next = new Date(currentWeekMonday);
    next.setDate(next.getDate() + 7);
    setCurrentWeekMonday(next);
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
            홈 › 미팅 요청
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
            미팅 예약
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 14,
              color: T.textMuted,
              fontFamily: T.fontKo,
            }}
          >
            원하는 시간을 선택하고 정보를 입력해 주세요. 평일 08:00–17:00,
            30분 단위 예약이 가능합니다.
          </p>
        </div>
      </div>

      {/* Calendar card */}
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: T.r2,
          overflow: "hidden",
          marginBottom: 24,
          boxShadow: "0 1px 2px rgba(15,30,51,0.04)",
        }}
      >
        {/* Calendar header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={T.primary}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="6" width="16" height="14" rx="2" />
              <path d="M4 10h16M9 4v4M15 4v4" />
            </svg>
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: T.text,
                  fontFamily: T.fontKo,
                  letterSpacing: "-0.02em",
                }}
              >
                {currentWeekMonday.getFullYear()}년{" "}
                {currentWeekMonday.getMonth() + 1}월
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: T.textMuted,
                  marginTop: 2,
                  fontFamily: T.fontEn,
                }}
              >
                {currentWeekMonday.getMonth() + 1}/
                {currentWeekMonday.getDate()} –{" "}
                {days[4].getMonth() + 1}/{days[4].getDate()}
              </div>
            </div>
          </div>

          {/* Navigation + legend */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12 }}
            >
              <LegendDot
                color={T.surface}
                border={T.borderStrong}
                label="가능"
              />
              <LegendDot color={T.primary} label="선택됨" />
              <LegendDot color="#F2F4F8" border={T.border} label="예약됨" />
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={goToPrevWeek}
                style={{
                  width: 32,
                  height: 32,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.r,
                  background: T.surface,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.textBody,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <button
                onClick={goToNextWeek}
                style={{
                  width: 32,
                  height: 32,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.r,
                  background: T.surface,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.textBody,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ overflowX: "auto" }}>
          {loadingSlots ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: T.textMuted,
                fontSize: 14,
              }}
            >
              슬롯을 불러오는 중...
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "70px repeat(5, minmax(110px, 1fr))",
                minWidth: 620,
              }}
            >
              {/* Header row */}
              <div style={headerCellStyle()}>시간</div>
              {days.map((d, i) => {
                const isToday = d.toDateString() === today.toDateString();
                return (
                  <div
                    key={i}
                    style={{
                      ...headerCellStyle(),
                      textAlign: "center",
                      background: isToday ? T.primaryLight : T.surfaceAlt,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: isToday ? T.primary : T.textMuted,
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        fontFamily: T.fontKo,
                      }}
                    >
                      {DAY_KR[i]}요일
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: isToday ? T.primary : T.text,
                        fontFamily: T.fontEn,
                        marginTop: 2,
                      }}
                    >
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}

              {/* Slot rows */}
              {TIME_SLOTS.map((timeLabel, slotIndex) => (
                <>
                  <div
                    key={`time-${timeLabel}`}
                    style={{
                      ...cellStyle(),
                      fontSize: 11,
                      color: T.textMuted,
                      fontFamily: T.fontEn,
                      fontWeight: 600,
                      background: T.surfaceAlt,
                    }}
                  >
                    {timeLabel}
                  </div>
                  {days.map((_, dayOffset) => {
                    const datetime = getSlotDatetime(dayOffset, slotIndex);
                    const slot = slotMap[datetime];
                    const isAvailable = slot?.available ?? false;
                    const isPicked = selectedSlot === datetime;

                    return (
                      <button
                        key={`${DAY_KEYS[dayOffset]}-${slotIndex}`}
                        onClick={() => {
                          if (!isAvailable) return;
                          setSelectedSlot(isPicked ? null : datetime);
                          setForm(INITIAL_FORM);
                        }}
                        disabled={!isAvailable}
                        style={{
                          ...cellStyle(),
                          background: isPicked
                            ? T.primary
                            : !isAvailable
                            ? "#F2F4F8"
                            : T.surface,
                          color: isPicked
                            ? "#fff"
                            : !isAvailable
                            ? T.textFaint
                            : T.textBody,
                          cursor: !isAvailable ? "not-allowed" : "pointer",
                          fontSize: 11,
                          fontWeight: 500,
                          textAlign: "center",
                          border: "none",
                          borderLeft: `1px solid ${T.border}`,
                          borderBottom: `1px solid ${T.border}`,
                          transition: "all .1s",
                          fontFamily: T.fontKo,
                        }}
                      >
                        {!isAvailable
                          ? "예약됨"
                          : isPicked
                          ? "✓ 선택됨"
                          : ""}
                      </button>
                    );
                  })}
                </>
              ))}
            </div>
          )}
        </div>

        {/* Selected slot summary bar */}
        {selectedSlot && (
          <div
            style={{
              padding: "14px 20px",
              background: T.primaryLight,
              borderTop: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={T.primary}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12.5l4 4L19 7" />
              </svg>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: T.primary,
                  fontFamily: T.fontKo,
                  letterSpacing: "-0.01em",
                }}
              >
                선택한 시간: {selectedLabel}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedSlot(null);
                setForm(INITIAL_FORM);
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                color: T.primary,
                fontWeight: 600,
                textDecoration: "underline",
                fontFamily: T.fontKo,
              }}
            >
              선택 취소
            </button>
          </div>
        )}
      </div>

      {/* Booking form (visible when slot selected) */}
      {selectedSlot && (
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.r2,
            padding: 28,
            boxShadow: "0 1px 2px rgba(15,30,51,0.04)",
          }}
        >
          <h3
            style={{
              margin: "0 0 6px",
              fontSize: 17,
              fontWeight: 700,
              color: T.text,
              fontFamily: T.fontKo,
              letterSpacing: "-0.02em",
            }}
          >
            신청자 정보
          </h3>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 13,
              color: T.textMuted,
            }}
          >
            미팅 진행 전 확인용으로만 사용되며, 외부에 공개되지 않습니다.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Row 1 */}
            <div
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                marginBottom: 16,
              }}
            >
              <FormField
                label="이름"
                required
                placeholder="홍길동"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <FormField
                label="직무 / 직급"
                required
                placeholder="예: 개발팀 / 책임"
                value={form.jobTitle}
                onChange={(v) => setForm({ ...form, jobTitle: v })}
              />
            </div>

            {/* Row 2 */}
            <div style={{ marginBottom: 16 }}>
              <FormField
                label="담당 업무 요약"
                placeholder="현재 어떤 업무를 진행 중이신지 간단히 적어주세요"
                value={form.currentWork}
                onChange={(v) => setForm({ ...form, currentWork: v })}
              />
            </div>

            {/* Row 3: textarea */}
            <div style={{ marginBottom: 16 }}>
              <FormField
                label="PRD 붙여넣기"
                required
                placeholder="논의하고 싶은 내용이나 PRD를 그대로 붙여넣으세요"
                value={form.requestDetail}
                onChange={(v) => setForm({ ...form, requestDetail: v })}
                rows={5}
              />
            </div>

            {/* Row 4 */}
            <div
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                marginBottom: 24,
              }}
            >
              <FormField
                label="이메일"
                required
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
              <FormField
                label="전화번호"
                required
                placeholder="010-0000-0000"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
            </div>

            {/* Actions */}
            <div
              style={{
                paddingTop: 20,
                borderTop: `1px dashed ${T.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 12, color: T.textMuted }}>
                <strong style={{ color: T.secondary }}>*</strong> 표시 항목은
                필수입니다.
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlot(null);
                    setForm(INITIAL_FORM);
                  }}
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
                  type="submit"
                  disabled={submitting || !form.name || !form.email || !form.jobTitle || !form.requestDetail || !form.phone}
                  style={{
                    height: 40,
                    padding: "0 20px",
                    borderRadius: T.r,
                    background:
                      submitting ||
                      !form.name ||
                      !form.email ||
                      !form.jobTitle ||
                      !form.requestDetail ||
                      !form.phone
                        ? T.textFaint
                        : T.primary,
                    color: "#fff",
                    border: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: T.fontKo,
                    cursor:
                      submitting ||
                      !form.name ||
                      !form.email ||
                      !form.jobTitle ||
                      !form.requestDetail ||
                      !form.phone
                        ? "not-allowed"
                        : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "background .15s",
                  }}
                >
                  {submitting ? "제출 중..." : "예약하기"}
                  {!submitting && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* No slot selected placeholder */}
      {!selectedSlot && !loadingSlots && (
        <div
          style={{
            background: T.surface,
            border: `1px dashed ${T.border}`,
            borderRadius: T.r2,
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke={T.textFaint}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: "0 auto 12px" }}
          >
            <rect x="4" y="6" width="16" height="14" rx="2" />
            <path d="M4 10h16M9 4v4M15 4v4" />
          </svg>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: T.textMuted,
              fontFamily: T.fontKo,
              marginBottom: 4,
            }}
          >
            위 캘린더에서 원하는 시간을 선택해 주세요
          </div>
          <p style={{ margin: 0, fontSize: 13, color: T.textFaint }}>
            흰색 셀을 클릭하면 예약 폼이 나타납니다.
          </p>
        </div>
      )}

      {/* Confirmation modal */}
      {done && (
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
          onClick={() => setDone(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.surface,
              borderRadius: T.r3,
              width: "100%",
              maxWidth: 420,
              boxShadow:
                "0 4px 12px rgba(15,30,51,0.06), 0 16px 40px rgba(15,30,51,0.10)",
              overflow: "hidden",
              animation: "modalIn .2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div
              style={{
                padding: "40px 32px 32px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: T.successBg,
                  color: T.success,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <svg
                  width="32"
                  height="32"
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
                  margin: "0 0 8px",
                  fontSize: 20,
                  fontWeight: 700,
                  color: T.text,
                  fontFamily: T.fontKo,
                  letterSpacing: "-0.02em",
                }}
              >
                예약이 접수되었습니다
              </h3>
              <p
                style={{
                  margin: "0 0 24px",
                  fontSize: 13.5,
                  color: T.textBody,
                  lineHeight: 1.55,
                }}
              >
                확인 메일을 곧 보내드릴 예정입니다.
                <br />
                예약 변경이 필요한 경우 메일로 회신해 주세요.
              </p>
              <button
                onClick={() => setDone(false)}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: T.r,
                  background: T.primary,
                  color: "#fff",
                  border: "none",
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: T.fontKo,
                  cursor: "pointer",
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FormField({
  label,
  required,
  placeholder,
  value,
  onChange,
  type = "text",
  rows,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  const inputStyle = {
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
    boxSizing: "border-box" as const,
    resize: rows ? ("vertical" as const) : undefined,
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
    </div>
  );
}

function LegendDot({
  color,
  label,
  border,
}: {
  color: string;
  label: string;
  border?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          background: color,
          border: border ? `1px solid ${border}` : "none",
        }}
      />
      <span
        style={{
          color: T.textMuted,
          fontWeight: 500,
          fontSize: 12,
          fontFamily: T.fontKo,
        }}
      >
        {label}
      </span>
    </div>
  );
}

const cellStyle = () => ({
  padding: "0 6px",
  height: 36,
  borderBottom: `1px solid ${T.border}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const headerCellStyle = () => ({
  padding: "10px 8px",
  borderBottom: `1px solid ${T.border}`,
  background: T.surfaceAlt,
  fontFamily: T.fontKo,
});
