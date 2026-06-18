import React, { useState, type ReactNode } from 'react'
import {
  Car,
  CircleHelp,
  Construction,
  Leaf,
  Lightbulb,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CATEGORIAS } from '@/context/ReportesContext'
import { cn } from '@/lib/utils'
import { MapPicker, type PickedLocation } from './MapPicker'
import { ImageUpload } from './ImageUpload'

export type ReporteFormValues = {
  titulo: string
  categoria: string
  descripcion: string
  address: string
  lat: number | null
  lng: number | null
  mediaUrls: string[]
}

type Props = {
  initialValues?: Partial<ReporteFormValues>
  submitLabel: string
  submitIcon?: ReactNode
  onSubmit: (values: ReporteFormValues) => void
  onCancel: () => void
  disabled?: boolean
}

const CATEGORIA_ICON: Record<string, LucideIcon> = {
  'Calles':          Construction,
  'Alumbrado':       Lightbulb,
  'Higiene urbana':  Trash2,
  'Tránsito':        Car,
  'Espacios verdes': Leaf,
  'Otro':            CircleHelp,
}

const empty: ReporteFormValues = {
  titulo: '',
  categoria: CATEGORIAS[0],
  descripcion: '',
  address: '',
  lat: null,
  lng: null,
  mediaUrls: [],
}

export function ReporteForm({ initialValues, submitLabel, submitIcon, onSubmit, onCancel, disabled }: Props) {
  const [values, setValues] = useState<ReporteFormValues>({ ...empty, ...initialValues })
  const [errors, setErrors] = useState<Partial<Record<keyof ReporteFormValues, string>>>({})

  function setField<K extends keyof ReporteFormValues>(key: K, value: ReporteFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function handleLocationPick(loc: PickedLocation) {
    setValues((prev) => ({ ...prev, lat: loc.lat, lng: loc.lng, address: loc.address }))
    if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }))
  }

  function validate(): boolean {
    const next: typeof errors = {}
    if (values.titulo.trim().length < 3) next.titulo = 'Al menos 3 caracteres.'
    if (!values.lat || !values.lng) next.address = 'Hacé clic en el mapa para marcar la ubicación.'
    if (values.descripcion.trim().length < 10) next.descripcion = 'Al menos 10 caracteres.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      titulo: values.titulo.trim(),
      categoria: values.categoria,
      descripcion: values.descripcion.trim(),
      address: values.address,
      lat: values.lat,
      lng: values.lng,
      mediaUrls: values.mediaUrls,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

      {/* Título */}
      <Field id="titulo" label="Título" error={errors.titulo}>
        <Input
          id="titulo"
          value={values.titulo}
          onChange={(e) => setField('titulo', e.target.value)}
          placeholder="Bache en Av. Sabattini"
          aria-invalid={Boolean(errors.titulo)}
          autoComplete="off"
          className="h-12 rounded-xl text-base"
          maxLength={80}
        />
      </Field>

      {/* Categoría */}
      <Field id="categoria" label="Categoría">
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIAS.map((cat) => {
            const active = values.categoria === cat
            const Icon = CATEGORIA_ICON[cat] ?? CircleHelp
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setField('categoria', cat)}
                aria-pressed={active}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-3 text-center transition-colors outline-none',
                  'focus-visible:ring-2 focus-visible:ring-ring/50',
                  active
                    ? 'border-primary bg-primary/8 text-primary'
                    : 'border-border bg-background text-foreground/60 hover:border-primary/40 hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="size-6 shrink-0" aria-hidden />
                <span className="text-xs font-medium leading-tight">{cat}</span>
              </button>
            )
          })}
        </div>
      </Field>

      {/* Ubicación */}
      <Field id="address" label="Ubicación" hint="Hacé clic en el mapa para marcar el lugar." error={errors.address}>
        <MapPicker
          value={values.lat !== null && values.lng !== null ? { lat: values.lat, lng: values.lng, address: values.address } : null}
          onChange={handleLocationPick}
        />
        {values.address && (
          <p className="mt-1.5 truncate text-sm text-muted-foreground">📍 {values.address}</p>
        )}
      </Field>

      {/* Descripción */}
      <Field id="descripcion" label="Descripción" hint="Contanos qué viste y cuándo." error={errors.descripcion}>
        <Textarea
          id="descripcion"
          value={values.descripcion}
          onChange={(e) => setField('descripcion', e.target.value)}
          placeholder="Describí el incidente con tus palabras"
          aria-invalid={Boolean(errors.descripcion)}
          className="min-h-[120px] rounded-xl text-base"
          maxLength={1000}
        />
      </Field>

      {/* Multimedia */}
      <Field id="mediaUrls" label="Fotos o video del incidente">
        <ImageUpload value={values.mediaUrls} onChange={(urls) => setField('mediaUrls', urls)} />
      </Field>

      <div className="flex gap-3 border-t border-border pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-12 flex-1 rounded-xl text-base"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={disabled}
          className="h-12 flex-1 rounded-xl text-base font-semibold bg-brand text-brand-foreground hover:bg-[oklch(0.62_0.14_60)]"
        >
          {submitIcon}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function Field({
  id, label, hint, error, children,
}: {
  id: string; label: string; hint?: string; error?: string; children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-base font-medium text-foreground">{label}</Label>
      {children}
      {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}
