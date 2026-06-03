import { AdminSidebar } from "@/components/layouts/admin-sidebar";

const nav = [
  { href: "/super-admin", label: "Restaurants" },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50">
      <AdminSidebar title="Platform Admin" nav={nav} />
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
