'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Loading } from '@/components/Loading'
import { PlaceholderImage } from '@/components/PlaceholderImage'
import { ProjectForm } from '@/components/ProjectForm'
import { projectQueries } from '@/lib/queries'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Github,
  Users,
  Calendar,
  Settings,
  AlertCircle,
  Eye,
  Archive,
  Star
} from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  video_url: string | null
  repo_url: string | null
  demo_url: string | null
  tech_stack: string[] | null
  status: 'active' | 'archived'
  created_by: string
  created_at: string
  project_contributors?: any[]
  user_contribution?: {
    contribution_percentage: number
    role_in_project: string
  }
}

function MemberProjectsPage() {
  const { user, session } = useAuth()
  const [createdProjects, setCreatedProjects] = useState<Project[]>([])
  const [contributedProjects, setContributedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'created' | 'contributed'>('created')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchUserProjects()
    }
  }, [user?.id]) // Only depend on user.id to avoid unnecessary re-renders

  const fetchUserProjects = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('Fetching projects for user:', user.id)
      const { createdProjects, contributedProjects, error } = await projectQueries.getUserProjects(user.id)

      if (error) {
        console.error('Error loading user projects:', error)
        setError(error.message)
        setCreatedProjects([])
        setContributedProjects([])
      } else {
        setCreatedProjects(createdProjects || [])
        setContributedProjects(contributedProjects || [])
      }
    } catch (err) {
      console.error('Exception in fetchUserProjects:', err)
      setError('Failed to load projects')
      setCreatedProjects([])
      setContributedProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingProjectId(projectId)

      const { error } = await projectQueries.deleteProject(projectId, session)

      if (error) {
        alert('Failed to delete project: ' + error.message)
      } else {
        await fetchUserProjects() // Refresh the list
      }
    } catch (err) {
      alert('Network error occurred')
    } finally {
      setDeletingProjectId(null)
    }
  }

  const ProjectCard = ({ project, isOwner = false }: { project: Project, isOwner?: boolean }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
        <PlaceholderImage
          src={project.thumbnail_url}
          alt={project.title}
          fill
          text="No Image"
          bgColor="#334155"
          textColor="#CBD5E1"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={project.status === 'active' ? 'success' : 'secondary'} size="sm">
            {project.status}
          </Badge>
        </div>
        {!isOwner && project.user_contribution && (
          <div className="absolute top-3 right-3">
            <Badge variant="primary" size="sm">
              {project.user_contribution.contribution_percentage}%
            </Badge>
          </div>
        )}
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

        {/* Role badge for contributed projects */}
        {!isOwner && project.user_contribution && (
          <div className="mb-3">
            <Badge variant="tech" size="sm">
              {project.user_contribution.role_in_project}
            </Badge>
          </div>
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

        {/* Contributors info */}
        <div className="flex items-center text-sm text-text-tertiary mb-4">
          <Users className="w-4 h-4 mr-1" />
          {project.project_contributors?.length || 0} contributors
          <Calendar className="w-4 h-4 ml-4 mr-1" />
          {new Date(project.created_at).toLocaleDateString()}
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
            <a href={`/projects/${project.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </a>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2">
              <a href={`/dashboard/projects/${project.id}/edit`}>
                <Button
                  variant="ghost"
                  size="sm"
                  title="Edit Project"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteProject(project.id)}
                disabled={deletingProjectId === project.id}
                className="text-error hover:text-error hover:bg-error/10"
                title="Delete Project"
              >
                {deletingProjectId === project.id ? (
                  <div className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loading size="lg" text="Loading your projects..." />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                My Projects
              </h1>
              <p className="text-text-secondary">
                Manage your projects and collaborations
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary-blue mb-1">
                  {createdProjects.length}
                </div>
                <div className="text-sm text-text-secondary">
                  Projects Created
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-accent-green mb-1">
                  {contributedProjects.length}
                </div>
                <div className="text-sm text-text-secondary">
                  Contributing To
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-accent-cyan mb-1">
                  {createdProjects.filter(p => p.status === 'active').length}
                </div>
                <div className="text-sm text-text-secondary">
                  Active Projects
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1 mb-6 bg-dark-surface rounded-lg p-1">
            <button
              onClick={() => setActiveTab('created')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'created'
                  ? 'bg-primary-blue text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Created Projects ({createdProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('contributed')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'contributed'
                  ? 'bg-primary-blue text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Contributing To ({contributedProjects.length})
            </button>
          </div>

          {/* Error State */}
          {error && (
            <Card className="text-center py-12 mb-6">
              <CardContent>
                <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Error Loading Projects
                </h3>
                <p className="text-text-secondary mb-4">{error}</p>
                <Button onClick={fetchUserProjects}>Retry</Button>
              </CardContent>
            </Card>
          )}

          {/* Projects Grid */}
          {activeTab === 'created' && (
            <div>
              {createdProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {createdProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isOwner={true}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="text-6xl mb-4 opacity-50">📁</div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      No Projects Created Yet
                    </h3>
                    <p className="text-text-secondary mb-4">
                      Start your first project and share it with the community.
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Project
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'contributed' && (
            <div>
              {contributedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contributedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isOwner={false}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="text-6xl mb-4 opacity-50">🤝</div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      No Collaborations Yet
                    </h3>
                    <p className="text-text-secondary mb-4">
                      Join existing projects and collaborate with other members.
                    </p>
                    <a href="/projects">
                      <Button>
                        <FileText className="w-4 h-4 mr-2" />
                        Browse Projects
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Project Forms */}
          <ProjectForm
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={fetchUserProjects}
            mode="create"
          />

          <ProjectForm
            isOpen={!!editingProject}
            onClose={() => setEditingProject(null)}
            onSuccess={fetchUserProjects}
            editProject={editingProject}
            mode="edit"
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default MemberProjectsPage