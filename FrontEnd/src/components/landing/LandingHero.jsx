import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

export default function LandingHero() {
  return (
    <section className="overflow-hidden rounded-3xl border border-base bg-surface p-6 transition-shadow duration-300 hover:shadow-lg md:p-12">
      <div className="max-w-3xl">
        <span className="hero-reveal hero-reveal-1 inline-flex items-center gap-2 rounded-full border border-base bg-surface-soft px-3 py-1 text-xs font-semibold text-main">
          <ShieldCheck size={14} /> Production-Ready Frontend
        </span>
        <h2 className="hero-reveal hero-reveal-2 mt-4 text-3xl font-bold leading-tight md:text-5xl">
          Manage Properties, Rent, Payments, and Tenant Operations on One Platform
        </h2>
        <p className="hero-reveal hero-reveal-3 mt-4 max-w-2xl text-base text-soft md:text-lg">
          Built for admins, owners, and tenants with role-based access, JWT auth, operational modules, and a scalable frontend architecture.
        </p>
        <div className="hero-reveal hero-reveal-4 mt-7 flex flex-wrap gap-3">
          <Link to="/login">
            <Button className="px-5 py-2.5">
              Open Workspace <ArrowRight size={15} className="ml-1" />
            </Button>
          </Link>
          <Link to="/documentation">
            <Button variant="secondary" className="px-5 py-2.5">Read Docs</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
