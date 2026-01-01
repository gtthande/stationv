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
      <table className="min-w-full bg-white border" aria-label="Permissions list">
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
                <Button size="sm" onClick={() => onEdit(permission)} aria-label={`Edit permission ${permission.key}`}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(permission)} aria-label={`Delete permission ${permission.key}`}>
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

