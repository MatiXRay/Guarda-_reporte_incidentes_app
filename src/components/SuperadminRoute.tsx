import { Navigate } from 'react-router-dom'
import { useUserRole } from '@/context/UserRoleContext'

export default function SuperadminRoute({ children }: { children: React.ReactNode }) {
    const { role, loading } = useUserRole()

    if (loading) return null

    if (role !== 'superadmin') {
        return <Navigate to="/dashboard" replace />
    }

    return <>{children}</>
}