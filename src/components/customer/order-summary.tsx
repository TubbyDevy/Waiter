"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { formatCents } from "@/lib/currency";
import { validateMinimumOrder } from "@/lib/order-rules";
import type { CartItem, OrderContextData } from "./types";

type Props = {
  data: OrderContextData;
  cart: CartItem[];
  onBack: () => void;
  onPlaceOrder: (paymentMethod: "CARD" | "CASH") => Promise<void>;
  placing: boolean;
};

export function OrderSummary({
  data,
  cart,
  onBack,
  onPlaceOrder,
  placing,
}: Props) {
  const [payment, setPayment] = useState<"CARD" | "CASH">("CASH");
  const currency = data.settings?.currency ?? "EUR";
  const total = cart.reduce((s, i) => s + i.priceCents * i.quantity, 0);
  const validation = validateMinimumOrder(cart, data.settings);

  return (
    <motion.div
      key="summary"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pb-32 pt-8"
    >
      <h2 className="font-display text-3xl text-stone-900">Your order</h2>
      <p className="mt-1 text-stone-500">Check everything looks good</p>

      <ul className="mt-6 space-y-3">
        {cart.map((item) => (
          <li
            key={item.menuItemId}
            className="flex justify-between rounded-xl bg-white p-4 shadow-sm"
          >
            <div>
              <p className="font-medium">
                {item.quantity}× {item.name}
              </p>
              {item.notes && (
                <p className="text-sm text-stone-500">Note: {item.notes}</p>
              )}
            </div>
            <p className="font-medium text-brand-600">
              {formatCents(item.priceCents * item.quantity, currency)}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-right font-display text-2xl">
        Total {formatCents(total, currency)}
      </p>

      {!validation.valid && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {validation.message}
        </p>
      )}

      <div className="mt-8">
        <p className="text-sm font-medium text-stone-700">How will you pay?</p>
        <p className="mt-1 text-xs text-stone-500">
          No payment online — your waiter will charge you at the table.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(["CASH", "CARD"] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setPayment(method)}
              className={`touch-target rounded-xl border-2 py-3 font-medium transition ${
                payment === method
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-stone-200 bg-white text-stone-600"
              }`}
            >
              {method === "CARD" ? "💳 Card at table" : "💵 Cash"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-stone-200 py-3 font-medium text-stone-600"
        >
          Add more
        </button>
        <button
          type="button"
          disabled={!validation.valid || placing || cart.length === 0}
          onClick={() => onPlaceOrder(payment)}
          className="flex-1 rounded-xl bg-brand-500 py-3 font-medium text-white disabled:opacity-50"
        >
          {placing ? "Placing…" : "Place order"}
        </button>
      </div>
    </motion.div>
  );
}
