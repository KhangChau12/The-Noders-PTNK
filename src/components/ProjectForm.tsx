'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Badge } from '@/components/Badge'
import { ClickableBadge } from '@/components/ClickableBadge'
import { RichTextEditor } from '@/components/RichTextEditor'
import { projectQueries } from '@/lib/queries'
import {
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Github,
  ExternalLink,
  Upload,
  Users,
  Trash2
} from 'lucide-react'

interface ProjectFormData {
  title: string
  description: string
  details: string
  thumbnail_url: string
  video_url: string
  repo_url: string
  demo_url: string
  tech_stack: string[]
  contributors: Array<{
    user_id: string
    username: string
    contribution_percentage: number
    role_in_project: string
  }>
}

interface ProjectFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editProject?: any // For edit mode
  mode?: 'create' | 'edit'
  inline?: boolean // For inline display without modal overlay
}

const POPULAR_TECH = [
  'React', 'Next.js', 'TypeScript', 'Python', 'Node.js',
  'TensorFlow', 'PyTorch', 'FastAPI', 'PostgreSQL', 'MongoDB',
  'Docker', 'AWS', 'Vercel', 'Tailwind CSS', 'JavaScript'
]

const PROJECT_ROLES = [
  'Creator', 'Lead Developer', 'Frontend Developer', 'Backend Developer',
  'Designer', 'Data Scientist', 'DevOps Engineer', 'Product Manager',
  'Contributor', 'Tester', 'Documentation'
]

