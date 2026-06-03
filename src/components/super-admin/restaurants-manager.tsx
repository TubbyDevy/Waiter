"use client";

import { useCallback, useEffect, useState } from "react";

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  subscriptionStatus: string;
  joinDate: string;
  _count: { orders: number; tables: number; users: number };
  users: { email: string; name: string }[];
};

export function RestaurantsManager() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    adminEmail: "",
    adminName: "",
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/super-admin/restaurants");
    const data = await res.json();
    setRestaurants(data.restaurants ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/super-admin/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Failed");
      return;
    }
    setCredentials(data.credentials);
    setShowForm(false);
    setForm({ name: "", slug: "", adminEmail: "", adminName: "" });
    load();
  }

  async function toggleStatus(id: string, status: "ACTIVE" | "SUSPENDED") {
    await fetch(`/api/super-admin/restaurants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name} and all data? This cannot be undone.`)) return;
    await fetch(`/api/super-admin/restaurants/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) {
    return <p className="text-stone-500">Loading restaurants…</p>;
  }

  return (
    <div>
      {credentials && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-medium text-emerald-800">Restaurant created — save these credentials:</p>
          <p className="mt-2 font-mono text-sm">
            Email: {credentials.email}
            <br />
            Password: {credentials.password}
          </p>
          <button
            type="button"
            onClick={() => setCredentials(null)}
            className="mt-3 text-sm text-emerald-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div />
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          {showForm ? "Cancel" : "+ New restaurant"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-6 grid gap-4 rounded-2xl border border-stone-200 bg-white p-6 sm:grid-cols-2"
        >
          <input
            placeholder="Restaurant name"
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                name: e.target.value,
                slug: f.slug || e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
              }))
            }
            className="rounded-lg border px-3 py-2"
            required
          />
          <input
            placeholder="Slug (url-safe)"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="rounded-lg border px-3 py-2"
            required
          />
          <input
            placeholder="Admin name"
            value={form.adminName}
            onChange={(e) => setForm((f) => ({ ...f, adminName: e.target.value }))}
            className="rounded-lg border px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder="Admin email"
            value={form.adminEmail}
            onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))}
            className="rounded-lg border px-3 py-2"
            required
          />
          <button
            type="submit"
            className="sm:col-span-2 rounded-xl bg-brand-500 py-2 font-medium text-white"
          >
            Create & provision environment
          </button>
        </form>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-stone-50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Subscription</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r) => (
              <tr key={r.id} className="border-b border-stone-50">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-stone-600">
                  {r.users[0]?.email ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      r.status === "ACTIVE"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">{r.subscriptionStatus}</td>
                <td className="px-4 py-3">{r._count.orders}</td>
                <td className="px-4 py-3">
                  {new Date(r.joinDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {r.status === "ACTIVE" ? (
                      <button
                        type="button"
                        onClick={() => toggleStatus(r.id, "SUSPENDED")}
                        className="text-amber-600 hover:underline"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleStatus(r.id, "ACTIVE")}
                        className="text-emerald-600 hover:underline"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, r.name)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
