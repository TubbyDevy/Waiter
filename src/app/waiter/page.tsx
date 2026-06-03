import { WaiterDashboard } from "@/components/waiter/waiter-dashboard";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WaiterPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.restaurantId) {
    redirect("/login");
  }

  return (
    <WaiterDashboard
      waiterName={session.user.name}
      restaurantId={session.user.restaurantId}
    />
  );
}
