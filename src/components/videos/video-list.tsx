"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VideoLevel } from "@/generated/prisma/enums";

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

function getLevelLabel(level: VideoLevel): string {
  switch (level) {
    case VideoLevel.BASIC:
      return "기초";
    case VideoLevel.INTERMEDIATE:
      return "중급";
    case VideoLevel.ADVANCED:
      return "고급";
    case VideoLevel.APPLIED:
      return "실전적용";
    default:
      return level;
  }
}

function getLevelVariant(
  level: VideoLevel
): "secondary" | "outline" | "destructive" | "default" {
  switch (level) {
    case VideoLevel.BASIC:
      return "secondary";
    case VideoLevel.INTERMEDIATE:
      return "outline";
    case VideoLevel.ADVANCED:
      return "destructive";
    case VideoLevel.APPLIED:
      return "default";
    default:
      return "secondary";
  }
}

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

interface VideoListProps {
  videos: Video[];
}

export function VideoList({ videos }: VideoListProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  if (videos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        등록된 영상이 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => {
          const videoId = extractYouTubeId(video.youtubeUrl);
          const thumbnail =
            video.thumbnail ||
            (videoId
              ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              : null);

          return (
            <div
              key={video.id}
              className="group rounded-lg border bg-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedVideo(video)}
            >
              {thumbnail && (
                <div className="relative aspect-video overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-800 ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                    {video.title}
                  </h3>
                  <Badge
                    variant={getLevelVariant(video.level)}
                    className="shrink-0 text-xs"
                  >
                    {getLevelLabel(video.level)}
                  </Badge>
                </div>
                {video.description && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={!!selectedVideo}
        onOpenChange={(open) => !open && setSelectedVideo(null)}
      >
        <DialogContent className="max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle className="pr-6">{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="mt-2">
              {(() => {
                const videoId = extractYouTubeId(selectedVideo.youtubeUrl);
                return videoId ? (
                  <div className="relative aspect-video w-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={selectedVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full rounded"
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    영상을 불러올 수 없습니다.
                  </p>
                );
              })()}
              {selectedVideo.description && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {selectedVideo.description}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
