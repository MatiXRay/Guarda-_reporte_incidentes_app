import { SignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { GuardaLogo } from '@/components/guardaLogo'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── Branding panel ── */}
      <div
        className="relative flex items-center justify-center md:w-[45%] min-h-[220px] md:min-h-screen overflow-hidden"
        style={{
          backgroundImage: 'url(/images/villa-maria-1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div aria-hidden="true" className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 w-[50%] max-w-lg rounded-2xl bg-white/2 backdrop-blur-xs shadow-sm px-8 py-6">
          <GuardaLogo className="w-full" />
        </div>
      </div>

      {/* ── Auth panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-10 md:py-0 bg-background">
        <Card className="w-full max-w-105 border-0 shadow-none bg-transparent ring-0">
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
