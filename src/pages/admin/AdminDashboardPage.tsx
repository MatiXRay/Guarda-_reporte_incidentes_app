import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { AlertTriangle, CalendarDays, Check, CheckCircle2, ListFilter, MapPin, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

const chartConfig = {
  value: { label: 'Reportes', color: 'var(--chart-1)' },
} satisfies ChartConfig

type Priority = 'baja' | 'media' | 'alta' | 'critica'
type Status = 'open' | 'in_progress' | 'resolved'

interface DashReporte {
  _id: string
  title: string
  category: string
  status: Status
  priority: Priority
  adhesiones: number
  location: { address: string; barrio?: string | null }
  createdAt: string
}

const CATEGORIAS = ['Calles', 'Alumbrado', 'Higiene urbana', 'Tránsito', 'Espacios verdes', 'Otro'] as const

const STATUS_OPTIONS: Status[] = ['open', 'in_progress']
const statusLabel: Record<Status, string> = { open: 'Pendiente', in_progress: 'En revisión', resolved: 'Resuelto' }
const statusDot: Record<Status, string> = { open: 'bg-yellow-400', in_progress: 'bg-primary', resolved: 'bg-emerald-500' }

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
}

function CheckRow({ checked, label, dot, onChange }: { checked: boolean; label: string; dot?: string; onChange: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
    >
      <span className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
        checked ? 'border-primary bg-primary' : 'border-border bg-background'
      )}>
        {checked && <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />}
      </span>
      {dot && <span className={cn('size-2 shrink-0 rounded-full', dot)} />}
      {label}
    </button>
  )
}

const PRIORITY_SCORE: Record<Priority, number> = { baja: 0, media: 10, alta: 20, critica: 30 }

function urgencyScore(r: DashReporte): number {
  const dias = Math.floor((Date.now() - new Date(r.createdAt).getTime()) / 86_400_000)
  return PRIORITY_SCORE[r.priority] + r.adhesiones * 1 + dias * 0.5
}

const PRIORITY_LABEL: Record<Priority, string> = {
  baja: 'Baja', media: 'Media', alta: 'Alta', critica: 'Crítica',
}

const PRIORITY_STYLE: Record<Priority, string> = {
  baja: 'bg-blue-100   text-blue-700',
  media: 'bg-yellow-100 text-yellow-800',
  alta: 'bg-orange-100 text-orange-700',
  critica: 'bg-red-100    text-red-700',
}

const STATUS_LABEL: Record<Status, string> = {
  open:        'Pendiente',
  in_progress: 'En revisión',
  resolved:    'Resuelto',
}

const STATUS_STYLE: Record<Status, string> = {
  open:        'bg-[oklch(0.96_0.06_75)] text-[oklch(0.42_0.13_60)]',
  in_progress: 'bg-primary/10 text-primary',
  resolved:    'bg-[oklch(0.95_0.06_155)] text-[oklch(0.4_0.12_155)]',
}

function diasDesde(dateStr: string): string {
  const dias = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (dias === 0) return 'creado hoy'
  if (dias === 1) return 'creado ayer'
  return `creado hace ${dias} días`
}

function formatFechaHoy() {
  const fmt = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const s = fmt.format(new Date())
  return s.charAt(0).toUpperCase() + s.slice(1)
}


