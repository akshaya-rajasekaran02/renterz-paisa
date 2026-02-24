import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import LineChart from '../../components/charts/LineChart'
import Button from '../../components/ui/Button'
import { ROLES } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import StatusBadge from '../../components/ui/StatusBadge'
import Table from '../../components/ui/Table'
import { usePageLoading } from '../../hooks/usePageLoading'
import { useToast } from '../../hooks/useToast'
import { dashboardByRole, monthlyRentSeries } from '../../services/mockData'
import { inventoryService } from '../../services/inventoryService'
import { ownerService } from '../../services/ownerService'
import { getOneMonthRentPeriod, rentService } from '../../services/rentService'
import { formatCurrency, formatDate } from '../../utils/formatters'

function calculateRemainingDays(dueDate) {
  if (!dueDate) return 0
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.ceil((new Date(dueDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / msPerDay)
}

function getRentStartDate(item, fallback = '') {
  const value = item?.periodStart || item?.joinedOn || item?.createdAt || fallback || ''
  return String(value).slice(0, 10)
}

function getRentDueDate(item, fallback = '') {
  const start = getRentStartDate(item, fallback)
  if (!start) return ''
  return String(item?.periodEnd || item?.dueDate || getOneMonthRentPeriod(start).endDate)
}

function DueDotBadge({ days }) {
  let dotClass = 'bg-emerald-500'
  let textClass = 'text-emerald-700'
  let label = 'Start'

  if (days < 0) {
    dotClass = 'bg-rose-500'
    textClass = 'text-rose-700'
    label = 'Overdue'
  } else if (days <= 5) {
    dotClass = 'bg-rose-500'
    textClass = 'text-rose-700'
    label = 'Urgent'
  } else if (days <= 10) {
    dotClass = 'bg-amber-500'
    textClass = 'text-amber-700'
    label = 'Mid'
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-base px-2.5 py-1 text-xs font-semibold transition hover:scale-[1.02] ${textClass}`}
      title={`Due health: ${label}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotClass} ${days <= 5 ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  )
}

export default function RentPage() {
  const [searchParams] = useSearchParams()
  const loading = usePageLoading(350)
  const { user } = useAuth()
  const { showToast } = useToast()
  const isOwner = user?.role === ROLES.OWNER
  const isTenant = user?.role === ROLES.TENANT
  const [rents, setRents] = useState([])
  const [ownerRentForm, setOwnerRentForm] = useState({ unitId: '', amount: '' })
  const [currentTime] = useState(() => Date.now())
  const statusFilter = searchParams.get('status')
  const sortFilter = searchParams.get('sort')

  useEffect(() => {
    if (isOwner || isTenant) return undefined
    const timer = setInterval(() => {
      setRents((prev) => prev.map((item) => (Math.random() > 0.8 ? { ...item, status: item.status === 'PAID' ? 'OVERDUE' : 'PAID' } : item)))
    }, 20000)
    return () => clearInterval(timer)
  }, [isOwner, isTenant])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        if (isOwner || isTenant) {
          const records = await rentService.listRentsRemote(isOwner ? 'OWNER' : 'TENANT')
          if (!cancelled) setRents(records)
          return
        }
        if (!cancelled) setRents(rentService.listRents())
      } catch {
        if (!cancelled) setRents(rentService.listRents())
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isOwner, isTenant])

  const chartData = useMemo(() => monthlyRentSeries, [])
  const ownerUnits = useMemo(() => (isOwner && user ? ownerService.getOwnedUnits(user) : []), [isOwner, user])
  const ownerTenantUnits = useMemo(() => ownerUnits.filter((unit) => unit.tenant), [ownerUnits])
  const ownerBills = isOwner ? ownerService.getMaintenanceBills(user) : []
  const ownerRents = useMemo(() => {
    if (!isOwner) return []
    const ownedUnitNos = new Set(ownerTenantUnits.map((unit) => String(unit.unitNo || '').trim().toUpperCase()))
    return rents
      .filter((item) => ownedUnitNos.has(String(item.unit || '').trim().toUpperCase()))
      .sort((a, b) => new Date(getRentDueDate(a)).getTime() - new Date(getRentDueDate(b)).getTime())
  }, [isOwner, ownerTenantUnits, rents])
  const adminAllocationRows = useMemo(() => {
    if (isOwner || isTenant) return []
    const existing = new Set(
      rents.map((item) => {
        const unitKey = String(item.unit || '').trim().toUpperCase()
        const emailKey = String(item.userEmail || item.tenantEmail || '').trim().toLowerCase()
        const nameKey = String(item.tenant || '').trim().toLowerCase()
        return `${unitKey}|${emailKey || nameKey}`
      })
    )

    return inventoryService.getUnits().flatMap((unit) => {
      const unitKey = String(unit.unitNo || '').trim().toUpperCase()
      const tenantProfiles = Array.isArray(unit.tenantProfiles) ? unit.tenantProfiles.filter(Boolean) : []
      const tenantAssignees = tenantProfiles.length
        ? tenantProfiles
        : unit.tenantProfile
          ? [unit.tenantProfile]
          : unit.tenant
            ? [{ fullName: unit.tenant, email: '' }]
            : []
      const ownerAssignees = !tenantAssignees.length && unit.owner
        ? [{ fullName: `${unit.owner} (Owner)`, email: unit.ownerProfile?.email || '' }]
        : []
      const assignees = tenantAssignees.length ? tenantAssignees : ownerAssignees
      if (!assignees.length) return []

      return assignees
        .map((assignee, index) => {
          const fullName = String(assignee?.fullName || assignee?.name || '').trim() || 'Allocated User'
          const email = String(assignee?.email || '').trim().toLowerCase()
          const key = `${unitKey}|${email || fullName.toLowerCase()}`
          if (existing.has(key)) return null
          existing.add(key)
          const joinedOn = String(assignee?.createdAt || new Date().toISOString())
          const period = getOneMonthRentPeriod(joinedOn)
          return {
            id: `allocation-${unit.id}-${email || fullName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
            unitId: unit.id,
            unit: unit.unitNo || '-',
            tenant: fullName,
            tenantEmail: email,
            userEmail: email,
            periodStart: period.startDate,
            periodEnd: period.endDate,
            dueDate: period.endDate,
            amount: 0,
            status: 'PENDING',
            joinedOn,
            source: 'UNIT_ALLOCATION',
          }
        })
        .filter(Boolean)
    })
  }, [isOwner, isTenant, rents])

  const selectedOwnerUnitId = useMemo(() => {
    if (!isOwner) return ''
    const current = String(ownerRentForm.unitId || '')
    const hasCurrent = ownerTenantUnits.some((unit) => String(unit.id) === current)
    if (hasCurrent) return current
    return ownerTenantUnits[0] ? String(ownerTenantUnits[0].id) : ''
  }, [isOwner, ownerRentForm.unitId, ownerTenantUnits])

  const adminRents = useMemo(() => {
    if (isTenant || isOwner) return rents
    let records = [...rents, ...adminAllocationRows]
    if (statusFilter === 'OVERDUE') {
      records = records.filter((item) => item.status === 'OVERDUE')
    }
    if (sortFilter === 'LATE_DESC') {
      records.sort((a, b) => calculateRemainingDays(getRentDueDate(a)) - calculateRemainingDays(getRentDueDate(b)))
    }
    return records
  }, [adminAllocationRows, isOwner, isTenant, rents, sortFilter, statusFilter])
  const assignedTenantUnitNo = useMemo(() => {
    if (!isTenant || !user) return ''
    const units = inventoryService.getUnits()
    const match = units.find((unit) => {
      const byEmail = unit.tenantProfile?.email && unit.tenantProfile.email.toLowerCase() === user.email?.toLowerCase()
      const byName = unit.tenant && unit.tenant.toLowerCase() === user.fullName?.toLowerCase()
      return byEmail || byName
    })
    return match?.unitNo || dashboardByRole.TENANT.unit.unitNo
  }, [isTenant, user])
  const joinedOn = user?.createdAt || '2026-01-01'
  const tenantRents = useMemo(
    () =>
      rents.filter((item) => {
        const byUserId = item.userId && item.userId === user?.id
        const byEmail = item.userEmail && item.userEmail.toLowerCase() === user?.email?.toLowerCase()
        const byName = item.tenant && item.tenant.toLowerCase() === user?.fullName?.toLowerCase()
        const byUnit = item.unit === assignedTenantUnitNo
        return byUserId || byEmail || byName || byUnit
      }),
    [assignedTenantUnitNo, rents, user?.email, user?.fullName, user?.id]
  )
  const nextDueDate = useMemo(() => {
    if (!tenantRents.length) return null
    const sorted = [...tenantRents].sort((a, b) => new Date(getRentDueDate(a)).getTime() - new Date(getRentDueDate(b)).getTime())
    const next = sorted.find((item) => new Date(getRentDueDate(item)).getTime() >= currentTime)
    return next ? getRentDueDate(next) : getRentDueDate(sorted[0])
  }, [currentTime, tenantRents])

  const handleOwnerRentAssign = (event) => {
    event.preventDefault()
    if (!selectedOwnerUnitId) return showToast('Select a tenant unit first.', 'error')
    if (!ownerRentForm.amount || Number(ownerRentForm.amount) <= 0) return showToast('Amount must be greater than zero.', 'error')

    try {
      ownerService.assignRentToTenant(user, {
        unitId: Number(selectedOwnerUnitId),
        amount: Number(ownerRentForm.amount),
      })
      setRents(rentService.listRents())
      showToast('Rent assigned to tenant successfully.', 'success')
      setOwnerRentForm((prev) => ({ ...prev, amount: '' }))
    } catch (error) {
      showToast(error.message || 'Unable to assign rent to tenant.', 'error')
    }
  }

  const columns = [
    { key: 'tenant', label: 'Tenant' },
    { key: 'unit', label: 'Unit' },
    { key: 'joinedOn', label: 'Start Date', render: (row) => formatDate(getRentStartDate(row, joinedOn)) },
    { key: 'dueDate', label: 'End Date', render: (row) => formatDate(getRentDueDate(row, joinedOn)) },
    { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
    {
      key: 'remainingDays',
      label: 'Remaining Days',
      render: (row) => {
        const days = calculateRemainingDays(getRentDueDate(row, joinedOn))
        return (
          <div className="flex items-center gap-2">
            <span>{days >= 0 ? `${days} day(s)` : `${Math.abs(days)} day(s) overdue`}</span>
            <DueDotBadge days={days} />
          </div>
        )
      },
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ]

  const ownerRentColumns = [
    { key: 'tenant', label: 'Tenant' },
    { key: 'unit', label: 'Unit' },
    { key: 'joinedOn', label: 'Start Date', render: (row) => formatDate(getRentStartDate(row)) },
    { key: 'dueDate', label: 'End Date', render: (row) => formatDate(getRentDueDate(row)) },
    { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ]

  const maintenanceColumns = [
    { key: 'unit', label: 'Unit' },
    { key: 'issue', label: 'Maintenance Bill' },
    { key: 'dueDate', label: 'Due Date', render: (row) => formatDate(row.dueDate) },
    { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'paid', label: 'Settlement', render: (row) => <StatusBadge status={row.paid ? 'PAID' : 'PENDING'} /> },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{isOwner ? 'Rent Assignment | Maintenance Bills' : 'Rent Tracking'}</h2>
        <p className="text-sm text-soft">
          {isOwner
            ? 'Owner can assign rent to tenants in owned units and view maintenance bills.'
            : 'Auto-refreshed rent statuses with month-wise trend summary.'}
        </p>
        {!isOwner && !isTenant && statusFilter === 'OVERDUE' ? <p className="mt-1 text-xs font-semibold text-rose-700">Showing overdue rents sorted by most delayed first.</p> : null}
      </div>
      {loading ? (
        <>
          {isTenant ? <Skeleton className="h-32" /> : null}
          <Skeleton className="h-72" />
          {!isOwner ? <Skeleton className="h-64" /> : null}
        </>
      ) : (
        isOwner ? (
          <>
            <Card>
              <h3 className="text-lg font-semibold">Assign Rent to Tenant</h3>
              <p className="mt-1 text-sm text-soft">Select one tenant unit and set amount. Rent period auto-runs from today to one month.</p>
              {!ownerTenantUnits.length ? (
                <p className="mt-4 text-sm text-rose-700">No tenant is assigned to your owned units yet.</p>
              ) : (
                <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={handleOwnerRentAssign}>
                  <select
                    className="input-base md:col-span-2"
                    value={selectedOwnerUnitId}
                    onChange={(event) => setOwnerRentForm((prev) => ({ ...prev, unitId: event.target.value }))}
                  >
                    {ownerTenantUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.unitNo} | {unit.tenant}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    className="input-base"
                    placeholder="Amount"
                    value={ownerRentForm.amount}
                    onChange={(event) => setOwnerRentForm((prev) => ({ ...prev, amount: event.target.value }))}
                  />
                  <div className="md:col-span-3">
                    <Button type="submit">Assign Rent</Button>
                  </div>
                </form>
              )}
            </Card>
            <Table columns={ownerRentColumns} data={ownerRents} emptyText="No rent records found for your tenant units." />
            <Card>
              <h3 className="text-lg font-semibold">Maintenance Bills</h3>
              <div className="mt-3">
                <Table columns={maintenanceColumns} data={ownerBills} emptyText="No maintenance bills found for your units." />
              </div>
            </Card>
          </>
        ) : (
          <>
            {isTenant ? (
              <Card>
                <h3 className="text-lg font-semibold">Due Details</h3>
                <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                  <div>
                    <p className="text-soft">Joined On</p>
                    <p className="font-semibold">{formatDate(joinedOn)}</p>
                  </div>
                  <div>
                    <p className="text-soft">Next Due Date</p>
                    <p className="font-semibold">{nextDueDate ? formatDate(nextDueDate) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-soft">Remaining Days</p>
                    {nextDueDate ? (
                      <div className="mt-1 flex items-center gap-2">
                        <p className="font-semibold">{`${Math.max(calculateRemainingDays(nextDueDate), 0)} day(s)`}</p>
                        <DueDotBadge days={calculateRemainingDays(nextDueDate)} />
                      </div>
                    ) : (
                      <p className="font-semibold">N/A</p>
                    )}
                  </div>
                </div>
              </Card>
            ) : null}
            <Table columns={columns} data={isTenant ? tenantRents : adminRents} emptyText={isTenant ? 'No rent records for your account.' : 'No records found'} />
            {!isTenant ? <LineChart data={chartData} /> : null}
          </>
        )
      )}
    </div>
  )
}
