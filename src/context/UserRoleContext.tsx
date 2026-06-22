import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { apiFetch, setTokenGetter } from '@/lib/api'
import { LoadingScreen, ErrorScreen } from '@/components/layout/AppScreens'

type Role = string | null

interface UserRoleContextType {
  role: Role
  mongoId: string | null
  loading: boolean
}

const UserRoleContext = createContext<UserRoleContextType>({ role: null, mongoId: null, loading: true })

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded, getToken } = useAuth()
  const [role, setRole] = useState<Role>(null)
  const [mongoId, setMongoId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setTokenGetter(getToken)
  }, [getToken])

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      setRole(null)
      setLoading(false)
      setError(false)
      return
    }

    setLoading(true)
    setError(false)

    apiFetch(`${import.meta.env.VITE_API_URL}/api/auth/sync`, { method: 'POST' })
      .then((res) => res.json())
      .then((data) => { setRole(data.role); setMongoId(data.mongoId ?? null); setError(false) })
      .catch(() => { setRole(null); setMongoId(null); setError(true) })
      .finally(() => setLoading(false))
  }, [isSignedIn, isLoaded, retryCount])

  // Bloquea el render mientras Clerk inicializa o mientras se obtiene el rol
  if (!isLoaded || (isSignedIn && loading)) {
    return <LoadingScreen />
  }

  // Backend caído o sin respuesta — solo para usuarios autenticados
  if (isSignedIn && error) {
    return <ErrorScreen onRetry={() => setRetryCount((c) => c + 1)} />
  }

  return (
    <UserRoleContext.Provider value={{ role, mongoId, loading }}>
      {children}
    </UserRoleContext.Provider>
  )
}

export const useUserRole = () => useContext(UserRoleContext)
