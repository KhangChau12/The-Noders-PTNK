import Link from 'next/link'
import { ProjectWithContributors } from '@/types/database'
import { Card } from './Card'
import { Badge } from './Badge'
import { ContributionChart } from './ContributionChart'
import { PlaceholderImage } from './PlaceholderImage'
import { formatDate, getInitials } from '@/lib/utils'
import { TECH_STACK_COLORS } from '@/lib/constants'
import { Calendar, Github, ExternalLink, Users } from 'lucide-react'

interface ProjectCardProps {
  project: ProjectWithContributors
  showStats?: boolean
}

export function ProjectCard({ project, showStats = true }: ProjectCardProps) {
  const thumbnailSrc = project.thumbnail_image?.public_url || project.thumbnail_url

  return (
    <Link href={`/projects/${project.id}`}>
      <Card variant="interactive" padding="none" className="group overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20">
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={project.thumbnail_image?.alt_text || project.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-text-tertiary bg-dark-surface/50 backdrop-blur-sm">
              <svg
                className="w-12 h-12 mb-2 opacity-60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              <span className="text-sm font-medium">No Image</span>
            </div>
          )}
          {/* Status badge */}
          {project.status === 'archived' && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary">Archived</Badge>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Title and description */}
          <h3 className="text-xl font-semibold text-text-primary mb-2 group-hover:text-primary-blue transition-colors">
            {project.title}
          </h3>
          
          {project.description && (
            <p className="text-text-secondary mb-4 line-clamp-2">
              {project.description}
            </p>
          )}

          {/* Tech stack */}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tech_stack.slice(0, 4).map((tech) => (
                <Badge
                  key={tech}
                  variant="tech"
                  style={{
                    backgroundColor: `${TECH_STACK_COLORS[tech] || '#6B7280'}20`,
                    color: TECH_STACK_COLORS[tech] || '#6B7280',
                  }}
                >
                  {tech}
                </Badge>
              ))}
              {project.tech_stack.length > 4 && (
                <Badge variant="secondary">+{project.tech_stack.length - 4}</Badge>
              )}
            </div>
          )}

          {/* Contributors */}
          {project.contributors && project.contributors.length > 0 && showStats && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  Contributors ({project.contributors.length})
                </span>
              </div>
              
              {/* Contribution visualization */}
              <div className="space-y-2">
                {project.contributors.slice(0, 3).map((contributor) => {
                  const profile = contributor.profiles || contributor.profile
                  return (
                    <div key={contributor.id} className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary-blue rounded-full flex items-center justify-center text-xs text-white font-medium">
                        {getInitials(profile?.full_name || profile?.username)}
                      </div>
                      <span className="text-sm text-text-secondary flex-1">
                        {profile?.full_name || profile?.username}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {contributor.contribution_percentage}%
                      </span>
                    </div>
                  )
                })}
                
                {project.contributors.length > 3 && (
                  <p className="text-xs text-text-tertiary">
                    +{project.contributors.length - 3} more contributors
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-text-tertiary pt-4 border-t border-dark-border">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(project.created_at)}
            </div>
            
            <div className="flex items-center space-x-2">
              {project.repo_url && (
                <Github className="w-4 h-4" />
              )}
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}