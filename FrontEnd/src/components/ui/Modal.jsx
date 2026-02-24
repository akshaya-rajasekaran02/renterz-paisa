import { X } from 'lucide-react'

export default function Modal({ open, title, onClose, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
      <div className="card w-full max-w-xl p-0">
        <div className="flex items-center justify-between border-b border-base px-5 py-3">
          <h3 className="text-lg font-semibold text-main">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 transition hover-surface-soft" type="button">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}