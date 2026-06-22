import { ShieldAlert } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
        <ShieldAlert className="size-7" aria-hidden />
      </div>
      <p className="mt-4 font-heading text-xl font-semibold tracking-tight text-foreground">
        Guarda<span className="text-[oklch(0.68_0.13_60)]">!</span>
      </p>
      <div className="mt-6 size-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  )
}

export function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-background px-6">
      <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
        <ShieldAlert className="size-7" aria-hidden />
      </div>
      <div className="text-center">
        <p className="font-heading text-xl font-semibold text-foreground">Sin conexión</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No se pudo conectar con el servidor.<br />Verificá tu conexión e intentá de nuevo.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
      >
        Reintentar
      </button>
    </div>
  )
}
