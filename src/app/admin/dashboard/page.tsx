"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoLevel, MeetingStatus } from "@/generated/prisma/enums";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Video {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  level: VideoLevel;
  orderIndex: number;
  isPublished: boolean;
  createdAt: string;
}

interface Meeting {
  id: string;
  name: string;
  jobTitle: string;
  currentWork: string;
  requestDetail: string;
  email: string;
  phone: string;
  startAt: string;
  endAt: string;
  status: MeetingStatus;
  adminNote: string | null;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<VideoLevel, string> = {
  BASIC: "기초",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
  APPLIED: "실전적용",
};

const LEVEL_VARIANTS: Record<
  VideoLevel,
  "secondary" | "outline" | "destructive" | "default"
> = {
  BASIC: "secondary",
  INTERMEDIATE: "outline",
  ADVANCED: "destructive",
  APPLIED: "default",
};

const STATUS_LABELS: Record<MeetingStatus, string> = {
  PENDING: "대기",
  CONFIRMED: "확정",
  REJECTED: "거절",
  CANCELLED: "취소",
};

const STATUS_VARIANTS: Record<
  MeetingStatus,
  "secondary" | "outline" | "destructive" | "default"
> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  REJECTED: "destructive",
  CANCELLED: "outline",
};

function formatDatetime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Add Video Form ────────────────────────────────────────────────────────────

interface AddVideoFormData {
  title: string;
  description: string;
  youtubeUrl: string;
  level: VideoLevel | "";
  orderIndex: string;
  isPublished: boolean;
}

