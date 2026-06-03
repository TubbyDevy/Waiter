import { LiveOrders } from "@/components/admin/live-orders";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  const restaurantId = session?.user?.restaurantId;
  if (!restaurantId) redirect("/login");

  return (
    <div>
      <h1 className="font-display text-3xl">Live orders</h1>
      <p className="mt-2 text-stone-500">Real-time feed across all tables</p>
      <div className="mt-8">
        <LiveOrders restaurantId={restaurantId} />
      </div>
    </div>
  );
}
