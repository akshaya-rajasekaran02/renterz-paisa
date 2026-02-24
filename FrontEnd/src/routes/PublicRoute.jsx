import { Navigate, Outlet } from 'react-router-dom'
import { ROLE_HOME_PATH } from '../constants/roles'
import { useAuth } from '../hooks/useAuth'

export default function PublicRoute() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Outlet />
  return <Navigate to={ROLE_HOME_PATH[user?.role] || '/dashboard'} replace />
}
