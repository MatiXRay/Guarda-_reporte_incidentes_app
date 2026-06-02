import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  PlusCircle,
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
  primary: { bg: 'bg-primary/8', fg: 'text-primary', border: 'border-primary/20' },
  brand: { bg: 'bg-[oklch(0.96_0.06_75)]', fg: 'text-[oklch(0.5_0.13_60)]', border: 'border-[oklch(0.85_0.1_70)]' },
  success: { bg: 'bg-[oklch(0.95_0.06_155)]', fg: 'text-[oklch(0.42_0.13_155)]', border: 'border-[oklch(0.85_0.08_155)]' },
} as const

function formatFechaHoy() {
  const fmt = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const formatted = fmt.format(new Date())
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export default function HomePage() {
  const { user } = useUser()
  const { reportes, loading } = useReportes()

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
    { label: 'Reportes enviados', value: total, description: 'Total histórico', icon: FileText, tone: 'primary' as const },
    { label: 'En revisión', value: enRevision, description: 'El equipo los está atendiendo', icon: Clock, tone: 'brand' as const },
    { label: 'Resueltos', value: resueltos, description: 'Gracias por colaborar', icon: CheckCircle2, tone: 'success' as const },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="animate-fade-up rounded-xl border border-border bg-card p-6">
        <p className="text-sm font-medium text-muted-foreground">{formatFechaHoy()}</p>
        <h1 className="mt-1.5 font-heading text-2xl font-semibold tracking-tight text-foreground">
          Bienvenido, <span className="text-primary">{firstName}</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Reportá problemas en tu barrio de forma simple. Ayudanos a mantener Villa María en buen estado.
        </p>
        {/* <div className="mt-4 flex items-center gap-2">
          <Button size="sm" render={<Link to="/reportes/nuevo" />} className="bg-brand text-brand-foreground hover:bg-[oklch(0.62_0.14_60)]">
            <PlusCircle className="size-3.5" aria-hidden />
            Nuevo reporte
          </Button>
          <Button size="sm" variant="outline" render={<Link to="/reportes" />}>
            Ver mis reportes
          </Button>
        </div> */}
      </section>

      {/* Stats */}
      <section className="animate-fade-up [animation-delay:60ms]" aria-labelledby="resumen-title">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="resumen-title" className="text-sm font-semibold text-foreground">Resumen</h2>
          <span className="text-sm text-muted-foreground">Estado actual de tus reportes</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {resumen.map((item) => {
            const Icon = item.icon
            const tone = toneStyles[item.tone]
            return (
              <Card key={item.label} className="border border-border shadow-none">
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                  <CardDescription className="text-sm font-medium">{item.label}</CardDescription>
                  <span className={cn('grid size-7 place-items-center rounded-md border', tone.bg, tone.fg, tone.border)}>
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="font-heading text-2xl font-semibold">{item.value}</CardTitle>
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Últimos reportes */}
      <section className="animate-fade-up [animation-delay:120ms]" aria-labelledby="reportes-title">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 id="reportes-title" className="text-sm font-semibold text-foreground">Últimos reportes</h2>
            <p className="text-sm text-muted-foreground">Tus reportes más recientes</p>
          </div>
          <Button variant="ghost" size="sm" render={<Link to="/reportes" />} className="text-sm text-primary hover:bg-primary/8 h-8 px-2">
            Ver todos
            <ArrowRight className="size-3" aria-hidden />
          </Button>
        </div>

        <Card className="border border-border shadow-none">
          {loading ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">Cargando reportes…</p>
          ) : ultimos.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">Todavía no tenés reportes. ¡Creá el primero!</p>
          ) : (
            <ul className="divide-y divide-border">
              {ultimos.map((reporte) => (
                <li
                  key={reporte.id}
                  className="flex items-center justify-between gap-4 px-4 py-4 first:pt-2 last:pb-2 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-foreground/60">
                      <ClipboardList className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{reporte.titulo}</p>
                      <p className="text-sm text-muted-foreground">{reporte.fecha}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className={cn('h-5 rounded-full border-0 px-2 text-sm font-medium', estadoBadgeStyles[reporte.estado])}>
                      {reporte.estado}
                    </Badge>
                    <Button size="sm" variant="outline" render={<Link to={`/reportes/${reporte.id}`} />} className="h-8 px-2 text-sm">
                      Ver
                      <ArrowRight className="size-3" aria-hidden />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  )
}
