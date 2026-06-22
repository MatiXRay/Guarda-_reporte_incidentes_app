import { useAuth } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth()

  if (!isSignedIn) return <Navigate to="/sign-in" replace />

  return <>{children}</>
}
