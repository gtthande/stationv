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

interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isActive: boolean
}

interface UserFormProps {
  user?: User
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

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        isAdmin: user.isAdmin,
        isActive: user.isActive,
      })
    }
  }, [user])

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleEmailBlur = () => {
    if (formData.email && !validateEmail(formData.email)) {
      setErrors({ ...errors, email: 'Invalid email format' })
    } else {
      const { email, ...rest } = errors
      setErrors(rest)
    }
  }

  const handlePasswordBlur = () => {
    if (!user && formData.password && formData.password.length < 8) {
      setErrors({ ...errors, password: 'Password must be at least 8 characters' })
    } else if (formData.password && formData.password.length > 0 && formData.password.length < 8) {
      setErrors({ ...errors, password: 'Password must be at least 8 characters' })
    } else {
      const { password, ...rest } = errors
      setErrors(rest)
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format'
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
        onBlur={handleEmailBlur}
        error={errors.email}
      />
      <Input
        label={user ? 'Password (leave blank to keep current)' : 'Password'}
        type="password"
        required={!user}
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        onBlur={handlePasswordBlur}
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

