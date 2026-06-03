export function formatCents(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function parseEuroToCents(value: string): number {
  const parsed = parseFloat(value.replace(",", "."));
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}
