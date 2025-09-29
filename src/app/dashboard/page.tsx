'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Loading } from '@/components/Loading'
import { getInitials } from '@/lib/utils'
import { Avatar } from '@/components/Avatar'
import { User, Settings, FileText, Calendar, Award, Mail, Facebook } from 'lucide-react'
import Link from 'next/link'
import { useMember } from '@/lib/hooks'

function DashboardContent() {
  const { user, profile, loading } = useAuth()
  const {member} = useMember(profile?.username || '') || null;

  console.log(member);

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
  
  // Mock data for demonstration
  const userStats = {
    projectsContributed: member?.contributed_projects.length,
    totalContribution: member?.contributed_projects && member.contributed_projects.length > 0
      ? (
          member.contributed_projects.reduce(
            (sum, contrib) => sum + (contrib.contribution_percentage || 0),
            0
          ) / member.contributed_projects.length
        )
      : 0,
    recentActivity: [
      ...(member?.contributed_projects?.map(contrib => ({
        type: contrib.role_in_project === 'Creator' ? 'created' : 'contribution',
        project: contrib.projects.title || 'Unknown Project',
        percentage: contrib.contribution_percentage || 0,
        date: contrib.projects?.created_at
          ? Math.floor((Date.now() - new Date(contrib.projects.created_at).getTime()) / (1000 * 60 * 60 * 24)) + ' day' + (Math.floor((Date.now() - new Date(contrib.projects.created_at).getTime()) / (1000 * 60 * 60 * 24)) != 1 && 's') + ' ago'
          : 'Unknown date'
      })) || []),
    ]
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
          {/* Profile Card */}
          <div className="lg:col-span-1">
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
          </div>

          {/* Main Dashboard Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary-blue mb-1">
                    {userStats.projectsContributed}
                  </div>
                  <div className="text-sm text-text-secondary">
                    Projects Contributed
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent-green mb-1">
                    {userStats.totalContribution}%
                  </div>
                  <div className="text-sm text-text-secondary">
                    Total Contribution
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent-cyan mb-1">
                    {profile.role === 'admin' ? 'Admin' : 'Member'}
                  </div>
                  <div className="text-sm text-text-secondary">
                    Role in Club
                  </div>
                </CardContent>
              </Card>
            </div>

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
                  {userStats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-4 border-b border-dark-border last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-blue/20 rounded-full flex items-center justify-center">
                          {activity.type === 'contribution' && <Award className="w-4 h-4 text-primary-blue" />}
                          {activity.type === 'joined' && <User className="w-4 h-4 text-accent-green" />}
                          {activity.type === 'created' && <FileText className="w-4 h-4 text-accent-cyan" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {activity.type === 'contribution' && `Contributed ${activity.percentage}% to `}
                            {activity.type === 'joined' && 'Joined project '}
                            {activity.type === 'created' && 'Created project '}
                            <span className="text-primary-blue">{activity.project}</span>
                          </p>
                          <p className="text-xs text-text-tertiary">{activity.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/dashboard/projects">
                    <Button variant="primary" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      My Projects
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button variant="secondary" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Browse Projects
                    </Button>
                  </Link>
                  <Link href="/members">
                    <Button variant="secondary" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      View Members
                    </Button>
                  </Link>
                  <Link href="/dashboard/profile">
                    <Button variant="secondary" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>
                  </Link>
                  {profile.role === 'admin' && (
                    <Link href="/admin">
                      <Button variant="primary" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Button>
                    </Link>
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