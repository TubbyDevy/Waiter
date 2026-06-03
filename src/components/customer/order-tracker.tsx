"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Order, OrderItem, OrderStatus } from "@prisma/client";
import { PaymentBadge } from "@/components/ui/payment-badge";
import { formatCents } from "@/lib/currency";
import { cn } from "@/lib/utils";

const STAGES: {
  status: OrderStatus[];
  label: string;
  message: string;
}[] = [
  {
    status: ["PENDING", "RECEIVED"],
    label: "Order received",
    message: "Got your order — we're getting things started in the kitchen.",
  },
  {
    status: ["PREPARING"],
    label: "Being prepared",
    message: "Our team is preparing your dishes with care.",
  },
  {
    status: ["READY"],
    label: "Almost ready",
    message: "Your order is almost ready to come to your table.",
  },
  {
    status: ["SERVED"],
    label: "On the way",
    message: "Enjoy! Your order has arrived at your table.",
  },
];

type OrderWithItems = Order & { items: OrderItem[] };

type Props = {
  order: OrderWithItems;
  restaurantName: string;
  currency: string;
  onNewOrder: () => void;
};

function getStageIndex(status: OrderStatus): number {
  if (status === "SERVED" || status === "CANCELLED") return 3;
  const idx = STAGES.findIndex((s) => s.status.includes(status));
  return idx >= 0 ? idx : 0;
}

export function OrderTracker({
  order,
  restaurantName,
  currency,
  onNewOrder,
}: Props) {
  const stageIndex = getStageIndex(order.status);
  const current = STAGES[stageIndex];

  return (
    <motion.div
      key="tracker"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 py-10"
    >
      <p className="text-center text-sm text-brand-600">{restaurantName}</p>
      <h2 className="mt-2 text-center font-display text-3xl text-stone-900">
        Order tracking
      </h2>

      <motion.div
        className="mx-auto mt-10 max-w-md rounded-3xl bg-white p-8 shadow-xl"
        layout
      >
        <motion.p
          key={current.message}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-lg text-stone-700"
        >
          {current.message}
        </motion.p>

        {order.estimatedMinutes != null && order.status !== "SERVED" && (
          <motion.p
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-4 text-center font-display text-4xl text-brand-600"
          >
            ~{order.estimatedMinutes} min
          </motion.p>
        )}

        <div className="mt-10 space-y-4">
          {STAGES.map((stage, i) => {
            const active = i <= stageIndex;
            const currentStage = i === stageIndex;
            return (
              <div key={stage.label} className="flex items-center gap-4">
                <motion.div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    active
                      ? "bg-brand-500 text-white"
                      : "bg-stone-100 text-stone-400"
                  )}
                  animate={currentStage ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ repeat: currentStage ? Infinity : 0, duration: 1.5 }}
                >
                  {i + 1}
                </motion.div>
                <div>
                  <p
                    className={cn(
                      "font-medium",
                      active ? "text-stone-900" : "text-stone-400"
                    )}
                  >
                    {stage.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="mx-auto mt-8 max-w-md rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-stone-500">Your items</p>
          <PaymentBadge method={order.paymentMethod} />
        </div>
        <p className="mt-1 text-xs text-stone-400">Pay at the table — not charged online</p>
        <ul className="mt-2 space-y-1">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.quantity}× {item.name}
              </span>
              <span>{formatCents(item.priceCents * item.quantity, currency)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right font-medium text-brand-600">
          {formatCents(order.totalCents, currency)}
        </p>
      </div>

      {order.status === "SERVED" && (
        <button
          type="button"
          onClick={onNewOrder}
          className="mx-auto mt-8 block w-full max-w-md rounded-2xl border-2 border-brand-500 py-4 font-medium text-brand-600"
        >
          Order something else
        </button>
      )}
    </motion.div>
  );
}
