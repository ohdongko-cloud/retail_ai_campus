"use client";

// 메인 페이지의 5개 카드 버튼
// PRD: 강의 영상 / 게시판 / 미팅 요청 / 오픈채팅방 / 서비스 공유
// 각 버튼 클릭 시 분석 이벤트(BUTTON_CLICK 또는 CHATROOM_OPEN)를 전송

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  MessageSquareText,
  CalendarClock,
  Users,
  Sparkles,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

type MenuItem = {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  {
    key: "videos",
    title: "강의 영상 시청하기",
    description: "수준별로 분류된 AI 활용 교육 영상을 시청하세요.",
    href: "/videos",
    icon: GraduationCap,
  },
  {
    key: "board",
    title: "게시판 작성",
    description: "질문이나 의견을 익명으로 자유롭게 남겨 주세요.",
    href: "/board",
    icon: MessageSquareText,
  },
  {
    key: "meeting",
    title: "미팅 요청하기",
    description: "팀장과의 1:1 상담을 30분 단위로 예약합니다.",
    href: "/meeting",
    icon: CalendarClock,
  },
  {
    key: "chatroom",
    title: "오픈채팅방 입장",
    description: "카카오톡 오픈채팅방으로 이동합니다.",
    href: "/api/chatroom",
    icon: Users,
    external: true,
  },
  {
    key: "share",
    title: "내 서비스 공유하기",
    description: "직접 만든 AI 서비스를 동료들과 공유합니다.",
    href: "/share",
    icon: Sparkles,
  },
];

export function MainMenu() {
  // 페이지 체류 시간 측정
  useEffect(() => {
    const startedAt = Date.now();
    trackEvent({ type: "PAGE_VIEW", target: "/" });
    return () => {
      const durationMs = Date.now() - startedAt;
      trackEvent({ type: "PAGE_VIEW", target: "/", durationMs });
    };
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {MENU_ITEMS.map((item) => (
        <MenuCard key={item.key} item={item} />
      ))}
    </div>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  const Icon = item.icon;
  const [hoverStart, setHoverStart] = useState<number | null>(null);

  function handleClick() {
    trackEvent({
      type: item.key === "chatroom" ? "CHATROOM_OPEN" : "BUTTON_CLICK",
      target: item.key,
    });
  }

  function handleMouseEnter() {
    setHoverStart(Date.now());
  }

  function handleMouseLeave() {
    if (hoverStart != null) {
      const durationMs = Date.now() - hoverStart;
      // 1초 이상 호버한 경우만 기록 (의미 있는 관심으로 간주)
      if (durationMs >= 1000) {
        trackEvent({
          type: "BUTTON_CLICK",
          target: `${item.key}:hover`,
          durationMs,
        });
      }
      setHoverStart(null);
    }
  }

  const linkProps = item.external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={item.href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...linkProps}
      className="group"
    >
      <Card className="h-full transition-all group-hover:border-primary group-hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
