// 사내 AI 교육 플랫폼 메인 페이지
// PRD: 다섯 개의 큰 카드 버튼 + 최초 접속 시 사용자 정보 입력 팝업

import { MainMenu } from "@/components/landing/main-menu";
import { UserInfoDialog } from "@/components/landing/user-info-dialog";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              사내 AI 교육 플랫폼
            </h1>
            <p className="text-sm text-muted-foreground">유통사 전사 AX TF</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-12">
        <section className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI를 업무에 어떻게 활용할까요?
          </h2>
          <p className="mt-3 text-muted-foreground">
            교육 영상 시청, 개별 상담, 동료와의 질의응답·서비스 공유까지
            한 곳에서 시작하세요.
          </p>
        </section>
        <MainMenu />
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2026 AX TF. All rights reserved.
        </div>
      </footer>

      <UserInfoDialog />
    </div>
  );
}
