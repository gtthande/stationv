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
      <table className="min-w-full bg-white border" aria-label="Users list">
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
                <Button size="sm" onClick={() => onEdit(user)} aria-label={`Edit user ${user.name}`}>
                  Edit
                </Button>
                <Button size="sm" variant="secondary" onClick={() => onManagePermissions(user)} aria-label={`Manage permissions for ${user.name}`}>
                  Permissions
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(user)} aria-label={`Delete user ${user.name}`}>
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

