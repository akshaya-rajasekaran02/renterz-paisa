import { Coffee, Github, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const year = useMemo(() => new Date().getFullYear(), [])
  const socials = [
    {
      label: 'GitHub',
      href: 'https://github.com/SEENIVASAN-VENKATESAN',
      icon: Github,
      style: 'border-slate-400/50 bg-slate-100 text-slate-800 hover:border-slate-500/40 hover:bg-slate-900 hover:text-white',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/seenivasanvenkatesan/',
      icon: Linkedin,
      style: 'border-sky-300/60 bg-sky-50 text-sky-800 hover:border-sky-500/40 hover:bg-sky-700 hover:text-white',
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/',
      icon: Instagram,
      style: 'border-pink-300/60 bg-pink-50 text-pink-800 hover:border-pink-500/40 hover:bg-gradient-to-r hover:from-fuchsia-600 hover:to-rose-500 hover:text-white',
    },
    {
      label: 'Buy Me a Coffee',
      href: 'https://buymeacoffee.com/Seeni',
      icon: Coffee,
      style: 'border-amber-300/60 bg-amber-50 text-amber-900 hover:border-amber-500/40 hover:bg-amber-400 hover:text-slate-900',
    },
  ]

  return (
    <footer className="mt-10 border-t border-base bg-surface/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
        <div className="grid gap-6 text-sm text-soft md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="text-base font-semibold text-main">Renterz</h4>
            <p className="mt-2">
              Smart rent tracking and property operations for admins, owners, and tenants.
            </p>
          </div>

          <div>
            <h4 className="text-base font-semibold text-main">Product</h4>
            <ul className="mt-2 space-y-1.5">
              <li>Property and Unit Management</li>
              <li>Rent and Payment Monitoring</li>
              <li>Maintenance and Damage Tracking</li>
              <li>Complaint and Communication Tools</li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-semibold text-main">Quick Links</h4>
            <ul className="mt-2 space-y-1.5">
              <li><a href="#landing-hero" className="hover:text-main">Overview</a></li>
              <li><a href="#landing-features" className="hover:text-main">Features</a></li>
              <li><a href="#landing-feedback" className="hover:text-main">Feedback</a></li>
              <li><a href="#landing-integration" className="hover:text-main">Integration</a></li>
              <li><Link to="/documentation" className="hover:text-main">Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-semibold text-main">Contact</h4>
            <ul className="mt-2 space-y-2">
              <li className="inline-flex items-center gap-2"><Mail size={14} /> support@renterz.com</li>
              <li className="inline-flex items-center gap-2"><Phone size={14} /> +1 (800) 555-2014</li>
              <li className="inline-flex items-center gap-2"><MapPin size={14} /> New York, United States</li>
            </ul>
          </div>
        </div>

        <div className="mt-7 rounded-2xl border border-base bg-surface p-4 shadow-[0_10px_24px_rgba(15,23,42,0.1)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-bold tracking-wide text-main">Connect With The Makers</p>
            <div className="flex flex-wrap gap-2">
              {socials.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold shadow-sm transition duration-300 hover:-translate-y-0.5 ${item.style}`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-7 border-t border-base pt-4 text-xs text-soft sm:text-sm">
          <p>© {year} Renterz. All rights reserved.</p>
          <p className="mt-1">Built for modern rent tracking and property operations.</p>
          <p className="mt-1">
            <Link to="/documentation" className="font-semibold text-main hover:underline">Documentation</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
