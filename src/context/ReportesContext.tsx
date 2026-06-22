import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@clerk/clerk-react'
import { apiFetch } from '@/lib/api'

export type EstadoReporte = 'Pendiente' | 'En revisión' | 'Resuelto'

export type Reporte = {
  id: string
  titulo: string
  descripcion: string
  ubicacion: string
  barrio: string | null
  categoria: string
  fecha: string
  estado: EstadoReporte
  autorId: string
  lat: number | null
  lng: number | null
  mediaUrls: string[]
  esAdherido: boolean
}

export type ReporteSimilar = {
  id: string
  titulo: string
  descripcion: string
  categoria: string
  ubicacion: string
  lat: number | null
  lng: number | null
  prioridad: string
  adhesiones: number
}

export type CreateReporteResult =
  | { tipo: 'creado'; reporte: Reporte }
  | { tipo: 'duplicado'; message: string }
  | { tipo: 'pendiente'; similares: ReporteSimilar[]; datosNormalizados: { title: string; description: string } }
  | { tipo: 'rechazado'; razon: string }

export const CATEGORIAS = [
  'Calles',
  'Alumbrado',
  'Higiene urbana',
  'Tránsito',
  'Espacios verdes',
  'Otro',
] as const

const STATUS_MAP: Record<string, EstadoReporte> = {
  open: 'Pendiente',
  in_progress: 'En revisión',
  resolved: 'Resuelto',
}

function backendToReporte(r: Record<string, unknown>): Reporte {
  const location = r.location as { lat?: number; lng?: number; address?: string; barrio?: string | null } | undefined
  const createdAt = r.createdAt as string | undefined
  const d = createdAt ? new Date(createdAt) : new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const imageUrls = (r.imageUrls as string[] | undefined) ?? []
  const imageUrl = r.imageUrl as string | null | undefined
  return {
    id: r._id as string,
    titulo: r.title as string,
    descripcion: r.description as string,
    categoria: r.category as string,
    ubicacion: location?.address ?? '',
    barrio: location?.barrio ?? null,
    lat: location?.lat ?? null,
    lng: location?.lng ?? null,
    fecha: `${dd}/${mm}/${d.getFullYear()}`,
    estado: STATUS_MAP[r.status as string] ?? 'Pendiente',
    autorId: (r.userId as string) ?? '',
    mediaUrls: imageUrls.length ? imageUrls : imageUrl ? [imageUrl] : [],
    esAdherido: r.esPrincipal === false,
  }
}

function backendToSimilar(r: Record<string, unknown>): ReporteSimilar {
  const location = r.location as { lat?: number; lng?: number; address?: string } | undefined
  return {
    id: r._id as string,
    titulo: r.title as string,
    descripcion: r.description as string,
    categoria: r.category as string,
    ubicacion: location?.address ?? '',
    lat: location?.lat ?? null,
    lng: location?.lng ?? null,
    prioridad: (r.priority as string) ?? 'media',
    adhesiones: (r.adhesiones as number) ?? 0,
  }
}

function parseApiError(res: Response, body: Record<string, unknown>): string {
  if (res.status === 401) return 'No autorizado. Por favor iniciá sesión nuevamente.'
  if (res.status === 403) return 'No tenés permiso para realizar esta acción.'
  if (res.status === 400) return (body.error as string) ?? 'Datos inválidos.'
  return (body.error as string) ?? `Error del servidor (${res.status})`
}

type CreateReporteData = Omit<Reporte, 'id' | 'fecha' | 'estado' | 'autorId' | 'ubicacion' | 'esAdherido' | 'barrio'> & {
  address: string
  barrio?: string | null
  forzarCreacion?: boolean
}

type UpdateReporteData = {
  titulo?: string
  descripcion?: string
  categoria?: string
  address?: string
  lat?: number | null
  lng?: number | null
  mediaUrls?: string[]
}

type ReportesContextValue = {
  reportes: Reporte[]
  loading: boolean
  error: string | null
  currentUserId: string | null
  getReporte: (id: string) => Reporte | undefined
  createReporte: (data: CreateReporteData) => Promise<CreateReporteResult>
  updateReporte: (id: string, data: UpdateReporteData) => Promise<Reporte>
  deleteReporte: (id: string) => Promise<void>
  adherirReporte: (reporteId: string) => Promise<void>
  canEdit: (reporte: Reporte) => boolean
}

