import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl">Analytics</h1>
      <p className="mt-2 text-stone-500">Revenue, bestsellers, and peak hours</p>
      <div className="mt-8">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
