"use client";

import { useEffect, useState } from "react";

export function SettingsForm() {
  const [minEuro, setMinEuro] = useState("");
  const [requireFood, setRequireFood] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings;
        if (s?.minOrderAmountCents != null) {
          setMinEuro((s.minOrderAmountCents / 100).toFixed(2));
        }
        setRequireFood(s?.requireFoodItem ?? false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const minOrderAmountCents = minEuro
      ? Math.round(parseFloat(minEuro.replace(",", ".")) * 100)
      : null;
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        minOrderAmountCents,
        requireFoodItem: requireFood,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSave} className="max-w-md rounded-2xl border bg-white p-6">
      <h3 className="font-display text-lg">Minimum order rules</h3>
      <label className="mt-4 block text-sm">
        Minimum spend (€, leave empty for none)
        <input
          value={minEuro}
          onChange={(e) => setMinEuro(e.target.value)}
          placeholder="e.g. 15.00"
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={requireFood}
          onChange={(e) => setRequireFood(e.target.checked)}
        />
        Customer must order at least one food item
      </label>
      <button
        type="submit"
        className="mt-6 rounded-xl bg-brand-500 px-6 py-2 font-medium text-white"
      >
        Save settings
      </button>
      {saved && <p className="mt-2 text-sm text-emerald-600">Saved!</p>}
    </form>
  );
}
