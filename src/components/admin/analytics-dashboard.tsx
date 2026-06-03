"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCents } from "@/lib/currency";

type Analytics = {
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  topItems: { name: string; count: number }[];
  hourCounts: { hour: string; orders: number }[];
  avgOrderValueCents: number;
  totalOrdersWeek: number;
  revenueWeekCents: number;
};

export function AnalyticsDashboard() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => setData(d));
  }, []);

  if (!data) return <p className="text-stone-500">Loading analytics…</p>;

  const revenueChart = data.dailyRevenue.map((d) => ({
    ...d,
    revenueEuro: d.revenue / 100,
  }));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6">
          <p className="text-sm text-stone-500">Week revenue</p>
          <p className="font-display text-3xl text-brand-600">
            {formatCents(data.revenueWeekCents)}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-6">
          <p className="text-sm text-stone-500">Orders this week</p>
          <p className="font-display text-3xl">{data.totalOrdersWeek}</p>
        </div>
        <div className="rounded-2xl border bg-white p-6">
          <p className="text-sm text-stone-500">Avg order today</p>
          <p className="font-display text-3xl">
            {formatCents(data.avgOrderValueCents)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <h3 className="font-display text-lg">Daily revenue</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`€${v.toFixed(2)}`, "Revenue"]} />
              <Bar dataKey="revenueEuro" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6">
          <h3 className="font-display text-lg">Best sellers</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topItems} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Bar dataKey="count" fill="#ea580c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h3 className="font-display text-lg">Peak hours</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourCounts.filter((h) => h.orders > 0 || parseInt(h.hour) >= 8 && parseInt(h.hour) <= 23)}>
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                <YAxis />
                <Bar dataKey="orders">
                  {data.hourCounts.map((_, i) => (
                    <Cell key={i} fill={`hsl(24, ${50 + (i % 5) * 10}%, ${45 + (i % 3) * 8}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
