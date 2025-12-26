"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main style={{ maxWidth: 720, margin: "0 auto", padding: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>App crashed</h1>
          <p style={{ marginTop: 8, opacity: 0.8 }}>
            {error?.message || "Unknown error"}
          </p>
          <button
            style={{ marginTop: 16, padding: "8px 12px", border: "1px solid #ccc", borderRadius: 8 }}
            onClick={() => reset()}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}

