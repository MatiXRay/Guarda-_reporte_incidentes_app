import { useAuth } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { setTokenGetter } from '@/lib/api'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded, getToken } = useAuth()

  useEffect(() => {
    if (isSignedIn) {
      setTokenGetter(getToken)
    }
  }, [isSignedIn, getToken])

  if (!isLoaded) return null
  if (!isSignedIn) return <Navigate to="/sign-in" replace />

  return <>{children}</>
}
