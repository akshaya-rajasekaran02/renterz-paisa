import { useEffect, useMemo, useState } from 'react'
import { Bot, Plus, Send, Sparkles } from 'lucide-react'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import StatusBadge from '../../components/ui/StatusBadge'
import { DAMAGE_REPORTS_KEY, PAYMENTS_KEY } from '../../constants/app'
import { ROLES } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import { usePageLoading } from '../../hooks/usePageLoading'
import { useToast } from '../../hooks/useToast'
import { dashboardByRole, damageReportsSeed, paymentsSeed, rentsSeed, unitsSeed } from '../../services/mockData'
import { analyzeDamageWithAi } from '../../services/damageAiService'
import { damageService } from '../../services/damageService'
import { userService } from '../../services/userService'
import { formatCurrency } from '../../utils/formatters'

const emptyStartForm = {
  property: '',
  unit: '',
  floor: '',
  tenantName: '',
  tenantEmail: '',
  startImages: [],
}

const emptyCloseForm = {
  reportId: null,
  endImages: [],
  estimatedCost: '',
  aiAssessment: null,
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Unable to read file'))
    reader.readAsDataURL(file)
  })
}

function normalizeReport(item) {
  const startImages = Array.isArray(item.startImages)
    ? item.startImages
    : item.beforeImage
    ? [item.beforeImage]
    : []
  const endImages = Array.isArray(item.endImages)
    ? item.endImages
    : item.afterImage
    ? [item.afterImage]
    : []

  const unit = String(item.unit || '').trim()
  const normalizedUnit = unit.toUpperCase()
  const rentHit = rentsSeed.find((rent) => String(rent.unit || '').trim().toUpperCase() === normalizedUnit)
  const seedHit = damageReportsSeed.find((report) => String(report.unit || '').trim().toUpperCase() === normalizedUnit)
  const singleTenant = userService.listUsers().find((entry) => entry.role === ROLES.TENANT)

  const estimatedCost = Number(item.estimatedCost)
  const safeCost = Number.isFinite(estimatedCost) && estimatedCost > 0 ? estimatedCost : null

  return {
    ...item,
    property: item.property || '',
    unit,
    floor: item.floor || '',
    tenantName: item.tenantName || rentHit?.tenant || 'Tenant',
    tenantEmail: item.tenantEmail || seedHit?.tenantEmail || singleTenant?.email || '',
    startImages,
    endImages,
    estimatedCost: safeCost,
    aiAssessment: item.aiAssessment || null,
    status: item.status || (endImages.length ? 'CLOSED' : 'OPEN'),
    paymentAdded: Boolean(item.paymentAdded),
  }
}

function readReports() {
  try {
    const raw = localStorage.getItem(DAMAGE_REPORTS_KEY)
    const parsed = raw ? JSON.parse(raw) : damageReportsSeed
    const source = Array.isArray(parsed) ? parsed : damageReportsSeed
    return source.map(normalizeReport)
  } catch {
    return damageReportsSeed.map(normalizeReport)
  }
}

function readPayments() {
  try {
    const raw = localStorage.getItem(PAYMENTS_KEY)
    const parsed = raw ? JSON.parse(raw) : paymentsSeed
    return Array.isArray(parsed) ? parsed : paymentsSeed
  } catch {
    return paymentsSeed
  }
}

function toIsoDate(value = new Date()) {
  return new Date(value).toISOString().slice(0, 10)
}

