import { NavLink } from 'react-router-dom'
import {
  Home,
  ClipboardList,
  PlusCircle,
  Map,
  Settings,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  icon: LucideIcon
  to: string
  end?: boolean
}

const primaryNav: NavItem[] = [
  { label: 'Inicio', icon: Home, to: '/dashboard', end: true },
  { label: 'Mis Reportes', icon: ClipboardList, to: '/reportes' },
  { label: 'Nuevo Reporte', icon: PlusCircle, to: '/reportes/nuevo' },
  { label: 'Mapa de Incidentes', icon: Map, to: '/mapa' },
]

const secondaryNav: NavItem[] = [
  { label: 'Configuración', icon: Settings, to: '/configuracion' },
  { label: 'Ayuda', icon: HelpCircle, to: '/ayuda' },
]

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors outline-none',
          'focus-visible:ring-3 focus-visible:ring-ring/50',
          isActive
            ? 'bg-primary/10 text-primary ring-1 ring-primary/15'
            : 'text-foreground/80 hover:bg-muted hover:text-foreground'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'grid size-9 shrink-0 place-items-center rounded-lg transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground/70 ring-1 ring-border group-hover:bg-background group-hover:text-foreground'
            )}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside
      className="sticky top-20 hidden h-[calc(100vh-5rem)] w-72 shrink-0 border-r border-border bg-background/60 lg:block"
      aria-label="Navegación principal"
    >
      <nav className="scrollbar-soft flex h-full flex-col gap-2 overflow-y-auto px-4 py-6">
        <p className="px-4 pb-1 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Menú
        </p>
        <ul className="flex flex-col gap-1.5">
          {primaryNav.map((item) => (
            <li key={item.label}>
              <SidebarLink item={item} />
            </li>
          ))}
        </ul>

        <Separator className="my-4" />

        <p className="px-4 pb-1 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Cuenta
        </p>
        <ul className="flex flex-col gap-1.5">
          {secondaryNav.map((item) => (
            <li key={item.label}>
              <SidebarLink item={item} />
            </li>
          ))}
        </ul>

        <div className="mt-auto rounded-2xl bg-primary/5 p-4 ring-1 ring-primary/10">
          <p className="text-sm font-semibold text-foreground">
            ¿Necesitás ayuda?
          </p>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">
            Llamanos al{' '}
            <span className="font-semibold text-foreground">147</span> las 24
            horas.
          </p>
        </div>
      </nav>
    </aside>
  )
}
