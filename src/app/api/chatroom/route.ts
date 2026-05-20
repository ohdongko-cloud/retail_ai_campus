// GET /api/chatroom — redirects to the KakaoTalk open chatroom URL stored in Settings
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "chatroomUrl" },
    });

    const url = setting?.value;

    if (!url) {
      return NextResponse.json(
        { error: "오픈채팅방 URL이 설정되지 않았습니다." },
        { status: 404 }
      );
    }

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("[GET /api/chatroom] error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
