'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { Button } from './Button'
import { Input } from './Input'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { validateEmail } from '@/lib/utils'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const result = await signIn(email, password)

      if (result.error) {
        setError(result.error)
      } else {
        // Redirect to dashboard on successful login
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-dark-bg/50 backdrop-blur-xl border border-dark-border/50 hover:border-primary-blue/20 p-8 animate-fade-in transition-all duration-300 shadow-2xl shadow-black/20">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Welcome Back</h2>
            <p className="text-sm text-text-secondary mt-1">
              Sign in to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-error/10 border border-error/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              disabled={loading}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              disabled={loading}
              required
            />

            <Button
              type="submit"
              className="w-full h-12 text-base bg-gradient-to-r from-primary-blue to-accent-cyan hover:from-primary-blue/90 hover:to-accent-cyan/90"
              loading={loading}
              disabled={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="my-6 border-t border-dark-border/50" />

          <p className="text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <a href="/contact" className="text-primary-blue hover:text-accent-cyan transition-colors font-medium">
              Contact an admin
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
