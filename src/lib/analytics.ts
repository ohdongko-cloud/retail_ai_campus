// 클라이언트에서 분석 이벤트를 서버로 전송하는 헬퍼
// 실패해도 사용자 경험에 영향이 없도록 fire-and-forget 방식

import { getStoredUser, getOrCreateSessionId } from "@/lib/user-session";

type EventType =
  | "PAGE_VIEW"
  | "BUTTON_CLICK"
  | "VIDEO_OPEN"
  | "VIDEO_PROGRESS"
  | "MEETING_REQUEST"
  | "POST_CREATE"
  | "POST_VIEW"
  | "SERVICE_VIEW"
  | "CHATROOM_OPEN";

export type AnalyticsPayload = {
  type: EventType;
  target?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
};

export function trackEvent(payload: AnalyticsPayload) {
  if (typeof window === "undefined") return;

  const sessionId = getOrCreateSessionId();
  const storedUser = getStoredUser();

  const body = JSON.stringify({
    ...payload,
    sessionId,
    // 사용자 정보가 입력되었어도 userId는 서버 측 매칭을 거치므로 현재는 null
    // 향후 서버측에서 email 기반 매칭 또는 별도 식별자 도입 시 활용
    metadata: {
      ...(payload.metadata ?? {}),
      user: storedUser,
    },
  });

  // sendBeacon 우선 사용 (페이지 이탈 시에도 안정적으로 전송)
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics", blob);
    return;
  }

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // 의도적으로 무시 — 분석 실패가 사용자 흐름을 막아선 안 됨
  });
}