export default function AdminDashboardPage() {
  const [reportes, setReportes] = useState<DashReporte[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch(`${import.meta.env.VITE_API_URL}/api/reports`)
      .then((r) => r.json())
      .then((data: unknown) => setReportes(Array.isArray(data) ? (data as DashReporte[]) : []))
      .catch(() => setReportes([]))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => ({
    total: reportes.length,
    pendientes: reportes.filter((r) => r.status === 'open').length,
    enRevision: reportes.filter((r) => r.status === 'in_progress').length,
    resueltos: reportes.filter((r) => r.status === 'resolved').length,
  }), [reportes])

  const categoriasData = useMemo(() => {
    const counts = Object.fromEntries(CATEGORIAS.map((c) => [c, 0])) as Record<string, number>
    for (const r of reportes) {
      const cat = CATEGORIAS.includes(r.category as typeof CATEGORIAS[number]) ? r.category : 'Otro'
      counts[cat]++
    }
    return CATEGORIAS.map((name) => ({ name, value: counts[name] }))
  }, [reportes])

  const barriosData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of reportes) {
      const b = r.location?.barrio
      if (b) counts[b] = (counts[b] || 0) + 1
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [reportes])

  const atencionList = useMemo(() =>
    reportes
      .filter((r) => r.status === 'open' || r.status === 'in_progress')
      .sort((a, b) => urgencyScore(b) - urgencyScore(a))
      .slice(0, 8),
    [reportes])

  const [filtrosStatus, setFiltrosStatus] = useState<Status[]>([])
  const [filtrosCategorias, setFiltrosCategorias] = useState<string[]>([])
  const filterBtnRef = useRef<HTMLButtonElement>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterRect, setFilterRect] = useState<DOMRect | null>(null)

  const activeFilterCount = filtrosStatus.length + filtrosCategorias.length

  const atencionFiltrada = useMemo(() =>
    atencionList.filter((r) => {
      if (filtrosStatus.length > 0 && !filtrosStatus.includes(r.status)) return false
      if (filtrosCategorias.length > 0 && !filtrosCategorias.includes(r.category)) return false
      return true
    }),
    [atencionList, filtrosStatus, filtrosCategorias]
  )

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando datos…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Panel general</h1>
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
          <CalendarDays className="size-4 shrink-0" aria-hidden />
          <span>{formatFechaHoy()}</span>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total" description="Total histórico" value={stats.total} tone="neutral" />
        <StatCard label="Pendientes" description="Esperando revisión" value={stats.pendientes} tone="warning" />
        <StatCard label="En revisión" description="El equipo los atiende" value={stats.enRevision} tone="primary" />
        <StatCard label="Resueltos" description="Problemas solucionados" value={stats.resueltos} tone="success" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

        {/* Categorías — 3/5 */}
        <Card className="border border-border shadow-none lg:col-span-3">
          <CardContent className="p-4">
            <p className="mb-4 text-lg font-semibold text-foreground">Reportes por categoría</p>
            {categoriasData.length === 0 ? (
              <div className="flex h-56 items-center justify-center">
                <p className="text-sm text-muted-foreground">Sin datos aún</p>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="max-h-[220px] w-full">
                <BarChart data={categoriasData} margin={{ top: 4, right: 4, bottom: 48, left: -8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={8}
                    axisLine={false}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={28}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={8} maxBarSize={52} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Barrios — 2/5 */}
        <Card className="border border-border shadow-none lg:col-span-2">
          <CardContent className="p-4">
            <p className="mb-4 text-lg font-semibold text-foreground">Reportes por barrios</p>
            {barriosData.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-center px-4">
                <p className="text-sm text-muted-foreground">
                  Los nuevos reportes mostrarán datos por barrio aquí.
                </p>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="max-h-[220px] w-full">
                <BarChart
                  layout="vertical"
                  data={barriosData}
                  margin={{ top: 4, right: 24, bottom: 4, left: 0 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={96}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} maxBarSize={22} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de atención */}
      <Card className="border border-border shadow-none">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            <p className="text-lg font-semibold text-foreground">Requieren atención</p>
            <span className="text-xs text-muted-foreground">
              {atencionFiltrada.length} reporte{atencionFiltrada.length !== 1 ? 's' : ''}
            </span>
            <button
              ref={filterBtnRef}
              type="button"
              onClick={() => {
                setFilterRect(filterBtnRef.current?.getBoundingClientRect() ?? null)
                setFilterOpen((v) => !v)
              }}
              aria-label="Filtrar"
              className={cn(
                'relative ml-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors outline-none',
                filterOpen || activeFilterCount > 0
                  ? 'border-primary bg-primary/8 text-primary'
                  : 'border-border bg-background text-foreground hover:bg-muted',
              )}
            >
              <ListFilter className="size-5" aria-hidden />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {atencionList.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle2 className="size-8 text-green-500" />
              <p className="text-sm font-medium text-foreground">Todo al día</p>
              <p className="text-sm text-muted-foreground">No hay reportes pendientes de revisión.</p>
            </div>
          ) : atencionFiltrada.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Ningún reporte coincide con los filtros aplicados.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {atencionFiltrada.map((r) => (
                <li key={r._id} className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                  <Link
                    to={`/admin/reportes?detalle=${r._id}`}
                    className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <span className={cn('w-16 shrink-0 rounded-md py-1 text-center text-xs font-semibold', PRIORITY_STYLE[r.priority])}>
                      {PRIORITY_LABEL[r.priority]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-foreground">{r.title}</p>
                      <div className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                        <span>{r.category}</span>
                        {r.location?.address && (
                          <>
                            <span>·</span>
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="truncate">{r.location.address}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-muted-foreground">{diasDesde(r.createdAt)}</span>
                      <span className={cn('whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium', STATUS_STYLE[r.status])}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Portal: filtro */}
      {filterOpen && filterRect && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
          <div
            className="fixed z-50 w-60 rounded-xl border border-border bg-background p-3 shadow-lg"
            style={{ top: filterRect.bottom + 6, right: window.innerWidth - filterRect.right }}
          >
            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Estado</p>
            {STATUS_OPTIONS.map((s) => (
              <CheckRow key={s} checked={filtrosStatus.includes(s)} label={statusLabel[s]} dot={statusDot[s]}
                onChange={() => setFiltrosStatus((v) => toggle(v, s))} />
            ))}

            <div className="my-2.5 border-t border-border" />

            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Categoría</p>
            {CATEGORIAS.map((cat) => (
              <CheckRow key={cat} checked={filtrosCategorias.includes(cat)} label={cat}
                onChange={() => setFiltrosCategorias((v) => toggle(v, cat))} />
            ))}

            {activeFilterCount > 0 && (
              <>
                <div className="my-2.5 border-t border-border" />
                <button
                  type="button"
                  onClick={() => { setFiltrosStatus([]); setFiltrosCategorias([]) }}
                  className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/8"
                >
                  <X className="size-3.5" />
                  Limpiar filtros
                </button>
              </>
            )}
          </div>
        </>,
        document.body,
      )}

    </div>
  )
}

function StatCard({
  label, description, value, tone,
}: {
  label: string
  description: string
  value: number
  tone: 'neutral' | 'warning' | 'primary' | 'success'
}) {
  const boxStyle = {
    neutral: { bg: 'bg-muted', fg: 'text-foreground', border: 'border-border' },
    warning: { bg: 'bg-[oklch(0.96_0.06_75)]', fg: 'text-[oklch(0.5_0.13_60)]', border: 'border-[oklch(0.85_0.1_70)]' },
    primary: { bg: 'bg-primary/10', fg: 'text-primary', border: 'border-primary/20' },
    success: { bg: 'bg-[oklch(0.95_0.06_155)]', fg: 'text-[oklch(0.42_0.13_155)]', border: 'border-[oklch(0.85_0.08_155)]' },
  }[tone]

  return (
    <Card className="border border-border shadow-none">
      <CardContent className="flex items-stretch gap-3 p-4">
        <div className="flex flex-1 flex-col justify-center gap-1">
          <p className="text-base font-semibold text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className={cn('flex min-w-[3.5rem] items-center justify-center rounded-xl border', boxStyle.bg, boxStyle.fg, boxStyle.border)}>
          <p className="font-heading text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
