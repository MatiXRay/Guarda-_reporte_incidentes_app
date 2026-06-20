import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
    AlertTriangle,
    ArrowUpDown,
    Check,
    ListFilter,
    Search,
    ShieldCheck,
    Trash2,
    UserPlus,
    Users,
    UserX,
    RotateCcw,
    X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

type Role = 'citizen' | 'admin' | 'superadmin'
type FiltroEstado = 'todos' | 'activos' | 'desactivados'
type FiltroRol = 'todos' | Role

interface Usuario {
    _id: string
    nombre: string
    email: string
    role: Role
    isActive: boolean
    createdAt: string
    deletedAt: string | null
}

const roleBadgeStyles: Record<Role, string> = {
    citizen: 'bg-muted text-muted-foreground',
    admin: 'bg-primary/10 text-primary',
    superadmin: 'bg-[oklch(0.95_0.06_155)] text-[oklch(0.42_0.13_155)]',
}

const ROLES: Role[] = ['citizen', 'admin', 'superadmin']

function formatFecha(iso: string) {
    return new Intl.DateTimeFormat('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(iso))
}

export default function AdminUsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('activos')
    const [filtroRol, setFiltroRol] = useState<FiltroRol>('todos')
    const [orden, setOrden] = useState<'recientes' | 'antiguos'>('recientes')
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterRect, setFilterRect] = useState<DOMRect | null>(null)
    const filterBtnRef = useRef<HTMLButtonElement>(null)
    const [sortOpen, setSortOpen] = useState(false)
    const [sortRect, setSortRect] = useState<DOMRect | null>(null)
    const sortBtnRef = useRef<HTMLButtonElement>(null)

    const [confirmModal, setConfirmModal] = useState<{ usuario: Usuario; accion: 'desactivar' | 'reactivar' } | null>(null)

    const [addModalOpen, setAddModalOpen] = useState(false)
    const [addNombre, setAddNombre] = useState('')
    const [addEmail, setAddEmail] = useState('')
    const [addPassword, setAddPassword] = useState('')
    const [addLoading, setAddLoading] = useState(false)
    const [addError, setAddError] = useState<string | null>(null)

    function openFilter() {
        if (filterBtnRef.current) setFilterRect(filterBtnRef.current.getBoundingClientRect())
        setFilterOpen((v) => !v)
    }

    function closeAddModal() {
        setAddModalOpen(false)
        setAddNombre('')
        setAddEmail('')
        setAddPassword('')
        setAddError(null)
    }

    async function handleAddAdmin(e: { preventDefault(): void }) {
        e.preventDefault()
        setAddLoading(true)
        setAddError(null)
        try {
            const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/users`, {
                method: 'POST',
                body: JSON.stringify({ nombre: addNombre, email: addEmail, password: addPassword, role: 'admin' }),
            })
            const body = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error((body as { error?: string }).error ?? `Error ${res.status}`)
            setUsuarios((prev) => [body as Usuario, ...prev])
            closeAddModal()
        } catch (err) {
            setAddError(err instanceof Error ? err.message : 'No se pudo crear el usuario')
        } finally {
            setAddLoading(false)
        }
    }

    useEffect(() => {
        apiFetch(`${import.meta.env.VITE_API_URL}/api/users`)
            .then((res) => {
                if (!res.ok) throw new Error('No se pudieron cargar los usuarios')
                return res.json()
            })
            .then((data) => setUsuarios(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const handleRoleChange = async (id: string, nuevoRol: Role) => {
        setUpdatingId(id)
        try {
            const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ role: nuevoRol }),
            })
            if (!res.ok) throw new Error()
            setUsuarios((prev) =>
                prev.map((u) => (u._id === id ? { ...u, role: nuevoRol } : u))
            )
        } catch {
            alert('No se pudo actualizar el rol')
        } finally {
            setUpdatingId(null)
        }
    }

    const handleDesactivar = async (id: string) => {
        setConfirmModal(null)
        setDeletingId(id)
        try {
            const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
                method: 'DELETE',
            })
            if (!res.ok) throw new Error()
            setUsuarios((prev) =>
                prev.map((u) =>
                    u._id === id ? { ...u, isActive: false, deletedAt: new Date().toISOString() } : u
                )
            )
        } catch {
            alert('No se pudo desactivar el usuario')
        } finally {
            setDeletingId(null)
        }
    }

    const handleReactivar = async (id: string) => {
        setConfirmModal(null)
        setUpdatingId(id)
        try {
            const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: true }),
            })
            if (!res.ok) throw new Error()
            setUsuarios((prev) =>
                prev.map((u) =>
                    u._id === id ? { ...u, isActive: true, deletedAt: null } : u
                )
            )
        } catch {
            alert('No se pudo reactivar el usuario')
        } finally {
            setUpdatingId(null)
        }
    }

    const activos = usuarios.filter((u) => u.isActive)
    const desactivados = usuarios.filter((u) => !u.isActive)

    const activeFilterCount =
        (filtroEstado !== 'activos' ? 1 : 0) +
        (filtroRol !== 'todos' ? 1 : 0)

    const filtrados = (() => {
        let list = usuarios
        if (filtroEstado === 'activos') list = list.filter((u) => u.isActive)
        else if (filtroEstado === 'desactivados') list = list.filter((u) => !u.isActive)
        if (filtroRol !== 'todos') list = list.filter((u) => u.role === filtroRol)
        if (busqueda.trim()) {
            const q = busqueda.toLowerCase()
            list = list.filter((u) =>
                u.nombre.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.role.toLowerCase().includes(q)
            )
        }
        if (orden === 'antiguos') list = [...list].reverse()
        return list
    })()

    return (
        <>
        <div className="flex flex-col gap-6">
            {/* Header */}
            <header className="animate-fade-up flex items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                        Gestión de usuarios
                    </h1>
                    <p className="mt-1 text-base text-muted-foreground">
                        Administrá roles y usuarios del sistema.
                    </p>
                </div>
                {!loading && (
                    <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                        <Users className="size-3.5" aria-hidden />
                        {activos.length} activos · {desactivados.length} desactivados
                    </span>
                )}
            </header>

            {/* Barra de herramientas */}
            <section className="animate-fade-up [animation-delay:40ms] flex items-center gap-2">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <Input
                        type="search"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre, email o rol…"
                        className="h-12 pl-10 text-base rounded-xl"
                    />
                </div>
                <button
                    ref={filterBtnRef}
                    onClick={openFilter}
                    aria-label="Filtrar usuarios"
                    className={cn(
                        'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors outline-none',
                        filterOpen || activeFilterCount > 0
                            ? 'border-primary bg-primary/8 text-primary'
                            : 'border-border bg-background text-foreground hover:bg-muted'
                    )}
                >
                    <ListFilter className="size-5" aria-hidden />
                    {activeFilterCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
                <button
                    ref={sortBtnRef}
                    onClick={() => {
                        if (sortBtnRef.current) setSortRect(sortBtnRef.current.getBoundingClientRect())
                        setSortOpen((v) => !v)
                        setFilterOpen(false)
                    }}
                    aria-label="Ordenar usuarios"
                    className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors outline-none',
                        sortOpen || orden !== 'recientes'
                            ? 'border-primary bg-primary/8 text-primary'
                            : 'border-border bg-background text-foreground hover:bg-muted'
                    )}
                >
                    <ArrowUpDown className="size-5" aria-hidden />
                </button>
                <button
                    onClick={() => setAddModalOpen(true)}
                    aria-label="Agregar admin"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary bg-primary text-primary-foreground transition-colors hover:bg-primary/90 outline-none"
                >
                    <UserPlus className="size-5" aria-hidden />
                </button>
            </section>

            {/* Tabla */}
            <section className="animate-fade-up [animation-delay:80ms]" aria-label="Lista de usuarios">
                {loading ? (
                    <Card className="flex items-center justify-center border border-border px-6 py-12 shadow-none">
                        <p className="text-sm text-muted-foreground">Cargando usuarios…</p>
                    </Card>
                ) : error ? (
                    <Card className="flex flex-col items-center justify-center gap-2 border border-destructive/30 bg-destructive/5 px-6 py-12 text-center shadow-none">
                        <AlertTriangle className="size-8 text-destructive/70" aria-hidden />
                        <p className="text-sm font-medium text-foreground">Error al cargar usuarios</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </Card>
                ) : filtrados.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center gap-2 border border-border px-6 py-12 text-center shadow-none">
                        <Users className="size-8 text-muted-foreground" aria-hidden />
                        <p className="text-sm font-medium text-foreground">
                            No hay usuarios {filtroEstado === 'desactivados' ? 'desactivados' : 'que coincidan'}
                        </p>
                    </Card>
                ) : (
                    <Card className="overflow-hidden border border-border shadow-none">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Usuario</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rol</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Registrado</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtrados.map((usuario) => (
                                        <tr
                                            key={usuario._id}
                                            className={cn(
                                                'transition-colors hover:bg-muted/30',
                                                !usuario.isActive && 'opacity-60'
                                            )}
                                        >
                                            {/* Usuario */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        'grid size-8 shrink-0 place-items-center rounded-lg',
                                                        usuario.isActive ? 'bg-primary/8 text-primary' : 'bg-destructive/10 text-destructive/70'
                                                    )}>
                                                        {usuario.isActive
                                                            ? <ShieldCheck className="size-4" aria-hidden />
                                                            : <UserX className="size-4" aria-hidden />
                                                        }
                                                    </span>
                                                    <div>
                                                        <p className="font-semibold text-foreground">{usuario.nombre}</p>
                                                        <p className="text-xs text-muted-foreground">{usuario.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Rol */}
                                            <td className="px-4 py-3">
                                                <Badge className={cn('rounded-full border-0 px-2.5 py-0.5 text-xs font-medium', roleBadgeStyles[usuario.role])}>
                                                    {usuario.role}
                                                </Badge>
                                            </td>

                                            {/* Estado */}
                                            <td className="px-4 py-3">
                                                {usuario.isActive ? (
                                                    <span className="text-xs font-medium text-emerald-600">Activo</span>
                                                ) : (
                                                    <span className="text-xs font-medium text-destructive">Desactivado</span>
                                                )}
                                            </td>

                                            {/* Fecha */}
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                {usuario.isActive
                                                    ? formatFecha(usuario.createdAt)
                                                    : formatFecha(usuario.deletedAt!)
                                                }
                                            </td>

                                            {/* Acciones */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    {usuario.isActive ? (
                                                        <>
                                                            <select
                                                                value={usuario.role}
                                                                disabled={updatingId === usuario._id}
                                                                onChange={(e) => handleRoleChange(usuario._id, e.target.value as Role)}
                                                                className="h-8 rounded-md border border-border bg-background px-2 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
                                                                aria-label={`Cambiar rol de ${usuario.nombre}`}
                                                            >
                                                                {ROLES.map((r) => (
                                                                    <option key={r} value={r}>{r}</option>
                                                                ))}
                                                            </select>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={deletingId === usuario._id}
                                                                onClick={() => setConfirmModal({ usuario, accion: 'desactivar' })}
                                                                className="h-8 px-2 text-destructive hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
                                                                aria-label={`Desactivar ${usuario.nombre}`}
                                                            >
                                                                <Trash2 className="size-3.5" aria-hidden />
                                                                {deletingId === usuario._id ? 'Desactivando…' : 'Desactivar'}
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            disabled={updatingId === usuario._id}
                                                            onClick={() => setConfirmModal({ usuario, accion: 'reactivar' })}
                                                            className="h-8 px-2 bg-emerald-600 text-white hover:bg-emerald-700 border-0"
                                                            aria-label={`Reactivar ${usuario.nombre}`}
                                                        >
                                                            <RotateCcw className="size-3.5" aria-hidden />
                                                            {updatingId === usuario._id ? 'Reactivando…' : 'Reactivar'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </section>
        </div>

        {confirmModal && createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="flex w-full max-w-sm flex-col gap-5 rounded-xl border border-border bg-background p-6 shadow-xl">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <span className={cn(
                            'flex size-14 items-center justify-center rounded-full',
                            confirmModal.accion === 'desactivar'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-emerald-100 text-emerald-700'
                        )}>
                            {confirmModal.accion === 'desactivar'
                                ? <UserX className="size-7" aria-hidden />
                                : <RotateCcw className="size-7" aria-hidden />
                            }
                        </span>
                        <div>
                            <h2 className="font-heading text-base font-semibold text-foreground">
                                {confirmModal.accion === 'desactivar' ? 'Desactivar usuario' : 'Reactivar usuario'}
                            </h2>
                            <p className="mt-1 text-sm font-medium text-foreground">{confirmModal.usuario.nombre}</p>
                            <p className="text-xs text-muted-foreground">{confirmModal.usuario.email}</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {confirmModal.accion === 'desactivar'
                                    ? 'El usuario no podrá iniciar sesión. Podés reactivarlo en cualquier momento.'
                                    : 'El usuario podrá volver a iniciar sesión con normalidad.'
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmModal(null)}
                            className="h-10 flex-1 rounded-xl text-sm"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => confirmModal.accion === 'desactivar'
                                ? handleDesactivar(confirmModal.usuario._id)
                                : handleReactivar(confirmModal.usuario._id)
                            }
                            className={cn(
                                'h-10 flex-1 rounded-xl text-sm font-semibold',
                                confirmModal.accion === 'desactivar'
                                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            )}
                        >
                            {confirmModal.accion === 'desactivar' ? 'Sí, desactivar' : 'Sí, reactivar'}
                        </Button>
                    </div>
                </div>
            </div>,
            document.body
        )}

        {addModalOpen && createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="flex w-full max-w-sm flex-col gap-5 rounded-xl border border-border bg-background p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heading text-base font-semibold text-foreground">Agregar admin</h2>
                        <button onClick={closeAddModal} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors" aria-label="Cerrar">
                            <X className="size-4" />
                        </button>
                    </div>
                    <form onSubmit={handleAddAdmin} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground">Nombre</label>
                            <input
                                required
                                type="text"
                                value={addNombre}
                                onChange={(e) => setAddNombre(e.target.value)}
                                placeholder="Nombre completo"
                                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground">Email</label>
                            <input
                                required
                                type="email"
                                value={addEmail}
                                onChange={(e) => setAddEmail(e.target.value)}
                                placeholder="admin@ejemplo.com"
                                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground">Contraseña</label>
                            <input
                                required
                                type="password"
                                value={addPassword}
                                onChange={(e) => setAddPassword(e.target.value)}
                                placeholder="Mínimo 8 caracteres"
                                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50"
                            />
                        </div>
                        {addError && (
                            <p className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                <AlertTriangle className="size-4 shrink-0" aria-hidden />
                                {addError}
                            </p>
                        )}
                        <div className="flex gap-2 pt-1">
                            <Button type="button" variant="outline" onClick={closeAddModal} className="h-10 flex-1 rounded-xl text-sm" disabled={addLoading}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="h-10 flex-1 rounded-xl text-sm font-semibold" disabled={addLoading}>
                                {addLoading ? 'Creando…' : 'Crear admin'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>,
            document.body
        )}

        {filterOpen && filterRect && createPortal(
            <>
                <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
                <div
                    className="fixed z-50 w-52 rounded-xl border border-border bg-background p-2 shadow-lg"
                    style={{ top: filterRect.bottom + 6, right: window.innerWidth - filterRect.right }}
                >
                    <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Estado</p>
                    {(['todos', 'activos', 'desactivados'] as FiltroEstado[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFiltroEstado(f)}
                            className={cn(
                                'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm capitalize transition-colors',
                                filtroEstado === f ? 'bg-primary/5 font-medium text-primary' : 'text-foreground hover:bg-muted'
                            )}
                        >
                            {f}
                            {filtroEstado === f && <Check className="size-3.5" strokeWidth={2.5} />}
                        </button>
                    ))}
                    <div className="my-2 border-t border-border" />
                    <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Rol</p>
                    {(['todos', 'citizen', 'admin', 'superadmin'] as FiltroRol[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setFiltroRol(r)}
                            className={cn(
                                'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm capitalize transition-colors',
                                filtroRol === r ? 'bg-primary/5 font-medium text-primary' : 'text-foreground hover:bg-muted'
                            )}
                        >
                            {r}
                            {filtroRol === r && <Check className="size-3.5" strokeWidth={2.5} />}
                        </button>
                    ))}
                    {activeFilterCount > 0 && (
                        <>
                            <div className="my-2 border-t border-border" />
                            <button
                                onClick={() => { setFiltroEstado('activos'); setFiltroRol('todos'); setFilterOpen(false) }}
                                className="w-full rounded-md px-2.5 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/8"
                            >
                                Limpiar filtros
                            </button>
                        </>
                    )}
                </div>
            </>,
            document.body
        )}

        {sortOpen && sortRect && createPortal(
            <>
                <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                <div
                    className="fixed z-50 w-48 rounded-xl border border-border bg-background p-1.5 shadow-lg"
                    style={{ top: sortRect.bottom + 6, right: window.innerWidth - sortRect.right }}
                >
                    {([
                        { value: 'recientes', label: 'Más recientes' },
                        { value: 'antiguos',  label: 'Más antiguos' },
                    ] as const).map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => { setOrden(value); setSortOpen(false) }}
                            className={cn(
                                'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors',
                                orden === value ? 'bg-primary/5 font-medium text-primary' : 'text-foreground hover:bg-muted'
                            )}
                        >
                            {label}
                            {orden === value && <Check className="size-3.5" strokeWidth={2.5} />}
                        </button>
                    ))}
                </div>
            </>,
            document.body
        )}
        </>
    )
}