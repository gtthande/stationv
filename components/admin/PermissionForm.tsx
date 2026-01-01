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

interface Permission {
  id: string
  key: string
  description: string
  module: string
  category?: string
  isActive: boolean
}

interface PermissionFormProps {
  permission?: Permission
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
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateKey = (key: string) => {
    // Key should be lowercase with dots, no spaces
    const regex = /^[a-z]+(\.[a-z_]+)+$/
    return regex.test(key)
  }

  const handleKeyBlur = () => {
    if (formData.key && !validateKey(formData.key)) {
      setErrors({ 
        ...errors, 
        key: 'Key must be lowercase with dots (e.g., inventory.view)' 
      })
    } else {
      const { key, ...rest } = errors
      setErrors(rest)
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.key) newErrors.key = 'Key is required'
    else if (!validateKey(formData.key)) {
      newErrors.key = 'Invalid key format'
    }
    if (!formData.description) newErrors.description = 'Description is required'
    if (!formData.module) newErrors.module = 'Module is required'
    
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
        label="Key"
        required
        placeholder="e.g., inventory.view"
        value={formData.key}
        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
        onBlur={handleKeyBlur}
        error={errors.key}
      />
      <Input
        label="Description"
        required
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        error={errors.description}
      />
      <Input
        label="Module"
        required
        placeholder="e.g., Inventory"
        value={formData.module}
        onChange={(e) => setFormData({ ...formData, module: e.target.value })}
        error={errors.module}
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

