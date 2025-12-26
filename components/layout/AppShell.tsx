// components/layout/AppShell.tsx
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 px-8 py-10 bg-background text-foreground">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