export default function DamageReportPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const loading = usePageLoading(350)

  const [reports, setReports] = useState(readReports)
  const [startForm, setStartForm] = useState(emptyStartForm)
  const [closeForm, setCloseForm] = useState(emptyCloseForm)
  const [startOpen, setStartOpen] = useState(false)
  const [closeOpen, setCloseOpen] = useState(false)
  const [savingStart, setSavingStart] = useState(false)
  const [savingClose, setSavingClose] = useState(false)
  const [runningAi, setRunningAi] = useState(false)

  const isAdmin = user?.role === ROLES.BUILDING_ADMIN || user?.role === ROLES.ADMIN
  const userEmail = String(user?.email || '').trim().toLowerCase()
  const tenantFallbackUnit = dashboardByRole.TENANT.unit.unitNo

  const visibleReports = useMemo(() => {
    if (isAdmin || user?.role === ROLES.OWNER) return reports
    if (user?.role === ROLES.TENANT) {
      return reports.filter((item) => {
        const assignedByEmail = String(item.tenantEmail || '').trim().toLowerCase() === userEmail
        const assignedByUnit = String(item.unit || '').trim().toUpperCase() === tenantFallbackUnit.toUpperCase()
        return assignedByEmail || assignedByUnit
      })
    }
    return reports
  }, [isAdmin, reports, tenantFallbackUnit, user?.role, userEmail])

  const persistReports = (next) => {
    setReports(next)
    localStorage.setItem(DAMAGE_REPORTS_KEY, JSON.stringify(next))
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        if (isAdmin) {
          if (!cancelled) setReports(readReports())
          return
        }
        if (user?.role === ROLES.OWNER) {
          const records = await damageService.listOwnerDamages()
          if (!cancelled) setReports(records.map(normalizeReport))
          return
        }
        if (user?.role === ROLES.TENANT) {
          const records = await damageService.listTenantDamages()
          if (!cancelled) setReports(records.map(normalizeReport))
          return
        }
        if (!cancelled) setReports(readReports())
      } catch {
        if (!cancelled) setReports(readReports())
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isAdmin, user?.role])

  const resolveTenantByUnit = (unitValue) => {
    const normalized = String(unitValue || '').trim().toUpperCase()
    const unitMatch = unitsSeed.find((unit) => String(unit.unitNo || '').trim().toUpperCase() === normalized)
    const rentMatch = rentsSeed.find((rent) => String(rent.unit || '').trim().toUpperCase() === normalized)
    const seedMatch = damageReportsSeed.find((entry) => String(entry.unit || '').trim().toUpperCase() === normalized)
    const singleTenant = userService.listUsers().find((entry) => entry.role === ROLES.TENANT)

    return {
      property: unitMatch?.property || '',
      floor: unitMatch?.floor ? String(unitMatch.floor) : '',
      tenantName: rentMatch?.tenant || '',
      tenantEmail: seedMatch?.tenantEmail || singleTenant?.email || '',
    }
  }

  useEffect(() => {
    const unitValue = String(startForm.unit || '').trim()
    if (!unitValue) return

    const info = resolveTenantByUnit(unitValue)
    if (!info.tenantName && !info.tenantEmail && !info.property && !info.floor) return

    setStartForm((prev) => {
      const next = {
        ...prev,
        property: info.property || prev.property,
        floor: info.floor || prev.floor,
        tenantName: info.tenantName || prev.tenantName,
        tenantEmail: info.tenantEmail || prev.tenantEmail,
      }

      const unchanged =
        next.property === prev.property &&
        next.floor === prev.floor &&
        next.tenantName === prev.tenantName &&
        next.tenantEmail === prev.tenantEmail

      return unchanged ? prev : next
    })
  }, [startForm.unit])

  const handlePickMultipleImages = async (files, target) => {
    if (!files?.length) return

    const selectedFiles = Array.from(files)
    if (selectedFiles.some((file) => !file.type.startsWith('image/'))) {
      showToast('Please upload only image files.', 'error')
      return
    }

    try {
      const encoded = await Promise.all(selectedFiles.map((file) => fileToDataUrl(file)))
      if (target === 'start') {
        setStartForm((prev) => ({ ...prev, startImages: [...prev.startImages, ...encoded] }))
      } else {
        setCloseForm((prev) => ({ ...prev, endImages: [...prev.endImages, ...encoded] }))
      }
    } catch {
      showToast('Unable to process selected image(s).', 'error')
    }
  }

  const removeStartImage = (index) => {
    setStartForm((prev) => ({ ...prev, startImages: prev.startImages.filter((_, idx) => idx !== index) }))
  }

  const removeEndImage = (index) => {
    setCloseForm((prev) => ({ ...prev, endImages: prev.endImages.filter((_, idx) => idx !== index) }))
  }

  const openCloseModal = (report) => {
    setCloseForm({
      reportId: report.id,
      endImages: Array.isArray(report.endImages) ? report.endImages : [],
      estimatedCost: report.estimatedCost || '',
      aiAssessment: report.aiAssessment || null,
    })
    setCloseOpen(true)
  }

  const runAiDetection = async () => {
    const target = reports.find((item) => item.id === closeForm.reportId)
    if (!target) {
      showToast('Damage report not found.', 'error')
      return
    }
    if (!target.startImages?.length || !closeForm.endImages?.length) {
      showToast('Add at least one start and end image for AI detection.', 'error')
      return
    }

    setRunningAi(true)
    try {
      const result = await analyzeDamageWithAi({
        startImage: target.startImages[0],
        endImage: closeForm.endImages[0],
      })
      setCloseForm((prev) => ({
        ...prev,
        aiAssessment: result,
        estimatedCost: prev.estimatedCost || String(result.suggestedEstimate),
      }))
      showToast('AI detection completed.', 'success')
    } catch (error) {
      showToast(error.message || 'Unable to run AI detection.', 'error')
    } finally {
      setRunningAi(false)
    }
  }

  const handleStartDamage = async (event) => {
    event.preventDefault()
    if (!isAdmin || savingStart) return

    const payload = {
      property: startForm.property.trim(),
      unit: startForm.unit.trim(),
      floor: startForm.floor.trim(),
      tenantName: startForm.tenantName.trim(),
      tenantEmail: startForm.tenantEmail.trim().toLowerCase(),
      startImages: startForm.startImages,
    }

    if (!payload.property || !payload.unit || !payload.floor || !payload.tenantName || !payload.tenantEmail || !payload.startImages.length) {
      showToast('Add start images, property, unit, floor and fetch tenant details.', 'error')
      return
    }

    setSavingStart(true)
    try {
      const nextReport = normalizeReport({
        id: Date.now(),
        property: payload.property,
        unit: payload.unit,
        floor: Number(payload.floor),
        tenantName: payload.tenantName,
        tenantEmail: payload.tenantEmail,
        startImages: payload.startImages,
        endImages: [],
        estimatedCost: null,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        createdBy: user?.email || 'admin',
        paymentAdded: false,
      })

      const next = [nextReport, ...reports]
      persistReports(next)
      setStartForm(emptyStartForm)
      setStartOpen(false)
      showToast('Start damage card added.', 'success')
    } finally {
      setSavingStart(false)
    }
  }

  const handleCloseAndAddPayment = async (event) => {
    event.preventDefault()
    if (!isAdmin || savingClose) return

    const target = reports.find((item) => item.id === closeForm.reportId)
    if (!target) {
      showToast('Damage report not found.', 'error')
      return
    }

    const estimatedCost = Number(closeForm.estimatedCost)
    if (!closeForm.endImages.length || !Number.isFinite(estimatedCost) || estimatedCost <= 0) {
      showToast('Add end images and valid estimated cost.', 'error')
      return
    }

    setSavingClose(true)
    try {
      const nextReports = reports.map((item) =>
        item.id === closeForm.reportId
          ? {
              ...item,
              endImages: closeForm.endImages,
              estimatedCost,
              aiAssessment: closeForm.aiAssessment || item.aiAssessment || null,
              status: 'CLOSED',
              paymentAdded: true,
              closedAt: new Date().toISOString(),
            }
          : item
      )
      persistReports(nextReports)

      const payments = readPayments()
      const alreadyAdded = payments.some((item) => item.damageReportId === closeForm.reportId)
      if (!alreadyAdded) {
      const paymentEntry = {
          id: new Date().getTime(),
          tenant: target.tenantName || target.tenantEmail || `Unit ${target.unit}`,
          amount: estimatedCost,
          date: toIsoDate(),
          status: 'PENDING',
          method: 'DAMAGE_ADJUSTMENT',
          damageReportId: closeForm.reportId,
        }
        localStorage.setItem(PAYMENTS_KEY, JSON.stringify([paymentEntry, ...payments]))
      }

      setCloseForm(emptyCloseForm)
      setCloseOpen(false)
      showToast('End pictures saved and added to payments.', 'success')
    } finally {
      setSavingClose(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-80" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Damage Reports</h2>
          <p className="text-sm text-soft">Create a card with multiple damage photos, then close on vacating and add estimated cost to payments.</p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            onClick={() => setStartOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
          >
            <Plus size={15} />
            Create Card
          </button>
        ) : null}
      </div>

      {visibleReports.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleReports.map((item) => (
            <Card key={item.id}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-main">{item.property || 'Property'} | Unit {item.unit || '-'}</h3>
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-1 text-xs text-soft">
                Floor {item.floor || '-'} | Tenant: {item.tenantName || '-'}
              </p>

              <div className="mt-3">
                <p className="mb-1 text-xs font-semibold text-soft">Start Pictures</p>
                <div className="grid grid-cols-2 gap-2">
                  {(item.startImages || []).map((src, index) => (
                    <img key={`${item.id}-start-${index}`} src={src} alt={`Start ${index + 1}`} className="h-28 w-full rounded-xl object-cover" />
                  ))}
                </div>
              </div>

              {item.endImages?.length ? (
                <div className="mt-3">
                  <p className="mb-1 text-xs font-semibold text-soft">End Pictures</p>
                  <div className="grid grid-cols-2 gap-2">
                    {item.endImages.map((src, index) => (
                      <img key={`${item.id}-end-${index}`} src={src} alt={`End ${index + 1}`} className="h-28 w-full rounded-xl object-cover" />
                    ))}
                  </div>
                </div>
              ) : null}

              <p className="mt-3 text-sm text-main">Estimated Cost: <strong>{item.estimatedCost ? formatCurrency(item.estimatedCost) : '-'}</strong></p>
              {item.aiAssessment ? (
                <div className="mt-2 rounded-xl border border-base bg-surface-soft p-2.5 text-xs">
                  <p className="font-semibold text-main">AI Assessment</p>
                  <p className="mt-1 text-soft">Severity: <strong>{item.aiAssessment.severity}</strong> | Confidence: <strong>{item.aiAssessment.confidence}%</strong></p>
                  <p className="text-soft">Changed Area: <strong>{item.aiAssessment.changedAreaPct}%</strong> | Suggestion: <strong>{formatCurrency(item.aiAssessment.suggestedEstimate)}</strong></p>
                </div>
              ) : null}
              {item.paymentAdded ? <p className="mt-1 text-xs font-semibold text-emerald-600">Added to payments</p> : null}

              {isAdmin && item.status !== 'CLOSED' ? (
                <button
                  type="button"
                  onClick={() => openCloseModal(item)}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-base px-3 py-2 text-xs font-semibold text-main transition hover-surface-soft"
                >
                  <Send size={13} />
                  Close / Vacating
                </button>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title={isAdmin ? 'No damage reports yet' : 'No reports assigned to you'}
          subtitle={isAdmin ? 'Tap Create Card to add a new damage card.' : 'Assigned damage cards will appear here.'}
        />
      )}

      <Modal open={startOpen} title="Create Card" onClose={() => setStartOpen(false)}>
        <form className="space-y-3" onSubmit={handleStartDamage}>
          <input
            value={startForm.unit}
            onChange={(event) => setStartForm((prev) => ({ ...prev, unit: event.target.value }))}
            className="input-base"
            placeholder="Unit / Room Number (auto fetches details)"
          />

          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={startForm.property}
              onChange={(event) => setStartForm((prev) => ({ ...prev, property: event.target.value }))}
              className="input-base"
              placeholder="Property Name"
            />
            <input
              value={startForm.floor}
              onChange={(event) => setStartForm((prev) => ({ ...prev, floor: event.target.value }))}
              className="input-base"
              placeholder="Floor"
            />
            <input
              value={startForm.tenantName}
              onChange={(event) => setStartForm((prev) => ({ ...prev, tenantName: event.target.value }))}
              className="input-base"
              placeholder="Tenant Name"
            />
            <input
              value={startForm.tenantEmail}
              onChange={(event) => setStartForm((prev) => ({ ...prev, tenantEmail: event.target.value }))}
              className="input-base"
              placeholder="Tenant Email"
              type="email"
            />
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-base p-4 text-center text-soft transition hover:bg-surface-soft">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => handlePickMultipleImages(event.target.files, 'start')}
            />
            <Plus size={18} />
            <span className="text-xs font-semibold">Add Start Pictures (multiple)</span>
          </label>

          {startForm.startImages.length ? (
            <div className="grid grid-cols-3 gap-2">
              {startForm.startImages.map((src, index) => (
                <button type="button" key={`start-pick-${index}`} className="relative" onClick={() => removeStartImage(index)}>
                  <img src={src} alt={`Start upload ${index + 1}`} className="h-20 w-full rounded-lg object-cover" />
                  <span className="absolute right-1 top-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] text-white">x</span>
                </button>
              ))}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={savingStart}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Send size={15} />
            {savingStart ? 'Saving...' : 'Create Damage Card'}
          </button>
        </form>
      </Modal>

      <Modal open={closeOpen} title="Close Damage / Vacating" onClose={() => setCloseOpen(false)}>
        <form className="space-y-3" onSubmit={handleCloseAndAddPayment}>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-base p-4 text-center text-soft transition hover:bg-surface-soft">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => handlePickMultipleImages(event.target.files, 'end')}
            />
            <Plus size={18} />
            <span className="text-xs font-semibold">Add End Pictures (multiple)</span>
          </label>

          {closeForm.endImages.length ? (
            <div className="grid grid-cols-3 gap-2">
              {closeForm.endImages.map((src, index) => (
                <button type="button" key={`end-pick-${index}`} className="relative" onClick={() => removeEndImage(index)}>
                  <img src={src} alt={`End upload ${index + 1}`} className="h-20 w-full rounded-lg object-cover" />
                  <span className="absolute right-1 top-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] text-white">x</span>
                </button>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            onClick={runAiDetection}
            disabled={runningAi}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-base px-4 py-2 text-sm font-semibold text-main transition hover-surface-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Bot size={15} />
            {runningAi ? 'Analyzing...' : 'Run AI Damage Detection'}
          </button>

          {closeForm.aiAssessment ? (
            <div className="rounded-xl border border-base bg-surface-soft p-3 text-sm">
              <p className="inline-flex items-center gap-1 font-semibold text-main"><Sparkles size={14} /> AI Damage Insights</p>
              <p className="mt-1 text-soft">
                Severity: <strong>{closeForm.aiAssessment.severity}</strong> | Confidence: <strong>{closeForm.aiAssessment.confidence}%</strong>
              </p>
              <p className="text-soft">
                Changed Area: <strong>{closeForm.aiAssessment.changedAreaPct}%</strong> | Suggested: <strong>{formatCurrency(closeForm.aiAssessment.suggestedEstimate)}</strong>
              </p>
              <p className="mt-1 text-soft">Recommended Range: <strong>{formatCurrency(closeForm.aiAssessment.estimatedCostRange.min)} - {formatCurrency(closeForm.aiAssessment.estimatedCostRange.max)}</strong></p>
              <ul className="mt-2 list-disc pl-5 text-soft">
                {closeForm.aiAssessment.primaryIssues.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
              <p className="mt-1 text-soft">{closeForm.aiAssessment.recommendation}</p>
            </div>
          ) : null}

          <input
            value={closeForm.estimatedCost}
            onChange={(event) => setCloseForm((prev) => ({ ...prev, estimatedCost: event.target.value }))}
            className="input-base"
            placeholder="Estimated Cost"
            type="number"
            min="1"
          />

          <button
            type="submit"
            disabled={savingClose}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Send size={15} />
            {savingClose ? 'Saving...' : 'Save and Add to Payment'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

