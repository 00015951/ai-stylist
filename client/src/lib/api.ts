/**
 * API client for Virtual AI Stylist backend
 * Uses NEXT_PUBLIC_API_URL when set; falls back to same-origin (Next.js API routes)
 */

const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "")
    : "";

/** Backend base URL when set (client-only); used for sync/hydration */
function getApiBase(): string {
  return typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_API_URL || "") : "";
}

function getHeaders(initData?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (initData) {
    headers["X-Telegram-Init-Data"] = initData;
  }
  return headers;
}

function apiUrl(path: string): string {
  const base = API_BASE.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

/** POST /api/auth/telegram */
export async function authTelegram(initData: string) {
  const res = await fetch(apiUrl("/api/auth/telegram"), {
    method: "POST",
    headers: getHeaders(),
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
  const useBackend = API_BASE && initData;
  const url = useBackend ? apiUrl("/api/generate-style") : "/api/generate-style";
  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(initData),
    body: JSON.stringify(useBackend ? body : { ...body }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Generate failed");
  }
  return res.json();
}

/** GET /api/user/profile */
export async function getUserProfile(initData: string | null) {
  if (!initData || !API_BASE) return null;
  const res = await fetch(apiUrl("/api/user/profile"), {
    headers: getHeaders(initData),
  });
  if (!res.ok) return null;
  return res.json();
}

/** PUT /api/user/profile */
export async function updateUserProfile(
  body: Record<string, unknown>,
  initData: string | null
) {
  if (!initData || !API_BASE) return false;
  const res = await fetch(apiUrl("/api/user/profile"), {
    method: "PUT",
    headers: getHeaders(initData),
    body: JSON.stringify(body),
  });
  return res.ok;
}

/** GET /api/wardrobe */
export async function getWardrobe(initData: string | null) {
  if (!initData || !API_BASE) return { favorites: [] };
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
  if (!initData || !API_BASE) return null;
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
  if (!initData || !API_BASE) return false;
  const res = await fetch(apiUrl(`/api/wardrobe/${id}`), {
    method: "DELETE",
    headers: getHeaders(initData),
  });
  return res.ok;
}

export { getApiBase };
