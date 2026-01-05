'use client'
import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface SupplierFormData {
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

interface Supplier {
  id: bigint | string
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

interface SupplierFormProps {
  supplier?: Supplier
  onSubmit: (data: SupplierFormData) => Promise<void>
  onCancel: () => void
}

export function SupplierForm({ supplier, onSubmit, onCancel }: SupplierFormProps) {
  const [formData, setFormData] = useState<SupplierFormData>({
    code: supplier?.code || '',
    name: supplier?.name || '',
    contactName: supplier?.contactName || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    country: supplier?.country || 'Kenya',
    city: supplier?.city || '',
    address: supplier?.address || '',
    notes: supplier?.notes || '',
    isActive: supplier?.isActive !== undefined ? supplier.isActive : true,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (supplier) {
      setFormData({
        code: supplier.code || '',
        name: supplier.name,
        contactName: supplier.contactName || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        country: supplier.country || 'Kenya',
        city: supplier.city || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
        isActive: supplier.isActive,
      })
    }
  }, [supplier])

  const validateEmail = (email: string) => {
    if (!email || email.trim().length === 0) return true // Optional field
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleEmailBlur = () => {
    if (formData.email && formData.email.trim().length > 0 && !validateEmail(formData.email)) {
      setErrors({ ...errors, email: 'Invalid email format' })
    } else {
      const { email, ...rest } = errors
      setErrors(rest)
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (formData.email && formData.email.trim().length > 0 && !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        code: formData.code?.trim() || null,
        contactName: formData.contactName?.trim() || null,
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        country: formData.country?.trim() || null,
        city: formData.city?.trim() || null,
        address: formData.address?.trim() || null,
        notes: formData.notes?.trim() || null,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Code"
          value={formData.code || ''}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          error={errors.code}
          placeholder="Optional supplier code"
        />
        <Input
          label="Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Contact Name"
          value={formData.contactName || ''}
          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
          error={errors.contactName}
          placeholder="Contact person name"
        />
        <Input
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          onBlur={handleEmailBlur}
          error={errors.email}
          placeholder="supplier@example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Phone"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          error={errors.phone}
          placeholder="+254712345678"
        />
        <Input
          label="Country"
          value={formData.country || ''}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          error={errors.country}
          placeholder="Kenya"
        />
      </div>

      <Input
        label="City"
        value={formData.city || ''}
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        error={errors.city}
        placeholder="City name"
      />

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <textarea
          id="address"
          rows={3}
          className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          value={formData.address || ''}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Street address"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {errors.address}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.notes ? 'border-red-500' : 'border-gray-300'
          }`}
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes or reference numbers"
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {errors.notes}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-4">
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
          {loading ? 'Saving...' : supplier ? 'Update Supplier' : 'Create Supplier'}
        </Button>
      </div>
    </form>
  )
}

