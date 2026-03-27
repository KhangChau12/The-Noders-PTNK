'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Badge } from '@/components/Badge'
import { Loading } from '@/components/Loading'
import { PlaceholderImage } from '@/components/PlaceholderImage'
import { projectQueries } from '@/lib/queries'
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Search,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Users,
  Calendar,
  Github,
  ExternalLink,
  Archive,
  Play,
  Pause,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  repo_url: string | null
  demo_url: string | null
  status: 'active' | 'archived' | 'in_progress'
  tech_stack: string[] | null
  created_at: string
  updated_at: string
  created_by: string
  contributors: any[]
}

function ProjectManagementPage() {
  const { session } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dataLoaded, setDataLoaded] = useState(false)
  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null)

  // Auto-load data on component mount
  useEffect(() => {
    if (!dataLoaded) {
      fetchProjects()
    }
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use real query function (already optimized with limits)
      const { projects: fetchedProjects, error } = await projectQueries.getProjects({
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
        search: searchTerm || undefined
      })

      if (!error && fetchedProjects) {
        setProjects(fetchedProjects)
        setDataLoaded(true)
        setError(null)
      } else {
        setError(error?.message || 'Failed to fetch projects')
      }
    } catch (err) {
      setError('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    try {
      setUpdatingProjectId(projectId)
      const { project, error } = await projectQueries.updateProject(projectId, {
        status: newStatus,
        updated_at: new Date().toISOString()
      }, session)

      if (!error && project) {
        // Update local state
        setProjects(prev =>
          prev.map(p => p.id === projectId ? { ...p, status: newStatus as any } : p)
        )
      } else {
        alert('Failed to update project: ' + (error?.message || 'Unknown error'))
      }
    } catch (err) {
      alert('Network error occurred')
    } finally {
      setUpdatingProjectId(null)
    }
  }

  const toggleFeatured = async (projectId: string, newFeaturedValue: boolean) => {
    try {
      setUpdatingProjectId(projectId)

      // Check if trying to feature a 4th project
      if (newFeaturedValue) {
        const currentFeaturedCount = projects.filter(p => (p as any).featured && p.id !== projectId).length
        if (currentFeaturedCount >= 3) {
          alert('Maximum 3 projects can be featured on homepage. Please unfeature another project first.')
          return
        }
      }

      const { project, error } = await projectQueries.updateProject(projectId, {
        featured: newFeaturedValue
      }, session)

      if (!error && project) {
        // Update local state
        setProjects(prev =>
          prev.map(p => p.id === projectId ? { ...p, featured: newFeaturedValue } as any : p)
        )
      } else {
        alert('Failed to update featured status: ' + (error?.message || 'Unknown error'))
      }
    } catch (err: any) {
      alert(err?.message || 'Network error occurred')
    } finally {
      setUpdatingProjectId(null)
    }
  }

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      setUpdatingProjectId(projectId)
      const { error } = await projectQueries.deleteProject(projectId, session)

      if (!error) {
        await fetchProjects() // Refresh list
      } else {
        alert('Failed to delete project: ' + (error?.message || 'Unknown error'))
      }
    } catch (err) {
      alert('Network error occurred')
    } finally {
      setUpdatingProjectId(null)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' ||
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'in_progress': return 'warning'
      case 'archived': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3" />
      case 'in_progress': return <Pause className="w-3 h-3" />
      case 'archived': return <Archive className="w-3 h-3" />
      default: return <FileText className="w-3 h-3" />
    }
  }

  if (loading && !dataLoaded) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen flex items-center justify-center">
          <Loading size="lg" text="Loading projects..." />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {/* Back to Dashboard */}
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4 pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Project Management
              </h1>
              <p className="text-text-secondary">
                Monitor and manage club projects
              </p>
            </div>
            <div className="flex gap-3">
              {!dataLoaded && (
                <Button
                  onClick={fetchProjects}
                  variant="primary"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Load Projects
                </Button>
              )}
              {dataLoaded && (
                <Button
                  onClick={fetchProjects}
                  variant="secondary"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
            </div>
          </div>

          {/* Data Loading Notice */}
          {!dataLoaded && !loading && (
            <Card className="mb-8 border-primary-blue/20 bg-primary-blue/5">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Project Management Ready
                </h3>
                <p className="text-text-secondary mb-4">
                  Click "Load Projects" to fetch all club projects for monitoring and management.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          {dataLoaded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="in_progress">In Progress</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}

          {/* Projects List */}
          {dataLoaded && error ? (
            <Card className="text-center py-12">
              <CardContent>
                <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Error Loading Projects
                </h3>
                <p className="text-text-secondary mb-4">{error}</p>
                <Button onClick={fetchProjects}>Retry</Button>
              </CardContent>
            </Card>
          ) : dataLoaded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                // Get thumbnail from either thumbnail_image.public_url or thumbnail_url
                const thumbnailSrc = (project as any).thumbnail_image?.public_url || project.thumbnail_url

                return (
                  <Card key={project.id} className="overflow-hidden">
                    <div className="aspect-video relative bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20">
                      {thumbnailSrc ? (
                        <img
                          src={thumbnailSrc}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                          <span className="text-sm">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                      <Badge variant={getStatusColor(project.status)} size="sm">
                        {getStatusIcon(project.status)}
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-1">
                      {project.title}
                    </h3>

                    {project.description && (
                      <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    {/* Tech Stack */}
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.tech_stack.slice(0, 3).map((tech, index) => (
                          <Badge key={index} variant="tech" size="sm">
                            {tech}
                          </Badge>
                        ))}
                        {project.tech_stack.length > 3 && (
                          <Badge variant="secondary" size="sm">
                            +{project.tech_stack.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Contributors */}
                    <div className="flex items-center text-sm text-text-tertiary mb-4">
                      <Users className="w-4 h-4 mr-1" />
                      {project.contributors?.length || 0} contributors
                      <Calendar className="w-4 h-4 ml-4 mr-1" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>

                    {/* Featured on Homepage */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-dark-surface/50 rounded-lg border border-dark-border">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${(project as any).featured ? 'text-accent-green' : 'text-text-tertiary'}`} />
                        <span className="text-sm text-text-secondary">
                          Featured on Homepage
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(project as any).featured || false}
                          onChange={() => toggleFeatured(project.id, !(project as any).featured)}
                          disabled={updatingProjectId === project.id}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-dark-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-blue rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                      <div className="flex items-center gap-2">
                        {project.repo_url && (
                          <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <Github className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        {project.demo_url && (
                          <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Toggle */}
                        {project.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateProjectStatus(project.id, 'archived')}
                            disabled={updatingProjectId === project.id}
                            title="Archive Project"
                          >
                            {updatingProjectId === project.id ? (
                              <div className="w-4 h-4 border-2 border-text-tertiary/30 border-t-text-tertiary rounded-full animate-spin" />
                            ) : (
                              <Archive className="w-4 h-4" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateProjectStatus(project.id, 'active')}
                            disabled={updatingProjectId === project.id}
                            title="Activate Project"
                          >
                            {updatingProjectId === project.id ? (
                              <div className="w-4 h-4 border-2 border-text-tertiary/30 border-t-text-tertiary rounded-full animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        )}

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProject(project.id)}
                          disabled={updatingProjectId === project.id}
                          className="text-error hover:text-error hover:bg-error/10"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )
              })}

              {filteredProjects.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <FileText className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    No Projects Found
                  </h3>
                  <p className="text-text-secondary">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Try adjusting your search criteria or filters.'
                      : 'No projects have been created yet.'}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default ProjectManagementPage