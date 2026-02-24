import { useMemo, useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import StatusBadge from '../../components/ui/StatusBadge'
import { useAuth } from '../../hooks/useAuth'
import { usePageLoading } from '../../hooks/usePageLoading'
import { useToast } from '../../hooks/useToast'
import { useNavigate } from 'react-router-dom'
import { dashboardByRole } from '../../services/mockData'
import { inventoryService } from '../../services/inventoryService'
import { paymentService } from '../../services/paymentService'
import { formatDate } from '../../utils/formatters'

export default function TenantDashboard() {
  const loading = usePageLoading()
  const navigate = useNavigate()
  const data = dashboardByRole.TENANT
  const { user } = useAuth()
  const { showToast } = useToast()
  const [processingPayment, setProcessingPayment] = useState(false)
  const assignedUnit = useMemo(() => {
    if (!user) return null
    const units = inventoryService.getUnits()
    return units.find((unit) => {
      const byEmail = unit.tenantProfile?.email && unit.tenantProfile.email.toLowerCase() === user.email?.toLowerCase()
      const byName = unit.tenant && unit.tenant.toLowerCase() === user.fullName?.toLowerCase()
      return byEmail || byName
    }) || null
  }, [user])
  const unitView = assignedUnit
    ? {
        unitNo: assignedUnit.unitNo,
        building: assignedUnit.property,
        rentStatus: assignedUnit.status === 'OCCUPIED' ? 'ACTIVE' : 'PENDING',
        dueDate: data.unit.dueDate,
      }
    : data.unit

  const handlePayNow = () => {
    if (processingPayment) return
    setProcessingPayment(true)
    try {
      paymentService.addTenantPayment({
        tenant: user?.fullName || 'Tenant User',
        unit: unitView.unitNo,
        method: 'UPI',
        userId: user?.id || null,
        userEmail: user?.email || '',
      })
      showToast('Payment successful. Added to payment history.', 'success')
    } catch {
      showToast('Unable to process payment right now', 'error')
    } finally {
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-56" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold">My Unit Details</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div><p className="text-soft">Unit</p><p className="font-semibold">{unitView.unitNo}</p></div>
          <div><p className="text-soft">Building</p><p className="font-semibold">{unitView.building}</p></div>
          <div><p className="text-soft">Rent Status</p><StatusBadge status={unitView.rentStatus} /></div>
          <div><p className="text-soft">Due Date</p><p className="font-semibold">{formatDate(unitView.dueDate)}</p></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" onClick={handlePayNow} disabled={processingPayment}>
            {processingPayment ? 'Processing...' : 'Pay Now'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/complaints')}>Raise Complaint</Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Communication History</h3>
        <ul className="mt-4 space-y-2 text-sm">
          {data.communication.map((message) => (
            <li key={message} className="rounded-xl border border-base px-3 py-2">{message}</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
