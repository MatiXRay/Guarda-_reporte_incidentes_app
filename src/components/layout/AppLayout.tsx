import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { cn } from '@/lib/utils'

export default function AppLayout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  const isMapaPage = location.pathname === '/mapa'

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header onMenuClick={() => setSidebarOpen((v) => !v)} />
      <div className={cn('flex flex-1', !isMapaPage && 'mx-auto w-full max-w-350')}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={cn(
          'flex-1 min-w-0',
          isMapaPage ? 'overflow-hidden' : 'overflow-x-hidden px-6 py-6 lg:px-8'
        )}>
          <Outlet />
        </main>
      </div>
      {!isMapaPage && <Footer />}
    </div>
  )
}
