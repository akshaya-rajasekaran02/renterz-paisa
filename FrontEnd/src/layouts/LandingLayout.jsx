import HomeButton from '../components/ui/HomeButton'
import { Outlet } from 'react-router-dom'

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-main">
      <Outlet />
      <HomeButton />
    </div>
  )
}
