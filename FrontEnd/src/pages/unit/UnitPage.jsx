import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { History } from 'lucide-react'
import { usePageLoading } from '../../hooks/usePageLoading'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import StatusBadge from '../../components/ui/StatusBadge'
import Table from '../../components/ui/Table'
import { ROLES } from '../../constants/roles'
import { inventoryService } from '../../services/inventoryService'
import { rentService } from '../../services/rentService'
import { userService } from '../../services/userService'
import { COUNTRY_CODES } from '../../constants/countryCodes'

const allocationChips = [
  { value: 'ALL', label: 'All Units' },
  { value: 'OWNER_PENDING', label: 'Owner Pending' },
  { value: 'TENANT_PENDING', label: 'Tenant Pending' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'AVAILABLE', label: 'Available' },
]

const assignmentDefaults = {
  target: 'OWNER',
  fullName: '',
  email: '',
  age: '',
  sharingCapacity: '3',
  rentAmount: '',
  countryIso: 'IN',
  mobile: '',
  documentType: 'AADHAAR',
  documentNumber: '',
  photo: '',
  documentFile: '',
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function createTempPassword() {
  return `Temp@${Math.random().toString(36).slice(-8)}`
}

export default function UnitPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const loading = usePageLoading(350)
  const [units, setUnits] = useState(() => inventoryService.getUnits())
  const [allocatingId, setAllocatingId] = useState(null)
  const [assignmentForm, setAssignmentForm] = useState(assignmentDefaults)
  const [credentialNotice, setCredentialNotice] = useState(null)
  const [auditUnit, setAuditUnit] = useState(null)
  const [auditRecords, setAuditRecords] = useState([])
  const [tenantManageUnit, setTenantManageUnit] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const propertyFilter = searchParams.get('propertyId') || 'ALL'
  const allocationFilter = searchParams.get('allocation') || 'ALL'
  const properties = useMemo(() => inventoryService.getProperties(), [])
  const propertyById = useMemo(() => new Map(properties.map((item) => [Number(item.id), item])), [properties])
  const [sharingDraftByUnit, setSharingDraftByUnit] = useState({})

  // Sync units from backend on mount
  useEffect(() => {
    const sync = async () => {
      // First sync properties from backend so units can be linked
      await inventoryService.syncPropertiesFromBackend()
      // Then sync units
      const units = await inventoryService.syncUnitsFromBackend()
      setUnits(units)
    }
    sync()
  }, [])

  const targetUnit = useMemo(() => units.find((item) => item.id === allocatingId) || null, [units, allocatingId])
  const managingUnit = useMemo(() => units.find((item) => item.id === tenantManageUnit) || null, [tenantManageUnit, units])
  const propertyOptions = useMemo(() => {
    const unique = new Map()
    units.forEach((unit) => {
      const key = String(unit.propertyId ?? '')
      if (!unique.has(key)) unique.set(key, unit.property)
    })
    return Array.from(unique.entries())
  }, [units])

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const tenantNames = Array.isArray(unit.tenantProfiles) && unit.tenantProfiles.length
        ? unit.tenantProfiles.map((item) => item.fullName).join(' ')
        : unit.tenant || ''
      const text = `${unit.unitNo} ${unit.property} ${unit.owner || ''} ${tenantNames}`.toLowerCase()
      const matchesSearch = text.includes(searchTerm.toLowerCase())
      const matchesProperty = propertyFilter === 'ALL' || String(unit.propertyId) === propertyFilter
      const isPg = String(unit.propertyType || propertyById.get(Number(unit.propertyId))?.type || '').toUpperCase() === 'PG'
      const tenantCount = isPg
        ? (Array.isArray(unit.tenantProfiles) ? unit.tenantProfiles.length : (unit.tenant ? 1 : 0))
        : (unit.tenant ? 1 : 0)
      const sharingCapacity = Math.max(1, Number(unit.sharingCapacity) || (isPg ? 3 : 1))

      let matchesAllocation = true
      if (allocationFilter === 'OWNER_PENDING') matchesAllocation = !unit.owner
      if (allocationFilter === 'TENANT_PENDING') matchesAllocation = isPg ? tenantCount < sharingCapacity : !unit.tenant
      if (allocationFilter === 'OCCUPIED') matchesAllocation = isPg ? tenantCount >= sharingCapacity : unit.status === 'OCCUPIED'
      if (allocationFilter === 'AVAILABLE') matchesAllocation = isPg ? tenantCount < sharingCapacity : unit.status === 'AVAILABLE'

      return matchesSearch && matchesProperty && matchesAllocation
    })
  }, [units, searchTerm, propertyFilter, allocationFilter, propertyById])
  const openAllocation = (unit) => {
    const isPg = String(unit.propertyType || propertyById.get(Number(unit.propertyId))?.type || '').toUpperCase() === 'PG'
    const tenantCount = Array.isArray(unit.tenantProfiles) ? unit.tenantProfiles.length : (unit.tenant ? 1 : 0)
    const sharingCapacity = Math.max(1, Number(unit.sharingCapacity) || (isPg ? 3 : 1))
    const defaultTarget = !unit.owner ? 'OWNER' : 'TENANT'
    if (isPg && defaultTarget === 'TENANT' && tenantCount >= sharingCapacity) {
      showToast(`PG unit is full (${sharingCapacity}/${sharingCapacity}). Increase sharing to add more tenants.`, 'error')
      return
    }
    setAllocatingId(unit.id)
    setAssignmentForm({
      ...assignmentDefaults,
      target: defaultTarget,
      fullName: '',
      email: '',
      age: '',
      sharingCapacity: String(sharingCapacity),
      rentAmount: '',
      countryIso: 'IN',
      mobile: '',
      documentType: 'AADHAAR',
      documentNumber: '',
      photo: '',
      documentFile: '',
    })
  }

  const closeAllocation = () => {
    setAllocatingId(null)
    setAssignmentForm(assignmentDefaults)
  }

  const openAudit = (unit) => {
    setAuditUnit(unit)
    setAuditRecords(inventoryService.getUnitAudit(unit.id))
  }

  const isPgUnit = (unit) => String(unit?.propertyType || propertyById.get(Number(unit?.propertyId))?.type || '').toUpperCase() === 'PG'
  const getTenantProfiles = (unit) => {
    const fromList = Array.isArray(unit?.tenantProfiles) ? unit.tenantProfiles.filter(Boolean) : []
    if (fromList.length) return fromList
    if (unit?.tenantProfile) return [unit.tenantProfile]
    return []
  }
  const getTenantCount = (unit) => (isPgUnit(unit) ? getTenantProfiles(unit).length : (unit?.tenant ? 1 : 0))
  const getSharingCapacity = (unit) => Math.max(1, Number(unit?.sharingCapacity) || (isPgUnit(unit) ? 3 : 1))
  const allocatingIsPg = isPgUnit(targetUnit)
  const allocatingTenantCount = targetUnit ? getTenantCount(targetUnit) : 0
  const allocatingCapacity = targetUnit ? getSharingCapacity(targetUnit) : 1

  const handleSharingUpdate = (unit) => {
    const nextValue = Number(sharingDraftByUnit[unit.id] || getSharingCapacity(unit))
    if (!Number.isFinite(nextValue) || nextValue < 1) {
      showToast('Sharing count must be at least 1.', 'error')
      return
    }
    try {
      inventoryService.updateSharingCapacity(unit.id, nextValue)
      setUnits(inventoryService.getUnits())
      showToast('Sharing count updated.', 'success')
    } catch (error) {
      showToast(error.message || 'Unable to update sharing count.', 'error')
    }
  }

  const removeTenantFromPgUnit = (unit, tenantProfile) => {
    try {
      inventoryService.removeTenantFromUnit(unit.id, tenantProfile?.email, {
        assignedByUserId: user?.id || null,
        assignedByName: user?.fullName || 'Admin',
        assignedByEmail: user?.email || '',
      })
      const nextUnits = inventoryService.getUnits()
      setUnits(nextUnits)
      showToast('Tenant removed from unit.', 'success')
      const stillExists = nextUnits.some((item) => item.id === unit.id)
      if (!stillExists) {
        setTenantManageUnit(null)
      }
    } catch (error) {
      showToast(error.message || 'Unable to remove tenant.', 'error')
    }
  }

  const handleFileUpload = async (event, targetField) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      showToast('Only image or PDF files are allowed.', 'error')
      return
    }
    try {
      const encoded = await readAsDataUrl(file)
      setAssignmentForm((prev) => ({ ...prev, [targetField]: encoded }))
    } catch {
      showToast('Unable to process selected file.', 'error')
    }
  }

  const saveAllocation = () => {
    if (!targetUnit) return
    if (!assignmentForm.fullName.trim()) return showToast('Name is required.', 'error')
    if (!assignmentForm.email.trim()) return showToast('Email is required.', 'error')
    if (!/^\S+@\S+\.\S+$/.test(assignmentForm.email.trim())) return showToast('Enter a valid email.', 'error')
    if (!assignmentForm.age || Number(assignmentForm.age) < 18) return showToast('Age must be 18 or above.', 'error')
    if (assignmentForm.mobile.trim().length < 8) return showToast('Enter a valid mobile number.', 'error')
    if (!assignmentForm.photo) return showToast('Profile photo is required.', 'error')
    if (!assignmentForm.documentNumber.trim()) return showToast('Document number is required.', 'error')
    if (!assignmentForm.documentFile) return showToast('Aadhaar/PAN document file is required.', 'error')
    if (assignmentForm.target === 'TENANT' && (!assignmentForm.rentAmount || Number(assignmentForm.rentAmount) <= 0)) {
      return showToast('Rent amount is required to start rent tracking.', 'error')
    }

    const userRole = assignmentForm.target === 'OWNER' ? ROLES.OWNER : ROLES.TENANT
    const currentBuildingId = user?.buildingId ?? null
    const selectedCountry = COUNTRY_CODES.find((item) => item.code === assignmentForm.countryIso) || COUNTRY_CODES[0]
    const isPgUnit = String(targetUnit.propertyType || propertyById.get(Number(targetUnit.propertyId))?.type || '').toUpperCase() === 'PG'
    const tenantCount = Array.isArray(targetUnit.tenantProfiles) ? targetUnit.tenantProfiles.length : (targetUnit.tenant ? 1 : 0)
    const sharingCapacity = Math.max(1, Number(assignmentForm.sharingCapacity) || Number(targetUnit.sharingCapacity) || (isPgUnit ? 3 : 1))
    if (assignmentForm.target === 'TENANT' && isPgUnit && tenantCount >= sharingCapacity) {
      return showToast(`Sharing limit reached (${sharingCapacity}). Increase sharing count to add a tenant.`, 'error')
    }
    const payload = {
      fullName: assignmentForm.fullName.trim(),
      email: assignmentForm.email.trim(),
      age: Number(assignmentForm.age),
      mobile: `${selectedCountry.dialCode}${assignmentForm.mobile.trim()}`,
      documentType: assignmentForm.documentType,
      documentNumber: assignmentForm.documentNumber.trim(),
      photo: assignmentForm.photo,
      documentFile: assignmentForm.documentFile,
      sharingCapacity,
    }

    try {
      const existing = userService.findByEmail(payload.email)
      let tempPassword = null
      if (!existing) {
        tempPassword = createTempPassword()
        userService.addUser({
          fullName: payload.fullName,
          email: payload.email,
          mobile: payload.mobile,
          age: payload.age,
          documentType: payload.documentType,
          documentNumber: payload.documentNumber,
          photo: payload.photo,
          documentFile: payload.documentFile,
          role: userRole,
          password: tempPassword,
          buildingId: currentBuildingId,
          source: 'UNIT_ASSIGNMENT',
        })
      } else if (existing.role !== userRole) {
        return showToast(`This email already belongs to ${existing.role}. Use a ${userRole} account email.`, 'error')
      } else if (
        currentBuildingId !== null
        && existing.buildingId !== null
        && Number(existing.buildingId) !== Number(currentBuildingId)
      ) {
        return showToast('This user belongs to another building. Use a user from your building only.', 'error')
      } else if (currentBuildingId !== null && existing.buildingId == null) {
        userService.assignBuildingById(existing.id, currentBuildingId)
      }

      inventoryService.allocateUnit(targetUnit.id, assignmentForm.target, payload, {
        assignedByUserId: user?.id || null,
        assignedByName: user?.fullName || 'Admin',
        assignedByEmail: user?.email || '',
      })
      if (assignmentForm.target === 'TENANT') {
        rentService.upsertRent({
          unitId: targetUnit.id,
          unit: targetUnit.unitNo,
          tenant: payload.fullName,
          tenantEmail: payload.email,
          userEmail: payload.email,
          amount: Number(assignmentForm.rentAmount),
          createdByUserId: user?.id || null,
          createdByUserEmail: user?.email || '',
          source: 'UNIT_ASSIGNMENT',
        })
      }
      setUnits(inventoryService.getUnits())
      if (tempPassword) {
        setCredentialNotice({
          role: userRole,
          email: payload.email,
          password: tempPassword,
        })
      }
      showToast(
        assignmentForm.target === 'OWNER'
          ? 'Owner assigned successfully.'
          : 'Tenant assigned and rent tracking started.',
        'success'
      )
      closeAllocation()
    } catch (error) {
      showToast(error.message || 'Unable to assign user.', 'error')
    }
  }

  const handlePropertyFilter = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'ALL') next.delete('propertyId')
    else next.set('propertyId', value)
    setSearchParams(next)
  }

  const handleAllocationFilter = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'ALL') next.delete('allocation')
    else next.set('allocation', value)
    setSearchParams(next)
  }

  const columns = [
    { key: 'unitNo', label: 'Unit No' },
    { key: 'property', label: 'Property' },
    { key: 'floor', label: 'Floor' },
    {
      key: 'unitType',
      label: 'Unit Type',
      render: (row) => (isPgUnit(row) ? 'PG' : 'Standard'),
    },
    {
      key: 'sharing',
      label: 'Sharing',
      render: (row) => {
        const isPg = isPgUnit(row)
        const tenantCount = getTenantCount(row)
        const capacity = isPg ? getSharingCapacity(row) : 1
        const isFull = tenantCount >= capacity
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold">{tenantCount}/{capacity}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFull ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
              {isFull ? 'FULL' : 'OPEN'}
            </span>
            {isPg ? (
              <>
                <input
                  type="number"
                  min="1"
                  value={sharingDraftByUnit[row.id] ?? String(capacity)}
                  onChange={(event) => setSharingDraftByUnit((prev) => ({ ...prev, [row.id]: event.target.value.replace(/\D/g, '') }))}
                  className="h-8 w-16 rounded-lg border border-base bg-surface px-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleSharingUpdate(row)}
                  className="h-8 rounded-lg border border-base px-2 text-xs font-semibold"
                >
                  Save
                </button>
              </>
            ) : null}
          </div>
        )
      },
    },
    { key: 'owner', label: 'Owner', render: (row) => row.owner || '-' },
    {
      key: 'tenant',
      label: 'Tenant',
      render: (row) => {
        const isPg = isPgUnit(row)
        if (isPg) {
          const names = getTenantProfiles(row).map((item) => item.fullName).filter(Boolean)
          return names.length ? names.join(', ') : '-'
        }
        return row.tenant || '-'
      },
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button type="button" className="rounded-lg border border-base px-2.5 py-1" onClick={() => openAllocation(row)}>
            Assign User
          </button>
          <button type="button" className="rounded-lg border border-base px-2.5 py-1" onClick={() => setTenantManageUnit(row.id)}>
            Manage Tenants
          </button>
          <button type="button" className="rounded-lg border border-base px-2.5 py-1" onClick={() => openAudit(row)}>
            <span className="inline-flex items-center gap-1"><History size={13} /> History</span>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Units</h2>
          <p className="text-sm text-soft">Owner manages unit assignments by filling complete user details and documents.</p>
        </div>
      </div>

      <div className="card grid gap-3 p-4 md:grid-cols-2">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by unit, property, owner or tenant"
          className="input-base"
        />
        <select value={propertyFilter} onChange={(e) => handlePropertyFilter(e.target.value)} className="input-base">
          <option value="ALL">All Properties</option>
          {propertyOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        <div className="md:col-span-2 flex flex-wrap gap-2">
          {allocationChips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => handleAllocationFilter(chip.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${allocationFilter === chip.value ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-base text-soft hover:bg-slate-50'}`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Skeleton className="h-72" /> : <Table columns={columns} data={filteredUnits} emptyText="No units match this filter. Try another search or allocation chip." />}

      <Modal open={Boolean(allocatingId)} title="Assign User to Unit" onClose={closeAllocation}>
        <div className="space-y-3">
          {targetUnit ? (
            <div className="rounded-xl border border-base bg-surface-soft px-3 py-2">
              <p className="text-sm font-semibold text-main">{targetUnit.property} | {targetUnit.unitNo}</p>
              <p className="text-xs text-soft">
                Type: {allocatingIsPg ? 'PG' : 'Standard'}
                {allocatingIsPg ? ` | Sharing: ${allocatingTenantCount}/${Math.max(1, Number(assignmentForm.sharingCapacity) || allocatingCapacity)}` : ''}
              </p>
            </div>
          ) : null}
          <select
            value={assignmentForm.target}
            onChange={(e) => setAssignmentForm((prev) => ({ ...prev, target: e.target.value }))}
            className="input-base"
          >
            <option value="OWNER">{targetUnit?.owner ? 'Update Owner' : 'Assign as Owner'}</option>
            <option value="TENANT">{targetUnit?.tenant ? 'Update Tenant' : 'Assign as Tenant'}</option>
          </select>
          {targetUnit && assignmentForm.target === 'TENANT' && allocatingIsPg ? (
            <input
              type="number"
              min="1"
              value={assignmentForm.sharingCapacity}
              onChange={(e) => setAssignmentForm((prev) => ({ ...prev, sharingCapacity: e.target.value.replace(/\D/g, '') }))}
              placeholder="Sharing Count"
              className="input-base"
            />
          ) : null}
          {targetUnit && assignmentForm.target === 'TENANT' ? (
            <div>
              <input
                type="number"
                min="1"
                value={assignmentForm.rentAmount}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, rentAmount: e.target.value }))}
                placeholder="Rent Amount"
                className="input-base"
              />
              <p className="mt-1 text-xs text-soft">Rent period will auto-start today and end after one month.</p>
            </div>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={assignmentForm.fullName}
              onChange={(e) => setAssignmentForm((prev) => ({ ...prev, fullName: e.target.value }))}
              placeholder="Full Name"
              className="input-base"
            />
            <input
              type="email"
              value={assignmentForm.email}
              onChange={(e) => setAssignmentForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
              className="input-base"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="number"
              min="18"
              value={assignmentForm.age}
              onChange={(e) => setAssignmentForm((prev) => ({ ...prev, age: e.target.value }))}
              placeholder="Age"
              className="input-base"
            />
            <div className="grid gap-2 md:grid-cols-[160px_1fr]">
              <select
                value={assignmentForm.countryIso}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, countryIso: e.target.value }))}
                className="input-base"
              >
                {COUNTRY_CODES.map((item) => <option key={item.code} value={item.code}>{item.code} ({item.dialCode})</option>)}
              </select>
              <input
                value={assignmentForm.mobile}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, mobile: e.target.value.replace(/\D/g, '').slice(0, 15) }))}
                placeholder="Mobile Number"
                className="input-base"
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <select
              value={assignmentForm.documentType}
              onChange={(e) => setAssignmentForm((prev) => ({ ...prev, documentType: e.target.value }))}
              className="input-base"
            >
              <option value="AADHAAR">Aadhaar</option>
              <option value="PAN">PAN</option>
            </select>
            <input
              value={assignmentForm.documentNumber}
              onChange={(e) => setAssignmentForm((prev) => ({ ...prev, documentNumber: e.target.value }))}
              placeholder={assignmentForm.documentType === 'AADHAAR' ? 'Aadhaar Number' : 'PAN Number'}
              className="input-base"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-main">Photo</span>
              <input type="file" accept="image/*" className="input-base file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5" onChange={(e) => handleFileUpload(e, 'photo')} />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-main">Aadhaar/PAN Document</span>
              <input type="file" accept="image/*,application/pdf" className="input-base file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5" onChange={(e) => handleFileUpload(e, 'documentFile')} />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeAllocation}>Cancel</Button>
            <Button onClick={saveAllocation}>Assign User</Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(credentialNotice)} title="User Credentials" onClose={() => setCredentialNotice(null)}>
        <div className="space-y-3 text-sm">
          <p className="text-soft">New user account created. Share these credentials securely.</p>
          <div className="rounded-xl border border-base p-3">
            <p><span className="text-soft">Role:</span> {credentialNotice?.role}</p>
            <p><span className="text-soft">Email:</span> {credentialNotice?.email}</p>
            <p><span className="text-soft">Temporary Password:</span> <span className="font-semibold">{credentialNotice?.password}</span></p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setCredentialNotice(null)}>Done</Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(auditUnit)} title="Allocation History" onClose={() => setAuditUnit(null)}>
        <div className="space-y-3 text-sm">
          {auditUnit ? <p className="text-soft">{auditUnit.property} | {auditUnit.unitNo}</p> : null}
          {!auditRecords.length ? <p className="text-soft">No allocation history for this unit.</p> : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {auditRecords.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-base p-3">
                  <p className="font-semibold">{entry.allocationType} assigned to {entry.assigneeName}</p>
                  <p className="text-soft">{entry.assigneeEmail || 'No email'} | {new Date(entry.createdAt).toLocaleString()}</p>
                  <p className="text-soft">By: {entry.assignedByName || 'Admin'} ({entry.assignedByEmail || 'N/A'})</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setAuditUnit(null)}>Close</Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(tenantManageUnit)} title="Manage Tenants" onClose={() => setTenantManageUnit(null)}>
        <div className="space-y-3 text-sm">
          {managingUnit ? <p className="text-soft">{managingUnit.property} | {managingUnit.unitNo}</p> : null}
          {managingUnit && !getTenantProfiles(managingUnit).length ? (
            <p className="text-soft">No tenants assigned to this unit.</p>
          ) : null}
          {managingUnit ? (
            <div className="space-y-2">
              {getTenantProfiles(managingUnit).map((tenant) => (
                <div key={tenant.email} className="flex items-center justify-between rounded-xl border border-base p-3">
                  <div>
                    <p className="font-semibold text-main">{tenant.fullName || 'Tenant'}</p>
                    <p className="text-xs text-soft">{tenant.email || 'No email'} | {tenant.mobile || 'No mobile'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTenantFromPgUnit(managingUnit, tenant)}
                    className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex justify-end">
            <Button onClick={() => setTenantManageUnit(null)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
