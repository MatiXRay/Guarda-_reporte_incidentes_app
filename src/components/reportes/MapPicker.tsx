import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix leaflet default marker icons with vite
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

// Default center: Córdoba, Argentina
const DEFAULT_CENTER: [number, number] = [-31.4135, -64.1811]
const DEFAULT_ZOOM = 13

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
    const data = await res.json()
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
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

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        style={{ height: '280px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        {value && <Marker position={[value.lat, value.lng]} />}
      </MapContainer>
    </div>
  )
}
