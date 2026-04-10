/**
 * API client for Virtual AI Stylist backend
 * Uses NEXT_PUBLIC_API_URL when set; falls back to same-origin (Next.js API routes)
 */

const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "")
    : "";

const TG_SESSION_KEY = "stylist_tg_session";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(TG_SESSION_KEY);
  } catch {
    return null;
  }
}

/** Sessiya tokeni (Bearer) — POST /api/auth/telegram dan keyin saqlanadi */
export function setTelegramSessionToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) sessionStorage.setItem(TG_SESSION_KEY, token);
    else sessionStorage.removeItem(TG_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function getHeaders(initData?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (initData) {
    headers["X-Telegram-Init-Data"] = initData;
  }
  const t = getStoredToken();
  if (t) {
    headers.Authorization = `Bearer ${t}`;
  }
  return headers;
}

/** Backend ga initData yoki saqlangan sessiya tokeni bilan murojaat qilish mumkin */
export function canUseBackendAuth(initData: string | null | undefined): boolean {
  if (!API_BASE) return false;
  if (initData) return true;
  return Boolean(getStoredToken());
}

function apiUrl(path: string): string {
  const base = API_BASE.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

/** Style category from API (admin-editable names per language) */
export type StyleFromApi = {
  id: number;
  key: string;
  name: { en?: string; ru?: string; uz?: string };
  imageUrl?: string | null;
  description?: string | null;
};

/** GET /api/styles — public. Admin Uslublar sahifasidagi o'zgarishlar shu API orqali client/botga keladi */
export async function getStyles(): Promise<{ styles: StyleFromApi[] } | null> {
  const url = API_BASE ? apiUrl("/api/styles") : "/api/styles";
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** POST /api/auth/telegram — user + sessiya tokeni (Bearer) */
export async function authTelegram(initData: string): Promise<{
  user: Record<string, unknown>;
  token?: string;
}> {
  const res = await fetch(apiUrl("/api/auth/telegram"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Auth failed");
  }
  return res.json();
}

/** POST /api/generate-style - uses backend when API_BASE + initData, else Next.js API */
export async function generateStyle(
  body: {
    occasion: string;
    language?: string;
    profile?: Record<string, unknown>;
    stylePreferences?: string[];
    weather?: { tempC: number; condition: string; city?: string };
    trendInspired?: boolean;
  },
  initData: string | null
) {
  const useBackend = Boolean(API_BASE && (initData || getStoredToken()));
  const url = useBackend ? apiUrl("/api/generate-style") : "/api/generate-style";
  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(initData),
    body: JSON.stringify(useBackend ? body : { ...body }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err.error || err.message || "Generate failed") as Error & { code?: string };
    if (res.status === 402 && err.error === "UPGRADE_TO_PRO") e.code = "UPGRADE_TO_PRO";
    throw e;
  }
  return res.json();
}

/** GET /api/user/profile */
export async function getUserProfile(initData: string | null) {
  if (!API_BASE || (!initData && !getStoredToken())) return null;
  const res = await fetch(apiUrl("/api/user/profile"), {
    headers: getHeaders(initData),
  });
  if (!res.ok) return null;
  return res.json();
}

/** GET /api/user/subscription */
export async function getSubscription(initData: string | null) {
  if (!API_BASE || (!initData && !getStoredToken())) return null;
  const res = await fetch(apiUrl("/api/user/subscription"), {
    headers: getHeaders(initData),
  });
  if (!res.ok) return null;
  return res.json() as Promise<{
    plan: string;
    expiresAt: string | null;
    isPro: boolean;
    freeUsesLeft: number;
    freeLimit: number;
  }>;
}

/** PUT /api/user/profile */
export async function updateUserProfile(
  body: Record<string, unknown>,
  initData: string | null
) {
  if (!API_BASE || (!initData && !getStoredToken())) return false;
  const res = await fetch(apiUrl("/api/user/profile"), {
    method: "PUT",
    headers: getHeaders(initData),
    body: JSON.stringify(body),
  });
  return res.ok;
}

/** GET /api/wardrobe */
export async function getWardrobe(initData: string | null) {
  if (!API_BASE || (!initData && !getStoredToken())) return { favorites: [] };
  const res = await fetch(apiUrl("/api/wardrobe"), {
    headers: getHeaders(initData),
  });
  if (!res.ok) return { favorites: [] };
  return res.json();
}

/** POST /api/wardrobe */
export async function addToWardrobe(
  outfit: { occasion: string; imageUrl?: string; outfit: Record<string, string>; personaSummary?: string; shopping?: unknown },
  initData: string | null
) {
  if (!API_BASE || (!initData && !getStoredToken())) return null;
  const res = await fetch(apiUrl("/api/wardrobe"), {
    method: "POST",
    headers: getHeaders(initData),
    body: JSON.stringify(outfit),
  });
  if (!res.ok) return null;
  return res.json();
}

/** GET /api/weather?city=... */
export async function getWeather(city: string) {
  const base = API_BASE || "";
  const url = base ? `${base.replace(/\/$/, "")}/api/weather?city=${encodeURIComponent(city)}` : `/api/weather?city=${encodeURIComponent(city)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

/** DELETE /api/wardrobe/:id */
export async function removeFromWardrobe(id: string, initData: string | null) {
  if (!API_BASE || (!initData && !getStoredToken())) return false;
  const res = await fetch(apiUrl(`/api/wardrobe/${id}`), {
    method: "DELETE",
    headers: getHeaders(initData),
  });
  return res.ok;
}

export type AiRecommendedStyle = {
  id: number;
  key: string;
  name: { en?: string; ru?: string; uz?: string };
  imageUrl?: string | null;
  description?: string | null;
};

export async function onboardingPreview(body: {
  language?: string;
  profile?: Record<string, unknown>;
  stylePreferences?: string[];
}) {
  if (!API_BASE) return null;
  const res = await fetch(apiUrl("/api/ai/onboarding-preview"), {
    method: "POST",
    headers: getHeaders(null),
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json() as Promise<{
    message: string;
    recommendedStyles: AiRecommendedStyle[];
    previewResult?: unknown;
  }>;
}

export async function aiChat(body: {
  language?: string;
  context?: Record<string, unknown>;
  messages: { role: "user" | "assistant"; content: string }[];
}) {
  if (!API_BASE) return null;
  const res = await fetch(apiUrl("/api/ai/chat"), {
    method: "POST",
    headers: getHeaders(null),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err.error || err.message || "AI chat failed") as Error & { code?: string };
    if (res.status === 402 && err.error === "UPGRADE_TO_PRO") e.code = "UPGRADE_TO_PRO";
    if (res.status === 401) e.code = "UNAUTHORIZED";
    throw e;
  }
  return res.json() as Promise<{ reply: string; result?: unknown }>;
}
