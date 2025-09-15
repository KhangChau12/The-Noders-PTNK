'use client'

import { useEffect } from 'react'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { RefreshCw, Home, AlertCircle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="container mx-auto max-w-2xl">
        <Card className="text-center">
          <CardContent className="p-12">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-error" />
            </div>

            {/* Error Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Something went wrong!
            </h1>

            <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
              We encountered an unexpected error. Don't worry, our team has been notified
              and we're working to fix this issue.
            </p>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-8 p-4 bg-dark-surface border border-dark-border rounded-lg text-left">
                <h3 className="text-sm font-semibold text-text-primary mb-2">Error Details:</h3>
                <p className="text-xs text-text-secondary font-mono whitespace-pre-wrap break-words">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-text-tertiary mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={reset}
                size="lg"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>

              <Button
                asChild
                variant="secondary"
                size="lg"
              >
                <a href="/" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </a>
              </Button>
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-8 border-t border-dark-border">
              <p className="text-text-tertiary text-sm mb-4">
                If this problem persists, please contact support
              </p>

              <Button
                asChild
                variant="ghost"
                size="sm"
              >
                <a
                  href="mailto:phuckhangtdn@gmail.com?subject=AI Agent Club - Error Report"
                  className="text-primary-blue hover:text-primary-blue/80"
                >
                  Report Issue
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}