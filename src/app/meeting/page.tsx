"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Slot {
  datetime: string;
  available: boolean;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekHeader(monday: Date): string {
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const year = monday.getFullYear();
  const month = monday.getMonth() + 1;
  const startDay = monday.getDate();
  const endDay = friday.getDate();
  return `${year}년 ${month}월 ${startDay}일 ~ ${endDay}일`;
}

const DAY_LABELS = ["월", "화", "수", "목", "금"];

// Generate time labels for 08:00 to 16:30 in 30min intervals
const TIME_SLOTS: string[] = [];
for (let slot = 0; slot < 18; slot++) {
  const hours = 8 + Math.floor(slot / 2);
  const minutes = (slot % 2) * 30;
  TIME_SLOTS.push(
    `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  );
}

interface BookingForm {
  name: string;
  jobTitle: string;
  currentWork: string;
  requestDetail: string;
  email: string;
  phone: string;
}

const INITIAL_FORM: BookingForm = {
  name: "",
  jobTitle: "",
  currentWork: "",
  requestDetail: "",
  email: "",
  phone: "",
};

export default function MeetingPage() {
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() =>
    getMonday(new Date())
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BookingForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchSlots = useCallback(async (monday: Date) => {
    setLoadingSlots(true);
    try {
      const weekStr = monday.toISOString().split("T")[0];
      const res = await fetch(`/api/meetings/slots?week=${weekStr}`);
      if (!res.ok) throw new Error("Failed to fetch slots");
      const data: Slot[] = await res.json();
      setSlots(data);
    } catch {
      toast.error("슬롯 정보를 불러오지 못했습니다.");
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots(currentWeekMonday);
  }, [currentWeekMonday, fetchSlots]);

  function goToPrevWeek() {
    const prev = new Date(currentWeekMonday);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekMonday(prev);
  }

  function goToNextWeek() {
    const next = new Date(currentWeekMonday);
    next.setDate(next.getDate() + 7);
    setCurrentWeekMonday(next);
  }

  function handleSlotClick(datetime: string) {
    setSelectedSlot(datetime);
    setShowForm(true);
    setForm(INITIAL_FORM);
  }

  function handleCloseForm() {
    setShowForm(false);
    setSelectedSlot(null);
    setForm(INITIAL_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;

    const { name, jobTitle, currentWork, requestDetail, email, phone } = form;
    if (!name || !jobTitle || !currentWork || !requestDetail || !email || !phone) {
      toast.error("모든 항목을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          jobTitle,
          currentWork,
          requestDetail,
          email,
          phone,
          startAt: selectedSlot,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "예약에 실패했습니다.");
        return;
      }

      toast.success("미팅 예약이 완료되었습니다! 확인 후 연락드리겠습니다.");
      handleCloseForm();
      fetchSlots(currentWeekMonday);
    } catch {
      toast.error("예약 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  // Build a 2D map: slotsByDayAndTime[dayIndex][timeIndex] = Slot | undefined
  const slotMap: Record<string, Slot> = {};
  for (const slot of slots) {
    slotMap[slot.datetime] = slot;
  }

  function getSlotDatetime(dayOffset: number, slotIndex: number): string {
    const day = new Date(currentWeekMonday);
    day.setDate(currentWeekMonday.getDate() + dayOffset);
    const hours = 8 + Math.floor(slotIndex / 2);
    const minutes = (slotIndex % 2) * 30;
    day.setHours(hours, minutes, 0, 0);
    return day.toISOString();
  }

  const selectedDate = selectedSlot ? new Date(selectedSlot) : null;
  const selectedLabel = selectedDate
    ? selectedDate.toLocaleString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <main className="container mx-auto py-12 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">미팅 요청</h1>
          <p className="mt-2 text-muted-foreground">
            팀장과의 개별 상담을 예약할 수 있습니다. (월~금, 08:00~16:30, 30분 단위)
          </p>
        </div>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          홈으로
        </Link>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={goToPrevWeek}>
          ← 이전 주
        </Button>
        <span className="font-semibold text-lg">
          {formatWeekHeader(currentWeekMonday)}
        </span>
        <Button variant="outline" size="sm" onClick={goToNextWeek}>
          다음 주 →
        </Button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span>예약 가능</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gray-200" />
          <span>예약 불가</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span>선택됨</span>
        </div>
      </div>

      {/* Calendar grid */}
      {loadingSlots ? (
        <div className="text-center py-12 text-muted-foreground">
          슬롯을 불러오는 중...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-r bg-muted px-3 py-2 text-left w-20 text-muted-foreground font-medium">
                  시간
                </th>
                {DAY_LABELS.map((day, i) => {
                  const dayDate = new Date(currentWeekMonday);
                  dayDate.setDate(currentWeekMonday.getDate() + i);
                  const dateStr = `${dayDate.getMonth() + 1}/${dayDate.getDate()}`;
                  return (
                    <th
                      key={day}
                      className="border-b border-r bg-muted px-3 py-2 text-center font-medium last:border-r-0"
                    >
                      <div>{day}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {dateStr}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((timeLabel, slotIndex) => (
                <tr key={timeLabel} className="hover:bg-muted/30">
                  <td className="border-b border-r px-3 py-1.5 text-muted-foreground text-xs font-mono">
                    {timeLabel}
                  </td>
                  {DAY_LABELS.map((_, dayOffset) => {
                    const datetime = getSlotDatetime(dayOffset, slotIndex);
                    const slot = slotMap[datetime];
                    const isAvailable = slot?.available ?? false;
                    const isSelected = selectedSlot === datetime;

                    return (
                      <td
                        key={dayOffset}
                        className="border-b border-r p-1 last:border-r-0"
                      >
                        <button
                          className={`w-full h-7 rounded text-xs font-medium transition-colors ${
                            isSelected
                              ? "bg-blue-500 text-white"
                              : isAvailable
                              ? "bg-green-100 hover:bg-green-500 hover:text-white text-green-700 cursor-pointer"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!isAvailable}
                          onClick={() =>
                            isAvailable && handleSlotClick(datetime)
                          }
                          title={isAvailable ? "클릭하여 예약" : "예약 불가"}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking form dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>미팅 예약</DialogTitle>
            <DialogDescription>
              선택된 시간: <strong>{selectedLabel}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="홍길동"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jobTitle">직책 *</Label>
              <Input
                id="jobTitle"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                placeholder="예: 대리, 과장, 팀장"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currentWork">현재 업무 *</Label>
              <Input
                id="currentWork"
                value={form.currentWork}
                onChange={(e) =>
                  setForm({ ...form, currentWork: e.target.value })
                }
                placeholder="현재 담당하고 계신 업무를 간단히 입력해주세요"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="requestDetail">상담 요청 내용 *</Label>
              <Textarea
                id="requestDetail"
                value={form.requestDetail}
                onChange={(e) =>
                  setForm({ ...form, requestDetail: e.target.value })
                }
                placeholder="상담 요청 내용 또는 궁금한 점을 자세히 적어주세요"
                rows={4}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@company.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">연락처 *</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="010-0000-0000"
                required
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseForm}
                disabled={submitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "제출 중..." : "예약하기"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
