import { Badge } from '@/components/ui/badge'
import { Shield, ShieldCheck, Clock, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerificationBadgeProps {
  status: 'verified' | 'pending' | 'rejected' | 'unverified'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export function VerificationBadge({ 
  status, 
  size = 'md', 
  showIcon = true, 
  className 
}: VerificationBadgeProps) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'verified':
        return {
          variant: 'default' as const,
          icon: ShieldCheck,
          text: 'Verified',
          className: 'bg-green-600 hover:bg-green-700 text-white'
        }
      case 'pending':
        return {
          variant: 'secondary' as const,
          icon: Clock,
          text: 'Pending Review',
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        }
      case 'rejected':
        return {
          variant: 'destructive' as const,
          icon: ShieldAlert,
          text: 'Rejected',
          className: 'bg-red-100 text-red-800 hover:bg-red-200'
        }
      case 'unverified':
      default:
        return {
          variant: 'outline' as const,
          icon: Shield,
          text: 'Unverified',
          className: 'border-gray-300 text-gray-600'
        }
    }
  }

  const config = getBadgeConfig()
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        'flex items-center gap-1 font-medium',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.text}
    </Badge>
  )
}