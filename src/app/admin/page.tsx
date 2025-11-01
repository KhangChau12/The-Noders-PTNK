'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Loading } from '@/components/Loading'
import {
  Users,
  FileText,
  Shield,
  RefreshCw,
  TrendingUp,
  Eye,
  ThumbsUp,
  FileEdit,
  Calendar,
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
  postsByCategory: {
    'News': number
    'You may want to know': number
    'Member Spotlight': number
    'Community Activities': number
  }
}

interface RecentPost {
  id: string
  title: string
  title_vi: string
  status: string
  created_at: string
  author: {
    full_name: string
    username: string
  }
}

interface RecentProject {
  id: string
  title: string
  status: string
  created_at: string
  created_by_profile: {
    full_name: string
    username: string
  }
}

interface NewMember {
  id: string
  full_name: string
  username: string
  role: string
  created_at: string
}

function AdminDashboardContent() {
  const { session } = useAuth()
  const { localize } = useLanguage()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [newMembers, setNewMembers] = useState<NewMember[]>([])
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
        setRecentPosts(data.recentPosts || [])
        setRecentProjects(data.recentProjects || [])
        setNewMembers(data.newMembers || [])
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
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center">
              <Shield className="w-8 h-8 mr-3 text-primary-blue" />
              Admin Dashboard
            </h1>
            <p className="text-text-secondary mt-2">
              Manage club members, projects, posts, and view statistics.
            </p>
          </div>

          <Button
            onClick={fetchStats}
            variant="primary"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Reload
          </Button>
        </div>

        {/* Stats Overview - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">Total Members</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.totalMembers}</p>
                </div>
                <div className="p-3 bg-primary-blue/20 rounded-full">
                  <Users className="w-6 h-6 text-primary-blue" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">Admin Users</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.adminCount}</p>
                </div>
                <div className="p-3 bg-accent-green/20 rounded-full">
                  <Shield className="w-6 h-6 text-accent-green" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">Total Projects</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.totalProjects}</p>
                </div>
                <div className="p-3 bg-accent-cyan/20 rounded-full">
                  <FileText className="w-6 h-6 text-accent-cyan" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">Active Projects</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.activeProjects}</p>
                </div>
                <div className="p-3 bg-warning/20 rounded-full">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
              </div>
              <div className="mt-4 text-sm text-text-secondary">
                {stats.totalProjects - stats.activeProjects} completed/archived
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">Published Posts</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.totalPosts}</p>
                </div>
                <div className="p-3 bg-success/20 rounded-full">
                  <FileEdit className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">Draft Posts</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.draftPosts}</p>
                </div>
                <div className="p-3 bg-text-tertiary/20 rounded-full">
                  <FileEdit className="w-6 h-6 text-text-tertiary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">Total Views</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.totalViews.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-accent-purple/20 rounded-full">
                  <Eye className="w-6 h-6 text-accent-purple" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">Total Upvotes</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.totalUpvotes.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-primary-blue/20 rounded-full">
                  <ThumbsUp className="w-6 h-6 text-primary-blue" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & Posts by Category */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/admin/users">
                    <Button variant="secondary" size="sm" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Members
                    </Button>
                  </Link>
                  <Link href="/admin/projects">
                    <Button variant="secondary" size="sm" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Manage Projects
                    </Button>
                  </Link>
                  <Link href="/members">
                    <Button variant="secondary" size="sm" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      View All Members
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button variant="secondary" size="sm" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      View All Projects
                    </Button>
                  </Link>
                  <Link href="/posts">
                    <Button variant="secondary" size="sm" className="w-full justify-start">
                      <FileEdit className="w-4 h-4 mr-2" />
                      View All Posts
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Posts by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Posts by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">News</span>
                    <Badge variant="primary" size="sm">{stats.postsByCategory['News']}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Did You Know?</span>
                    <Badge variant="tech" size="sm">{stats.postsByCategory['You may want to know']}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Member Spotlight</span>
                    <Badge variant="success" size="sm">{stats.postsByCategory['Member Spotlight']}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Activities</span>
                    <Badge variant="warning" size="sm">{stats.postsByCategory['Community Activities']}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Posts</CardTitle>
                  <Link href="/posts">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentPosts.length === 0 ? (
                  <p className="text-text-secondary text-center py-4">No posts yet</p>
                ) : (
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="flex items-start justify-between py-3 border-b border-dark-border last:border-b-0">
                        <div className="flex-1 min-w-0">
                          <Link href={`/posts/${post.id}`}>
                            <h4 className="text-sm font-medium text-text-primary hover:text-primary-blue truncate">
                              {localize(post.title, post.title_vi)}
                            </h4>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-text-tertiary">
                              by {post.author?.full_name || 'Unknown'}
                            </span>
                            <span className="text-xs text-text-tertiary">•</span>
                            <span className="text-xs text-text-tertiary">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={post.status === 'published' ? 'success' : 'secondary'}
                          size="sm"
                          className="ml-2 flex-shrink-0"
                        >
                          {post.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Projects</CardTitle>
                  <Link href="/projects">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentProjects.length === 0 ? (
                  <p className="text-text-secondary text-center py-4">No projects yet</p>
                ) : (
                  <div className="space-y-4">
                    {recentProjects.map((project) => (
                      <div key={project.id} className="flex items-start justify-between py-3 border-b border-dark-border last:border-b-0">
                        <div className="flex-1 min-w-0">
                          <Link href={`/projects/${project.id}`}>
                            <h4 className="text-sm font-medium text-text-primary hover:text-primary-blue truncate">
                              {project.title}
                            </h4>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-text-tertiary">
                              by {project.created_by_profile?.full_name || 'Unknown'}
                            </span>
                            <span className="text-xs text-text-tertiary">•</span>
                            <span className="text-xs text-text-tertiary">
                              {new Date(project.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={project.status === 'active' ? 'success' : 'secondary'}
                          size="sm"
                          className="ml-2 flex-shrink-0"
                        >
                          {project.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* New Members */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>New Members</CardTitle>
                  <Link href="/members">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {newMembers.length === 0 ? (
                  <p className="text-text-secondary text-center py-4">No members yet</p>
                ) : (
                  <div className="space-y-4">
                    {newMembers.map((member) => (
                      <div key={member.id} className="flex items-start justify-between py-3 border-b border-dark-border last:border-b-0">
                        <div className="flex-1 min-w-0">
                          <Link href={`/members/${member.username}`}>
                            <h4 className="text-sm font-medium text-text-primary hover:text-primary-blue truncate">
                              {member.full_name}
                            </h4>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-text-tertiary">
                              @{member.username}
                            </span>
                            <span className="text-xs text-text-tertiary">•</span>
                            <span className="text-xs text-text-tertiary">
                              Joined {new Date(member.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={member.role === 'admin' ? 'primary' : 'secondary'}
                          size="sm"
                          className="ml-2 flex-shrink-0"
                        >
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Warning Note */}
        <Card className="mt-8 border-warning/20 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-warning/20 rounded-full">
                <Shield className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">Admin Access</h3>
                <p className="text-sm text-text-secondary">
                  You have administrative privileges. Use these powers responsibly to maintain
                  the club's community and ensure all members have a positive experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
