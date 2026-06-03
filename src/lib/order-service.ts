import { OrderStatus, TableStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { broadcastOrderUpdate } from "@/lib/realtime-broadcast";

const STATUS_FLOW: OrderStatus[] = [
  "RECEIVED",
  "PREPARING",
  "READY",
  "SERVED",
];

export function nextOrderStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx < 0 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

function tableStatusForOrder(status: OrderStatus): TableStatus {
  if (status === "SERVED") return "SERVED";
  if (status === "READY") return "WAITING";
  return "ORDERING";
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: true, table: true },
  });

  await prisma.table.update({
    where: { id: order.tableId },
    data: { status: tableStatusForOrder(status) },
  });

  await broadcastOrderUpdate(order.restaurantId, order.tableId, order);
  return order;
}

export async function getOrderWithDetails(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, table: true },
  });
}
