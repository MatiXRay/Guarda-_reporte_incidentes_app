import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  MapPin,
  Search,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

/* ------- tipos ------- */
type Status = 'open' | 'in_progress' | 'resolved'
type Priority = 'baja' | 'media' | 'alta' | 'critica'

interface Reporte {
  _id: string
  title: string
  description: string
  category: string
  status: Status
  priority: Priority
  location: { lat: number; lng: number; address: string }
  userId: { nombre: string; email: string } | null
  esPrincipal: boolean
  adhesiones: number
  createdAt: string

}

/* ------- estilos ------- */
const statusLabel: Record<Status, string> = {
  open: 'Pendiente',
  in_progress: 'En revisión',
  resolved: 'Resuelto',
}

const statusStyles: Record<Status, string> = {
  open: 'bg-[oklch(0.96_0.06_75)] text-[oklch(0.42_0.13_60)] ring-1 ring-[oklch(0.85_0.1_70)]',
  in_progress: 'bg-primary/10 text-primary ring-1 ring-primary/20',
  resolved: 'bg-[oklch(0.95_0.06_155)] text-[oklch(0.4_0.12_155)] ring-1 ring-[oklch(0.82_0.1_155)]',
}

const priorityStyles: Record<Priority, string> = {
  baja: 'bg-muted text-muted-foreground',
  media: 'bg-[oklch(0.96_0.06_75)] text-[oklch(0.42_0.13_60)]',
  alta: 'bg-orange-100 text-orange-700',
  critica: 'bg-destructive/10 text-destructive',
}

const STATUS_OPTIONS: Status[] = ['open', 'in_progress', 'resolved']
const PRIORITY_OPTIONS: Priority[] = ['baja', 'media', 'alta', 'critica']

