import type { PaymentMethod } from "@prisma/client";
import { paymentMethodShort } from "@/lib/payment-method";
import { cn } from "@/lib/utils";

export function PaymentBadge({
  method,
  className,
  prominent = false,
}: {
  method: PaymentMethod | null | undefined;
  className?: string;
  prominent?: boolean;
}) {
  if (!method) return null;

  const isCard = method === "CARD";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        prominent
          ? isCard
            ? "bg-indigo-100 text-indigo-900 ring-2 ring-indigo-300"
            : "bg-emerald-100 text-emerald-900 ring-2 ring-emerald-300"
          : isCard
            ? "bg-indigo-50 text-indigo-800"
            : "bg-emerald-50 text-emerald-800",
        className
      )}
    >
      {paymentMethodShort(method)}
    </span>
  );
}
