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
  X
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

  // Mock gallery images (in real app, this would come from database)
  const galleryImages = project.thumbnail_url ? [project.thumbnail_url] : []

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center text-text-secondary hover:text-primary-blue transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>

        {/* Project Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
                  {project.title}
                </h1>
                <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>

              {project.description && (
                <p className="text-lg text-text-secondary">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Project Links */}
          <div className="flex flex-wrap gap-4">
            {project.repo_url && (
              <Button asChild variant="secondary">
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  View Code
                </a>
              </Button>
            )}
            {project.video_url && (
              <Button asChild variant="secondary">
                <a
                  href={project.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Watch Demo
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Demo */}
            <VideoPlayer videoUrl={project.video_url} title={project.title} />

            {/* Image Gallery */}
            <ImageGallery images={galleryImages} title={project.title} />

            {/* Tech Stack */}
            {project.tech_stack && project.tech_stack.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Technology Stack
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech, index) => (
                      <Badge key={index} variant="tech" size="lg">
                        {tech}
                      </Badge>
                    ))}
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
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">Project Information</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-text-tertiary" />
                  <div>
                    <p className="text-sm text-text-tertiary">Created</p>
                    <p className="text-sm text-text-secondary">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-text-tertiary" />
                  <div>
                    <p className="text-sm text-text-tertiary">Status</p>
                    <Badge variant={project.status === 'active' ? 'success' : 'secondary'} size="sm">
                      {project.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-text-tertiary" />
                  <div>
                    <p className="text-sm text-text-tertiary">Team Size</p>
                    <p className="text-sm text-text-secondary">
                      {project.contributors?.length || 0} contributors
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contributors */}
            {project.contributors && project.contributors.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Contributors
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.contributors.map((contributor) => {
                    const profile = contributor.profiles
                    // Use CSS Avatar component instead of external image

                    return (
                      <Link
                        key={contributor.id}
                        href={`/members/${profile?.username}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-surface transition-colors"
                      >
                        <div className="relative">
                          <Avatar
                            name={profile?.full_name}
                            src={profile?.avatar_url}
                            size="md"
                          />
                          {profile?.role === 'admin' && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-blue rounded-full flex items-center justify-center">
                              <Award className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary text-sm">
                            {profile?.full_name || profile?.username}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            {contributor.role_in_project} • {contributor.contribution_percentage}%
                          </p>
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