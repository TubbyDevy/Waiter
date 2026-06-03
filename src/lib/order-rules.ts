import type { RestaurantSettings } from "@prisma/client";

export type CartLine = {
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
  isFood: boolean;
  notes?: string;
};

export function cartTotalCents(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.priceCents * l.quantity, 0);
}

export function validateMinimumOrder(
  lines: CartLine[],
  settings: Pick<RestaurantSettings, "minOrderAmountCents" | "requireFoodItem"> | null
): { valid: boolean; message?: string } {
  if (!settings) return { valid: true };

  const total = cartTotalCents(lines);

  if (settings.requireFoodItem) {
    const hasFood = lines.some((l) => l.isFood && l.quantity > 0);
    if (!hasFood) {
      return {
        valid: false,
        message: "Please add at least one food item to your order.",
      };
    }
  }

  if (
    settings.minOrderAmountCents != null &&
    total < settings.minOrderAmountCents
  ) {
    return {
      valid: false,
      message: `Minimum order is ${(settings.minOrderAmountCents / 100).toFixed(2)}.`,
    };
  }

  return { valid: true };
}

export function estimateMinutes(itemCount: number): number {
  return Math.min(45, Math.max(12, 8 + itemCount * 3));
}
