import { useCallback, useEffect, useMemo, useState } from 'react'
import { Globe2, KeyRound, Plus, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { ROLES } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { buildingAdminService } from '../../services/buildingAdminService'
import { COUNTRY_CODES } from '../../constants/countryCodes'

const initialForm = {
  fullName: '',
  email: '',
  mobile: '',
  countryIso: 'IN',
  role: ROLES.TENANT,
  password: '',
}

function makeTempPassword() {
  return `Temp@${Math.random().toString(36).slice(-8)}`
}

export default function UserManagementPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openAdd, setOpenAdd] = useState(false)
  const [formData, setFormData] = useState(initialForm)
  const [countryQuery, setCountryQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [resetNotice, setResetNotice] = useState(null)
  const selectedCountry = useMemo(
    () => COUNTRY_CODES.find((item) => item.code === formData.countryIso) || COUNTRY_CODES[0],
    [formData.countryIso]
  )

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const records = await buildingAdminService.listUsers()
      setUsers(records)
    } catch (error) {
      showToast(error?.response?.data?.message || 'Unable to load users.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    const roleScoped = users.filter((entry) => entry.role === ROLES.OWNER || entry.role === ROLES.TENANT)
    const query = search.trim().toLowerCase()
    if (!query) return roleScoped
    return roleScoped.filter((entry) => {
      const text = `${entry.fullName} ${entry.email} ${entry.mobile || ''} ${entry.role}`.toLowerCase()
      return text.includes(query)
    })
  }, [search, users])

  const filteredCountryCodes = useMemo(() => {
    const query = countryQuery.trim().toLowerCase()
    if (!query) return COUNTRY_CODES
    return COUNTRY_CODES.filter((item) => `${item.name} ${item.dialCode} ${item.code}`.toLowerCase().includes(query))
  }, [countryQuery])

  const handleAddUser = async (event) => {
    event.preventDefault()
    if (!formData.fullName || !formData.email || !formData.password) {
      showToast('Name, email and password are required', 'error')
      return
    }
    if (formData.password.length < 8) {
      showToast('Password must be at least 8 characters', 'error')
      return
    }
    if (![ROLES.OWNER, ROLES.TENANT].includes(formData.role)) {
      showToast('Only OWNER and TENANT can be created here.', 'error')
      return
    }

    try {
      await buildingAdminService.createUser({
        ...formData,
        mobile: formData.mobile ? `${selectedCountry.dialCode}${formData.mobile}` : '',
      })
      setFormData(initialForm)
      setCountryQuery('')
      setOpenAdd(false)
      showToast('User added successfully', 'success')
      loadUsers()
    } catch (error) {
      showToast(error?.response?.data?.message || error.message || 'Unable to add user', 'error')
    }
  }

  const requestRemove = (target) => {
    if (target.email === user?.email) {
      showToast('You cannot remove your own building admin account', 'error')
      return
    }
    setDeleteTarget(target)
  }

  const handleRemove = async () => {
    if (!deleteTarget) return
    try {
      await buildingAdminService.removeUser(deleteTarget.id)
      setDeleteTarget(null)
      showToast('User removed successfully', 'success')
      loadUsers()
    } catch (error) {
      showToast(error?.response?.data?.message || error.message || 'Unable to remove user.', 'error')
    }
  }

  const handleResetPassword = async (target) => {
    try {
      const response = await buildingAdminService.resetPassword(target.id)
      setResetNotice({
        fullName: target.fullName,
        email: target.email,
        password: response?.temporaryPassword || makeTempPassword(),
      })
      showToast('Temporary password generated.', 'success', 7000)
    } catch (error) {
      showToast(error?.response?.data?.message || error.message || 'Unable to reset password.', 'error')
    }
  }

  const columns = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'mobile', label: 'Mobile', render: (row) => row.mobile || '-' },
    { key: 'role', label: 'Role' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => handleResetPassword(row)} className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-700">
            <KeyRound size={13} /> Reset PW
          </button>
          <button
            type="button"
            onClick={() => requestRemove(row)}
            disabled={row.email === user?.email}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={13} /> Remove
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Owners & Tenants</h2>
          <p className="text-sm text-soft">ADMIN can create and manage OWNER and TENANT users only.</p>
        </div>
        <Button onClick={() => setOpenAdd(true)}><Plus size={15} /> Add User</Button>
      </div>

      <div className="card p-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, mobile or role" className="input-base" />
      </div>

      {loading ? (
        <div className="card p-4 text-sm text-soft">Loading users...</div>
      ) : filteredUsers.length ? (
        <Table columns={columns} data={filteredUsers} />
      ) : (
        <EmptyState title="No users found" subtitle="Try another search or add a new user." />
      )}

      <Modal open={openAdd} title="Add User" onClose={() => { setOpenAdd(false); setCountryQuery('') }}>
        <form className="grid gap-3" onSubmit={handleAddUser}>
          <input name="fullName" value={formData.fullName} onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))} className="input-base" placeholder="Full Name" />
          <input name="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} className="input-base" placeholder="Email" />
          <div className="grid gap-2 md:grid-cols-[220px_1fr]">
            <div>
              <input
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
                placeholder="Search country"
                className="input-base mb-2"
              />
              <div className="relative">
                <Globe2 size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-soft" />
                <select
                  name="countryIso"
                  value={formData.countryIso}
                  onChange={(e) => setFormData((prev) => ({ ...prev, countryIso: e.target.value }))}
                  className="input-base !pl-9"
                >
                  {filteredCountryCodes.map((item) => <option key={item.code} value={item.code}>{item.name} ({item.dialCode})</option>)}
                </select>
              </div>
            </div>
            <input
              name="mobile"
              value={formData.mobile}
              onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value.replace(/\D/g, '').slice(0, 15) }))}
              className="input-base"
              placeholder="Mobile (optional)"
            />
          </div>
          <select name="role" value={formData.role} onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))} className="input-base">
            <option value={ROLES.OWNER}>OWNER</option>
            <option value={ROLES.TENANT}>TENANT</option>
          </select>
          <input name="password" value={formData.password} onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} type="password" className="input-base" placeholder="Password" />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => { setOpenAdd(false); setCountryQuery('') }}>Cancel</Button>
            <Button type="submit">Add User</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove User"
        message={deleteTarget ? `Are you sure you want to remove ${deleteTarget.fullName}?` : ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleRemove}
      />

      <Modal open={Boolean(resetNotice)} title="Temporary Password" onClose={() => setResetNotice(null)}>
        <div className="space-y-3 text-sm">
          <p className="text-soft">Share this with the user and ask them to change it after login.</p>
          <div className="rounded-xl border border-base p-3">
            <p><span className="text-soft">Name:</span> {resetNotice?.fullName}</p>
            <p><span className="text-soft">Email:</span> {resetNotice?.email}</p>
            <p><span className="text-soft">Temporary Password:</span> <span className="font-semibold">{resetNotice?.password}</span></p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setResetNotice(null)}>Done</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