const INIT_VIDEO_FORM: AddVideoFormData = {
  title: "",
  description: "",
  youtubeUrl: "",
  level: "",
  orderIndex: "0",
  isPublished: true,
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  // Videos state
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [addVideoForm, setAddVideoForm] = useState<AddVideoFormData>(INIT_VIDEO_FORM);
  const [savingVideo, setSavingVideo] = useState(false);

  // Meetings state
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [meetingStatusFilter, setMeetingStatusFilter] = useState<
    MeetingStatus | "ALL"
  >("ALL");

  // Settings state
  const [chatroomUrl, setChatroomUrl] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  // ── Auth check ──
  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/admin");
        } else {
          setAuthChecked(true);
        }
      })
      .catch(() => router.replace("/admin"));
  }, [router]);

  // ── Fetch Videos ──
  const fetchVideos = useCallback(async () => {
    setLoadingVideos(true);
    try {
      const res = await fetch("/api/admin/videos");
      if (!res.ok) throw new Error("Failed");
      setVideos(await res.json());
    } catch {
      toast.error("영상 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  // ── Fetch Meetings ──
  const fetchMeetings = useCallback(async (status: MeetingStatus | "ALL") => {
    setLoadingMeetings(true);
    try {
      const url =
        status === "ALL"
          ? "/api/admin/meetings"
          : `/api/admin/meetings?status=${status}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      setMeetings(await res.json());
    } catch {
      toast.error("미팅 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingMeetings(false);
    }
  }, []);

  // ── Fetch Settings ──
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) return;
      const data = await res.json();
      setChatroomUrl(data.chatroomUrl ?? "");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    fetchVideos();
    fetchMeetings("ALL");
    fetchSettings();
  }, [authChecked, fetchVideos, fetchMeetings, fetchSettings]);

  // ── Logout ──
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  // ── Add Video ──
  async function handleAddVideo(e: React.FormEvent) {
    e.preventDefault();
    const { title, youtubeUrl, level, description, orderIndex, isPublished } =
      addVideoForm;

    if (!title || !youtubeUrl || !level) {
      toast.error("제목, YouTube URL, 레벨은 필수입니다.");
      return;
    }

    setSavingVideo(true);
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          youtubeUrl,
          level,
          orderIndex: parseInt(orderIndex, 10) || 0,
          isPublished,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "영상 추가에 실패했습니다.");
        return;
      }

      toast.success("영상이 추가되었습니다.");
      setShowAddVideo(false);
      setAddVideoForm(INIT_VIDEO_FORM);
      fetchVideos();
    } catch {
      toast.error("서버 오류가 발생했습니다.");
    } finally {
      setSavingVideo(false);
    }
  }

  // ── Delete Video ──
  async function handleDeleteVideo(id: string, title: string) {
    if (!confirm(`"${title}" 영상을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("영상이 삭제되었습니다.");
      fetchVideos();
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  }

  // ── Toggle Publish ──
  async function handleTogglePublish(video: Video) {
    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !video.isPublished }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(
        video.isPublished ? "영상이 비공개로 변경되었습니다." : "영상이 공개되었습니다."
      );
      fetchVideos();
    } catch {
      toast.error("변경에 실패했습니다.");
    }
  }

  // ── Update Meeting Status ──
  async function handleMeetingStatus(
    meeting: Meeting,
    status: MeetingStatus
  ) {
    try {
      const res = await fetch(`/api/admin/meetings/${meeting.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`미팅 상태가 "${STATUS_LABELS[status]}"으로 변경되었습니다.`);
      fetchMeetings(meetingStatusFilter);
    } catch {
      toast.error("상태 변경에 실패했습니다.");
    }
  }

  // ── Save Settings ──
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatroomUrl }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("설정이 저장되었습니다.");
    } catch {
      toast.error("저장에 실패했습니다.");
    } finally {
      setSavingSettings(false);
    }
  }

  if (!authChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">인증 확인 중...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            영상·미팅·설정을 관리합니다.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>

      <Tabs defaultValue="videos">
        <TabsList className="mb-6">
          <TabsTrigger value="videos">영상 관리</TabsTrigger>
          <TabsTrigger value="meetings">미팅 관리</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        {/* ─── 영상 관리 ──────────────────────────────────────────── */}
        <TabsContent value="videos">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">강의 영상 목록</h2>
            <Button onClick={() => setShowAddVideo(true)}>+ 영상 추가</Button>
          </div>

          {loadingVideos ? (
            <p className="text-muted-foreground py-8 text-center">불러오는 중...</p>
          ) : videos.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
              등록된 영상이 없습니다.
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>레벨</TableHead>
                    <TableHead>순서</TableHead>
                    <TableHead>공개 여부</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {video.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant={LEVEL_VARIANTS[video.level]}>
                          {LEVEL_LABELS[video.level]}
                        </Badge>
                      </TableCell>
                      <TableCell>{video.orderIndex}</TableCell>
                      <TableCell>
                        <Badge variant={video.isPublished ? "default" : "outline"}>
                          {video.isPublished ? "공개" : "비공개"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(video.createdAt).toLocaleDateString("ko-KR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePublish(video)}
                          >
                            {video.isPublished ? "비공개" : "공개"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteVideo(video.id, video.title)
                            }
                          >
                            삭제
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Add Video Dialog */}
          <Dialog open={showAddVideo} onOpenChange={setShowAddVideo}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>영상 추가</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddVideo} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="v-title">제목 *</Label>
                  <Input
                    id="v-title"
                    value={addVideoForm.title}
                    onChange={(e) =>
                      setAddVideoForm({ ...addVideoForm, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-url">YouTube URL *</Label>
                  <Input
                    id="v-url"
                    value={addVideoForm.youtubeUrl}
                    onChange={(e) =>
                      setAddVideoForm({
                        ...addVideoForm,
                        youtubeUrl: e.target.value,
                      })
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-level">레벨 *</Label>
                  <Select
                    value={addVideoForm.level}
                    onValueChange={(val) =>
                      setAddVideoForm({
                        ...addVideoForm,
                        level: val as VideoLevel,
                      })
                    }
                  >
                    <SelectTrigger id="v-level">
                      <SelectValue placeholder="레벨 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={VideoLevel.BASIC}>기초</SelectItem>
                      <SelectItem value={VideoLevel.INTERMEDIATE}>중급</SelectItem>
                      <SelectItem value={VideoLevel.ADVANCED}>고급</SelectItem>
                      <SelectItem value={VideoLevel.APPLIED}>실전적용</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-desc">설명</Label>
                  <Textarea
                    id="v-desc"
                    value={addVideoForm.description}
                    onChange={(e) =>
                      setAddVideoForm({
                        ...addVideoForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="v-order">표시 순서</Label>
                    <Input
                      id="v-order"
                      type="number"
                      value={addVideoForm.orderIndex}
                      onChange={(e) =>
                        setAddVideoForm({
                          ...addVideoForm,
                          orderIndex: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>공개 여부</Label>
                    <Select
                      value={addVideoForm.isPublished ? "true" : "false"}
                      onValueChange={(val) =>
                        setAddVideoForm({
                          ...addVideoForm,
                          isPublished: val === "true",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">공개</SelectItem>
                        <SelectItem value="false">비공개</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddVideo(false)}
                    disabled={savingVideo}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={savingVideo}>
                    {savingVideo ? "저장 중..." : "추가"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ─── 미팅 관리 ──────────────────────────────────────────── */}
        <TabsContent value="meetings">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">미팅 예약 목록</h2>
          </div>

          {/* Status filter */}
          <div className="flex gap-2 flex-wrap mb-4">
            {(["ALL", ...Object.values(MeetingStatus)] as const).map(
              (status) => (
                <Button
                  key={status}
                  variant={meetingStatusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setMeetingStatusFilter(status);
                    fetchMeetings(status);
                  }}
                >
                  {status === "ALL"
                    ? "전체"
                    : STATUS_LABELS[status as MeetingStatus]}
                </Button>
              )
            )}
          </div>

          {loadingMeetings ? (
            <p className="text-muted-foreground py-8 text-center">불러오는 중...</p>
          ) : meetings.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
              미팅 예약이 없습니다.
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>직책</TableHead>
                    <TableHead>신청일시</TableHead>
                    <TableHead>상담일시</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>메모</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell className="font-medium">
                        {meeting.name}
                      </TableCell>
                      <TableCell>{meeting.jobTitle}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDatetime(meeting.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDatetime(meeting.startAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[meeting.status]}>
                          {STATUS_LABELS[meeting.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {meeting.adminNote ?? "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1.5 justify-end">
                          {meeting.status === MeetingStatus.PENDING && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  handleMeetingStatus(
                                    meeting,
                                    MeetingStatus.CONFIRMED
                                  )
                                }
                              >
                                확정
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleMeetingStatus(
                                    meeting,
                                    MeetingStatus.REJECTED
                                  )
                                }
                              >
                                거절
                              </Button>
                            </>
                          )}
                          {meeting.status === MeetingStatus.CONFIRMED && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleMeetingStatus(
                                  meeting,
                                  MeetingStatus.CANCELLED
                                )
                              }
                            >
                              취소
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ─── 설정 ────────────────────────────────────────────────── */}
        <TabsContent value="settings">
          <div className="max-w-md">
            <h2 className="text-xl font-semibold mb-4">시스템 설정</h2>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="chatroom-url">오픈채팅방 URL</Label>
                <Input
                  id="chatroom-url"
                  type="url"
                  value={chatroomUrl}
                  onChange={(e) => setChatroomUrl(e.target.value)}
                  placeholder="https://open.kakao.com/..."
                />
                <p className="text-xs text-muted-foreground">
                  메인 페이지의 오픈채팅방 버튼에 연결될 URL입니다.
                </p>
              </div>
              <Button type="submit" disabled={savingSettings}>
                {savingSettings ? "저장 중..." : "저장"}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
