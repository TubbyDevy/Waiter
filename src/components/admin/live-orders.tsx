"use client";

import { useCallback, useEffect, useState } from "react";
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
  waiter: { name: string } | null;
};

export function LiveOrders({ restaurantId }: { restaurantId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/orders?active=true");
    const data = await res.json();
    setOrders(data.orders ?? []);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);

    const channel = supabase.channel(orderChannelName(restaurantId));
    channel
      .on("broadcast", { event: "order" }, () => load())
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [load, restaurantId]);

  return (
    <ul className="space-y-3">
      {orders.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-stone-500">
          No active orders right now.
        </p>
      ) : (
        orders.map((order) => (
          <li key={order.id} className="rounded-xl border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-display text-lg">{order.table.name}</span>
              <div className="flex flex-wrap items-center gap-2">
                <PaymentBadge method={order.paymentMethod} prominent />
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                  {order.status}
                </span>
              </div>
            </div>
            <ul className="mt-2 text-sm">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity}× {item.name}
                  {item.notes && (
                    <span className="ml-2 rounded bg-amber-100 px-1 text-amber-800">
                      {item.notes}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-stone-500">
              {new Date(order.createdAt).toLocaleTimeString()} ·{" "}
              {formatCents(order.totalCents)}
              {order.waiter && ` · ${order.waiter.name}`}
            </p>
          </li>
        ))
      )}
    </ul>
  );
}
