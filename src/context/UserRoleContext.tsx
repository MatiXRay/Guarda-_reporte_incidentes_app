/**
 * UserRoleContext
 *
 * Obtiene el rol del usuario desde el backend luego de autenticarse con Clerk.
 * El backend es el único responsable de validar el token, crear el user en MongoDB
 * y determinar su rol. Este contexto solo almacena lo que el backend devuelve.
 *
 * Uso:
 *   const { role, loading } = useUserRole()
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { apiFetch } from '@/lib/api'

/** Rol devuelto por el backend. null = no autenticado o sin respuesta aún. */
type Role = string | null

interface UserRoleContextType {
  role: Role
  loading: boolean
}

const UserRoleContext = createContext<UserRoleContextType>({ role: null, loading: true })

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  const [role, setRole] = useState<Role>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      setRole(null)
      setLoading(false)
      return
    }

    // El backend verifica el token, maneja el user en MongoDB y devuelve el rol
    apiFetch(`${import.meta.env.VITE_API_URL}/auth/sync`, { method: 'POST' })
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

/** Hook para consumir el rol en cualquier componente. */
export const useUserRole = () => useContext(UserRoleContext)
