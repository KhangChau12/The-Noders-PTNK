import { createClient } from './supabase'
import { Project, Profile, ProjectContributor, Post, PostBlock } from '@/types/database'
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
          id,
          contribution_percentage,
          role_in_project,
          profiles(id, username, full_name, avatar_url)
        ),
        thumbnail_image:images!projects_thumbnail_image_id_fkey(
          id,
          filename,
          public_url,
          width,
          height,
          alt_text
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

    // Map project_contributors to contributors for consistency
    const projectsWithContributors = data.map(project => ({
      ...project,
      contributors: project.project_contributors || []
    }))

    return { projects: projectsWithContributors, error: null }
  },

  // Get single project by ID - Optimized version
  async getProject(id: string, session?: any) {
    const supabase = createClient()

    try {
      // Fetch project basic info first (fast)
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (projectError || !project) {
        return { project: null, error: projectError }
      }

      // Fetch contributors with profiles in parallel (only if needed for display)
      const { data: contributors } = await supabase
        .from('project_contributors')
        .select(`
          id,
          contribution_percentage,
          role_in_project,
          profiles(
            id,
            username,
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('project_id', id)
        .order('contribution_percentage', { ascending: false })

      // Combine data
      const projectWithContributors = {
        ...project,
        contributors: contributors || [],
        project_contributors: contributors || []
      }

      return { project: projectWithContributors, error: null }
    } catch (error) {
      return { project: null, error }
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

    // Get projects created by user with contributors
    const { data: createdProjects, error: createdError } = await supabase
      .from('projects')
      .select(`
        *,
        project_contributors(
          id,
          contribution_percentage,
          role_in_project,
          profiles(id, username, full_name, avatar_url)
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false })

    if (createdError) {
      return { createdProjects: [], contributedProjects: [], error: createdError }
    }

    // Map project_contributors to contributors
    const createdProjectsWithContributors = createdProjects?.map(project => ({
      ...project,
      contributors: project.project_contributors || []
    })) || []

    // Get projects user contributed to
    const { data: contributedData, error: contributedError } = await supabase
      .from('project_contributors')
      .select(`
        contribution_percentage,
        role_in_project,
        projects(
          *,
          project_contributors(
            id,
            contribution_percentage,
            role_in_project,
            profiles(id, username, full_name, avatar_url)
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (contributedError) {
      return { createdProjects: createdProjectsWithContributors, contributedProjects: [], error: contributedError }
    }

    const contributedProjects = contributedData?.map(item => ({
      ...item.projects,
      contributors: item.projects.project_contributors || [],
      user_contribution: {
        contribution_percentage: item.contribution_percentage,
        role_in_project: item.role_in_project
      }
    })) || []

    return {
      createdProjects: createdProjectsWithContributors,
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

    // Fetch project contributions count for all members in one query
    const memberIds = data.map(m => m.id)
    const { data: contributions } = await supabase
      .from('project_contributors')
      .select('user_id')
      .in('user_id', memberIds)

    // Count contributions per member
    const contributionCounts: Record<string, number> = {}
    contributions?.forEach(contrib => {
      contributionCounts[contrib.user_id] = (contributionCounts[contrib.user_id] || 0) + 1
    })

    // Map members with their contribution count
    const membersWithProjects = data.map(member => ({
      ...member,
      contributed_projects: Array(contributionCounts[member.id] || 0).fill({}), // Fake array with correct length
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

// =====================================================
// POST QUERIES
// =====================================================

export const postQueries = {
  // Get all posts with filtering
  async getPosts(filters: {
    category?: string
    status?: string
    author?: string
    search?: string
    sort_by?: string
    limit?: number
    offset?: number
  } = {}) {
    try {
      const params = new URLSearchParams()

      if (filters.category) params.append('category', filters.category)
      if (filters.status) params.append('status', filters.status)
      if (filters.author) params.append('author', filters.author)
      if (filters.search) params.append('search', filters.search)
      if (filters.sort_by) params.append('sort_by', filters.sort_by)
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.offset) params.append('offset', filters.offset.toString())

      const response = await fetch(`/api/posts?${params}`)
      const result = await response.json()

      if (!result.success) {
        return { posts: null, error: { message: result.error } }
      }

      return { posts: result.posts, total: result.total, pagination: result.pagination, error: null }
    } catch (error) {
      return { posts: null, total: 0, error: { message: 'Network error occurred' } }
    }
  },

  // Get single post by ID
  async getPost(id: string, session?: any) {
    try {
      const headers: any = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/posts/${id}`, { headers })
      const result = await response.json()

      if (!result.success) {
        return { post: null, error: { message: result.error } }
      }

      return {
        post: result.post,
        blocks: result.blocks,
        relatedPosts: result.related_posts,
        userHasUpvoted: result.user_has_upvoted,
        error: null
      }
    } catch (error) {
      return { post: null, error: { message: 'Network error occurred' } }
    }
  },

  // Get single post by slug (optimized - single API call)
  async getPostBySlug(slug: string, session?: any) {
    try {
      const headers: any = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      // Get post by slug
      const response = await fetch(`/api/posts?slug=${slug}`, { headers })
      const data = await response.json()

      if (!data.success || data.posts.length === 0) {
        return { post: null, error: { message: 'Post not found' } }
      }

      const foundPost = data.posts[0]

      // Get full details with blocks
      const detailResponse = await fetch(`/api/posts/${foundPost.id}`, { headers })
      const detailResult = await detailResponse.json()

      if (!detailResult.success) {
        return { post: null, error: { message: detailResult.error } }
      }

      return {
        post: detailResult.post,
        blocks: detailResult.blocks,
        userHasUpvoted: detailResult.user_has_upvoted,
        error: null
      }
    } catch (error) {
      return { post: null, error: { message: 'Network error occurred' } }
    }
  },

  // Get related posts (lazy loaded separately)
  async getRelatedPosts(postId: string, category: string, session?: any) {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('posts')
        .select('id, title, summary, slug, category, reading_time, published_at, author_id')
        .eq('status', 'published')
        .eq('category', category)
        .neq('id', postId)
        .limit(2)
        .order('published_at', { ascending: false })

      if (error) {
        return []
      }

      return data || []
    } catch (error) {
      return []
    }
  },

  // Create new post
  async createPost(postData: {
    title: string
    summary: string
    thumbnail_image_id?: string
    category: string
    slug?: string
  }, session: any) {
    try {
      if (!session?.access_token) {
        return { post: null, error: { message: 'Authentication required' } }
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(postData)
      })

      const result = await response.json()

      if (!result.success) {
        return { post: null, error: { message: result.error } }
      }

      return { post: result.post, error: null }
    } catch (error) {
      return { post: null, error: { message: 'Network error occurred' } }
    }
  },

  // Update post
  async updatePost(id: string, updates: any, session: any) {
    try {
      if (!session?.access_token) {
        return { post: null, error: { message: 'Authentication required' } }
      }

      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updates)
      })

      const result = await response.json()

      console.log(result);

      if (!result.success) {
        return { post: null, error: { message: result.error } }
      }

      return { post: result.post, error: null }
    } catch (error) {
      return { post: null, error: { message: 'Network error occurred' } }
    }
  },

  // Delete post
  async deletePost(id: string, session: any) {
    try {
      if (!session?.access_token) {
        return { error: { message: 'Authentication required' } }
      }

      const response = await fetch(`/api/posts/${id}`, {
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

  // Get user's posts
  async getUserPosts(userId: string) {
    const supabase = createClient()

    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })

    if (error || !posts) {
      return { posts: [], error }
    }

    return { posts, error: null }
  },

  // Block management
  async getBlocks(postId: string) {
    try {
      const response = await fetch(`/api/posts/${postId}/blocks`)
      const result = await response.json()

      if (!result.success) {
        return { blocks: [], error: { message: result.error } }
      }

      return { blocks: result.blocks, error: null }
    } catch (error) {
      return { blocks: [], error: { message: 'Network error occurred' } }
    }
  },

  async addBlock(postId: string, blockData: {
    type: string
    content: any
    order_index: number
  }, session: any) {
    try {
      if (!session?.access_token) {
        return { block: null, error: { message: 'Authentication required' } }
      }

      const response = await fetch(`/api/posts/${postId}/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(blockData)
      })

      const result = await response.json()

      if (!result.success) {
        return { block: null, error: { message: result.error } }
      }

      return { block: result.block, error: null }
    } catch (error) {
      return { block: null, error: { message: 'Network error occurred' } }
    }
  },

  async updateBlock(postId: string, blockId: string, updates: any, session: any) {
    try {
      if (!session?.access_token) {
        return { block: null, error: { message: 'Authentication required' } }
      }

      const response = await fetch(`/api/posts/${postId}/blocks/${blockId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updates)
      })

      const result = await response.json()

      if (!result.success) {
        return { block: null, error: { message: result.error } }
      }

      return { block: result.block, error: null }
    } catch (error) {
      return { block: null, error: { message: 'Network error occurred' } }
    }
  },

  async deleteBlock(postId: string, blockId: string, session: any) {
    try {
      if (!session?.access_token) {
        return { error: { message: 'Authentication required' } }
      }

      const response = await fetch(`/api/posts/${postId}/blocks/${blockId}`, {
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

  // Upvote management
  async toggleUpvote(postId: string, session: any) {
    try {
      if (!session?.access_token) {
        return { error: { message: 'Authentication required' } }
      }

      const response = await fetch(`/api/posts/${postId}/upvote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (!result.success) {
        return { error: { message: result.error } }
      }

      return {
        upvoted: result.upvoted,
        upvoteCount: result.upvote_count,
        error: null
      }
    } catch (error) {
      return { error: { message: 'Network error occurred' } }
    }
  },

  async getUpvoteStatus(postId: string, session?: any) {
    try {
      const headers: any = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/posts/${postId}/upvote`, { headers })
      const result = await response.json()

      if (!result.success) {
        return { error: { message: result.error } }
      }

      return {
        upvoteCount: result.upvote_count,
        userHasUpvoted: result.user_has_upvoted,
        error: null
      }
    } catch (error) {
      return { error: { message: 'Network error occurred' } }
    }
  }
}