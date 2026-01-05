'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SupplierCard } from './SupplierCard'
import { useToast } from '@/components/ui/Toast'

interface Supplier {
  id: string
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
  createdAt?: string
  updatedAt?: string
}

interface SupplierDetailClientProps {
  supplierId: string
}

export default function SupplierDetailClient({ supplierId }: SupplierDetailClientProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSupplier = async () => {
    try {
      setError(null)
      setLoading(true)

      const res = await fetch(`/api/suppliers/${supplierId}`)
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to load supplier')
      }

      setSupplier(json)
    } catch (err: any) {
      console.error('Failed to fetch supplier:', err)
      setError(err.message || 'Failed to load supplier')
      setSupplier(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSupplier()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId])

  const handleBack = () => {
    router.push('/dashboard/suppliers')
  }

  const handleSaved = async () => {
    await fetchSupplier()
    showToast('Supplier updated successfully', 'success')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !supplier) {
    return (
      <div className="space-y-4">
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded">
          {error || 'Supplier not found'}
        </div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          ← Back to Suppliers
        </button>
      </div>
    )
  }

  return (
    <SupplierCard
      supplier={supplier}
      onBack={handleBack}
      onSaved={handleSaved}
    />
  )
}

