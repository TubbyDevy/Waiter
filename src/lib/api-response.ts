import { UserRole } from "@prisma/client";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

type Fail = { ok: false; response: NextResponse };
type Ok<T> = { ok: true } & T;

export async function requireApiSession(
  roles?: UserRole[]
): Promise<Ok<{ session: Session }> | Fail> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, response: jsonError("Unauthorized", 401) };
  }
  if (roles && !roles.includes(session.user.role)) {
    return { ok: false, response: jsonError("Forbidden", 403) };
  }
  return { ok: true, session };
}

export async function requireRestaurantAdmin(): Promise<
  Ok<{ session: Session; restaurantId: string }> | Fail
> {
  const result = await requireApiSession([UserRole.RESTAURANT_ADMIN]);
  if (!result.ok) return result;
  const restaurantId = result.session.user.restaurantId;
  if (!restaurantId) {
    return { ok: false, response: jsonError("No restaurant assigned", 403) };
  }
  return { ok: true, session: result.session, restaurantId };
}
