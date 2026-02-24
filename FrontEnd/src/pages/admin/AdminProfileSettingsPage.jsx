import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { profileService } from '../../services/profileService'

export default function AdminProfileSettingsPage() {
  const { user, setSessionUser } = useAuth()
  const { showToast } = useToast()
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const adminLabel = useMemo(
    () => (user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Building Admin'),
    [user?.role]
  )

  const saveProfile = async (event) => {
    event.preventDefault()
    if (!profileForm.fullName.trim() || !profileForm.email.trim()) {
      showToast('Name and email are required.', 'error')
      return
    }
    setSavingProfile(true)
    try {
      const updated = await profileService.updateMyProfile({
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        mobile: profileForm.mobile.trim(),
      })
      const merged = {
        ...user,
        fullName: updated?.fullName || profileForm.fullName.trim(),
        email: updated?.email || profileForm.email.trim(),
        mobile: updated?.mobile ?? profileForm.mobile.trim(),
      }
      setSessionUser(merged)
      showToast('Profile updated successfully.', 'success')
    } catch (error) {
      showToast(error?.response?.data?.message || error.message || 'Unable to update profile.', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast('Fill all password fields.', 'error')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      showToast('New password must be at least 8 characters.', 'error')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New password and confirm password must match.', 'error')
      return
    }

    setSavingPassword(true)
    try {
      await profileService.changeMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showToast('Password changed successfully.', 'success')
    } catch (error) {
      showToast(error?.response?.data?.message || error.message || 'Unable to change password.', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <p className="text-sm text-soft">Manage your {adminLabel} account details and password.</p>
      </div>

      <Card>
        <h3 className="text-lg font-semibold">Account Details</h3>
        <form className="mt-3 grid gap-3 md:grid-cols-2" onSubmit={saveProfile}>
          <input
            className="input-base"
            value={profileForm.fullName}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))}
            placeholder="Full Name"
          />
          <input
            className="input-base"
            value={profileForm.email}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="Email"
          />
          <input
            className="input-base md:col-span-2"
            value={profileForm.mobile}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, mobile: event.target.value }))}
            placeholder="Mobile"
          />
          <div className="md:col-span-2">
            <Button type="submit" disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save Profile'}</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Change Password</h3>
        <form className="mt-3 grid gap-3 md:grid-cols-2" onSubmit={savePassword}>
          <input
            type="password"
            className="input-base"
            value={passwordForm.currentPassword}
            onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
            placeholder="Current Password"
          />
          <input
            type="password"
            className="input-base"
            value={passwordForm.newPassword}
            onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
            placeholder="New Password"
          />
          <input
            type="password"
            className="input-base md:col-span-2"
            value={passwordForm.confirmPassword}
            onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
            placeholder="Confirm New Password"
          />
          <div className="md:col-span-2">
            <Button type="submit" disabled={savingPassword}>{savingPassword ? 'Updating...' : 'Change Password'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
