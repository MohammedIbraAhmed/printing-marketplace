import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact support or check your account permissions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}