'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/LoginForm'
import { useAuth } from '@/components/AuthProvider'
import { Loading } from '@/components/Loading'
import { CounterAnimation } from '@/components/CounterAnimation'
import { SITE_CONFIG } from '@/lib/constants'
import { createClient } from '@/lib/supabase'
import { Code, Trophy, BookOpen, Facebook, Lock, Users } from 'lucide-react'

const features = [
  { icon: Code, title: 'AI Projects', desc: 'Build real-world solutions', color: 'text-accent-cyan' },
  { icon: Trophy, title: 'Competitions', desc: 'NAIC & PAIC challenges', color: 'text-accent-purple' },
  { icon: BookOpen, title: 'Education', desc: 'Workshops & courses', color: 'text-accent-green' },
]

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ members: 0, projects: 0, posts: 0 })

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Fetch live stats from Supabase (anon key, no auth needed)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()
        const [membersRes, projectsRes, postsRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        ])
        setStats({
          members: membersRes.count || 0,
          projects: projectsRes.count || 0,
          posts: postsRes.count || 0,
        })
      } catch {
        setStats({ members: 15, projects: 8, posts: 25 })
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    )
  }

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* LEFT PANEL — Branding & Community Showcase */}
      <div className="relative lg:w-[60%] flex items-center justify-center px-6 py-12 lg:py-0 overflow-hidden bg-gradient-to-b from-dark-bg via-dark-surface/20 to-dark-bg">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Center Glow Orb */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[900px] lg:h-[900px] opacity-20 lg:opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(96, 165, 250, 0.5) 0%, rgba(59, 130, 246, 0.3) 40%, transparent 70%)',
              filter: 'blur(100px)'
            }}
          />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10 max-w-lg text-center lg:text-left">
          {/* Text Logo */}
          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-[family-name:var(--font-shrikhand)]">
              <span className="text-text-primary">The Noders </span>
              <span className="text-primary-blue">PTNK</span>
            </h1>
            <p className="text-lg text-text-secondary mt-3">
              {SITE_CONFIG.tagline}
            </p>
            <p className="text-sm text-text-tertiary mt-1">
              VNUHCM High School for the Gifted
            </p>
          </div>

          {/* Feature Highlights — Desktop only */}
          <div className="hidden lg:grid grid-cols-3 gap-4 mb-10">
            {features.map((feat) => (
              <div key={feat.title} className="group relative">
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative overflow-hidden rounded-xl bg-dark-bg/50 backdrop-blur-sm border border-dark-border hover:border-primary-blue/30 transition-all duration-300 p-4 min-h-[120px]">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Watermark icon */}
                  <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-[0.15] transition-all duration-500 transform -rotate-12 group-hover:-rotate-6 group-hover:scale-110 pointer-events-none">
                    <feat.icon className={`w-20 h-20 ${feat.color}`} strokeWidth={1} />
                  </div>

                  <div className="relative z-10">
                    <feat.icon className={`w-6 h-6 ${feat.color} mb-2`} />
                    <h3 className="text-sm font-semibold text-text-primary">{feat.title}</h3>
                    <p className="text-xs text-text-tertiary mt-1">{feat.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Strip — Desktop only */}
          <div className="hidden lg:flex items-center gap-6 pt-8 border-t border-dark-border/30">
            {[
              { label: 'Members', value: stats.members, icon: Users },
              { label: 'Projects', value: stats.projects, icon: Code },
              { label: 'Posts', value: stats.posts, icon: BookOpen },
            ].map((stat) => (
              <div key={stat.label} className="flex-1">
                <div className="relative overflow-hidden rounded-lg bg-dark-bg/30 backdrop-blur-sm border border-dark-border/30 p-3 text-center">
                  {/* Watermark */}
                  <div className="absolute -bottom-3 -right-3 opacity-[0.06] pointer-events-none">
                    <stat.icon className="w-14 h-14 text-primary-blue" strokeWidth={1} />
                  </div>
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary relative z-10">
                    <CounterAnimation end={stat.value} suffix="+" />
                  </div>
                  <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest relative z-10">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Login Form */}
      <div className="lg:w-[40%] relative flex items-center justify-center px-6 py-12 lg:py-0
                      bg-gradient-to-b from-dark-surface/50 to-dark-bg
                      lg:border-l lg:border-dark-border/30">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(96, 165, 250, 0.6) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          <LoginForm />

          {/* Bottom info */}
          <div className="mt-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs text-text-tertiary">
              <Lock className="w-3.5 h-3.5" />
              <span>Members-only platform</span>
            </div>
            <a
              href="https://www.facebook.com/thenodersptnk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary-blue transition-colors"
            >
              <Facebook className="w-4 h-4" />
              Follow us on Facebook
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
