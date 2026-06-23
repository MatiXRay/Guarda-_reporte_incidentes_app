import { useEffect, useRef } from 'react'
import { SignIn } from '@clerk/clerk-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { GuardaLogo } from '@/components/guardaLogo'
import { useTheme } from '@/hooks/useTheme'

export default function SignInPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isFactorStep = pathname.includes('factor')
  const formWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = formWrapperRef.current
    if (!wrapper) return
    const apply = () => wrapper.querySelectorAll('form').forEach((f) => f.setAttribute('novalidate', ''))
    apply()
    const observer = new MutationObserver(apply)
    observer.observe(wrapper, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background md:flex-row md:h-screen md:overflow-hidden">

      {/* ── Franja superior mobile / Panel imagen desktop ── */}
      <div
        className="sticky top-0 z-10 relative flex items-center justify-center shrink-0 h-36 md:static md:h-full md:w-[45%] overflow-hidden text-white"
        style={{ backgroundImage: 'url(/images/villa-maria-1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div aria-hidden="true" className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 w-fit md:w-[55%] rounded-2xl bg-white/5 backdrop-blur-sm px-4 py-3">
          <GuardaLogo className="w-56 md:w-full" />
        </div>
      </div>

      {/* ── Formulario ── */}
      <div className="flex-1 md:overflow-y-auto">
        <div className="flex flex-col justify-center min-h-full px-6 py-8">
          <div className="w-full max-w-sm mx-auto">

            {isFactorStep && (
              <button
                type="button"
                onClick={() => navigate('/sign-in')}
                className="flex items-center gap-1.5 mb-5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-4" />
                Volver
              </button>
            )}

            <h1 className="text-2xl font-bold text-foreground mb-6 text-center">
              {isFactorStep ? 'Verificación' : 'Iniciá sesión'}
            </h1>

            <div ref={formWrapperRef}>
              <SignIn
                routing="path"
                path="/sign-in"
                appearance={{
                  variables: {
                    fontSize: '16px',
                    spacingUnit: '14px',
                    borderRadius: '12px',
                    ...(isDark && {
                      colorNeutral: '#ffffff',
                      colorText: '#fafafa',
                      colorTextSecondary: '#a8a8a8',
                      colorInputBackground: '#242424',
                      colorInputText: '#fafafa',
                    }),
                  },
                  elements: {
                    rootBox: 'w-full',
                    cardBox: '!shadow-none !border-0 !bg-transparent w-full',
                    card: '!shadow-none !border-0 !bg-transparent w-full',
                    header: '!hidden',
                    footer: '!hidden',
                    formFieldLabel: '!hidden',
                    formButtonPrimary: '!h-12 !text-base !font-semibold !rounded-xl',
                    formFieldInput: '!h-12 !text-base !rounded-xl',
                    socialButtonsBlockButton: '!rounded-xl !h-12 !text-sm !w-full',
                    socialButtonsBlockButtons: '!flex !flex-col !gap-2',
                    dividerRow: 'my-2',
                  },
                }}
              />
            </div>

            <p className="mt-4 text-sm text-muted-foreground text-center">
              ¿No tenés cuenta?{' '}
              <Link to="/sign-up" className="font-semibold text-primary hover:underline underline-offset-4">
                Registrate
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
