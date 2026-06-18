import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronRight, ClipboardList, MapPin, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useReportes, type EstadoReporte } from '@/context/ReportesContext'
import { estadoBadgeStyles } from '@/lib/reportes-ui'
import { cn } from '@/lib/utils'

const estadoDot: Record<EstadoReporte, string> = {
  Pendiente:     'bg-yellow-400',
  'En revisión': 'bg-primary',
  Resuelto:      'bg-green-500',
}

type Filtro = 'Todos' | EstadoReporte
const filtros: Filtro[] = ['Todos', 'Pendiente', 'En revisión', 'Resuelto']

export default function MisReportesPage() {
  const { reportes, loading, error } = useReportes()
  const [filtro, setFiltro] = useState<Filtro>('Todos')
  const [busqueda, setBusqueda] = useState('')

  const filtrados = useMemo(() => {
    return reportes.filter((r) => {
      if (filtro !== 'Todos' && r.estado !== filtro) return false
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase()
        return (
          r.titulo.toLowerCase().includes(q) ||
          r.ubicacion.toLowerCase().includes(q) ||
          r.categoria.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [reportes, filtro, busqueda])

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <header className="animate-fade-up">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Mis reportes
        </h1>
      </header>

      {/* Filtros */}
      <section className="animate-fade-up [animation-delay:40ms] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar reportes…"
            aria-label="Buscar reportes"
            className="h-9 pl-8 text-sm"
          />
        </div>
        <div role="tablist" aria-label="Filtrar por estado" className="flex flex-wrap items-center gap-1.5">
          {filtros.map((f) => {
            const active = filtro === f
            return (
              <button
                key={f}
                role="tab"
                aria-selected={active}
                onClick={() => setFiltro(f)}
                className={cn(
                  'h-9 rounded-full border px-3 text-sm font-medium transition-colors outline-none',
                  'focus-visible:ring-2 focus-visible:ring-ring/50',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground/70 hover:bg-muted hover:text-foreground'
                )}
              >
                {f}
              </button>
            )
          })}
        </div>
      </section>

      {/* Lista */}
      <section className="animate-fade-up [animation-delay:80ms]" aria-label="Lista de reportes">
        {loading ? (
          <Card className="flex flex-col items-center justify-center gap-2 border border-border px-6 py-12 text-center shadow-none">
            <p className="text-sm text-muted-foreground">Cargando reportes…</p>
          </Card>
        ) : error ? (
          <Card className="flex flex-col items-center justify-center gap-2 border border-destructive/30 bg-destructive/5 px-6 py-12 text-center shadow-none">
            <AlertTriangle className="size-8 text-destructive/70" aria-hidden />
            <p className="text-sm font-medium text-foreground">No se pudieron cargar los reportes</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </Card>
        ) : filtrados.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-2 border border-border px-6 py-12 text-center shadow-none">
            <ClipboardList className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium text-foreground">No hay reportes que coincidan</p>
            <p className="text-sm text-muted-foreground">Cambiá el filtro o creá un nuevo reporte.</p>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtrados.map((reporte) => (
              <li key={reporte.id} className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                <Link
                  to={`/reportes/${reporte.id}`}
                  className="flex w-full items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/40"
                >
                  <span className={cn('size-2 shrink-0 rounded-full', estadoDot[reporte.estado])} aria-hidden />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-foreground">{reporte.titulo}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {reporte.categoria} · {reporte.fecha}
                    </p>
                    {reporte.ubicacion && (
                      <div className="mt-0.5 flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        <span className="truncate">{reporte.ubicacion}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className={cn('whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium', estadoBadgeStyles[reporte.estado])}>
                      {reporte.estado}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" aria-hidden />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
