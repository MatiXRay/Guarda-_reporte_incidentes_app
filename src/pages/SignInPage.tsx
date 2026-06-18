import { SignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { GuardaLogo } from '@/components/guardaLogo'

export default function SignInPage() {
  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row">

      {/* ── Imagen + logo ── */}
      <div
        className="relative flex items-center justify-center shrink-0 h-[38vh] md:h-full md:w-[45%] overflow-hidden"
        style={{
          backgroundImage: 'url(/images/villa-maria-1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div aria-hidden="true" className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 w-[72%] md:w-[60%] max-w-xs md:max-w-sm rounded-2xl bg-white/5 backdrop-blur-sm px-6 py-4">
          <GuardaLogo className="w-full" />
        </div>
      </div>

      {/* ── Formulario ── */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col justify-center py-8 md:py-0 bg-background">
        <div className="w-full max-w-sm mx-auto md:max-w-md">

          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6 px-6 md:px-8">
            Iniciá sesión
          </h1>

          <SignIn
            routing="path"
            path="/sign-in"
            appearance={{
              variables: {
                fontSize: '16px',
                spacingUnit: '15px',
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
            ¿No tenés cuenta?{' '}
            <Link
              to="/sign-up"
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              Registrate
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}
