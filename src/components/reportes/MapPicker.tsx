import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LocateFixed, Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

export type PickedLocation = {
  lat: number
  lng: number
  address: string
}

type Props = {
  value: PickedLocation | null
  onChange: (loc: PickedLocation) => void
}

// Villa María, Córdoba, Argentina
const DEFAULT_CENTER: [number, number] = [-32.4073, -63.2387]
const DEFAULT_ZOOM = 14

// Bounding box covering Villa María and Villa Nueva
const MAP_BOUNDS: [[number, number], [number, number]] = [
  [-32.52, -63.40],
  [-32.30, -63.10],
]

// Nominatim viewbox (lon_min,lat_min,lon_max,lat_max)
const NOMINATIM_VIEWBOX = '-63.40,-32.52,-63.10,-32.30'

type NominatimAddress = {
  road?: string
  pedestrian?: string
  path?: string
  house_number?: string
  city?: string
  town?: string
  village?: string
  municipality?: string
  [key: string]: string | undefined
}

function formatNominatimAddress(addr: NominatimAddress): string {
  const road = addr.road ?? addr.pedestrian ?? addr.path ?? ''
  const number = addr.house_number ?? ''
  const city = addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? ''
  return [road, number, city].filter(Boolean).join(', ')
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
    const data = await res.json()
    if (data.address) {
      const formatted = formatNominatimAddress(data.address)
      if (formatted) return formatted
    }
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}

async function geocodeAddress(
  query: string
): Promise<{ lat: number; lng: number; display_name: string } | null> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: `${query}, Villa María, Córdoba, Argentina`,
    viewbox: NOMINATIM_VIEWBOX,
    bounded: '0',
    limit: '1',
    countrycodes: 'ar',
    'accept-language': 'es',
    addressdetails: '1',
  })
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)
    const data = await res.json()
    if (!data.length) return null
    const addr = data[0].address as NominatimAddress | undefined
    const formatted = addr ? formatNominatimAddress(addr) : ''
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      display_name: formatted || (data[0].display_name as string),
    }
  } catch {
    return null
  }
}

function FlyTo({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 16, { duration: 1 })
    }
  }, [map, target])
  return null
}

function ClickHandler({ onChange }: { onChange: (loc: PickedLocation) => void }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng
      const address = await reverseGeocode(lat, lng)
      onChange({ lat, lng, address })
    },
  })
  return null
}

export function MapPicker({ value, onChange }: Props) {
  const center: [number, number] = value ? [value.lat, value.lng] : DEFAULT_CENTER
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null)

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true)
    setSearchError(null)
    const result = await geocodeAddress(query.trim())
    setSearching(false)
    if (!result) {
      setSearchError('No se encontró la dirección. Intentá con más detalle.')
      return
    }
    setFlyTarget({ lat: result.lat, lng: result.lng })
    onChange({ lat: result.lat, lng: result.lng, address: result.display_name })
  }

  function handleLocateMe() {
    if (!window.isSecureContext) {
      setSearchError('Esta función requiere conexión segura (HTTPS). Buscá la dirección manualmente.')
      return
    }
    if (!navigator.geolocation) {
      setSearchError('Tu dispositivo no soporta geolocalización.')
      return
    }
    setLocating(true)
    setSearchError(null)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords
        const address = await reverseGeocode(lat, lng)
        setFlyTarget({ lat, lng })
        onChange({ lat, lng, address })
        setLocating(false)
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'Permiso denegado. Habilitá la ubicación en la configuración del navegador.'
            : err.code === err.TIMEOUT
            ? 'La solicitud tardó demasiado. Intentá de nuevo.'
            : 'No se pudo obtener tu ubicación.'
        setSearchError(msg)
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar dirección en Villa María…"
            className="h-10 pl-8 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="flex h-10 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {searching ? <Loader2 className="size-3.5 animate-spin" /> : 'Buscar'}
        </button>
      </div>

      {/* Botón de ubicación actual */}
      <button
        type="button"
        onClick={handleLocateMe}
        disabled={locating}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/8 text-sm font-medium text-primary transition-colors hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {locating
          ? <><Loader2 className="size-4 animate-spin" aria-hidden /> Obteniendo ubicación…</>
          : <><LocateFixed className="size-4" aria-hidden /> Usar mi ubicación actual</>
        }
      </button>

      {searchError && <p className="text-sm text-destructive">{searchError}</p>}

      <div className="overflow-hidden rounded-xl border border-border">
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          style={{ height: '280px', width: '100%' }}
          scrollWheelZoom={false}
          maxBounds={MAP_BOUNDS}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyTo target={flyTarget} />
          <ClickHandler onChange={onChange} />
          {value && <Marker position={[value.lat, value.lng]} />}
        </MapContainer>
      </div>
    </div>
  )
}
