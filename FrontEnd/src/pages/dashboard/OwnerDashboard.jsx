import { useMemo } from 'react'
import { ArrowRight, Building2, CircleAlert, LayoutGrid, ReceiptText, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import StatCard from '../../components/ui/StatCard'
import { ROLES } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import { usePageLoading } from '../../hooks/usePageLoading'
import { ownerService } from '../../services/ownerService'
import { formatCurrency, formatDate } from '../../utils/formatters'

export default function OwnerDashboard() {
  const loading = usePageLoading()
  const navigate = useNavigate()
  const { user } = useAuth()
  const ownerUser = user?.role === ROLES.OWNER ? user : null
  const ownedUnits = useMemo(() => (ownerUser ? ownerService.getOwnedUnits(ownerUser) : []), [ownerUser])
  const maintenanceBills = useMemo(() => (ownerUser ? ownerService.getMaintenanceBills(ownerUser) : []), [ownerUser])
  const myComplaints = useMemo(() => (ownerUser ? ownerService.getMyComplaints(ownerUser) : []), [ownerUser])

  const now = new Date().getTime()
  const occupiedUnits = ownedUnits.filter((item) => item.status === 'OCCUPIED').length
  const vacantUnits = Math.max(ownedUnits.length - occupiedUnits, 0)
  const activeTenants = ownedUnits.filter((item) => item.tenant).length
  const openBills = maintenanceBills.filter((item) => !item.paid).length
  const overdueBills = maintenanceBills.filter((item) => !item.paid && new Date(item.dueDate).getTime() < now).length
  const unpaidAmount = maintenanceBills
    .filter((item) => !item.paid)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const openComplaints = myComplaints.filter((item) => item.status !== 'CLOSED').length
  const recentComplaints = myComplaints.slice(0, 4)
  const upcomingBills = useMemo(
    () => maintenanceBills
      .filter((item) => !item.paid)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 4),
    [maintenanceBills]
  )

  const unitRows = useMemo(
    () => ownedUnits
      .map((unit) => ({
        id: unit.id,
        unitNo: unit.unitNo,
        property: unit.property,
        floor: unit.floor,
        tenant: unit.tenant || '-',
        occupancy: unit.status,
      }))
      .sort((a, b) => String(a.unitNo).localeCompare(String(b.unitNo))),
    [ownedUnits]
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-56" />
        <Skeleton className="h-72" />
        <Skeleton className="h-40" />
      </div>
    )
  }

  const unitColumns = [
    { key: 'unitNo', label: 'Unit' },
    { key: 'property', label: 'Property' },
    { key: 'floor', label: 'Floor' },
    { key: 'tenant', label: 'Tenant' },
    {
      key: 'occupancy',
      label: 'Occupancy',
      render: (row) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.occupancy === 'OCCUPIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {row.occupancy}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <Card className="relative overflow-hidden">
        <span className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-500/10" />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-soft">Owner Workspace</p>
            <h2 className="mt-1 text-2xl font-bold">Welcome, {ownerUser?.fullName || 'Owner'}</h2>
            <p className="mt-1 text-sm text-soft">
              Track your units, monitor due bills, and keep tenant complaints under control from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate('/owner')}><Building2 size={14} /> Owner Module</Button>
            <Button variant="secondary" onClick={() => navigate('/units')}><LayoutGrid size={14} /> Units</Button>
            <Button variant="secondary" onClick={() => navigate('/rent')}><Wallet size={14} /> Rent</Button>
            <Button variant="secondary" onClick={() => navigate('/payments')}><ReceiptText size={14} /> Payments</Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Owned Units" value={ownedUnits.length} accent="bg-cyan-500" />
        <StatCard title="Occupied Units" value={occupiedUnits} accent="bg-emerald-500" />
        <StatCard title="Vacant Units" value={vacantUnits} accent="bg-amber-500" />
        <StatCard title="Active Tenants" value={activeTenants} accent="bg-sky-500" />
        <StatCard title="Open Bills" value={openBills} accent="bg-rose-500" />
        <StatCard title="Open Complaints" value={openComplaints} accent="bg-indigo-500" onClick={() => navigate('/owner')} />
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Portfolio Units</h3>
            <button type="button" onClick={() => navigate('/owner')} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
              Open Owner Module <ArrowRight size={14} />
            </button>
          </div>
          {unitRows.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="surface-soft">
                  <tr>
                    {unitColumns.map((item) => (
                      <th key={item.key} className="px-3 py-2 text-left font-semibold text-soft">{item.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {unitRows.map((row) => (
                    <tr key={row.id} className="border-t border-base">
                      {unitColumns.map((column) => (
                        <td key={column.key} className="whitespace-nowrap px-3 py-2 text-main">
                          {column.render ? column.render(row) : row[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-soft">No units assigned to your account.</p>}
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold">Maintenance Snapshot</h3>
          <div className="mt-3 space-y-2 text-sm">
            <p><span className="text-soft">Outstanding Amount:</span> <strong>{formatCurrency(unpaidAmount)}</strong></p>
            <p><span className="text-soft">Overdue Bills:</span> <strong>{overdueBills}</strong></p>
            <p><span className="text-soft">Pending Complaints:</span> <strong>{openComplaints}</strong></p>
          </div>
          <div className="mt-4 space-y-2">
            {upcomingBills.length ? upcomingBills.map((bill) => (
              <div key={bill.id} className="rounded-lg border border-base p-2.5 text-sm">
                <p className="font-semibold">{bill.unit} - {bill.issue}</p>
                <p className="text-soft">Due {formatDate(bill.dueDate)} | {formatCurrency(bill.amount)}</p>
              </div>
            )) : (
              <p className="text-sm text-soft">No unpaid maintenance bills.</p>
            )}
          </div>
        </Card>
      </section>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Complaints</h3>
          <button type="button" onClick={() => navigate('/owner')} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
            Manage Complaints <ArrowRight size={14} />
          </button>
        </div>
        {recentComplaints.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {recentComplaints.map((item) => (
              <div key={item.id} className="rounded-xl border border-base p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{item.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    item.status === 'CLOSED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.status === 'IN_PROGRESS'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-soft">{item.description}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-soft">
                  <CircleAlert size={12} /> {formatDate(item.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-soft">No complaints submitted yet.</p>}
      </Card>
    </div>
  )
}
