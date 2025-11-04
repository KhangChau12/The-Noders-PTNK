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

  const getStatusConfig = (status: string) => {
    switch (status) {
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

  const statusConfig = getStatusConfig(project.status || 'active')

  return (
    <Link href={`/projects/${project.id}`}>
      <Card
        variant="interactive"
        padding="none"
        className="group overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-blue/20 border-2 border-transparent hover:border-primary-blue/30 relative"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-blue/0 to-accent-cyan/0 group-hover:from-primary-blue/10 group-hover:to-accent-cyan/10 transition-all duration-500 pointer-events-none" />

        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 overflow-hidden">
          {thumbnailSrc ? (
            <>
              <img
                src={thumbnailSrc}
                alt={project.thumbnail_image?.alt_text || project.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/60 via-dark-bg/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-text-tertiary bg-dark-surface/50 backdrop-blur-sm">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/30 to-accent-cyan/30 blur-xl group-hover:blur-2xl transition-all duration-500" />
                <svg
                  className="w-16 h-16 mb-2 opacity-60 relative z-10 group-hover:scale-110 transition-transform duration-500"
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
              </div>
              <span className="text-sm font-medium bg-gradient-to-r from-primary-blue to-accent-cyan bg-clip-text text-transparent">No Image</span>
            </div>
          )}
          {/* Enhanced Status badge */}
          {project.status && (
            <div className="absolute top-3 right-3">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${statusConfig.className} shadow-lg transition-all duration-300 group-hover:scale-110`}>
                {statusConfig.label}
              </div>
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
              {project.tech_stack.slice(0, 4).map((tech) => {
                const techColor = TECH_STACK_COLORS[tech] || '#6B7280'
                return (
                  <div
                    key={tech}
                    className="relative px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-default"
                    style={{
                      backgroundColor: `${techColor}20`,
                      color: techColor,
                      boxShadow: `0 0 0 1px ${techColor}30`,
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
                      style={{
                        boxShadow: `0 0 20px ${techColor}40`,
                      }}
                    />
                    <span className="relative z-10">{tech}</span>
                  </div>
                )
              })}
              {project.tech_stack.length > 4 && (
                <Badge variant="secondary" className="hover:scale-110 transition-transform duration-300">
                  +{project.tech_stack.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Contributors */}
          {project.contributors && project.contributors.length > 0 && showStats && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-text-secondary flex items-center font-medium">
                  <Users className="w-4 h-4 mr-1" />
                  Contributors ({project.contributors.length})
                </span>
              </div>

              {/* Stacked avatars preview */}
              <div className="flex items-center justify-between bg-dark-surface/30 rounded-xl p-3 border border-dark-border/50 group-hover:border-primary-blue/30 transition-all duration-300">
                <div className="flex -space-x-2">
                  {project.contributors.slice(0, 4).map((contributor, index) => {
                    const profile = contributor.profiles || contributor.profile
                    return (
                      <div
                        key={contributor.id}
                        className="relative group/avatar"
                        style={{ zIndex: project.contributors.length - index }}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-blue to-accent-cyan p-0.5 ring-2 ring-dark-surface transition-all duration-300 group-hover/avatar:scale-110 group-hover/avatar:ring-primary-blue/50">
                          <div className="w-full h-full bg-dark-surface rounded-full flex items-center justify-center text-xs text-white font-semibold">
                            {getInitials(profile?.full_name || profile?.username)}
                          </div>
                        </div>
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-bg border border-dark-border rounded-lg text-xs text-text-primary whitespace-nowrap opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl z-50">
                          {profile?.full_name || profile?.username}
                          <div className="text-text-tertiary">{contributor.contribution_percentage}%</div>
                        </div>
                      </div>
                    )
                  })}
                  {project.contributors.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center text-xs text-text-secondary font-semibold ring-2 ring-dark-surface">
                      +{project.contributors.length - 4}
                    </div>
                  )}
                </div>

                {/* Top contributor badge */}
                {project.contributors[0] && (
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-text-tertiary">Top:</div>
                    <div className="text-xs font-semibold text-primary-blue">
                      {project.contributors[0].contribution_percentage}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-text-tertiary pt-4 border-t border-dark-border group-hover:border-primary-blue/30 transition-colors duration-300">
            <div className="flex items-center group-hover:text-text-secondary transition-colors duration-300">
              <Calendar className="w-4 h-4 mr-1.5" />
              {formatDate(project.created_at)}
            </div>

            <div className="flex items-center gap-3">
              {project.repo_url && (
                <div className="relative group/icon">
                  <Github className="w-4 h-4 transition-all duration-300 group-hover/icon:text-primary-blue group-hover/icon:scale-110" />
                  <div className="absolute inset-0 bg-primary-blue/30 rounded-full blur-md opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300" />
                </div>
              )}
              <div className="relative group/icon">
                <ExternalLink className="w-4 h-4 transition-all duration-300 group-hover/icon:text-accent-cyan group-hover/icon:scale-110" />
                <div className="absolute inset-0 bg-accent-cyan/30 rounded-full blur-md opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}