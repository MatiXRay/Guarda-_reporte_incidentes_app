import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { esES } from '@clerk/localizations'
import { UserRoleProvider } from './context/UserRoleContext'
import './index.css'
import App from './App.tsx'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY no está definida en .env')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider
          publishableKey={publishableKey}
          signInForceRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
          localization={{
            ...esES,
            formFieldInputPlaceholder__emailAddress: 'Correo electrónico',
            formFieldInputPlaceholder__emailAddress_username: 'Correo electrónico',
            formFieldInputPlaceholder__password: 'Contraseña',
            formFieldInputPlaceholder__firstName: 'Nombre',
            formFieldInputPlaceholder__lastName: 'Apellido',
          }}
        >
        <UserRoleProvider>
          <App />
        </UserRoleProvider>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
)
