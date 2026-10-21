export interface MemberFilters {
  role?: 'admin' | 'member' | 'all'
  search?: string
  sort_by?: 'full_name' | 'created_at' | 'username'
  sort_order?: 'asc' | 'desc'
}

export interface MemberStats {
  total_members: number
  total_admins: number
  total_regular_members: number
  recent_members: number
}

export interface MemberActivity {
  project_count: number
  total_contribution: number
  recent_projects: {
    title: string
    contribution_percentage: number
    role_in_project: string
  }[]
}

export interface MemberTaskActivity {
  task_name: string
  repetitions: number
  total_points: number
}

export interface UpdateProfileData {
  full_name?: string
  username?: string
  bio?: string
  avatar_url?: string
  social_links?: {
    github?: string
    linkedin?: string
    twitter?: string
    facebook?: string
    website?: string
  }
}