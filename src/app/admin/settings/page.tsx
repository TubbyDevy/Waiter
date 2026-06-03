import { SettingsForm } from "@/components/admin/settings-form";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl">Settings</h1>
      <p className="mt-2 text-stone-500">Minimum order rules for customers</p>
      <div className="mt-8">
        <SettingsForm />
      </div>
    </div>
  );
}
