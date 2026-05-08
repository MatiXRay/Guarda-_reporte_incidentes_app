import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ReporteForm,
  type ReporteFormValues,
} from '@/components/reportes/ReporteForm'
import { useReportes } from '@/context/ReportesContext'

export default function NuevoReportePage() {
  const navigate = useNavigate()
  const { createReporte } = useReportes()

  function handleSubmit(values: ReporteFormValues) {
    const nuevo = createReporte(values)
    navigate(`/reportes/${nuevo.id}`, { replace: true })
  }

  return (
    <div className="animate-fade-up mx-auto max-w-3xl">
      <Button
        variant="ghost"
        render={<Link to="/reportes" />}
        className="mb-4 h-10 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver a mis reportes
      </Button>

      <header className="mb-6">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          Nuevo reporte
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Cargá un nuevo incidente
        </h1>
        <p className="mt-2 max-w-xl text-base text-muted-foreground">
          Tu reporte queda en estado{' '}
          <span className="font-semibold text-foreground">Pendiente</span>{' '}
          hasta que el equipo municipal lo revise. Vas a poder editarlo
          mientras siga pendiente.
        </p>
      </header>

      <Card className="border-0 ring-1 ring-border">
        <CardContent className="p-6 sm:p-8">
          <ReporteForm
            submitLabel="Crear reporte"
            submitIcon={<PlusCircle className="size-5" aria-hidden />}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/reportes')}
          />
        </CardContent>
      </Card>
    </div>
  )
}
