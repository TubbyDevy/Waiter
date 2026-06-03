"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { formatCents } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { CartItem, FlowStepDto, MenuCategoryDto, MenuItemDto } from "./types";

type Props = {
  step: FlowStepDto;
  stepIndex: number;
  totalSteps: number;
  currency: string;
  cart: CartItem[];
  view: "categories" | "items";
  selectedCategory: MenuCategoryDto | null;
  onSelectCategory: (cat: MenuCategoryDto) => void;
  onBackToCategories: () => void;
  onAddItem: (item: MenuItemDto, notes?: string) => void;
  onUpdateQty: (menuItemId: string, delta: number) => void;
  onSkip: () => void;
  onBackStep: () => void;
};

export function CategoryStep({
  step,
  stepIndex,
  totalSteps,
  currency,
  cart,
  view,
  selectedCategory,
  onSelectCategory,
  onBackToCategories,
  onAddItem,
  onUpdateQty,
  onSkip,
  onBackStep,
}: Props) {
  const categoryEmojis: Record<string, string> = {
    "Soft Drinks": "🥤",
    Beer: "🍺",
    "Hot Drinks": "☕",
    "Water & Juices": "🍊",
    Starters: "🥗",
    Mains: "🍽️",
    Pizza: "🍕",
    Sandwiches: "🥪",
  };

  return (
    <motion.div
      key={`step-${step.id}-${view}`}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="px-4 pb-32 pt-6"
    >
      <div className="mb-6 flex items-center gap-2">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={onBackStep}
            className="touch-target flex items-center justify-center rounded-full bg-stone-100 p-2 text-stone-600"
            aria-label="Previous step"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="flex-1">
          <p className="text-xs font-medium text-brand-600">
            Step {stepIndex + 1} of {totalSteps}
          </p>
          <h2 className="font-display text-2xl text-stone-900">{step.title}</h2>
          {step.subtitle && (
            <p className="text-sm text-stone-500">{step.subtitle}</p>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "categories" && (
          <motion.div
            key="cats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {step.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className="touch-target flex flex-col items-start rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition active:scale-[0.98] hover:border-brand-300"
              >
                <span className="text-3xl">
                  {categoryEmojis[cat.name] ?? "✨"}
                </span>
                <span className="mt-2 font-medium text-stone-900">{cat.name}</span>
                <span className="text-xs text-stone-500">
                  {cat.items.filter((i) => i.inStock).length} available
                </span>
              </button>
            ))}
          </motion.div>
        )}

        {view === "items" && selectedCategory && (
          <motion.div
            key="items"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <button
              type="button"
              onClick={onBackToCategories}
              className="mb-4 flex items-center gap-1 text-sm font-medium text-brand-600"
            >
              <ChevronLeft size={18} /> Back to categories
            </button>
            <h3 className="mb-4 font-display text-xl">{selectedCategory.name}</h3>
            <ul className="space-y-3">
              {selectedCategory.items.map((item) => {
                const inCart = cart.find((c) => c.menuItemId === item.id);
                const disabled = !item.inStock;
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "rounded-2xl border bg-white p-4 transition",
                      disabled
                        ? "border-stone-100 opacity-50"
                        : "border-stone-200 shadow-sm"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-100">
                        {item.photoUrl ? (
                          <Image
                            src={item.photoUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl">
                            🍴
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-stone-900">{item.name}</p>
                        {item.description && (
                          <p className="line-clamp-2 text-xs text-stone-500">
                            {item.description}
                          </p>
                        )}
                        <p className="mt-1 font-medium text-brand-600">
                          {formatCents(item.priceCents, currency)}
                        </p>
                        {disabled && (
                          <p className="text-xs text-stone-400">Out of stock</p>
                        )}
                      </div>
                    </div>
                    {!disabled && (
                      <div className="mt-3 flex items-center justify-end gap-2">
                        {inCart ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.id, -1)}
                              className="touch-target flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-lg"
                            >
                              −
                            </button>
                            <span className="min-w-[2ch] text-center font-medium">
                              {inCart.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.id, 1)}
                              className="touch-target flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-lg text-white"
                            >
                              +
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAddItem(item)}
                            className="rounded-full bg-brand-500 px-5 py-2 text-sm font-medium text-white"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {view === "categories" && (
        <button
          type="button"
          onClick={onSkip}
          className="mt-8 w-full py-3 text-center text-sm font-medium text-stone-500"
        >
          Skip this step
        </button>
      )}
    </motion.div>
  );
}
