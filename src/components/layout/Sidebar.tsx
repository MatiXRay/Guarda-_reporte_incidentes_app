import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  ClipboardList,
  PlusCircle,
  Map,
  Settings,
  HelpCircle,
  ChevronRight,
  LayoutDashboard,
  Users,
  ShieldAlert,
  ShieldCheck,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useUserRole } from '@/context/UserRoleContext'

type NavItem = {
  label: string
  icon: LucideIcon
  to: string
  end?: boolean
}

type SidebarProps = {
  open: boolean
  onClose: () => void
}

const secondaryNav: NavItem[] = [
  { label: 'Configuración', icon: Settings, to: '/configuracion' },
  { label: 'Ayuda', icon: HelpCircle, to: '/ayuda' },
]

const reportesSubNav: NavItem[] = [
  { label: 'Mis Reportes', icon: ClipboardList, to: '/reportes', end: true },
  { label: 'Nuevo Reporte', icon: PlusCircle, to: '/reportes/nuevo' },
]

const adminNav: NavItem[] = [
  { label: 'Panel de reportes', icon: LayoutDashboard, to: '/admin/reportes', end: true },
]

const superadminNav: NavItem[] = [
  { label: 'Usuarios', icon: Users, to: '/admin/usuarios', end: true },
]

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium transition-colors outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring/50',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-foreground/70 hover:bg-muted hover:text-foreground'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              'size-5 shrink-0 transition-colors',
              isActive ? 'text-primary' : 'text-foreground/50 group-hover:text-foreground'
            )}
            aria-hidden
          />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

function ReportesSection() {
  const location = useLocation()
  const isInReportes = location.pathname.startsWith('/reportes')
  const [open, setOpen] = useState(isInReportes)

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium transition-colors outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring/50',
          isInReportes
            ? 'text-primary'
            : 'text-foreground/70 hover:bg-muted hover:text-foreground'
        )}
      >
        <ClipboardList
          className={cn(
            'size-5 shrink-0 transition-colors',
            isInReportes ? 'text-primary' : 'text-foreground/50 group-hover:text-foreground'
          )}
          aria-hidden
        />
        <span className="flex-1 text-left">Reportes</span>
        <ChevronRight
          className={cn(
            'size-4 shrink-0 transition-transform duration-200',
            open && 'rotate-90'
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul className="mt-1 flex flex-col gap-1 pl-5">
          {reportesSubNav.map((item) => (
            <li key={item.label}>
              <SidebarLink item={item} />
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { role } = useUserRole()
  const isAdmin = role === 'admin' || role === 'superadmin'
  const isSuperadmin = role === 'superadmin'

  // contenido interno del sidebar — igual para desktop y mobile
  const content = (
    <nav className="scrollbar-soft flex h-full flex-col gap-1 overflow-y-auto px-3 py-3">
      <p className="px-2.5 pb-1 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        Menú
      </p>
      <ul className="flex flex-col gap-1">
        <li>
          <SidebarLink item={{ label: 'Inicio', icon: Home, to: '/dashboard', end: true }} />
        </li>
        <ReportesSection />
        <li>
          <SidebarLink item={{ label: 'Mapa', icon: Map, to: '/mapa' }} />
        </li>
      </ul>

      {isAdmin && (
        <>
          <Separator className="my-3" />
          <p className="px-2.5 pb-1 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Administración
          </p>
          <ul className="flex flex-col gap-1">
            {adminNav.map((item) => (
              <li key={item.label}>
                <SidebarLink item={item} />
              </li>
            ))}
            {isSuperadmin && (
              <>
                {superadminNav.map((item) => (
                  <li key={item.label}>
                    <SidebarLink item={item} />
                  </li>
                ))}
              </>
            )}
          </ul>
        </>
      )}

      <Separator className="my-3" />

      <p className="px-2.5 pb-1 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        Cuenta
      </p>
      <ul className="flex flex-col gap-1">
        {secondaryNav.map((item) => (
          <li key={item.label}>
            <SidebarLink item={item} />
          </li>
        ))}
      </ul>

      {isAdmin && (
        <div className="mt-auto rounded-lg bg-muted p-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden />
            <p className="text-xs font-semibold text-foreground capitalize">{role}</p>
          </div>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
            Tenés acceso al panel de administración.
          </p>
        </div>
      )}

      {!isAdmin && (
        <div className="mt-auto rounded-lg bg-muted p-3">
          <p className="text-xs font-semibold text-foreground">
            ¿Necesitás ayuda?
          </p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
            Llamanos al{' '}
            <span className="font-semibold text-foreground">147</span> las 24 hs.
          </p>
        </div>
      )}
    </nav>
  )

  return (
    <>
      {/* overlay oscuro cuando el sidebar mobile está abierto */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* sidebar desktop — siempre visible en lg+ */}
      <aside
        className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-border lg:block"
        aria-label="Navegación principal"
      >
        {content}
      </aside>

      {/* sidebar mobile — drawer que se desliza desde la izquierda, cubre toda la pantalla */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-background shadow-xl transition-transform duration-300 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Navegación principal"
      >
        {/* cabecera del drawer */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <Link
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="rounded-md p-1.5 text-foreground/60 hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {/* nav scrollable */}
        <div className="flex-1 overflow-y-auto py-3">
          {content}
        </div>
      </aside>
    </>
  )
}