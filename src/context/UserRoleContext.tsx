import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { apiFetch, setTokenGetter } from '@/lib/api'

type Role = string | null

interface UserRoleContextType {
  role: Role
  loading: boolean
}

const UserRoleContext = createContext<UserRoleContextType>({ role: null, loading: true })

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded, getToken } = useAuth()
  const [role, setRole] = useState<Role>(null)
  const [loading, setLoading] = useState(true)

  // Keep the token getter up-to-date so apiFetch always uses a fresh token.
  // This runs before the sync effect because effects run in declaration order.
  useEffect(() => {
    setTokenGetter(getToken)
  }, [getToken])

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      setRole(null)
      setLoading(false)
      return
    }

    apiFetch(`${import.meta.env.VITE_API_URL}/api/auth/sync`, { method: 'POST' })
      .then((res) => res.json())
      .then((data) => setRole(data.role))
      .catch(() => setRole(null))
      .finally(() => setLoading(false))
  }, [isSignedIn, isLoaded])

  return (
    <UserRoleContext.Provider value={{ role, loading }}>
      {children}
    </UserRoleContext.Provider>
  )
}

export const useUserRole = () => useContext(UserRoleContext)
