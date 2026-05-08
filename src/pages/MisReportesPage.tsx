import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardList,
  MapPin,
  Pencil,
  PlusCircle,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  useReportes,
  type EstadoReporte,
} from '@/context/ReportesContext'
import { estadoBadgeStyles } from '@/lib/reportes-ui'
import { cn } from '@/lib/utils'

type Filtro = 'Todos' | EstadoReporte

const filtros: Filtro[] = ['Todos', 'Pendiente', 'En revisión', 'Resuelto']

export default function MisReportesPage() {
  const { reportes, canEdit } = useReportes()
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
    <>
      <header
        className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        aria-labelledby="page-title"
      >
        <div>
          <p className="text-sm font-medium tracking-wide text-muted-foreground">
            Mis reportes
          </p>
          <h1
            id="page-title"
            className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Todos tus reportes
          </h1>
          <p className="mt-2 max-w-xl text-base text-muted-foreground">
            Mientras un reporte esté en estado{' '}
            <span className="font-semibold text-foreground">Pendiente</span>{' '}
            podés modificarlo. Una vez que pasa a revisión, queda fijo.
          </p>
        </div>
        <Button
          size="lg"
          render={<Link to="/reportes/nuevo" />}
          className="h-12 self-start rounded-xl bg-brand px-5 text-base font-semibold text-brand-foreground shadow-sm hover:bg-[oklch(0.62_0.14_60)] sm:self-auto"
        >
          <PlusCircle className="size-5" aria-hidden />
          Nuevo reporte
        </Button>
      </header>

      <section
        className="mt-8 animate-fade-up [animation-delay:60ms]"
        aria-label="Filtros"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por título, ubicación o categoría"
              aria-label="Buscar reportes"
              className="h-11 pl-9 text-base"
            />
          </div>

          <div
            role="tablist"
            aria-label="Filtrar por estado"
            className="flex flex-wrap items-center gap-2"
          >
            {filtros.map((f) => {
              const active = filtro === f
              return (
                <button
                  key={f}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFiltro(f)}
                  className={cn(
                    'h-10 rounded-full border px-4 text-sm font-semibold transition-colors outline-none',
                    'focus-visible:ring-3 focus-visible:ring-ring/50',
                    active
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-background text-foreground/80 hover:bg-muted'
                  )}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section
        className="mt-6 animate-fade-up [animation-delay:120ms]"
        aria-label="Lista de reportes"
      >
        {filtrados.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 border-0 px-6 py-16 text-center ring-1 ring-border">
            <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-border">
              <ClipboardList className="size-7" aria-hidden />
            </span>
            <p className="text-lg font-semibold text-foreground">
              No hay reportes que coincidan
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Probá cambiar el filtro o crear un reporte nuevo desde el botón
              de arriba.
            </p>
          </Card>
        ) : (
          <ul className="grid grid-cols-1 gap-4">
            {filtrados.map((reporte) => {
              const editable = canEdit(reporte)
              return (
                <li key={reporte.id}>
                  <Card className="border-0 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/20">
                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-6">
                      <div className="flex items-start gap-4">
                        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                          <ClipboardList className="size-6" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              className={cn(
                                'h-7 rounded-full border-0 px-3 text-sm font-semibold',
                                estadoBadgeStyles[reporte.estado]
                              )}
                            >
                              {reporte.estado}
                            </Badge>
                            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                              {reporte.categoria}
                            </span>
                          </div>
                          <p className="mt-2 text-lg font-semibold leading-snug text-foreground sm:text-xl">
                            {reporte.titulo}
                          </p>
                          <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm text-muted-foreground">
                            {reporte.descripcion}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="size-4" aria-hidden />
                              {reporte.ubicacion}
                            </span>
                            <span>Reportado el {reporte.fecha}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-end">
                        <Button
                          variant="outline"
                          render={<Link to={`/reportes/${reporte.id}`} />}
                          className="h-10 rounded-lg px-4 text-sm font-semibold"
                        >
                          Ver detalle
                          <ArrowRight className="size-4" aria-hidden />
                        </Button>
                        {editable && (
                          <Button
                            render={
                              <Link to={`/reportes/${reporte.id}/editar`} />
                            }
                            className="h-10 rounded-lg px-4 text-sm font-semibold"
                          >
                            <Pencil className="size-4" aria-hidden />
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
    </>
  )
}
