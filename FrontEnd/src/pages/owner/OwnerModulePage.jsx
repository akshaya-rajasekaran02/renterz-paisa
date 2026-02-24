import { useState } from 'react'
import FormField from '../../components/forms/FormField'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import StatusBadge from '../../components/ui/StatusBadge'
import Table from '../../components/ui/Table'
import { ROLES } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import { usePageLoading } from '../../hooks/usePageLoading'
import { ownerService } from '../../services/ownerService'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters'

const complaintDefaults = { unitId: '', title: '', description: '' }

export default function OwnerModulePage() {
  const loading = usePageLoading(280)
  const { user } = useAuth()
  const [form, setForm] = useState(complaintDefaults)
  const [error, setError] = useState('')
  const [, forceRefresh] = useState(0)
  const ownerUser = user?.role === ROLES.OWNER ? user : null

  const units = ownerUser ? ownerService.getOwnedUnits(ownerUser) : []
  const bills = ownerUser ? ownerService.getMaintenanceBills(ownerUser) : []
  const complaints = ownerUser ? ownerService.getMyComplaints(ownerUser) : []
  const unitById = new Map(units.map((unit) => [unit.id, unit]))

  const submitComplaint = (event) => {
    event.preventDefault()
    setError('')
    if (!ownerUser) return
    try {
      ownerService.raiseComplaint(ownerUser, form)
      setForm(complaintDefaults)
      forceRefresh((value) => value + 1)
    } catch (serviceError) {
      setError(serviceError.message || 'Unable to submit complaint')
    }
  }

  const unitColumns = [
    { key: 'unitNo', label: 'Unit No' },
    { key: 'property', label: 'Property' },
    { key: 'floor', label: 'Floor' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ]

  const billColumns = [
    { key: 'unit', label: 'Unit' },
    { key: 'issue', label: 'Bill Description' },
    { key: 'billMonth', label: 'Bill Month' },
    { key: 'dueDate', label: 'Due Date', render: (row) => formatDate(row.dueDate) },
    { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount || 0) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'paid', label: 'Settlement', render: (row) => <StatusBadge status={row.paid ? 'PAID' : 'PENDING'} /> },
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-52" />
        <Skeleton className="h-64" />
        <Skeleton className="h-80" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Owner Module</h2>
        <p className="text-sm text-soft">Basic ownership operations scoped to your allocated units only.</p>
      </div>

      <Card>
        <h3 className="text-lg font-semibold">Owned Units</h3>
        <div className="mt-3">
          <Table columns={unitColumns} data={units} emptyText="No units allocated with OWNER allocation type." />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Maintenance Bills</h3>
        <div className="mt-3">
          <Table columns={billColumns} data={bills} emptyText="No maintenance bills found for your units." />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold">Raise Complaint</h3>
          <form className="mt-3 space-y-3" onSubmit={submitComplaint}>
            <FormField label="Unit">
              <select
                className="input-base"
                value={form.unitId}
                onChange={(event) => setForm((prev) => ({ ...prev, unitId: event.target.value }))}
              >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.unitNo} | {unit.property}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Title">
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="input-base"
              />
            </FormField>
            <FormField label="Description">
              <textarea
                rows="4"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="input-base"
              />
            </FormField>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Button type="submit">Submit Complaint</Button>
          </form>
        </Card>

        <Card className="lg:col-span-3">
          <h3 className="text-lg font-semibold">My Complaints</h3>
          <div className="mt-3 space-y-3">
            {complaints.map((item) => {
              const unit = unitById.get(item.unitId)
              return (
                <div key={item.id} className="rounded-xl border border-base p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-main">{item.title}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-soft">{item.description}</p>
                  <p className="mt-2 text-xs text-soft">
                    {unit ? `${unit.unitNo} | ${unit.property}` : `Unit #${item.unitId}`} | {formatDateTime(item.createdAt)}
                  </p>
                </div>
              )
            })}
            {!complaints.length ? <p className="text-sm text-soft">No complaints submitted yet.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  )
}