export function ProjectForm({ isOpen, onClose, onSuccess, editProject, mode = 'create', inline = false }: ProjectFormProps) {
  const { session } = useAuth()

  const getInitialFormData = (): ProjectFormData => ({
    title: '',
    description: '',
    details: '',
    thumbnail_url: '',
    video_url: '',
    repo_url: '',
    demo_url: '',
    tech_stack: [],
    contributors: []
  })

  const [formData, setFormData] = useState<ProjectFormData>(getInitialFormData())

  // Load project data when editProject changes
  useEffect(() => {
    if (editProject && mode === 'edit') {
      setFormData({
        title: editProject.title || '',
        description: editProject.description || '',
        details: editProject.details || '',
        thumbnail_url: editProject.thumbnail_url || '',
        video_url: editProject.video_url || '',
        repo_url: editProject.repo_url || '',
        demo_url: editProject.demo_url || '',
        tech_stack: editProject.tech_stack || [],
        contributors: editProject.project_contributors?.map((c: any) => ({
          user_id: c.profiles.id,
          username: c.profiles.username,
          contribution_percentage: c.contribution_percentage,
          role_in_project: c.role_in_project
        })) || []
      })
    } else if (mode === 'create') {
      setFormData(getInitialFormData())
    }
  }, [editProject, mode])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      setError(null)
      setSuccess(false)
      if (mode === 'create') {
        setFormData(getInitialFormData())
      }
    }
  }, [isOpen, mode])

  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [newTech, setNewTech] = useState('')
  const [newContributor, setNewContributor] = useState({
    username: '',
    contribution_percentage: 0,
    role_in_project: 'Contributor'
  })

  const steps = [
    { title: 'Basic Info', description: 'Project details and description' },
    { title: 'Links & Media', description: 'Repository, demo, and images' },
    { title: 'Tech Stack', description: 'Technologies used' },
    { title: 'Contributors', description: 'Team members and roles' },
    { title: 'Review', description: 'Review and submit' }
  ]

  const handleChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.title.trim() && formData.description.trim())
      case 1:
        // URLs are optional, but if provided, they should be valid
        const urls = [formData.repo_url, formData.demo_url, formData.thumbnail_url, formData.video_url]
        return urls.every(url => {
          if (!url.trim()) return true // Empty is OK
          try {
            new URL(url)
            return true
          } catch {
            return false
          }
        })
      case 2:
        return true // Tech stack is optional
      case 3:
        // Check that total contribution doesn't exceed 100%
        const totalContribution = formData.contributors.reduce((sum, c) => sum + c.contribution_percentage, 0)
        return totalContribution <= 100
      default:
        return true
    }
  }

  const addTech = () => {
    const tech = newTech.trim()
    if (tech && !formData.tech_stack.includes(tech)) {
      handleChange('tech_stack', [...formData.tech_stack, tech])
      setNewTech('')
    }
  }

  const removeTech = (techToRemove: string) => {
    handleChange('tech_stack', formData.tech_stack.filter(tech => tech !== techToRemove))
  }

  const addPopularTech = (tech: string) => {
    if (!formData.tech_stack.includes(tech)) {
      handleChange('tech_stack', [...formData.tech_stack, tech])
    }
  }

  const addContributor = () => {
    if (newContributor.username.trim() && newContributor.contribution_percentage >= 0) {
      // In a real app, you'd search for users by username
      const contributor = {
        user_id: 'temp-' + Date.now(), // Temporary ID
        username: newContributor.username,
        contribution_percentage: newContributor.contribution_percentage,
        role_in_project: newContributor.role_in_project
      }

      handleChange('contributors', [...formData.contributors, contributor])
      setNewContributor({
        username: '',
        contribution_percentage: 0,
        role_in_project: 'Contributor'
      })
    }
  }

  const removeContributor = (index: number) => {
    const newContributors = formData.contributors.filter((_, i) => i !== index)
    handleChange('contributors', newContributors)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      const projectData = {
        ...formData,
        // Remove empty URLs
        thumbnail_url: formData.thumbnail_url.trim() || null,
        video_url: formData.video_url.trim() || null,
        repo_url: formData.repo_url.trim() || null,
        demo_url: formData.demo_url.trim() || null,
        // For this demo, we'll skip the contributors API integration
        contributors: []
      }

      let result
      if (mode === 'edit' && editProject) {
        result = await projectQueries.updateProject(editProject.id, projectData, session)
      } else {
        result = await projectQueries.createProject(projectData, session)
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
          setSuccess(false)
          // Reset form
          setFormData(getInitialFormData())
          setCurrentStep(0)
        }, 2000)
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
      setError(null)
    } else {
      setError('Please complete all required fields before continuing')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
    setError(null)
  }


  if (!isOpen) return null

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Project Title *
              </label>
              <Input
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="My Awesome AI Project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the project..."
                rows={3}
                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Project Details
              </label>
              <RichTextEditor
                value={formData.details}
                onChange={(value) => handleChange('details', value)}
                placeholder="Write detailed information about your project using formatting tools to highlight content..."
                className="w-full"
              />
              <p className="text-xs text-text-tertiary mt-1">
                Use the toolbar to format text: bold, italic, headings, colors, lists...
              </p>
            </div>
          </div>
        )

      case 1: // Links & Media
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                <Github className="w-4 h-4 inline mr-1" />
                Repository URL
              </label>
              <Input
                type="url"
                value={formData.repo_url}
                onChange={(e) => handleChange('repo_url', e.target.value)}
                placeholder="https://github.com/username/project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                <ExternalLink className="w-4 h-4 inline mr-1" />
                Demo URL
              </label>
              <Input
                type="url"
                value={formData.demo_url}
                onChange={(e) => handleChange('demo_url', e.target.value)}
                placeholder="https://myproject.vercel.app"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                <Upload className="w-4 h-4 inline mr-1" />
                Thumbnail Image URL
              </label>
              <Input
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => handleChange('thumbnail_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Video Demo URL
              </label>
              <Input
                type="url"
                value={formData.video_url}
                onChange={(e) => handleChange('video_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>
        )

      case 2: // Tech Stack
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Add Technology
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter technology name"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addTech}
                  variant="secondary"
                  size="sm"
                >
                  Add
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Popular Technologies
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TECH.map((tech) => (
                  <ClickableBadge
                    key={tech}
                    variant={formData.tech_stack.includes(tech) ? 'primary' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => addPopularTech(tech)}
                  >
                    {tech}
                  </ClickableBadge>
                ))}
              </div>
            </div>

            {formData.tech_stack.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Selected Technologies
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.tech_stack.map((tech, index) => (
                    <ClickableBadge
                      key={index}
                      variant="tech"
                      className="flex items-center gap-1"
                      onClick={() => removeTech(tech)}
                    >
                      {tech}
                      <X className="w-3 h-3" />
                    </ClickableBadge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 3: // Contributors
        return (
          <div className="space-y-6">
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-warning">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Note: Contributor management is simplified for this demo.
                In production, you would search and invite real users.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Username"
                value={newContributor.username}
                onChange={(e) => setNewContributor(prev => ({ ...prev, username: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Contribution %"
                min="0"
                max="100"
                value={newContributor.contribution_percentage}
                onChange={(e) => setNewContributor(prev => ({ ...prev, contribution_percentage: parseInt(e.target.value) || 0 }))}
              />
              <div className="flex gap-2">
                <select
                  value={newContributor.role_in_project}
                  onChange={(e) => setNewContributor(prev => ({ ...prev, role_in_project: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
                >
                  {PROJECT_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={addContributor}
                  variant="secondary"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {formData.contributors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Contributors ({formData.contributors.reduce((sum, c) => sum + c.contribution_percentage, 0)}% total)
                </label>
                <div className="space-y-2">
                  {formData.contributors.map((contributor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-dark-surface rounded-lg">
                      <div>
                        <span className="font-medium text-text-primary">@{contributor.username}</span>
                        <span className="text-text-secondary ml-2">• {contributor.role_in_project}</span>
                        <Badge variant="primary" size="sm" className="ml-2">
                          {contributor.contribution_percentage}%
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContributor(index)}
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 4: // Review
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">{formData.title}</h3>
              <p className="text-text-secondary">{formData.description}</p>
              {formData.details && (
                <div className="mt-4">
                  <h4 className="font-medium text-text-primary mb-3">Project Details</h4>
                  <div
                    className="text-text-secondary prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.details }}
                  />
                </div>
              )}
            </div>

            {(formData.repo_url || formData.demo_url) && (
              <div>
                <h4 className="font-medium text-text-primary mb-3">Links</h4>
                <div className="space-y-1">
                  {formData.repo_url && <p className="text-sm text-text-secondary">Repository: {formData.repo_url}</p>}
                  {formData.demo_url && <p className="text-sm text-text-secondary">Demo: {formData.demo_url}</p>}
                </div>
              </div>
            )}

            {formData.tech_stack.length > 0 && (
              <div>
                <h4 className="font-medium text-text-primary mb-3">Technology Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.tech_stack.map((tech, index) => (
                    <Badge key={index} variant="tech">{tech}</Badge>
                  ))}
                </div>
              </div>
            )}

            {formData.contributors.length > 0 && (
              <div>
                <h4 className="font-medium text-text-primary mb-3">Contributors</h4>
                <div className="space-y-1">
                  {formData.contributors.map((contributor, index) => (
                    <p key={index} className="text-sm text-text-secondary">
                      @{contributor.username} - {contributor.role_in_project} ({contributor.contribution_percentage}%)
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={inline ? "" : "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"}>
      <Card className={inline ? "w-full shadow-xl border-dark-border/50" : "w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-dark-border/50"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {mode === 'edit' ? 'Edit Project' : 'Create New Project'}
            </CardTitle>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mt-8 mb-8 px-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1 px-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 shadow-md ${
                    index === currentStep
                      ? 'bg-gradient-to-r from-primary-blue to-accent-blue text-white scale-110 shadow-primary-blue/30'
                      : index < currentStep
                      ? 'bg-gradient-to-r from-accent-green to-emerald-500 text-white shadow-accent-green/30'
                      : 'bg-dark-surface border border-dark-border text-text-tertiary hover:border-primary-blue/30 hover:text-text-secondary'
                  }`}>
                    {index < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className="text-center mt-3 max-w-[120px]">
                    <div className={`font-medium text-sm leading-tight ${
                      index === currentStep
                        ? 'text-primary-blue'
                        : index < currentStep
                        ? 'text-accent-green'
                        : 'text-text-tertiary'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-text-tertiary text-xs mt-1.5 leading-relaxed">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-px flex-1 mx-6 transition-all duration-300 ${
                    index < currentStep ? 'bg-gradient-to-r from-accent-green to-emerald-500' : 'bg-dark-border'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 mb-3">
            <h3 className="font-semibold text-lg text-text-primary mb-3">{steps[currentStep].title}</h3>
            <p className="text-sm text-text-secondary">{steps[currentStep].description}</p>
          </div>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {mode === 'edit' ? 'Project Updated!' : 'Project Created!'}
              </h3>
              <p className="text-text-secondary">
                {mode === 'edit'
                  ? 'Your project has been updated successfully.'
                  : 'Your project has been created and is now visible to the community.'
                }
              </p>
            </div>
          ) : (
            <>
              {renderStepContent()}

              {error && (
                <div className="mt-6 p-4 bg-error/20 border border-error/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-error mb-1">Error</h4>
                      <p className="text-sm text-error">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-10 pt-6 border-t border-dark-border/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`${currentStep === 0 ? 'invisible' : 'visible'} transition-all duration-200`}
                >
                  <span className="mr-2">←</span> Previous
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="border-dark-border hover:border-text-tertiary"
                  >
                    Cancel
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateStep(currentStep)}
                      className="bg-gradient-to-r from-primary-blue to-accent-blue hover:from-primary-blue/90 hover:to-accent-blue/90 shadow-lg shadow-primary-blue/25"
                    >
                      Next <span className="ml-2">→</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading || !validateStep(currentStep)}
                      className="bg-gradient-to-r from-accent-green to-emerald-500 hover:from-accent-green/90 hover:to-emerald-500/90 shadow-lg shadow-accent-green/25 min-w-[140px]"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          {mode === 'edit' ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {mode === 'edit' ? 'Update Project' : 'Create Project'}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}