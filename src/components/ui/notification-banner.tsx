import * as React from 'react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from './alert'

type NotificationBannerVariant = 'info' | 'success' | 'warning' | 'error'

interface NotificationBannerProps {
  variant?: NotificationBannerVariant
  title?: string
  message: string
  className?: string
}

const variantClasses: Record<NotificationBannerVariant, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-green-200 bg-green-50 text-green-800',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  error: 'border-red-200 bg-red-50 text-red-800'
}

export function NotificationBanner({
  variant = 'info',
  title,
  message,
  className
}: NotificationBannerProps) {
  const combinedClassName = cn(variantClasses[variant], className)

  return (
    <Alert
      variant={variant === 'error' ? 'destructive' : 'default'}
      className={combinedClassName}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

