import type { Order, OrderItem, Table } from "@prisma/client";
import { orderChannelName, tableChannelName } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase";

export type OrderPayload = Order & {
  items: OrderItem[];
  table?: Table;
};

export async function broadcastOrderUpdate(
  restaurantId: string,
  tableId: string,
  order: OrderPayload,
  event: "order_created" | "order_updated" = "order_updated"
) {
  try {
    const supabase = getSupabaseAdmin();
    const payload = { type: event, order };
    await supabase.channel(orderChannelName(restaurantId)).send({
      type: "broadcast",
      event: "order",
      payload,
    });
    await supabase.channel(tableChannelName(tableId)).send({
      type: "broadcast",
      event: "order",
      payload,
    });
  } catch {
    // Supabase optional in local dev
  }
}
