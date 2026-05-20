// Prisma Client 싱글톤 (Prisma 7 + driver adapter)
//
// Prisma 7부터는 driver adapter가 필수입니다.
// 로컬/Neon 모두에서 동작하도록 `@prisma/adapter-pg`(node-postgres 기반)를 사용합니다.
// Next.js dev 환경의 HMR로 인한 다중 인스턴스 생성을 방지합니다.
//
// 참고:
//  - https://www.prisma.io/docs/orm/overview/databases/database-drivers
//  - https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요."
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

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
