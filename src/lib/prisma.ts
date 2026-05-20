// Prisma Client 싱글톤 (Prisma 7 + driver adapter)
//
// Prisma 7부터는 driver adapter가 필수입니다.
// 로컬/Neon 모두에서 동작하도록 `@prisma/adapter-pg`(node-postgres 기반)를 사용합니다.
//
// ⚠️ 빌드 호환성:
// Next.js의 "Collecting page data" 단계는 API 라우트 모듈을 정적 import 합니다.
// 따라서 모듈 최상위에서 PrismaClient를 즉시 생성하면 DATABASE_URL이 없는 빌드 환경에서
// 즉시 throw → 빌드 실패합니다.
// 이를 피하기 위해 Proxy 기반 lazy 초기화를 사용합니다.
// 실제 사용 시점(예: prisma.user.findMany())에만 인스턴스가 생성됩니다.
//
// 참고:
//  - https://www.prisma.io/docs/orm/overview/databases/database-drivers
//  - https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL 환경 변수가 설정되지 않았습니다. .env 파일 또는 Vercel 환경변수를 확인하세요."
    );
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Proxy를 통한 lazy 초기화 — 첫 프로퍼티 접근 시점에 client 생성
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getClient(), prop);
  },
});
