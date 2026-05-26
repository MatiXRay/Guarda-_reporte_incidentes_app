import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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
  ShieldCheck,
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

const secondaryNav: NavItem[] = [
  { label: 'Configuración', icon: Settings, to: '/configuracion' },
  { label: 'Ayuda', icon: HelpCircle, to: '/ayuda' },
]

const reportesSubNav: NavItem[] = [
  { label: 'Mis Reportes', icon: ClipboardList, to: '/reportes', end: true },
  { label: 'Nuevo Reporte', icon: PlusCircle, to: '/reportes/nuevo' },
]

/* nav exclusiva para admin y superadmin */
const adminNav: NavItem[] = [
  { label: 'Panel de reportes', icon: LayoutDashboard, to: '/admin/reportes', end: true },
]

/* nav exclusiva para superadmin */
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
          'group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors outline-none',
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
              'size-4 shrink-0 transition-colors',
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
          'group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring/50',
          isInReportes
            ? 'text-primary'
            : 'text-foreground/70 hover:bg-muted hover:text-foreground'
        )}
      >
        <ClipboardList
          className={cn(
            'size-4 shrink-0 transition-colors',
            isInReportes ? 'text-primary' : 'text-foreground/50 group-hover:text-foreground'
          )}
          aria-hidden
        />
        <span className="flex-1 text-left">Reportes</span>
        <ChevronRight
          className={cn(
            'size-3.5 shrink-0 transition-transform duration-200',
            open && 'rotate-90'
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul className="mt-0.5 flex flex-col gap-0.5 pl-4">
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

export function Sidebar() {
  const { role } = useUserRole()

  const isAdmin = role === 'admin' || role === 'superadmin'
  const isSuperadmin = role === 'superadmin'

  return (
    <aside
      className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-52 shrink-0 border-r border-border lg:block"
      aria-label="Navegación principal"
    >
      <nav className="scrollbar-soft flex h-full flex-col gap-1 overflow-y-auto px-3 py-4">
        <p className="px-2.5 pb-1 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Menú
        </p>
        <ul className="flex flex-col gap-0.5">
          <li>
            <SidebarLink item={{ label: 'Inicio', icon: Home, to: '/dashboard', end: true }} />
          </li>
          <ReportesSection />
          <li>
            <SidebarLink item={{ label: 'Mapa', icon: Map, to: '/mapa' }} />
          </li>
        </ul>

        {/* Sección admin */}
        {isAdmin && (
          <>
            <Separator className="my-3" />
            <p className="px-2.5 pb-1 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Administración
            </p>
            <ul className="flex flex-col gap-0.5">
              {adminNav.map((item) => (
                <li key={item.label}>
                  <SidebarLink item={item} />
                </li>
              ))}
              {/* Sección superadmin */}
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
        <ul className="flex flex-col gap-0.5">
          {secondaryNav.map((item) => (
            <li key={item.label}>
              <SidebarLink item={item} />
            </li>
          ))}
        </ul>

        {/* Badge de rol */}
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
    </aside>
  )
}