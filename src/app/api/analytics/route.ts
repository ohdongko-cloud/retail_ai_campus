// 사용자 행동 분석 이벤트 수집 API
// POST /api/analytics
// body: { type, target?, durationMs?, sessionId?, userId?, metadata? }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { EventType } from "@/generated/prisma/enums";

const VALID_EVENT_TYPES: EventType[] = [
  "PAGE_VIEW",
  "BUTTON_CLICK",
  "VIDEO_OPEN",
  "VIDEO_PROGRESS",
  "MEETING_REQUEST",
  "POST_CREATE",
  "POST_VIEW",
  "SERVICE_VIEW",
  "CHATROOM_OPEN",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, target, durationMs, sessionId, userId, metadata } = body ?? {};

    if (!type || !VALID_EVENT_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    await prisma.analyticsEvent.create({
      data: {
        type,
        target: target ?? null,
        durationMs: typeof durationMs === "number" ? durationMs : null,
        sessionId: sessionId ?? null,
        userId: userId ?? null,
        metadata: metadata ?? undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[analytics] failed to record event", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
