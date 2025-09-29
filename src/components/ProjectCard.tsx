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
          <PlaceholderImage
            src={thumbnailSrc}
            alt={project.thumbnail_image?.alt_text || project.title}
            fill
            className="transition-transform duration-300 group-hover:scale-105"
            text="No Image"
            bgColor="#334155"
            textColor="#CBD5E1"
          />
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
                {project.contributors.slice(0, 3).map((contributor) => (
                  <div key={contributor.id} className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-primary-blue rounded-full flex items-center justify-center text-xs text-white font-medium">
                      {getInitials(contributor.profile.full_name)}
                    </div>
                    <span className="text-sm text-text-secondary flex-1">
                      {contributor.profile.full_name || contributor.profile.username}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {contributor.contribution_percentage}%
                    </span>
                  </div>
                ))}
                
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