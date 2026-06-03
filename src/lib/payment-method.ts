import type { PaymentMethod } from "@prisma/client";

export function paymentMethodLabel(method: PaymentMethod | null | undefined): string {
  if (method === "CARD") return "Card at table";
  if (method === "CASH") return "Cash";
  return "Not set";
}

export function paymentMethodShort(method: PaymentMethod | null | undefined): string {
  if (method === "CARD") return "💳 Card";
  if (method === "CASH") return "💵 Cash";
  return "—";
}
