import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ReporteForm, type ReporteFormValues } from '@/components/reportes/ReporteForm'
import { useReportes } from '@/context/ReportesContext'

export default function NuevoReportePage() {
  const navigate = useNavigate()
  const { createReporte } = useReportes()

  function handleSubmit(values: ReporteFormValues) {
    const nuevo = createReporte({
      titulo: values.titulo,
      categoria: values.categoria,
      descripcion: values.descripcion,
      address: values.address,
      lat: values.lat,
      lng: values.lng,
      imageUrl: values.imageUrl,
    })
    navigate(`/reportes/${nuevo.id}`, { replace: true })
  }

  return (
    <div className="animate-fade-up mx-auto max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        render={<Link to="/reportes" />}
        className="mb-3 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Mis reportes
      </Button>

      <div className="mb-4">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Nuevo reporte
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          El reporte quedará en estado <span className="font-medium text-foreground">Pendiente</span> hasta que el equipo lo revise.
        </p>
      </div>

      <Card className="border border-border shadow-none">
        <CardContent className="p-5">
          <ReporteForm
            submitLabel="Crear reporte"
            submitIcon={<PlusCircle className="size-3.5" aria-hidden />}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/reportes')}
          />
        </CardContent>
      </Card>
    </div>
  )
}
