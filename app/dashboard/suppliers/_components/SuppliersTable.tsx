'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface Supplier {
  id: string
  code?: string | null
  name: string
  contactName?: string | null
  email?: string | null
  phone?: string | null
  country?: string | null
  city?: string | null
  isActive: boolean
}

interface SuppliersTableProps {
  suppliers: Supplier[]
  loading?: boolean
  onEdit: (supplier: Supplier) => void
  onDeactivate: (supplier: Supplier) => void
  onReactivate: (supplier: Supplier) => void
}

export function SuppliersTable({
  suppliers,
  loading = false,
  onEdit,
  onDeactivate,
  onReactivate,
}: SuppliersTableProps) {
  const router = useRouter()

  if (suppliers.length === 0) {
    return null // Empty state handled by parent
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200" aria-label="Suppliers list">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Country
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {suppliers.map((supplier) => (
            <tr
              key={supplier.id}
              onDoubleClick={() => router.push(`/dashboard/suppliers/${supplier.id}`)}
              title="Double-click to open supplier card"
              className="hover:bg-gray-50 cursor-default"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {supplier.code || <span className="text-gray-400">—</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {supplier.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {supplier.contactName || <span className="text-gray-400">—</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {supplier.email || <span className="text-gray-400">—</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {supplier.phone || <span className="text-gray-400">—</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {supplier.country || <span className="text-gray-400">—</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {supplier.isActive ? (
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onEdit(supplier)}
                  aria-label={`Edit supplier ${supplier.name}`}
                >
                  Edit
                </Button>
                {supplier.isActive ? (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDeactivate(supplier)}
                    aria-label={`Deactivate supplier ${supplier.name}`}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onReactivate(supplier)}
                    aria-label={`Reactivate supplier ${supplier.name}`}
                  >
                    Reactivate
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

