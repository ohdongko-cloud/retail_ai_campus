import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function SharePage() {
  return (
    <main className="container mx-auto py-12 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">내 서비스 공유</h1>
          <p className="mt-2 text-muted-foreground">
            직접 만든 AI 서비스(챗봇·자동화 스크립트 등)를 동료들과 공유해 보세요.
          </p>
        </div>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          홈으로
        </Link>
      </div>
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        서비스 공유 게시판은 곧 제공됩니다.
      </div>
    </main>
  );
}
