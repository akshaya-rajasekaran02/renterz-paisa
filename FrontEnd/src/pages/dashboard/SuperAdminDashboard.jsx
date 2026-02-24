import { useEffect, useState } from 'react'
import { Building2, Plus } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import { useToast } from '../../hooks/useToast'
import { buildingService } from '../../services/buildingService'

const initialForm = { name: '', dbName: '', dbUrl: '' }

export default function SuperAdminDashboard() {
  const { showToast } = useToast()
  const [buildings, setBuildings] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await buildingService.listBuildings()
      setBuildings(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!form.name || !form.dbName || !form.dbUrl) {
      showToast('Building name, db name and db url are required.', 'error')
      return
    }
    try {
      await buildingService.createBuilding(form)
      setForm(initialForm)
      showToast('Building created successfully.', 'success')
      load()
    } catch (error) {
      showToast(error.message || 'Unable to create building.', 'error')
    }
  }

  const toggleStatus = async (row) => {
    const nextStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await buildingService.setBuildingStatus(row.id, nextStatus)
      showToast(`Building ${nextStatus.toLowerCase()} successfully.`, 'success')
      load()
    } catch (error) {
      showToast(error.message || 'Unable to update status.', 'error')
    }
  }

  const columns = [
    { key: 'name', label: 'Building' },
    { key: 'dbName', label: 'DB Name' },
    { key: 'dbUrl', label: 'DB URL' },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button variant="secondary" onClick={() => toggleStatus(row)}>
          {row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Super Admin Dashboard</h2>
        <p className="text-sm text-soft">Manage building onboarding and activation from platform scope.</p>
      </div>

      <Card>
        <h3 className="text-lg font-semibold">Create Building</h3>
        <form className="mt-3 grid gap-3 md:grid-cols-4" onSubmit={handleCreate}>
          <input className="input-base" placeholder="Building Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          <input className="input-base" placeholder="DB Name" value={form.dbName} onChange={(e) => setForm((prev) => ({ ...prev, dbName: e.target.value }))} />
          <input className="input-base md:col-span-2" placeholder="DB URL" value={form.dbUrl} onChange={(e) => setForm((prev) => ({ ...prev, dbUrl: e.target.value }))} />
          <div className="md:col-span-4">
            <Button type="submit"><Plus size={14} /> Create Building</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="mb-3 text-lg font-semibold">Buildings</h3>
        {loading ? (
          <p className="text-sm text-soft">Loading buildings...</p>
        ) : (
          <Table columns={columns} data={buildings} emptyText="No buildings found." />
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-sm text-soft">
          <Building2 size={16} />
          SUPER_ADMIN has platform-wide building visibility only. Tenant operational data is not exposed here.
        </div>
      </Card>
    </div>
  )
}
