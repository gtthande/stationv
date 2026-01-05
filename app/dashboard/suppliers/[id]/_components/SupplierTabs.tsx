'use client'

import React from 'react'

interface SupplierTabsProps {
  activeTab: 'general' | 'contacts' | 'notes' | 'activity'
  onTabChange: (tab: 'general' | 'contacts' | 'notes' | 'activity') => void
}

export function SupplierTabs({ activeTab, onTabChange }: SupplierTabsProps) {
  const tabs = [
    { id: 'general' as const, label: 'General' },
    { id: 'contacts' as const, label: 'Contacts' },
    { id: 'notes' as const, label: 'Notes' },
    { id: 'activity' as const, label: 'Activity' },
  ]

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

