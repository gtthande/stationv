'use client'

import React, { useEffect, useState } from 'react'
import { SuppliersTable } from './_components/SuppliersTable'
import { SupplierForm } from './_components/SupplierForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'

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
}

interface PaginationInfo {
  total: number
  take: number
  skip: number
  hasMore: boolean
}

export default function SuppliersPage() {
  const { showToast } = useToast()

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(true)

  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    take: 50,
    skip: 0,
    hasMore: false,
  })

  // Modals / dialogs
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [confirmDeactivate, setConfirmDeactivate] = useState<Supplier | null>(null)
  const [confirmReactivate, setConfirmReactivate] = useState<Supplier | null>(null)

  // ---------------------------
  // Fetch suppliers (SINGLE SOURCE)
  // ---------------------------
  const fetchSuppliers = async () => {
    try {
      setError(null)
      setLoading(true)

      const params = new URLSearchParams()
      params.append('is_active', showActiveOnly.toString())
      params.append('take', pagination.take.toString())
      params.append('skip', pagination.skip.toString())

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      const res = await fetch(`/api/suppliers?${params.toString()}`)
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to load suppliers')
      }

      setSuppliers(json.data ?? [])
      setPagination(json.pagination ?? pagination)
    } catch (err: any) {
      console.error('Failed to fetch suppliers:', err)
      setError(err.message || 'Failed to load suppliers')
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchSuppliers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce search / active toggle (reset to first page)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, skip: 0 }))
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, showActiveOnly])

  // Refetch when pagination changes
  useEffect(() => {
    fetchSuppliers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.skip])

  // ---------------------------
  // CRUD handlers
  // ---------------------------
  const handleCreateSupplier = async (data: any) => {
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to create supplier')
      }

      showToast('Supplier created successfully', 'success')
      setShowCreateModal(false)
      fetchSuppliers()
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to create supplier', 'error')
    }
  }

  const handleUpdateSupplier = async (data: any) => {
    if (!editingSupplier) return

    try {
      const res = await fetch(`/api/suppliers/${editingSupplier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to update supplier')
      }

      showToast('Supplier updated successfully', 'success')
      setEditingSupplier(null)
      fetchSuppliers()
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to update supplier', 'error')
    }
  }

  const handleDeactivateSupplier = async () => {
    if (!confirmDeactivate) return

    try {
      const res = await fetch(`/api/suppliers/${confirmDeactivate.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to deactivate supplier')
      }

      showToast('Supplier deactivated', 'success')
      fetchSuppliers()
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to deactivate supplier', 'error')
    } finally {
      setConfirmDeactivate(null)
    }
  }

  const handleReactivateSupplier = async () => {
    if (!confirmReactivate) return

    try {
      const res = await fetch(`/api/suppliers/${confirmReactivate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to reactivate supplier')
      }

      showToast('Supplier reactivated', 'success')
      fetchSuppliers()
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to reactivate supplier', 'error')
    } finally {
      setConfirmReactivate(null)
    }
  }

  const handlePageChange = (newSkip: number) => {
    setPagination((prev) => ({ ...prev, skip: newSkip }))
  }

  // ---------------------------
  // Render
  // ---------------------------
  if (loading && suppliers.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your supplier contacts and information
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>+ Add Supplier</Button>
      </div>

      {/* Search / Filter */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Input
            label="Search"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 pb-2">
          <input
            type="checkbox"
            checked={showActiveOnly}
            onChange={(e) => setShowActiveOnly(e.target.checked)}
          />
          <span className="text-sm">Active only</span>
        </label>
      </div>

      {error && (
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      <SuppliersTable
        suppliers={suppliers}
        onEdit={setEditingSupplier}
        onDeactivate={setConfirmDeactivate}
        onReactivate={setConfirmReactivate}
      />

      {pagination.total > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {pagination.skip + 1}–
            {Math.min(pagination.skip + pagination.take, pagination.total)} of{' '}
            {pagination.total}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.skip === 0}
              onClick={() =>
                handlePageChange(Math.max(0, pagination.skip - pagination.take))
              }
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!pagination.hasMore}
              onClick={() =>
                handlePageChange(pagination.skip + pagination.take)
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {!loading && suppliers.length === 0 && !error && (
        <div className="text-center py-12 text-muted-foreground">
          {searchTerm ? 'No suppliers match your search' : 'No suppliers found'}
        </div>
      )}

      {/* Create */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Supplier"
      >
        <SupplierForm
          onSubmit={handleCreateSupplier}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit */}
      <Modal
        isOpen={!!editingSupplier}
        onClose={() => setEditingSupplier(null)}
        title="Edit Supplier"
      >
        {editingSupplier && (
          <SupplierForm
            supplier={editingSupplier}
            onSubmit={handleUpdateSupplier}
            onCancel={() => setEditingSupplier(null)}
          />
        )}
      </Modal>

      {/* Deactivate */}
      <ConfirmDialog
        isOpen={!!confirmDeactivate}
        title="Deactivate Supplier"
        message={`Deactivate ${confirmDeactivate?.name}?`}
        confirmLabel="Deactivate"
        danger
        onConfirm={handleDeactivateSupplier}
        onClose={() => setConfirmDeactivate(null)}
      />

      {/* Reactivate */}
      <ConfirmDialog
        isOpen={!!confirmReactivate}
        title="Reactivate Supplier"
        message={`Reactivate ${confirmReactivate?.name}?`}
        confirmLabel="Reactivate"
        onConfirm={handleReactivateSupplier}
        onClose={() => setConfirmReactivate(null)}
      />
    </div>
  )
}
