const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"] as const;

export function validateServerEnv(): void {
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (process.env.NODE_ENV === "production") {
    const secret = process.env.NEXTAUTH_SECRET!;
    if (secret.length < 32) {
      throw new Error("NEXTAUTH_SECRET must be at least 32 characters in production");
    }
    if (secret.includes("dev-secret") || secret === "changeme") {
      throw new Error("NEXTAUTH_SECRET must not use a default/dev value in production");
    }
    if (!process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")) {
      console.warn(
        "[TableFlow] NEXT_PUBLIC_APP_URL should use https:// in production for QR links"
      );
    }
  }
}
