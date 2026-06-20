import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  ChevronRight,
  ClipboardList,
  Film,
  ListFilter,
  MapPin,
  MoreHorizontal,
  Search,
  X,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

/* ------- tipos ------- */
type Status = 'open' | 'in_progress' | 'resolved'
type Priority = 'baja' | 'media' | 'alta' | 'critica'
type Orden = 'recientes' | 'antiguos' | 'prioridad' | 'adhesiones'

interface Reporte {
  _id: string
  title: string
  description: string
  category: string
  status: Status
  priority: Priority
  location: { lat: number; lng: number; address: string; barrio?: string | null }
  userId: { nombre: string; email: string } | null
  esPrincipal: boolean
  adhesiones: number
  createdAt: string
  imageUrls?: string[]
  aiAnalysis?: {
    severidad: string
    etiquetas: string[]
    resumen: string
  }
}

/* ------- constantes ------- */
const STATUS_OPTIONS: Status[] = ['open', 'in_progress', 'resolved']
const PRIORITY_OPTIONS: Priority[] = ['critica', 'alta', 'media', 'baja']
const PRIORITY_WEIGHT: Record<Priority, number> = { baja: 1, media: 2, alta: 3, critica: 4 }

const ORDEN_OPTIONS: { value: Orden; label: string }[] = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'antiguos', label: 'Más antiguos' },
  { value: 'prioridad', label: 'Mayor prioridad' },
  { value: 'adhesiones', label: 'Más adhesiones' },
]

const statusLabel: Record<Status, string> = {
  open: 'Pendiente',
  in_progress: 'En revisión',
  resolved: 'Resuelto',
}

const priorityLabel: Record<Priority, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
}

/* ------- estilos ------- */
const statusStyles: Record<Status, string> = {
  open: 'bg-[oklch(0.96_0.06_75)] text-[oklch(0.42_0.13_60)] ring-1 ring-[oklch(0.85_0.1_70)]',
  in_progress: 'bg-primary/10 text-primary ring-1 ring-primary/20',
  resolved: 'bg-[oklch(0.95_0.06_155)] text-[oklch(0.4_0.12_155)] ring-1 ring-[oklch(0.82_0.1_155)]',
}

const priorityStyles: Record<Priority, string> = {
  baja: 'bg-muted text-muted-foreground ring-1 ring-border',
  media: 'bg-[oklch(0.96_0.06_75)] text-[oklch(0.42_0.13_60)] ring-1 ring-[oklch(0.85_0.1_70)]',
  alta: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  critica: 'bg-destructive/10 text-destructive ring-1 ring-destructive/20',
}

const priorityDot: Record<Priority, string> = {
  baja: 'bg-muted-foreground/40',
  media: 'bg-yellow-400',
  alta: 'bg-orange-500',
  critica: 'bg-destructive',
}

const statusDot: Record<Status, string> = {
  open: 'bg-yellow-400',
  in_progress: 'bg-primary',
  resolved: 'bg-emerald-500',
}

/* ------- utils ------- */
function formatFecha(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
}

/* ------- Leaflet setup ------- */
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

function LocationMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border" style={{ height: 200 }}>
      <MapContainer center={[lat, lng]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  )
}

/* ------- Checkbox row helper ------- */
function CheckRow({ checked, label, dot, onChange }: { checked: boolean; label: string; dot?: string; onChange: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
    >
      <span className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
        checked ? 'border-primary bg-primary' : 'border-border bg-background'
      )}>
        {checked && <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />}
      </span>
      {dot && <span className={cn('size-2 shrink-0 rounded-full', dot)} />}
      {label}
    </button>
  )
}

