import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ClipboardList,
  MapPin,
  Search,
} from 'lucide-react'
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
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
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
                'h-7 rounded-full border px-3 text-xs font-medium transition-colors outline-none',
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
            <p className="text-xs text-muted-foreground">{error}</p>
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
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary">
                        <ClipboardList className="size-4" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge className={cn('h-5 rounded-full border-0 px-2 text-xs font-medium', statusStyles[reporte.status])}>
                            {statusLabel[reporte.status]}
                          </Badge>
                          <Badge className={cn('h-5 rounded-full border-0 px-2 text-xs font-medium', priorityStyles[reporte.priority])}>
                            {reporte.priority}
                          </Badge>
                          <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                            {reporte.category}
                          </span>
                          {reporte.adhesiones > 0 && (
                            <span className="text-[11px] text-muted-foreground">
                              {reporte.adhesiones} adhesión{reporte.adhesiones !== 1 ? 'es' : ''}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-semibold leading-snug text-foreground">
                          {reporte.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" aria-hidden />
                            {reporte.location.address}
                          </span>
                          {reporte.userId && <span>{reporte.userId.nombre}</span>}
                          <span>{formatFecha(reporte.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex shrink-0 items-center gap-2 pl-11 sm:pl-0">
                      <select
                        value={reporte.status}
                        disabled={updatingId === reporte._id}
                        onChange={(e) => handleStatusChange(reporte._id, e.target.value as Status)}
                        className="h-7 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
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
                        className="h-7 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
                        aria-label="Cambiar prioridad"
                      >
                        {PRIORITY_OPTIONS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}