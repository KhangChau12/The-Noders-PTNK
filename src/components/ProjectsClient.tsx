'use client'

import { useState, useEffect } from 'react'
import { useProjects } from '@/lib/hooks'
import { ProjectCard } from '@/components/ProjectCard'
import { PageHero } from '@/components/PageHero'
import { Container, CtaPanel, FilterButton, NavySearch, PrimaryLink } from '@/components/editorial'
import { ProjectFilters } from '@/types/project'
import { ProjectWithContributors } from '@/types/database'
import { FILTER_OPTIONS } from '@/lib/constants'

interface ProjectsClientProps {
  initialProjects: ProjectWithContributors[]
}

const STATUS_LABELS: Record<string, string> = { all: 'All', active: 'Active', archived: 'Archived' }

/** Whole /products page body: navy intro with search, filters, grid, CTA. */
export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [filters, setFilters] = useState<ProjectFilters>({
    status: 'all',
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  })
  const [searchInput, setSearchInput] = useState('')

  // Serve the server-rendered list until the visitor actually filters.
  const [hasFiltered, setHasFiltered] = useState(false)
  const { projects: fetchedProjects, loading, error } = useProjects(hasFiltered ? filters : {})
  const projects = hasFiltered ? fetchedProjects : initialProjects

  // Status counts come from the full initial list so they stay stable while filtering.
  const statusCount = (status: string) =>
    status === 'all' ? initialProjects.length : initialProjects.filter((p) => p.status === status).length

  // Debounce search input to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== '') setHasFiltered(true)
      setFilters(prev => ({ ...prev, search: searchInput }))
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleStatusFilter = (status: string) => {
    setHasFiltered(true)
    setFilters(prev => ({ ...prev, status: status as ProjectFilters['status'] }))
  }

  const handleSortChange = (sortValue: string) => {
    // Values look like "created_at_desc" — split on the LAST underscore so
    // multi-word columns survive.
    const cut = sortValue.lastIndexOf('_')
    setHasFiltered(true)
    setFilters(prev => ({
      ...prev,
      sort_by: sortValue.slice(0, cut) as ProjectFilters['sort_by'],
      sort_order: sortValue.slice(cut + 1) as ProjectFilters['sort_order'],
    }))
  }

  return (
    <div>
      <PageHero
        eyebrow="Products"
        title="Things we've shipped."
        description="Projects built by members — most of them solving a problem we had ourselves as students."
        aside={
          <NavySearch
            id="product-search"
            label="Search products"
            placeholder="Name, idea or tech"
            value={searchInput}
            onChange={setSearchInput}
          />
        }
      />

      <section className="pt-14">
        <Container>
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.PROJECT_STATUS.map((option) => (
                <FilterButton
                  key={option.value}
                  active={filters.status === option.value}
                  onClick={() => handleStatusFilter(option.value)}
                >
                  {STATUS_LABELS[option.value] ?? option.label}
                  <span className="font-mono text-xs opacity-75">{statusCount(option.value)}</span>
                </FilterButton>
              ))}
            </div>

            <label className="flex items-center gap-2.5 text-sm text-text-secondary">
              Sort
              <select
                className="min-h-[40px] rounded-md border border-control bg-paper px-2.5 text-sm text-text-primary focus:border-text-tertiary focus:outline-none"
                value={`${filters.sort_by}_${filters.sort_order}`}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {FILTER_OPTIONS.SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading && hasFiltered ? (
            <p className="flex items-center gap-2 text-text-secondary">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-control border-t-text-primary" />
              Loading products…
            </p>
          ) : error ? (
            <div>
              <p className="mb-1 text-error">Failed to load products</p>
              <p className="text-text-secondary">{error}</p>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="py-2">
              <h3 className="mb-2 text-xl font-semibold text-text-primary">No products found</h3>
              <p className="text-text-secondary">Try a different search or status.</p>
            </div>
          )}
        </Container>
      </section>

      <section className="pt-20 pb-20 sm:pt-[104px] sm:pb-28">
        <Container>
          <CtaPanel title="Built something as a member?" body="Add it from your dashboard — screenshots, links and who did what.">
            <PrimaryLink href="/dashboard/products">Submit a project</PrimaryLink>
          </CtaPanel>
        </Container>
      </section>
    </div>
  )
}
