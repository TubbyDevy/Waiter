export default function OrderNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-3xl text-stone-900">Table not found</h1>
      <p className="mt-2 text-stone-500">
        This QR code may be invalid or the venue is unavailable.
      </p>
    </main>
  );
}
