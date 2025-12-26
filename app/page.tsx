import Link from 'next/link';

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Station‑2100</h1>
      <p className="mt-2 text-gray-600">
        Welcome to your aviation maintenance & inventory hub.  Use the navigation
        in the dashboard after logging in to access all modules.
      </p>
      <Link href="/dashboard" className="mt-6 inline-block underline">
        Go to dashboard
      </Link>
    </main>
  );
}