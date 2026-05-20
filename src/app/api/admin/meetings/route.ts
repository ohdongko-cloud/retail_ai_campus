// GET /api/admin/meetings?status=PENDING — list meetings (auth required)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { MeetingStatus } from "@/generated/prisma/enums";

const VALID_STATUSES = Object.values(MeetingStatus);

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    const status =
      statusParam && VALID_STATUSES.includes(statusParam as MeetingStatus)
        ? (statusParam as MeetingStatus)
        : undefined;

    const meetings = await prisma.meeting.findMany({
      where: status ? { status } : {},
      orderBy: { startAt: "asc" },
    });

    return NextResponse.json(meetings);
  } catch (error) {
    console.error("[GET /api/admin/meetings] error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
