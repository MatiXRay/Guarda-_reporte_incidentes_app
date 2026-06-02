import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CalendarDays, ClipboardList, MapPin, Pencil, PlusCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useReportes, type EstadoReporte } from '@/context/ReportesContext'
import { estadoBadgeStyles } from '@/lib/reportes-ui'
import { cn } from '@/lib/utils'

type Filtro = 'Todos' | EstadoReporte
const filtros: Filtro[] = ['Todos', 'Pendiente', 'En revisión', 'Resuelto']

export default function MisReportesPage() {
  const { reportes, loading, error, canEdit } = useReportes()
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
      <header className="animate-fade-up flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Mis reportes
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Los reportes <span className="font-medium text-foreground">Pendientes</span> son editables.
          </p>
        </div>
        {/* <Button size="sm" render={<Link to="/reportes/nuevo" />} className="shrink-0 bg-brand text-brand-foreground hover:bg-[oklch(0.62_0.14_60)]">
          <PlusCircle className="size-3.5" aria-hidden />
          Nuevo reporte
        </Button> */}
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
            className="h-8 pl-8 text-sm"
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
                  'h-8 rounded-full border px-3 text-sm font-medium transition-colors outline-none',
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
            {filtrados.map((reporte) => {
              const editable = canEdit(reporte)
              return (
                <li key={reporte.id}>
                  <Card className="border border-border shadow-none transition-colors hover:bg-muted/30">
                    <div className="flex items-center justify-between gap-4 p-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary">
                          <ClipboardList className="size-4" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge className={cn('h-5 rounded-full border-0 px-2 text-sm font-medium', estadoBadgeStyles[reporte.estado])}>
                              {reporte.estado}
                            </Badge>
                            <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                              {reporte.categoria}
                            </span>
                          </div>
                          <p className="text-[18px] mt-3 text-sm font-semibold leading-snug text-foreground">
                            {reporte.titulo}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="inline-flex min-w-0 max-w-[18rem] items-center gap-1 truncate rounded-full border border-border bg-muted px-2 py-1">
                              <MapPin className="size-3" aria-hidden />
                              <span className="truncate">{reporte.ubicacion}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-1">
                              <CalendarDays className="size-3" aria-hidden />
                              {reporte.fecha}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button variant="outline" size="sm" render={<Link to={`/reportes/${reporte.id}`} />} className="h-8 px-2.5 text-sm">
                          Ver
                          <ArrowRight className="size-3" aria-hidden />
                        </Button>
                        {editable && (
                          <Button size="sm" render={<Link to={`/reportes/${reporte.id}/editar`} />} className="h-8 px-2.5 text-sm">
                            <Pencil className="size-3" aria-hidden />
                            Editar
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
