import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  InventorySummary,
  StockCardBatch,
  StockCardWIP,
  StockCardMovement,
} from '@/lib/types';

async function fetchStockCardData(
  partNumber: string
): Promise<{
  summary: InventorySummary | null;
  batches: StockCardBatch[];
  wip: StockCardWIP[];
  movements: StockCardMovement[];
  error: string | null;
}> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const encodedPartNo = encodeURIComponent(partNumber);

  try {
    // Fetch all data in parallel
    const [summaryRes, batchesRes, wipRes, movementsRes] = await Promise.all([
      fetch(`${baseUrl}/api/inventory/${encodedPartNo}/summary`, {
        cache: 'no-store',
      }),
      fetch(`${baseUrl}/api/inventory/${encodedPartNo}/batches`, {
        cache: 'no-store',
      }),
      fetch(`${baseUrl}/api/inventory/${encodedPartNo}/wip`, {
        cache: 'no-store',
      }),
      fetch(`${baseUrl}/api/inventory/${encodedPartNo}/movements`, {
        cache: 'no-store',
      }),
    ]);

    // Handle summary (404 means part not found)
    let summary: InventorySummary | null = null;
    if (summaryRes.ok) {
      summary = await summaryRes.json();
    } else if (summaryRes.status === 404) {
      return {
        summary: null,
        batches: [],
        wip: [],
        movements: [],
        error: 'Part not found',
      };
    } else {
      // Other errors (500, etc.)
      const errorData = await summaryRes.json().catch(() => ({}));
      return {
        summary: null,
        batches: [],
        wip: [],
        movements: [],
        error: errorData.error || `Failed to fetch summary: ${summaryRes.statusText}`,
      };
    }

    // Handle other endpoints (empty arrays are valid)
    const batches: StockCardBatch[] = batchesRes.ok
      ? await batchesRes.json()
      : [];
    const wip: StockCardWIP[] = wipRes.ok ? await wipRes.json() : [];
    const movements: StockCardMovement[] = movementsRes.ok
      ? await movementsRes.json()
      : [];

    return {
      summary,
      batches: Array.isArray(batches) ? batches : [],
      wip: Array.isArray(wip) ? wip : [],
      movements: Array.isArray(movements) ? movements : [],
      error: null,
    };
  } catch (error: any) {
    console.error('Error fetching stock card data:', error);
    return {
      summary: null,
      batches: [],
      wip: [],
      movements: [],
      error: error.message || 'Failed to fetch stock card data',
    };
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

function getStatusBadgeColor(status: string): string {
  const statusUpper = status.toUpperCase();
  if (statusUpper === 'APPROVED' || statusUpper === 'ACTIVE') {
    return 'bg-green-100 text-green-800';
  }
  if (statusUpper === 'QUARANTINED' || statusUpper === 'PENDING' || statusUpper === 'QUARANTINE') {
    return 'bg-amber-100 text-amber-800';
  }
  if (statusUpper === 'DEPLETED' || statusUpper === 'INACTIVE') {
    return 'bg-gray-100 text-gray-800';
  }
  return 'bg-gray-100 text-gray-800';
}

interface StockCardPageProps {
  params: {
    original_part_no: string;
  };
}

export default async function StockCardPage({
  params,
}: StockCardPageProps) {
  const partNumber = decodeURIComponent(params.original_part_no);
  const { summary, batches, wip, movements, error } =
    await fetchStockCardData(partNumber);

  // Handle part not found
  if (error === 'Part not found' || !summary) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/inventory"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            ← Back to Inventory
          </Link>
        </div>
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-2">Part Not Found</h1>
          <p className="text-muted-foreground">
            No inventory data found for part number: <strong>{partNumber}</strong>
          </p>
        </div>
      </div>
    );
  }

  // Handle other errors
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/inventory"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            ← Back to Inventory
          </Link>
        </div>
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/inventory"
          className="text-blue-600 hover:text-blue-800 hover:underline mb-4 inline-block"
        >
          ← Back to Inventory
        </Link>
        <div className="mt-2">
          <h1 className="text-3xl font-semibold">{summary.product_name}</h1>
          <p className="text-muted-foreground mt-1">
            Part Number: <strong>{summary.part_number}</strong>
            {summary.description && (
              <>
                {' • '}
                {summary.description}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {summary.in_stock.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {summary.unit_of_measure}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quarantine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {summary.quarantine.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {summary.unit_of_measure}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              WIP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {summary.wip.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {summary.unit_of_measure}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {summary.out.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {summary.unit_of_measure}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Withheld
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {summary.withheld.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {summary.unit_of_measure}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Breakdown (FIFO)</CardTitle>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No batches found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Batch No
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Supplier
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Received Date
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Expiry Date
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-semibold">
                      Qty Received
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-semibold">
                      Qty Remaining
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Warehouse
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr
                      key={batch.batch_id}
                      className="border-b border-border/30 hover:bg-muted/30"
                    >
                      <td className="px-4 py-2 font-medium">{batch.batch_code}</td>
                      <td className="px-4 py-2">
                        {batch.supplier_name || '—'}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground">
                        {formatDate(batch.received_at)}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground">
                        {formatDate(batch.expiry_date)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {batch.received_quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {batch.remaining_quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(batch.status)}`}
                        >
                          {batch.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {batch.warehouse_name || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WIP Allocations Table - Only show if WIP rows exist */}
      {wip.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>WIP Allocations (Open Jobs Only)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Job Number
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Job Title
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Customer
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Aircraft Reg
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Batch Code
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-semibold">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-semibold">
                      Unit Cost
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-semibold">
                      Total Cost
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Issued Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {wip.map((item) => (
                    <tr
                      key={item.job_card_part_id}
                      className="border-b border-border/30 hover:bg-muted/30"
                    >
                      <td className="px-4 py-2 font-medium">
                        {item.job_number}
                      </td>
                      <td className="px-4 py-2">{item.job_title}</td>
                      <td className="px-4 py-2">
                        {item.customer_name || '—'}
                      </td>
                      <td className="px-4 py-2">
                        {item.aircraft_reg || '—'}
                      </td>
                      <td className="px-4 py-2">{item.batch_code}</td>
                      <td className="px-4 py-2 text-right">
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {item.unit_cost_local.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {item.total_cost_local.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground">
                        {formatDate(item.issued_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Movements / Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Movements (Latest 20)</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No movements found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Direction
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Batch Code
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Job Number
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-semibold">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-semibold">
                      Unit Cost
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-semibold">
                      Total Cost
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => (
                    <tr
                      key={movement.transaction_id}
                      className="border-b border-border/30 hover:bg-muted/30"
                    >
                      <td className="px-4 py-2 text-sm text-muted-foreground">
                        {formatDate(movement.transaction_date)}
                      </td>
                      <td className="px-4 py-2">{movement.transaction_type}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            movement.direction === 'IN'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {movement.direction}
                        </span>
                      </td>
                      <td className="px-4 py-2">{movement.batch_code}</td>
                      <td className="px-4 py-2">
                        {movement.job_number || '—'}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {movement.quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {movement.unit_cost_local.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {movement.total_cost_local.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(movement.transaction_status)}`}
                        >
                          {movement.transaction_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

