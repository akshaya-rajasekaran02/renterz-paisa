import { Navigate, Route, Routes } from 'react-router-dom'
import { ALL_ROLES, ROLES } from '../constants/roles'
import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import LandingLayout from '../layouts/LandingLayout'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import LoginPage from '../pages/auth/LoginPage'
import AdminProfileSettingsPage from '../pages/admin/AdminProfileSettingsPage'
import CommunicationPage from '../pages/communication/CommunicationPage'
import ComplaintPage from '../pages/complaint/ComplaintPage'
import AdminDashboard from '../pages/dashboard/AdminDashboard'
import OwnerDashboard from '../pages/dashboard/OwnerDashboard'
import SuperAdminDashboard from '../pages/dashboard/SuperAdminDashboard'
import TenantDashboard from '../pages/dashboard/TenantDashboard'
import DamageReportPage from '../pages/damage/DamageReportPage'
import DocumentationPage from '../pages/landing/DocumentationPage'
import LandingPage from '../pages/landing/LandingPage'
import MaintenancePage from '../pages/maintenance/MaintenancePage'
import PaymentPage from '../pages/payment/PaymentPage'
import OwnerModulePage from '../pages/owner/OwnerModulePage'
import PropertyDetailPage from '../pages/property/PropertyDetailPage'
import PropertyListPage from '../pages/property/PropertyListPage'
import RentPage from '../pages/rent/RentPage'
import UnitPage from '../pages/unit/UnitPage'
import UserManagementPage from '../pages/user/UserManagementPage'
import { useAuth } from '../hooks/useAuth'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

function RoleDashboard() {
  const { user } = useAuth()

  if (user?.role === ROLES.SUPER_ADMIN) return <Navigate to="/super-admin" replace />
  if (user?.role === ROLES.BUILDING_ADMIN || user?.role === ROLES.ADMIN) return <AdminDashboard />
  if (user?.role === ROLES.OWNER) return <OwnerDashboard />
  return <TenantDashboard />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<LandingLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/documentation" element={<DocumentationPage />} />
      </Route>

      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<RoleDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]} />}>
        <Route element={<AppLayout />}>
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.BUILDING_ADMIN, ROLES.OWNER, ROLES.TENANT]} />}>
        <Route element={<AppLayout />}>
          <Route path="/rent" element={<RentPage />} />
          <Route path="/complaints" element={<ComplaintPage />} />
          <Route path="/damage-reports" element={<DamageReportPage />} />
          <Route path="/communication" element={<CommunicationPage />} />
          <Route path="/payments" element={<PaymentPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.BUILDING_ADMIN]} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin/profile-settings" element={<AdminProfileSettingsPage />} />
          <Route path="/properties" element={<PropertyListPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/users" element={<UserManagementPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.BUILDING_ADMIN, ROLES.OWNER]} />}>
        <Route element={<AppLayout />}>
          <Route path="/maintenance" element={<MaintenancePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.OWNER]} />}>
        <Route element={<AppLayout />}>
          <Route path="/owner" element={<OwnerModulePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.BUILDING_ADMIN, ROLES.OWNER]} />}>
        <Route element={<AppLayout />}>
          <Route path="/units" element={<UnitPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
