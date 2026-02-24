import { House } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function HomeButton() {
  const location = useLocation()

  if (location.pathname === '/') {
    return null
  }

  return (
    <Link
      to="/"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-base bg-surface px-4 py-2 text-sm font-semibold text-main shadow-[0_10px_30px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.24)]"
      aria-label="Go to home page"
    >
      <House size={16} />
      Home
    </Link>
  )
}
