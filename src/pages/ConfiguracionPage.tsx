import { useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { apiFetch } from '@/lib/api'
import { useUserRole } from '@/context/UserRoleContext'
import { Bell, Settings, ShieldCheck, User, ChevronRight, Loader2, Monitor, LogOut } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type Section = 'datos' | 'seguridad' | null

/* ── Datos personales ── */
function DatosSection() {
  const { user } = useUser()
  const { mongoId } = useUserRole()
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      const nombre = `${firstName.trim()} ${lastName.trim()}`.trim()
      await Promise.all([
        user?.update({ firstName: firstName.trim(), lastName: lastName.trim() }),
        mongoId
          ? apiFetch(`${import.meta.env.VITE_API_URL}/api/users/${mongoId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nombre }),
            })
          : Promise.resolve(),
      ])
      setMsg({ ok: true, text: 'Datos actualizados correctamente.' })
    } catch {
      setMsg({ ok: false, text: 'No se pudo actualizar. Intentá de nuevo.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-4 pt-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Nombre</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50"
            placeholder="Tu nombre"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Apellido</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50"
            placeholder="Tu apellido"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Email</label>
        <input
          value={user?.primaryEmailAddress?.emailAddress ?? ''}
          disabled
          className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
        />
        <p className="text-[11px] text-muted-foreground">El email se gestiona desde tu proveedor de identidad.</p>
      </div>
      {msg && (
        <p className={cn('text-xs', msg.ok ? 'text-green-600' : 'text-destructive')}>{msg.text}</p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {saving && <Loader2 className="size-3.5 animate-spin" />}
          Guardar cambios
        </button>
      </div>
    </form>
  )
}

/* ── Seguridad ── */
function SeguridadSection() {
  const { user } = useClerk()
  const sessions = user?.client?.sessions ?? []

  const [current, setCurrent] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPwd !== confirm) {
      setMsg({ ok: false, text: 'Las contraseñas no coinciden.' })
      return
    }
    if (newPwd.length < 8) {
      setMsg({ ok: false, text: 'La contraseña debe tener al menos 8 caracteres.' })
      return
    }
    setSaving(true)
    setMsg(null)
    try {
      await user?.updatePassword({ currentPassword: current, newPassword: newPwd })
      setMsg({ ok: true, text: 'Contraseña actualizada correctamente.' })
      setCurrent(''); setNewPwd(''); setConfirm('')
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] }
      setMsg({ ok: false, text: clerkErr?.errors?.[0]?.message ?? 'No se pudo actualizar la contraseña.' })
    } finally {
      setSaving(false)
    }
  }

  const revokeSession = async (sessionId: string) => {
    setRevokingId(sessionId)
    try {
      const session = sessions.find((s) => s.id === sessionId)
      await session?.revoke()
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-4 pt-3">
      {/* Cambio de contraseña */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cambiar contraseña</p>
        <form onSubmit={handlePassword} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Contraseña actual</label>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nueva contraseña</label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50"
                required
              />
            </div>
          </div>
          {msg && (
            <p className={cn('text-xs', msg.ok ? 'text-green-600' : 'text-destructive')}>{msg.text}</p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              Actualizar contraseña
            </button>
          </div>
        </form>
      </div>

      {/* Sesiones activas */}
      {sessions.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sesiones activas</p>
            <ul className="flex flex-col gap-2">
              {sessions.map((s) => {
                const isCurrent = s.id === user?.client?.activeSessions?.[0]?.id
                return (
                  <li key={s.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                    <Monitor className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {isCurrent ? 'Esta sesión' : 'Otra sesión'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Último acceso: {new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(s.lastActiveAt))}
                      </p>
                    </div>
                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => revokeSession(s.id)}
                        disabled={revokingId === s.id}
                        className="shrink-0 flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
                      >
                        {revokingId === s.id ? <Loader2 className="size-3 animate-spin" /> : <LogOut className="size-3" />}
                        Cerrar
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Página principal ── */
export default function ConfiguracionPage() {
  const { user } = useUser()
  const nombre = user?.fullName ?? user?.firstName ?? 'Vecino'
  const email = user?.primaryEmailAddress?.emailAddress ?? '—'
  const [activeSection, setActiveSection] = useState<Section>(null)

  const toggle = (section: Section) =>
    setActiveSection((prev) => (prev === section ? null : section))

  const sections = [
    { id: 'datos' as const, icon: User, title: 'Datos personales', description: 'Nombre y contacto' },
    { id: 'notif' as const, icon: Bell, title: 'Notificaciones', description: 'Próximamente', disabled: true },
    { id: 'seguridad' as const, icon: ShieldCheck, title: 'Seguridad', description: 'Contraseña y sesiones activas' },
  ]

  return (
    <div className="animate-fade-up mx-auto max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Configuración</h1>
        <p className="mt-1 text-base text-muted-foreground">Gestioná tus datos, preferencias y seguridad.</p>
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
            {sections.map((item, idx) => {
              const Icon = item.icon
              const isOpen = activeSection === item.id
              const isLast = idx === sections.length - 1

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={'disabled' in item && item.disabled}
                    onClick={() => !('disabled' in item && item.disabled) && toggle(item.id as Section)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors outline-none',
                      'hover:bg-muted/40 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50',
                      isLast && !isOpen && 'rounded-b-xl',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">{item.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{item.description}</span>
                    </span>
                    <ChevronRight className={cn('size-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-90')} aria-hidden />
                  </button>

                  {isOpen && (
                    <>
                      <Separator />
                      {item.id === 'datos' && <DatosSection />}
                      {item.id === 'seguridad' && <SeguridadSection />}
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
