'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Loading } from '@/components/Loading'
import {
  TrendingUp,
  Users,
  FileText,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Filter,
  Clock,
  Target,
  Zap,
  Award,
  GitBranch
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalMembers: number
    activeProjects: number
    monthlyGrowth: number
    engagement: number
  }
  memberStats: {
    newMembersThisMonth: number
    memberGrowthRate: number
    activeMembers: number
    topSkills: Array<{ name: string; count: number }>
  }
  projectStats: {
    completedProjects: number
    inProgressProjects: number
    averageProjectDuration: number
    popularTechnologies: Array<{ name: string; count: number }>
  }
  activityData: Array<{
    date: string
    members: number
    projects: number
    activities: number
  }>
  timeRange: '7d' | '30d' | '90d' | '1y'
}

function ViewAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // Auto-load data on component mount
  useEffect(() => {
    if (!dataLoaded) {
      loadAnalytics()
    }
  }, [])

  // Mock analytics data
  const generateMockData = (): AnalyticsData => ({
    overview: {
      totalMembers: 87,
      activeProjects: 12,
      monthlyGrowth: 23.5,
      engagement: 78.2
    },
    memberStats: {
      newMembersThisMonth: 8,
      memberGrowthRate: 15.3,
      activeMembers: 64,
      topSkills: [
        { name: 'Python', count: 45 },
        { name: 'JavaScript', count: 38 },
        { name: 'Machine Learning', count: 32 },
        { name: 'React', count: 28 },
        { name: 'Node.js', count: 24 }
      ]
    },
    projectStats: {
      completedProjects: 18,
      inProgressProjects: 12,
      averageProjectDuration: 45,
      popularTechnologies: [
        { name: 'Python', count: 15 },
        { name: 'TensorFlow', count: 8 },
        { name: 'React', count: 7 },
        { name: 'PyTorch', count: 6 },
        { name: 'FastAPI', count: 5 }
      ]
    },
    activityData: [
      { date: '2024-01-01', members: 75, projects: 10, activities: 45 },
      { date: '2024-01-02', members: 76, projects: 10, activities: 52 },
      { date: '2024-01-03', members: 77, projects: 11, activities: 38 },
      { date: '2024-01-04', members: 79, projects: 11, activities: 64 },
      { date: '2024-01-05', members: 81, projects: 12, activities: 71 },
      { date: '2024-01-06', members: 83, projects: 12, activities: 58 },
      { date: '2024-01-07', members: 87, projects: 12, activities: 67 }
    ],
    timeRange
  })

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Quick analytics load for demo
      await new Promise(resolve => setTimeout(resolve, 400))

      const data = generateMockData()
      setAnalyticsData(data)
      setDataLoaded(true)
    } catch (err) {
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    // Mock export functionality
    const dataStr = JSON.stringify(analyticsData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ]

  if (loading && !dataLoaded) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen flex items-center justify-center">
          <Loading size="lg" text="Loading analytics..." />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-text-secondary">
                Insights and metrics for your club's performance
              </p>
            </div>
            <div className="flex gap-3">
              {!dataLoaded && (
                <Button
                  onClick={loadAnalytics}
                  variant="primary"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Load Analytics
                </Button>
              )}
              {dataLoaded && (
                <>
                  <Button
                    onClick={loadAnalytics}
                    variant="secondary"
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    onClick={exportData}
                    variant="secondary"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Data Loading Notice */}
          {!dataLoaded && !loading && (
            <Card className="mb-8 border-primary-blue/20 bg-primary-blue/5">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Analytics Dashboard Ready
                </h3>
                <p className="text-text-secondary mb-4">
                  Click "Load Analytics" to view detailed insights about your club's activity and growth.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Analytics Content */}
          {dataLoaded && analyticsData && (
            <>
              {/* Time Range Filter */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm font-medium text-text-primary">Time Range:</span>
                  </div>
                  <div className="flex gap-2">
                    {timeRangeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTimeRange(option.value as any)}
                        className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                          timeRange === option.value
                            ? 'border-primary-blue bg-primary-blue/10 text-primary-blue'
                            : 'border-dark-border text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-text-secondary text-sm font-medium">Total Members</p>
                        <p className="text-2xl font-bold text-text-primary">{analyticsData.overview.totalMembers}</p>
                      </div>
                      <div className="p-3 bg-primary-blue/20 rounded-full">
                        <Users className="w-6 h-6 text-primary-blue" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-success mr-1">↗</span>
                      <span className="text-text-secondary">+{analyticsData.memberStats.newMembersThisMonth} this month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-text-secondary text-sm font-medium">Active Projects</p>
                        <p className="text-2xl font-bold text-text-primary">{analyticsData.overview.activeProjects}</p>
                      </div>
                      <div className="p-3 bg-accent-cyan/20 rounded-full">
                        <FileText className="w-6 h-6 text-accent-cyan" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-text-secondary">
                        {analyticsData.projectStats.completedProjects} completed
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-text-secondary text-sm font-medium">Growth Rate</p>
                        <p className="text-2xl font-bold text-text-primary">{analyticsData.overview.monthlyGrowth}%</p>
                      </div>
                      <div className="p-3 bg-success/20 rounded-full">
                        <TrendingUp className="w-6 h-6 text-success" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-success mr-1">↗</span>
                      <span className="text-text-secondary">Monthly growth</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-text-secondary text-sm font-medium">Engagement</p>
                        <p className="text-2xl font-bold text-text-primary">{analyticsData.overview.engagement}%</p>
                      </div>
                      <div className="p-3 bg-warning/20 rounded-full">
                        <Activity className="w-6 h-6 text-warning" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-text-secondary">
                        {analyticsData.memberStats.activeMembers} active members
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Member Growth Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="w-5 h-5" />
                      Member Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-dark-surface/50 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                        <p className="text-text-secondary">Chart visualization would be here</p>
                        <p className="text-sm text-text-tertiary">
                          Growth from {analyticsData.activityData[0]?.members} to {analyticsData.activityData[analyticsData.activityData.length - 1]?.members} members
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Activity Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Project Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-dark-surface/50 rounded-lg">
                      <div className="text-center">
                        <PieChart className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                        <p className="text-text-secondary">Pie chart would be here</p>
                        <div className="mt-4 flex justify-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-success rounded-full"></div>
                            <span className="text-sm text-text-secondary">
                              Completed ({analyticsData.projectStats.completedProjects})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-warning rounded-full"></div>
                            <span className="text-sm text-text-secondary">
                              In Progress ({analyticsData.projectStats.inProgressProjects})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Skills and Technologies */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Top Member Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.memberStats.topSkills.map((skill, index) => (
                        <div key={skill.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-blue/20 rounded-full flex items-center justify-center text-sm font-medium text-primary-blue">
                              {index + 1}
                            </div>
                            <span className="font-medium text-text-primary">{skill.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-dark-surface rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-blue rounded-full"
                                style={{ width: `${(skill.count / analyticsData.memberStats.topSkills[0].count) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-text-secondary w-8 text-right">{skill.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Technologies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="w-5 h-5" />
                      Popular Technologies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.projectStats.popularTechnologies.map((tech, index) => (
                        <div key={tech.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-accent-cyan/20 rounded-full flex items-center justify-center text-sm font-medium text-accent-cyan">
                              {index + 1}
                            </div>
                            <span className="font-medium text-text-primary">{tech.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-dark-surface rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent-cyan rounded-full"
                                style={{ width: `${(tech.count / analyticsData.projectStats.popularTechnologies[0].count) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-text-secondary w-8 text-right">{tech.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {error && (
            <Card className="text-center py-12">
              <CardContent>
                <TrendingUp className="w-16 h-16 text-error mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Error Loading Analytics
                </h3>
                <p className="text-text-secondary mb-4">{error}</p>
                <Button onClick={loadAnalytics}>Retry</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default ViewAnalyticsPage