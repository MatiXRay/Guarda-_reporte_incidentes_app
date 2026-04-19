import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
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
          afterSignInUrl="/dashboard"
          afterSignUpUrl="/dashboard"
        >
        <App />
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
)
