import { RestaurantsManager } from "@/components/super-admin/restaurants-manager";

export const dynamic = "force-dynamic";

export default function SuperAdminPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-stone-900">Restaurants</h1>
      <p className="mt-1 text-stone-500">
        Create venues, manage subscriptions, suspend accounts
      </p>
      <div className="mt-8">
        <RestaurantsManager />
      </div>
    </div>
  );
}
