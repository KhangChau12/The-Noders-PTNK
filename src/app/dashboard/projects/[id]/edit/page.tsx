'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { Loading } from '@/components/Loading'
import { ProjectForm } from '@/components/ProjectForm'
import { projectQueries } from '@/lib/queries'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { user, session } = useAuth()
  const projectId = params.id as string

  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!projectId || !user?.id) {
      return
    }

    async function loadProject() {
      try {
        setLoading(true)
        setError(null)

        const { project, error } = await projectQueries.getProject(projectId)

        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }

        if (!project) {
          setError('Project not found')
          setLoading(false)
          return
        }

        // Check if user can edit this project
        const canEdit = project.created_by === user?.id ||
          project.project_contributors?.some((c: any) => c.profiles.id === user?.id)

        if (!canEdit) {
          setError('You do not have permission to edit this project')
          setLoading(false)
          return
        }

        setProject(project)
        setLoading(false)
      } catch (err) {
        setError('Failed to load project')
        setLoading(false)
      }
    }

    loadProject()
  }, [projectId, user?.id])

  const handleSuccess = () => {
    router.push('/dashboard/projects')
  }

  const handleClose = () => {
    router.push('/dashboard/projects')
  }

  // Memoize project data to prevent unnecessary re-renders
  const memoizedProject = useMemo(() => project, [project])


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading project..." />
      </div>
    )
  }


  // Bypass ProtectedRoute temporarily for this page
  if (!user) {
    router.push('/login')
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl">
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Cannot Edit Project
              </h1>
              <p className="text-text-secondary mb-6">{error}</p>
              <Button onClick={() => router.push('/dashboard/projects')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/projects')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <h1 className="text-3xl font-bold text-text-primary">
            Edit Project: {project?.title}
          </h1>
        </div>

        {memoizedProject && (
          <ProjectForm
            isOpen={true}
            onClose={handleClose}
            onSuccess={handleSuccess}
            editProject={memoizedProject}
            mode="edit"
            inline={true}
          />
        )}
      </div>
    </div>
  )
}