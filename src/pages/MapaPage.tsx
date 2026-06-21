import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIconPng from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { CalendarDays, MapPin, Users, X } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useUserRole } from '@/context/UserRoleContext'
import { cn } from '@/lib/utils'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIconPng, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

const VILLA_MARIA: [number, number] = [-32.4105, -63.2424]
const MAP_HEIGHT = 'calc(100dvh - 56px)'

/* ── tipos ── */
type HeatPoint = { lat: number; lng: number; score: number }

type CitizenReporte = {
  _id: string
  title: string
  category: string
  status: 'open' | 'in_progress' | 'resolved'
  description: string
  createdAt: string
  adhesiones: number
  location: { lat: number; lng: number; address: string }
  imageUrls: string[]
}

/* ── estilos ── */
const STATUS_LABEL: Record<string, string> = {
  open: 'Pendiente', in_progress: 'En revisión', resolved: 'Resuelto',
}
const STATUS_STYLE: Record<string, string> = {
  open:        'bg-[oklch(0.96_0.06_75)] text-[oklch(0.42_0.13_60)]',
  in_progress: 'bg-primary/10 text-primary',
  resolved:    'bg-[oklch(0.95_0.06_155)] text-[oklch(0.4_0.12_155)]',
}
const CATEGORY_COLOR: Record<string, string> = {
  'Calles':          '#f97316',
  'Tránsito':        '#f97316',
  'Alumbrado':       '#eab308',
  'Higiene urbana':  '#22c55e',
  'Espacios verdes': '#10b981',
  'Otro':            '#8b5cf6',
}

function markerIcon(category: string) {
  const color = CATEGORY_COLOR[category] ?? '#8b5cf6'
  return L.divIcon({
    className: '',
    html: `<div style="width:13px;height:13px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,0.35)"></div>`,
    iconSize: [13, 13],
    iconAnchor: [6, 6],
  })
}

const userLocationIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,0.25)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

/* ── componentes auxiliares ── */
function HeatLayer({ points }: { points: HeatPoint[] }) {
  const map = useMap()
  useEffect(() => {
    if (!points.length) return
    const max = Math.max(...points.map((p) => p.score), 1)
    const heat = L.heatLayer(
      points.map((p) => [p.lat, p.lng, p.score]),
      { radius: 30, blur: 20, maxZoom: 17, max }
    )
    heat.addTo(map)
    return () => { heat.remove() }
  }, [map, points])
  return null
}

function MapCenterSetter({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], zoom) }, [map, lat, lng, zoom])
  return null
}

