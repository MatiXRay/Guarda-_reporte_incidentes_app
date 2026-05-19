import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'

export default function AppLayout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="mx-auto flex w-full max-w-350 flex-1">
        <Sidebar />
        <main className="flex-1 px-6 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
