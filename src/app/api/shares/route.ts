// GET /api/shares       — list service share posts (paginated)
// POST /api/shares      — create a new service share post

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = 10;
    const skip = (page - 1) * limit;

    const [shares, total] = await Promise.all([
      prisma.serviceShare.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          serviceUrl: true,
          nickname: true,
          createdAt: true,
        },
      }),
      prisma.serviceShare.count({ where: { isDeleted: false } }),
    ]);

    return NextResponse.json({
      shares,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/shares] error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, serviceUrl, testAccount } = body as {
      title?: string;
      description?: string;
      serviceUrl?: string;
      testAccount?: string;
    };

    if (!title?.trim() || !description?.trim() || !serviceUrl?.trim()) {
      return NextResponse.json(
        { error: "제목, 내용, 서비스 URL을 입력해주세요." },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(serviceUrl);
    } catch {
      return NextResponse.json(
        { error: "올바른 URL 형식을 입력해주세요." },
        { status: 400 }
      );
    }

    const share = await prisma.serviceShare.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        serviceUrl: serviceUrl.trim(),
        testAccount: testAccount?.trim() || null,
        nickname: "익명",
      },
      select: { id: true, title: true, createdAt: true },
    });

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    console.error("[POST /api/shares] error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
