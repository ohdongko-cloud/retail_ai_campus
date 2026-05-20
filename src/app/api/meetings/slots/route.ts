// GET /api/meetings/slots?week=2026-05-18
// Returns slots for Mon-Fri 08:00-16:30 in 30min intervals for the week starting on Monday
// Each slot: { datetime: ISO_string, available: boolean }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MeetingStatus } from "@/generated/prisma/enums";

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const weekParam = searchParams.get("week");

    // Determine week start (Monday)
    const baseDate = weekParam ? new Date(weekParam) : new Date();
    const monday = getMonday(isNaN(baseDate.getTime()) ? new Date() : baseDate);

    // Week end = Sunday 23:59:59
    const weekEnd = new Date(monday);
    weekEnd.setDate(monday.getDate() + 7);

    // Fetch all PENDING or CONFIRMED meetings in this week
    const bookedMeetings = await prisma.meeting.findMany({
      where: {
        status: { in: [MeetingStatus.PENDING, MeetingStatus.CONFIRMED] },
        startAt: { gte: monday, lt: weekEnd },
      },
      select: { startAt: true, endAt: true },
    });

    // Build set of booked slot start times (ISO string)
    const bookedStartTimes = new Set<string>();
    for (const m of bookedMeetings) {
      bookedStartTimes.add(new Date(m.startAt).toISOString());
    }

    // Generate slots: Mon-Fri, 08:00-16:30, 30min intervals
    const slots: { datetime: string; available: boolean }[] = [];
    const now = new Date();

    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + dayOffset);

      // 08:00 to 16:30 inclusive = 17:00 exclusive (last slot starts at 16:30)
      // Hours: 8, 8.5, 9, ..., 16.5 => 17 slots per day
      for (let slot = 0; slot < 18; slot++) {
        const slotDate = new Date(day);
        const hours = 8 + Math.floor(slot / 2);
        const minutes = (slot % 2) * 30;
        slotDate.setHours(hours, minutes, 0, 0);

        const isoStr = slotDate.toISOString();
        const isPast = slotDate <= now;
        const isBooked = bookedStartTimes.has(isoStr);

        slots.push({
          datetime: isoStr,
          available: !isPast && !isBooked,
        });
      }
    }

    return NextResponse.json(slots);
  } catch (error) {
    console.error("[GET /api/meetings/slots] error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
