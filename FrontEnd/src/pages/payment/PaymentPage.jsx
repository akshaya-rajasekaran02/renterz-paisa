import { useEffect, useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import StatusBadge from '../../components/ui/StatusBadge'
import Table from '../../components/ui/Table'
import { useAuth } from '../../hooks/useAuth'
import { usePageLoading } from '../../hooks/usePageLoading'
import { useToast } from '../../hooks/useToast'
import { paymentService } from '../../services/paymentService'
import { formatCurrency, formatDate } from '../../utils/formatters'

export default function PaymentPage() {
  const loading = usePageLoading(350)
  const { user } = useAuth()
  const { showToast } = useToast()
  const [payments, setPayments] = useState([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const records = await paymentService.listPaymentsRemote()
        if (!cancelled) {
          setPayments(records)
        }
      } catch {
        if (!cancelled) {
          const local = paymentService.listPaymentsForUser(user)
          setPayments(local)
          showToast('Showing local payment data because backend fetch failed.', 'info')
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [showToast, user])

  const filtered = useMemo(
    () => payments.filter((item) => {
      const statusOk = statusFilter === 'ALL' || item.status === statusFilter
      const dateOk = !dateFilter || item.date === dateFilter
      return statusOk && dateOk
    }),
    [payments, statusFilter, dateFilter]
  )
  const statusSummary = useMemo(() => ({
    total: filtered.length,
    success: filtered.filter((item) => item.status === 'SUCCESS').length,
    pending: filtered.filter((item) => item.status === 'PENDING').length,
    failed: filtered.filter((item) => item.status === 'FAILED').length,
  }), [filtered])

  const downloadReceipt = (payment) => {
    const content = `Receipt #${payment.id}\nTenant: ${payment.tenant}\nAmount: ${formatCurrency(payment.amount)}\nDate: ${payment.date}\nStatus: ${payment.status}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `receipt-${payment.id}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const startGatewayCheckout = async (payment) => {
    try {
      const gateway = await paymentService.initGatewayCheckout({
        amount: payment.amount,
        paymentMode: payment.method || 'UPI',
        successUrl: window.location.href,
        cancelUrl: window.location.href,
      })
      showToast(gateway?.message || 'Gateway initialized.', gateway?.dryRun ? 'info' : 'success')
      if (gateway?.checkoutUrl) {
        window.open(gateway.checkoutUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      showToast(error?.response?.data?.message || 'Unable to initialize payment gateway.', 'error')
    }
  }

  const columns = [
    { key: 'id', label: 'Payment ID' },
    { key: 'tenant', label: 'Tenant' },
    { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button variant="secondary" onClick={() => setSelected(row)} className="px-3 py-1 text-xs">
          Details
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
        <h2 className="text-2xl font-bold">Payments</h2>
        <p className="text-sm text-soft">Transaction monitoring with receipt download support.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">Total: {statusSummary.total}</span>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">Success: {statusSummary.success}</span>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700">Pending: {statusSummary.pending}</span>
          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-rose-700">Failed: {statusSummary.failed}</span>
        </div>
      </div>

      <Card className="grid gap-3 p-4 md:grid-cols-2">
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input-base" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-base">
          <option value="ALL">ALL</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAILED">FAILED</option>
          <option value="PENDING">PENDING</option>
        </select>
      </Card>

      {loading ? <Skeleton className="h-72" /> : <Table columns={columns} data={filtered} emptyText="No payments found for this filter." />}

      <Modal open={Boolean(selected)} title="Payment Details" onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-base p-3 text-main">
              <p><strong>ID:</strong> {selected.id}</p>
              <p><strong>Tenant:</strong> {selected.tenant}</p>
              <p><strong>Method:</strong> {selected.method}</p>
              <p><strong>Amount:</strong> {formatCurrency(selected.amount)}</p>
              <p><strong>Date:</strong> {formatDate(selected.date)}</p>
            </div>
            <div className="flex justify-between">
              <StatusBadge status={selected.status} />
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => startGatewayCheckout(selected)}>Pay via Gateway</Button>
                <Button onClick={() => downloadReceipt(selected)}>Download Receipt</Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
