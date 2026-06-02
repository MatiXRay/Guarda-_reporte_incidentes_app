import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ReporteForm, type ReporteFormValues } from '@/components/reportes/ReporteForm'
import { useReportes } from '@/context/ReportesContext'

export default function NuevoReportePage() {
  const navigate = useNavigate()
  const { createReporte } = useReportes()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(values: ReporteFormValues) {
    setSubmitting(true)
    setError(null)
    try {
      const nuevo = await createReporte({
        titulo: values.titulo,
        categoria: values.categoria,
        descripcion: values.descripcion,
        address: values.address,
        lat: values.lat,
        lng: values.lng,
        mediaUrls: values.mediaUrls,
      })
      navigate(`/reportes/${nuevo.id}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el reporte')
      setSubmitting(false)
    }
  }

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
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Nuevo reporte
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
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
            submitLabel={submitting ? 'Guardando…' : 'Crear reporte'}
            submitIcon={<PlusCircle className="size-3.5" aria-hidden />}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/reportes')}
            disabled={submitting}
          />
        </CardContent>
      </Card>
    </div>
  )
}
