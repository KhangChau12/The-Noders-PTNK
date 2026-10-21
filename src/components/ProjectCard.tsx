import Link from 'next/link'
import Image from 'next/image'
import { ProjectWithContributors } from '@/types/database'
import { Mono } from './editorial'

type PersonName = { full_name?: string | null; username?: string | null } | null

// The list query joins `images` and `profiles`; the generated row type doesn't
// model those joins, so widen it here.
type ProjectCardData = Omit<ProjectWithContributors, 'contributors'> & {
  thumbnail_image?: { public_url: string; alt_text?: string | null } | null
  contributors?: Array<{ profile?: PersonName; profiles?: PersonName }>
}

interface ProjectCardProps {
  project: ProjectCardData
}

function formatMonth(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

/**
 * Editorial product card: the screenshot does the work, text sits underneath
 * with no box around it. Status only shows when it isn't the default.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const thumbnailSrc = project.thumbnail_image?.public_url || project.thumbnail_url
  const contributorNames = (project.contributors || [])
    .map((c) => {
      const profile = c.profiles || c.profile
      return profile?.full_name || profile?.username
    })
    .filter(Boolean) as string[]

  return (
    <Link href={`/products/${project.id}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] bg-paper">
        {thumbnailSrc ? (
          <Image
            src={thumbnailSrc}
            alt={project.thumbnail_image?.alt_text || `${project.title} screenshot`}
            fill
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-sm text-text-tertiary">
            {project.title}
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-between gap-3">
        <Mono>{formatMonth(project.created_at)}</Mono>
        {project.status && project.status !== 'active' && <span className="text-sm capitalize text-text-tertiary">{project.status}</span>}
      </div>

      <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] text-text-primary group-hover:text-link transition-colors">
        {project.title}
      </h2>

      {project.description && (
        <p className="max-w-[520px] text-[15px] leading-relaxed text-text-secondary line-clamp-3">{project.description}</p>
      )}

      {project.tech_stack && project.tech_stack.length > 0 && (
        <span className="text-sm text-text-tertiary">{project.tech_stack.slice(0, 4).join(' · ')}</span>
      )}

      {contributorNames.length > 0 && (
        <p className="text-sm text-text-tertiary">
          by {contributorNames.slice(0, 3).join(', ')}
          {contributorNames.length > 3 && ` +${contributorNames.length - 3}`}
        </p>
      )}
    </Link>
  )
}
