import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function getRestaurantIdForUser(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { restaurantId: true, role: true },
  });
  return user?.restaurantId ?? null;
}

export function assertRestaurantAccess(
  userRestaurantId: string | null | undefined,
  targetRestaurantId: string,
  role: UserRole
) {
  if (role === UserRole.SUPER_ADMIN) return;
  if (!userRestaurantId || userRestaurantId !== targetRestaurantId) {
    throw new Error("FORBIDDEN");
  }
}

export async function scopeToRestaurant<T extends { restaurantId: string }>(
  restaurantId: string,
  userId: string
) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });
  assertRestaurantAccess(user.restaurantId, restaurantId, user.role);
  return user;
}
