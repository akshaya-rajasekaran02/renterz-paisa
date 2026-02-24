import { useCallback, useMemo, useState } from 'react'
import { ToastContext } from './toastContextInstance'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'info', durationMs = 2800) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), durationMs)
  }, [removeToast])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed left-3 right-3 top-4 z-[100] flex w-auto max-w-[calc(100vw-1.5rem)] flex-col gap-2 sm:left-auto sm:right-4 sm:w-80 sm:max-w-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl border px-4 py-3 text-sm shadow-lg transition ${
              toast.type === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : toast.type === 'error'
                ? 'border-rose-300 bg-rose-50 text-rose-700'
                : 'border-base bg-surface text-main'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
