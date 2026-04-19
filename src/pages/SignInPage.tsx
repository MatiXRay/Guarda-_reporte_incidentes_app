import { SignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'

export default function SignInPage() {
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

        {/* Decorative blurred blob */}
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[oklch(0.55_0.22_260)] blur-[80px] opacity-40"
        />
        <div
          aria-hidden="true"
          className="absolute -top-16 right-0 w-56 h-56 rounded-full bg-[oklch(0.45_0.2_240)] blur-[70px] opacity-30"
        />

        {/* Map / city illustration placeholder */}
        <div
          aria-hidden="true"
          className="relative z-10 w-full max-w-[280px] aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-2xl hidden md:block"
        >
          {/* Stylised street-grid illustration */}
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
          {/* Location pin */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[oklch(0.75_0.2_50)] flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
              <div className="w-0.5 h-4 bg-[oklch(0.75_0.2_50)]" />
            </div>
          </div>
          {/* Incident dots */}
          <div className="absolute top-[22%] left-[28%] w-2.5 h-2.5 rounded-full bg-[oklch(0.72_0.22_30)] ring-2 ring-white/40" />
          <div className="absolute top-[60%] left-[65%] w-2 h-2 rounded-full bg-[oklch(0.72_0.22_30)] ring-2 ring-white/40" />
          <div className="absolute top-[45%] left-[18%] w-2 h-2 rounded-full bg-[oklch(0.8_0.18_60)] ring-2 ring-white/40" />
        </div>

        {/* App identity */}
        <div className="relative z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
            {/* Shield icon SVG inline — no extra dep */}
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
            Reportá incidentes en tu ciudad de manera rápida y segura.
          </p>
        </div>

        {/* Stats strip — desktop only */}
        <div className="relative z-10 hidden md:flex gap-6 mt-2">
          {[
            { value: '10K+', label: 'Reportes' },
            { value: '50+', label: 'Ciudades' },
            { value: '24/7', label: 'Activo' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-start">
              <span className="text-xl font-bold text-white">{value}</span>
              <span className="text-xs text-white/50 uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Auth panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-10 md:py-0 bg-background">
        <Card className="w-full max-w-[420px] border-0 shadow-none bg-transparent ring-0">
          <CardContent className="px-0 flex flex-col items-center gap-6">
            {/* Header text above Clerk widget */}
            <div className="w-full text-center mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Iniciá sesión
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Accedé a tu cuenta para gestionar tus reportes
              </p>
            </div>

            {/* Clerk embedded sign-in */}
            <SignIn
              routing="path"
              path="/sign-in"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border-0 p-0 w-full',
                  // Let Clerk render naturally inside our card
                },
              }}
            />

            {/* Toggle link */}
            <p className="text-sm text-muted-foreground text-center">
              ¿No tenés cuenta?{' '}
              <Link
                to="/sign-up"
                className="text-[oklch(0.45_0.18_255)] font-medium hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(0.45_0.18_255)]"
              >
                Registrate
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
