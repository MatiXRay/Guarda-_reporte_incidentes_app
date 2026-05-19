import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ReporteForm, type ReporteFormValues } from '@/components/reportes/ReporteForm'
import { useReportes } from '@/context/ReportesContext'

export default function EditarReportePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getReporte, canEdit, updateReporte } = useReportes()

  const reporte = id ? getReporte(Number(id)) : undefined

  if (!reporte) return <Navigate to="/reportes" replace />

  if (!canEdit(reporte)) {
    return (
      <div className="animate-fade-up mx-auto max-w-xl">
        <Button
          variant="ghost"
          size="sm"
          render={<Link to={`/reportes/${reporte.id}`} />}
          className="mb-3 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Volver al detalle
        </Button>
        <Card className="border border-border shadow-none">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <Lock className="size-8 text-muted-foreground" aria-hidden />
            <h1 className="font-heading text-lg font-semibold">Este reporte no se puede editar</h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              Solo los reportes <span className="font-medium text-foreground">Pendientes</span> pueden modificarse. Este está en{' '}
              <span className="font-medium text-foreground">{reporte.estado}</span>.
            </p>
            <Button size="sm" render={<Link to={`/reportes/${reporte.id}`} />} className="mt-1">
              Ver detalle
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  function handleSubmit(values: ReporteFormValues) {
    if (!reporte) return
    updateReporte(reporte.id, {
      titulo: values.titulo,
      categoria: values.categoria,
      descripcion: values.descripcion,
      ubicacion: values.address,
      lat: values.lat,
      lng: values.lng,
      mediaUrls: values.mediaUrls,
    })
    navigate(`/reportes/${reporte.id}`, { replace: true })
  }

  return (
    <div className="animate-fade-up mx-auto max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        render={<Link to={`/reportes/${reporte.id}`} />}
        className="mb-3 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Volver al detalle
      </Button>

      <div className="mb-4">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Editar reporte
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Podés modificarlo mientras siga en estado <span className="font-medium text-foreground">Pendiente</span>.
        </p>
      </div>

      <Card className="border border-border shadow-none">
        <CardContent className="p-5">
          <ReporteForm
            initialValues={{
              titulo: reporte.titulo,
              categoria: reporte.categoria,
              address: reporte.ubicacion,
              descripcion: reporte.descripcion,
              lat: reporte.lat,
              lng: reporte.lng,
              mediaUrls: reporte.mediaUrls,
            }}
            submitLabel="Guardar cambios"
            submitIcon={<Save className="size-3.5" aria-hidden />}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/reportes/${reporte.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
