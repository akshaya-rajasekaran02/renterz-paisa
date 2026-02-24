import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROLE_HOME_PATH, ROLES } from '../constants/roles'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={ROLE_HOME_PATH[user?.role] || '/dashboard'} replace />
  }
  if (user?.role !== ROLES.SUPER_ADMIN && user?.buildingStatus && user.buildingStatus !== 'ACTIVE') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
