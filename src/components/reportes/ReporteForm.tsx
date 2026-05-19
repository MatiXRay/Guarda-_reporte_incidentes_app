import { useState, type FormEvent, type ReactNode } from 'react'
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
  imageUrl: string | null
}

type Props = {
  initialValues?: Partial<ReporteFormValues>
  submitLabel: string
  submitIcon?: ReactNode
  onSubmit: (values: ReporteFormValues) => void
  onCancel: () => void
}

const empty: ReporteFormValues = {
  titulo: '',
  categoria: CATEGORIAS[0],
  descripcion: '',
  address: '',
  lat: null,
  lng: null,
  imageUrl: null,
}

export function ReporteForm({ initialValues, submitLabel, submitIcon, onSubmit, onCancel }: Props) {
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      titulo: values.titulo.trim(),
      categoria: values.categoria,
      descripcion: values.descripcion.trim(),
      address: values.address,
      lat: values.lat,
      lng: values.lng,
      imageUrl: values.imageUrl,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Título */}
      <Field id="titulo" label="Título" error={errors.titulo}>
        <Input
          id="titulo"
          value={values.titulo}
          onChange={(e) => setField('titulo', e.target.value)}
          placeholder="Bache en Av. Sabattini"
          aria-invalid={Boolean(errors.titulo)}
          autoComplete="off"
          className="h-9 text-sm"
          maxLength={80}
        />
      </Field>

      {/* Categoría */}
      <Field id="categoria" label="Categoría">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIAS.map((cat) => {
            const active = values.categoria === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setField('categoria', cat)}
                aria-pressed={active}
                className={cn(
                  'h-7 rounded-full border px-3 text-xs font-medium transition-colors outline-none',
                  'focus-visible:ring-2 focus-visible:ring-ring/50',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground/70 hover:bg-muted hover:text-foreground'
                )}
              >
                {cat}
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
          <p className="mt-1 truncate text-xs text-muted-foreground">📍 {values.address}</p>
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
          className="min-h-24 text-sm"
          maxLength={1000}
        />
      </Field>

      {/* Imagen */}
      <Field id="imageUrl" label="Foto del incidente" hint="Opcional.">
        <ImageUpload value={values.imageUrl} onChange={(url) => setField('imageUrl', url)} />
      </Field>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" className="bg-brand text-brand-foreground hover:bg-[oklch(0.62_0.14_60)]">
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
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
