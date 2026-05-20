import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function MeetingPage() {
  return (
    <main className="container mx-auto py-12 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">미팅 요청</h1>
          <p className="mt-2 text-muted-foreground">
            팀장과의 개별 상담을 예약할 수 있습니다. (월~금, 08:00~17:00, 30분 단위)
          </p>
        </div>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          홈으로
        </Link>
      </div>
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        주간 캘린더 UI는 곧 제공됩니다.
      </div>
    </main>
  );
}
