export type MenuItemDto = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  photoUrl: string | null;
  inStock: boolean;
  isFood: boolean;
};

export type MenuCategoryDto = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  items: MenuItemDto[];
};

export type FlowStepDto = {
  id: string;
  step: string;
  title: string;
  subtitle: string | null;
  categories: MenuCategoryDto[];
};

export type OrderContextData = {
  table: { id: string; name: string; qrToken: string };
  restaurant: { id: string; name: string; slug: string };
  settings: {
    minOrderAmountCents: number | null;
    requireFoodItem: boolean;
    currency: string;
  } | null;
  flowSteps: FlowStepDto[];
};

export type CartItem = {
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
  isFood: boolean;
  notes?: string;
};

export type CustomerPhase =
  | "welcome"
  | "flow"
  | "summary"
  | "tracker";