/* ── componente principal ── */
export default function MapaPage() {
  const { role } = useUserRole()
  const isAdmin = role === 'admin' || role === 'superadmin'

  /* admin — heatmap */
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([])

  /* ciudadano — markers */
  const [reportes, setReportes] = useState<CitizenReporte[]>([])
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [selected, setSelected] = useState<CitizenReporte | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAdmin) {
      apiFetch(`${import.meta.env.VITE_API_URL}/api/reports/heatmap`)
        .then((r) => r.json())
        .then((d: unknown) => setHeatPoints(Array.isArray(d) ? (d as HeatPoint[]) : []))
        .catch(() => setHeatPoints([]))
        .finally(() => setLoading(false))
      return
    }

    /* ciudadano: pedir ubicación primero */
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setUserPos([lat, lng])
        apiFetch(`${import.meta.env.VITE_API_URL}/api/reports/mapa-ciudadano?lat=${lat}&lng=${lng}&radius=2000`)
          .then((r) => r.json())
          .then((d: unknown) => setReportes(Array.isArray(d) ? (d as CitizenReporte[]) : []))
          .catch(() => setReportes([]))
          .finally(() => setLoading(false))
      },
      () => {
        /* ubicación denegada — muestra todos */
        apiFetch(`${import.meta.env.VITE_API_URL}/api/reports/mapa-ciudadano`)
          .then((r) => r.json())
          .then((d: unknown) => setReportes(Array.isArray(d) ? (d as CitizenReporte[]) : []))
          .catch(() => setReportes([]))
          .finally(() => setLoading(false))
      },
      { timeout: 8000 }
    )
  }, [isAdmin])

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: MAP_HEIGHT }}>
        <p className="text-sm text-muted-foreground">Cargando mapa…</p>
      </div>
    )
  }

  const mapCenter = userPos ?? VILLA_MARIA
  const mapZoom = userPos ? 15 : 13

  return (
    <>
      <div className="relative isolate" style={{ height: MAP_HEIGHT }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {isAdmin ? (
            <HeatLayer points={heatPoints} />
          ) : (
            <>
              {userPos && (
                <Marker position={userPos} icon={userLocationIcon} />
              )}
              {reportes.map((r) => (
                <Marker
                  key={r._id}
                  position={[r.location.lat, r.location.lng]}
                  icon={markerIcon(r.category)}
                  eventHandlers={{ click: () => setSelected(r) }}
                />
              ))}
              {userPos && (
                <MapCenterSetter lat={userPos[0]} lng={userPos[1]} zoom={15} />
              )}
            </>
          )}
        </MapContainer>

        {/* Leyenda admin — overlay esquina inferior izquierda */}
        {isAdmin && (
          <div className="absolute bottom-6 left-4 z-[1000] rounded-xl border border-border bg-background/90 p-3 shadow-lg backdrop-blur-sm">
            <p className="mb-2 text-xs font-semibold text-foreground">Intensidad</p>
            <div className="flex flex-col gap-1.5">
              {[
                { color: 'bg-blue-400',   label: 'Baja' },
                { color: 'bg-yellow-400', label: 'Moderada' },
                { color: 'bg-orange-500', label: 'Alta' },
                { color: 'bg-red-600',    label: 'Crítica' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={cn('size-2.5 shrink-0 rounded-full', color)} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leyenda ciudadano — overlay esquina inferior izquierda */}
        {!isAdmin && (
          <div className="absolute bottom-6 left-4 z-[1000] rounded-xl border border-border bg-background/90 p-3 shadow-lg backdrop-blur-sm">
            <p className="mb-2 text-xs font-semibold text-foreground">Categorías</p>
            <div className="flex flex-col gap-1.5">
              {Object.entries(CATEGORY_COLOR).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full border-2 border-white shadow-sm" style={{ background: color }} />
                  <span className="text-xs text-muted-foreground">{cat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info ciudadano — overlay esquina superior derecha */}
        {!isAdmin && (
          <div className="absolute right-4 top-4 z-[1000] max-w-[200px] rounded-xl border border-border bg-background/90 px-3 py-2 shadow-lg backdrop-blur-sm">
            <p className="text-xs text-muted-foreground">
              {userPos
                ? `${reportes.length} reporte${reportes.length !== 1 ? 's' : ''} activo${reportes.length !== 1 ? 's' : ''} cerca tuyo`
                : `${reportes.length} reporte${reportes.length !== 1 ? 's' : ''} activo${reportes.length !== 1 ? 's' : ''} en la ciudad`}
            </p>
          </div>
        )}
      </div>

      {/* Modal reporte ciudadano */}
      {selected && createPortal(
        <>
          <div
            className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-[2px]"
            onClick={() => setSelected(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-[2001] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background shadow-2xl">
            {selected.imageUrls.length > 0 && (
              <img
                src={selected.imageUrls[0]}
                alt="Foto del reporte"
                className="w-full rounded-t-2xl object-cover"
                style={{ maxHeight: 180 }}
              />
            )}
            <div className="p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground leading-snug">{selected.title}</h2>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {selected.category}
                </span>
                <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', STATUS_STYLE[selected.status])}>
                  {STATUS_LABEL[selected.status]}
                </span>
              </div>

              {selected.description && (
                <p className="mb-3 text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
              )}

              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                {selected.location.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0" />
                    <span>{selected.location.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 shrink-0" />
                  <span>
                    {new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(selected.createdAt))}
                  </span>
                </div>
                {selected.adhesiones > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3.5 shrink-0" />
                    <span>{selected.adhesiones} {selected.adhesiones === 1 ? 'persona se sumó' : 'personas se sumaron'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
