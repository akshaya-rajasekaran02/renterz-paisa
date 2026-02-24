import { Outlet } from 'react-router-dom'
import logo from '../assets/logo-clean.png'

export default function AuthLayout() {
  return (
    <div className="auth-layout-shell auth-page-bg flex min-h-screen items-center justify-center p-4">
      <div className="auth-layout-card grid w-full max-w-5xl overflow-hidden rounded-3xl border border-base bg-surface shadow-2xl backdrop-blur-sm lg:grid-cols-2">
        <section className="auth-layout-brand auth-brand-panel hidden p-8 text-white lg:block">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Renterz logo" className="h-12 w-12 rounded-xl border border-white/30 object-cover" />
            <h1 className="text-3xl font-bold">Renterz Platform</h1>
          </div>
          <p className="mt-4 max-w-sm text-sm text-white/90">
            Centralized rent tracking, property management, payment workflows, and communication in a single control plane.
          </p>
        </section>
        <section className="auth-layout-form bg-surface p-6 text-main md:p-8">
          <Outlet />
        </section>
      </div>
    </div>
  )
}
