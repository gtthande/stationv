# Prompts 34-44: Testing & Polish

## Prompt 34-37: Testing (Overview)

**Note:** Testing is optional but recommended. These prompts provide basic test examples.

### Prompt 34: Test GET /api/admin/users

Create `__tests__/api/users.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals'

describe('/api/admin/users', () => {
  it('should return list of users', async () => {
    const res = await fetch('http://localhost:3000/api/admin/users')
    const data = await res.json()
    
    expect(res.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data[0]).toHaveProperty('name')
    expect(data[0]).not.toHaveProperty('password')
  })
})
```

### Prompt 35-37: Additional Tests

Create similar tests for:
- POST /api/admin/users (user creation)
- PATCH /api/admin/users/[id] (user update)
- POST /api/admin/users/[id]/permissions (grant permission)
- DELETE /api/admin/users/[id]/permissions/[pid] (revoke permission)

---

## Prompt 38: Form Validation Enhancement

Update `components/admin/UserForm.tsx` to add real-time validation:

```typescript
// Add to UserForm component

const [errors, setErrors] = useState<Record<string, string>>({})

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
  } else {
    const { password, ...rest } = errors
    setErrors(rest)
  }
}

// Add to Input components:
// onBlur={handleEmailBlur}
// onBlur={handlePasswordBlur}
```

---

## Prompt 39: Permission Form Validation

Update `components/admin/PermissionForm.tsx`:

```typescript
const validateKey = (key: string) => {
  // Key should be lowercase with dots, no spaces
  const regex = /^[a-z]+(\.[a-z_]+)+$/
  return regex.test(key)
}

const [errors, setErrors] = useState<Record<string, string>>({})

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

// Add validation before submit
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
```

---

## Prompt 40: Toast Notifications

Create `components/ui/Toast.tsx`:

```typescript
'use client'
import React, { createContext, useContext, useState } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface ToastContextType {
  showToast: (message: string, type: Toast['type']) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: Toast['type']) => {
    const id = Math.random().toString(36)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
```

Then wrap your app in `app/layout.tsx`:

```typescript
import { ToastProvider } from '@/components/ui/Toast'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
```

Use in pages:

```typescript
const { showToast } = useToast()

const handleCreateUser = async (data: any) => {
  try {
    await fetch('/api/admin/users', { ... })
    showToast('User created successfully!', 'success')
  } catch (error) {
    showToast('Failed to create user', 'error')
  }
}
```

---

## Prompt 41: Loading States

Update `components/ui/Button.tsx`:

```typescript
interface ButtonProps {
  loading?: boolean
  // ... other props
}

export function Button({ loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button disabled={disabled || loading} {...props}>
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
```

Add loading spinner to tables:

```typescript
{loading ? (
  <div className="flex justify-center items-center py-12">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
) : (
  <UserTable users={users} {...handlers} />
)}
```

---

## Prompt 42: Delete Confirmations

Create `components/ui/ConfirmDialog.tsx`:

```typescript
'use client'
import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-gray-700">{message}</p>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button 
            variant={danger ? 'danger' : 'primary'} 
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

Usage in pages:

```typescript
const [confirmDelete, setConfirmDelete] = useState<User | null>(null)

const handleDeleteUser = async (user: User) => {
  setConfirmDelete(user)
}

const confirmDeleteUser = async () => {
  if (!confirmDelete) return
  try {
    await fetch(`/api/admin/users/${confirmDelete.id}`, { method: 'DELETE' })
    showToast('User deleted successfully', 'success')
    fetchUsers()
  } catch (error) {
    showToast('Failed to delete user', 'error')
  }
  setConfirmDelete(null)
}

<ConfirmDialog
  isOpen={!!confirmDelete}
  onClose={() => setConfirmDelete(null)}
  onConfirm={confirmDeleteUser}
  title="Confirm Delete"
  message={`Are you sure you want to deactivate ${confirmDelete?.name}?`}
  danger
