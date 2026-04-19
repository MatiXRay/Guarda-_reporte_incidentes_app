import { SignIn } from '@clerk/clerk-react'

export default function SignInPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
      <SignIn routing="path" path="/sign-in" />
    </div>
  )
}