/* ------- componente principal ------- */
export default function AdminReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')

  /* filtros */
  const [filtrosStatus, setFiltrosStatus] = useState<Status[]>([])
  const [filtrosPrioridad, setFiltrosPrioridad] = useState<Priority[]>([])
  const [filtrosCategorias, setFiltrosCategorias] = useState<string[]>([])
  const [orden, setOrden] = useState<Orden>('recientes')

  /* dropdowns — refs para calcular posición via portal */
  const filterBtnRef = useRef<HTMLButtonElement>(null)
  const sortBtnRef = useRef<HTMLButtonElement>(null)
  const moreBtnRef = useRef<HTMLButtonElement>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [filterRect, setFilterRect] = useState<DOMRect | null>(null)
  const [sortRect, setSortRect] = useState<DOMRect | null>(null)
  const [moreRect, setMoreRect] = useState<DOMRect | null>(null)

  function openDropdown(which: 'filter' | 'sort' | 'more') {
    const refs = { filter: filterBtnRef, sort: sortBtnRef, more: moreBtnRef }
    const rect = refs[which].current?.getBoundingClientRect() ?? null
    if (which === 'filter') { setFilterRect(rect); setFilterOpen((v) => !v); setSortOpen(false); setMoreOpen(false) }
    if (which === 'sort') { setSortRect(rect); setSortOpen((v) => !v); setFilterOpen(false); setMoreOpen(false) }
    if (which === 'more') { setMoreRect(rect); setMoreOpen((v) => !v); setFilterOpen(false); setSortOpen(false) }
  }

  /* detalle */
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [detalleId, setDetalleId] = useState<string | null>(null)
  const [detalleReporte, setDetalleReporte] = useState<Reporte | null>(null)
  const [detalleLoading, setDetalleLoading] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!lightboxUrl) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxUrl(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxUrl])

  useEffect(() => {
    apiFetch(`${import.meta.env.VITE_API_URL}/api/reports`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron cargar los reportes')
        return res.json()
      })
      .then((data) => setReportes(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  /* categorías disponibles derivadas de los datos */
  const categoriasDisponibles = [...new Set(reportes.map((r) => r.category))].sort()

  /* filtrado + ordenamiento */
  const filtrados = (() => {
    let result = reportes.filter((r) => {
      if (filtrosStatus.length > 0 && !filtrosStatus.includes(r.status)) return false
      if (filtrosPrioridad.length > 0 && !filtrosPrioridad.includes(r.priority)) return false
      if (filtrosCategorias.length > 0 && !filtrosCategorias.includes(r.category)) return false
      const q = busqueda.toLowerCase()
      if (q) {
        return (
          r.title.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.location.address.toLowerCase().includes(q) ||
          (r.userId?.nombre.toLowerCase().includes(q) ?? false)
        )
      }
      return true
    })

    switch (orden) {
      case 'antiguos':
        result = [...result].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'prioridad':
        result = [...result].sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority])
        break
      case 'adhesiones':
        result = [...result].sort((a, b) => b.adhesiones - a.adhesiones)
        break
    }
    return result
  })()

  const activeFilterCount = filtrosStatus.length + filtrosPrioridad.length + filtrosCategorias.length

  function resetFiltros() {
    setFiltrosStatus([])
    setFiltrosPrioridad([])
    setFiltrosCategorias([])
    setOrden('recientes')
    setBusqueda('')
    setMoreOpen(false)
  }

  const cargarDetalle = async (id: string) => {
    if (detalleId === id) {
      setDetalleId(null)
      setDetalleReporte(null)
      return
    }
    setDetalleId(id)
    setDetalleReporte(null)
    setDetalleLoading(true)
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/reports/${id}`)
      if (!res.ok) throw new Error()
      setDetalleReporte(await res.json())
    } catch {
      setDetalleId(null)
    } finally {
      setDetalleLoading(false)
    }
  }

  const handleStatusChange = async (id: string, nuevoStatus: Status) => {
    setUpdatingId(id)
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nuevoStatus }),
      })
      if (!res.ok) throw new Error()
      setReportes((prev) => prev.map((r) => (r._id === id ? { ...r, status: nuevoStatus } : r)))
      if (detalleReporte?._id === id) setDetalleReporte((prev) => prev ? { ...prev, status: nuevoStatus } : prev)
    } catch {
      alert('No se pudo actualizar el estado')
    } finally {
      setUpdatingId(null)
    }
  }

  const handlePriorityChange = async (id: string, nuevaPrioridad: Priority) => {
    setUpdatingId(id)
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ priority: nuevaPrioridad }),
      })
      if (!res.ok) throw new Error()
      setReportes((prev) => prev.map((r) => (r._id === id ? { ...r, priority: nuevaPrioridad } : r)))
      if (detalleReporte?._id === id) setDetalleReporte((prev) => prev ? { ...prev, priority: nuevaPrioridad } : prev)
    } catch {
      alert('No se pudo actualizar la prioridad')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="animate-fade-up flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Panel de reportes
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Gestioná el estado y prioridad de todos los reportes.
          </p>
        </div>
        {!loading && (
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
            <ClipboardList className="size-3.5" aria-hidden />
            {filtrados.length}/{reportes.length}
          </span>
        )}
      </header>

      {/* Barra de herramientas */}
      <section className="animate-fade-up [animation-delay:40ms] flex items-center gap-2">

        {/* Búsqueda */}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título, dirección…"
            className="h-12 pl-10 text-base rounded-xl"
          />
        </div>

        {/* Botón Filtrar — icono */}
        <button
          ref={filterBtnRef}
          onClick={() => openDropdown('filter')}
          aria-label="Filtrar reportes"
          className={cn(
            'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors outline-none',
            filterOpen || activeFilterCount > 0
              ? 'border-primary bg-primary/8 text-primary'
              : 'border-border bg-background text-foreground hover:bg-muted'
          )}
        >
          <ListFilter className="size-5" aria-hidden />
          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Botón Ordenar — icono */}
        <button
          ref={sortBtnRef}
          onClick={() => openDropdown('sort')}
          aria-label="Ordenar reportes"
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors outline-none',
            sortOpen || orden !== 'recientes'
              ? 'border-primary bg-primary/8 text-primary'
              : 'border-border bg-background text-foreground hover:bg-muted'
          )}
        >
          <ArrowUpDown className="size-5" aria-hidden />
        </button>

        {/* Botón ... */}
        <button
          ref={moreBtnRef}
          onClick={() => openDropdown('more')}
          aria-label="Más opciones"
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors outline-none',
            moreOpen
              ? 'border-primary bg-primary/8 text-primary'
              : 'border-border bg-background text-foreground hover:bg-muted'
          )}
        >
          <MoreHorizontal className="size-5" aria-hidden />
        </button>
      </section>

      {/* Portals de dropdowns — fuera del stacking context de animate-fade-up */}
      {filterOpen && filterRect && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
          <div
            className="fixed z-50 w-60 rounded-xl border border-border bg-background p-3 shadow-lg"
            style={{ top: filterRect.bottom + 6, right: window.innerWidth - filterRect.right }}
          >
            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Estado</p>
            {STATUS_OPTIONS.map((s) => (
              <CheckRow key={s} checked={filtrosStatus.includes(s)} label={statusLabel[s]}
                onChange={() => setFiltrosStatus((v) => toggle(v, s))} />
            ))}

            <div className="my-2.5 border-t border-border" />

            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Prioridad</p>
            {PRIORITY_OPTIONS.map((p) => (
              <CheckRow key={p} checked={filtrosPrioridad.includes(p)} label={priorityLabel[p]} dot={priorityDot[p]}
                onChange={() => setFiltrosPrioridad((v) => toggle(v, p))} />
            ))}

            {categoriasDisponibles.length > 0 && (
              <>
                <div className="my-2.5 border-t border-border" />
                <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Categoría</p>
                {categoriasDisponibles.map((cat) => (
                  <CheckRow key={cat} checked={filtrosCategorias.includes(cat)} label={cat}
                    onChange={() => setFiltrosCategorias((v) => toggle(v, cat))} />
                ))}
              </>
            )}

            {activeFilterCount > 0 && (
              <>
                <div className="my-2.5 border-t border-border" />
                <button
                  onClick={() => { setFiltrosStatus([]); setFiltrosPrioridad([]); setFiltrosCategorias([]) }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  <X className="size-3.5" />
                  Limpiar filtros
                </button>
              </>
            )}
          </div>
        </>,
        document.body
      )}

      {sortOpen && sortRect && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
          <div
            className="fixed z-50 w-48 rounded-xl border border-border bg-background p-1.5 shadow-lg"
            style={{ top: sortRect.bottom + 6, right: window.innerWidth - sortRect.right }}
          >
            {ORDEN_OPTIONS.map((op) => (
              <button
                key={op.value}
                onClick={() => { setOrden(op.value); setSortOpen(false) }}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors',
                  orden === op.value ? 'bg-primary/5 font-medium text-primary' : 'text-foreground hover:bg-muted'
                )}
              >
                {op.label}
                {orden === op.value && <Check className="size-3.5" strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}

      {moreOpen && moreRect && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
          <div
            className="fixed z-50 w-44 rounded-xl border border-border bg-background p-1.5 shadow-lg"
            style={{ top: moreRect.bottom + 6, right: window.innerWidth - moreRect.right }}
          >
            <button
              onClick={resetFiltros}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <X className="size-3.5 text-muted-foreground" />
              Limpiar todo
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Chips de filtros activos */}
      {activeFilterCount > 0 && (
        <div className="animate-fade-up -mt-3 flex flex-wrap gap-1.5">
          {filtrosStatus.map((s) => (
            <span key={s} className="flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
              {statusLabel[s]}
              <button onClick={() => setFiltrosStatus((v) => v.filter((x) => x !== s))} className="ml-0.5 text-muted-foreground hover:text-foreground">
                <X className="size-3" />
              </button>
            </span>
          ))}
          {filtrosPrioridad.map((p) => (
            <span key={p} className="flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
              <span className={cn('size-1.5 rounded-full', priorityDot[p])} />
              {priorityLabel[p]}
              <button onClick={() => setFiltrosPrioridad((v) => v.filter((x) => x !== p))} className="ml-0.5 text-muted-foreground hover:text-foreground">
                <X className="size-3" />
              </button>
            </span>
          ))}
          {filtrosCategorias.map((cat) => (
            <span key={cat} className="flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
              {cat}
              <button onClick={() => setFiltrosCategorias((v) => v.filter((x) => x !== cat))} className="ml-0.5 text-muted-foreground hover:text-foreground">
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Lista */}
      <section className="animate-fade-up [animation-delay:80ms]" aria-label="Lista de reportes">
        {loading ? (
          <Card className="flex items-center justify-center border border-border px-6 py-12 shadow-none">
            <p className="text-sm text-muted-foreground">Cargando reportes…</p>
          </Card>
        ) : error ? (
          <Card className="flex flex-col items-center justify-center gap-2 border border-destructive/30 bg-destructive/5 px-6 py-12 text-center shadow-none">
            <AlertTriangle className="size-8 text-destructive/70" aria-hidden />
            <p className="text-sm font-medium text-foreground">Error al cargar reportes</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </Card>
        ) : filtrados.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-2 border border-border px-6 py-12 text-center shadow-none">
            <ClipboardList className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium text-foreground">No hay reportes que coincidan</p>
            {activeFilterCount > 0 && (
              <button onClick={resetFiltros} className="mt-1 text-sm text-primary hover:underline">
                Limpiar filtros
              </button>
            )}
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtrados.map((reporte) => {
              const isOpen = detalleId === reporte._id
              const isLoading = detalleLoading && detalleId === reporte._id
              return (
                <li key={reporte._id} className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                  {/* Fila clickeable */}
                  <button
                    onClick={() => cargarDetalle(reporte._id)}
                    disabled={isLoading}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-4 text-left transition-colors',
                      'hover:bg-muted/40 disabled:opacity-60',
                      isOpen && 'bg-muted/30'
                    )}
                  >
                    <span className={cn('size-2 shrink-0 rounded-full', priorityDot[reporte.priority])} aria-hidden />

                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-foreground truncate">{reporte.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        #{reporte._id.slice(-8).toUpperCase()} · {formatFecha(reporte.createdAt)}
                      </p>
                      {reporte.aiAnalysis?.resumen && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                          {reporte.aiAnalysis.resumen}
                        </p>
                      )}
                      <div className="mt-1 flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        <span className="truncate">{reporte.location.address}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      {/* Columnas de badges — ocultas en mobile, visibles desde sm */}
                      <div className="hidden sm:flex items-center gap-5">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Severidad</span>
                          <span className={cn('whitespace-nowrap min-w-[56px] text-center rounded-md px-2.5 py-1 text-xs font-medium', priorityStyles[reporte.priority])}>
                            {priorityLabel[reporte.priority]}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Estado</span>
                          <span className={cn('whitespace-nowrap min-w-[84px] text-center rounded-md px-2.5 py-1 text-xs font-medium', statusStyles[reporte.status])}>
                            {statusLabel[reporte.status]}
                          </span>
                        </div>
                      </div>
                      {/* En mobile: solo badge de estado compacto */}
                      <span className={cn('sm:hidden whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium', statusStyles[reporte.status])}>
                        {statusLabel[reporte.status]}
                      </span>
                      {isLoading
                        ? <span className="size-4 animate-spin rounded-full border-2 border-border border-t-primary" />
                        : <ChevronRight className={cn('size-4 text-muted-foreground transition-transform', isOpen && 'rotate-90')} />
                      }
                    </div>
                  </button>

                  {/* Panel de detalle */}
                  {isOpen && detalleReporte && detalleReporte._id === reporte._id && (
                    <div className="border-t border-border bg-muted/10 px-4 py-4 space-y-4">

                      {/* Gestionar — card destacada */}
                      <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-primary">Gestionar reporte</p>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className={cn('hidden size-2 shrink-0 rounded-full sm:block', statusDot[detalleReporte.status])} />
                              <span className="hidden text-xs font-medium text-muted-foreground sm:block">Estado</span>
                              <select
                                value={detalleReporte.status}
                                disabled={updatingId === reporte._id}
                                onChange={(e) => handleStatusChange(reporte._id, e.target.value as Status)}
                                className="h-9 rounded-lg border border-primary/20 bg-background px-2.5 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                                aria-label="Cambiar estado"
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s} value={s}>{statusLabel[s]}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={cn('hidden size-2 shrink-0 rounded-full sm:block', priorityDot[detalleReporte.priority])} />
                              <span className="hidden text-xs font-medium text-muted-foreground sm:block">Prioridad</span>
                              <select
                                value={detalleReporte.priority}
                                disabled={updatingId === reporte._id}
                                onChange={(e) => handlePriorityChange(reporte._id, e.target.value as Priority)}
                                className="h-9 rounded-lg border border-primary/20 bg-background px-2.5 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                                aria-label="Cambiar prioridad"
                              >
                                {PRIORITY_OPTIONS.map((p) => (
                                  <option key={p} value={p}>{priorityLabel[p]}</option>
                                ))}
                              </select>
                            </div>
                            <button
                              onClick={() => { setDetalleId(null); setDetalleReporte(null) }}
                              className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                              aria-label="Cerrar detalle"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        </div>
                        {updatingId === reporte._id && (
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-primary">
                            <span className="size-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                            Guardando cambios…
                          </p>
                        )}
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-border bg-background p-3">
                              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Usuario</p>
                              <p className="mt-1 text-sm font-medium text-foreground">{detalleReporte.userId?.nombre ?? 'Desconocido'}</p>
                              <p className="text-xs text-muted-foreground">{detalleReporte.userId?.email ?? ''}</p>
                            </div>
                            <div className="rounded-lg border border-border bg-background p-3">
                              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Fecha</p>
                              <p className="mt-1 text-sm font-medium text-foreground">{formatFecha(detalleReporte.createdAt)}</p>
                            </div>
                            <div className="rounded-lg border border-border bg-background p-3">
                              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Categoría</p>
                              <p className="mt-1 text-sm font-medium text-foreground">{detalleReporte.category}</p>
                            </div>
                            <div className="rounded-lg border border-border bg-background p-3">
                              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Adhesiones</p>
                              <p className="mt-1 text-sm font-medium text-foreground">{detalleReporte.adhesiones}</p>
                            </div>
                          </div>

                          <div className="rounded-lg border border-border bg-background p-3">
                            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Descripción</p>
                            <div className="mt-1 flex items-start gap-1.5">
                              <p className="text-sm text-foreground">{detalleReporte.description}</p>
                            </div>
                          </div>

                          {detalleReporte.aiAnalysis?.resumen && (
                            <div className="rounded-lg border border-border bg-background p-3">
                              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Resumen IA</p>
                              <p className="mt-1 text-sm text-foreground">{detalleReporte.aiAnalysis.resumen}</p>
                              {detalleReporte.aiAnalysis.etiquetas?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {detalleReporte.aiAnalysis.etiquetas.map((e) => (
                                    <span key={e} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{e}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <LocationMap lat={detalleReporte.location.lat} lng={detalleReporte.location.lng} />
                          <div className="rounded-lg border border-border bg-background p-3">
                            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">DIRECCIÓN</p>
                            <div className="mt-1 flex items-start gap-1.5">
                              <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-foreground">{detalleReporte.location.address}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Multimedia — full width debajo del grid */}
                      {detalleReporte.imageUrls && detalleReporte.imageUrls.length > 0 && (
                        <div className="rounded-lg border border-border bg-background p-3">
                          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase mb-2">
                            Multimedia ({detalleReporte.imageUrls.length})
                          </p>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                            {detalleReporte.imageUrls.map((url) => {
                              const isVideo = url.includes('/video/upload/') || /\.(mp4|mov|webm)(\?|$)/i.test(url)
                              return (
                                <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                                  {isVideo ? (
                                    <>
                                      <video src={url} className="h-full w-full object-cover" muted playsInline controls />
                                      <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white pointer-events-none">
                                        <Film className="size-2.5" aria-hidden />
                                        Video
                                      </span>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setLightboxUrl(url)}
                                      className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                      aria-label="Ampliar imagen"
                                    >
                                      <img src={url} alt="Foto del reporte" className="h-full w-full object-cover transition-opacity hover:opacity-90" />
                                    </button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Lightbox */}
      {lightboxUrl && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxUrl(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada"
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            aria-label="Cerrar"
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="size-5" />
          </button>
          <img
            src={lightboxUrl}
            alt="Vista ampliada"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
          />
        </div>,
        document.body
      )}
    </div>
  )
}
