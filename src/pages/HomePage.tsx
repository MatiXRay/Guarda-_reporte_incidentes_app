import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  PlusCircle,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useReportes } from '@/context/ReportesContext'
import { estadoBadgeStyles } from '@/lib/reportes-ui'
import { cn } from '@/lib/utils'

const toneStyles = {
  primary: { bg: 'bg-primary/10', fg: 'text-primary', ring: 'ring-primary/15' },
  brand: {
    bg: 'bg-[oklch(0.96_0.06_75)]',
    fg: 'text-[oklch(0.5_0.13_60)]',
    ring: 'ring-[oklch(0.85_0.1_70)]',
  },
  success: {
    bg: 'bg-[oklch(0.95_0.06_155)]',
    fg: 'text-[oklch(0.42_0.13_155)]',
    ring: 'ring-[oklch(0.85_0.08_155)]',
  },
} as const

function formatFechaHoy() {
  const fmt = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const formatted = fmt.format(new Date())
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export default function HomePage() {
  const { user } = useUser()
  const { reportes } = useReportes()

  const firstName =
    user?.firstName ??
    user?.fullName?.split(' ')[0] ??
    user?.primaryEmailAddress?.emailAddress?.split('@')[0] ??
    'Vecino'

  const total = reportes.length
  const enRevision = reportes.filter((r) => r.estado === 'En revisión').length
  const resueltos = reportes.filter((r) => r.estado === 'Resuelto').length
  const ultimos = reportes.slice(0, 4)

  const resumen = [
    {
      label: 'Reportes enviados',
      value: total,
      description: 'Total histórico',
      icon: FileText,
      tone: 'primary' as const,
    },
    {
      label: 'En revisión',
      value: enRevision,
      description: 'El equipo los está atendiendo',
      icon: Clock,
      tone: 'brand' as const,
    },
    {
      label: 'Resueltos',
      value: resueltos,
      description: 'Gracias por colaborar',
      icon: CheckCircle2,
      tone: 'success' as const,
    },
  ]

  return (
    <>
      <section
        className="animate-fade-up rounded-3xl bg-gradient-to-br from-primary/8 via-background to-background p-8 ring-1 ring-primary/10"
        aria-labelledby="welcome-title"
      >
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          {formatFechaHoy()}
        </p>
        <h1
          id="welcome-title"
          className="mt-2 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
        >
          Bienvenido, <span className="text-primary">{firstName}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Reportá problemas en tu barrio de forma simple y segura. Ayudanos a
          mantener Villa María en buen estado.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            render={<Link to="/reportes/nuevo" />}
            className="h-12 rounded-xl bg-brand px-5 text-base font-semibold text-brand-foreground shadow-sm ring-1 ring-[oklch(0.55_0.13_55)]/20 hover:bg-[oklch(0.62_0.14_60)] hover:shadow-md focus-visible:ring-[oklch(0.68_0.13_60)]/40"
          >
            <PlusCircle className="size-5" aria-hidden />
            Crear nuevo reporte
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<Link to="/reportes" />}
            className="h-12 rounded-xl px-5 text-base font-semibold"
          >
            <Search className="size-5" aria-hidden />
            Ver mis reportes
          </Button>
        </div>
      </section>

      <section
        className="mt-10 animate-fade-up [animation-delay:80ms]"
        aria-labelledby="resumen-title"
      >
        <div className="mb-4 flex items-end justify-between">
          <h2
            id="resumen-title"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Resumen
          </h2>
          <p className="text-sm text-muted-foreground">
            Estado actual de tus reportes
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resumen.map((item) => {
            const Icon = item.icon
            const tone = toneStyles[item.tone]
            return (
              <Card
                key={item.label}
                className="border-0 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/20"
              >
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardDescription className="text-sm font-medium text-muted-foreground">
                      {item.label}
                    </CardDescription>
                    <CardTitle className="mt-2 font-heading text-4xl font-semibold tracking-tight text-foreground">
                      {item.value}
                    </CardTitle>
                  </div>
                  <span
                    className={cn(
                      'grid size-12 place-items-center rounded-xl ring-1',
                      tone.bg,
                      tone.fg,
                      tone.ring
                    )}
                  >
                    <Icon className="size-6" aria-hidden />
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section
        className="mt-12 animate-fade-up [animation-delay:160ms]"
        aria-labelledby="reportes-title"
      >
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2
              id="reportes-title"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Últimos reportes
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tus reportes más recientes y su estado
            </p>
          </div>
          <Button
            variant="ghost"
            render={<Link to="/reportes" />}
            className="h-10 rounded-lg text-sm font-semibold text-primary hover:bg-primary/10"
          >
            Ver todos
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>

        <Card className="overflow-hidden border-0 ring-1 ring-border">
          <ul className="divide-y divide-border">
            {ultimos.map((reporte) => (
              <li
                key={reporte.id}
                className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-foreground/70 ring-1 ring-border">
                    <ClipboardList className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                      {reporte.titulo}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Reportado el {reporte.fecha}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <Badge
                    className={cn(
                      'h-7 rounded-full border-0 px-3 text-sm font-semibold',
                      estadoBadgeStyles[reporte.estado]
                    )}
                  >
                    {reporte.estado}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link to={`/reportes/${reporte.id}`} />}
                    className="h-10 rounded-lg px-4 text-sm font-semibold"
                  >
                    Ver detalle
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </>
  )
}
