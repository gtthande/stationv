'use client'
import React, { useState, useEffect } from 'react'
import { PermissionTable } from '@/components/admin/PermissionTable'
import { PermissionForm } from '@/components/admin/PermissionForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface Permission {
  id: string
  key: string
  description: string
  module: string
  category?: string
  isActive: boolean
}

export default function PermissionsPage() {
  const { showToast } = useToast()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Permission | null>(null)

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      const res = await fetch('/api/admin/permissions')
      const raw = await res.json()
      
      // Defensive normalization: always expect array
      const safePermissions = Array.isArray(raw) ? raw : []
      setPermissions(safePermissions)
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePermission = async (data: any) => {
    try {
      const res = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        showToast('Permission created successfully!', 'success')
        setShowCreateModal(false)
        fetchPermissions()
      } else {
        showToast('Failed to create permission', 'error')
      }
    } catch (error) {
      console.error('Failed to create permission:', error)
      showToast('Failed to create permission', 'error')
    }
  }

  const handleUpdatePermission = async (data: any) => {
    if (!editingPermission) return
    try {
      const res = await fetch(`/api/admin/permissions/${editingPermission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        showToast('Permission updated successfully!', 'success')
        setEditingPermission(null)
        fetchPermissions()
      } else {
        showToast('Failed to update permission', 'error')
      }
    } catch (error) {
      console.error('Failed to update permission:', error)
      showToast('Failed to update permission', 'error')
    }
  }

  const handleDeletePermission = (permission: Permission) => {
    setConfirmDelete(permission)
  }

  const confirmDeletePermission = async () => {
    if (!confirmDelete) return
    try {
      const res = await fetch(`/api/admin/permissions/${confirmDelete.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        showToast('Permission deactivated successfully', 'success')
        fetchPermissions()
      } else {
        showToast('Failed to deactivate permission', 'error')
      }
    } catch (error) {
      console.error('Failed to delete permission:', error)
      showToast('Failed to deactivate permission', 'error')
    }
    setConfirmDelete(null)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Permissions</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          + New Permission
        </Button>
      </div>

      <PermissionTable
        permissions={Array.isArray(permissions) ? permissions : []}
        onEdit={setEditingPermission}
        onDelete={handleDeletePermission}
      />

      {/* Create Permission Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Permission"
      >
        <PermissionForm
          onSubmit={handleCreatePermission}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Permission Modal */}
      <Modal
        isOpen={!!editingPermission}
        onClose={() => setEditingPermission(null)}
        title="Edit Permission"
      >
        {editingPermission && (
          <PermissionForm
            permission={editingPermission}
            onSubmit={handleUpdatePermission}
            onCancel={() => setEditingPermission(null)}
          />
          )}
        </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeletePermission}
        title="Confirm Delete"
        message={`Are you sure you want to deactivate permission "${confirmDelete?.key}"?`}
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        danger
      />
    </div>
  )
}

