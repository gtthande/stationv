// app/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InventoryLine from '@/components/charts/InventoryLine';
import InventoryPie from '@/components/charts/InventoryPie';
import SummaryCard from '@/components/dashboard/SummaryCard';

// Dummy status data for each module
const inventoryStatus = [
  { name: 'In Stock', value: 900 },
  { name: 'Out', value: 150 },
  { name: 'Quarantine', value: 50 },
  { name: 'WIP', value: 70 },
  { name: 'Withheld', value: 30 },
];

const inventoryMetrics = [
  { label: 'Total', value: 1200 },
  { label: 'In Stock', value: 900 },
  { label: 'Out', value: 150 },
  { label: 'Withheld', value: 150 },
];

const jobCardStatus = [
  { name: 'Draft', value: 3 },
  { name: 'Approved', value: 5 },
  { name: 'In Process', value: 2 },
  { name: 'Closed', value: 1 },
];

const rotablesStatus = [
  { name: 'Available', value: 10 },
  { name: 'In Repair', value: 4 },
  { name: 'Out', value: 2 },
];

const toolsStatus = [
  { name: 'Available', value: 20 },
  { name: 'Borrowed', value: 5 },
  { name: 'Maintenance', value: 3 },
  { name: 'Lost', value: 1 },
];

export default function DashboardPage() {
  // Dummy KPI metrics
  const metrics = [
    { title: 'Total Items', value: 1200 },
    { title: 'In Stock', value: 900 },
    { title: 'Out', value: 150 },
    { title: 'Withheld', value: 150 },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground text-base">
          Here's an overview of your inventory and stock movements.
        </p>
      </div>

      {/* KPI cards */}
      <div>
        <h2 className="text-2xl font-semibold mb-8 text-foreground/80">Overview</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-4xl font-semibold tracking-tight text-foreground">{metric.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Module Summary Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-foreground/80">Module Summary</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Inventory"
            description="Track stock & batches"
            data={inventoryStatus}
            chartType="pie"
            href="/dashboard/inventory"
            metrics={inventoryMetrics}
          />
          <SummaryCard
            title="Job Cards"
            description="Monitor job orders"
            data={jobCardStatus}
            chartType="pie"
            href="/dashboard/job-cards"
          />
          <SummaryCard
            title="Rotables"
            description="Manage serialised parts"
            data={rotablesStatus}
            chartType="pie"
            href="/dashboard/rotables"
          />
          <SummaryCard
            title="Tools"
            description="Monitor tool inventory"
            data={toolsStatus}
            chartType="pie"
            href="/dashboard/tools"
          />
        </div>
      </section>

      {/* Charts */}
      <div>
        <h2 className="text-2xl font-semibold mb-8 text-foreground/80">Analytics</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground/90">Stock Movement</CardTitle>
            </CardHeader>
            <CardContent>
              <InventoryLine />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground/90">Inventory Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <InventoryPie />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

