import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, PlusCircle, MapPin } from 'lucide-react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ReporteForm, type ReporteFormValues } from '@/components/reportes/ReporteForm'
import { useReportes, type ReporteSimilar } from '@/context/ReportesContext'

type PendienteState = {
  similares: ReporteSimilar[]
  datosNormalizados: { title: string; description: string }
  formOriginal: ReporteFormValues
}

const PRIORIDAD_LABEL: Record<string, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
}

const PRIORIDAD_COLOR: Record<string, string> = {
  baja: 'bg-blue-100 text-blue-700',
  media: 'bg-yellow-100 text-yellow-700',
  alta: 'bg-orange-100 text-orange-700',
  critica: 'bg-red-100 text-red-700',
}

function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        style={{ height: '140px', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
        doubleClickZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  )
}

export default function NuevoReportePage() {
  const navigate = useNavigate()
  const { createReporte, adherirReporte } = useReportes()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duplicadoMsg, setDuplicadoMsg] = useState<string | null>(null)
  const [pendiente, setPendiente] = useState<PendienteState | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  async function handleSubmit(values: ReporteFormValues) {
    setSubmitting(true)
    setError(null)
    try {
      const result = await createReporte({
        titulo: values.titulo,
        categoria: values.categoria,
        descripcion: values.descripcion,
        address: values.address,
        barrio: values.barrio,
        lat: values.lat,
        lng: values.lng,
        mediaUrls: values.mediaUrls,
      })

      if (result.tipo === 'duplicado') {
        setDuplicadoMsg(result.message)
        return
      }

      if (result.tipo === 'pendiente') {
        setPendiente({
          similares: result.similares,
          datosNormalizados: result.datosNormalizados,
          formOriginal: values,
        })
        setSelectedId(null)
        return
      }

      navigate(`/reportes/${result.reporte.id}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el reporte')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAdherirse() {
    if (!selectedId || !pendiente) return
    setSubmitting(true)
    setError(null)
    try {
      await adherirReporte(selectedId)
      setPendiente(null)
      navigate('/reportes', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al adherirse al reporte')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCrearIgual() {
    if (!pendiente) return
    const { formOriginal, datosNormalizados } = pendiente
    setPendiente(null)
    setSubmitting(true)
    setError(null)
    try {
      const result = await createReporte({
        titulo: datosNormalizados.title,
        descripcion: datosNormalizados.description,
        categoria: formOriginal.categoria,
        address: formOriginal.address,
        barrio: formOriginal.barrio,
        lat: formOriginal.lat,
        lng: formOriginal.lng,
        mediaUrls: formOriginal.mediaUrls,
        forzarCreacion: true,
      })
      if (result.tipo === 'creado') {
        navigate(`/reportes/${result.reporte.id}`, { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el reporte')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedSimilar = pendiente?.similares.find((s) => s.id === selectedId) ?? null

  return (
    <div className="animate-fade-up mx-auto max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        render={<Link to="/reportes" />}
        className="mb-3 h-8 px-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Mis reportes
      </Button>

      <div className="mb-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Nuevo reporte
        </h1>
        <p className="mt-1 text-base text-muted-foreground">
          El reporte quedará en estado <span className="font-medium text-foreground">Pendiente</span> hasta que el equipo lo revise.
        </p>
      </div>

      <Card className="border border-border shadow-none">
        <CardContent className="p-5">
          {error && (
            <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <ReporteForm
            submitLabel={submitting ? 'Analizando…' : 'Crear reporte'}
            submitIcon={<PlusCircle className="size-3.5" aria-hidden />}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/reportes')}
            disabled={submitting}
          />
        </CardContent>
      </Card>

      {/* Modal duplicado */}
      {duplicadoMsg && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex w-full max-w-sm flex-col gap-5 rounded-xl border border-border bg-background p-6 shadow-xl">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <AlertTriangle className="size-7" aria-hidden />
              </span>
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">Reporte duplicado detectado</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{duplicadoMsg}</p>
              </div>
            </div>
            <Button className="h-11 w-full rounded-xl text-sm font-semibold" onClick={() => setDuplicadoMsg(null)}>
              Entendido
            </Button>
          </div>
        </div>,
        document.body
      )}

      {/* Modal reportes similares — portal para evitar problemas con transforms del padre */}
      {pendiente && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex w-full max-w-lg flex-col rounded-xl border border-border bg-background shadow-xl" style={{ maxHeight: '90vh' }}>

            {/* Header */}
            <div className="border-b border-border p-5">
              <h2 className="font-heading text-base font-semibold text-foreground">
                Reportes similares en la zona
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Encontramos {pendiente.similares.length === 1 ? 'un reporte parecido' : `${pendiente.similares.length} reportes parecidos`} cerca de tu ubicación. Podés adherirte a uno o crear el tuyo igual.
              </p>
            </div>

            {/* Lista scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {pendiente.similares.map((s) => {
                const isSelected = selectedId === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(isSelected ? null : s.id)}
                    className={`w-full text-left rounded-lg border p-4 transition-colors ${isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground hover:bg-muted/30'
                      }`}
                  >
                    {/* Título y badges */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="font-medium text-sm text-foreground leading-snug">{s.titulo}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${PRIORIDAD_COLOR[s.prioridad] ?? 'bg-muted text-muted-foreground'}`}>
                        {PRIORIDAD_LABEL[s.prioridad] ?? s.prioridad}
                      </span>
                    </div>

                    {/* Categoría y adhesiones */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{s.categoria}</span>
                      <span className="text-xs text-muted-foreground">{s.adhesiones} {s.adhesiones === 1 ? 'adhesión' : 'adhesiones'}</span>
                    </div>

                    {/* Descripción */}
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{s.descripcion}</p>

                    {/* Dirección */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" />
                      <span className="truncate">{s.ubicacion}</span>
                    </div>

                    {/* Mini-mapa al seleccionar */}
                    {isSelected && s.lat && s.lng && (
                      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                        <MiniMap lat={s.lat} lng={s.lng} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="flex gap-2 border-t border-border p-5">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPendiente(null)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCrearIgual}
                disabled={submitting}
              >
                Crear el mío
              </Button>
              <Button
                className="flex-1"
                onClick={handleAdherirse}
                disabled={!selectedId || submitting}
              >
                {submitting ? 'Guardando…' : 'Adherirme'}
              </Button>
            </div>
          </div>
        </div>
        , document.body)}
    </div>
  )
}
