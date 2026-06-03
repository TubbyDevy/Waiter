"use client";

import { motion } from "framer-motion";
import { formatCents } from "@/lib/currency";
import type { CartItem } from "./types";

type Props = {
  items: CartItem[];
  currency: string;
  onConfirm: () => void;
  visible: boolean;
};

export function FloatingCartBar({ items, currency, onConfirm, visible }: Props) {
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.priceCents * i.quantity, 0);

  if (!visible || count === 0) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur-md safe-area-pb"
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="flex-1">
          <p className="text-sm text-stone-500">
            {count} {count === 1 ? "item" : "items"}
          </p>
          <p className="font-display text-xl text-stone-900">
            {formatCents(total, currency)}
          </p>
        </div>
        <button
          type="button"
          onClick={onConfirm}
          className="touch-target rounded-full bg-brand-500 px-6 py-3 font-medium text-white shadow-lg shadow-brand-500/25 active:scale-[0.98]"
        >
          Review order
        </button>
      </div>
    </motion.div>
  );
}
