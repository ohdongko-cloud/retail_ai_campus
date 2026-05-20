// GET  /api/admin/settings — { chatroomUrl: string }
// PATCH /api/admin/settings — update chatroomUrl (auth required)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const CHATROOM_KEY = "chatroomUrl";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: CHATROOM_KEY },
    });
    return NextResponse.json({ chatroomUrl: setting?.value ?? "" });
  } catch (error) {
    console.error("[GET /api/admin/settings] error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { chatroomUrl } = body ?? {};

    if (typeof chatroomUrl !== "string") {
      return NextResponse.json({ error: "chatroomUrl이 필요합니다." }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: CHATROOM_KEY },
      update: { value: chatroomUrl },
      create: { key: CHATROOM_KEY, value: chatroomUrl },
    });

    return NextResponse.json({ chatroomUrl });
  } catch (error) {
    console.error("[PATCH /api/admin/settings] error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
