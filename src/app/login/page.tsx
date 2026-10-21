'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { LoginForm, safeNext } from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex justify-center px-5 pb-[120px] pt-24">
      <Suspense>
        <Login />
      </Suspense>
    </div>
  )
}

function Login() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useSearchParams()

  // Already signed in: go where they were heading
  useEffect(() => {
    if (!loading && user) router.replace(safeNext(params.get('next')))
  }, [user, loading, router, params])

  if (!loading && user) return null
  return <LoginForm />
}
