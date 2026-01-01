# Prompts 22-29: UI Components

## Prompt 22: Button Component

Create `components/ui/Button.tsx`:

```typescript
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

---

## Prompt 23: Input Component

Create `components/ui/Input.tsx`:

```typescript
import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
```

---

## Prompt 24: Modal Component

Create `components/ui/Modal.tsx`:

```typescript
'use client'
import React, { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
```

---

## Prompt 25: UserTable Component

Create `components/admin/UserTable.tsx`:

```typescript
'use client'
import React from 'react'
import { Button } from '@/components/ui/Button'

interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isActive: boolean
}

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onManagePermissions: (user: User) => void
}

export function UserTable({ users, onEdit, onDelete, onManagePermissions }: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b text-left">Name</th>
            <th className="px-4 py-2 border-b text-left">Email</th>
            <th className="px-4 py-2 border-b text-center">Admin</th>
            <th className="px-4 py-2 border-b text-center">Active</th>
            <th className="px-4 py-2 border-b text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b">{user.name}</td>
              <td className="px-4 py-2 border-b">{user.email}</td>
              <td className="px-4 py-2 border-b text-center">
                {user.isAdmin ? (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Yes</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">No</span>
                )}
              </td>
              <td className="px-4 py-2 border-b text-center">
                {user.isActive ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Inactive</span>
                )}
              </td>
              <td className="px-4 py-2 border-b text-right space-x-2">
                <Button size="sm" onClick={() => onEdit(user)}>
                  Edit
                </Button>
                <Button size="sm" variant="secondary" onClick={() => onManagePermissions(user)}>
                  Permissions
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(user)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## Prompt 26: UserForm Component

Create `components/admin/UserForm.tsx`:

```typescript
'use client'
import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface UserFormData {
  name: string
  email: string
  password?: string
  isAdmin: boolean
  isActive: boolean
}

interface UserFormProps {
  user?: UserFormData & { id: string }
  onSubmit: (data: UserFormData) => Promise<void>
  onCancel: () => void
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    isAdmin: user?.isAdmin || false,
    isActive: user?.isActive !== undefined ? user.isActive : true,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!user && !formData.password) newErrors.password = 'Password is required'
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
      />
      <Input
        label="Email"
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
      />
      <Input
        label={user ? 'Password (leave blank to keep current)' : 'Password'}
        type="password"
        required={!user}
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        error={errors.password}
      />
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isAdmin}
            onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
          />
          <span>Is Admin</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <span>Is Active</span>
        </label>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  )
}
```

---

## Prompt 27: PermissionTable Component

Create `components/admin/PermissionTable.tsx`:

```typescript
'use client'
import React from 'react'
import { Button } from '@/components/ui/Button'

interface Permission {
  id: string
  key: string
  description: string
  module: string
  category?: string
  isActive: boolean
}

interface PermissionTableProps {
  permissions: Permission[]
  onEdit: (permission: Permission) => void
  onDelete: (permission: Permission) => void
}

export function PermissionTable({ permissions, onEdit, onDelete }: PermissionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b text-left">Key</th>
            <th className="px-4 py-2 border-b text-left">Description</th>
            <th className="px-4 py-2 border-b text-left">Module</th>
            <th className="px-4 py-2 border-b text-left">Category</th>
            <th className="px-4 py-2 border-b text-center">Active</th>
            <th className="px-4 py-2 border-b text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission) => (
            <tr key={permission.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b font-mono text-sm">{permission.key}</td>
              <td className="px-4 py-2 border-b">{permission.description}</td>
              <td className="px-4 py-2 border-b">{permission.module}</td>
              <td className="px-4 py-2 border-b">{permission.category || '-'}</td>
              <td className="px-4 py-2 border-b text-center">
                {permission.isActive ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Yes</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">No</span>
                )}
              </td>
              <td className="px-4 py-2 border-b text-right space-x-2">
                <Button size="sm" onClick={() => onEdit(permission)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(permission)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## Prompt 28: PermissionForm Component

Create `components/admin/PermissionForm.tsx`:

```typescript
'use client'
import React, { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface PermissionFormData {
  key: string
  description: string
  module: string
  category?: string
  isActive: boolean
}

interface PermissionFormProps {
  permission?: PermissionFormData & { id: string }
  onSubmit: (data: PermissionFormData) => Promise<void>
  onCancel: () => void
}

export function PermissionForm({ permission, onSubmit, onCancel }: PermissionFormProps) {
  const [formData, setFormData] = useState<PermissionFormData>({
    key: permission?.key || '',
    description: permission?.description || '',
    module: permission?.module || '',
    category: permission?.category || '',
    isActive: permission?.isActive !== undefined ? permission.isActive : true,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Key"
        required
        placeholder="e.g., inventory.view"
        value={formData.key}
        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
      />
      <Input
        label="Description"
        required
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <Input
        label="Module"
        required
        placeholder="e.g., Inventory"
        value={formData.module}
        onChange={(e) => setFormData({ ...formData, module: e.target.value })}
      />
      <Input
        label="Category"
        placeholder="e.g., Read, Write, Approve"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      />
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
        />
        <span>Is Active</span>
      </label>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : permission ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
```

---

## Prompt 29: PermissionSelector Component

Create `components/admin/PermissionSelector.tsx`:

```typescript
'use client'
import React, { useState, useMemo } from 'react'

interface Permission {
  id: string
  key: string
  description: string
  module: string
}

interface PermissionSelectorProps {
  availablePermissions: Permission[]
  selectedPermissions: string[] // permission IDs
  onChange: (selected: string[]) => void
}

export function PermissionSelector({
  availablePermissions,
  selectedPermissions,
  onChange,
}: PermissionSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    const filtered = availablePermissions.filter(
      (p) =>
        p.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filtered.reduce((acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = []
      }
      acc[permission.module].push(permission)
      return acc
    }, {} as Record<string, Permission[]>)
  }, [availablePermissions, searchTerm])

  const handleToggle = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      onChange(selectedPermissions.filter((id) => id !== permissionId))
    } else {
      onChange([...selectedPermissions, permissionId])
    }
  }

  const handleToggleModule = (module: string) => {
    const modulePermissions = groupedPermissions[module].map((p) => p.id)
    const allSelected = modulePermissions.every((id) => selectedPermissions.includes(id))

    if (allSelected) {
      onChange(selectedPermissions.filter((id) => !modulePermissions.includes(id)))
    } else {
      onChange([...new Set([...selectedPermissions, ...modulePermissions])])
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search permissions..."
        className="w-full px-3 py-2 border rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="max-h-96 overflow-y-auto border rounded p-4 space-y-4">
        {Object.entries(groupedPermissions).map(([module, permissions]) => (
          <div key={module}>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={permissions.every((p) => selectedPermissions.includes(p.id))}
                onChange={() => handleToggleModule(module)}
                className="mr-2"
              />
              <span className="font-semibold">{module}</span>
              <span className="ml-2 text-sm text-gray-500">
                ({permissions.filter((p) => selectedPermissions.includes(p.id)).length}/
                {permissions.length})
              </span>
            </div>
            <div className="ml-6 space-y-1">
              {permissions.map((permission) => (
                <label key={permission.id} className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={() => handleToggle(permission.id)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-mono text-sm">{permission.key}</div>
                    <div className="text-xs text-gray-500">{permission.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-600">
        {selectedPermissions.length} of {availablePermissions.length} permissions selected
      </div>
    </div>
  )
}
```

---
**All UI components complete! Next: Prompt 30 - Admin Pages**
