// PATCH /api/admin/videos/[id] — partial update video (auth required)
// DELETE /api/admin/videos/[id] — delete video (auth required)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { VideoLevel } from "@/generated/prisma/enums";

const VALID_LEVELS = Object.values(VideoLevel);

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, youtubeUrl, level, orderIndex, isPublished } =
      body ?? {};

    if (level && !VALID_LEVELS.includes(level as VideoLevel)) {
      return NextResponse.json({ error: "유효하지 않은 레벨입니다." }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl;
    if (level !== undefined) updateData.level = level as VideoLevel;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const video = await prisma.video.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error("[PATCH /api/admin/videos/[id]] error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.video.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/videos/[id]] error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
