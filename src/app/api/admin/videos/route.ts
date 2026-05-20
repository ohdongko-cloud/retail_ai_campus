// GET  /api/admin/videos — list all videos (auth required)
// POST /api/admin/videos — create video (auth required)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { VideoLevel } from "@/generated/prisma/enums";

const VALID_LEVELS = Object.values(VideoLevel);

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const videos = await prisma.video.findMany({
      orderBy: { orderIndex: "asc" },
    });
    return NextResponse.json(videos);
  } catch (error) {
    console.error("[GET /api/admin/videos] error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      youtubeUrl,
      level,
      orderIndex,
      isPublished,
    } = body ?? {};

    if (!title || !youtubeUrl || !level) {
      return NextResponse.json(
        { error: "title, youtubeUrl, level은 필수입니다." },
        { status: 400 }
      );
    }

    if (!VALID_LEVELS.includes(level as VideoLevel)) {
      return NextResponse.json({ error: "유효하지 않은 레벨입니다." }, { status: 400 });
    }

    const video = await prisma.video.create({
      data: {
        title,
        description: description ?? null,
        youtubeUrl,
        level: level as VideoLevel,
        orderIndex: typeof orderIndex === "number" ? orderIndex : 0,
        isPublished: typeof isPublished === "boolean" ? isPublished : true,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/videos] error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
