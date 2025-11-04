'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useProject } from '@/lib/hooks'
import { Card, CardContent, CardHeader } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { Avatar } from '@/components/Avatar'
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Play,
  Users,
  Calendar,
  Code,
  Target,
  Award,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Info
} from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  title: string
}

function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  if (!images || images.length === 0) return null

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-text-primary">Project Gallery</h3>

      {/* Main Image */}
      <div className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
           onClick={() => setShowLightbox(true)}>
        <Image
          src={images[currentImage]}
          alt={`${title} screenshot ${currentImage + 1}`}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`relative flex-shrink-0 w-20 h-12 rounded overflow-hidden border-2 transition-colors ${
                currentImage === index ? 'border-primary-blue' : 'border-transparent'
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-text-secondary"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative max-w-4xl max-h-[80vh] mx-4">
            <Image
              src={images[currentImage]}
              alt={`${title} screenshot ${currentImage + 1}`}
              width={1200}
              height={675}
              className="object-contain max-h-[80vh] w-auto"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-text-secondary"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-text-secondary"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface VideoPlayerProps {
  videoUrl?: string | null
  title: string
}

function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  if (!videoUrl) return null

  // Extract video ID for YouTube
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url
  }

  const embedUrl = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
    ? getYouTubeEmbedUrl(videoUrl)
    : videoUrl

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
        <Play className="w-5 h-5" />
        Demo Video
      </h3>
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          title={`${title} - Demo Video`}
          className="w-full h-full"
          allowFullScreen
        />
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const { project, loading, error } = useProject(projectId)

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Loading />
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4 opacity-50">🔍</div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Project Not Found
              </h2>
              <p className="text-text-secondary mb-6">
                The project you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push('/projects')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { label: 'Active', className: 'bg-green-500/20 text-green-400 border border-green-400/30' }
      case 'completed':
        return { label: 'Completed', className: 'bg-blue-500/20 text-blue-400 border border-blue-400/30' }
      case 'archived':
        return { label: 'Archived', className: 'bg-gray-500/20 text-gray-400 border border-gray-400/30' }
      default:
        return { label: 'Active', className: 'bg-green-500/20 text-green-400 border border-green-400/30' }
    }
  }

  const statusConfig = getStatusConfig(project.status)

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto relative z-10">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center text-text-secondary hover:text-primary-blue transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Projects
          </Link>
        </div>

        {/* Enhanced Project Header */}
        <div className="mb-12 relative">
          {/* Gradient background card */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-dark-border/50 bg-gradient-to-br from-dark-surface via-dark-surface/90 to-dark-bg p-8 md:p-12">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary-blue to-transparent" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-blue/20 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-text-primary via-primary-blue to-text-primary bg-clip-text text-transparent">
                      {project.title}
                    </h1>
                    <div className={`px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-md ${statusConfig.className} shadow-lg`}>
                      {statusConfig.label}
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-lg text-text-secondary leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Enhanced Project Links */}
              <div className="flex flex-wrap gap-4">
                {project.repo_url && (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      className="bg-dark-bg border-2 border-primary-blue/30 hover:border-primary-blue/60 hover:bg-primary-blue/10 transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <Github className="w-5 h-5 mr-2" />
                      View Code
                    </Button>
                  </a>
                )}
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-primary-blue to-accent-cyan hover:from-primary-blue/90 hover:to-accent-cyan/90 shadow-lg shadow-primary-blue/30 hover:shadow-xl hover:shadow-primary-blue/40 transition-all duration-300 hover:scale-105"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Use Product
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Demo */}
            <VideoPlayer videoUrl={project.video_url} title={project.title} />

            {/* Enhanced Tech Stack */}
            {project.tech_stack && project.tech_stack.length > 0 && (
              <Card className="border-2 border-dark-border hover:border-primary-blue/30 transition-all duration-300">
                <CardHeader>
                  <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 rounded-lg">
                      <Code className="w-5 h-5 text-primary-blue" />
                    </div>
                    Technology Stack
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {project.tech_stack.map((tech, index) => {
                      const techColors: Record<string, string> = {
                        'React': '#61DAFB',
                        'Next.js': '#000000',
                        'TypeScript': '#3178C6',
                        'JavaScript': '#F7DF1E',
                        'Python': '#3776AB',
                        'TensorFlow': '#FF6F00',
                        'PyTorch': '#EE4C2C',
                        'Node.js': '#339933',
                        'Tailwind CSS': '#06B6D4',
                        'Supabase': '#3ECF8E',
                      }
                      const techColor = techColors[tech] || '#6B7280'

                      return (
                        <div
                          key={index}
                          className="relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-default group"
                          style={{
                            backgroundColor: `${techColor}20`,
                            color: techColor,
                            boxShadow: `0 0 0 1px ${techColor}30`,
                          }}
                        >
                          <div
                            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              boxShadow: `0 0 30px ${techColor}50`,
                            }}
                          />
                          <span className="relative z-10">{tech}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Details */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Project Details
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                {project.details ? (
                  <div
                    className="prose prose-invert max-w-none text-text-secondary"
                    dangerouslySetInnerHTML={{ __html: project.details }}
                    style={{
                      color: 'rgb(156 163 175)'
                    }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-text-tertiary">
                      No project details available. Please edit the project to add detailed information.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card className="border-2 border-dark-border hover:border-primary-blue/30 transition-all duration-300">
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 rounded-lg">
                    <Info className="w-4 h-4 text-primary-blue" />
                  </div>
                  Project Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-surface/30 border border-dark-border/50 hover:border-primary-blue/30 transition-all duration-300 group">
                  <div className="p-2 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-4 h-4 text-primary-blue" />
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary font-medium">Created</p>
                    <p className="text-sm text-text-primary font-semibold">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-surface/30 border border-dark-border/50 hover:border-primary-blue/30 transition-all duration-300 group">
                  <div className="p-2 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-4 h-4 text-primary-blue" />
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary font-medium">Status</p>
                    <div className={`mt-1 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${statusConfig.className} shadow-md`}>
                      {statusConfig.label}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-surface/30 border border-dark-border/50 hover:border-primary-blue/30 transition-all duration-300 group">
                  <div className="p-2 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-4 h-4 text-primary-blue" />
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary font-medium">Team Size</p>
                    <p className="text-sm text-text-primary font-semibold">
                      {project.contributors?.length || 0} contributors
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Contributors */}
            {project.contributors && project.contributors.length > 0 && (
              <Card className="border-2 border-dark-border hover:border-primary-blue/30 transition-all duration-300">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 rounded-lg">
                      <Users className="w-4 h-4 text-primary-blue" />
                    </div>
                    Contributors
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.contributors.map((contributor) => {
                    const profile = contributor.profiles

                    return (
                      <Link
                        key={contributor.id}
                        href={`/members/${profile?.username}`}
                        className="group flex items-center gap-4 p-4 rounded-xl hover:bg-dark-surface/50 transition-all duration-300 border border-transparent hover:border-primary-blue/30 hover:shadow-lg"
                      >
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-br from-primary-blue to-accent-cyan rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
                          <div className="relative">
                            <Avatar
                              name={profile?.full_name}
                              src={profile?.avatar_url}
                              size="md"
                            />
                            {profile?.role === 'admin' && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-primary-blue to-accent-cyan rounded-full flex items-center justify-center shadow-lg">
                                <Award className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-text-primary text-sm group-hover:text-primary-blue transition-colors">
                            {profile?.full_name || profile?.username}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex-1 max-w-[120px] bg-dark-border rounded-full h-2 overflow-hidden">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-primary-blue to-accent-cyan transition-all duration-500 shadow-lg"
                                style={{
                                  width: `${contributor.contribution_percentage}%`,
                                  boxShadow: `0 0 10px rgba(59, 130, 246, 0.5)`,
                                }}
                              />
                            </div>
                            <p className="text-xs font-semibold text-primary-blue">
                              {contributor.contribution_percentage}%
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {/* Related Projects */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">Related Projects</h3>
              </CardHeader>
              <CardContent>
                <Link
                  href="/projects"
                  className="block text-center py-4 text-text-secondary hover:text-primary-blue transition-colors"
                >
                  View All Projects →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}