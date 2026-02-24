import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, Heart, Pencil, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import Skeleton from '../../components/ui/Skeleton'
import StatusBadge from '../../components/ui/StatusBadge'
import { PROPERTY_TYPES } from '../../constants/status'
import { useAuth } from '../../hooks/useAuth'
import { usePagination } from '../../hooks/usePagination'
import { useToast } from '../../hooks/useToast'
import { inventoryService } from '../../services/inventoryService'
import { propertyService } from '../../services/propertyService'
import buildingPreview from '../../assets/Building/download.jpg'

const emptyProperty = { name: '', city: '', type: 'Apartment', status: 'ACTIVE', units: 0 }

export default function PropertyListPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState([])
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formState, setFormState] = useState(emptyProperty)
  const [deleteId, setDeleteId] = useState(null)

  const filtered = useMemo(() => {
    return properties.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchesCity = cityFilter === 'ALL' || item.city === cityFilter
      const matchesType = typeFilter === 'ALL' || item.type === typeFilter
      return matchesSearch && matchesCity && matchesType
    })
  }, [properties, search, cityFilter, typeFilter])

  const cities = useMemo(() => ['ALL', ...new Set(properties.map((property) => property.city))], [properties])
  const { page, setPage, totalPages, paginatedItems } = usePagination(filtered)

  const openAdd = () => {
    setEditingId(null)
    setFormState(emptyProperty)
    setModalOpen(true)
  }

  const openEdit = (property) => {
    setEditingId(property.id)
    setFormState(property)
    setModalOpen(true)
  }

  const saveProperty = async (event) => {
    event.preventDefault()
    const submitAction = event.nativeEvent?.submitter?.value || 'save'
    const unitCount = Number(formState.units)
    if (!formState.name.trim() || !formState.city.trim()) {
      showToast('Property name and city are required.', 'error')
      return
    }
    if (!editingId && (!Number.isFinite(unitCount) || unitCount < 1)) {
      showToast('Total units must be at least 1.', 'error')
      return
    }
    try {
      let savedProperty = null
      if (editingId) {
        savedProperty = await propertyService.updateProperty(editingId, formState)
      } else {
        savedProperty = await propertyService.createProperty(formState, user?.id)
      }
      const remote = await propertyService.listProperties()
      setProperties(remote.map((item) => ({ ...item, units: item.units || 0 })))
      setModalOpen(false)
      if (!editingId && submitAction === 'allocate' && savedProperty?.id) {
        navigate(`/units?propertyId=${savedProperty.id}&allocation=OWNER_PENDING`)
      }
    } catch (error) {
      try {
        const savedProperty = inventoryService.saveProperty(formState, editingId)
        setProperties(inventoryService.getProperties())
        setModalOpen(false)
        if (!editingId && submitAction === 'allocate' && savedProperty?.id) {
          navigate(`/units?propertyId=${savedProperty.id}&allocation=OWNER_PENDING`)
        }
        showToast('Saved using local fallback.', 'info')
      } catch (fallbackError) {
        showToast(error?.response?.data?.message || fallbackError.message || 'Unable to save property.', 'error')
      }
    }
  }

  const confirmDelete = async () => {
    try {
      await propertyService.deleteProperty(deleteId)
      const remote = await propertyService.listProperties()
      setProperties(remote.map((item) => ({ ...item, units: item.units || 0 })))
      setDeleteId(null)
      showToast('Property deleted successfully.', 'success')
    } catch (error) {
      try {
        inventoryService.deleteProperty(deleteId)
        setProperties(inventoryService.getProperties())
        setDeleteId(null)
        showToast('Deleted using local fallback.', 'info')
      } catch (fallbackError) {
        showToast(error?.response?.data?.message || fallbackError.message || 'Unable to delete property.', 'error')
      }
    }
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const remote = await propertyService.listProperties()
        if (!cancelled) {
          setProperties(remote.map((item) => ({ ...item, units: item.units || 0 })))
        }
      } catch {
        if (!cancelled) {
          setProperties(inventoryService.getProperties())
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Properties</h2>
          <p className="text-sm text-soft">Manage assets, types, and city-level inventory.</p>
        </div>
        <Button onClick={openAdd}>Add Property</Button>
      </div>

      <div className="card grid gap-3 p-4 md:grid-cols-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search property" className="input-base" />
        <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="input-base">
          {cities.map((city) => <option key={city} value={city}>{city}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-base">
          <option value="ALL">ALL</option>
          {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[380px] rounded-[28px]" />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {paginatedItems.map((property) => {
            const units = Number(property.units) || 0

            return (
              <article
                key={property.id}
                className="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-3 shadow-[0_16px_34px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#141518] dark:shadow-[0_16px_34px_rgba(0,0,0,0.34)]"
              >
                <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-[#f8fafc] dark:border-black/25 dark:bg-[#ececef]">
                  <img src={buildingPreview} alt={property.name} className="h-52 w-full object-cover" />
                  <button
                    type="button"
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-800 shadow-sm dark:bg-[#1f2024] dark:text-white"
                    onClick={() => showToast('Favorites will be available in next update.', 'info')}
                  >
                    <Heart size={16} />
                  </button>
                </div>

                <div className="pt-3 text-main dark:text-white">
                  <p className="truncate text-[2rem] leading-none" style={{ fontFamily: 'Sora, sans-serif' }}>
                    {units}
                  </p>
                  <p className="mt-0.5 text-sm text-soft dark:text-white/70">Units</p>

                  <h3 className="mt-2 truncate text-[1.9rem] font-semibold leading-tight">{property.name}</h3>
                  <p className="text-sm text-soft dark:text-white/70">{property.type} . {property.city}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${property.status === 'ACTIVE' ? 'border-emerald-300 bg-emerald-100 text-emerald-700' : 'border-rose-300 bg-rose-100 text-rose-700'}`}>
                      {property.status}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/properties/${property.id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-800 dark:border-white/10 dark:bg-white dark:text-[#111315]"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(property)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-800 dark:border-white/10 dark:bg-white/90 dark:text-[#111315]"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(property.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-300/40 dark:bg-white/90"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyState title="No properties found" subtitle="Try adjusting search/filter or create a new property." />
      )}
      {filtered.length > 0 ? <Pagination page={page} totalPages={totalPages} onPageChange={setPage} /> : null}

      <Modal open={modalOpen} title={editingId ? 'Edit Property' : 'Add Property'} onClose={() => setModalOpen(false)}>
        <form className="grid gap-3" onSubmit={saveProperty}>
          <input value={formState.name} onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))} placeholder="Property name" className="input-base" />
          <input value={formState.city} onChange={(e) => setFormState((prev) => ({ ...prev, city: e.target.value }))} placeholder="City" className="input-base" />
          <select value={formState.type} onChange={(e) => setFormState((prev) => ({ ...prev, type: e.target.value }))} className="input-base">
            {PROPERTY_TYPES.map((type) => <option key={type}>{type}</option>)}
          </select>
          <select value={formState.status} onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value }))} className="input-base">
            <option>ACTIVE</option>
            <option>INACTIVE</option>
          </select>
          <input
            type="number"
            min="1"
            value={formState.units}
            onChange={(e) => setFormState((prev) => ({ ...prev, units: Number(e.target.value) }))}
            placeholder="Total Units"
            className="input-base"
            disabled={Boolean(editingId)}
          />
          {editingId ? <p className="text-xs text-soft">Unit count is defined during property creation. Use Units tab only for owner/tenant allocation.</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            {!editingId ? <Button type="submit" value="save" variant="secondary">Save</Button> : null}
            {!editingId ? <Button type="submit" value="allocate">Save & Allocate</Button> : <Button type="submit" value="save">Save</Button>}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Property"
        message="This action will permanently remove the property record. Continue?"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
