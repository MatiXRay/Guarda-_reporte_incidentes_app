import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MapboxMap, { Source, Layer } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { LayerProps, MapRef } from 'react-map-gl/mapbox'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIconPng from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { CalendarDays, MapPin, Users, X } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useUserRole } from '@/context/UserRoleContext'
import { useTheme } from '@/hooks/useTheme'
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
  aiAnalysis?: { etiquetas2: string[] }
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
const IMPACT_COLOR = {
  circulacion: '#f97316',
  seguridad:   '#ef4444',
  ambos:       '#a855f7',
}

function resolveImpactColor(etiquetas2: string[] = []): string {
  const circ = etiquetas2.includes('impacto_circulacion')
  const seg  = etiquetas2.includes('impacto_seguridad')
  if (circ && seg) return IMPACT_COLOR.ambos
  if (seg)         return IMPACT_COLOR.seguridad
  return IMPACT_COLOR.circulacion
}

function markerIcon(etiquetas2: string[] = []) {
  const color = resolveImpactColor(etiquetas2)
  return L.divIcon({
    className: '',
    html: `<div style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4)) drop-shadow(0 0 8px ${color}99)">
      <svg width="26" height="36" viewBox="0 0 26 36" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 23 13 23S26 22.75 26 13C26 5.82 20.18 0 13 0z" fill="${color}"/>
        <circle cx="13" cy="13" r="5" fill="white" fill-opacity="0.95"/>
      </svg>
    </div>`,
    iconSize: [26, 36],
    iconAnchor: [13, 36],
  })
}

const userLocationIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,0.25)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

/* ── control de zoom (compartido, estilos de la app) ── */
function ZoomButtons({ onZoomIn, onZoomOut }: { onZoomIn: () => void; onZoomOut: () => void }) {
  return (
    <div
      style={{ position: 'absolute', bottom: 24, right: 16, zIndex: 1000 }}
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-background/90 shadow-lg backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onZoomIn}
        aria-label="Acercar"
        className="flex size-10 items-center justify-center border-b border-border text-xl font-semibold text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
      >
        +
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        aria-label="Alejar"
        className="flex size-10 items-center justify-center text-xl font-semibold text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
      >
        −
      </button>
    </div>
  )
}

/* ── zoom para Leaflet (debe vivir dentro de MapContainer) ── */
function LeafletZoomControls() {
  const map = useMap()
  return <ZoomButtons onZoomIn={() => map.zoomIn()} onZoomOut={() => map.zoomOut()} />
}

/* ── mapa de calor admin (Mapbox GL) ── */
function AdminHeatMap({ points }: { points: HeatPoint[] }) {
  const { theme } = useTheme()
  const mapRef = useRef<MapRef>(null)
  const mapStyle = theme === 'dark'
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/light-v11'

  const maxScore = Math.max(...points.map((p) => p.score), 1)

  const geojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: { weight: p.score / maxScore },
    })),
  }

  const heatmapLayer: LayerProps = {
    id: 'heatmap-layer',
    type: 'heatmap',
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 1, 1],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 17, 4],
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0,   'rgba(0,0,0,0)',
        0.2, '#2563eb',
        0.4, '#fbbf24',
        0.6, '#f97316',
        0.8, '#dc2626',
        1,   '#7f1d1d',
      ],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 4, 13, 30, 17, 55],
      'heatmap-opacity': 0.85,
    },
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapboxMap
        ref={mapRef}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        initialViewState={{ longitude: VILLA_MARIA[1], latitude: VILLA_MARIA[0], zoom: 13 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
      >
        <Source id="heatmap-source" type="geojson" data={geojson}>
          <Layer {...heatmapLayer} />
        </Source>
      </MapboxMap>
      <ZoomButtons
        onZoomIn={() => mapRef.current?.zoomIn()}
        onZoomOut={() => mapRef.current?.zoomOut()}
      />
    </div>
  )
}

/* ── mapa ciudadano (Leaflet) ── */
function MapCenterSetter({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], zoom) }, [map, lat, lng, zoom])
  return null
}

/* ── componente principal ── */
export default function MapaPage() {
  const { role } = useUserRole()
  const isAdmin = role === 'admin' || role === 'superadmin'

  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([])
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

        {isAdmin ? (
          /* ── mapa de calor Mapbox ── */
          <>
            <AdminHeatMap points={heatPoints} />
            <div className="absolute bottom-6 left-4 z-[1000] rounded-xl border border-border bg-background/90 p-3 shadow-lg backdrop-blur-sm">
              <p className="mb-2 text-xs font-semibold text-foreground">Intensidad</p>
              <div className="flex flex-col gap-1.5">
                {[
                  { color: 'bg-blue-500',   label: 'Baja' },
                  { color: 'bg-yellow-400', label: 'Moderada' },
                  { color: 'bg-orange-500', label: 'Alta' },
                  { color: 'bg-red-700',    label: 'Crítica' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={cn('size-2.5 shrink-0 rounded-full', color)} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* ── mapa ciudadano Leaflet ── */
          <>
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
              {userPos && <Marker position={userPos} icon={userLocationIcon} />}
              {reportes.map((r) => (
                <Marker
                  key={r._id}
                  position={[r.location.lat, r.location.lng]}
                  icon={markerIcon(r.aiAnalysis?.etiquetas2)}
                  eventHandlers={{ click: () => setSelected(r) }}
                />
              ))}
              {userPos && <MapCenterSetter lat={userPos[0]} lng={userPos[1]} zoom={15} />}
              <LeafletZoomControls />
            </MapContainer>

            <div className="absolute bottom-6 left-4 z-[1000] rounded-xl border border-border bg-background/90 p-3 shadow-lg backdrop-blur-sm">
              <p className="mb-2 text-xs font-semibold text-foreground">Tipo de impacto</p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full border-2 border-white shadow-sm" style={{ background: IMPACT_COLOR.circulacion }} />
                  <span className="text-xs text-muted-foreground">Circulación</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full border-2 border-white shadow-sm" style={{ background: IMPACT_COLOR.seguridad }} />
                  <span className="text-xs text-muted-foreground">Seguridad</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full border-2 border-white shadow-sm" style={{ background: IMPACT_COLOR.ambos }} />
                  <span className="text-xs text-muted-foreground">Ambos</span>
                </div>
              </div>
            </div>

            <div className="absolute right-4 top-4 z-[1000] max-w-[200px] rounded-xl border border-border bg-background/90 px-3 py-2 shadow-lg backdrop-blur-sm">
              <p className="text-xs text-muted-foreground">
                {userPos
                  ? `${reportes.length} reporte${reportes.length !== 1 ? 's' : ''} activo${reportes.length !== 1 ? 's' : ''} cerca tuyo`
                  : `${reportes.length} reporte${reportes.length !== 1 ? 's' : ''} activo${reportes.length !== 1 ? 's' : ''} en la ciudad`}
              </p>
            </div>
          </>
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
