import { SignUp } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── Branding panel ── */}
      <div className="relative flex flex-col justify-center items-center md:items-start gap-6 px-10 py-12 md:py-0 md:w-[45%] bg-[oklch(0.32_0.18_255)] overflow-hidden">
        {/* Decorative city-grid backdrop */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(oklch(1_0_0/1) 1px, transparent 1px), linear-gradient(90deg, oklch(1_0_0/1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Decorative blurred blobs */}
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[oklch(0.55_0.22_260)] blur-[80px] opacity-40"
        />
        <div
          aria-hidden="true"
          className="absolute -top-16 right-0 w-56 h-56 rounded-full bg-[oklch(0.45_0.2_240)] blur-[70px] opacity-30"
        />

        {/* Community illustration placeholder */}
        <div
          aria-hidden="true"
          className="relative z-10 w-full max-w-[280px] aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-2xl hidden md:block"
        >
          <div className="absolute inset-0 bg-[oklch(0.28_0.16_255)]" />
          {/* Horizontal streets */}
          {[20, 38, 56, 74].map((pct) => (
            <div
              key={pct}
              className="absolute left-0 right-0 h-[2px] bg-white/10"
              style={{ top: `${pct}%` }}
            />
          ))}
          {/* Vertical streets */}
          {[15, 35, 55, 75].map((pct) => (
            <div
              key={pct}
              className="absolute top-0 bottom-0 w-[2px] bg-white/10"
              style={{ left: `${pct}%` }}
            />
          ))}
          {/* Cluster of pins representing community */}
          {[
            { top: '22%', left: '28%', size: 'w-3 h-3', color: 'bg-[oklch(0.72_0.22_30)]' },
            { top: '55%', left: '62%', size: 'w-2.5 h-2.5', color: 'bg-[oklch(0.72_0.22_30)]' },
            { top: '42%', left: '18%', size: 'w-2 h-2', color: 'bg-[oklch(0.8_0.18_60)]' },
            { top: '65%', left: '40%', size: 'w-2 h-2', color: 'bg-[oklch(0.75_0.2_50)]' },
            { top: '30%', left: '70%', size: 'w-2.5 h-2.5', color: 'bg-[oklch(0.72_0.22_30)]' },
          ].map(({ top, left, size, color }, i) => (
            <div
              key={i}
              className={`absolute rounded-full ring-2 ring-white/40 ${size} ${color}`}
              style={{ top, left }}
            />
          ))}
        </div>

        {/* App identity */}
        <div className="relative z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7 text-[oklch(0.85_0.2_60)]"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-3xl font-bold tracking-tight text-white">
              Guarda!
            </span>
          </div>
          <p className="text-base text-white/70 font-normal max-w-[22ch]">
            Sumate a la comunidad y ayudá a mejorar tu ciudad.
          </p>
        </div>

        {/* Benefits list — desktop only */}
        <ul className="relative z-10 hidden md:flex flex-col gap-3 mt-2">
          {[
            'Reportá incidentes en segundos',
            'Seguí el estado de tus reportes',
            'Conectate con tu comunidad',
          ].map((benefit) => (
            <li key={benefit} className="flex items-center gap-2.5 text-sm text-white/80">
              <span
                aria-hidden="true"
                className="flex-shrink-0 w-4 h-4 rounded-full bg-[oklch(0.75_0.2_50)] flex items-center justify-center"
              >
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-2.5 h-2.5"
                >
                  <polyline points="2 6 5 9 10 3" />
                </svg>
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Auth panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-10 md:py-0 bg-background">
        <Card className="w-full max-w-[420px] border-0 shadow-none bg-transparent ring-0">
          <CardContent className="px-0 flex flex-col items-center gap-6">
            {/* Header text above Clerk widget */}
            <div className="w-full text-center mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Creá tu cuenta
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Registrate gratis y comenzá a reportar incidentes
              </p>
            </div>

            {/* Clerk embedded sign-up */}
            <SignUp
              routing="path"
              path="/sign-up"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border-0 p-0 w-full',
                },
              }}
            />

            {/* Toggle link */}
            <p className="text-sm text-muted-foreground text-center">
              ¿Ya tenés cuenta?{' '}
              <Link
                to="/sign-in"
                className="text-[oklch(0.45_0.18_255)] font-medium hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(0.45_0.18_255)]"
              >
                Iniciá sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
