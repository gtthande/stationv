'use client'
import React from 'react'
import { Button } from '@/components/ui/Button'

interface Supplier {
  id: bigint | string
  code?: string | null
  name: string
  contactName?: string | null
  email?: string | null
  phone?: string | null
  country?: string | null
  city?: string | null
  address?: string | null
  notes?: string | null
  isActive: boolean
}

interface SupplierTableProps {
  suppliers: Supplier[]
  onEdit: (supplier: Supplier) => void
  onDelete: (supplier: Supplier) => void
}

export function SupplierTable({ suppliers, onEdit, onDelete }: SupplierTableProps) {
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : []
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border" aria-label="Suppliers list">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b text-left">Code</th>
            <th className="px-4 py-2 border-b text-left">Name</th>
            <th className="px-4 py-2 border-b text-left">Contact</th>
            <th className="px-4 py-2 border-b text-left">Email</th>
            <th className="px-4 py-2 border-b text-left">Phone</th>
            <th className="px-4 py-2 border-b text-left">Location</th>
            <th className="px-4 py-2 border-b text-center">Active</th>
            <th className="px-4 py-2 border-b text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {safeSuppliers.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                No suppliers found
              </td>
            </tr>
          ) : (
            safeSuppliers.map((supplier) => (
              <tr key={String(supplier.id)} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">
                  {supplier.code || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-2 border-b font-medium">{supplier.name}</td>
                <td className="px-4 py-2 border-b">
                  {supplier.contactName || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-2 border-b">
                  {supplier.email || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-2 border-b">
                  {supplier.phone || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-2 border-b">
                  {supplier.city && supplier.country
                    ? `${supplier.city}, ${supplier.country}`
                    : supplier.city || supplier.country || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  {supplier.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-2 border-b text-right space-x-2">
                  <Button size="sm" onClick={() => onEdit(supplier)} aria-label={`Edit supplier ${supplier.name}`}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete(supplier)} aria-label={`Delete supplier ${supplier.name}`}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

