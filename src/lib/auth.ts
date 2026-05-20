// Admin session management using Node.js crypto (HMAC SHA256)
// No external JWT library required

import crypto from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "admin_session";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 24 hours in seconds
};

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in ms

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET 환경 변수가 설정되지 않았습니다.");
  }
  return secret;
}

/**
 * Creates a signed session token containing adminId and issuedAt.
 * Format: base64(payload).base64(signature)
 */
export function createSessionToken(adminId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ adminId, issuedAt: Date.now() })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

/**
 * Verifies a session token.
 * Returns { adminId } if valid and not expired (< 24h), else null.
 */
export function verifySessionToken(token: string): { adminId: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payload, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", getSecret())
      .update(payload)
      .digest("base64url");

    // Constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature, "base64url");
    const expectedBuffer = Buffer.from(expectedSignature, "base64url");

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    // Decode payload
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    );

    const { adminId, issuedAt } = decoded;

    if (!adminId || typeof issuedAt !== "number") return null;

    // Check expiry
    if (Date.now() - issuedAt > SESSION_TTL_MS) return null;

    return { adminId };
  } catch {
    return null;
  }
}

/**
 * Reads the admin_session cookie and verifies it.
 * Returns { adminId } or null.
 */
export async function getAdminSession(): Promise<{ adminId: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}
