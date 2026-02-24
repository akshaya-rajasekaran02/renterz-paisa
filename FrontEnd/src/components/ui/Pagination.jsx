import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      <button
        type="button"
        className="rounded-lg border border-base p-2 disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-soft">Page {page} of {totalPages}</span>
      <button
        type="button"
        className="rounded-lg border border-base p-2 disabled:opacity-40"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}