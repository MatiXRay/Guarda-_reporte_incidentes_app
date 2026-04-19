import { SignUp } from '@clerk/clerk-react'

export default function SignUpPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
      <SignUp routing="path" path="/sign-up" />
    </div>
  )
}
