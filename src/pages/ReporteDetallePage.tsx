import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Lock,
  MapPin,
  Pencil,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useReportes } from '@/context/ReportesContext'
import { estadoBadgeStyles } from '@/lib/reportes-ui'
import { cn } from '@/lib/utils'

export default function ReporteDetallePage() {
  const { id } = useParams<{ id: string }>()
  const { getReporte, canEdit } = useReportes()

  const reporte = id ? getReporte(Number(id)) : undefined

  if (!reporte) {
    return <Navigate to="/reportes" replace />
  }

  const editable = canEdit(reporte)

  return (
    <article className="animate-fade-up mx-auto max-w-3xl">
      <Button
        variant="ghost"
        render={<Link to="/reportes" />}
        className="mb-4 h-10 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver a mis reportes
      </Button>

      <Card className="border-0 ring-1 ring-border">
        <CardContent className="p-6 sm:p-8">
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
              Reporte #{reporte.id}
            </span>
          </div>

          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {reporte.titulo}
          </h1>

          <Separator className="my-6" />

          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Detalle icon={Tag} label="Categoría" value={reporte.categoria} />
            <Detalle
              icon={MapPin}
              label="Ubicación"
              value={reporte.ubicacion}
            />
            <Detalle
              icon={CalendarDays}
              label="Fecha del reporte"
              value={reporte.fecha}
            />
            <Detalle
              icon={ClipboardList}
              label="Estado"
              value={reporte.estado}
            />
          </dl>

          <Separator className="my-6" />

          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Descripción
            </p>
            <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-foreground">
              {reporte.descripcion}
            </p>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {editable ? (
              <p className="text-sm text-muted-foreground">
                Este reporte está{' '}
                <span className="font-semibold text-foreground">
                  Pendiente
                </span>
                : aún podés modificarlo.
              </p>
            ) : (
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="size-4" aria-hidden />
                Este reporte ya no se puede modificar.
              </p>
            )}

            {editable && (
              <Button
                size="lg"
                render={<Link to={`/reportes/${reporte.id}/editar`} />}
                className="h-12 rounded-xl px-5 text-base font-semibold"
              >
                <Pencil className="size-5" aria-hidden />
                Editar reporte
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </article>
  )
}

function Detalle({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground/70 ring-1 ring-border">
        <Icon className="size-4" aria-hidden />
      </span>
      <div>
        <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </dt>
        <dd className="mt-0.5 text-base font-medium text-foreground">
          {value}
        </dd>
      </div>
    </div>
  )
}
