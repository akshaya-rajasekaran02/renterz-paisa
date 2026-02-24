import { useMemo, useState } from 'react'

export function usePagination(items, initialSize = 6) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialSize)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const activePage = Math.min(page, totalPages)

  const paginatedItems = useMemo(() => {
    const start = (activePage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, activePage, pageSize])

  return { page: activePage, setPage, pageSize, setPageSize, totalPages, paginatedItems }
}
