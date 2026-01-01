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

