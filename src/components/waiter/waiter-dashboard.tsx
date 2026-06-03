"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { PaymentBadge } from "@/components/ui/payment-badge";
import { formatCents } from "@/lib/currency";
import type { PaymentMethod } from "@prisma/client";
import { orderChannelName, supabase } from "@/lib/supabase";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  notes: string | null;
};
type Order = {
  id: string;
  status: string;
  paymentMethod: PaymentMethod | null;
  totalCents: number;
  createdAt: string;
  table: { name: string };
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: "Mark preparing",
  PREPARING: "Mark ready",
  READY: "Mark served",
  PENDING: "Mark received",
};

export function WaiterDashboard({
  waiterName,
  restaurantId,
}: {
  waiterName: string;
  restaurantId: string;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [servedToday, setServedToday] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/waiter/orders");
    const data = await res.json();
    setOrders(data.orders ?? []);
    setServedToday(data.servedToday ?? 0);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    const channel = supabase.channel(orderChannelName(restaurantId));
    channel.on("broadcast", { event: "order" }, () => load()).subscribe();
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [load, restaurantId]);

  async function advanceOrder(orderId: string) {
    await fetch(`/api/waiter/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advance: true }),
    });
    load();
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6 pb-24">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-brand-600">Waiter</p>
          <h1 className="font-display text-2xl">{waiterName}</h1>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-stone-500"
        >
          Sign out
        </button>
      </header>

      <div className="mb-6 rounded-2xl bg-brand-500 p-4 text-white shadow-lg">
        <p className="text-sm opacity-90">Served today</p>
        <p className="font-display text-3xl">{servedToday}</p>
      </div>

      <h2 className="mb-3 font-medium text-stone-700">Your active orders</h2>
      {orders.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-stone-500 shadow-sm">
          Waiting for orders on your tables…
        </p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span className="font-display text-xl">{order.table.name}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <PaymentBadge method={order.paymentMethod} prominent />
                  <span className="text-xs font-medium uppercase tracking-wide text-stone-400">
                    {order.status}
                  </span>
                </div>
              </div>
              <p className="text-xs text-stone-400">
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
              <ul className="mt-3 space-y-2">
                {order.items.map((item) => (
                  <li key={item.id} className="text-sm">
                    <span className="font-medium">
                      {item.quantity}× {item.name}
                    </span>
                    {item.notes && (
                      <p className="mt-1 rounded-lg border-2 border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900">
                        ⚠ {item.notes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-brand-600">
                {formatCents(order.totalCents)}
              </p>
              {order.status !== "SERVED" && (
                <button
                  type="button"
                  onClick={() => advanceOrder(order.id)}
                  className="touch-target mt-4 w-full rounded-xl bg-brand-500 py-3 font-medium text-white active:scale-[0.98]"
                >
                  {STATUS_LABELS[order.status] ?? "Update status"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
