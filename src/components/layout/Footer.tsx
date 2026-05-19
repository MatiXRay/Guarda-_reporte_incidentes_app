import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

const footerLinks = [
  { label: 'Ayuda', to: '/ayuda' },
  { label: 'Contacto', to: '/ayuda' },
  { label: 'Términos', to: '/ayuda' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-350 items-center justify-between gap-4 px-5 py-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-muted-foreground" aria-hidden />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">Guarda!</span> © 2026 — Villa María
          </p>
        </div>

        <nav aria-label="Enlaces de pie de página">
          <ul className="flex items-center gap-3">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
