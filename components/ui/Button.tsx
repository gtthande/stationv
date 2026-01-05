'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'default'
  size?: 'sm' | 'icon' | 'default'
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'default',
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseClasses = 'rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  // Map 'default' to 'primary' for backward compatibility
  const normalizedVariant = variant === 'default' ? 'primary' : variant
  
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-400',
  }

  const sizeClasses = {
    default: 'px-4 py-2',
    sm: 'px-3 py-1.5 text-sm',
    icon: 'p-2 w-10 h-10',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[normalizedVariant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

