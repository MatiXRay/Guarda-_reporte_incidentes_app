import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ReporteForm,
  type ReporteFormValues,
} from '@/components/reportes/ReporteForm'
import { useReportes } from '@/context/ReportesContext'

export default function EditarReportePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getReporte, canEdit, updateReporte } = useReportes()

  const reporte = id ? getReporte(Number(id)) : undefined

  if (!reporte) return <Navigate to="/reportes" replace />

  if (!canEdit(reporte)) {
    return (
      <div className="animate-fade-up mx-auto max-w-2xl">
        <Button
          variant="ghost"
          render={<Link to={`/reportes/${reporte.id}`} />}
          className="mb-4 h-10 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al detalle
        </Button>
        <Card className="border-0 ring-1 ring-border">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-muted text-foreground/70 ring-1 ring-border">
              <Lock className="size-7" aria-hidden />
            </span>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Este reporte no se puede editar
            </h1>
            <p className="max-w-md text-base text-muted-foreground">
              Solo los reportes en estado{' '}
              <span className="font-semibold text-foreground">Pendiente</span>{' '}
              pueden ser modificados por su autor. Este reporte ya está en{' '}
              <span className="font-semibold text-foreground">
                {reporte.estado}
              </span>
              .
            </p>
            <Button
              size="lg"
              render={<Link to={`/reportes/${reporte.id}`} />}
              className="mt-2 h-12 rounded-xl px-5 text-base font-semibold"
            >
              Ver detalle del reporte
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  function handleSubmit(values: ReporteFormValues) {
    if (!reporte) return
    updateReporte(reporte.id, values)
    navigate(`/reportes/${reporte.id}`, { replace: true })
  }

  return (
    <div className="animate-fade-up mx-auto max-w-3xl">
      <Button
        variant="ghost"
        render={<Link to={`/reportes/${reporte.id}`} />}
        className="mb-4 h-10 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver al detalle
      </Button>

      <header className="mb-6">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          Editar reporte #{reporte.id}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Modificá la información
        </h1>
        <p className="mt-2 max-w-xl text-base text-muted-foreground">
          Podés actualizar los datos mientras el reporte siga en estado{' '}
          <span className="font-semibold text-foreground">Pendiente</span>.
        </p>
      </header>

      <Card className="border-0 ring-1 ring-border">
        <CardContent className="p-6 sm:p-8">
          <ReporteForm
            initialValues={{
              titulo: reporte.titulo,
              categoria: reporte.categoria,
              ubicacion: reporte.ubicacion,
              descripcion: reporte.descripcion,
            }}
            submitLabel="Guardar cambios"
            submitIcon={<Save className="size-5" aria-hidden />}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/reportes/${reporte.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
