# Prompts 30-33: Admin Pages

## Prompt 30: Admin Users Page

Create `app/admin/users/page.tsx`:

```typescript
'use client'
import React, { useState, useEffect } from 'react'
import { UserTable } from '@/components/admin/UserTable'
import { UserForm } from '@/components/admin/UserForm'
import { PermissionSelector } from '@/components/admin/PermissionSelector'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isActive: boolean
  permissions: any[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [permissions, setPermissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [managingPermissionsFor, setManagingPermissionsFor] = useState<User | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  useEffect(() => {
    fetchUsers()
    fetchPermissions()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const res = await fetch('/api/admin/permissions')
      const data = await res.json()
      setPermissions(data)
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    }
  }

  const handleCreateUser = async (data: any) => {
    try {
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setShowCreateModal(false)
      fetchUsers()
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const handleUpdateUser = async (data: any) => {
    if (!editingUser) return
    try {
      await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to deactivate ${user.name}?`)) return

    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      })
      fetchUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const handleManagePermissions = (user: User) => {
    setManagingPermissionsFor(user)
    setSelectedPermissions(user.permissions.map((p) => p.id))
  }

  const handleSavePermissions = async () => {
    if (!managingPermissionsFor) return

    try {
      // Get current permission IDs
      const currentPermissionIds = managingPermissionsFor.permissions.map((p) => p.id)
      
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
      fetchUsers()
    } catch (error) {
      console.error('Failed to update permissions:', error)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          + New User
        </Button>
      </div>

      <UserTable
        users={users}
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
              availablePermissions={permissions}
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
    </div>
  )
}
```

---

## Prompt 31: Admin Permissions Page

Create `app/admin/permissions/page.tsx`:

```typescript
'use client'
import React, { useState, useEffect } from 'react'
import { PermissionTable } from '@/components/admin/PermissionTable'
import { PermissionForm } from '@/components/admin/PermissionForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface Permission {
  id: string
  key: string
  description: string
  module: string
  category?: string
  isActive: boolean
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      const res = await fetch('/api/admin/permissions')
      const data = await res.json()
      setPermissions(data)
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePermission = async (data: any) => {
    try {
      await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setShowCreateModal(false)
      fetchPermissions()
    } catch (error) {
      console.error('Failed to create permission:', error)
    }
  }

  const handleUpdatePermission = async (data: any) => {
    if (!editingPermission) return
    try {
      await fetch(`/api/admin/permissions/${editingPermission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setEditingPermission(null)
      fetchPermissions()
    } catch (error) {
      console.error('Failed to update permission:', error)
    }
  }

  const handleDeletePermission = async (permission: Permission) => {
    if (!confirm(`Are you sure you want to deactivate permission "${permission.key}"?`)) return

    try {
      await fetch(`/api/admin/permissions/${permission.id}`, {
        method: 'DELETE',
      })
      fetchPermissions()
    } catch (error) {
      console.error('Failed to delete permission:', error)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
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
        permissions={permissions}
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
    </div>
  )
}
```

---

## Prompt 32: Admin Layout with Navigation

Create `app/admin/layout.tsx`:

```typescript
'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/permissions', label: 'Permissions' },
    { href: '/admin/audit-logs', label: 'Audit Logs' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Station-2100 Admin</h1>
            <nav className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded ${
                    pathname === item.href
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto">{children}</main>
    </div>
  )
}
```

---

## Prompt 33: (Optional) Audit Logs Viewer

Create `app/admin/audit-logs/page.tsx`:

```typescript
'use client'
import React, { useState, useEffect } from 'react'

interface AuditLog {
  id: string
  action: string
  module: string
  timestamp: string
  details: any
  userId?: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      // Create this endpoint in API routes if needed
      const res = await fetch('/api/admin/audit-logs')
      const data = await res.json()
      setLogs(data)
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b text-left">Timestamp</th>
              <th className="px-4 py-2 border-b text-left">Action</th>
              <th className="px-4 py-2 border-b text-left">Module</th>
              <th className="px-4 py-2 border-b text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b text-sm">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2 border-b font-mono text-sm">{log.action}</td>
                <td className="px-4 py-2 border-b">{log.module}</td>
                <td className="px-4 py-2 border-b text-sm">
                  <pre className="text-xs">{JSON.stringify(log.details, null, 2)}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

If implementing audit logs viewer, also create:

`app/api/admin/audit-logs/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100, // Limit to most recent 100 logs
    })

    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch audit logs', message: (error as Error).message },
      { status: 500 }
    )
  }
}
```

---
**All admin pages complete! Next: Prompt 34 - Testing**
