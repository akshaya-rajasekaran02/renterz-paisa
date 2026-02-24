import { useEffect, useMemo, useState } from 'react'
import { Plus, Upload, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import StatCard from '../../components/ui/StatCard'
import { useToast } from '../../hooks/useToast'
import { inventoryService } from '../../services/inventoryService'
import { rentsSeed } from '../../services/mockData'
import { presenceService } from '../../services/presenceService'
import { userService } from '../../services/userService'
import { formatCurrency } from '../../utils/formatters'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [onlineCount, setOnlineCount] = useState(() => presenceService.countOnlineUsers())
  const properties = useMemo(() => inventoryService.getProperties(), [])
  const units = useMemo(() => inventoryService.getUnits(), [])
  const users = useMemo(() => userService.listUsers(), [])
  const audits = useMemo(() => inventoryService.getUnitAudit(), [])
  const stats = useMemo(() => ([
    { label: 'Total Properties', value: properties.length },
    { label: 'Total Units', value: units.length },
    { label: 'Occupied Units', value: units.filter((item) => item.status === 'OCCUPIED').length },
    { label: 'Live Online Users', value: onlineCount },
    {
      label: 'Overdue Rent Count',
      value: rentsSeed.filter((item) => item.status === 'OVERDUE').length,
      onClick: () => navigate('/rent?status=OVERDUE&sort=LATE_DESC'),
    },
  ]), [navigate, onlineCount, properties, units])
  const recentActivity = useMemo(() => {
    if (audits.length) {
      return audits.slice(0, 5).map((entry) => `${entry.allocationType} mapped to ${entry.assigneeName} on ${entry.unitNo}`)
    }
    return users.slice(0, 5).map((entry) => `User onboarded: ${entry.fullName} (${entry.role})`)
  }, [audits, users])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const refresh = () => setOnlineCount(presenceService.countOnlineUsers())
    const unsubscribe = presenceService.subscribe(refresh)
    const poll = setInterval(refresh, 10000)
    refresh()
    return () => {
      unsubscribe()
      clearInterval(poll)
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-56" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            title={stat.label}
            value={stat.value}
            accent={index % 2 ? 'bg-cyan-500' : 'bg-teal-500'}
            onClick={stat.onClick}
          />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold">Revenue Summary</h3>
          <p className="mt-2 text-3xl font-bold text-teal-700">{formatCurrency(rentsSeed.reduce((sum, item) => sum + Number(item.amount || 0), 0))}</p>
          <p className="mt-1 text-sm text-soft">Month-to-date net collections across all properties.</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Quick Add</h3>
          <div className="mt-4 space-y-2 text-sm">
            <button type="button" onClick={() => navigate('/properties')} className="flex w-full items-center gap-2 rounded-xl border border-base px-3 py-2 hover:bg-slate-50"><Plus size={15} /> Add Property</button>
            <button type="button" onClick={() => navigate('/users')} className="flex w-full items-center gap-2 rounded-xl border border-base px-3 py-2 hover:bg-slate-50"><UserPlus size={15} /> Add User</button>
            <button type="button" disabled onClick={() => showToast('Upload ledger module is planned in next phase.', 'info')} className="flex w-full cursor-not-allowed items-center gap-2 rounded-xl border border-base px-3 py-2 text-soft opacity-70"><Upload size={15} /> Upload Ledger (Coming soon)</button>
          </div>
        </Card>
      </section>

      <Card>
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <ul className="mt-4 space-y-3 text-sm">
          {recentActivity.map((activity) => (
            <li key={activity} className="rounded-xl border border-base px-3 py-2">{activity}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">User Management</h3>
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="inline-flex items-center gap-2 rounded-xl border border-base bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
          >
            <UserPlus size={14} /> Open Users Table
          </button>
        </div>
        <p className="mt-4 text-sm text-soft">Use the dedicated Users page to add, reset passwords, and remove users.</p>
      </Card>
    </div>
  )
}
