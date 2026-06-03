"use client";

import type { Order, OrderItem } from "@prisma/client";
import { useEffect, useState } from "react";
import { supabase, tableChannelName } from "@/lib/supabase";

type OrderWithItems = Order & { items: OrderItem[] };

export function useOrderRealtime(
  tableId: string | null,
  orderId: string | null,
  qrToken: string,
  initial: OrderWithItems | null
) {
  const [order, setOrder] = useState<OrderWithItems | null>(initial);

  useEffect(() => {
    setOrder(initial);
  }, [initial]);

  useEffect(() => {
    if (!tableId || !orderId) return;

    const channel = supabase.channel(tableChannelName(tableId));

    channel
      .on("broadcast", { event: "order" }, ({ payload }) => {
        const data = payload as { order?: OrderWithItems };
        if (data.order?.id === orderId) {
          setOrder(data.order);
        }
      })
      .subscribe();

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/public/orders/${orderId}?qrToken=${encodeURIComponent(qrToken)}`
        );
        if (res.ok) {
          const json = await res.json();
          setOrder(json.order);
        }
      } catch {
        // polling fallback
      }
    }, 8000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [tableId, orderId, qrToken]);

  return order;
}
