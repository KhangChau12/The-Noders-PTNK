export interface CreateProjectData {
  title: string
  description: string
  thumbnail_url?: string
  video_url?: string
  repo_url?: string
  demo_url?: string
  tech_stack: string[]
  contributors: ContributorInput[]
}

export interface ContributorInput {
  user_id: string
  contribution_percentage: number
  role_in_project: string
}

export interface ProjectFilters {
  status?: 'active' | 'archived' | 'all'
  tech_stack?: string[]
  search?: string
  sort_by?: 'created_at' | 'title' | 'updated_at'
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface ProjectStats {
  total_projects: number
  active_projects: number
  archived_projects: number
  total_contributors: number
  popular_technologies: { name: string; count: number }[]
}

// Chart data types
export interface ContributionChartData {
  name: string
  value: number
  color: string
  avatar_url?: string
}

export interface TechStackData {
  name: string
  count: number
  percentage: number
}