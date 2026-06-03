import { NextResponse } from "next/server";

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

/** Simple in-memory rate limit (per server instance). Sufficient for MVP/single-node deploy. */
export function checkRateLimit(
  request: Request,
  namespace: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const key = `${namespace}:${ip}`;
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count += 1;

  if (entry.count > limit) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
        },
      }
    );
  }

  // Prevent unbounded map growth
  if (store.size > 10_000) {
    for (const [k, v] of Array.from(store.entries())) {
      if (now > v.resetAt) store.delete(k);
    }
  }

  return null;
}

export function checkRateLimitByKey(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count += 1;
  return entry.count > limit;
}
