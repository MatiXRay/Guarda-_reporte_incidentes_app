import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const footerLinks = [
  { label: 'Ayuda', to: '/ayuda' },
  { label: 'Contacto', to: '/ayuda' },
  { label: 'Términos', to: '/ayuda' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-350 flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
            <ShieldAlert className="size-5" aria-hidden />
          </span>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Guarda!</span> ©
            2026 — Villa María, Córdoba
          </p>
        </div>

        <nav aria-label="Enlaces de pie de página">
          <ul className="flex items-center gap-1 text-sm font-medium">
            {footerLinks.map((link, idx) => (
              <li key={link.label} className="flex items-center gap-1">
                <Link
                  to={link.to}
                  className="rounded-md px-2 py-1 text-foreground/75 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {link.label}
                </Link>
                {idx < footerLinks.length - 1 && (
                  <Separator
                    orientation="vertical"
                    className="h-4! bg-border"
                  />
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
