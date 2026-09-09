import Link from 'next/link'
import Image from 'next/image'
import { ProjectWithContributors } from '@/types/database'
import { Badge } from './Badge'
import { getInitials } from '@/lib/utils'
import { TECH_STACK_COLORS } from '@/lib/constants'
import { Github, ExternalLink, Users, ArrowRight, Code } from 'lucide-react'

interface ProjectCardProps {
  project: ProjectWithContributors
  showStats?: boolean
  layout?: 'grid' | 'list'
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'active':
      return 'success' as const
    case 'completed':
      return 'blue' as const
    case 'archived':
      return 'gray' as const
    default:
      return 'success' as const
  }
}

// Thumbnail shared by both layouts. `className` controls aspect/sizing per layout.
function Thumbnail({
  project,
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: {
  project: ProjectWithContributors
  className: string
  sizes?: string
}) {
  const thumbnailSrc = project.thumbnail_image?.public_url || project.thumbnail_url

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-primary-blue/10 to-accent-cyan/5 ${className}`}>
      {thumbnailSrc ? (
        <Image
          src={thumbnailSrc}
          alt={project.thumbnail_image?.alt_text || project.title}
          fill
          loading="lazy"
          sizes={sizes}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Code className="w-14 h-14 text-primary-blue/40" />
        </div>
      )}

      {/* Subtle bottom gradient for badge legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/60 via-transparent to-transparent opacity-60" />

      {project.status && (
        <div className="absolute top-4 right-4 z-10">
          <Badge
            variant={getStatusVariant(project.status)}
            size="sm"
            className="backdrop-blur-md bg-dark-bg/70 font-bold text-xs border border-white/10"
          >
            {project.status}
          </Badge>
        </div>
      )}
    </div>
  )
}

// Tech stack chips — restrained: flat tinted pills, no animated glow/scale.
function TechStack({
  techStack,
  max = 4,
}: {
  techStack: string[]
  max?: number
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {techStack.slice(0, max).map((tech) => {
        const techColor = TECH_STACK_COLORS[tech] || '#6B7280'
        return (
          <span
            key={tech}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold"
            style={{
              backgroundColor: `${techColor}1A`,
              color: techColor,
              boxShadow: `inset 0 0 0 1px ${techColor}33`,
            }}
          >
            {tech}
          </span>
        )
      })}
      {techStack.length > max && (
        <Badge variant="secondary">+{techStack.length - max}</Badge>
      )}
    </div>
  )
}

// Contributor avatar stack — simple, no hover tooltips/scale.
function Contributors({ project }: { project: ProjectWithContributors }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-dark-bg/40 p-3 border border-dark-border/60">
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {project.contributors.slice(0, 4).map((contributor, index) => {
            const profile = contributor.profiles || contributor.profile
            return (
              <div
                key={contributor.id}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-blue to-accent-cyan p-0.5 ring-2 ring-dark-surface"
                style={{ zIndex: project.contributors.length - index }}
              >
                <div className="w-full h-full bg-dark-surface rounded-full flex items-center justify-center overflow-hidden text-xs text-white font-semibold">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || profile.username || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(profile?.full_name || profile?.username || null)
                  )}
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
        <span className="text-xs text-text-tertiary flex items-center gap-1 ml-1">
          <Users className="w-3.5 h-3.5" />
          {project.contributors.length}
        </span>
      </div>
    </div>
  )
}

// Footer link pills (Source / Live Demo) + arrow affordance — matches homepage.
function FooterLinks({ project }: { project: ProjectWithContributors }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {project.repo_url && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-blue/30 bg-primary-blue/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-blue">
            <Github className="w-3.5 h-3.5" />
            Source
          </span>
        )}
        {project.demo_url && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-cyan">
            <ExternalLink className="w-3.5 h-3.5" />
            Live Demo
          </span>
        )}
        {!project.repo_url && !project.demo_url && (
          <span className="inline-flex items-center rounded-full border border-dark-border bg-dark-bg/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
            Product Details
          </span>
        )}
      </div>

      <ArrowRight className="w-5 h-5 text-primary-blue opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
    </div>
  )
}

const SHELL =
  'relative overflow-hidden rounded-2xl border border-dark-border/60 bg-dark-surface/70 backdrop-blur-sm transition-all duration-300 hover:border-primary-blue/40 hover:shadow-lg hover:shadow-primary-blue/10'

export function ProjectCard({ project, showStats = true, layout = 'grid' }: ProjectCardProps) {
  const hasContributors = showStats && project.contributors && project.contributors.length > 0
  const hasTech = project.tech_stack && project.tech_stack.length > 0

  if (layout === 'list') {
    return (
      <Link href={`/products/${project.id}`} className="block group">
        <div className={`${SHELL} flex flex-col sm:flex-row sm:group-hover:-translate-y-0.5`}>
          <Thumbnail
            project={project}
            className="aspect-video sm:aspect-auto sm:w-64 lg:w-72 sm:shrink-0"
            sizes="(max-width: 640px) 100vw, 288px"
          />

          <div className="p-5 sm:p-6 flex-1 flex flex-col min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2 line-clamp-1 leading-tight group-hover:text-primary-blue transition-colors duration-300">
              {project.title}
            </h3>

            {project.description && (
              <p className="text-text-secondary mb-4 line-clamp-2 leading-relaxed text-sm">
                {project.description}
              </p>
            )}

            {hasTech && (
              <div className="mb-4">
                <TechStack techStack={project.tech_stack!} max={5} />
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-dark-border/60">
              <FooterLinks project={project} />
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/products/${project.id}`} className="block group h-full">
      <div className={`${SHELL} h-full flex flex-col sm:group-hover:-translate-y-1`}>
        <Thumbnail project={project} className="aspect-video" />

        <div className="p-5 sm:p-6 flex-1 flex flex-col">
          <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2 line-clamp-2 leading-tight group-hover:text-primary-blue transition-colors duration-300">
            {project.title}
          </h3>

          {project.description && (
            <p className="text-text-secondary mb-4 line-clamp-3 leading-relaxed text-sm">
              {project.description}
            </p>
          )}

          {hasTech && (
            <div className="mb-4">
              <TechStack techStack={project.tech_stack!} max={4} />
            </div>
          )}

          {hasContributors && (
            <div className="mb-4">
              <Contributors project={project} />
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-dark-border/60">
            <FooterLinks project={project} />
          </div>
        </div>
      </div>
    </Link>
  )
}
