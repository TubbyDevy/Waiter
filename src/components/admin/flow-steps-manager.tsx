"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

type FlowStep = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  sortOrder: number;
  _count?: { categories: number };
};

export function FlowStepsManager() {
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/flow-steps");
    const data = await res.json();
    setSteps(data.flowSteps ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addStep(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/flow-steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle: subtitle || undefined }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Failed");
      return;
    }
    setTitle("");
    setSubtitle("");
    load();
  }

  async function saveEdit(id: string) {
    await fetch(`/api/admin/flow-steps/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        subtitle: editSubtitle || null,
      }),
    });
    setEditingId(null);
    load();
  }

  async function removeStep(id: string) {
    if (!confirm("Remove this ordering step?")) return;
    const res = await fetch(`/api/admin/flow-steps/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Cannot delete");
      return;
    }
    load();
  }

  async function moveStep(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= steps.length) return;
    const orderedIds = [...steps];
    const [removed] = orderedIds.splice(index, 1);
    orderedIds.splice(next, 0, removed);
    await fetch("/api/admin/flow-steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reorder",
        orderedIds: orderedIds.map((s) => s.id),
      }),
    });
    load();
  }

  return (
    <section className="rounded-2xl border border-brand-200 bg-brand-50/50 p-6">
      <h2 className="font-display text-xl text-stone-900">
        Customer ordering steps
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        These are the main sections customers see one at a time — e.g. Drinks,
        Food, Other. Under each step you add menu categories (Beer, Pizza…)
        below.
      </p>

      <ol className="mt-6 space-y-3">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className="flex flex-wrap items-start gap-3 rounded-xl border border-stone-200 bg-white p-4"
          >
            <GripVertical className="mt-1 h-5 w-5 shrink-0 text-stone-300" />
            <div className="min-w-0 flex-1">
              {editingId === step.id ? (
                <div className="space-y-2">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="Question shown to customer"
                  />
                  <input
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="Subtitle (optional)"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(step.id)}
                      className="text-sm font-medium text-brand-600"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-sm text-stone-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-medium text-stone-900">{step.title}</p>
                  {step.subtitle && (
                    <p className="text-sm text-stone-500">{step.subtitle}</p>
                  )}
                  <p className="mt-1 text-xs text-stone-400">
                    {step._count?.categories ?? 0} categories · id: {step.slug}
                  </p>
                </>
              )}
            </div>
            {editingId !== step.id && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveStep(index, -1)}
                  disabled={index === 0}
                  className="rounded p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUp size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(index, 1)}
                  disabled={index === steps.length - 1}
                  className="rounded p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(step.id);
                    setEditTitle(step.title);
                    setEditSubtitle(step.subtitle ?? "");
                  }}
                  className="ml-2 text-sm text-brand-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeStep(step.id)}
                  className="ml-2 text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>

      <form onSubmit={addStep} className="mt-6 space-y-2 border-t border-brand-200 pt-6">
        <p className="text-sm font-medium text-stone-700">Add a new step</p>
        <div className="flex flex-wrap gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g. "Other" or "Starters"'
            className="min-w-[200px] flex-1 rounded-lg border px-3 py-2"
            required
          />
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtitle (optional)"
            className="min-w-[200px] flex-1 rounded-lg border px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 font-medium text-white"
          >
            Add step
          </button>
        </div>
        <p className="text-xs text-stone-500">
          Examples: Drinks, Food, Desserts, Other, Hookah, Sides
        </p>
      </form>
    </section>
  );
}
