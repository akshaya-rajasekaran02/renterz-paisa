import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import HomeButton from '../components/ui/HomeButton'
import { BASE_CURRENCY, CURRENCY_OPTIONS } from '../constants/currency'
import { ROLES } from '../constants/roles'
import { useAuth } from '../hooks/useAuth'
import { classNames } from '../utils/classNames'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'

export default function AppLayout() {
  const { user } = useAuth()
  const isBuildingAdmin = user?.role === ROLES.BUILDING_ADMIN || user?.role === ROLES.ADMIN
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN
  const [open, setOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('rp_dark_mode')
    if (saved === 'true') return true
    if (saved === 'false') return false
    return document.documentElement.classList.contains('dark')
  })
  const [currency, setCurrency] = useState(() => localStorage.getItem('rp_currency') || BASE_CURRENCY)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('rp_dark_mode', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('rp_currency', currency)
  }, [currency])

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar role={user?.role} open={open} onClose={() => setOpen(false)} />
      <div className={isBuildingAdmin ? 'lg:pl-24' : 'lg:pl-72'}>
        <TopNavbar
          onToggleSidebar={() => setOpen((prev) => !prev)}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
          currency={currency}
          onChangeCurrency={setCurrency}
          currencyOptions={CURRENCY_OPTIONS}
        />
        <main className={classNames('app-main workbench-theme p-4 md:p-6', isBuildingAdmin ? 'pb-32 lg:pb-6' : '')}>
          <Outlet />
        </main>
      </div>
      {!isBuildingAdmin && !isSuperAdmin ? <HomeButton /> : null}
    </div>
  )
}
