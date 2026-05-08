import { useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CATEGORIAS } from '@/context/ReportesContext'
import { cn } from '@/lib/utils'

export type ReporteFormValues = {
  titulo: string
  categoria: string
  ubicacion: string
  descripcion: string
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
  ubicacion: '',
  descripcion: '',
}

export function ReporteForm({
  initialValues,
  submitLabel,
  submitIcon,
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] = useState<ReporteFormValues>({
    ...empty,
    ...initialValues,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ReporteFormValues, string>>>({})

  function setField<K extends keyof ReporteFormValues>(
    key: K,
    value: ReporteFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const next: typeof errors = {}
    if (values.titulo.trim().length < 3) {
      next.titulo = 'Ingresá un título de al menos 3 caracteres.'
    }
    if (!values.ubicacion.trim()) {
      next.ubicacion = 'Indicá la ubicación del incidente.'
    }
    if (values.descripcion.trim().length < 10) {
      next.descripcion = 'Contanos un poco más, al menos 10 caracteres.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      titulo: values.titulo.trim(),
      categoria: values.categoria,
      ubicacion: values.ubicacion.trim(),
      descripcion: values.descripcion.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <Field
        id="titulo"
        label="Título del reporte"
        hint="Resumí el problema en pocas palabras (ej: Bache en Av. Sabattini)."
        error={errors.titulo}
      >
        <Input
          id="titulo"
          value={values.titulo}
          onChange={(e) => setField('titulo', e.target.value)}
          placeholder="Bache en Av. Sabattini"
          aria-invalid={Boolean(errors.titulo)}
          autoComplete="off"
          className="h-12 text-base"
          maxLength={80}
        />
      </Field>

      <Field
        id="categoria"
        label="Categoría"
        hint="Elegí la categoría que mejor describe el problema."
      >
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((cat) => {
            const active = values.categoria === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setField('categoria', cat)}
                aria-pressed={active}
                className={cn(
                  'h-11 rounded-full border px-4 text-sm font-semibold transition-colors outline-none',
                  'focus-visible:ring-3 focus-visible:ring-ring/50',
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-background text-foreground/80 hover:bg-muted'
                )}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </Field>

      <Field
        id="ubicacion"
        label="Ubicación"
        hint="Calle, altura, esquina o referencia."
        error={errors.ubicacion}
      >
        <Input
          id="ubicacion"
          value={values.ubicacion}
          onChange={(e) => setField('ubicacion', e.target.value)}
          placeholder="Ej: Av. Sabattini 1200"
          aria-invalid={Boolean(errors.ubicacion)}
          autoComplete="off"
          className="h-12 text-base"
          maxLength={120}
        />
      </Field>

      <Field
        id="descripcion"
        label="Descripción"
        hint="Contanos qué viste, cuándo, y cualquier detalle que ayude."
        error={errors.descripcion}
      >
        <Textarea
          id="descripcion"
          value={values.descripcion}
          onChange={(e) => setField('descripcion', e.target.value)}
          placeholder="Describí el incidente con tus palabras"
          aria-invalid={Boolean(errors.descripcion)}
          className="min-h-32 text-base"
          maxLength={1000}
        />
      </Field>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onCancel}
          className="h-12 rounded-xl px-5 text-base font-semibold"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="lg"
          className="h-12 rounded-xl bg-brand px-5 text-base font-semibold text-brand-foreground shadow-sm hover:bg-[oklch(0.62_0.14_60)]"
        >
          {submitIcon}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-base font-semibold text-foreground">
        {label}
      </Label>
      {children}
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
