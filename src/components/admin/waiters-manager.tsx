"use client";

import { useCallback, useEffect, useState } from "react";

type Waiter = {
  id: string;
  name: string;
  email: string;
  tableAssignments: { table: { id: string; name: string } }[];
};
type Table = { id: string; name: string };

export function WaitersManager() {
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [form, setForm] = useState({ name: "", email: "", tableIds: [] as string[] });
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editTables, setEditTables] = useState<string[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/waiters");
    const data = await res.json();
    setWaiters(data.waiters ?? []);
    setTables(data.tables ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toggleTable(id: string, list: string[], set: (v: string[]) => void) {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  async function createWaiter(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/waiters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    setNewPassword(data.password);
    setForm({ name: "", email: "", tableIds: [] });
    load();
  }

  async function saveAssignments(waiterId: string) {
    await fetch(`/api/admin/waiters/${waiterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableIds: editTables }),
    });
    setEditing(null);
    load();
  }

  async function removeWaiter(id: string) {
    if (!confirm("Remove waiter?")) return;
    await fetch(`/api/admin/waiters/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      {newPassword && (
        <div className="mb-4 rounded-xl bg-emerald-50 p-4 text-emerald-800">
          Waiter created. Temporary password: <strong>{newPassword}</strong>
          <button type="button" onClick={() => setNewPassword(null)} className="ml-4 underline">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={createWaiter} className="rounded-2xl border bg-white p-4">
        <h3 className="font-medium">New waiter</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="rounded-lg border px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="rounded-lg border px-3 py-2"
            required
          />
        </div>
        <p className="mt-3 text-sm text-stone-500">Assign tables:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {tables.map((t) => (
            <label key={t.id} className="flex items-center gap-1 rounded-lg border px-2 py-1 text-sm">
              <input
                type="checkbox"
                checked={form.tableIds.includes(t.id)}
                onChange={() => toggleTable(t.id, form.tableIds, (v) => setForm((f) => ({ ...f, tableIds: v })))}
              />
              {t.name}
            </label>
          ))}
        </div>
        <button type="submit" className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-white">
          Create waiter
        </button>
      </form>

      <ul className="mt-8 space-y-4">
        {waiters.map((w) => (
          <li key={w.id} className="rounded-xl border bg-white p-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{w.name}</p>
                <p className="text-sm text-stone-500">{w.email}</p>
                <p className="mt-1 text-sm">
                  Tables:{" "}
                  {w.tableAssignments.map((a) => a.table.name).join(", ") || "None"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(w.id);
                    setEditTables(w.tableAssignments.map((a) => a.table.id));
                  }}
                  className="text-sm text-brand-600"
                >
                  Edit tables
                </button>
                <button
                  type="button"
                  onClick={() => removeWaiter(w.id)}
                  className="text-sm text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
            {editing === w.id && (
              <div className="mt-3 border-t pt-3">
                <div className="flex flex-wrap gap-2">
                  {tables.map((t) => (
                    <label key={t.id} className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={editTables.includes(t.id)}
                        onChange={() => toggleTable(t.id, editTables, setEditTables)}
                      />
                      {t.name}
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => saveAssignments(w.id)}
                  className="mt-2 text-sm text-brand-600 underline"
                >
                  Save assignments
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
