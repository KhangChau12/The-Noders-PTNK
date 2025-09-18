export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at'>
        Update: Partial<Omit<Project, 'id' | 'created_at'>>
      }
      project_contributors: {
        Row: ProjectContributor
        Insert: Omit<ProjectContributor, 'id' | 'created_at'>
        Update: Partial<Omit<ProjectContributor, 'id' | 'created_at'>>
      }
    }
  }
}

export interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  skills: string[] | null
  role: 'admin' | 'member'
  social_links: SocialLinks | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string | null
  details: string | null
  thumbnail_url: string | null
  video_url: string | null
  repo_url: string | null
  demo_url: string | null
  tech_stack: string[] | null
  status: 'active' | 'archived'
  created_by: string | null
  created_at: string
}

export interface ProjectContributor {
  id: string
  project_id: string
  user_id: string
  contribution_percentage: number
  role_in_project: string | null
  created_at: string
  description: string
}

export interface SocialLinks {
  github?: string
  linkedin?: string
  twitter?: string
  facebook?: string
  website?: string
}

// Extended types with joined data
export interface ProjectWithContributors extends Project {
  contributors: (ProjectContributor & {
    profile: Profile
  })[]
  created_by_profile?: Profile
}

export interface ProfileWithProjects extends Profile {
  contributed_projects: (ProjectContributor & {
    project: Project
  })[]
  created_projects: Project[]
}