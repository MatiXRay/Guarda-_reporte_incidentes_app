import { useUser, UserButton } from '@clerk/clerk-react'

export default function DashboardPage() {
  const { user } = useUser()

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Bienvenido, {user?.firstName ?? user?.emailAddresses[0].emailAddress}</h1>
        <UserButton />
      </div>
      <p>Panel de reportes (próximo módulo)</p>
    </div>
  )
}
