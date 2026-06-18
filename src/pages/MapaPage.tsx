import { Map } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function MapaPage() {
  return (
    <div className="animate-fade-up">
      <div className="mb-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Mapa de incidentes
        </h1>
        <p className="mt-1 text-base text-muted-foreground">
          Visualizá los reportes de tu zona y de toda Villa María.
        </p>
      </div>

      <Card className="border border-border shadow-none">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Map className="size-8 text-muted-foreground" aria-hidden />
          <p className="text-sm font-semibold text-foreground">Próximamente</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Estamos integrando el mapa interactivo con todos los reportes públicos de la ciudad.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
