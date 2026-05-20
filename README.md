# 사내 AI 교육 플랫폼 (AX TF)

유통사 전사 AX TF 팀의 사내 AI 교육 및 협업 웹 플랫폼입니다.

## 주요 기능

랜딩 페이지의 5개 카드 버튼:

1. **강의 영상 시청** – 수준별로 분류된 AI 활용 교육 영상 (YouTube 비공개 임베드)
2. **익명 게시판** – 직원 간 자유로운 질의응답
3. **미팅 요청** – 팀장과의 1:1 상담 예약 (월~금, 08:00~17:00, 30분 단위)
4. **오픈채팅방 입장** – 관리자 설정 카카오톡 오픈채팅방 링크
5. **내 서비스 공유** – 직원이 직접 만든 AI 서비스 공유

추가:

- 최초 접속 시 직원 정보 입력 팝업 (이름·소속·직무·이메일, 모두 선택)
- 사용자 행동 분석 이벤트 수집 (`/api/analytics`)
- 관리자 대시보드 (`/admin`, 시드 데이터로 ADMIN_DH 계정)

## 기술 스택

- **프레임워크**: Next.js 16 (App Router, TypeScript)
- **UI**: Tailwind CSS v4 + shadcn/ui (base-nova preset)
- **데이터베이스**: PostgreSQL (Neon 권장)
- **ORM**: Prisma 7 + `@prisma/adapter-pg` (driver adapter)
- **배포**: Vercel (Serverless Functions + Edge Network)

> ⚠️ **Next.js 16 주요 변경사항**: `params`, `searchParams`가 `Promise`로 변경되어 `await` 필요. 새 글로벌 헬퍼 `PageProps<'/route'>`, `LayoutProps<'/route'>` 제공.
> ⚠️ **Prisma 7 주요 변경사항**: PrismaClient 인스턴스화 시 `adapter` 또는 `accelerateUrl`이 필수. 클라이언트가 `src/generated/prisma/`로 출력됨.

## 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 `.env`로 복사한 후 값을 채웁니다.

```bash
cp .env.example .env
```

`.env` 주요 변수:

| 키 | 설명 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 연결 문자열 (Neon 또는 로컬) |
| `ADMIN_USERNAME` | 관리자 계정명 (기본: `ADMIN_DH`) |
| `ADMIN_PASSWORD` | 관리자 비밀번호 (시드용) |
| `SESSION_SECRET` | 관리자 세션 서명용 비밀키 |

### 3. 데이터베이스 준비

**옵션 A: Neon 사용 (권장)**

1. [Neon Console](https://console.neon.tech)에서 프로젝트 생성
2. Connection string을 복사하여 `DATABASE_URL`에 붙여 넣기

**옵션 B: 로컬 Postgres 사용**

```bash
# Docker로 Postgres 실행 예시
docker run --name ax-edu-db -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=user -e POSTGRES_DB=ax_edu \
  -p 5432:5432 -d postgres:16
```

### 4. 스키마 적용

```bash
# 마이그레이션 생성 + 적용 (개발 환경)
npx prisma migrate dev --name init

# 프로덕션 환경
npx prisma migrate deploy
```

### 5. Prisma Client 재생성 (스키마 변경 시)

```bash
npx prisma generate
```

### 6. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인.

## 프로젝트 구조

```
src/
├── app/                     # Next.js App Router 라우트
│   ├── page.tsx             # 메인 페이지 (5개 카드 버튼)
│   ├── layout.tsx           # 루트 레이아웃
│   ├── videos/              # 강의 영상
│   ├── board/               # 익명 게시판
│   ├── meeting/             # 미팅 예약
│   ├── share/               # 서비스 공유
│   ├── admin/               # 관리자 대시보드
│   └── api/
│       ├── analytics/       # POST: 행동 이벤트 수집
│       └── chatroom/        # GET: 오픈채팅방 리다이렉트
├── components/
│   ├── landing/             # 메인 페이지 컴포넌트
│   │   ├── main-menu.tsx
│   │   └── user-info-dialog.tsx
│   └── ui/                  # shadcn/ui 컴포넌트
├── lib/
│   ├── prisma.ts            # Prisma Client 싱글톤
│   ├── analytics.ts         # 클라이언트 분석 이벤트 헬퍼
│   ├── user-session.ts      # 직원 정보 localStorage 관리
│   └── utils.ts             # shadcn cn 헬퍼
└── generated/prisma/        # Prisma 자동 생성 (gitignored)

prisma/
└── schema.prisma            # 데이터 모델 정의
```

## 데이터 모델 개요

- **User** – 직원 정보 (선택값)
- **Video / VideoView** – 교육 영상 + 시청 통계
- **Meeting** – 미팅 예약 (상태: PENDING/CONFIRMED/REJECTED/CANCELLED)
- **Post / Comment** – 익명 게시판
- **ServiceShare** – 서비스 공유 게시판
- **Setting** – Key-Value 시스템 설정 (오픈채팅방 링크 등)
- **Admin** – 관리자 계정
- **AnalyticsEvent** – 사용자 행동 데이터

## 배포 (Vercel + Neon)

1. GitHub에 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. Vercel 마켓플레이스에서 **Neon** 통합 추가 → `DATABASE_URL`이 자동 주입
4. 다른 환경 변수(`ADMIN_*`, `SESSION_SECRET`) 수동 입력
5. 배포 후 마이그레이션 적용:
   ```bash
   npx prisma migrate deploy
   ```

`main` 브랜치 푸시 시 자동 배포, PR 별로 미리보기 배포 생성.

## 개발 진행 상태

### ✅ 완료

- [x] Next.js 16 + TypeScript + Tailwind v4 초기 셋업
- [x] Prisma 스키마 정의 (8개 모델, 3개 enum)
- [x] shadcn/ui (Dialog, Card, Input, Table, Tabs 등) 도입
- [x] 메인 페이지 5개 카드 버튼 + 호버/클릭 이벤트 추적
- [x] 사용자 정보 입력 팝업 (localStorage, aria-required)
- [x] 라우트 스캐폴드 (`/videos`, `/board`, `/meeting`, `/share`, `/admin`)
- [x] 분석 이벤트 수집 API (`/api/analytics`)
- [x] 오픈채팅방 리다이렉트 API (`/api/chatroom`)

### 📋 다음 단계 (우선순위 순)

- [ ] **마이그레이션 실행** – `npx prisma migrate dev --name init` (DB 연결 후)
- [ ] **관리자 시드** – `prisma/seed.ts` 작성 후 `ADMIN_DH` 계정 생성
- [ ] **관리자 인증** – 로그인 페이지 + JWT 세션 미들웨어
- [ ] **영상 시청 페이지** – 목록·필터·YouTube 임베드 모달
- [ ] **미팅 예약 캘린더** – 주간 30분 단위 grid, 슬롯 충돌 검증
- [ ] **게시판 CRUD** – 글/댓글, 익명 닉네임, 신고/삭제
- [ ] **서비스 공유 CRUD** – 링크·테스트 계정, 익명
- [ ] **관리자 대시보드 통계** – 차트(recharts) + 엑셀 다운로드(SheetJS)
- [ ] **알림 이메일** – 미팅 신청 시 신청자/관리자에 발송

## 명령어 모음

```bash
npm run dev           # 개발 서버
npm run build         # 프로덕션 빌드
npm run start         # 프로덕션 서버
npm run lint          # ESLint
npx prisma studio     # DB GUI 뷰어
npx prisma format     # 스키마 포맷
npx tsc --noEmit      # 타입 체크
```
