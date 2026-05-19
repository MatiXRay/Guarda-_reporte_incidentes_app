import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type EstadoReporte = 'Pendiente' | 'En revisión' | 'Resuelto'

export type Reporte = {
  id: number
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

const seed: Reporte[] = [
  {
    id: 1,
    titulo: 'Bache en Av. Sabattini',
    descripcion:
      'Bache profundo en la mano norte, a la altura del 1200. Se llena de agua cuando llueve y los autos lo esquivan invadiendo el otro carril.',
    ubicacion: 'Av. Sabattini 1200',
    categoria: 'Calles',
    fecha: '05/05/2025',
    estado: 'Pendiente',
    autorId: CURRENT_USER_ID,
    lat: -32.4073,
    lng: -63.2387,
    mediaUrls: [],
  },
  {
    id: 2,
    titulo: 'Luminaria rota',
    descripcion:
      'La luz de la esquina dejó de funcionar hace una semana. La cuadra queda muy oscura de noche.',
    ubicacion: 'Bv. Alvear y Mendoza',
    categoria: 'Alumbrado',
    fecha: '03/05/2025',
    estado: 'En revisión',
    autorId: CURRENT_USER_ID,
    lat: null,
    lng: null,
    mediaUrls: [],
  },
  {
    id: 3,
    titulo: 'Basura sin recolectar',
    descripcion:
      'Los contenedores están llenos hace 3 días. Empieza a oler mal y a juntarse perros.',
    ubicacion: 'Calle San Martín 800',
    categoria: 'Higiene urbana',
    fecha: '01/05/2025',
    estado: 'Resuelto',
    autorId: CURRENT_USER_ID,
    lat: null,
    lng: null,
    mediaUrls: [],
  },
  {
    id: 4,
    titulo: 'Semáforo sin funcionar',
    descripcion:
      'El semáforo del cruce está apagado desde la mañana. Es un cruce muy transitado.',
    ubicacion: 'Av. Vélez Sarsfield y Buenos Aires',
    categoria: 'Tránsito',
    fecha: '28/04/2025',
    estado: 'Pendiente',
    autorId: CURRENT_USER_ID,
    lat: null,
    lng: null,
    mediaUrls: [],
  },
]

export const CATEGORIAS = [
  'Calles',
  'Alumbrado',
  'Higiene urbana',
  'Tránsito',
  'Espacios verdes',
  'Otro',
] as const

type ReportesContextValue = {
  reportes: Reporte[]
  getReporte: (id: number) => Reporte | undefined
  createReporte: (
    data: Omit<Reporte, 'id' | 'fecha' | 'estado' | 'autorId' | 'ubicacion'> & { address: string }
  ) => Reporte
  updateReporte: (
    id: number,
    data: Partial<Omit<Reporte, 'id' | 'autorId' | 'estado' | 'fecha'>> & { ubicacion?: string }
  ) => Reporte | undefined
  deleteReporte: (id: number) => void
  canEdit: (reporte: Reporte) => boolean
  currentUserId: string
}

const ReportesContext = createContext<ReportesContextValue | null>(null)

function todayFormatted() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

export function ReportesProvider({ children }: { children: ReactNode }) {
  const [reportes, setReportes] = useState<Reporte[]>(seed)

  const getReporte = useCallback(
    (id: number) => reportes.find((r) => r.id === id),
    [reportes]
  )

  const createReporte: ReportesContextValue['createReporte'] = useCallback(
    ({ address, ...data }) => {
      const nuevo: Reporte = {
        ...data,
        ubicacion: address,
        id: Date.now(),
        fecha: todayFormatted(),
        estado: 'Pendiente',
        autorId: CURRENT_USER_ID,
      }
      setReportes((prev) => [nuevo, ...prev])
      return nuevo
    },
    []
  )

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

  const deleteReporte = useCallback((id: number) => {
    setReportes((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const canEdit = useCallback(
    (r: Reporte) => r.estado === 'Pendiente' && r.autorId === CURRENT_USER_ID,
    []
  )

  const value = useMemo<ReportesContextValue>(
    () => ({
      reportes,
      getReporte,
      createReporte,
      updateReporte,
      deleteReporte,
      canEdit,
      currentUserId: CURRENT_USER_ID,
    }),
    [reportes, getReporte, createReporte, updateReporte, deleteReporte, canEdit]
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
