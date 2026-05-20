import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function VideosPage() {
  return (
    <main className="container mx-auto py-12 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">강의 영상</h1>
          <p className="mt-2 text-muted-foreground">
            AI 활용 교육 영상을 수준별로 시청할 수 있습니다.
          </p>
        </div>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          홈으로
        </Link>
      </div>
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        영상 목록은 곧 제공됩니다. (관리자가 영상을 등록하면 여기에 표시됩니다.)
      </div>
    </main>
  );
}
