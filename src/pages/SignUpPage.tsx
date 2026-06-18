import { SignUp } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

const CHECK_ICON = (
  <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
    <polyline points="2 6 5 9 10 3" />
  </svg>
)

const BENEFITS = [
  'Reportá incidentes en segundos',
  'Seguí el estado de tus reportes',
  'Conectate con tu comunidad',
]

export default function SignUpPage() {
  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row">

      {/* ── Imagen + branding ── */}
      <div
        className="relative flex flex-col justify-center items-center md:items-start gap-5 px-8 md:px-10 shrink-0 h-[26vh] md:h-full md:w-[45%] overflow-hidden"
        style={{
          backgroundImage: 'url(/images/villa-maria-2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/55 to-black/40" />

        <div className="relative z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="w-8 h-8 text-[oklch(0.85_0.2_60)]">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-3xl font-bold tracking-tight text-white">Guarda!</span>
          </div>
          <p className="text-sm text-white/70 max-w-[22ch]">
            Sumate a la comunidad y ayudá a mejorar tu ciudad.
          </p>
        </div>

        <ul className="relative z-10 hidden md:flex flex-col gap-3">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-2.5 text-sm text-white/80">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[oklch(0.75_0.2_50)] flex items-center justify-center">
                {CHECK_ICON}
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Formulario ── */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col py-6 md:justify-center md:py-0 bg-background">
        <div className="w-full max-w-sm mx-auto md:max-w-md">

          <h1 className="text-xl font-bold tracking-tight text-foreground mb-4 px-6 md:px-8 md:text-2xl md:mb-6">
            Creá tu cuenta
          </h1>

          <SignUp
            routing="path"
            path="/sign-up"
            appearance={{
              variables: {
                fontSize: '16px',
                spacingUnit: '13px',
                borderRadius: '10px',
              },
              elements: {
                rootBox: 'w-full',
                cardBox: '!shadow-none !border-0 !bg-transparent w-full',
                card: '!shadow-none !border-0 !bg-transparent w-full',
                header: '!hidden',
                footer: '!hidden',
                formFieldLabel: '!hidden',
                formButtonPrimary: '!h-14 !text-base !font-semibold !rounded-xl',
                formFieldInput: '!h-14 !text-base !rounded-xl',
                socialButtonsBlockButton: '!rounded-xl !h-14 !text-base',
                dividerRow: 'my-1',
              },
            }}
          />

          <p className="mt-2 text-base text-muted-foreground text-center px-6 md:px-8">
            ¿Ya tenés cuenta?{' '}
            <Link
              to="/sign-in"
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}
