import Link from 'next/link';
import { InventoryListItem } from '@/lib/types';

async function fetchInventoryList(): Promise<InventoryListItem[]> {
  try {
    // Construct base URL for Server Component fetch
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    const res = await fetch(`${baseUrl}/api/inventory`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('API Error Response:', {
        status: res.status,
        statusText: res.statusText,
        error: errorData
      });
      throw new Error(`Failed to fetch inventory: ${res.statusText} - ${errorData.message || ''}`);
    }

    const data = await res.json();
    console.log('Inventory API returned:', Array.isArray(data) ? `${data.length} items` : 'non-array response');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching inventory list:', error);
    return [];
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

export default async function InventoryPage() {
  const inventory = await fetchInventoryList();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">Inventory</h1>
        <p className="text-muted-foreground mt-1">
          View and manage inventory items and stock levels
        </p>
      </div>

      {/* Inventory Table */}
      {inventory.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No inventory items found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-card border border-border/30 rounded-lg">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold border-b border-border/30">
                  Part Number
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold border-b border-border/30">
                  Product Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold border-b border-border/30">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold border-b border-border/30">
                  UOM
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold border-b border-border/30">
                  In Stock
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold border-b border-border/30">
                  Quarantine
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold border-b border-border/30">
                  WIP
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold border-b border-border/30">
                  Out
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold border-b border-border/30">
                  Withheld
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold border-b border-border/30">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold border-b border-border/30">
                  Batches
                </th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr
                  key={item.product_id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 border-b border-border/30">
                    <Link
                      href={`/dashboard/inventory/${encodeURIComponent(item.part_number)}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {item.part_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 border-b border-border/30 font-medium">
                    {item.product_name}
                  </td>
                  <td className="px-4 py-3 border-b border-border/30 text-sm text-muted-foreground">
                    {item.description || <span className="text-muted-foreground/50">—</span>}
                  </td>
                  <td className="px-4 py-3 border-b border-border/30 text-sm">
                    {item.unit_of_measure}
                  </td>
                  <td className="px-4 py-3 border-b border-border/30 text-right">
                    {item.in_stock.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border-b border-border/30 text-right">
                    {item.quarantine.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border-b border-border/30 text-right">
                    {item.wip.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border-b border-border/30 text-right">
                    {item.out.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border-b border-border/30 text-right">
                    {item.withheld.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border-b border-border/30 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-border/30 text-center">
                    {item.batch_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

