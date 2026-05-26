// GET /api/posts        — list anonymous board posts (paginated)
// POST /api/posts       — create a new anonymous post

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          viewCount: true,
          createdAt: true,
          _count: { select: { comments: true } },
        },
      }),
      prisma.post.count({ where: { isDeleted: false } }),
    ]);

    return NextResponse.json({
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        viewCount: p.viewCount,
        commentCount: p._count.comments,
        createdAt: p.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/posts] error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content } = body as { title?: string; content?: string };

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "제목과 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
      },
      select: { id: true, title: true, createdAt: true },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("[POST /api/posts] error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
