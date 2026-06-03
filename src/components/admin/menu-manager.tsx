"use client";

import { useCallback, useEffect, useState } from "react";
import { formatCents, parseEuroToCents } from "@/lib/currency";

type FlowStep = { id: string; step: string; title: string };
type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  photoUrl: string | null;
  inStock: boolean;
  isFood: boolean;
};
type Category = {
  id: string;
  name: string;
  flowStepId: string | null;
  items: MenuItem[];
};

export function MenuManager() {
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catName, setCatName] = useState("");
  const [flowStepId, setFlowStepId] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    price: "",
    description: "",
    isFood: true,
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/menu");
    const data = await res.json();
    setFlowSteps(data.flowSteps ?? []);
    setCategories(data.categories ?? []);
    if (data.flowSteps?.[0] && !flowStepId) {
      setFlowStepId(data.flowSteps[0].id);
    }
  }, [flowStepId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "category",
        name: catName,
        flowStepId: flowStepId || undefined,
      }),
    });
    setCatName("");
    load();
  }

  async function addItem(categoryId: string) {
    await fetch("/api/admin/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "item",
        categoryId,
        name: itemForm.name,
        description: itemForm.description,
        priceCents: parseEuroToCents(itemForm.price),
        isFood: itemForm.isFood,
      }),
    });
    setItemForm({ name: "", price: "", description: "", isFood: true });
    load();
  }

  async function toggleStock(itemId: string, inStock: boolean) {
    await fetch(`/api/admin/menu/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: "item", inStock: !inStock }),
    });
    load();
  }

  async function deleteItem(itemId: string) {
    if (!confirm("Delete item?")) return;
    await fetch(`/api/admin/menu/${itemId}?entity=item`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <form onSubmit={addCategory} className="flex flex-wrap gap-2 rounded-xl border bg-white p-4">
        <input
          value={catName}
          onChange={(e) => setCatName(e.target.value)}
          placeholder="New category name"
          className="rounded-lg border px-3 py-2"
          required
        />
        <select
          value={flowStepId}
          onChange={(e) => setFlowStepId(e.target.value)}
          className="rounded-lg border px-3 py-2"
          aria-label="Ordering step"
        >
          {flowSteps.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <span className="self-center text-xs text-stone-500">Ordering step</span>
        <button type="submit" className="rounded-lg bg-brand-500 px-4 py-2 text-white">
          Add category
        </button>
      </form>

      <div className="mt-8 space-y-6">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-2xl border bg-white p-4">
            <button
              type="button"
              onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
              className="flex w-full items-center justify-between font-display text-xl"
            >
              {cat.name}
              <span className="text-sm text-stone-400">{cat.items.length} items</span>
            </button>

            {expanded === cat.id && (
              <div className="mt-4">
                <ul className="space-y-2">
                  {cat.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2"
                    >
                      <div>
                        <span className={!item.inStock ? "text-stone-400 line-through" : ""}>
                          {item.name}
                        </span>
                        <span className="ml-2 text-brand-600">
                          {formatCents(item.priceCents)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => toggleStock(item.id, item.inStock)}
                          className="text-xs text-stone-600 hover:underline"
                        >
                          {item.inStock ? "Mark out" : "Restock"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 grid gap-2 sm:grid-cols-4">
                  <input
                    placeholder="Item name"
                    value={itemForm.name}
                    onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))}
                    className="rounded border px-2 py-1 text-sm"
                  />
                  <input
                    placeholder="Price (e.g. 12.50)"
                    value={itemForm.price}
                    onChange={(e) => setItemForm((f) => ({ ...f, price: e.target.value }))}
                    className="rounded border px-2 py-1 text-sm"
                  />
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={itemForm.isFood}
                      onChange={(e) =>
                        setItemForm((f) => ({ ...f, isFood: e.target.checked }))
                      }
                    />
                    Food item
                  </label>
                  <button
                    type="button"
                    onClick={() => addItem(cat.id)}
                    className="rounded bg-brand-500 py-1 text-sm text-white"
                  >
                    Add item
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
