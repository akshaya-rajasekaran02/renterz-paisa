import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import FormField from '../../components/forms/FormField'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import StatusBadge from '../../components/ui/StatusBadge'
import Table from '../../components/ui/Table'
import { ROLES } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import { usePageLoading } from '../../hooks/usePageLoading'
import { useToast } from '../../hooks/useToast'
import { complaintService } from '../../services/complaintService'
import { complaintSeed } from '../../services/mockData'
import { inventoryService } from '../../services/inventoryService'
import { formatDateTime } from '../../utils/formatters'

const COMPLAINTS_KEY = 'rp_complaints'
const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'CLOSED']

function readComplaints() {
  try {
    const raw = localStorage.getItem(COMPLAINTS_KEY)
    if (!raw) {
      localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaintSeed))
      return [...complaintSeed]
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [...complaintSeed]
  } catch {
    return [...complaintSeed]
  }
}

function writeComplaints(records) {
  localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(records))
}

export default function ComplaintPage() {
  const loading = usePageLoading(350)
  const { user } = useAuth()
  const { showToast } = useToast()
  const isAdmin = user?.role === ROLES.BUILDING_ADMIN || user?.role === ROLES.ADMIN
  const isTenant = user?.role === ROLES.TENANT
  const units = inventoryService.getUnits()
  const unitById = new Map(units.map((item) => [Number(item.id), item]))
  const [complaints, setComplaints] = useState(() => readComplaints())
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: 'onChange', defaultValues: { unitId: '', title: '', description: '' } })

  useEffect(() => {
    if (isAdmin) return
    let cancelled = false
    const load = async () => {
      try {
        const records = isTenant
          ? await complaintService.listTenantComplaints()
          : await complaintService.listOwnerComplaints()
        if (!cancelled) setComplaints(records)
      } catch (error) {
        if (!cancelled) {
          showToast(error?.response?.data?.message || 'Unable to load complaints from backend.', 'error')
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isAdmin, isTenant, showToast])

  const onSubmit = async (values) => {
    const unit = unitById.get(Number(values.unitId))
    try {
      if (!isAdmin && isTenant) {
        const created = await complaintService.createTenantComplaint(values)
        const next = [{ ...created, unitName: unit?.unitNo || '' }, ...complaints]
        setComplaints(next)
        reset()
        return
      }
      const next = [
        {
          id: new Date().getTime(),
          unitId: Number(values.unitId) || null,
          unitName: unit?.unitNo || '',
          title: values.title,
          description: values.description,
          status: 'OPEN',
          createdByUserId: user?.id ?? null,
          createdByName: user?.fullName || 'User',
          createdByRole: user?.role || 'TENANT',
          createdAt: new Date().toISOString(),
        },
        ...complaints,
      ]
      setComplaints(next)
      writeComplaints(next)
      reset()
    } catch (error) {
      showToast(error?.response?.data?.message || error.message || 'Unable to submit complaint.', 'error')
    }
  }

  const handleStatusChange = async (id, nextStatus) => {
    try {
      if (!isAdmin) {
        const updatedItem = await complaintService.updateOwnerComplaintStatus(id, nextStatus)
        const updated = complaints.map((item) => (
          Number(item.id) === Number(id) ? { ...item, ...updatedItem } : item
        ))
        setComplaints(updated)
        return
      }
      const updated = complaints.map((item) => (
        Number(item.id) === Number(id) ? { ...item, status: nextStatus } : item
      ))
      setComplaints(updated)
      writeComplaints(updated)
    } catch (error) {
      showToast(error?.response?.data?.message || 'Unable to update complaint status.', 'error')
    }
  }

  const visibleComplaints = useMemo(() => {
    if (isAdmin) return complaints
    if (isTenant) return complaints.filter((item) => item.createdByUserId === user?.id)
    if (user?.role === ROLES.OWNER) return complaints
    return complaints.filter((item) => item.createdByUserId === user?.id)
  }, [complaints, isAdmin, isTenant, user?.id, user?.role])

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase()
    return visibleComplaints.filter((item) => {
      const statusMatch = statusFilter === 'ALL' || item.status === statusFilter
      if (!statusMatch) return false
      if (!query) return true
      const text = `${item.title} ${item.description} ${item.unitName || ''} ${item.createdByName || ''}`.toLowerCase()
      return text.includes(query)
    })
  }, [search, statusFilter, visibleComplaints])

  const counts = useMemo(() => ({
    total: visibleComplaints.length,
    open: visibleComplaints.filter((item) => item.status === 'OPEN').length,
    progress: visibleComplaints.filter((item) => item.status === 'IN_PROGRESS').length,
    closed: visibleComplaints.filter((item) => item.status === 'CLOSED').length,
  }), [visibleComplaints])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (isAdmin) {
    const adminColumns = [
      {
        key: 'title',
        label: 'Complaint',
        render: (row) => (
          <div className="max-w-[360px]">
            <p className="font-semibold text-main">{row.title}</p>
            <p className="truncate text-xs text-soft">{row.description}</p>
          </div>
        ),
      },
      { key: 'unitName', label: 'Unit', render: (row) => row.unitName || unitById.get(Number(row.unitId))?.unitNo || '-' },
      { key: 'raisedBy', label: 'Raised By', render: (row) => `${row.createdByName || 'User'} (${row.createdByRole || 'N/A'})` },
      { key: 'createdAt', label: 'Date', render: (row) => formatDateTime(row.createdAt) },
      { key: 'status', label: 'Current', render: (row) => <StatusBadge status={row.status} /> },
      {
        key: 'action',
        label: 'Change Status',
        render: (row) => (
          <select
            className="input-base h-8 w-36 text-xs"
            value={row.status}
            onChange={(event) => handleStatusChange(row.id, event.target.value)}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        ),
      },
    ]

    return (
      <div className="space-y-4">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">All Complaints</h2>
              <p className="text-sm text-soft">Admin can review all complaints and update status directly.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">Total: {counts.total}</span>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700">Open: {counts.open}</span>
              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-indigo-700">In Progress: {counts.progress}</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">Closed: {counts.closed}</span>
            </div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_190px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input-base"
              placeholder="Search by title, description, unit, or raised by"
            />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input-base">
              <option value="ALL">All Status</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </Card>

        <Card className="p-0">
          <Table columns={adminColumns} data={filteredComplaints} emptyText="No complaints available for this filter." />
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {isTenant ? <Card className="lg:col-span-2">
        <h2 className="text-xl font-bold">Raise Complaint</h2>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Unit" error={errors.unitId?.message}>
            <select {...register('unitId', { required: 'Unit is required' })} className="input-base">
              <option value="">Select Unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unitNo} | {unit.property}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Title" error={errors.title?.message}>
            <input {...register('title', { required: 'Title is required' })} className="input-base" />
          </FormField>
          <FormField label="Description" error={errors.description?.message}>
            <textarea {...register('description', { required: 'Description is required' })} rows="4" className="input-base" />
          </FormField>
          <Button type="submit" disabled={!isValid}>Submit Complaint</Button>
        </form>
      </Card> : null}

      <Card className={isTenant ? 'lg:col-span-3' : 'lg:col-span-5'}>
        <h3 className="text-lg font-semibold">My Complaints</h3>
        <div className="mt-4 space-y-3">
          {filteredComplaints.map((item) => (
            <div key={item.id} className="rounded-xl border border-base p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-main">{item.title}</p>
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-1 text-sm text-soft">{item.description}</p>
              <div className="mt-2 grid gap-1 text-xs text-soft sm:grid-cols-2">
                <p>Unit: {item.unitName || unitById.get(Number(item.unitId))?.unitNo || '-'}</p>
                <p>Raised by: {item.createdByName || 'User'} ({item.createdByRole || 'N/A'})</p>
                <p className="sm:col-span-2">Raised date: {formatDateTime(item.createdAt)}</p>
              </div>
            </div>
          ))}
          {!filteredComplaints.length ? <p className="text-sm text-soft">No complaints available.</p> : null}
        </div>
      </Card>
    </div>
  )
}
