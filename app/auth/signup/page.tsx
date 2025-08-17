import { SignUpForm } from '@/components/auth/signup-form'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Join Printing Marketplace
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your account to get started
          </p>
        </div>
        
        <SignUpForm />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Sign Up | Printing Marketplace',
  description: 'Create your Printing Marketplace account',
}