import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <main className="container mx-auto py-12 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드</h1>
          <p className="mt-2 text-muted-foreground">
            영상·게시판·미팅 예약·통계를 관리합니다. (ADMIN_DH 로그인 필요)
          </p>
        </div>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          홈으로
        </Link>
      </div>
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        관리자 로그인 및 대시보드는 곧 제공됩니다.
      </div>
    </main>
  );
}
