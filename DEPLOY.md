# Vercel 배포 가이드

GitHub 저장소: <https://github.com/ohdongko-cloud/retail_ai_campus>

> ⚠️ **프로젝트가 저장소 하위 디렉토리에 있음**
> 이 Next.js 앱은 저장소 루트가 아닌 `ax-edu-platform/` 하위 폴더에 있습니다.
> Vercel 프로젝트 생성 시 **Root Directory**를 반드시 `ax-edu-platform`으로 설정하세요.

---

## 1. Neon Postgres 생성 (DB 준비)

1. <https://console.neon.tech> 접속 → 회원가입/로그인
2. **Create Project** 클릭
   - Project name: `retail-ai-campus`
   - Region: 가까운 리전 (Tokyo, Singapore 등)
   - Postgres version: 16 (기본)
3. 프로젝트 생성 후 **Connection Details** 에서 두 가지 URL이 보입니다:
   - **Pooled connection** (예: `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db`)
   - **Direct connection** (예: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/db`)
4. **Pooled connection URL을 복사**해 두세요. 서버리스 환경에서는 풀러를 통해야 커넥션 고갈을 피할 수 있습니다.

> 💡 **Vercel 마켓플레이스 통합**을 사용하면 위 과정이 자동화됩니다. Vercel 프로젝트 만든 후 **Storage → Browse Marketplace → Neon** 추가하면 `DATABASE_URL`이 자동으로 환경변수에 주입됩니다.

---

## 2. Vercel 프로젝트 생성

### A. 프로젝트 Import

1. <https://vercel.com/new> 접속
2. **Import Git Repository** → `ohdongko-cloud/retail_ai_campus` 선택
3. **Configure Project** 화면에서:

| 항목 | 값 |
| --- | --- |
| **Framework Preset** | Next.js (자동 감지됨) |
| **Root Directory** | `ax-edu-platform` ⚠️ 반드시 설정 |
| **Build Command** | `npm run build` (기본값 그대로) |
| **Output Directory** | `.next` (기본값 그대로) |
| **Install Command** | `npm install` (기본값 그대로) |
| **Node.js Version** | 22.x (Settings에서 변경 가능) |

> `postinstall` 스크립트(`prisma generate`)가 자동으로 실행되어 Prisma Client가 생성됩니다.

### B. 환경변수 설정

배포 전에 **Environment Variables** 섹션에서 아래 변수를 모두 추가하세요.

| 변수명 | 필수 | 환경 | 값 예시 | 설명 |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | ✅ | Production, Preview, Development | `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db?sslmode=require` | Neon **Pooled** connection URL |
| `ADMIN_USERNAME` | ✅ | Production | `ADMIN_DH` | 관리자 로그인 ID |
| `ADMIN_PASSWORD` | ✅ | Production | (16자 이상 강력한 비밀번호) | 관리자 로그인 비밀번호 — 시드 후 초기 비번. **운영 환경에 절대 약한 값 사용 금지** |
| `SESSION_SECRET` | ✅ | Production, Preview | (32바이트 무작위) | 관리자 세션 서명용 비밀키. `openssl rand -hex 32`로 생성 |

#### 환경별 권장 설정

- **Production**: 위 4개 모두 필수, 운영용 강한 값 사용
- **Preview**: PR 미리보기용. `DATABASE_URL`은 별도 Neon branch 또는 같은 DB 공유 가능
- **Development**: 로컬은 `.env` 파일 사용 (Vercel에 등록 불필요)

> 🔐 **SESSION_SECRET 생성 명령어** (로컬 터미널에서)
> ```bash
> openssl rand -hex 32
> # 또는 Node.js
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### C. Deploy 클릭

빌드가 성공하면 `https://retail-ai-campus.vercel.app` (또는 커스텀 도메인)에서 확인할 수 있습니다.

---

## 3. 첫 배포 후 작업 (마이그레이션)

> ⚠️ **현재 저장소에는 마이그레이션 파일이 없습니다.** 첫 배포 시 로컬에서 마이그레이션을 생성하고 푸시한 다음, 운영 DB에 적용해야 합니다.

### 단계 1: 로컬에서 마이그레이션 생성

```bash
cd ax-edu-platform
# 로컬 .env의 DATABASE_URL을 운영 DB와 다른 별도 DB로 설정한 상태에서
npx prisma migrate dev --name init
```

`prisma/migrations/` 디렉토리가 생성됩니다.

### 단계 2: 마이그레이션 커밋 & 푸시

```bash
git add prisma/migrations
git commit -m "feat: add initial Prisma migration"
git push
```

이 푸시로 Vercel이 자동 재배포됩니다.

### 단계 3: 운영 DB에 마이그레이션 적용

**옵션 A: 빌드 스크립트에 포함 (자동화 권장)**

`package.json`의 build 스크립트를 수정:

```json
"build": "prisma migrate deploy && next build"
```

이렇게 하면 매 배포마다 자동으로 마이그레이션이 적용됩니다.

**옵션 B: 로컬에서 수동 적용**

```bash
# 운영 DATABASE_URL을 임시로 설정한 환경에서
DATABASE_URL="<운영 URL>" npx prisma migrate deploy
```

### 단계 4: 관리자 시드 데이터 생성

`prisma/seed.ts` 작성이 필요합니다 (현재 미구현). 임시로는 운영 DB에 직접 SQL을 실행하거나 Prisma Studio로 추가하세요.

```sql
-- 비밀번호는 bcrypt 해시 처리된 값을 넣어야 함
INSERT INTO "Admin" (id, username, "passwordHash", "createdAt", "updatedAt")
VALUES (
  'admin-dh-001',
  'ADMIN_DH',
  '$2b$10$...',  -- bcrypt 해시
  NOW(),
  NOW()
);
```

---

## 4. 환경변수 체크리스트 요약

배포 전에 다음 항목을 모두 점검하세요.

- [ ] **DATABASE_URL** — Neon Pooled URL, `sslmode=require` 포함
- [ ] **ADMIN_USERNAME** — `ADMIN_DH`
- [ ] **ADMIN_PASSWORD** — 강력한 비밀번호 (`change-me-on-deploy` 절대 사용 금지)
- [ ] **SESSION_SECRET** — `openssl rand -hex 32`로 생성한 무작위 값
- [ ] **Root Directory** — `ax-edu-platform`
- [ ] **Node.js Version** — 22.x
- [ ] 빌드 로그에 `Generated Prisma Client` 메시지 확인
- [ ] 배포 후 `https://<domain>/` 접속해서 메인 페이지 5개 카드 노출 확인
- [ ] `/api/analytics` 호출이 500이 아닌 200 반환하는지 확인 (DB 연결 정상)

---

## 5. 자주 발생하는 이슈

### `Module not found: @/generated/prisma/client`

→ `postinstall: prisma generate`가 실행되지 않은 경우입니다. Vercel의 **Build & Development Settings → Install Command**를 `npm install` (기본값)로 유지하고 재배포하세요.

### `PrismaClientInitializationError: Can't reach database server`

→ `DATABASE_URL`이 잘못되었거나 IP allowlist 문제입니다. Neon은 기본적으로 모든 IP 허용이지만, 다른 Postgres 호스팅을 사용 중이라면 Vercel의 outbound IP를 허용해야 합니다.

### `Too many connections` 오류

→ Neon **Pooled** URL을 사용하지 않았습니다. URL에 `-pooler`가 포함되어 있는지 확인하세요.

### 마이그레이션 충돌

→ Preview 배포와 Production이 같은 DB를 공유하는 경우 발생합니다. Neon의 **branching** 기능으로 Preview용 별도 DB를 만드세요.

---

## 6. 향후 최적화 (선택)

### 더 나은 서버리스 성능 → `@prisma/adapter-neon`

현재는 `@prisma/adapter-pg` (TCP 기반)를 사용합니다. Neon 전용 HTTP 기반 어댑터로 바꾸면 서버리스 콜드스타트가 더 빠릅니다.

```bash
npm uninstall @prisma/adapter-pg pg @types/pg
npm install @prisma/adapter-neon @neondatabase/serverless
```

`src/lib/prisma.ts`에서 어댑터 교체.

### Vercel Analytics 추가

```bash
npm install @vercel/analytics
```

`src/app/layout.tsx`에서 `<Analytics />` 컴포넌트 추가.

### Edge Runtime

`/api/analytics` 같은 단순 라우트는 Edge Runtime으로 옮기면 더 빠르고 저렴합니다. 단, Prisma 7 + driver adapter는 Edge에서도 동작 가능하지만 검증이 필요합니다.
