import { Routes, Route, Navigate } from 'react-router-dom'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import HomePage from './pages/HomePage'
import { useUserRole } from './context/UserRoleContext'
import MisReportesPage from './pages/MisReportesPage'
import NuevoReportePage from './pages/NuevoReportePage'
import ReporteDetallePage from './pages/ReporteDetallePage'
import EditarReportePage from './pages/EditarReportePage'
import MapaPage from './pages/MapaPage'
import ConfiguracionPage from './pages/ConfiguracionPage'
import AyudaPage from './pages/AyudaPage'
import MiResumenPage from './pages/admin/MiResumenPage'
import AdminReportesPage from './pages/admin/AdminReportesPage'
import AdminUsuariosPage from './pages/admin/AdminUsuariosPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import SuperadminRoute from './components/SuperadminRoute'
import AppLayout from './components/layout/AppLayout'
import { ReportesProvider } from './context/ReportesContext'

function DashboardRoute() {
  const { role } = useUserRole()
  const isAdmin = role === 'admin' || role === 'superadmin'
  return isAdmin ? <AdminDashboardPage /> : <HomePage />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sign-in" replace />} />
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      <Route
        element={
          <ProtectedRoute>
            <ReportesProvider>
              <AppLayout />
            </ReportesProvider>
          </ProtectedRoute>
        }
      >
        {/* Rutas para todos los usuarios autenticados */}
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/reportes/resumen" element={<MiResumenPage />} />
        <Route path="/reportes" element={<MisReportesPage />} />
        <Route path="/reportes/nuevo" element={<NuevoReportePage />} />
        <Route path="/reportes/:id" element={<ReporteDetallePage />} />
        <Route path="/reportes/:id/editar" element={<EditarReportePage />} />
        <Route path="/mapa" element={<MapaPage />} />
        <Route path="/configuracion" element={<ConfiguracionPage />} />
        <Route path="/ayuda" element={<AyudaPage />} />

        {/* Rutas para admin y superadmin */}
        <Route
          path="/admin/reportes"
          element={
            <AdminRoute>
              <AdminReportesPage />
            </AdminRoute>
          }
        />

        {/* Rutas solo para superadmin */}
        <Route
          path="/admin/usuarios"
          element={
            <SuperadminRoute>
              <AdminUsuariosPage />
            </SuperadminRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}