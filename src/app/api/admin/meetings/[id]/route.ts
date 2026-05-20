// PATCH /api/admin/meetings/[id] — update meeting status (auth required)
// body: { status, adminNote? }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { MeetingStatus } from "@/generated/prisma/enums";

const VALID_STATUSES = Object.values(MeetingStatus);

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, adminNote } = body ?? {};

    if (!status || !VALID_STATUSES.includes(status as MeetingStatus)) {
      return NextResponse.json(
        { error: "유효하지 않은 상태값입니다." },
        { status: 400 }
      );
    }

    const meeting = await prisma.meeting.update({
      where: { id },
      data: {
        status: status as MeetingStatus,
        ...(adminNote !== undefined ? { adminNote } : {}),
      },
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("[PATCH /api/admin/meetings/[id]] error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
