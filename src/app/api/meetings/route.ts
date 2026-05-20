// POST /api/meetings — create a meeting booking
// body: { name, jobTitle, currentWork, requestDetail, email, phone, startAt }
// endAt = startAt + 30 minutes

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MeetingStatus } from "@/generated/prisma/enums";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      jobTitle,
      currentWork,
      requestDetail,
      email,
      phone,
      startAt,
    } = body ?? {};

    // Validate required fields
    if (!name || !jobTitle || !currentWork || !requestDetail || !email || !phone || !startAt) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    const startDate = new Date(startAt);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: "유효하지 않은 날짜입니다." },
        { status: 400 }
      );
    }

    // Validate startAt is in the future
    if (startDate <= new Date()) {
      return NextResponse.json(
        { error: "과거 시간은 예약할 수 없습니다." },
        { status: 400 }
      );
    }

    // Check if slot is available (no PENDING or CONFIRMED meetings at that time)
    const existing = await prisma.meeting.findFirst({
      where: {
        startAt: startDate,
        status: { in: [MeetingStatus.PENDING, MeetingStatus.CONFIRMED] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "이미 예약된 시간대입니다. 다른 시간을 선택해주세요." },
        { status: 409 }
      );
    }

    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

    const meeting = await prisma.meeting.create({
      data: {
        name,
        jobTitle,
        currentWork,
        requestDetail,
        email,
        phone,
        startAt: startDate,
        endAt: endDate,
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("[POST /api/meetings] error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
