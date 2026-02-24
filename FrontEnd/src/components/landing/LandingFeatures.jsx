import { AlertTriangle, Building2, MessageSquareText, Wallet } from 'lucide-react'
import Card from '../ui/Card'

const features = [
  {
    title: 'Property Management',
    description: 'Manage buildings, units, occupancy status, and owner-tenant assignments from one place.',
    icon: Building2,
  },
  {
    title: 'Rent & Payment Tracking',
    description: 'Track rent due dates, payment history, pending balances, and downloadable receipts.',
    icon: Wallet,
  },
  {
    title: 'Complaints & Communication',
    description: 'Handle tenant complaints, maintenance requests, and direct communication workflows.',
    icon: MessageSquareText,
  },
  {
    title: 'Damage Tracking',
    description: 'Log damage reports with status updates, assignment flow, and resolution tracking.',
    icon: AlertTriangle,
  },
]

export default function LandingFeatures() {
  return (
    <section className="rounded-3xl border border-base bg-surface p-6 shadow-sm md:p-8">
      <h3 className="text-2xl font-bold">Features We Provide</h3>
      <p className="mt-2 text-sm text-soft">Examples of services we are going to provide in the Renterz platform.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="group transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 transition duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-teal-200">
              <feature.icon size={18} />
            </span>
            <h4 className="mt-4 text-lg font-semibold">{feature.title}</h4>
            <p className="mt-2 text-sm text-soft">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
