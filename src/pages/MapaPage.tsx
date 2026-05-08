import { Map } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function MapaPage() {
  return (
    <div className="animate-fade-up">
      <header className="mb-6">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          Mapa
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Mapa de incidentes
        </h1>
        <p className="mt-2 max-w-xl text-base text-muted-foreground">
          Visualizá los reportes de tu zona y de toda Villa María en un solo
          lugar.
        </p>
      </header>

      <Card className="border-0 ring-1 ring-border">
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Map className="size-7" aria-hidden />
          </span>
          <p className="text-lg font-semibold text-foreground">
            Próximamente
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            Estamos integrando el mapa interactivo con todos los reportes
            públicos de la ciudad. Pronto vas a poder verlos acá.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
