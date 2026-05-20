// 직원 정보 (이름/소속/직무/이메일)를 브라우저 세션 스토리지에 저장/조회하는 헬퍼
// PRD: 최초 접속 시 입력받지만 필수는 아니며, 다시 방문 시 자동 채워짐

const USER_KEY = "ax-edu:user";
const SESSION_KEY = "ax-edu:session";
const PROMPTED_KEY = "ax-edu:prompted";

export type StoredUser = {
  name?: string;
  organization?: string;
  jobTitle?: string;
  email?: string;
  savedAt?: string;
};

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    // 영구 보존을 위해 localStorage 사용 (재방문 시 자동 채움)
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredUser = { ...user, savedAt: new Date().toISOString() };
    window.localStorage.setItem(USER_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function hasBeenPrompted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(PROMPTED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markPrompted(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROMPTED_KEY, "1");
  } catch {
    // ignore
  }
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}
