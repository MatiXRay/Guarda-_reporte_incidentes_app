import { Phone, HelpCircle, MessageCircle, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const faqs = [
  {
    q: '¿Quién puede ver mis reportes?',
    a: 'Tus reportes se envían al equipo municipal. Los datos personales no se publican; solo el problema reportado y su ubicación.',
  },
  {
    q: '¿Puedo modificar un reporte después de enviarlo?',
    a: 'Sí, mientras siga en estado "Pendiente". Una vez que pasa a "En revisión" queda fijo.',
  },
  {
    q: '¿Cuánto tarda en resolverse un reporte?',
    a: 'Depende del tipo de problema y la urgencia. Vas a ver actualizaciones en "Mis Reportes".',
  },
] as const

const contactos = [
  { icon: Phone, title: 'Línea 147', description: 'Atención al vecino las 24 horas' },
  { icon: MessageCircle, title: 'WhatsApp municipal', description: 'Lunes a viernes de 8 a 20 hs' },
  { icon: BookOpen, title: 'Guías de uso', description: 'Aprendé a aprovechar todas las funciones' },
] as const

export default function AyudaPage() {
  return (
    <div className="animate-fade-up mx-auto max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">Ayuda</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Resolvé tus dudas o contactá al equipo de soporte.</p>
      </div>

      <section aria-labelledby="contacto-title">
        <h2 id="contacto-title" className="mb-2 text-sm font-semibold text-foreground">Contacto rápido</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {contactos.map((c) => {
            const Icon = c.icon
            return (
              <Card key={c.title} className="border border-border shadow-none transition-colors hover:bg-muted/40">
                <CardHeader className="gap-2 p-4">
                  <Icon className="size-5 text-primary" aria-hidden />
                  <CardTitle className="text-sm font-semibold">{c.title}</CardTitle>
                  <CardDescription className="text-sm">{c.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="faq-title">
        <h2 id="faq-title" className="mb-2 text-sm font-semibold text-foreground">Preguntas frecuentes</h2>
        <Card className="border border-border shadow-none">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {faqs.map((faq) => (
                <li key={faq.q} className="px-4 py-4">
                  <p className="flex items-start gap-2 text-sm font-semibold text-foreground">
                    <HelpCircle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {faq.q}
                  </p>
                  <p className="mt-1.5 pl-6 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
