import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo-clean.png'
import Button from '../ui/Button'

export default function LandingHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 md:px-6">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Renterz logo" className="h-14 w-14 rounded-xl border border-base object-cover sm:h-16 sm:w-16" />
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold">Renterz Paizza</h1>
          <p className="text-xs text-soft">Rent Tracking and Property Management</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center">
        <Link to="/login">
          <Button className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">
            <span className="sm:hidden">Open</span>
            <span className="hidden sm:inline">Open Workspace</span>
            <ArrowRight size={14} className="ml-1" />
          </Button>
        </Link>
      </div>
    </header>
  )
}
