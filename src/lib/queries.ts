import { createClient } from './supabase'
import { Project, Profile, ProjectContributor } from '@/types/database'
import { ProjectFilters, MemberFilters } from '@/types/project'

// Project queries using new API endpoints
export const projectQueries = {
  // Get all projects (uses new API)
  async getProjects(filters: ProjectFilters = {}) {
    try {
      const params = new URLSearchParams()

      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status)
      }
      if (filters.search) {
        params.append('search', filters.search)
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString())
      }
      if (filters.offset) {
        params.append('offset', filters.offset.toString())
      }

      const response = await fetch(`/api/projects?${params}`)
      const result = await response.json()

      if (!result.success) {
        return { projects: null, error: { message: result.error } }
      }

      return { projects: result.projects, error: null }
    } catch (error) {
      return { projects: null, error: { message: 'Network error occurred' } }
    }
  },

  // Get all projects with enhanced data (direct database query for better performance on server)
  async getProjectsWithContributors(filters: ProjectFilters = {}) {
    const supabase = createClient()

    let query = supabase
      .from('projects')
      .select(`
        *,
        created_by_profile:profiles!projects_created_by_fkey(
          username,
          full_name,
          avatar_url
        ),
        project_contributors(
          contribution_percentage,
          role_in_project,
          profiles(username, full_name, avatar_url)
        )
      `)
      .limit(20)
      .order('created_at', { ascending: false })

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error || !data) {
      return { projects: null, error }
    }

    return { projects: data, error: null }
  },

  // Get single project by ID (uses new API)
  async getProject(id: string) {
    try {
      const response = await fetch(`/api/projects/${id}`)
      const result = await response.json()

      if (!result.success) {
        return { project: null, error: { message: result.error } }
      }

      return { project: result.project, error: null }
    } catch (error) {
      return { project: null, error: { message: 'Network error occurred' } }
    }
  },

  // Create new project (uses new API)
  async createProject(projectData: any, session: any) {
    try {
      if (!session?.access_token) {
        return { project: null, error: { message: 'Authentication required' } }
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(projectData)
      })

      const result = await response.json()

      if (!result.success) {
        return { project: null, error: { message: result.error } }
      }

      return { project: result.project, error: null }
    } catch (error) {
      return { project: null, error: { message: 'Network error occurred' } }
    }
  },

  // Update project (uses new API)
  async updateProject(id: string, updates: any, session: any) {
    try {
      if (!session?.access_token) {
        return { project: null, error: { message: 'Authentication required' } }
      }

      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updates)
      })

      const result = await response.json()

      if (!result.success) {
        return { project: null, error: { message: result.error } }
      }

      return { project: result.project, error: null }
    } catch (error) {
      return { project: null, error: { message: 'Network error occurred' } }
    }
  },

  // Delete project (uses new API)
  async deleteProject(id: string, session: any) {
    try {
      if (!session?.access_token) {
        return { error: { message: 'Authentication required' } }
      }

      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (!result.success) {
        return { error: { message: result.error } }
      }

      return { error: null }
    } catch (error) {
      return { error: { message: 'Network error occurred' } }
    }
  },

  // Get user's projects (owned and contributed to)
  async getUserProjects(userId: string) {
    const supabase = createClient()

    // Get projects created by user (simplified to avoid relationship errors)
    const { data: createdProjects, error: createdError } = await supabase
      .from('projects')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })

    if (createdError) {
      return { createdProjects: [], contributedProjects: [], error: createdError }
    }

    // Get projects user contributed to (simplified)
    const { data: contributedData, error: contributedError } = await supabase
      .from('project_contributors')
      .select(`
        contribution_percentage,
        role_in_project,
        projects(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (contributedError) {
      return { createdProjects: createdProjects || [], contributedProjects: [], error: contributedError }
    }

    const contributedProjects = contributedData?.map(item => ({
      ...item.projects,
      user_contribution: {
        contribution_percentage: item.contribution_percentage,
        role_in_project: item.role_in_project
      }
    })) || []

    return {
      createdProjects: createdProjects || [],
      contributedProjects,
      error: null
    }
  },

  // Contributor management functions
  async getProjectContributors(projectId: string) {
    try {
      const response = await fetch(`/api/projects/${projectId}/contributors`)
      const result = await response.json()

      if (!result.success) {
        return { contributors: [], error: { message: result.error } }
      }

      return { contributors: result.contributors, error: null }
    } catch (error) {
      return { contributors: [], error: { message: 'Network error occurred' } }
    }
  },

  async addContributor(projectId: string, contributorData: any, session: any) {
    try {
      if (!session?.access_token) {
        return { contributor: null, error: { message: 'Authentication required' } }
      }

      const response = await fetch(`/api/projects/${projectId}/contributors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(contributorData)
      })

      const result = await response.json()

      if (!result.success) {
        return { contributor: null, error: { message: result.error } }
      }

      return { contributor: result.contributor, error: null }
    } catch (error) {
      return { contributor: null, error: { message: 'Network error occurred' } }
    }
  },

  async updateContributor(projectId: string, updates: any, session: any) {
    try {
      if (!session?.access_token) {
        return { contributor: null, error: { message: 'Authentication required' } }
      }

      const response = await fetch(`/api/projects/${projectId}/contributors`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updates)
      })

      const result = await response.json()

      if (!result.success) {
        return { contributor: null, error: { message: result.error } }
      }

      return { contributor: result.contributor, error: null }
    } catch (error) {
      return { contributor: null, error: { message: 'Network error occurred' } }
    }
  },

  async removeContributor(projectId: string, contributorId: string, session: any) {
    try {
      if (!session?.access_token) {
        return { error: { message: 'Authentication required' } }
      }

      const response = await fetch(`/api/projects/${projectId}/contributors?contributor_id=${contributorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (!result.success) {
        return { error: { message: result.error } }
      }

      return { error: null }
    } catch (error) {
      return { error: { message: 'Network error occurred' } }
    }
  },

  // Get project statistics
  async getProjectStats() {
    const supabase = createClient()
    
    const { data: projects } = await supabase
      .from('projects')
      .select('status, tech_stack')
    
    if (!projects) return null
    
    const total_projects = projects.length
    const active_projects = projects.filter(p => p.status === 'active').length
    const archived_projects = projects.filter(p => p.status === 'archived').length
    
    // Count technology usage
    const techCount: Record<string, number> = {}
    projects.forEach(project => {
      project.tech_stack?.forEach(tech => {
        techCount[tech] = (techCount[tech] || 0) + 1
      })
    })
    
    const popular_technologies = Object.entries(techCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    
    return {
      total_projects,
      active_projects,
      archived_projects,
      total_contributors: 0, // Would need to calculate from contributors table
      popular_technologies
    }
  }
}

// Member queries
export const memberQueries = {
  // Get all members (optimized - no N+1 queries)
  async getMembers(filters: MemberFilters = {}) {
    const supabase = createClient()

    // Add limit to prevent massive queries
    let query = supabase
      .from('profiles')
      .select('*')
      .limit(50) // Limit to prevent overload

    if (filters.role && filters.role !== 'all') {
      query = query.eq('role', filters.role)
    }

    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,username.ilike.%${filters.search}%`)
    }

    const sortBy = filters.sort_by || 'created_at'
    const sortOrder = filters.sort_order || 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    const { data, error } = await query

    if (error || !data) {
      return { members: null, error }
    }

    

    // For now, return without project contributions to prevent N+1
    // TODO: Optimize with proper JOIN queries later
    const membersWithProjects = data.map(member => ({
      ...member,
      contributed_projects: [],
      created_projects: []
    }))

    return { members: membersWithProjects, error: null }
  },

  // Get single member by username
  async getMember(username: string) {
    const supabase = createClient()
    const { data: member, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !member) {
      return { member: null, error }
    }

    // Get project contributions for this member
    const { data: contributions } = await supabase
      .from('project_contributors')
      .select(`
        *,
        projects(*)
      `)
      .eq('user_id', member.id)

    return {
      member: {
        ...member,
        contributed_projects: contributions || [],
        created_projects: [] // Keep simple for now
      },
      error: null
    }
  },

  // Get member statistics
  async getMemberStats() {
    const supabase = createClient()
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('role, skills, created_at')
    
    if (!profiles) return null
    
    const total_members = profiles.length
    const total_admins = profiles.filter(p => p.role === 'admin').length
    const total_regular_members = total_members - total_admins
    
    // Count skills
    const skillCount: Record<string, number> = {}
    profiles.forEach(profile => {
      profile.skills?.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1
      })
    })
    
    const most_common_skills = Object.entries(skillCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    
    // Recent members (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recent_members = profiles.filter(p => 
      new Date(p.created_at) > thirtyDaysAgo
    ).length
    
    return {
      total_members,
      total_admins,
      total_regular_members,
      most_common_skills,
      recent_members
    }
  }
}