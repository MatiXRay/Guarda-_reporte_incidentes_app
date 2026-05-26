import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Film,
  Lock,
  MapPin,
  Pencil,
  Tag,
  Trash2,
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
  const navigate = useNavigate()
  const { getReporte, canEdit, deleteReporte } = useReportes()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const reporte = id ? getReporte(id) : undefined
  if (!reporte) return <Navigate to="/reportes" replace />

  const editable = canEdit(reporte)

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteReporte(reporte!.id)
      navigate('/reportes', { replace: true })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar el reporte')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <article className="animate-fade-up mx-auto max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        render={<Link to="/reportes" />}
        className="mb-3 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Mis reportes
      </Button>

      <Card className="border border-border shadow-none">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={cn(
                'h-5 rounded-full border-0 px-2 text-xs font-medium',
                estadoBadgeStyles[reporte.estado]
              )}
            >
              {reporte.estado}
            </Badge>
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Reporte #{reporte.id}
            </span>
          </div>

          <h1 className="mt-2 font-heading text-xl font-semibold tracking-tight text-foreground">
            {reporte.titulo}
          </h1>

          <Separator className="my-4" />

          <dl className="grid grid-cols-2 gap-4">
            <Detalle icon={Tag} label="Categoría" value={reporte.categoria} />
            <Detalle icon={MapPin} label="Ubicación" value={reporte.ubicacion} />
            <Detalle icon={CalendarDays} label="Fecha" value={reporte.fecha} />
            <Detalle icon={ClipboardList} label="Estado" value={reporte.estado} />
          </dl>

          <Separator className="my-4" />

          <div>
            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Descripción
            </p>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground">
              {reporte.descripcion}
            </p>
          </div>

          {reporte.mediaUrls.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Multimedia
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {reporte.mediaUrls.map((url) => {
                    const isVideo =
                      url.includes('/video/upload/') || /\.(mp4|mov|webm)(\?|$)/i.test(url)
                    return (
                      <div
                        key={url}
                        className="relative overflow-hidden rounded-lg border border-border bg-muted"
                      >
                        {isVideo ? (
                          <>
                            <video
                              src={url}
                              controls
                              className="aspect-video w-full object-cover"
                            />
                            <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                              <Film className="size-2.5" aria-hidden />
                              Video
                            </span>
                          </>
                        ) : (
                          <img
                            src={url}
                            alt="Foto del incidente"
                            className="aspect-video w-full object-cover"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          <Separator className="my-4" />

          {deleteError && (
            <p className="mb-3 flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
              {deleteError}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            {editable ? (
              <p className="text-xs text-muted-foreground">
                Estado <span className="font-medium text-foreground">Pendiente</span>: podés
                editarlo o eliminarlo.
              </p>
            ) : (
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3.5" aria-hidden />
                Este reporte ya no se puede modificar.
              </p>
            )}

            {editable && (
              <div className="flex shrink-0 items-center gap-1.5">
                {confirmDelete ? (
                  <>
                    <span className="text-xs text-muted-foreground">¿Eliminar?</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                      className="h-7 px-2.5 text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="h-7 px-2.5 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      <Trash2 className="size-3" aria-hidden />
                      {deleting ? 'Eliminando…' : 'Confirmar'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDelete(true)}
                      className="h-7 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3" aria-hidden />
                      Eliminar
                    </Button>
                    <Button
                      size="sm"
                      render={<Link to={`/reportes/${reporte.id}/editar`} />}
                      className="shrink-0"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      Editar
                    </Button>
                  </>
                )}
              </div>
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
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <div>
        <dt className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
      </div>
    </div>
  )
}
