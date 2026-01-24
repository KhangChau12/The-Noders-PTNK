'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Loading } from '@/components/Loading'
import { getInitials } from '@/lib/utils'
import { Avatar } from '@/components/Avatar'
import {
  User,
  Settings,
  FileText,
  Calendar,
  Award,
  Mail,
  Facebook,
  PenSquare,
  Shield,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { useMember } from '@/lib/hooks'
import { useState, useEffect } from 'react'

interface UserPost {
  id: string
  title: string
  created_at: string
  status: 'draft' | 'published'
}

function DashboardContent() {
  const { user, profile, loading } = useAuth()
  const {member} = useMember(profile?.username || '') || null;
  const [userPosts, setUserPosts] = useState<UserPost[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [certificatesCount, setCertificatesCount] = useState(0)

  // Fetch user's certificates count
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user) return
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { count } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      setCertificatesCount(count || 0)
    }
    fetchCertificates()
  }, [user])

  console.log(member);

  // Fetch user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) return

      try {
        const response = await fetch(`/api/posts?author=${user.id}&status=all`)
        const data = await response.json()
        if (data.success && data.posts) {
          setUserPosts(data.posts)
        }
      } catch (error) {
        console.error('Error fetching user posts:', error)
      } finally {
        setPostsLoading(false)
      }
    }

    fetchUserPosts()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Welcome! Let's set up your profile.
          </h1>
          <p className="text-text-secondary mb-8">
            Complete your profile to get the most out of our platform.
          </p>
          <Link href="/dashboard/profile">
            <Button>
              Complete Profile
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Use CSS Avatar component instead of external image
  const socialLinks = profile.social_links || {}
  
  // User stats with posts
  const userStats = {
    projectsContributed: member?.contributed_projects.length || 0,
    postsCount: userPosts.length,
    recentActivity: [
      // Project activities
      ...(member?.contributed_projects?.map(contrib => ({
        type: contrib.role_in_project === 'Creator' ? 'created-project' : 'contribution',
        title: contrib.projects.title || 'Unknown Project',
        percentage: contrib.contribution_percentage || 0,
        date: contrib.projects?.created_at
          ? Math.floor((Date.now() - new Date(contrib.projects.created_at).getTime()) / (1000 * 60 * 60 * 24)) + ' day' + (Math.floor((Date.now() - new Date(contrib.projects.created_at).getTime()) / (1000 * 60 * 60 * 24)) != 1 && 's') + ' ago'
          : 'Unknown date',
        timestamp: contrib.projects?.created_at || ''
      })) || []),
      // Post activities
      ...(userPosts?.map(post => ({
        type: 'created-post',
        title: post.title || 'Untitled Post',
        status: post.status,
        date: post.created_at
          ? Math.floor((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24)) + ' day' + (Math.floor((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24)) != 1 && 's') + ' ago'
          : 'Unknown date',
        timestamp: post.created_at || ''
      })) || []),
    ].sort((a, b) => {
      // Sort by timestamp descending (most recent first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    }).slice(0, 10) // Show only 10 most recent activities
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome back, {profile.full_name || profile.username}!
          </h1>
          <p className="text-text-secondary">
            Here's what's happening with your projects and contributions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDEBAR: Profile & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="mx-auto mb-4 flex justify-center">
                    <Avatar
                      name={profile.full_name}
                      src={profile.avatar_url}
                      size="xl"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-1">
                    {profile.full_name || profile.username}
                  </h3>
                  <p className="text-text-secondary text-sm mb-3">
                    @{profile.username}
                  </p>
                  <Badge variant={profile.role === 'admin' ? 'primary' : 'secondary'}>
                    {profile.role === 'admin' ? 'Admin' : 'Member'}
                  </Badge>
                </div>

                {profile.bio && (
                  <div className="mb-6">
                    <p className="text-text-secondary text-sm text-center">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-text-primary mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.slice(0, 6).map((skill, index) => (
                        <Badge key={index} variant="tech" size="sm">
                          {skill}
                        </Badge>
                      ))}
                      {profile.skills.length > 6 && (
                        <Badge variant="secondary" size="sm">
                          +{profile.skills.length - 6}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Links */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-text-primary mb-3">Contact</h4>
                  <div className="flex space-x-3 justify-center">
                    <a href="mailto:phuckhangtdn@gmail.com" className="text-text-secondary hover:text-primary-blue">
                      <Mail className="w-5 h-5" />
                    </a>
                    {socialLinks.facebook && (
                      <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary-blue">
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                <Link href="/dashboard/profile">
                  <Button variant="secondary" size="sm" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Vertical Stats Row */}
            <div className="space-y-4">
              <Card className="border-l-4 border-l-primary-blue bg-dark-surface/50 hover:bg-dark-surface transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary-blue/10 rounded-lg">
                      <FileText className="w-5 h-5 text-primary-blue" />
                    </div>
                    <div>
                      <div className="text-sm text-text-secondary">Projects</div>
                      <div className="text-xl font-bold text-text-primary">{userStats.projectsContributed}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent-cyan bg-dark-surface/50 hover:bg-dark-surface transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-accent-cyan/10 rounded-lg">
                      <PenSquare className="w-5 h-5 text-accent-cyan" />
                    </div>
                    <div>
                      <div className="text-sm text-text-secondary">Posts</div>
                      <div className="text-xl font-bold text-text-primary">{postsLoading ? '...' : userStats.postsCount}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent-green bg-dark-surface/50 hover:bg-dark-surface transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-accent-green/10 rounded-lg">
                      <Shield className="w-5 h-5 text-accent-green" />
                    </div>
                    <div>
                      <div className="text-sm text-text-secondary">Role</div>
                      <div className="text-xl font-bold text-text-primary capitalize">{profile.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent-purple bg-dark-surface/50 hover:bg-dark-surface transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-accent-purple/10 rounded-lg">
                      <Award className="w-5 h-5 text-accent-purple" />
                    </div>
                    <div>
                      <div className="text-sm text-text-secondary">Certificates</div>
                      <div className="text-xl font-bold text-text-primary">{certificatesCount}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RIGHT CONTENT: Dashboard Actions & Activity */}
          <div className="lg:col-span-2 space-y-8">
             {/* My Content & Achievements - MOVED TO TOP */}
             <Card className="border-none bg-transparent shadow-none p-0">
               <CardContent className="p-0">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {/* My Projects */}
                   <Link href="/dashboard/projects" className="group block h-full">
                     <div className="h-full p-6 rounded-xl border-2 border-dark-border bg-dark-surface hover:border-primary-blue hover:bg-dark-surface/80 transition-all duration-300 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-primary-blue/5 rounded-full blur-2xl -translate-y-8 translate-x-8 group-hover:bg-primary-blue/10 transition-colors"></div>
                       
                       <div className="relative z-10">
                         <div className="flex items-center justify-between mb-4">
                           <div className="w-12 h-12 rounded-xl bg-primary-blue/10 flex items-center justify-center group-hover:bg-primary-blue/20 group-hover:scale-110 transition-all duration-300">
                             <FileText className="w-6 h-6 text-primary-blue" />
                           </div>
                           <ArrowRight className="w-5 h-5 text-dark-border group-hover:text-primary-blue group-hover:translate-x-1 transition-all" />
                         </div>
                         <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-primary-blue transition-colors">My Projects</h3>
                         <p className="text-sm text-text-secondary leading-relaxed">Manage your contributions.</p>
                       </div>
                     </div>
                   </Link>
 
                   {/* My Posts */}
                   <Link href="/dashboard/posts" className="group block h-full">
                     <div className="h-full p-6 rounded-xl border-2 border-dark-border bg-dark-surface hover:border-accent-cyan hover:bg-dark-surface/80 transition-all duration-300 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-accent-cyan/5 rounded-full blur-2xl -translate-y-8 translate-x-8 group-hover:bg-accent-cyan/10 transition-colors"></div>
                       
                       <div className="relative z-10">
                         <div className="flex items-center justify-between mb-4">
                           <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center group-hover:bg-accent-cyan/20 group-hover:scale-110 transition-all duration-300">
                             <PenSquare className="w-6 h-6 text-accent-cyan" />
                           </div>
                           <ArrowRight className="w-5 h-5 text-dark-border group-hover:text-accent-cyan group-hover:translate-x-1 transition-all" />
                         </div>
                         <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-accent-cyan transition-colors">My Posts</h3>
                         <p className="text-sm text-text-secondary leading-relaxed">Publish your knowledge.</p>
                       </div>
                     </div>
                   </Link>
 
                   {/* My Certificates */}
                   <Link href="/dashboard/certificates" className="group block h-full">
                     <div className="h-full p-6 rounded-xl border-2 border-dark-border bg-dark-surface hover:border-accent-purple hover:bg-dark-surface/80 transition-all duration-300 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-accent-purple/5 rounded-full blur-2xl -translate-y-8 translate-x-8 group-hover:bg-accent-purple/10 transition-colors"></div>
                       
                       <div className="relative z-10">
                         <div className="flex items-center justify-between mb-4">
                           <div className="w-12 h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center group-hover:bg-accent-purple/20 group-hover:scale-110 transition-all duration-300">
                             <Award className="w-6 h-6 text-accent-purple" />
                           </div>
                           <ArrowRight className="w-5 h-5 text-dark-border group-hover:text-accent-purple group-hover:translate-x-1 transition-all" />
                         </div>
                         <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-accent-purple transition-colors">My Certs</h3>
                         <p className="text-sm text-text-secondary leading-relaxed">View your achievements.</p>
                       </div>
                     </div>
                   </Link>
                 </div>
               </CardContent>
             </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="-mb-2 -mt-2">
                  {userStats.recentActivity.length === 0 ? (
                    <p className="text-text-tertiary text-sm text-center py-4">No recent activity</p>
                  ) : (
                    userStats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-4 border-b border-dark-border last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === 'created-post' ? 'bg-accent-green/20' :
                            activity.type === 'created-project' ? 'bg-accent-cyan/20' :
                            'bg-primary-blue/20'
                          }`}>
                            {activity.type === 'contribution' && <Award className="w-4 h-4 text-primary-blue" />}
                            {activity.type === 'created-project' && <FileText className="w-4 h-4 text-accent-cyan" />}
                            {activity.type === 'created-post' && <PenSquare className="w-4 h-4 text-accent-green" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {activity.type === 'contribution' && `Contributed ${activity.percentage}% to `}
                              {activity.type === 'created-project' && 'Created project '}
                              {activity.type === 'created-post' && 'Published post '}
                              <span className={
                                activity.type === 'created-post' ? 'text-accent-green' :
                                activity.type === 'created-project' ? 'text-accent-cyan' :
                                'text-primary-blue'
                              }>{activity.title}</span>
                              {activity.type === 'created-post' && activity.status === 'draft' && (
                                <span className="ml-2 text-xs text-text-tertiary">(draft)</span>
                              )}
                            </p>
                            <p className="text-xs text-text-tertiary">{activity.date}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}