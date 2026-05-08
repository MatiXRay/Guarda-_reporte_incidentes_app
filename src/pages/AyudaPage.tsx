import { Phone, HelpCircle, MessageCircle, BookOpen } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const faqs = [
  {
    q: '¿Quién puede ver mis reportes?',
    a: 'Tus reportes se envían al equipo municipal. Los datos personales no se publican; solo el problema reportado y su ubicación.',
  },
  {
    q: '¿Puedo modificar un reporte después de enviarlo?',
    a: 'Sí, mientras siga en estado "Pendiente". Una vez que pasa a "En revisión" queda fijo para que el equipo trabaje sobre la información que enviaste.',
  },
  {
    q: '¿Cuánto tarda en resolverse un reporte?',
    a: 'Depende del tipo de problema y la urgencia. Vas a ver actualizaciones en el listado de "Mis Reportes".',
  },
] as const

const contactos = [
  {
    icon: Phone,
    title: 'Línea 147',
    description: 'Atención al vecino las 24 horas',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp municipal',
    description: 'Lunes a viernes de 8 a 20 hs',
  },
  {
    icon: BookOpen,
    title: 'Guías de uso',
    description: 'Aprendé a aprovechar todas las funciones',
  },
] as const

export default function AyudaPage() {
  return (
    <div className="animate-fade-up mx-auto max-w-3xl">
      <header className="mb-6">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          Ayuda
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          ¿En qué te podemos ayudar?
        </h1>
        <p className="mt-2 max-w-xl text-base text-muted-foreground">
          Resolvé tus dudas más comunes o contactá al equipo de soporte.
        </p>
      </header>

      <section aria-labelledby="contacto-title">
        <h2
          id="contacto-title"
          className="mb-3 font-heading text-xl font-semibold"
        >
          Contacto rápido
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contactos.map((c) => {
            const Icon = c.icon
            return (
              <Card
                key={c.title}
                className="border-0 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/20"
              >
                <CardHeader>
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <CardTitle className="font-heading text-lg font-semibold">
                    {c.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {c.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="faq-title">
        <h2 id="faq-title" className="mb-3 font-heading text-xl font-semibold">
          Preguntas frecuentes
        </h2>
        <Card className="border-0 ring-1 ring-border">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {faqs.map((faq) => (
                <li key={faq.q} className="px-6 py-5">
                  <p className="flex items-start gap-3 text-base font-semibold text-foreground">
                    <HelpCircle
                      className="mt-0.5 size-5 shrink-0 text-primary"
                      aria-hidden
                    />
                    {faq.q}
                  </p>
                  <p className="mt-2 pl-8 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
