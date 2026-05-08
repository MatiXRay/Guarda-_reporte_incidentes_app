import type { EstadoReporte } from '@/context/ReportesContext'

export const estadoBadgeStyles: Record<EstadoReporte, string> = {
  Pendiente:
    'bg-[oklch(0.96_0.06_75)] text-[oklch(0.42_0.13_60)] ring-1 ring-[oklch(0.85_0.1_70)]',
  'En revisión': 'bg-primary/10 text-primary ring-1 ring-primary/20',
  Resuelto:
    'bg-[oklch(0.95_0.06_155)] text-[oklch(0.4_0.12_155)] ring-1 ring-[oklch(0.82_0.1_155)]',
}