function formatFecha(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

/* ------- componente ------- */
export default function AdminReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<Status | 'todos'>('todos')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [detalleReporte, setDetalleReporte] = useState<Reporte | null>(null)
  const [detalleId, setDetalleId] = useState<string | null>(null)
  const [detalleLoading, setDetalleLoading] = useState(false)
  const [detalleError, setDetalleError] = useState<string | null>(null)

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

  const handleStatusChange = async (id: string, nuevoStatus: Status) => {
    setUpdatingId(id)
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nuevoStatus }),
      })
      if (!res.ok) throw new Error()
      setReportes((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: nuevoStatus } : r))
      )
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
      setReportes((prev) =>
        prev.map((r) => (r._id === id ? { ...r, priority: nuevaPrioridad } : r))
      )
    } catch {
      alert('No se pudo actualizar la prioridad')
    } finally {
      setUpdatingId(null)
    }
  }

  const cargarDetalle = async (id: string) => {
    // close previous detail immediately when selecting another
    setDetalleReporte(null)
    setDetalleId(id)
    setDetalleLoading(true)
    setDetalleError(null)
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/reports/${id}`)
      if (!res.ok) {
        throw new Error('No se pudo cargar el detalle del reporte')
      }
      const data = await res.json()
      setDetalleReporte(data)
    } catch (err) {
      setDetalleError(err instanceof Error ? err.message : 'Error desconocido al cargar el detalle')
      setDetalleReporte(null)
    } finally {
      setDetalleLoading(false)
    }
  }

  const filtrados = reportes.filter((r) => {
    if (filtroStatus !== 'todos' && r.status !== filtroStatus) return false
    const q = busqueda.toLowerCase()
    return (
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.location.address.toLowerCase().includes(q) ||
      r.userId?.nombre.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="animate-fade-up flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Panel de reportes
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Gestioná el estado y prioridad de todos los reportes.
          </p>
        </div>
        {!loading && (
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
            <ClipboardList className="size-3.5" aria-hidden />
            {reportes.length} reportes
          </span>
        )}
      </header>

      {/* Filtros */}
      <section className="animate-fade-up [animation-delay:40ms] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título, categoría, dirección…"
            className="h-8 pl-8 text-sm"
          />
        </div>
        <div role="tablist" className="flex flex-wrap gap-1.5">
          {(['todos', ...STATUS_OPTIONS] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={filtroStatus === s}
              onClick={() => setFiltroStatus(s)}
              className={cn(
                'h-8 rounded-full border px-3 text-sm font-medium transition-colors outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring/50',
                filtroStatus === s
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground/70 hover:bg-muted hover:text-foreground'
              )}
            >
              {s === 'todos' ? 'Todos' : statusLabel[s]}
            </button>
          ))}
        </div>
      </section>

      {/* detalle inline moved into each Card below */}

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
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtrados.map((reporte) => (
              <li key={reporte._id}>
                <Card className="border border-border shadow-none transition-colors hover:bg-muted/30">
                  <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={cn('h-5 rounded-full border-0 px-2 text-sm font-medium', statusStyles[reporte.status])}>
                          {statusLabel[reporte.status]}
                        </Badge>
                        <span className={cn('inline-flex items-center rounded-full px-2 py-1 text-sm font-medium', priorityStyles[reporte.priority])}>
                          {reporte.priority}
                        </span>
                        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                          REPORTE #{reporte._id}
                        </span>
                      </div>
                      <h2 className="text-[18px] mt-3 text-sm font-semibold text-foreground">
                        {reporte.title}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-1">
                          <ClipboardList className="size-3" aria-hidden />
                          {reporte.category}
                        </span>
                        {reporte.adhesiones > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-1">
                            {reporte.adhesiones} adhesión{reporte.adhesiones !== 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex min-w-0 max-w-[18rem] items-center gap-1 truncate rounded-full border border-border bg-muted px-2 py-1">
                          <MapPin className="size-3" aria-hidden />
                          <span className="truncate">{reporte.location.address}</span>
                        </span>

                        {reporte.userId && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-1">
                            <User className="size-3" aria-hidden />
                            {reporte.userId.nombre}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-1">
                          <CalendarDays className="size-3" aria-hidden />
                          {formatFecha(reporte.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2 justify-end">
                      {/* <div className="flex flex-wrap items-center gap-2 rounded-full border border-border bg-muted px-2 py-1"> */}
                      <select
                        value={reporte.status}
                        disabled={updatingId === reporte._id}
                        onChange={(e) => handleStatusChange(reporte._id, e.target.value as Status)}
                        className="h-8 rounded-md border border-border bg-background px-2 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
                        aria-label="Cambiar estado"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{statusLabel[s]}</option>
                        ))}
                      </select>

                      <select
                        value={reporte.priority}
                        disabled={updatingId === reporte._id}
                        onChange={(e) => handlePriorityChange(reporte._id, e.target.value as Priority)}
                        className="h-8 rounded-md border border-border bg-background px-2 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
                        aria-label="Cambiar prioridad"
                      >
                        {PRIORITY_OPTIONS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      {/* </div> */}

                      {detalleReporte && detalleReporte._id === reporte._id ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDetalleReporte(null)
                            setDetalleId(null)
                            setDetalleError(null)
                          }}
                          className="h-8 px-3 text-sm font-medium text-foreground transition hover:bg-muted"
                        >
                          Cerrar detalle
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cargarDetalle(reporte._id)}
                          disabled={detalleLoading}
                          className="h-8 px-3 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {detalleLoading && reporte._id === detalleId ? 'Cargando…' : 'Ver detalle'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Inline detalle dentro de la misma Card */}
                  {detalleReporte && detalleReporte._id === reporte._id && (
                    <div className="space-y-4 border-t border-border px-4 py-4">
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg border border-border bg-background">
                              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Fecha</p>
                              <p className="mt-1 text-sm font-medium text-foreground">{formatFecha(detalleReporte.createdAt)}</p>
                            </div>

                            <div className="p-3 rounded-lg border border-border bg-background">
                              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Estado</p>
                              <div className="mt-1">
                                <span className={cn('inline-flex items-center rounded-full px-2 py-1 text-sm font-medium', statusStyles[detalleReporte.status])}>
                                  {statusLabel[detalleReporte.status]}
                                </span>
                              </div>
                            </div>

                            <div className="p-3 rounded-lg border border-border bg-background">
                              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Prioridad</p>
                              <div className="mt-1">
                                <span className={cn('inline-flex items-center rounded-full px-2 py-1 text-sm font-medium', priorityStyles[detalleReporte.priority])}>
                                  {detalleReporte.priority}
                                </span>
                              </div>
                            </div>

                            <div className="p-3 rounded-lg border border-border bg-background">
                              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Usuario</p>
                              <p className="mt-1 text-sm font-medium text-foreground">{detalleReporte.userId?.nombre ?? 'Desconocido'}</p>
                              <p className="text-sm text-muted-foreground">{detalleReporte.userId?.email ?? 'Sin email'}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          {/* <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Ubicación</p> */}
                          <div className="overflow-hidden rounded-xl border border-border">
                            <LocationMap lat={detalleReporte.location.lat} lng={detalleReporte.location.lng} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Descripción</p>
                        <div className="mt-2 p-4 rounded-lg border border-border bg-background">
                          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{detalleReporte.description}</p>
                        </div>
                      </div>

                    </div>




                  )}



                  {detalleError && detalleReporte && detalleReporte._id === reporte._id && (
                    <div className="border-t border-border px-4 py-3 text-sm text-destructive">
                      {detalleError}
                    </div>
                  )}


                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

// Leaflet marker icon setup and simple read-only map for detalle
const DEFAULT_MAP_ZOOM = 15
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

function LocationMap({ lat, lng }: { lat: number; lng: number }) {
  if (lat == null || lng == null) {
    return <p className="text-sm text-muted-foreground">No hay ubicación disponible.</p>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border" style={{ height: 220 }}>
      <MapContainer center={[lat, lng]} zoom={DEFAULT_MAP_ZOOM} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  )
}