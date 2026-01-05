'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SupplierForm } from '@/app/dashboard/suppliers/_components/SupplierForm'
import { SupplierTabs } from './SupplierTabs'
import { useToast } from '@/components/ui/Toast'

interface Supplier {
  id: string
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
  createdAt?: string
  updatedAt?: string
}

interface SupplierCardProps {
  supplier: Supplier
  onBack: () => void
  onSaved: () => void
}

export function SupplierCard({ supplier, onBack, onSaved }: SupplierCardProps) {
  const { showToast } = useToast()
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [activeTab, setActiveTab] = useState<'general' | 'contacts' | 'notes' | 'activity'>('general')

  const handleSave = async (data: any) => {
    try {
      const res = await fetch(`/api/suppliers/${supplier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to update supplier')
      }

      setMode('view')
      onSaved()
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to update supplier', 'error')
    }
  }

  const handleCancel = () => {
    setMode('view')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
              aria-label="Back to suppliers"
            >
              ←
            </button>
            <h1 className="text-3xl font-semibold">{supplier.name}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            {supplier.code && (
              <span className="px-2 py-1 bg-gray-100 rounded">Code: {supplier.code}</span>
            )}
            {supplier.isActive ? (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Active</span>
            ) : (
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded">Inactive</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {mode === 'view' && (
            <Button onClick={() => setMode('edit')}>Edit</Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <SupplierTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Body */}
      <div className="bg-white border rounded-lg p-6">
        {activeTab === 'general' && (
          <SupplierForm
            supplier={supplier}
            mode={mode}
            onSubmit={handleSave}
            onCancel={handleCancel}
            disableSubmit={mode === 'view'}
          />
        )}
        {activeTab === 'contacts' && (
          <div className="text-gray-500">Contacts tab - Coming soon</div>
        )}
        {activeTab === 'notes' && (
          <div className="text-gray-500">Notes tab - Coming soon</div>
        )}
        {activeTab === 'activity' && (
          <div className="text-gray-500">Activity tab - Coming soon</div>
        )}
      </div>
    </div>
  )
}

