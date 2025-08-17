import { Suspense } from 'react'
import { SignInForm } from '@/components/auth/signin-form'

interface SignInPageProps {
  searchParams: { callbackUrl?: string }
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your Printing Marketplace account
          </p>
        </div>
        
        <Suspense fallback={<div>Loading...</div>}>
          <SignInForm callbackUrl={searchParams.callbackUrl} />
        </Suspense>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Sign In | Printing Marketplace',
  description: 'Sign in to your Printing Marketplace account',
}