import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { VideoList } from "@/components/videos/video-list";
import { VideoLevel } from "@/generated/prisma/enums";

interface Video {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  level: VideoLevel;
  thumbnail: string | null;
  orderIndex: number;
  createdAt: string;
}

interface TabItem {
  label: string;
  value: string | null;
}

const TABS: TabItem[] = [
  { label: "전체", value: null },
  { label: "기초", value: VideoLevel.BASIC },
  { label: "중급", value: VideoLevel.INTERMEDIATE },
  { label: "고급", value: VideoLevel.ADVANCED },
  { label: "실전적용", value: VideoLevel.APPLIED },
];

async function fetchVideos(level?: string): Promise<Video[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const url = level
      ? `${baseUrl}/api/videos?level=${level}`
      : `${baseUrl}/api/videos`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  const videos = await fetchVideos(level);

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

      {/* Level filter tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {TABS.map((tab) => {
          const isActive =
            (tab.value === null && !level) || tab.value === level;
          const href = tab.value ? `/videos?level=${tab.value}` : "/videos";
          return (
            <Link
              key={tab.label}
              href={href}
              className={buttonVariants({
                variant: isActive ? "default" : "outline",
                size: "sm",
              })}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <VideoList videos={videos} />
    </main>
  );
}
