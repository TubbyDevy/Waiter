"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";

type TableRow = {
  id: string;
  name: string;
  qrToken: string;
  status: string;
  orderUrl: string;
};

export function TablesManager() {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [name, setName] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/tables");
    const data = await res.json();
    setTables(data.tables ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addTable(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    load();
  }

  async function showQr(orderUrl: string, tableName: string) {
    const url = await QRCode.toDataURL(orderUrl, { width: 280, margin: 2 });
    setQrDataUrl(url);
    setSelectedUrl(`${tableName} — ${orderUrl}`);
  }

  async function removeTable(id: string) {
    if (!confirm("Delete this table?")) return;
    await fetch(`/api/admin/tables/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <form onSubmit={addTable} className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Table name (e.g. Table 6)"
            className="flex-1 rounded-xl border px-4 py-2"
            required
          />
          <button
            type="submit"
            className="rounded-xl bg-brand-500 px-4 py-2 font-medium text-white"
          >
            Add table
          </button>
        </form>

        <ul className="mt-6 space-y-3">
          {tables.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-xl border bg-white p-4"
            >
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-stone-500 capitalize">{t.status.toLowerCase()}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={t.orderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-brand-600 hover:underline"
                >
                  Open
                </a>
                <button
                  type="button"
                  onClick={() => showQr(t.orderUrl, t.name)}
                  className="text-sm text-stone-600 hover:underline"
                >
                  QR
                </button>
                <button
                  type="button"
                  onClick={() => removeTable(t.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border bg-white p-6 text-center">
        <h3 className="font-display text-lg">QR code preview</h3>
        {qrDataUrl ? (
          <>
            <p className="mt-2 text-xs text-stone-500 break-all">{selectedUrl}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR" className="mx-auto mt-4" />
            <a
              href={qrDataUrl}
              download="table-qr.png"
              className="mt-4 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm text-white"
            >
              Download PNG
            </a>
          </>
        ) : (
          <p className="mt-8 text-stone-400">Click QR on a table to preview</p>
        )}
      </div>
    </div>
  );
}
