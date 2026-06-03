import { FlowStepsManager } from "@/components/admin/flow-steps-manager";
import { MenuManager } from "@/components/admin/menu-manager";

export default function AdminMenuPage() {
  return (
    <div>
      <h1 className="font-display text-3xl">Menu manager</h1>
      <p className="mt-2 text-stone-500">
        Define ordering steps (Drinks, Food, Other…), then categories and items
      </p>
      <div className="mt-8 space-y-10">
        <FlowStepsManager />
        <div>
          <h2 className="font-display text-xl text-stone-900">
            Categories & items
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Group dishes under each step — e.g. Beer under Drinks
          </p>
          <div className="mt-6">
            <MenuManager />
          </div>
        </div>
      </div>
    </div>
  );
}
