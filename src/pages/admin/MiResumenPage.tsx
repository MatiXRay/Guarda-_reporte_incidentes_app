import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useReportes, type EstadoReporte } from '@/context/ReportesContext'
import { estadoBadgeStyles } from '@/lib/reportes-ui'
import { cn } from '@/lib/utils'

const estadoDot: Record<EstadoReporte, string> = {
  Pendiente:    'bg-yellow-400',
  'En revisión': 'bg-primary',
  Resuelto:     'bg-green-500',
}

const toneStyles = {
  primary: { bg: 'bg-primary/10', fg: 'text-primary', border: 'border-primary/20' },
  brand:   { bg: 'bg-[oklch(0.96_0.06_75)]', fg: 'text-[oklch(0.5_0.13_60)]', border: 'border-[oklch(0.85_0.1_70)]' },
  success: { bg: 'bg-[oklch(0.95_0.06_155)]', fg: 'text-[oklch(0.42_0.13_155)]', border: 'border-[oklch(0.85_0.08_155)]' },
} as const

function formatFechaHoy() {
  const fmt = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const s = fmt.format(new Date())
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function MiResumenPage() {
  const { reportes, loading } = useReportes()

  const total      = reportes.length
  const enRevision = reportes.filter((r) => r.estado === 'En revisión').length
  const resueltos  = reportes.filter((r) => r.estado === 'Resuelto').length
  const ultimos    = reportes.slice(0, 4)

  const resumen = [
    { label: 'Reportes enviados', value: total,      description: 'Total histórico',               tone: 'primary' as const },
    { label: 'En revisión',       value: enRevision, description: 'El equipo los está atendiendo', tone: 'brand'   as const },
    { label: 'Resueltos',         value: resueltos,  description: 'Gracias por colaborar',          tone: 'success' as const },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Stats */}
      <section className="animate-fade-up [animation-delay:60ms]" aria-label="Resumen de mis reportes">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">Resumen</h2>
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" aria-hidden />
            <span>{formatFechaHoy()}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {resumen.map((item) => {
            const tone = toneStyles[item.tone]
            return (
              <Card key={item.label} className="border border-border shadow-none">
                <CardContent className="flex items-stretch gap-3 p-4">
                  <div className="flex flex-1 flex-col justify-center gap-1">
                    <p className="text-base font-semibold text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className={cn('flex min-w-[3.5rem] items-center justify-center rounded-xl border', tone.bg, tone.fg, tone.border)}>
                    <p className="font-heading text-2xl font-bold tracking-tight">{item.value}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Últimos reportes */}
      <section className="animate-fade-up [animation-delay:120ms]" aria-labelledby="reportes-title">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="reportes-title" className="text-lg font-semibold text-foreground">
            Últimos reportes
          </h2>
          <Button
            variant="ghost"
            size="sm"
            render={<Link to="/reportes" />}
            className="h-9 px-3 text-sm text-primary hover:bg-primary/8"
          >
            Ver todos
            <ArrowRight className="size-3.5" aria-hidden />
          </Button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-base text-muted-foreground">Cargando reportes…</p>
        ) : ultimos.length === 0 ? (
          <p className="py-8 text-center text-base text-muted-foreground">
            Todavía no tenés reportes. ¡Creá el primero!
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {ultimos.map((reporte) => (
              <li key={reporte.id} className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                <Link
                  to={`/reportes/${reporte.id}`}
                  className="flex w-full items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/40"
                >
                  <span className={cn('size-2 shrink-0 rounded-full', estadoDot[reporte.estado])} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-base font-semibold text-foreground">{reporte.titulo}</p>
                      {reporte.esAdherido && (
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Adherido
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      #{reporte.id.slice(0, 8).toUpperCase()} · {reporte.fecha}
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
