import { UserButton, useUser } from '@clerk/clerk-react'
import { Plus, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user } = useUser()
  const displayName =
    user?.firstName ??
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    'Invitado'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-350 items-center justify-between gap-6 px-6">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Ir al inicio de Guarda"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/15">
            <ShieldAlert className="size-6" aria-hidden />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              Guarda<span className="text-[oklch(0.68_0.13_60)]">!</span>
            </span>
            <span className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Reporte Ciudadano
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden flex-col items-end leading-tight sm:flex">
            <span className="text-xs font-medium text-muted-foreground">
              Conectado como
            </span>
            <span className="text-base font-semibold text-foreground">
              {displayName}
            </span>
          </div>

          <Button
            size="lg"
            render={<Link to="/reportes/nuevo" />}
            className="h-12 rounded-xl bg-brand px-5 text-base font-semibold text-brand-foreground shadow-sm ring-1 ring-[oklch(0.55_0.13_55)]/20 transition-all hover:bg-[oklch(0.62_0.14_60)] hover:shadow-md focus-visible:ring-[oklch(0.68_0.13_60)]/40"
          >
            <Plus className="size-5" aria-hidden />
            Nuevo Reporte
          </Button>

          <div className="flex size-11 items-center justify-center">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-11 w-11 rounded-full ring-2 ring-border',
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
