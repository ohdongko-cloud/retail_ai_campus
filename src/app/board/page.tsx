import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function BoardPage() {
  return (
    <main className="container mx-auto py-12 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">익명 게시판</h1>
          <p className="mt-2 text-muted-foreground">
            AI 활용 관련 질문이나 의견을 자유롭게 남길 수 있습니다.
          </p>
        </div>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          홈으로
        </Link>
      </div>
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        게시판 기능은 곧 제공됩니다.
      </div>
    </main>
  );
}
