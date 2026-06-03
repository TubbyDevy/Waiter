export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // Skip during `next build` when env may be incomplete
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (!process.env.DATABASE_URL) return;

  const { validateServerEnv } = await import("@/lib/env");
  if (process.env.NODE_ENV === "production") {
    validateServerEnv();
  }
}
