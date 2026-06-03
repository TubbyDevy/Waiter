import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  let staffHref = "/login";
  if (session?.user?.role === "SUPER_ADMIN") staffHref = "/super-admin";
  else if (session?.user?.role === "RESTAURANT_ADMIN") staffHref = "/admin";
  else if (session?.user?.role === "WAITER") staffHref = "/waiter";

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-orange-50">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-600">
          TableFlow
        </p>
        <h1 className="mt-4 font-display text-5xl text-stone-900 md:text-6xl">
          QR ordering that feels like a conversation
        </h1>
        <p className="mt-6 max-w-xl text-lg text-stone-600">
          Multi-tenant platform for restaurants. Scan, order, track — no app
          download required.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href={staffHref}
            className="rounded-full bg-brand-500 px-8 py-3 font-medium text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
          >
            {session ? "Go to dashboard" : "Staff login"}
          </Link>
          <Link
            href="/order/demo-table-1"
            className="rounded-full border-2 border-brand-500 px-8 py-3 font-medium text-brand-600 transition hover:bg-brand-50"
          >
            Demo customer order
          </Link>
        </div>
        <div className="mt-16 grid w-full gap-4 text-left sm:grid-cols-3">
          {[
            {
              title: "Super Admin",
              href: "/super-admin",
              desc: "Manage all restaurants",
              role: "Platform owner",
            },
            {
              title: "Restaurant Admin",
              href: "/admin",
              desc: "Floor, menu, analytics",
              role: "Venue manager",
            },
            {
              title: "Waiter",
              href: "/waiter",
              desc: "Mobile order dashboard",
              role: "Floor staff",
            },
          ].map((portal) => (
            <Link
              key={portal.href}
              href={portal.href}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-brand-300 hover:shadow-md"
            >
              <p className="text-xs font-medium uppercase text-brand-600">
                {portal.role}
              </p>
              <h2 className="mt-1 font-display text-xl text-stone-900">
                {portal.title}
              </h2>
              <p className="mt-2 text-sm text-stone-500">{portal.desc}</p>
            </Link>
          ))}
        </div>
        <p className="mt-12 max-w-lg text-sm text-stone-500">
          Demo logins after{" "}
          <code className="rounded bg-stone-100 px-1">npm run db:seed</code>:
          admin@tableflow.app, admin@demobistro.com, waiter@demobistro.com
        </p>
      </div>
    </main>
  );
}
