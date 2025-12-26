export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page could not be found.
      </p>
      <a className="mt-6 inline-block underline" href="/dashboard">Go to dashboard</a>
    </main>
  );
}

