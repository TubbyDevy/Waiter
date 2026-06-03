import { WaitersManager } from "@/components/admin/waiters-manager";

export default function AdminWaitersPage() {
  return (
    <div>
      <h1 className="font-display text-3xl">Waiters</h1>
      <p className="mt-2 text-stone-500">Staff accounts and table assignments</p>
      <div className="mt-8">
        <WaitersManager />
      </div>
    </div>
  );
}
