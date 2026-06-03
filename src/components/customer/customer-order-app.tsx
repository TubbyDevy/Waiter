"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import { CategoryStep } from "./category-step";
import { FloatingCartBar } from "./floating-cart-bar";
import { OrderSummary } from "./order-summary";
import { OrderTracker } from "./order-tracker";
import type {
  CartItem,
  CustomerPhase,
  MenuItemDto,
  OrderContextData,
} from "./types";
import { WelcomeScreen } from "./welcome-screen";
import { useOrderRealtime } from "@/hooks/use-order-realtime";
import type { Order, OrderItem } from "@prisma/client";

type Props = {
  data: OrderContextData;
};

export function CustomerOrderApp({ data }: Props) {
  const [phase, setPhase] = useState<CustomerPhase>("welcome");
  const [flowIndex, setFlowIndex] = useState(0);
  const [view, setView] = useState<"categories" | "items">("categories");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [activeOrder, setActiveOrder] = useState<
    (Order & { items: OrderItem[] }) | null
  >(null);
  const [placing, setPlacing] = useState(false);

  const currency = data.settings?.currency ?? "EUR";
  const flowSteps = data.flowSteps;
  const currentStep = flowSteps[flowIndex];
  const selectedCategory =
    currentStep?.categories.find((c) => c.id === selectedCategoryId) ?? null;

  const trackedOrder = useOrderRealtime(
    data.table.id,
    activeOrder?.id ?? null,
    data.table.qrToken,
    activeOrder
  );

  const addItem = useCallback((item: MenuItemDto) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          priceCents: item.priceCents,
          quantity: 1,
          isFood: item.isFood,
        },
      ];
    });
  }, []);

  const updateQty = useCallback((menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menuItemId === menuItemId
            ? { ...c, quantity: c.quantity + delta }
            : c
        )
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const goNextFlowStep = () => {
    setView("categories");
    setSelectedCategoryId(null);
    if (flowIndex < flowSteps.length - 1) {
      setFlowIndex((i) => i + 1);
    } else {
      setPhase("summary");
    }
  };

  const placeOrder = async (paymentMethod: "CARD" | "CASH") => {
    setPlacing(true);
    try {
      const res = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: data.table.id,
          qrToken: data.table.qrToken,
          sessionId,
          paymentMethod,
          items: cart.map((c) => ({
            menuItemId: c.menuItemId,
            quantity: c.quantity,
            notes: c.notes,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");

      setSessionId(json.sessionId);
      setActiveOrder(json.order);
      setCart([]);
      setPhase("tracker");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  const startNewOrder = () => {
    setActiveOrder(null);
    setPhase("welcome");
    setFlowIndex(0);
    setView("categories");
    setSelectedCategoryId(null);
  };

  if (phase === "tracker" && (trackedOrder || activeOrder)) {
    const order = trackedOrder ?? activeOrder!;
    return (
      <OrderTracker
        order={order}
        restaurantName={data.restaurant.name}
        currency={currency}
        onNewOrder={startNewOrder}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/80 to-stone-50">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/80 px-4 py-3 backdrop-blur-md">
        <p className="text-center font-display text-lg text-stone-900">
          {data.restaurant.name}
        </p>
        <p className="text-center text-xs text-stone-500">{data.table.name}</p>
      </header>

      <AnimatePresence mode="wait">
        {phase === "welcome" && (
          <WelcomeScreen
            restaurantName={data.restaurant.name}
            tableName={data.table.name}
            onStart={() => setPhase("flow")}
          />
        )}

        {phase === "flow" && currentStep && (
          <CategoryStep
            step={currentStep}
            stepIndex={flowIndex}
            totalSteps={flowSteps.length}
            currency={currency}
            cart={cart}
            view={view}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategoryId(cat.id);
              setView("items");
            }}
            onBackToCategories={() => {
              setView("categories");
              setSelectedCategoryId(null);
            }}
            onAddItem={addItem}
            onUpdateQty={updateQty}
            onSkip={goNextFlowStep}
            onBackStep={() => {
              if (view === "items") {
                setView("categories");
                setSelectedCategoryId(null);
              } else if (flowIndex > 0) {
                setFlowIndex((i) => i - 1);
              } else {
                setPhase("welcome");
              }
            }}
          />
        )}

        {phase === "summary" && (
          <OrderSummary
            data={data}
            cart={cart}
            onBack={() => {
              setPhase("flow");
              setFlowIndex(Math.max(0, flowSteps.length - 1));
            }}
            onPlaceOrder={placeOrder}
            placing={placing}
          />
        )}
      </AnimatePresence>

      <FloatingCartBar
        items={cart}
        currency={currency}
        visible={phase === "flow" && cart.length > 0}
        onConfirm={() => setPhase("summary")}
      />
    </div>
  );
}
