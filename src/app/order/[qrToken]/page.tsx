import { CustomerOrderApp } from "@/components/customer/customer-order-app";
import type { OrderContextData } from "@/components/customer/types";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getOrderContext(qrToken: string): Promise<OrderContextData | null> {
  const table = await prisma.table.findUnique({
    where: { qrToken },
    include: {
      restaurant: {
        include: {
          settings: true,
          flowSteps: {
            orderBy: { sortOrder: "asc" },
            include: {
              categories: {
                orderBy: { sortOrder: "asc" },
                include: {
                  items: { orderBy: { sortOrder: "asc" } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!table || table.restaurant.status !== "ACTIVE") return null;

  return {
    table: {
      id: table.id,
      name: table.name,
      qrToken: table.qrToken,
    },
    restaurant: {
      id: table.restaurant.id,
      name: table.restaurant.name,
      slug: table.restaurant.slug,
    },
    settings: table.restaurant.settings,
    flowSteps: table.restaurant.flowSteps.map((step) => ({
      id: step.id,
      step: step.slug,
      title: step.title,
      subtitle: step.subtitle,
      categories: step.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        items: cat.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          priceCents: item.priceCents,
          photoUrl: item.photoUrl,
          inStock: item.inStock,
          isFood: item.isFood,
        })),
      })),
    })),
  };
}

export default async function OrderPage({
  params,
}: {
  params: { qrToken: string };
}) {
  const data = await getOrderContext(params.qrToken);
  if (!data) notFound();

  return <CustomerOrderApp data={data} />;
}
