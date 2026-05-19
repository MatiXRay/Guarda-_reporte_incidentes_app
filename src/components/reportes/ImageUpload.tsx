import { useRef, useState, type ChangeEvent } from 'react'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string
const FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER as string

type Props = {
  value: string | null
  onChange: (url: string | null) => void
}

export function ImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    const form = new FormData()
    form.append('file', file)
    form.append('upload_preset', UPLOAD_PRESET)
    form.append('folder', FOLDER)

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: form }
      )
      if (!res.ok) throw new Error('Error al subir la imagen')
      const data = await res.json()
      onChange(data.secure_url as string)
    } catch {
      setError('No se pudo subir la imagen. Intentá de nuevo.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleRemove() {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="relative w-full overflow-hidden rounded-xl border border-border">
          <img
            src={value}
            alt="Imagen del reporte"
            className="max-h-64 w-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Eliminar imagen"
            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border',
            'text-muted-foreground transition-colors hover:border-primary hover:bg-muted/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            uploading && 'cursor-not-allowed opacity-60'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="size-6 animate-spin" />
              <span className="text-sm">Subiendo imagen…</span>
            </>
          ) : (
            <>
              <ImagePlus className="size-6" />
              <span className="text-sm font-medium">Subir foto del incidente</span>
              <span className="text-xs">JPG, PNG, WEBP · máx. 10 MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  )
}
