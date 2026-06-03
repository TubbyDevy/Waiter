import { AdminSidebar } from "@/components/layouts/admin-sidebar";

export const dynamic = "force-dynamic";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const nav = [
  { href: "/admin", label: "Floor view" },
  { href: "/admin/tables", label: "Tables & QR" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/waiters", label: "Waiters" },
  { href: "/admin/orders", label: "Live orders" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function RestaurantAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminSidebar
        title={session?.user?.restaurantName ?? "Restaurant Admin"}
        subtitle={session?.user?.email ?? undefined}
        nav={nav}
      />
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
