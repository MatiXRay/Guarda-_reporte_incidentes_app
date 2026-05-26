import { useRef, useState, type ChangeEvent } from 'react'
import { ImagePlus, Video, X, Loader2, Film } from 'lucide-react'
import { cn } from '@/lib/utils'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string
const FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER as string

const MAX_IMAGES = 10
const MAX_VIDEO_DURATION_SEC = 60

type Props = {
  value: string[]
  onChange: (urls: string[]) => void
}

function isVideoUrl(url: string) {
  return url.includes('/video/upload/') || /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(url)
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    const objectUrl = URL.createObjectURL(file)
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(video.duration)
    }
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('No se pudo leer el video'))
    }
    video.src = objectUrl
  })
}

async function uploadToCloudinary(file: File): Promise<string> {
  const resourceType = file.type.startsWith('video/') ? 'video' : 'image'
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)
  form.append('folder', FOLDER)
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: 'POST', body: form }
  )
  if (!res.ok) throw new Error('Error al subir el archivo')
  const data = await res.json()
  return data.secure_url as string
}

export function ImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const imageCount = value.filter((u) => !isVideoUrl(u)).length
  const hasVideo = value.some(isVideoUrl)
  const canAddMore = imageCount < MAX_IMAGES || !hasVideo

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    setError(null)
    setUploading(true)

    const newUrls: string[] = []
    let localImageCount = imageCount
    let localHasVideo = hasVideo

    for (const file of files) {
      const isVideoFile = file.type.startsWith('video/')

      if (isVideoFile) {
        if (localHasVideo) {
          setError('Solo podés adjuntar 1 video por reporte.')
          continue
        }
        try {
          const duration = await getVideoDuration(file)
          if (duration > MAX_VIDEO_DURATION_SEC) {
            setError(`El video no puede superar ${MAX_VIDEO_DURATION_SEC} segundos de duración.`)
            continue
          }
        } catch {
          setError('No se pudo verificar la duración del video.')
          continue
        }
      } else {
        if (localImageCount >= MAX_IMAGES) {
          setError(`Podés adjuntar hasta ${MAX_IMAGES} imágenes.`)
          continue
        }
      }

      try {
        const url = await uploadToCloudinary(file)
        newUrls.push(url)
        if (isVideoFile) localHasVideo = true
        else localImageCount++
      } catch {
        setError('No se pudo subir un archivo. Intentá de nuevo.')
      }
    }

    if (newUrls.length) {
      onChange([...value, ...newUrls])
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleRemove(url: string) {
    onChange(value.filter((u) => u !== url))
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url) => {
            const video = isVideoUrl(url)
            return (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
              >
                {video ? (
                  <video src={url} className="h-full w-full object-cover" muted playsInline />
                ) : (
                  <img src={url} alt="" className="h-full w-full object-cover" />
                )}
                {video && (
                  <span className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white">
                    <Film className="size-2.5" aria-hidden />
                    Video
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  aria-label="Eliminar archivo"
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="size-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {canAddMore && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border',
            'text-muted-foreground transition-colors hover:border-primary hover:bg-muted/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            uploading && 'cursor-not-allowed opacity-60'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              <span className="text-xs">Subiendo…</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <ImagePlus className="size-5" aria-hidden />
                <span className="text-xs text-muted-foreground/60">/</span>
                <Video className="size-5" aria-hidden />
              </div>
              <span className="text-xs font-medium">Subir foto o video</span>
              <span className="text-xs text-muted-foreground/70">
                Hasta {MAX_IMAGES} imágenes · 1 video (máx. {MAX_VIDEO_DURATION_SEC}s)
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
