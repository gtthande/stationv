'use client'
import React, { useState, useEffect } from 'react'
import { UserTable } from '@/components/admin/UserTable'
import { UserForm } from '@/components/admin/UserForm'
import { PermissionSelector } from '@/components/admin/PermissionSelector'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isActive: boolean
  permissions: any[]
}

export default function UsersPage() {
  const { showToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [permissions, setPermissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [managingPermissionsFor, setManagingPermissionsFor] = useState<User | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchPermissions()
  }, [])

  const fetchUsers = async () => {
    try {
      setError(null)
      const res = await fetch('/api/admin/users')
      const raw = await res.json()
      
      // Defensive normalization: always expect array
      const safeUsers = Array.isArray(raw) ? raw : []
      
      setUsers(safeUsers)
      
      if (!res.ok) {
        setError('Failed to load users')
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setError('Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

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
    }
  }

  const handleCreateUser = async (data: any) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        showToast('User created successfully!', 'success')
        setShowCreateModal(false)
        fetchUsers()
      } else {
        showToast('Failed to create user', 'error')
      }
    } catch (error) {
      console.error('Failed to create user:', error)
      showToast('Failed to create user', 'error')
    }
  }

  const handleUpdateUser = async (data: any) => {
    if (!editingUser) return
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        showToast('User updated successfully!', 'success')
        setEditingUser(null)
        fetchUsers()
      } else {
        showToast('Failed to update user', 'error')
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      showToast('Failed to update user', 'error')
    }
  }

  const handleDeleteUser = (user: User) => {
    setConfirmDelete(user)
  }

  const confirmDeleteUser = async () => {
    if (!confirmDelete) return
    try {
      const res = await fetch(`/api/admin/users/${confirmDelete.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        showToast('User deactivated successfully', 'success')
        fetchUsers()
      } else {
        showToast('Failed to deactivate user', 'error')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      showToast('Failed to deactivate user', 'error')
    }
    setConfirmDelete(null)
  }

  const handleManagePermissions = (user: User) => {
    setManagingPermissionsFor(user)
    const userPermissions = Array.isArray(user.permissions) ? user.permissions : []
    setSelectedPermissions(userPermissions.map((p) => p.id))
  }

  const handleSavePermissions = async () => {
    if (!managingPermissionsFor) return

    try {
      // Get current permission IDs
      const userPermissions = Array.isArray(managingPermissionsFor.permissions) ? managingPermissionsFor.permissions : []
      const currentPermissionIds = userPermissions.map((p) => p.id)
      
      // Find permissions to grant and revoke
      const toGrant = selectedPermissions.filter((id) => !currentPermissionIds.includes(id))
      const toRevoke = currentPermissionIds.filter((id) => !selectedPermissions.includes(id))

      // Grant new permissions
      for (const permissionId of toGrant) {
        await fetch(`/api/admin/users/${managingPermissionsFor.id}/permissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissionId }),
        })
      }

      // Revoke removed permissions
      for (const permissionId of toRevoke) {
        await fetch(`/api/admin/users/${managingPermissionsFor.id}/permissions/${permissionId}`, {
          method: 'DELETE',
        })
      }

      setManagingPermissionsFor(null)
      showToast('Permissions updated successfully!', 'success')
      fetchUsers()
    } catch (error) {
      console.error('Failed to update permissions:', error)
      showToast('Failed to update permissions', 'error')
    }
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
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          + New User
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <UserTable
        users={Array.isArray(users) ? users : []}
        onEdit={setEditingUser}
        onDelete={handleDeleteUser}
        onManagePermissions={handleManagePermissions}
      />

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
      >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
      >
        {editingUser && (
          <UserForm
            user={editingUser}
            onSubmit={handleUpdateUser}
            onCancel={() => setEditingUser(null)}
          />
        )}
      </Modal>

      {/* Manage Permissions Modal */}
      <Modal
        isOpen={!!managingPermissionsFor}
        onClose={() => setManagingPermissionsFor(null)}
        title={`Manage Permissions - ${managingPermissionsFor?.name}`}
      >
        {managingPermissionsFor && (
          <div className="space-y-4">
            <PermissionSelector
              availablePermissions={Array.isArray(permissions) ? permissions : []}
              selectedPermissions={selectedPermissions}
              onChange={setSelectedPermissions}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setManagingPermissionsFor(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleSavePermissions}>
                Save Permissions
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteUser}
        title="Confirm Delete"
        message={`Are you sure you want to deactivate ${confirmDelete?.name}?`}
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        danger
      />
    </div>
  )
}

