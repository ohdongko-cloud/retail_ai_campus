// ONE-TIME SETUP ENDPOINT — DELETE AFTER USE
// Creates admin account if it doesn't exist.
// Protected by SETUP_TOKEN env var (or SESSION_SECRET as fallback).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-setup-token") ?? "";
  const expected = process.env.SETUP_TOKEN ?? process.env.SESSION_SECRET ?? "";

  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username = process.env.ADMIN_USERNAME || "ADMIN_DH";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD env var not set" },
      { status: 500 }
    );
  }

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({
      ok: true,
      message: `Admin '${username}' already exists — skipped`,
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({
    data: {
      id: "admin-dh-001",
      username,
      passwordHash,
    },
  });

  return NextResponse.json({
    ok: true,
    message: `Admin created: ${admin.username} (id: ${admin.id})`,
  });
}