const ReportesContext = createContext<ReportesContextValue | null>(null)

export function ReportesProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth()
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    apiFetch(`${import.meta.env.VITE_API_URL}/api/reports/me`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(parseApiError(res, body))
        }
        return res.json()
      })
      .then((data: Record<string, unknown>[]) => setReportes(data.map(backendToReporte)))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const getReporte = useCallback(
    (id: string) => reportes.find((r) => r.id === id),
    [reportes]
  )

  const createReporte = useCallback(async ({ address, barrio, forzarCreacion, ...data }: CreateReporteData): Promise<CreateReporteResult> => {
    const body = {
      title: data.titulo,
      description: data.descripcion,
      category: data.categoria,
      location: { lat: data.lat, lng: data.lng, address, barrio: barrio ?? null },
      imageUrls: data.mediaUrls,
      forzarCreacion,
    }

    const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/reports`, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const resBody = await res.json().catch(() => ({})) as Record<string, unknown>

    if (res.status === 422) {
      return { tipo: 'rechazado', razon: (resBody.razon as string) ?? 'El reporte no pudo ser procesado.' }
    }

    if (res.status === 409) {
      return { tipo: 'duplicado', message: (resBody.message as string) ?? 'Ya tenés un reporte similar en esta zona' }
    }

    if (res.status === 200 && resBody.pendiente) {
      const similares = (resBody.similares as Record<string, unknown>[]).map(backendToSimilar)
      return {
        tipo: 'pendiente',
        similares,
        datosNormalizados: resBody.datosNormalizados as { title: string; description: string },
      }
    }

    if (!res.ok) {
      throw new Error(parseApiError(res, resBody))
    }

    const nuevo = backendToReporte(resBody.report as Record<string, unknown>)
    setReportes((prev) => [nuevo, ...prev])
    return { tipo: 'creado', reporte: nuevo }
  }, [])

  const updateReporte = useCallback(async (id: string, data: UpdateReporteData): Promise<Reporte> => {
    const body: Record<string, unknown> = {}
    if (data.titulo !== undefined) body.title = data.titulo
    if (data.descripcion !== undefined) body.description = data.descripcion
    if (data.categoria !== undefined) body.category = data.categoria
    if (data.address !== undefined) body.location = { lat: data.lat, lng: data.lng, address: data.address }
    if (data.mediaUrls !== undefined) body.imageUrls = data.mediaUrls

    const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(parseApiError(res, errBody))
    }

    const saved = await res.json()
    const actualizado = backendToReporte(saved)
    setReportes((prev) => prev.map((r) => (r.id === id ? actualizado : r)))
    return actualizado
  }, [])

  const deleteReporte = useCallback(async (id: string): Promise<void> => {
    const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/reports/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(parseApiError(res, errBody))
    }

    setReportes((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const adherirReporte = useCallback(async (reporteId: string): Promise<void> => {
    const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/reports/${reporteId}/adherir`, {
      method: 'POST',
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(parseApiError(res, errBody))
    }

    const data = await res.json() as Record<string, unknown>
    const adherido = backendToReporte(data.reporteAdherido as Record<string, unknown>)
    setReportes((prev) => [adherido, ...prev])
  }, [])

  const canEdit = useCallback((r: Reporte) => r.estado === 'Pendiente', [])

  const value = useMemo<ReportesContextValue>(
    () => ({
      reportes,
      loading,
      error,
      currentUserId: userId ?? null,
      getReporte,
      createReporte,
      updateReporte,
      deleteReporte,
      adherirReporte,
      canEdit,
    }),
    [reportes, loading, error, userId, getReporte, createReporte, updateReporte, deleteReporte, adherirReporte, canEdit]
  )

  return (
    <ReportesContext.Provider value={value}>
      {children}
    </ReportesContext.Provider>
  )
}

export function useReportes() {
  const ctx = useContext(ReportesContext)
  if (!ctx) throw new Error('useReportes must be used within ReportesProvider')
  return ctx
}
