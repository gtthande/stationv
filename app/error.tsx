"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {error?.message || "Unknown error"}
      </p>
      <button
        className="mt-6 rounded-md border px-3 py-2 text-sm"
        onClick={() => reset()}
      >
        Try again
      </button>
    </main>
  );
}

