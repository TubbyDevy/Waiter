import { TablesManager } from "@/components/admin/tables-manager";

export default function AdminTablesPage() {
  return (
    <div>
      <h1 className="font-display text-3xl">Tables & QR codes</h1>
      <p className="mt-2 text-stone-500">Add tables, print QR codes for customers</p>
      <div className="mt-8">
        <TablesManager />
      </div>
    </div>
  );
}
