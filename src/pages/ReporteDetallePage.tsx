import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Film,
  Lock,
  MapPin,
  Pencil,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
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
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!lightboxUrl) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxUrl(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxUrl])

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
    <>
    <article className="animate-fade-up mx-auto flex max-w-2xl flex-col gap-3">

      {/* Volver */}
      <Button
        variant="ghost"
        size="sm"
        render={<Link to="/reportes" />}
        className="self-start h-8 px-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Mis reportes
      </Button>

      <Card className="border border-border shadow-sm">
        <CardContent className="p-4 flex flex-col gap-0">

          {/* Título y estado */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn('rounded-md border-0 px-2.5 py-1 text-sm font-medium', estadoBadgeStyles[reporte.estado])}>
                {reporte.estado}
              </Badge>
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                #{reporte.id}
              </span>
            </div>
            <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground">
              {reporte.titulo}
            </h1>
          </div>

          <Separator className="my-5" />

          {/* Categoría y fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Tag className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Categoría</p>
                <p className="text-base font-medium text-foreground">{reporte.categoria}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <CalendarDays className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Fecha</p>
                <p className="text-base font-medium text-foreground">{reporte.fecha}</p>
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          {/* Descripción */}
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Descripción
            </p>
            <p className="whitespace-pre-line text-base leading-relaxed text-foreground">
              {reporte.descripcion}
            </p>
          </div>

          <Separator className="my-5" />

          {/* Ubicación + mapa */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <MapPin className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Dirección</p>
                <p className="text-base font-medium text-foreground">
                  {reporte.ubicacion || 'Sin dirección registrada'}
                </p>
              </div>
            </div>
            <LocationMap lat={reporte.lat} lng={reporte.lng} />
          </div>

          {/* Multimedia */}
          {reporte.mediaUrls.length > 0 && (
            <>
              <Separator className="my-5" />
              <div>
                <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Multimedia
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {reporte.mediaUrls.map((url) => {
                    const isVideo =
                      url.includes('/video/upload/') || /\.(mp4|mov|webm)(\?|$)/i.test(url)
                    return (
                      <div key={url} className="relative overflow-hidden rounded-lg border border-border bg-muted">
                        {isVideo ? (
                          <>
                            <video src={url} controls className="aspect-video w-full object-cover" />
                            <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                              <Film className="size-2.5" aria-hidden />
                              Video
                            </span>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setLightboxUrl(url)}
                            className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label="Ampliar imagen"
                          >
                            <img src={url} alt="Foto del incidente" className="aspect-video w-full object-cover transition-opacity hover:opacity-90" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

        </CardContent>
      </Card>

      {/* ── Acciones ── */}
      {deleteError && (
        <p className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          {deleteError}
        </p>
      )}

      {editable ? (
        confirmDelete ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">¿Seguro que querés eliminar este reporte?</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="h-12 flex-1 rounded-xl text-base"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="h-12 flex-1 rounded-xl text-base font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash2 className="size-4" aria-hidden />
                {deleting ? 'Eliminando…' : 'Sí, eliminar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(true)}
              className="h-12 flex-1 rounded-xl text-base font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            >
              <Trash2 className="size-4" aria-hidden />
              Eliminar
            </Button>
            <Button
              render={<Link to={`/reportes/${reporte.id}/editar`} />}
              className="h-12 flex-1 rounded-xl text-base font-semibold"
            >
              <Pencil className="size-4" aria-hidden />
              Editar
            </Button>
          </div>
        )
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="size-4 shrink-0" aria-hidden />
          Este reporte ya no se puede modificar.
        </p>
      )}

    </article>

    {/* Lightbox */}
    {lightboxUrl && createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        onClick={() => setLightboxUrl(null)}
        role="dialog"
        aria-modal="true"
        aria-label="Vista ampliada"
      >
        <button
          type="button"
          onClick={() => setLightboxUrl(null)}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X className="size-5" />
        </button>
        <img
          src={lightboxUrl}
          alt="Vista ampliada"
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
        />
      </div>,
      document.body
    )}
    </>
  )
}

const DEFAULT_MAP_ZOOM = 16

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

function LocationMap({ lat, lng }: { lat: number | null; lng: number | null }) {
  if (lat === null || lng === null) {
    return <p className="text-sm text-muted-foreground">No hay ubicación precisa disponible.</p>
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <MapContainer
        center={[lat, lng]}
        zoom={DEFAULT_MAP_ZOOM}
        style={{ height: '200px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  )
}
