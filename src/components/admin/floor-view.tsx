"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Table = {
  id: string;
  name: string;
  status: string;
  orderUrl: string;
};

const statusColors: Record<string, string> = {
  EMPTY: "bg-stone-200",
  ORDERING: "bg-amber-400",
  WAITING: "bg-orange-500",
  SERVED: "bg-emerald-500",
};

export function FloorView() {
  const [tables, setTables] = useState<Table[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/tables");
    const data = await res.json();
    setTables(data.tables ?? []);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-stone-500">Updates every few seconds</p>
        <Link href="/admin/orders" className="text-sm text-brand-600 hover:underline">
          View live orders →
        </Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">{table.name}</h2>
              <span
                className={cn(
                  "h-3 w-3 rounded-full",
                  statusColors[table.status] ?? "bg-stone-300"
                )}
              />
            </div>
            <p className="mt-2 text-sm capitalize text-stone-500">
              {table.status.toLowerCase()}
            </p>
            <a
              href={table.orderUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs text-brand-600 hover:underline"
            >
              Customer link
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
