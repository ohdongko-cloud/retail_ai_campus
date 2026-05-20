"use client";

// 최초 접속 시 직원 정보 입력 팝업
// PRD 요구사항:
//  - 필수값이 아니지만 필수처럼 보이도록 UI 디자인 (별표 + 강조)
//  - 건너뛰기 가능
//  - 입력 데이터는 localStorage에 저장, 재방문 시 자동 채워짐
//  - aria-required 속성으로 접근성 보장

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getStoredUser,
  setStoredUser,
  hasBeenPrompted,
  markPrompted,
  type StoredUser,
} from "@/lib/user-session";

export function UserInfoDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StoredUser>({
    name: "",
    organization: "",
    jobTitle: "",
    email: "",
  });

  useEffect(() => {
    // 클라이언트 마운트 후 저장된 사용자 정보를 읽어 폼에 채우고 팝업 노출 여부를 결정합니다.
    // localStorage는 외부 시스템이므로 effect로 동기화하는 것이 적절합니다.
    const stored = getStoredUser();
    const shouldOpen = !hasBeenPrompted();
    if (stored || shouldOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 외부 저장소(localStorage)와의 1회성 동기화
      setForm((prev) => ({
        name: stored?.name ?? prev.name ?? "",
        organization: stored?.organization ?? prev.organization ?? "",
        jobTitle: stored?.jobTitle ?? prev.jobTitle ?? "",
        email: stored?.email ?? prev.email ?? "",
      }));
    }
    if (shouldOpen) {
      setOpen(true);
    }
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStoredUser(form);
    markPrompted();
    setOpen(false);
  }

  function handleSkip() {
    markPrompted();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>환영합니다 👋</DialogTitle>
          <DialogDescription>
            맞춤 안내와 통계를 위해 정보를 입력해 주세요. 입력하지 않아도 이용 가능합니다.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSave}>
          <Field
            id="name"
            label="이름"
            required
            value={form.name ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder="홍길동"
          />
          <Field
            id="organization"
            label="소속 (조직명)"
            required
            value={form.organization ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, organization: v }))}
            placeholder="예: 디지털혁신팀"
          />
          <Field
            id="jobTitle"
            label="직무"
            required
            value={form.jobTitle ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, jobTitle: v }))}
            placeholder="예: 데이터 분석가"
          />
          <Field
            id="email"
            label="이메일"
            required
            type="email"
            value={form.email ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            placeholder="name@company.com"
          />
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" onClick={handleSkip}>
              건너뛰기
            </Button>
            <Button type="submit">저장하고 시작</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-1">
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        // PRD: 실제 required는 아니지만 시각적으로 강조하고 스크린리더에 권장 입력임을 알림
        aria-required={required ? "true" : undefined}
      />
    </div>
  );
}
