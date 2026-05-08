import { Routes, Route, Navigate } from 'react-router-dom'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import HomePage from './pages/HomePage'
import MisReportesPage from './pages/MisReportesPage'
import NuevoReportePage from './pages/NuevoReportePage'
import ReporteDetallePage from './pages/ReporteDetallePage'
import EditarReportePage from './pages/EditarReportePage'
import MapaPage from './pages/MapaPage'
import ConfiguracionPage from './pages/ConfiguracionPage'
import AyudaPage from './pages/AyudaPage'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import { ReportesProvider } from './context/ReportesContext'

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
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/reportes" element={<MisReportesPage />} />
        <Route path="/reportes/nuevo" element={<NuevoReportePage />} />
        <Route path="/reportes/:id" element={<ReporteDetallePage />} />
        <Route path="/reportes/:id/editar" element={<EditarReportePage />} />
        <Route path="/mapa" element={<MapaPage />} />
        <Route path="/configuracion" element={<ConfiguracionPage />} />
        <Route path="/ayuda" element={<AyudaPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
