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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-350 items-center justify-between gap-4 px-5">
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Ir al inicio de Guarda"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <ShieldAlert className="size-4" aria-hidden />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading text-base font-semibold tracking-tight text-foreground">
              Guarda<span className="text-[oklch(0.68_0.13_60)]">!</span>
            </span>
            <span className="text-[10px] font-medium tracking-[0.15em] text-muted-foreground uppercase">
              Reporte Ciudadano
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:block">
            {displayName}
          </span>

          <Button
            size="sm"
            render={<Link to="/reportes/nuevo" />}
            className="rounded-md bg-brand px-3 text-sm font-medium text-brand-foreground hover:bg-[oklch(0.62_0.14_60)]"
          >
            <Plus className="size-3.5" aria-hidden />
            Nuevo Reporte
          </Button>

          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-8 w-8 rounded-full ring-1 ring-border',
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}