/>
```

---

## Prompt 43: Accessibility & UX Polish

### Add ARIA labels:

```typescript
// Modals
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">

// Buttons
<button aria-label="Close modal">✕</button>

// Tables
<table aria-label="Users list">

// Forms
<input aria-required="true" aria-invalid={!!error} aria-describedby="error-message">
```

### Keyboard navigation:

```typescript
// Modal - trap focus
useEffect(() => {
  if (!isOpen) return
  
  const focusableElements = modalRef.current?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements?.[0] as HTMLElement
  const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  document.addEventListener('keydown', handleTab)
  firstElement?.focus()

  return () => document.removeEventListener('keydown', handleTab)
}, [isOpen])
```

### Color contrast:

Ensure all text meets WCAG AA standards (4.5:1 ratio). The provided color scheme already meets this:
- Blue-500 on white: ✅
- Gray-700 on white: ✅
- White on Blue-500: ✅

### Focus indicators:

```css
/* Add to globals.css */
*:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
```

---

## Prompt 44: Final Review & Polish

### Checklist:

✅ **Database:**
- [ ] All 4 tables exist
- [ ] All 70+ permissions seeded
- [ ] Admin user created
- [ ] Foreign keys set up correctly

✅ **API Routes:**
- [ ] All endpoints return proper status codes
- [ ] Passwords never exposed in responses
- [ ] Audit logs created for all actions
- [ ] Error handling consistent
- [ ] Input validation on all POSTs/PATCHs

✅ **UI Components:**
- [ ] All forms validate inputs
- [ ] Loading states on all async operations
- [ ] Error states displayed clearly
- [ ] Success feedback via toasts
- [ ] Modals close on ESC key
- [ ] Tables are sortable/filterable
- [ ] Responsive on mobile

✅ **Pages:**
- [ ] Users page fully functional
- [ ] Permissions page fully functional
- [ ] Permission assignment works
- [ ] Navigation works
- [ ] Breadcrumbs clear

✅ **Accessibility:**
- [ ] All interactive elements keyboard accessible
- [ ] ARIA labels on all components
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader friendly

✅ **Security:**
- [ ] Passwords hashed with bcrypt
- [ ] No SQL injection vulnerabilities
- [ ] XSS protection in place
- [ ] CSRF tokens (Next.js built-in)
- [ ] Input sanitization

### Manual Testing:

1. Create a new user
2. Assign permissions to user
3. Edit user details
4. Revoke permissions
5. Deactivate user
6. Create new permission
7. Edit permission
8. Deactivate permission
9. Check all audit logs created
10. Test on mobile device

### Performance:

```typescript
// Add pagination to large tables
const [page, setPage] = useState(1)
const usersPerPage = 20
const paginatedUsers = users.slice((page - 1) * usersPerPage, page * usersPerPage)

// Add search/filter
const [searchTerm, setSearchTerm] = useState('')
const filteredUsers = users.filter(
  u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       u.email.toLowerCase().includes(searchTerm.toLowerCase())
)
```

### Final Polish:

- Add helpful placeholder text
- Include tooltips for complex features
- Add empty states ("No users yet")
- Add loading skeletons
- Optimize images
- Add meta tags for SEO
- Test cross-browser (Chrome, Firefox, Safari)

---

## 🎉 Congratulations!

You've completed the Station-2100 Admin & Permissions System!

**What You've Built:**
- ✅ Complete user management system
- ✅ Granular permission system (70+ permissions)
- ✅ Full CRUD for users and permissions
- ✅ Permission assignment interface
- ✅ Complete audit trail
- ✅ Modern, responsive UI
- ✅ Accessible and secure

**Next Steps:**
1. Deploy to staging environment
2. User acceptance testing
3. Begin Module 2: Inventory Management
4. Continue building Station-2100!

---
**END OF PROMPTS - Admin & Permissions System Complete!**
