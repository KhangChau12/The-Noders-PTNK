'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { Loading } from '@/components/Loading'
import {
  Users,
  FileText,
  Shield,
  RefreshCw,
  Eye,
  ThumbsUp,
  FileEdit,
  Award,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface AdminStats {
  totalMembers: number
  adminCount: number
  totalProjects: number
  activeProjects: number
  totalPosts: number
  draftPosts: number
  totalViews: number
  totalUpvotes: number
}

function AdminDashboardContent() {
  const { session } = useAuth()
  const { localize } = useLanguage()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    if (!session?.access_token) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      } else {
        setError(data.error || 'Failed to fetch stats')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error fetching admin stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.access_token) {
      fetchStats()
    }
  }, [session?.access_token])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading admin dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-error mb-4">{error}</p>
            <Button onClick={fetchStats}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-text-secondary">No data available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center">
              <Shield className="w-8 h-8 mr-3 text-primary-blue" />
              Admin Dashboard
            </h1>
            <p className="text-text-secondary mt-2">
              Overview of system performance and quick management actions.
            </p>
          </div>

          <Button
            onClick={fetchStats}
            variant="primary"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Key Statistics - Simplified Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <Card className="border-l-4 border-l-accent-purple bg-dark-surface/50 hover:bg-dark-surface transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">Members</p>
                  <p className="text-2xl font-bold text-accent-purple mt-1">{stats.totalMembers}</p>
                  <p className="text-xs text-text-tertiary mt-1">{stats.adminCount} Admins</p>
                </div>
                <div className="p-2 bg-accent-purple/10 rounded-lg">
                  <Users className="w-6 h-6 text-accent-purple" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent-pink bg-dark-surface/50 hover:bg-dark-surface transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">Projects</p>
                  <p className="text-2xl font-bold text-accent-pink mt-1">{stats.activeProjects}</p>
                  <p className="text-xs text-text-tertiary mt-1">of {stats.totalProjects} Total</p>
                </div>
                <div className="p-2 bg-accent-pink/10 rounded-lg">
                  <FileText className="w-6 h-6 text-accent-pink" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent-cyan bg-dark-surface/50 hover:bg-dark-surface transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">Posts</p>
                  <p className="text-2xl font-bold text-accent-cyan mt-1">{stats.totalPosts}</p>
                  <p className="text-xs text-text-tertiary mt-1">{stats.draftPosts} Drafts</p>
                </div>
                <div className="p-2 bg-accent-cyan/10 rounded-lg">
                  <FileEdit className="w-6 h-6 text-accent-cyan" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary-blue bg-dark-surface/50 hover:bg-dark-surface transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">Views</p>
                  <p className="text-2xl font-bold text-primary-blue mt-1">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-xs text-text-tertiary mt-1">Total Views</p>
                </div>
                <div className="p-2 bg-primary-blue/10 rounded-lg">
                  <Eye className="w-6 h-6 text-primary-blue" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent-orange bg-dark-surface/50 hover:bg-dark-surface transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">Upvotes</p>
                  <p className="text-2xl font-bold text-accent-orange mt-1">{stats.totalUpvotes.toLocaleString()}</p>
                  <p className="text-xs text-text-tertiary mt-1">Total Likes</p>
                </div>
                <div className="p-2 bg-accent-orange/10 rounded-lg">
                  <ThumbsUp className="w-6 h-6 text-accent-orange" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions Area */}
        <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center">
          <div className="w-2 h-8 bg-gradient-to-b from-primary-blue to-accent-cyan rounded-full mr-3"></div>
          Management Center
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Members Action Card */}
          <Link href="/admin/users" className="block group">
            <div className="h-full relative overflow-hidden rounded-xl border border-dark-border bg-dark-surface hover:border-primary-blue/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-blue/10 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-primary-blue/20 transition-colors"></div>
              
              <div className="p-8 relative z-10 flex items-start space-x-6">
                <div className="p-4 bg-primary-blue/10 rounded-2xl group-hover:bg-primary-blue/20 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary-blue/5">
                  <Users className="w-10 h-10 text-primary-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary-blue transition-colors">
                    Manage Members
                  </h3>
                  <p className="text-text-secondary leading-relaxed mb-4">
                    View member list, assign roles, and manage account permissions for the club.
                  </p>
                  <span className="text-primary-blue text-sm font-semibold flex items-center group-hover:translate-x-2 transition-transform">
                    Access Members <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Projects Action Card */}
          <Link href="/admin/projects" className="block group">
            <div className="h-full relative overflow-hidden rounded-xl border border-dark-border bg-dark-surface hover:border-accent-pink/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-pink/10 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-accent-pink/20 transition-colors"></div>
              
              <div className="p-8 relative z-10 flex items-start space-x-6">
                <div className="p-4 bg-accent-pink/10 rounded-2xl group-hover:bg-accent-pink/20 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-accent-pink/5">
                  <FileText className="w-10 h-10 text-accent-pink" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-accent-pink transition-colors">
                    Manage Projects
                  </h3>
                  <p className="text-text-secondary leading-relaxed mb-4">
                    Oversee club projects, update development status, and highlight featured work.
                  </p>
                  <span className="text-accent-pink text-sm font-semibold flex items-center group-hover:translate-x-2 transition-transform">
                    Access Projects <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Posts Action Card */}
          <Link href="/admin/posts" className="block group">
            <div className="h-full relative overflow-hidden rounded-xl border border-dark-border bg-dark-surface hover:border-accent-cyan/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/10 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-accent-cyan/20 transition-colors"></div>
              
              <div className="p-8 relative z-10 flex items-start space-x-6">
                <div className="p-4 bg-accent-cyan/10 rounded-2xl group-hover:bg-accent-cyan/20 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-accent-cyan/5">
                  <FileEdit className="w-10 h-10 text-accent-cyan" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-accent-cyan transition-colors">
                    Manage Posts
                  </h3>
                  <p className="text-text-secondary leading-relaxed mb-4">
                    Create content, review drafts, and publish updates to the news feed.
                  </p>
                  <span className="text-accent-cyan text-sm font-semibold flex items-center group-hover:translate-x-2 transition-transform">
                    Access Posts <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Certificates Action Card */}
          <Link href="/admin/certificates" className="block group">
            <div className="h-full relative overflow-hidden rounded-xl border border-dark-border bg-dark-surface hover:border-accent-green/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/10 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-accent-green/20 transition-colors"></div>
              
              <div className="p-8 relative z-10 flex items-start space-x-6">
                <div className="p-4 bg-accent-green/10 rounded-2xl group-hover:bg-accent-green/20 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-accent-green/5">
                  <Award className="w-10 h-10 text-accent-green" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-accent-green transition-colors">
                    Manage Certificates
                  </h3>
                  <p className="text-text-secondary leading-relaxed mb-4">
                    Issue new certificates, verify existing ones, and manage completion records.
                  </p>
                  <span className="text-accent-green text-sm font-semibold flex items-center group-hover:translate-x-2 transition-transform">
                    Access Certificates <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
           <p className="text-text-tertiary text-sm">
             The Noders PTNK Admin System
           </p>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
