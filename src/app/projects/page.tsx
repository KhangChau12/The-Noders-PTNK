'use client'

import { useState } from 'react'
import { useProjects } from '@/lib/hooks'
import { ProjectCard } from '@/components/ProjectCard'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Badge } from '@/components/Badge'
import { Loading, SkeletonProject } from '@/components/Loading'
import { Card, CardContent } from '@/components/Card'
import { ProjectFilters } from '@/types/project'
import { FILTER_OPTIONS } from '@/lib/constants'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
import { Search, Filter, Grid, List } from 'lucide-react'

export default function ProjectsPage() {
  const [filters, setFilters] = useState<ProjectFilters>({
    status: 'all',
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  const { projects, loading, error } = useProjects(filters)

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as any }))
  }

  const handleSortChange = (sortValue: string) => {
    const [sort_by, sort_order] = sortValue.split('_')
    setFilters(prev => ({ 
      ...prev, 
      sort_by: sort_by as any, 
      sort_order: sort_order as any 
    }))
  }

  return (
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Our Projects
          </h1>
          <p className="text-text-secondary text-lg max-w-3xl mx-auto">
            Explore the innovative projects created by our The Noders PTNK members. 
            From machine learning models to web applications, discover our collaborative work.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full lg:w-96">
              <Input
                placeholder="Search projects..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            
            {/* Filter and View Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                icon={<Filter className="w-4 h-4" />}
              >
                Filters
              </Button>
              
              <div className="flex items-center border border-dark-border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <Card className="mt-4">
              <CardContent className="">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium text-text-primary mb-2 block">
                      Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FILTER_OPTIONS.PROJECT_STATUS.map((option) => (
                        <Badge
                          key={option.value}
                          variant={filters.status === option.value ? 'primary' : 'secondary'}
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => handleStatusFilter(option.value)}
                        >
                          {option.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Sort Filter */}
                  <div>
                    <label className="text-sm font-medium text-text-primary mb-2 block">
                      Sort By
                    </label>
                    <select
                      className="w-full bg-dark-surface border border-dark-border rounded-md px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
                      value={`${filters.sort_by}_${filters.sort_order}`}
                      onChange={(e) => handleSortChange(e.target.value)}
                    >
                      {FILTER_OPTIONS.SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Count */}
        {!loading && projects && (
          <div className="mb-6">
            <p className="text-text-secondary">
              {projects.length} project{projects.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* Projects Grid/List */}
        <div className="mb-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <SkeletonProject key={i} />
              ))}
            </div>
          ) : error ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-error mb-4">Failed to load projects</p>
                <p className="text-text-secondary">{error}</p>
              </CardContent>
            </Card>
          ) : projects && projects.length > 0 ? (
            <div className={`grid gap-8 ${viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 max-w-4xl mx-auto'
            }`}>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  showStats={true}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4 opacity-50">🔍</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  No projects found
                </h3>
                <p className="text-text-secondary">
                  Try adjusting your search criteria or filters.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA Section */}
        <Card className="text-center bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Want to Contribute?
            </h2>
            <p className="text-text-secondary mb-6">
              Join our community and collaborate on exciting AI projects.
            </p>
            <Button size="lg">
              Learn More About Joining
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  )
}