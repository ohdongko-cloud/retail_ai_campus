// 오픈채팅방 리다이렉트
// PRD: 관리자가 설정한 카카오톡 오픈채팅방 링크로 새 탭을 열도록 함
// Setting 테이블의 'chatroomUrl' 키를 조회하여 리다이렉트

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FALLBACK_URL = "https://open.kakao.com/";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "chatroomUrl" },
    });
    const target = setting?.value || FALLBACK_URL;
    return NextResponse.redirect(target);
  } catch (error) {
    console.error("[chatroom] failed to load setting", error);
    return NextResponse.redirect(FALLBACK_URL);
  }
}
