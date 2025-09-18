'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Loading } from '@/components/Loading'
import { memberQueries, projectQueries } from '@/lib/queries'
import { Users, FileText, Activity, Settings, TrendingUp, Shield, RefreshCw } from 'lucide-react'
import Link from 'next/link'

function AdminDashboardContent() {
  // Manual loading state
  const [members, setMembers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Debug logging
  console.log('AdminDashboard render:', { membersLoading, projectsLoading, dataLoaded })

  // Manual reload functions
  const handleLoadMembers = async () => {
    setMembersLoading(true)
    try {
      const { members: fetchedMembers, error } = await memberQueries.getMembers()
      if (!error && fetchedMembers) {
        setMembers(fetchedMembers)
      }
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setMembersLoading(false)
    }
  }

  const handleLoadProjects = async () => {
    setProjectsLoading(true)
    try {
      const { projects: fetchedProjects, error } = await projectQueries.getProjects()
      if (!error && fetchedProjects) {
        setProjects(fetchedProjects)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setProjectsLoading(false)
    }
  }

  const handleReloadAll = async () => {
    try {
      setDataLoaded(true)
      await Promise.all([
        handleLoadMembers(),
        handleLoadProjects()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  // Auto-load data on component mount
  useEffect(() => {
    if (!dataLoaded) {
      handleReloadAll()
    }
  }, [])

  const loading = membersLoading || projectsLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading admin dashboard..." />
      </div>
    )
  }

  // Calculate stats
  const stats = {
    totalMembers: members?.length || 0,
    adminCount: members?.filter(m => m.role === 'admin').length || 0,
    totalProjects: projects?.length || 0,
    activeProjects: projects?.filter(p => p.status === 'active').length || 0,
  }

  const recentActivity = [
    { type: 'member_joined', user: 'New Member', detail: 'Profile created', time: '2 hours ago' },
    { type: 'project_created', user: 'Alice Johnson', detail: 'Created new project', time: '1 day ago' },
    { type: 'project_updated', user: 'Bob Smith', detail: 'Updated project status', time: '2 days ago' },
    { type: 'member_updated', user: 'Charlie Brown', detail: 'Updated profile', time: '3 days ago' },
  ]

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
              Manage club members, projects, and system settings.
            </p>
          </div>
          
          <div className="flex space-x-3">
            {!dataLoaded && (
              <Button
                onClick={handleReloadAll}
                variant="primary"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Load Data
              </Button>
            )}

            {dataLoaded && (
              <>
                <Button
                  onClick={handleLoadMembers}
                  variant="secondary"
                  size="sm"
                  disabled={membersLoading}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Reload Members
                </Button>
                <Button
                  onClick={handleLoadProjects}
                  variant="secondary"
                  size="sm"
                  disabled={projectsLoading}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Reload Projects
                </Button>
                <Button
                  onClick={handleReloadAll}
                  variant="primary"
                  size="sm"
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload All
                </Button>
              </>
            )}

            <Button variant="secondary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Activity className="w-4 h-4 mr-2" />
              View Logs
            </Button>
          </div>
        </div>

        {/* Data Loading Notice */}
        {!dataLoaded && (
          <Card className="mb-8 border-primary-blue/20 bg-primary-blue/5">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Admin Dashboard Ready
              </h3>
              <p className="text-text-secondary mb-4">
                To prevent server overload, data is loaded manually. Click "Load Data" to fetch
                the latest members and projects information.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <div className="mt-4 flex items-center text-sm">
                <span className="text-success mr-1">↗</span>
                <span className="text-text-secondary">+2 this month</span>
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
              <div className="mt-4 flex items-center text-sm">
                <span className="text-text-secondary">Stable</span>
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
              <div className="mt-4 flex items-center text-sm">
                <span className="text-success mr-1">↗</span>
                <span className="text-text-secondary">+1 this week</span>
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
              <div className="mt-4 flex items-center text-sm">
                <span className="text-text-secondary">
                  {stats.totalProjects - stats.activeProjects} archived
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="">
                  <Link href="/admin/users">
                    <Button variant="secondary" size="sm" className="mb-2 w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Members
                    </Button>
                  </Link>
                  <Link href="/admin/projects">
                    <Button variant="secondary" size="sm" className="mb-2 w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Manage Projects
                    </Button>
                  </Link>
                  <Link href="/admin/settings">
                    <Button variant="secondary" size="sm" className="mb-2 w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      System Settings
                    </Button>
                  </Link>
                  <Link href="/admin/analytics">
                    <Button variant="secondary" size="sm" className="w-full justify-start">
                      <Activity className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Database</span>
                    <Badge variant="success" size="sm">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Authentication</span>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">File Storage</span>
                    <Badge variant="success" size="sm">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">API Status</span>
                    <Badge variant="success" size="sm">Operational</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 py-4 border-b border-dark-border last:border-b-0">
                      <div className="w-8 h-8 bg-primary-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
                        {activity.type === 'member_joined' && <Users className="w-4 h-4 text-primary-blue" />}
                        {activity.type === 'project_created' && <FileText className="w-4 h-4 text-accent-green" />}
                        {activity.type === 'project_updated' && <Activity className="w-4 h-4 text-accent-cyan" />}
                        {activity.type === 'member_updated' && <Settings className="w-4 h-4 text-warning" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary">
                          {activity.user}
                        </p>
                        <p className="text-sm text-text-secondary truncate">
                          {activity.detail}
                        </p>
                      </div>
                      <div className="text-xs text-text-tertiary">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="ghost" size="sm">
                    View All Activity
                  </Button>
                </div>
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