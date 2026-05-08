import { useUser } from '@clerk/clerk-react'
import { Bell, Settings, ShieldCheck, User } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const items = [
  {
    icon: User,
    title: 'Datos personales',
    description: 'Nombre, contacto y dirección de referencia',
  },
  {
    icon: Bell,
    title: 'Notificaciones',
    description: 'Recibí avisos cuando cambie el estado de tus reportes',
  },
  {
    icon: ShieldCheck,
    title: 'Seguridad',
    description: 'Contraseña, sesiones activas y verificación en dos pasos',
  },
] as const

export default function ConfiguracionPage() {
  const { user } = useUser()
  const nombre = user?.fullName ?? user?.firstName ?? 'Vecino'
  const email = user?.primaryEmailAddress?.emailAddress ?? '—'

  return (
    <div className="animate-fade-up mx-auto max-w-3xl">
      <header className="mb-6">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          Configuración
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Tu cuenta
        </h1>
        <p className="mt-2 max-w-xl text-base text-muted-foreground">
          Gestioná tus datos, preferencias y opciones de seguridad.
        </p>
      </header>

      <Card className="border-0 ring-1 ring-border">
        <CardHeader className="flex flex-row items-center gap-4">
          <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Settings className="size-6" aria-hidden />
          </span>
          <div>
            <CardTitle className="font-heading text-xl font-semibold">
              {nombre}
            </CardTitle>
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
                      'flex w-full items-center gap-4 px-6 py-5 text-left transition-colors outline-none',
                      'hover:bg-muted/40 focus-visible:bg-muted/60',
                      'focus-visible:ring-3 focus-visible:ring-ring/50',
                      idx === items.length - 1 && 'rounded-b-xl'
                    )}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-foreground/70 ring-1 ring-border">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold text-foreground">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {item.description}
                      </span>
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
