'use client'

import Link from 'next/link'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="container mx-auto max-w-2xl">
        <Card className="text-center">
          <CardContent className="p-12">
            {/* 404 Animation */}
            <div className="text-8xl md:text-9xl font-bold text-primary-blue/20 mb-4">
              404
            </div>

            {/* Error Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Page Not Found
            </h1>

            <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
              Sorry, we couldn't find the page you're looking for.
              It might have been moved, deleted, or you entered the wrong URL.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              </Button>

              <Button asChild variant="secondary" size="lg">
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </button>
              </Button>
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-8 border-t border-dark-border">
              <p className="text-text-tertiary text-sm mb-4">
                Looking for something specific?
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link
                  href="/projects"
                  className="text-primary-blue hover:text-primary-blue/80 transition-colors"
                >
                  Browse Projects
                </Link>
                <Link
                  href="/members"
                  className="text-primary-blue hover:text-primary-blue/80 transition-colors"
                >
                  Meet Our Team
                </Link>
                <Link
                  href="/dashboard"
                  className="text-primary-blue hover:text-primary-blue/80 transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}