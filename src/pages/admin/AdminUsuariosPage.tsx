import { useEffect, useState } from 'react'
import {
    AlertTriangle,
    Search,
    ShieldCheck,
    Trash2,
    Users,
    UserX,
    RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

type Role = 'citizen' | 'admin' | 'superadmin'
type Filtro = 'activos' | 'desactivados'

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
    const [filtro, setFiltro] = useState<Filtro>('activos')
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

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

    const handleDesactivar = async (id: string, nombre: string) => {
        if (!confirm(`¿Desactivar al usuario "${nombre}"? Podrás reactivarlo después.`)) return
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

    const handleReactivar = async (id: string, nombre: string) => {
        if (!confirm(`¿Reactivar al usuario "${nombre}"?`)) return
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
    const listaBase = filtro === 'activos' ? activos : desactivados

    const filtrados = listaBase.filter((u) => {
        const q = busqueda.toLowerCase()
        return (
            u.nombre.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q)
        )
    })

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <header className="animate-fade-up flex items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                        Gestión de usuarios
                    </h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
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

            {/* Filtros */}
            <section className="animate-fade-up [animation-delay:40ms] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-xs">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <Input
                        type="search"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre, email o rol…"
                        className="h-8 pl-8 text-sm"
                    />
                </div>
                <div className="flex gap-1.5">
                    {(['activos', 'desactivados'] as Filtro[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFiltro(f)}
                            className={cn(
                                'h-8 rounded-full border px-3 text-sm font-medium transition-colors outline-none capitalize',
                                'focus-visible:ring-2 focus-visible:ring-ring/50',
                                filtro === f
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-background text-foreground/70 hover:bg-muted hover:text-foreground'
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </section>

            {/* Lista */}
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
                            No hay usuarios {filtro === 'desactivados' ? 'desactivados' : 'que coincidan'}
                        </p>
                    </Card>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {filtrados.map((usuario) => (
                            <li key={usuario._id}>
                                <Card className={cn(
                                    'border shadow-none transition-colors',
                                    usuario.isActive
                                        ? 'border-border hover:bg-muted/30'
                                        : 'border-destructive/20 bg-destructive/5 opacity-75'
                                )}>
                                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        {/* Info */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className={cn(
                                                'grid size-8 shrink-0 place-items-center rounded-lg',
                                                usuario.isActive
                                                    ? 'bg-primary/8 text-primary'
                                                    : 'bg-destructive/10 text-destructive/70'
                                            )}>
                                                {usuario.isActive
                                                    ? <ShieldCheck className="size-4" aria-hidden />
                                                    : <UserX className="size-4" aria-hidden />
                                                }
                                            </span>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <Badge className={cn('h-5 rounded-full border-0 px-2 text-sm font-medium', roleBadgeStyles[usuario.role])}>
                                                        {usuario.role}
                                                    </Badge>
                                                    {!usuario.isActive && (
                                                        <Badge className="h-5 rounded-full border-0 bg-destructive/10 px-2 text-sm font-medium text-destructive">
                                                            desactivado
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mt-0.5 text-sm font-semibold leading-snug text-foreground">
                                                    {usuario.nombre}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{usuario.email}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {usuario.isActive
                                                        ? `Registrado el ${formatFecha(usuario.createdAt)}`
                                                        : `Desactivado el ${formatFecha(usuario.deletedAt!)}`
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex shrink-0 items-center gap-2">
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
                                                        onClick={() => handleDesactivar(usuario._id, usuario.nombre)}
                                                        className="h-8 px-2 text-sm text-destructive hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
                                                        aria-label={`Desactivar usuario ${usuario.nombre}`}
                                                    >
                                                        <Trash2 className="size-3.5" aria-hidden />
                                                        {deletingId === usuario._id ? 'Desactivando…' : 'Desactivar'}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={updatingId === usuario._id}
                                                    onClick={() => handleReactivar(usuario._id, usuario.nombre)}
                                                    className="h-8 px-2 text-sm text-primary hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                                                    aria-label={`Reactivar usuario ${usuario.nombre}`}
                                                >
                                                    <RotateCcw className="size-3.5" aria-hidden />
                                                    {updatingId === usuario._id ? 'Reactivando…' : 'Reactivar'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}