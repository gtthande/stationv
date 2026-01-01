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

