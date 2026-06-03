import { FloorView } from "@/components/admin/floor-view";

export const dynamic = "force-dynamic";

export default function AdminFloorPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-stone-900">Live floor</h1>
      <p className="mt-1 text-stone-500">Table status at a glance</p>
      <div className="mt-8">
        <FloorView />
      </div>
    </div>
  );
}
