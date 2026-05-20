import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { apiFetch } from '@/lib/api'

export type EstadoReporte = 'Pendiente' | 'En revisión' | 'Resuelto'

export type Reporte = {
  id: string
  titulo: string
  descripcion: string
  ubicacion: string
  categoria: string
  fecha: string
  estado: EstadoReporte
  autorId: string
  lat: number | null
  lng: number | null
  mediaUrls: string[]
}

const CURRENT_USER_ID = 'me'

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
  const location = r.location as { lat?: number; lng?: number; address?: string } | undefined
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
    lat: location?.lat ?? null,
    lng: location?.lng ?? null,
    fecha: `${dd}/${mm}/${d.getFullYear()}`,
    estado: STATUS_MAP[r.status as string] ?? 'Pendiente',
    autorId: CURRENT_USER_ID,
    mediaUrls: imageUrls.length ? imageUrls : imageUrl ? [imageUrl] : [],
  }
}

type CreateReporteData = Omit<Reporte, 'id' | 'fecha' | 'estado' | 'autorId' | 'ubicacion'> & { address: string }

type ReportesContextValue = {
  reportes: Reporte[]
  loading: boolean
  getReporte: (id: string) => Reporte | undefined
  createReporte: (data: CreateReporteData) => Promise<Reporte>
  updateReporte: (
    id: string,
    data: Partial<Omit<Reporte, 'id' | 'autorId' | 'estado' | 'fecha'>> & { ubicacion?: string }
  ) => Reporte | undefined
  deleteReporte: (id: string) => void
  canEdit: (reporte: Reporte) => boolean
  currentUserId: string
}

const ReportesContext = createContext<ReportesContextValue | null>(null)

export function ReportesProvider({ children }: { children: ReactNode }) {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch(`${import.meta.env.VITE_API_URL}/api/reports`)
      .then((res) => res.json())
      .then((data: Record<string, unknown>[]) => setReportes(data.map(backendToReporte)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const getReporte = useCallback(
    (id: string) => reportes.find((r) => r.id === id),
    [reportes]
  )

  const createReporte = useCallback(async ({ address, ...data }: CreateReporteData): Promise<Reporte> => {
    const body = {
      title: data.titulo,
      description: data.descripcion,
      category: data.categoria,
      location: { lat: data.lat, lng: data.lng, address },
      imageUrls: data.mediaUrls,
    }

    const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/reports`, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as { error?: string }).error ?? `Error ${res.status}`)
    }

    const saved = await res.json()
    const nuevo = backendToReporte(saved)
    setReportes((prev) => [nuevo, ...prev])
    return nuevo
  }, [])

  const updateReporte: ReportesContextValue['updateReporte'] = useCallback(
    (id, data) => {
      let updated: Reporte | undefined
      setReportes((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r
          if (r.estado !== 'Pendiente') return r
          if (r.autorId !== CURRENT_USER_ID) return r
          updated = { ...r, ...data }
          return updated
        })
      )
      return updated
    },
    []
  )

  const deleteReporte = useCallback((id: string) => {
    setReportes((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const canEdit = useCallback(
    (r: Reporte) => r.estado === 'Pendiente' && r.autorId === CURRENT_USER_ID,
    []
  )

  const value = useMemo<ReportesContextValue>(
    () => ({
      reportes,
      loading,
      getReporte,
      createReporte,
      updateReporte,
      deleteReporte,
      canEdit,
      currentUserId: CURRENT_USER_ID,
    }),
    [reportes, loading, getReporte, createReporte, updateReporte, deleteReporte, canEdit]
  )

  return (
    <ReportesContext.Provider value={value}>
      {children}
    </ReportesContext.Provider>
  )
}

export function useReportes() {
  const ctx = useContext(ReportesContext)
  if (!ctx) {
    throw new Error('useReportes must be used within ReportesProvider')
  }
  return ctx
}
