// GET /api/videos?level=BASIC — return published videos ordered by orderIndex

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VideoLevel } from "@/generated/prisma/enums";

const VALID_LEVELS = Object.values(VideoLevel);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const levelParam = searchParams.get("level");

    const level =
      levelParam && VALID_LEVELS.includes(levelParam as VideoLevel)
        ? (levelParam as VideoLevel)
        : undefined;

    const videos = await prisma.video.findMany({
      where: {
        isPublished: true,
        ...(level ? { level } : {}),
      },
      orderBy: { orderIndex: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        youtubeUrl: true,
        level: true,
        thumbnail: true,
        orderIndex: true,
        createdAt: true,
      },
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("[GET /api/videos] error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
