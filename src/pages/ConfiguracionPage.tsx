import { useUser } from '@clerk/clerk-react'
import { Bell, Settings, ShieldCheck, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const items = [
  { icon: User, title: 'Datos personales', description: 'Nombre, contacto y dirección de referencia' },
  { icon: Bell, title: 'Notificaciones', description: 'Recibí avisos cuando cambie el estado de tus reportes' },
  { icon: ShieldCheck, title: 'Seguridad', description: 'Contraseña, sesiones activas y verificación en dos pasos' },
] as const

export default function ConfiguracionPage() {
  const { user } = useUser()
  const nombre = user?.fullName ?? user?.firstName ?? 'Vecino'
  const email = user?.primaryEmailAddress?.emailAddress ?? '—'

  return (
    <div className="animate-fade-up mx-auto max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">Configuración</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Gestioná tus datos, preferencias y seguridad.</p>
      </div>

      <Card className="border border-border shadow-none">
        <CardHeader className="flex flex-row items-center gap-3 p-4">
          <span className="grid size-9 place-items-center rounded-lg bg-primary/8 text-primary">
            <Settings className="size-4" aria-hidden />
          </span>
          <div>
            <CardTitle className="text-sm font-semibold">{nombre}</CardTitle>
            <CardDescription className="text-sm">{email}</CardDescription>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {items.map((item, idx) => {
              const Icon = item.icon
              return (
                <li key={item.title}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors outline-none',
                      'hover:bg-muted/40 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50',
                      idx === items.length - 1 && 'rounded-b-xl'
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">{item.title}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{item.description}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
